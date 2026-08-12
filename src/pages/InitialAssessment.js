import { useCallback, useEffect, useState } from "react";
import {
  startInitialQuiz,
  submitInitialQuizAnswer,
  heartbeatInitialQuiz,
  pauseInitialQuiz,
} from "../services/api";
import { useNavigate } from "react-router-dom";

const InitialAssessment = () => {
  const navigate = useNavigate();

  // ----------------------------------------------------
  // Page state
  // ----------------------------------------------------
  const [page, setPage] = useState("instructions");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // Quiz session
  // ----------------------------------------------------
  const [sessionId, setSessionId] = useState(null);

  // ----------------------------------------------------
  // Timer / Resume state
  // ----------------------------------------------------
  const [resumed, setResumed] = useState(false);
  const [assessmentActive, setAssessmentActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // ----------------------------------------------------
  // Domain / skill / question
  // ----------------------------------------------------
  const [domain, setDomain] = useState(null);
  const [skill, setSkill] = useState(null);
  const [question, setQuestion] = useState(null);
  const [assessment, setAssessment] = useState(null);

  // ----------------------------------------------------
  // Answer
  // ----------------------------------------------------
  const [selectedAnswer, setSelectedAnswer] = useState("");

  // ----------------------------------------------------
  // Progress
  // ----------------------------------------------------
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const [skillQuestionsAnswered, setSkillQuestionsAnswered] = useState(0);

  // ----------------------------------------------------
  // Start assessment
  //
  // IMPORTANT:
  // The old component started the assessment automatically
  // when the page loaded.
  //
  // The new component waits until the student explicitly
  // clicks Start / Resume Assessment.
  // ----------------------------------------------------
  const loadAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await startInitialQuiz();

      console.log("Initial Quiz Started:", response);

      const quiz = response.data;

      setSessionId(quiz.session_id);
      setDomain(quiz.domain);
      setSkill(quiz.skill);
      setQuestion(quiz.question);
      setAssessment(quiz.assessment);

      const overallAnswered =
        quiz.assessment?.overall_question
          ? Math.max(quiz.assessment.overall_question - 1, 0)
          : 0;

      setQuestionsAnswered(overallAnswered);

      setSkillQuestionsAnswered(overallAnswered % 10);

      // Store whether this is a resumed assessment.
      setResumed(Boolean(quiz.resumed));

      // Store the server-authoritative remaining time.
      setRemainingSeconds(quiz.timer?.remaining_seconds ?? 0);

      // The quiz is loaded, but the student must
      // explicitly click Start / Resume before answering.
      setAssessmentActive(false);

      setSelectedAnswer("");

      setPage("quiz");
    } catch (err) {
      console.error("Failed to start initial quiz:", err);

      setError(
        err.response?.data?.error || "Failed to start the initial assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Submit current answer
  // ----------------------------------------------------
  const handleNext = useCallback(async () => {
    if (!selectedAnswer || !question || !sessionId) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

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

      // ------------------------------------------------
      // Entire assessment completed
      // ------------------------------------------------
      if (result.assessment_completed) {
        setPage("completed");
        return;
      }

      // ------------------------------------------------
      // Skill completed -> move to next skill
      // ------------------------------------------------
      if (result.skill_completed && result.next_skill) {
        setSkill(result.next_skill);

        setSkillQuestionsAnswered(0);

        setQuestionsAnswered(
          Math.max((result.assessment?.overall_question ?? 1) - 1, 0)
        );

        setQuestion(result.question);
        setSelectedAnswer("");

        return;
      }

      // ------------------------------------------------
      // Continue current skill
      // ------------------------------------------------
      if (result.progress) {
        const currentProgress =
          result.progress.current ??
          result.progress.questions_answered ??
          0;

        setSkillQuestionsAnswered(currentProgress);
      }

      if (result.assessment) {
        setQuestionsAnswered(
          Math.max((result.assessment.overall_question ?? 1) - 1, 0)
        );
      }

      setQuestion(result.question);
      setSelectedAnswer("");
    } catch (err) {
      console.error("Failed to submit answer:", err);

      setError(
        err.response?.data?.error || "Failed to submit the answer."
      );
    } finally {
      setSubmitting(false);
    }
  }, [selectedAnswer, question, sessionId]);

  // ----------------------------------------------------
  // Start / Resume assessment
  // ----------------------------------------------------
  const handleStartAssessment = () => {
    setError("");
    setAssessmentActive(true);
  };

  // ----------------------------------------------------
  // Countdown timer
  // ----------------------------------------------------
  useEffect(() => {
    if (!assessmentActive) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [assessmentActive]);

  // ----------------------------------------------------
  // Server heartbeat
  // ----------------------------------------------------
  useEffect(() => {
    if (!assessmentActive || !sessionId) {
      return;
    }

    const heartbeatTimer = setInterval(async () => {
      try {
        const response = await heartbeatInitialQuiz(sessionId);
        const data = response.data;

        if (typeof data.remaining_seconds === "number") {
          setRemainingSeconds(data.remaining_seconds);
        }
      } catch (err) {
        console.error("Assessment heartbeat failed:", err);
      }
    }, 10000);

    return () => {
      clearInterval(heartbeatTimer);
    };
  }, [assessmentActive, sessionId]);

  // ----------------------------------------------------
  // Pause assessment when leaving the assessment page
  // ----------------------------------------------------
  useEffect(() => {
    if (!assessmentActive || !sessionId) {
      return;
    }

    const handlePageHide = () => {
      pauseInitialQuiz(sessionId).catch((err) => {
        console.error("Failed to pause assessment:", err);
      });
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [assessmentActive, sessionId]);

  // ----------------------------------------------------
  // Keyboard support
  //
  // A/B/C/D selects an option.
  // Enter submits the answer.
  // ----------------------------------------------------
  useEffect(() => {
    if (page !== "quiz" || !assessmentActive) {
      return;
    }

    const handleKeyDown = (event) => {
      if (submitting) {
        return;
      }

      const key = event.key.toUpperCase();

      if (["A", "B", "C", "D"].includes(key)) {
        setSelectedAnswer(key);
      }

      if (event.key === "Enter" && selectedAnswer) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    page,
    selectedAnswer,
    submitting,
    question,
    sessionId,
    assessmentActive,
    handleNext,
  ]);

  // ----------------------------------------------------
  // Convert question into UI options
  // ----------------------------------------------------
  const options = question
    ? [
        {
          key: "A",
          text: question.option_a,
        },
        {
          key: "B",
          text: question.option_b,
        },
        {
          key: "C",
          text: question.option_c,
        },
        {
          key: "D",
          text: question.option_d,
        },
      ]
    : [];

  // ----------------------------------------------------
  // Timer display
  // ----------------------------------------------------
  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);

    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  // ----------------------------------------------------
  // Progress
  // ----------------------------------------------------
  const currentQuestionNumber = skillQuestionsAnswered + 1;
  const skillProgress = Math.min((skillQuestionsAnswered / 10) * 100, 100);

  const overallQuestionNumber = questionsAnswered + 1;
  const overallTotalQuestions = assessment?.total_questions || 50;
  const overallProgress = Math.min(
    (questionsAnswered / overallTotalQuestions) * 100,
    100
  );

  // ----------------------------------------------------
  // Instructions screen
  // ----------------------------------------------------
  if (page === "instructions") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Initial Skill Assessment
            </h1>

            <p className="mt-3 text-gray-500">
              Complete this assessment to personalize your learning path.
            </p>
          </div>

          {/* Assessment information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">
              <p className="text-sm text-gray-500">Assessment</p>
              <p className="mt-1 font-semibold text-gray-900">
                Adaptive Skill Assessment
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Questions</p>
              <p className="mt-1 font-semibold text-gray-900">10 per skill</p>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Format</p>
              <p className="mt-1 font-semibold text-gray-900">
                Multiple Choice
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">
              Before you begin
            </h2>

            <div className="mt-4 space-y-3 text-gray-600">
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <p>
                  Answer each question by selecting one of the four available
                  options.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <p>
                  The assessment is adaptive, so the next question may change
                  based on your previous answer.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <p>
                  Your answers are submitted to the server one question at a
                  time.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <p>
                  If you leave an assessment that is still in progress, the
                  backend can resume the existing quiz session.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={loadAssessment}
              disabled={loading}
              className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Load Assessment"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Completed screen
  // ----------------------------------------------------
  if (page === "completed") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Completed!
          </h1>
          <p className="mt-4 text-gray-600">
            You have successfully completed your initial skill assessment. We
            will use your results to personalize your learning roadmap.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-8 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Quiz screen
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 py-6 md:py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Initial Skill Assessment
              </h1>

              <p className="mt-1 text-gray-500">
                Complete the assessment to personalize your learning path.
              </p>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-sm text-gray-500">Domain</p>

                <p className="font-semibold text-gray-900">
                  {domain?.domain_name || "Not available"}
                </p>
              </div>

              {assessmentActive && (
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Time Remaining
                  </p>

                  <p
                    className={`text-3xl font-bold ${
                      remainingSeconds <= 300
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formatTime(remainingSeconds)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Start / Resume */}
        {!assessmentActive ? (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {resumed ? "Resume Skill Assessment" : "Start Skill Assessment"}
            </h2>

            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              {resumed
                ? "Your previous progress has been saved. You will continue from the same question with the remaining time."
                : "Your assessment is ready. Once you continue, the timer will be active."}
            </p>

            <button
              type="button"
              onClick={handleStartAssessment}
              className="mt-6 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              {resumed ? "Resume Skill Assessment" : "Start Skill Assessment"}
            </button>
          </div>
        ) : question ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* =================================================
                QUESTION CARD
            ================================================= */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Question{" "}
                  <span className="font-semibold text-gray-700">
                    {currentQuestionNumber}
                  </span>{" "}
                  / 10
                </div>

                <div className="font-semibold text-gray-900">
                  {skill?.skill_name || "Current Skill"}
                </div>
              </div>

              {/* Skill progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Skill Progress</span>

                  <span>{Math.round(skillProgress)}%</span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${skillProgress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mt-10">
                <p className="text-sm font-semibold text-blue-600">
                  Question {currentQuestionNumber}
                </p>

                <h2 className="mt-2 text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
                  {question.question_text}
                </h2>
              </div>

              {/* Options */}
              <div className="mt-8 space-y-4">
                {options.map((option) => (
                  <label
                    key={option.key}
                    className={`block border rounded-xl p-5 cursor-pointer transition ${
                      selectedAnswer === option.key
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
                    } ${
                      submitting ? "cursor-not-allowed opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name={`question-${question.question_id}`}
                        value={option.key}
                        checked={selectedAnswer === option.key}
                        onChange={() => setSelectedAnswer(option.key)}
                        disabled={submitting}
                        className="mt-1"
                      />

                      <div>
                        <span className="font-bold text-gray-900 mr-2">
                          {option.key}.
                        </span>

                        <span className="text-gray-700">{option.text}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Navigation */}
              <div className="mt-10 flex justify-between items-center">
                <p className="text-sm text-gray-400">
                  Select an answer and click Next.
                </p>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedAnswer || submitting}
                  className="px-7 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Next"}
                </button>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Overall Progress
                </h2>

                <div className="mt-3 flex justify-between text-sm text-gray-500">
                  <span>
                    Question {overallQuestionNumber} / {overallTotalQuestions}
                  </span>

                  <span>{Math.round(overallProgress)}%</span>
                </div>

                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${overallProgress}%`,
                    }}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Current Skill</p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {skill?.skill_name || "Not available"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Question {currentQuestionNumber} / 10
                  </p>
                </div>
              </div>

              {/* Assessment Roadmap */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Assessment Roadmap
                  </h2>

                  <span className="text-sm text-gray-400">
                    {assessment?.total_skills || 0} skills
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {assessment?.skills?.map((item, index) => {
                    const isCurrent = item.skill_id === skill?.skill_id;

                    const isCompleted = item.status === "completed";

                    return (
                      <div
                        key={item.skill_id}
                        className={`rounded-lg border p-4 transition ${
                          isCurrent
                            ? "border-blue-500 bg-blue-50"
                            : isCompleted
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                isCompleted
                                  ? "bg-green-100 text-green-600"
                                  : isCurrent
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {isCompleted ? "✓" : index + 1}
                            </div>

                            <span className="font-medium text-gray-800">
                              {item.skill_name}
                            </span>
                          </div>

                          <span
                            className={`text-sm font-medium ${
                              isCompleted
                                ? "text-green-600"
                                : isCurrent
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          >
                            {isCompleted
                              ? "completed"
                              : isCurrent
                              ? "current"
                              : "upcoming"}
                          </span>
                        </div>

                        {isCurrent && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>

                              <span>{Math.round(skillProgress)}%</span>
                            </div>

                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{
                                  width: `${skillProgress}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="mt-3">
                            <div className="w-full h-1.5 bg-green-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                  width: "100%",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">No question available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InitialAssessment;