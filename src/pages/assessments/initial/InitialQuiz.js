import React, { useCallback, useState } from "react";
import { submitInitialQuizAnswer } from "../../../services/api";

const AnswerOption = ({
  letter,
  text,
  selected,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`group relative w-full overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
      selected
        ? "border-emerald-400/70 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-transparent shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/30"
        : "border-slate-200/80 bg-white/90 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50"
    } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
  >
    {/* Selected glow */}
    {selected && (
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 via-cyan-400 to-blue-500" />
    )}

    <div className="relative flex items-center gap-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-300 ${
          selected
            ? "border-emerald-400 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20"
            : "border-slate-200 bg-slate-50 text-slate-600 group-hover:border-cyan-200 group-hover:bg-cyan-50 group-hover:text-cyan-700"
        }`}
      >
        {letter}
      </span>

      <span
        className={`text-sm font-medium leading-6 transition-colors ${
          selected
            ? "text-slate-900"
            : "text-slate-700 group-hover:text-slate-900"
        }`}
      >
        {text}
      </span>

      {selected && (
        <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-sm">
          ✓
        </span>
      )}
    </div>
  </button>
);

const InitialQuiz = ({
  sessionId,
  initialDomain,
  initialSkill,
  initialQuestion,
  initialAssessment,
  initialQuestionsAnswered = 0,
  initialSkillQuestionsAnswered = 0,

  remainingSeconds,
  assessmentActive,
  proctoringWarning,
  tabSwitchAlert,

  onQuizComplete,
  onError,
}) => {
  const domain = initialDomain;

  const [skill, setSkill] = useState(initialSkill);
  const [question, setQuestion] = useState(initialQuestion);
  const [assessment, setAssessment] = useState(initialAssessment);

  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [questionsAnswered, setQuestionsAnswered] = useState(
    initialQuestionsAnswered
  );

  const [skillQuestionsAnswered, setSkillQuestionsAnswered] = useState(
    initialSkillQuestionsAnswered
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setLocalError] = useState("");

  const handleNext = useCallback(async () => {
    if (!selectedAnswer || !question || !sessionId) {
      return;
    }

    try {
      setSubmitting(true);
      setLocalError("");
      onError?.("");

      const response = await submitInitialQuizAnswer({
        sessionId,
        questionId: question.question_id,
        answer: selectedAnswer,
      });

      console.log("Initial Quiz Answer Response:", response);

      const result = response.data;

      if (result.assessment) {
        setAssessment(result.assessment);
      }

      /*
       * Quiz is completely finished.
       * Parent decides what comes next.
       */
      if (result.assessment_completed) {
        onQuizComplete?.(result);
        return;
      }

      /*
       * Adaptive assessment moved to another skill.
       */
      if (result.skill_completed && result.next_skill) {
        setSkill(result.next_skill);
        setSkillQuestionsAnswered(0);

        setQuestionsAnswered(
          Math.max(
            (result.assessment?.overall_question ?? 1) - 1,
            0
          )
        );

        setQuestion(result.question);
        setSelectedAnswer("");
        return;
      }

      /*
       * Normal next question.
       */
      if (result.progress) {
        const currentProgress =
          result.progress.current ??
          result.progress.questions_answered ??
          0;

        setSkillQuestionsAnswered(currentProgress);
      }

      if (result.assessment) {
        setQuestionsAnswered(
          Math.max(
            (result.assessment.overall_question ?? 1) - 1,
            0
          )
        );
      }

      setQuestion(result.question);
      setSelectedAnswer("");
    } catch (err) {
      console.error("Failed to submit answer:", err);

      if (err.response?.status === 409) {
        onError?.(
          err.response?.data?.error ||
            "Your assessment session has ended."
        );
        return;
      }

      const message =
        err.response?.data?.error ||
        "Failed to submit the answer.";

      setLocalError(message);
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedAnswer,
    question,
    sessionId,
    onQuizComplete,
    onError,
  ]);

  const currentSkillQuestion = skillQuestionsAnswered + 1;

  const questionsPerSkill = 10;

  const skillProgress = Math.min(
    100,
    Math.round(
      (skillQuestionsAnswered / questionsPerSkill) * 100
    )
  );

  const overallQuestion = questionsAnswered + 1;

  const totalQuestions =
    assessment?.total_questions || 50;

  const overallProgress = Math.min(
    100,
    Math.round(
      (questionsAnswered / totalQuestions) * 100
    )
  );

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  if (!question) {
    return (
      <div className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6">
        {/* Background glow */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] px-10 py-9 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/20 to-purple-500/20">
            <span className="text-xl text-cyan-300">?</span>
          </div>

          <p className="text-base font-semibold text-white">
            No question available
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Please wait while the assessment loads.
          </p>
        </div>
      </div>
    );
  }

  const timeDanger =
    Number(remainingSeconds) <= 300;

  return (
    <>
      {/* =========================================================
          MAIN ASSESSMENT BACKGROUND
      ========================================================== */}
      <div className="relative h-full overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50 to-cyan-50 p-4 sm:p-5 lg:p-6">

        {/* Decorative background gradients */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="pointer-events-none absolute right-[-180px] top-[-100px] h-[460px] w-[460px] rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[-220px] left-[35%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl" />

        {/* =======================================================
            MAIN GRID
        ======================================================== */}
        <div className="relative h-full min-h-0 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">

          {/* =====================================================
              QUESTION CARD
          ====================================================== */}
          <div className="min-h-0 overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">

            <div className="flex h-full min-h-0 flex-col">

              {/* =================================================
                  HEADER
              ================================================== */}
              <div className="relative shrink-0 overflow-hidden border-b border-slate-200/80 px-5 py-4 sm:px-6">

                {/* Header gradient glow */}
                <div className="pointer-events-none absolute right-0 top-0 h-32 w-64 bg-gradient-to-bl from-cyan-100/70 via-indigo-50/40 to-transparent blur-2xl" />

                <div className="relative flex flex-wrap items-center justify-between gap-4">

                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span
                          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                            assessmentActive
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          } opacity-60`}
                        />

                        <span
                          className={`relative inline-flex h-3 w-3 rounded-full ${
                            assessmentActive
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {assessmentActive
                          ? "Proctoring active"
                          : "Assessment paused"}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500">
                      Assessment ·{" "}
                      {domain?.domain_name ||
                        "Skill Assessment"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">

                    {/* Domain */}
                    <span className="hidden rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-indigo-700 sm:inline-flex">
                      {domain?.domain_name ||
                        "Assessment"}
                    </span>

                    {/* Timer */}
                    <div
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm ${
                        timeDanger
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-orange-200 bg-orange-50 text-orange-600"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          timeDanger
                            ? "animate-pulse bg-red-500"
                            : "bg-orange-500"
                        }`}
                      />

                      <span className="font-mono text-sm font-bold tabular-nums">
                        {formatTime(
                          remainingSeconds
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  ERROR / WARNING
              ================================================== */}
              {(error || proctoringWarning) && (
                <div
                  className={`shrink-0 border-b px-5 py-3 sm:px-6 ${
                    proctoringWarning
                      ? "border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-transparent"
                      : "border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          proctoringWarning
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        !
                      </span>

                      <span
                        className={`text-xs font-semibold ${
                          proctoringWarning
                            ? "text-amber-800"
                            : "text-red-700"
                        }`}
                      >
                        {error ||
                          proctoringWarning?.message}
                      </span>
                    </div>

                    {proctoringWarning && (
                      <span className="shrink-0 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-[11px] font-bold text-amber-700">
                        Violations:{" "}
                        {proctoringWarning.violationCount}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* =================================================
                  PROGRESS
              ================================================== */}
              <div className="shrink-0 border-b border-slate-200/80 bg-gradient-to-r from-white via-slate-50/80 to-white px-5 py-4 sm:px-6">

                <div className="flex items-center justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <span className="flex max-w-[60%] items-center gap-2 truncate rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                      <span className="truncate">
                        {skill?.skill_name ||
                          "Current Skill"}
                      </span>
                    </span>

                    <span className="hidden text-[11px] font-medium text-slate-400 sm:inline">
                      Adaptive assessment
                    </span>
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-slate-500">
                    QUESTION{" "}
                    <span className="text-slate-900">
                      {currentSkillQuestion}
                    </span>{" "}
                    / {questionsPerSkill}

                    <span className="mx-2 text-slate-300">
                      ·
                    </span>

                    <span className="text-emerald-600">
                      {skillProgress}%
                    </span>
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 shadow-sm shadow-cyan-500/20 transition-all duration-700"
                    style={{
                      width: `${skillProgress}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
                  </div>
                </div>
              </div>

              {/* =================================================
                  QUESTION AREA
              ================================================== */}
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-9">

                <div className="flex gap-4 sm:gap-6">

                  {/* Question number */}
                  <div className="hidden shrink-0 sm:block">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 font-mono text-sm font-bold text-indigo-600 shadow-sm">
                      {String(
                        overallQuestion
                      ).padStart(2, "0")}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">

                    {/* Mobile question number */}
                    <div className="mb-4 flex items-center gap-2 sm:hidden">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 font-mono text-xs font-bold text-white">
                        {String(
                          overallQuestion
                        ).padStart(2, "0")}
                      </span>

                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Question
                      </span>
                    </div>

                    {/* Question */}
                    <h2 className="text-xl font-bold leading-relaxed tracking-tight text-slate-900 lg:text-2xl">
                      {question.question_text}
                    </h2>

                    <p className="mt-2 text-xs text-slate-400">
                      Select one answer from the options below.
                    </p>

                    {/* Options */}
                    <div className="mt-7 grid gap-3">

                      <AnswerOption
                        letter="A"
                        text={question.option_a}
                        selected={
                          selectedAnswer === "A"
                        }
                        disabled={
                          submitting ||
                          tabSwitchAlert ||
                          !assessmentActive
                        }
                        onClick={() =>
                          setSelectedAnswer("A")
                        }
                      />

                      <AnswerOption
                        letter="B"
                        text={question.option_b}
                        selected={
                          selectedAnswer === "B"
                        }
                        disabled={
                          submitting ||
                          tabSwitchAlert ||
                          !assessmentActive
                        }
                        onClick={() =>
                          setSelectedAnswer("B")
                        }
                      />

                      <AnswerOption
                        letter="C"
                        text={question.option_c}
                        selected={
                          selectedAnswer === "C"
                        }
                        disabled={
                          submitting ||
                          tabSwitchAlert ||
                          !assessmentActive
                        }
                        onClick={() =>
                          setSelectedAnswer("C")
                        }
                      />

                      <AnswerOption
                        letter="D"
                        text={question.option_d}
                        selected={
                          selectedAnswer === "D"
                        }
                        disabled={
                          submitting ||
                          tabSwitchAlert ||
                          !assessmentActive
                        }
                        onClick={() =>
                          setSelectedAnswer("D")
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  BOTTOM ACTION BAR
              ================================================== */}
              <div className="shrink-0 border-t border-slate-200/80 bg-gradient-to-r from-white via-slate-50/70 to-white px-5 py-4 sm:px-6">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        selectedAnswer
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {selectedAnswer
                        ? "✓"
                        : "○"}
                    </span>

                    <p className="text-xs font-medium text-slate-500">
                      {selectedAnswer
                        ? "Answer selected. Continue when ready."
                        : "Select an answer to continue."}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      !selectedAnswer ||
                      submitting ||
                      tabSwitchAlert ||
                      !assessmentActive
                    }
                    onClick={handleNext}
                    className={`group relative overflow-hidden rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 ${
                      selectedAnswer &&
                      assessmentActive
                        ? "bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/25"
                        : "cursor-not-allowed bg-slate-200 text-slate-400"
                    }`}
                  >
                    {selectedAnswer &&
                      assessmentActive && (
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}

                    <span className="relative">
                      {submitting
                        ? "Saving..."
                        : "Next question →"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDEBAR
          ====================================================== */}
          <div className="min-h-0 flex flex-col gap-5 overflow-hidden">

            {/* ===================================================
                OVERALL PROGRESS
            ==================================================== */}
            <div className="relative overflow-hidden rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-6">

              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-400/15 blur-3xl" />

              <div className="relative flex items-center justify-between">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Overall progress
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Your assessment journey
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-mono font-semibold text-slate-500">
                  {assessment?.total_questions ||
                    0}{" "}
                  total
                </span>
              </div>

              <div className="relative mt-6 flex items-center gap-5">

                {/* Circular progress */}
                <div
                  className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#10b981 ${overallProgress}%, #e2e8f0 ${overallProgress}% 100%)`,
                  }}
                >
                  <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-white shadow-inner">
                    <span className="text-lg font-black text-slate-900">
                      {overallProgress}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-3xl font-black tracking-tight text-slate-900">
                    {overallProgress}%
                  </p>

                  <p className="mt-1 text-xs font-mono font-medium text-slate-500">
                    Q{overallQuestion} /{" "}
                    {assessment?.total_questions}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                    <span className="text-[11px] font-medium text-slate-500">
                      Assessment progress
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Current skill
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">

                  <p className="min-w-0 truncate text-sm font-bold text-slate-900">
                    {skill?.skill_name || "—"}
                  </p>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    Q{currentSkillQuestion} /{" "}
                    {questionsPerSkill}
                  </span>
                </div>
              </div>
            </div>

            {/* ===================================================
                ROADMAP
            ==================================================== */}
            <div className="min-h-0 flex-1 overflow-hidden rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-6">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Assessment roadmap
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Adaptive skill progression
                  </p>
                </div>

                <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[11px] font-mono font-semibold text-indigo-600">
                  {assessment?.skills?.length ||
                    0}{" "}
                  skills
                </span>
              </div>

              <div className="mt-6 h-[calc(100%-60px)] overflow-y-auto pr-1">

                <div className="space-y-0">

                  {assessment?.skills?.map(
                    (item, index) => {
                      const isCurrent =
                        item.status === "current" ||
                        item.skill_id ===
                          skill?.skill_id;

                      const isCompleted =
                        item.status ===
                        "completed";

                      return (
                        <div
                          key={
                            item.skill_id ||
                            index
                          }
                          className="relative flex gap-3 pb-5 last:pb-0"
                        >

                          {/* Connector */}
                          {index <
                            assessment.skills
                              .length -
                              1 && (
                            <div
                              className={`absolute left-[14px] top-8 h-[calc(100%-8px)] w-px ${
                                isCompleted
                                  ? "bg-gradient-to-b from-emerald-400 to-emerald-200"
                                  : "bg-slate-200"
                              }`}
                            />
                          )}

                          {/* Step */}
                          <div
                            className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
                              isCurrent
                                ? "border-emerald-400 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20"
                                : isCompleted
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-400"
                            }`}
                          >
                            {isCompleted
                              ? "✓"
                              : index + 1}
                          </div>

                          <div className="min-w-0 flex-1 pt-0.5">

                            <div className="flex items-center justify-between gap-2">

                              <p
                                className={`truncate text-sm font-bold ${
                                  isCurrent
                                    ? "text-slate-900"
                                    : "text-slate-700"
                                }`}
                              >
                                {item.skill_name}
                              </p>

                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                  isCurrent
                                    ? "bg-emerald-50 text-emerald-700"
                                    : isCompleted
                                    ? "bg-slate-100 text-slate-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {isCurrent
                                  ? "Current"
                                  : isCompleted
                                  ? "Completed"
                                  : "Upcoming"}
                              </span>
                            </div>

                            {isCurrent && (
                              <div className="mt-2.5">
                                <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400">
                                  <span>
                                    Skill progress
                                  </span>

                                  <span className="text-emerald-600">
                                    {skillProgress}%
                                  </span>
                                </div>

                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                                    style={{
                                      width: `${skillProgress}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          TAB SWITCH OVERLAY
          Existing functionality preserved.
      ========================================================== */}
      {tabSwitchAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-md">

          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-red-200/30 bg-white p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8">

            {/* Red glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-red-400/20 blur-3xl" />

            <div className="relative">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-2xl font-black text-white shadow-lg shadow-red-500/25">
                !
              </div>

              <h2 className="text-xl font-black tracking-tight text-slate-900">
                Return to the Assessment
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                You switched away from the coding assessment tab or
                window. This has been recorded as a proctoring
                violation. Complete the test first — you must stay on
                this tab until you finish.
              </p>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-xs font-semibold text-red-700">
                  Tab switches detected:{" "}
                  {proctoringWarning?.violationCount || 1}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  /*
                   * The parent owns the tabSwitchAlert state.
                   * Existing behavior remains unchanged.
                   */
                }}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Return to Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InitialQuiz;