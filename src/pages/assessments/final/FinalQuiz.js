import React, { useCallback, useEffect, useState } from "react";

import { submitFinalQuizAnswer } from "../../../services/api";

// ---------------------------------------------------------
// ANSWER OPTION
// ---------------------------------------------------------

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
    className={`group relative w-full overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
      selected
        ? "border-violet-400/60 bg-gradient-to-r from-violet-500/15 to-blue-500/10 shadow-lg shadow-violet-500/10 ring-1 ring-violet-400/30"
        : "border-white/10 bg-white/[0.035] hover:border-violet-400/30 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-black/10"
    } ${
      disabled
        ? "cursor-not-allowed opacity-60"
        : "cursor-pointer"
    }`}
  >
    <div className="flex items-center gap-4">
      {/* OPTION LETTER */}
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
          selected
            ? "border-violet-400/50 bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-lg shadow-violet-500/20"
            : "border-white/10 bg-white/[0.04] text-slate-400 group-hover:border-violet-400/30 group-hover:text-violet-300"
        }`}
      >
        {letter}
      </span>

      {/* OPTION TEXT */}
      <span
        className={`min-w-0 flex-1 text-sm font-medium leading-6 transition-colors ${
          selected
            ? "text-white"
            : "text-slate-300 group-hover:text-white"
        }`}
      >
        {text}
      </span>

      {/* SELECTED INDICATOR */}
      {selected && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-bold text-emerald-300">
          ✓
        </span>
      )}
    </div>
  </button>
);

// ---------------------------------------------------------
// FINAL QUIZ
// ---------------------------------------------------------

const FinalQuiz = ({
  sessionId,

  initialDomain,
  initialSkill,
  initialQuestion,
  initialAssessment,

  initialQuestionsAnswered = 0,
  initialSkillQuestionsAnswered = 0,

  remainingSeconds,
  tabSwitchCount = 0,
  assessmentActive = true,

  onPause,
  onCompleted,
}) => {
  // -------------------------------------------------------
  // FINAL QUIZ STATE
  // -------------------------------------------------------

  const [skill, setSkill] = useState(initialSkill);
  const [question, setQuestion] = useState(initialQuestion);
  const [assessment, setAssessment] =
    useState(initialAssessment);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [questionsAnswered, setQuestionsAnswered] =
    useState(
      Math.max(
        Number(initialQuestionsAnswered) || 0,
        0
      )
    );

  const [skillQuestionsAnswered, setSkillQuestionsAnswered] =
    useState(
      Math.max(
        Number(initialSkillQuestionsAnswered) || 0,
        0
      )
    );

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  // -------------------------------------------------------
  // KEEP INITIAL DATA IN SYNC
  // -------------------------------------------------------

  useEffect(() => {
    if (initialSkill) {
      setSkill(initialSkill);
    }
  }, [initialSkill]);

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
      setSelectedAnswer("");
    }
  }, [initialQuestion]);

  useEffect(() => {
    if (initialAssessment) {
      setAssessment(initialAssessment);

      setQuestionsAnswered(
        Math.max(
          Number(
            initialAssessment.overall_question ?? 1
          ) - 1,
          0
        )
      );
    }
  }, [initialAssessment]);

  useEffect(() => {
    setSkillQuestionsAnswered(
      Math.max(
        Number(initialSkillQuestionsAnswered) || 0,
        0
      )
    );
  }, [initialSkillQuestionsAnswered]);

  // -------------------------------------------------------
  // FINAL ANSWER SUBMISSION
  // -------------------------------------------------------

  const handleNext = useCallback(async () => {
    if (
      !selectedAnswer ||
      !question ||
      !sessionId ||
      submitting ||
      !assessmentActive
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response =
        await submitFinalQuizAnswer({
          sessionId,
          questionId: question.question_id,
          answer: selectedAnswer,
        });

      console.log(
        "Final Quiz Answer Response:",
        response
      );

      const result =
        response?.data || response;

      // ---------------------------------------------------
      // FINAL ASSESSMENT COMPLETED
      // ---------------------------------------------------

      if (result?.assessment_completed) {
        if (result?.assessment) {
          setAssessment(result.assessment);
        }

        onCompleted?.(result);
        return;
      }

      // ---------------------------------------------------
      // SKILL COMPLETED → MOVE TO NEXT SKILL
      // ---------------------------------------------------

      if (
        result?.skill_completed &&
        result?.next_skill
      ) {
        setSkill(result.next_skill);

        setSkillQuestionsAnswered(0);

        setQuestionsAnswered(
          Math.max(
            Number(
              result?.assessment?.overall_question ?? 1
            ) - 1,
            0
          )
        );

        if (result?.assessment) {
          setAssessment(result.assessment);
        }

        setQuestion(result.question);

        setSelectedAnswer("");

        return;
      }

      // ---------------------------------------------------
      // NORMAL NEXT QUESTION
      // ---------------------------------------------------

      if (result?.progress) {
        const currentProgress =
          result.progress.current ??
          result.progress.questions_answered ??
          0;

        setSkillQuestionsAnswered(
          Number(currentProgress)
        );
      } else {
        setSkillQuestionsAnswered(
          (previous) => previous + 1
        );
      }

      if (result?.assessment) {
        setAssessment(result.assessment);

        setQuestionsAnswered(
          Math.max(
            Number(
              result.assessment.overall_question ?? 1
            ) - 1,
            0
          )
        );
      } else {
        setQuestionsAnswered(
          (previous) => previous + 1
        );
      }

      if (!result?.question) {
        throw new Error(
          "No next question was returned by the final assessment."
        );
      }

      setQuestion(result.question);
      setSelectedAnswer("");
    } catch (err) {
      console.error(
        "Failed to submit final assessment answer:",
        err
      );

      if (err.response?.status === 409) {
        setError(
          err.response?.data?.error ||
            "Your assessment session has ended."
        );

        return;
      }

      const message =
        err.response?.data?.error ||
        err.message ||
        "Failed to submit the answer.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedAnswer,
    question,
    sessionId,
    submitting,
    assessmentActive,
    onCompleted,
  ]);

  // -------------------------------------------------------
  // PROGRESS
  // -------------------------------------------------------

  const questionsPerSkill =
    Number(
      assessment?.questions_per_skill
    ) || 10;

  const currentSkillQuestion =
    Math.min(
      skillQuestionsAnswered + 1,
      questionsPerSkill
    );

  const skillProgress = Math.min(
    100,
    Math.round(
      (skillQuestionsAnswered /
        questionsPerSkill) *
        100
    )
  );

  const overallQuestion =
    questionsAnswered + 1;

  const totalQuestions =
    Number(
      assessment?.total_questions
    ) || 50;

  const overallProgress = Math.min(
    100,
    Math.round(
      (questionsAnswered /
        totalQuestions) *
        100
    )
  );

  // -------------------------------------------------------
  // TIMER FORMAT
  // -------------------------------------------------------

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const minutes =
      Math.floor(safeSeconds / 60);

    const secs =
      safeSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const timerSeconds =
    Math.max(
      0,
      Number(remainingSeconds) || 0
    );

  const timerIsLow =
    timerSeconds <= 300;

  // -------------------------------------------------------
  // NO QUESTION
  // -------------------------------------------------------

  if (!question) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="relative z-10 w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-300">
            ?
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            No Question Available
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            There is currently no question available
            for this assessment session.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[140px]" />

        <div className="absolute right-[-200px] top-[5%] h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[150px]" />

        <div className="absolute bottom-[-250px] left-[35%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative z-10 min-h-screen p-4 sm:p-5 lg:p-6">
        <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1800px] grid-cols-1 gap-5 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
          {/* =================================================
              QUESTION CARD
          ================================================= */}

          <div className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20 backdrop-blur-2xl">
            {/* -------------------------------------------------
                HEADER
            ------------------------------------------------- */}

            <div className="shrink-0 border-b border-white/10 bg-white/[0.025] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* LEFT */}
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </span>

                    <span className="text-sm font-semibold text-white">
                      Proctoring active
                    </span>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                      Secure
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500">
                    Assessment ·{" "}
                    {initialDomain?.domain_name ||
                      "Skill Assessment"}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2.5">
                  <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:inline-flex">
                    {initialDomain?.domain_name ||
                      "Assessment"}
                  </span>

                  <div
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${
                      timerIsLow
                        ? "border-red-400/30 bg-red-500/10 text-red-300"
                        : "border-violet-400/20 bg-violet-500/10 text-violet-300"
                    }`}
                  >
                    <span className="text-xs">
                      ⏱
                    </span>

                    <span className="font-mono text-sm font-bold tracking-wide">
                      {formatTime(
                        remainingSeconds
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------
                ERROR / WARNING
            ------------------------------------------------- */}

            {(error || tabSwitchCount > 0) && (
              <div className="shrink-0 border-b border-amber-400/20 bg-amber-500/[0.07] px-5 py-3 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs text-amber-300">
                      !
                    </span>

                    <span className="text-xs leading-5 text-amber-200/80">
                      {error ||
                        "Please remain in the assessment window."}
                    </span>
                  </div>

                  {tabSwitchCount > 0 && (
                    <span className="shrink-0 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
                      Violations:{" "}
                      {tabSwitchCount}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------
                SKILL PROGRESS
            ------------------------------------------------- */}

            <div className="shrink-0 border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex max-w-full items-center rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                    <span className="truncate">
                      {skill?.skill_name ||
                        "Current Skill"}
                    </span>
                  </span>
                </div>

                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Question{" "}
                  <span className="text-slate-300">
                    {currentSkillQuestion}
                  </span>{" "}
                  / {questionsPerSkill}
                  <span className="mx-2 text-slate-700">
                    ·
                  </span>
                  <span className="text-violet-300">
                    {skillProgress}%
                  </span>
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 shadow-lg shadow-violet-500/20 transition-all duration-500"
                  style={{
                    width: `${skillProgress}%`,
                  }}
                />
              </div>
            </div>

            {/* -------------------------------------------------
                QUESTION CONTENT
            ------------------------------------------------- */}

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-9">
              <div className="flex gap-4 sm:gap-6">
                {/* QUESTION NUMBER */}

                <div className="hidden shrink-0 pt-1 sm:block">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] font-mono text-sm font-bold text-slate-500">
                    {String(
                      overallQuestion
                    ).padStart(2, "0")}
                  </div>
                </div>

                {/* QUESTION */}
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-2 sm:hidden">
                    <span className="rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1 font-mono text-[10px] font-bold text-slate-500">
                      Q
                      {String(
                        overallQuestion
                      ).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400/80">
                    Question{" "}
                    {overallQuestion}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold leading-8 tracking-tight text-white sm:text-2xl lg:text-[27px] lg:leading-9">
                    {question.question_text}
                  </h2>

                  <div className="mt-7 grid gap-3">
                    <AnswerOption
                      letter="A"
                      text={question.option_a}
                      selected={
                        selectedAnswer === "A"
                      }
                      disabled={
                        submitting ||
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

            {/* -------------------------------------------------
                BOTTOM ACTION
            ------------------------------------------------- */}

            <div className="shrink-0 border-t border-white/10 bg-black/10 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      selectedAnswer
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-white/[0.04] text-slate-500"
                    }`}
                  >
                    {selectedAnswer
                      ? "✓"
                      : "○"}
                  </span>

                  <p className="text-xs text-slate-500">
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
                    !assessmentActive
                  }
                  onClick={handleNext}
                  className={`group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                    selectedAnswer &&
                    assessmentActive
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/20 hover:-translate-y-0.5 hover:shadow-violet-600/30"
                      : "cursor-not-allowed bg-white/[0.06] text-slate-600"
                  }`}
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Next question
                      <span className="transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <div className="flex min-h-0 flex-col gap-5 lg:overflow-hidden">
            {/* -------------------------------------------------
                OVERALL PROGRESS
            ------------------------------------------------- */}

            <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/10 backdrop-blur-2xl sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-400">
                    Progress
                  </p>

                  <h3 className="mt-1 text-sm font-semibold text-white">
                    Overall progress
                  </h3>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-mono text-slate-500">
                  {assessment?.total_questions ||
                    0}{" "}
                  total
                </span>
              </div>

              <div className="mt-6 flex items-center gap-5">
                {/* CIRCLE */}

                <div
                  className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      rgb(139 92 246) ${overallProgress}%,
                      rgba(255,255,255,0.06) ${overallProgress}% 100%
                    )`,
                  }}
                >
                  <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-slate-950">
                    <span className="text-lg font-bold text-white">
                      {overallProgress}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-3xl font-bold tracking-tight text-white">
                    {overallProgress}%
                  </p>

                  <p className="mt-1 text-xs font-mono text-slate-500">
                    Q{overallQuestion} /{" "}
                    {totalQuestions}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                  Current skill
                </p>

                <p className="mt-1.5 truncate text-sm font-semibold text-white">
                  {skill?.skill_name ||
                    "—"}

                  <span className="font-normal text-slate-500">
                    {" "}
                    · Q
                    {currentSkillQuestion} /{" "}
                    {questionsPerSkill}
                  </span>
                </p>
              </div>
            </div>

            {/* -------------------------------------------------
                ROADMAP
            ------------------------------------------------- */}

            <div className="min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/10 backdrop-blur-2xl sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-400">
                    Roadmap
                  </p>

                  <h3 className="mt-1 text-sm font-semibold text-white">
                    Assessment roadmap
                  </h3>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-mono text-slate-500">
                  {assessment?.skills?.length ||
                    0}{" "}
                  skills
                </span>
              </div>

              <div className="mt-6 space-y-0">
                {assessment?.skills?.map(
                  (item, index) => {
                    const isCurrent =
                      item.status ===
                        "current" ||
                      item.skill_id ===
                        skill?.skill_id;

                    const isCompleted =
                      item.status ===
                      "completed";

                    const isLast =
                      index ===
                      assessment.skills.length -
                        1;

                    return (
                      <div
                        key={
                          item.skill_id ||
                          index
                        }
                        className="relative flex gap-3 pb-5 last:pb-0"
                      >
                        {/* CONNECTING LINE */}

                        {!isLast && (
                          <div
                            className={`absolute left-[15px] top-8 h-[calc(100%-18px)] w-px ${
                              isCompleted
                                ? "bg-gradient-to-b from-emerald-400/60 to-violet-400/30"
                                : "bg-white/10"
                            }`}
                          />
                        )}

                        {/* STEP */}
                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-[10px] font-bold transition-all ${
                            isCurrent
                              ? "border-violet-400/40 bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-lg shadow-violet-500/20"
                              : isCompleted
                              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                              : "border-white/10 bg-white/[0.035] text-slate-600"
                          }`}
                        >
                          {isCompleted
                            ? "✓"
                            : index + 1}
                        </div>

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`min-w-0 truncate text-sm font-semibold ${
                                isCurrent
                                  ? "text-white"
                                  : isCompleted
                                  ? "text-slate-300"
                                  : "text-slate-500"
                              }`}
                            >
                              {item.skill_name}
                            </p>

                            <span
                              className={`shrink-0 text-[9px] font-bold uppercase tracking-wider ${
                                isCurrent
                                  ? "text-violet-300"
                                  : isCompleted
                                  ? "text-emerald-300"
                                  : "text-slate-600"
                              }`}
                            >
                              {isCurrent
                                ? "Current"
                                : isCompleted
                                ? "Completed"
                                : "Upcoming"}
                            </span>
                          </div>

                          {/* CURRENT PROGRESS */}
                          {isCurrent && (
                            <div className="mt-2.5">
                              <div className="flex items-center justify-between text-[9px] font-medium text-slate-600">
                                <span>
                                  Skill progress
                                </span>

                                <span className="text-violet-300">
                                  {
                                    skillProgress
                                  }
                                  %
                                </span>
                              </div>

                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                                  style={{
                                    width: `${skillProgress}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* COMPLETED STATUS */}
                          {isCompleted && (
                            <p className="mt-1 text-[10px] text-emerald-400/60">
                              Skill completed
                            </p>
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
  );
};

export default FinalQuiz;