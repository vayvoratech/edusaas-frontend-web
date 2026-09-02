import React, { useCallback, useEffect, useState } from "react";

import { submitFinalQuizAnswer } from "../../../services/api";


// ---------------------------------------------------------
// ANSWER OPTION
// Same visual component as Initial Quiz
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
    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
      selected
        ? "border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700"
        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
    } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
  >
    <div className="flex items-center gap-4">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-medium ${
          selected
            ? "border-emerald-700 bg-emerald-700 text-white"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        {letter}
      </span>

      <span className="text-sm font-medium text-slate-800">
        {text}
      </span>
    </div>
  </button>
);


// ---------------------------------------------------------
// FINAL QUIZ
// UI mirrors InitialQuiz.
// Logic is FINAL-QUIZ specific.
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
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");


  // -------------------------------------------------------
  // KEEP INITIAL DATA IN SYNC
  // Important for resume / parent state changes.
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


  // -------------------------------------------------------
  // NO QUESTION
  // -------------------------------------------------------

  if (!question) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-slate-500">
          No question available.
        </p>
      </div>
    );
  }


  // -------------------------------------------------------
  // UI
  // Same visual structure as InitialQuiz
  // -------------------------------------------------------

  return (
    <>
      <div className="h-full p-6">
        <div className="h-full grid grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)] gap-6">

          {/* =================================================
              QUESTION CARD
          ================================================= */}

          <div className="h-full min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">

            {/* -------------------------------------------------
                HEADER
            ------------------------------------------------- */}

            <div className="shrink-0 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">

                <div>
                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-sm font-semibold text-slate-900">
                      Proctoring active
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Assessment ·{" "}
                    {initialDomain?.domain_name ||
                      "Skill Assessment"}
                  </p>
                </div>


                <div className="flex items-center gap-3">

                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-600">
                    {initialDomain?.domain_name ||
                      "Assessment"}
                  </span>

                  <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-mono font-semibold text-orange-600">
                    {formatTime(
                      remainingSeconds
                    )}
                  </span>

                </div>

              </div>
            </div>


            {/* -------------------------------------------------
                ERROR / WARNING
            ------------------------------------------------- */}

            {(error || tabSwitchCount > 0) && (
              <div className="shrink-0 bg-orange-50 border-b border-orange-200 px-6 py-2 text-xs text-orange-800 flex items-center justify-between">

                <span>
                  {error ||
                    "Please remain in the assessment window."}
                </span>

                {tabSwitchCount > 0 && (
                  <span className="font-semibold">
                    Violations:{" "}
                    {tabSwitchCount}
                  </span>
                )}

              </div>
            )}


            {/* -------------------------------------------------
                SKILL PROGRESS
            ------------------------------------------------- */}

            <div className="shrink-0 border-b border-slate-200 px-6 py-4">

              <div className="flex items-center justify-between">

                <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {skill?.skill_name ||
                    "Current Skill"}
                </span>

                <span className="text-xs font-medium text-slate-500">

                  QUESTION{" "}
                  {currentSkillQuestion} /{" "}
                  {questionsPerSkill}

                  <span className="mx-2">
                    ·
                  </span>

                  {skillProgress}%

                </span>

              </div>


              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-emerald-700 transition-all"
                  style={{
                    width: `${skillProgress}%`,
                  }}
                />

              </div>

            </div>


            {/* -------------------------------------------------
                QUESTION
            ------------------------------------------------- */}

            <div className="flex-1 min-h-0 px-7 py-5 overflow-hidden">

              <div className="flex gap-5">

                <span className="pt-1 text-sm font-mono text-slate-400">
                  {String(
                    overallQuestion
                  ).padStart(2, "0")}
                </span>


                <div className="min-w-0 flex-1">

                  <h2 className="text-xl xl:text-2xl font-semibold leading-relaxed text-slate-900">
                    {question.question_text}
                  </h2>


                  <div className="mt-6 grid gap-3">

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

            <div className="shrink-0 border-t border-slate-200 px-6 py-4">

              <div className="flex items-center justify-between">

                <p className="text-xs text-slate-500">
                  {selectedAnswer
                    ? "Answer selected. Continue when ready."
                    : "Select an answer to continue."}
                </p>


                <button
                  type="button"
                  disabled={
                    !selectedAnswer ||
                    submitting ||
                    !assessmentActive
                  }
                  onClick={handleNext}
                  className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                    selectedAnswer &&
                    assessmentActive
                      ? "bg-emerald-700 text-white hover:bg-emerald-800"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {submitting
                    ? "Saving..."
                    : "Next question →"}
                </button>

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <div className="h-full min-h-0 flex flex-col gap-6 overflow-hidden">

            {/* -------------------------------------------------
                OVERALL PROGRESS
            ------------------------------------------------- */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <h3 className="text-sm font-semibold text-slate-900">
                  Overall progress
                </h3>

                <span className="text-xs font-mono text-slate-500">
                  {assessment?.total_questions ||
                    0}{" "}
                  total
                </span>

              </div>


              <div className="mt-5 flex items-center gap-5">

                <div className="relative h-24 w-24 shrink-0 flex items-center justify-center rounded-full border-4 border-emerald-700 bg-emerald-50 text-emerald-800 font-bold text-lg">
                  {overallProgress}%
                </div>


                <div>

                  <p className="text-3xl font-semibold text-slate-900">
                    {overallProgress}%
                  </p>

                  <p className="text-xs font-mono text-slate-500">
                    Q{overallQuestion} /{" "}
                    {assessment?.total_questions}
                  </p>

                </div>

              </div>


              <div className="mt-5 border-t border-slate-200 pt-4">

                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  Current skill
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">

                  {skill?.skill_name ||
                    "—"}

                  <span className="font-normal text-slate-500">
                    {" "}
                    — Q
                    {currentSkillQuestion} /{" "}
                    {questionsPerSkill}
                  </span>

                </p>

              </div>

            </div>


            {/* -------------------------------------------------
                ROADMAP
            ------------------------------------------------- */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex-1">

              <div className="flex items-center justify-between">

                <h3 className="text-sm font-semibold text-slate-900">
                  Assessment roadmap
                </h3>

                <span className="text-xs font-mono text-slate-500">
                  {assessment?.skills?.length ||
                    0}{" "}
                  skills
                </span>

              </div>


              <div className="mt-5 space-y-0">

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


                    return (
                      <div
                        key={
                          item.skill_id ||
                          index
                        }
                        className="relative flex gap-3 pb-5 last:pb-0"
                      >

                        {index <
                          assessment.skills
                            .length -
                            1 && (
                          <div className="absolute left-[13px] top-7 h-full w-px bg-slate-200" />
                        )}


                        <div
                          className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                            isCurrent
                              ? "border-emerald-700 bg-emerald-700 text-white"
                              : isCompleted
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          {index + 1}
                        </div>


                        <div className="min-w-0 flex-1 pt-0.5">

                          <div className="flex items-center justify-between gap-2">

                            <p className="text-sm font-semibold text-slate-900">
                              {item.skill_name}
                            </p>

                            <span
                              className={`text-[10px] font-mono uppercase tracking-wide ${
                                isCurrent
                                  ? "text-emerald-700"
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
                            <div className="mt-2 h-1.5 rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-emerald-700"
                                style={{
                                  width: `${skillProgress}%`,
                                }}
                              />

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
    </>
  );
};


export default FinalQuiz;