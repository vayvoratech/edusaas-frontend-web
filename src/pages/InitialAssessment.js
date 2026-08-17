
import { useCallback, useEffect, useState, useRef } from "react";
import {
  startInitialQuiz,
  submitInitialQuizAnswer,
  heartbeatInitialQuiz,
  pauseInitialQuizOnUnload
} from "../services/api";
import ProctoringService from "../services/proctoringServices";
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------
// 1. Fullscreen helper
// ----------------------------------------------------
const enterAssessmentFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen request was blocked:", error);
  }
};

const exitAssessmentFullscreen = async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch (err) {
    console.warn("Failed to exit fullscreen:", err);
  }
};

// ----------------------------------------------------
// 9. Answer cards component
// ----------------------------------------------------
const AnswerOption = ({ letter, text, selected, onClick, disabled }) => (
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

const InitialAssessment = () => {
  const navigate = useNavigate();
  const proctoringRef = useRef(null);

  useEffect(() => {
    proctoringRef.current =
      new ProctoringService({
        onConnected: () => {
          console.log("Proctoring WebSocket connected.");
        },

        onStarted: (data) => {
          console.log("AI proctoring started:", data);
          setError("");
          setAssessmentActive(true);
        },

        onResult: (data) => {
          if (!data?.fraud) return;

          const fraud = data.fraud;

          if (fraud.new_violation === true) {
            setProctoringWarning({
              violationType: fraud.violation_type || "PROCTORING",
              message: fraud.message || "A proctoring violation was detected.",
              violationCount: fraud.violation_count ?? 0,
              action: fraud.action || "WARNING",
            });
          }
        },

        onWarning: (data) => {
          console.warn("Proctoring warning:", data);

          const fraud = data?.fraud || data;

          setProctoringWarning({
            violationType: fraud?.violation_type || "PROCTORING",
            message: fraud?.message || "A proctoring violation was detected.",
            violationCount: fraud?.violation_count ?? 0,
            action: fraud?.action || "WARNING",
          });
        },

        onPause: (data) => {
          console.warn("Assessment paused by proctoring:", data);
        },

        onTerminate: async (data) => {
          console.error("Assessment terminated:", data);

          setAssessmentActive(false);

          await exitAssessmentFullscreen();

          setPage("terminated");
        },
        onDisconnected: () => {
          console.log("Proctoring WebSocket disconnected.");
        },

        onError: (error) => {
          console.error("Proctoring error:", error);
        },
      });

    return () => {
      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
        proctoringRef.current = null;
      }
    };
  }, []);

  // ----------------------------------------------------
  // Page state
  // ----------------------------------------------------
  const [page, setPage] = useState("instructions");
  const [loading, setLoading] = useState(false);
  const loadingAssessmentRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [proctoringWarning, setProctoringWarning] = useState(null);

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

  // Load Assessment configuration
  const loadAssessment = async () => {
    if(loadingAssessmentRef.current){
      return;
    }
    loadingAssessmentRef.current = true;
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

      setSkillQuestionsAnswered(overallAnswered % 10)

      setResumed(Boolean(quiz.resumed));
      setRemainingSeconds(quiz.timer?.remaining_seconds ?? 0);

      setAssessmentActive(false);
      setSelectedAnswer("");
      setPage("quiz");
    } catch (err) {
      console.error("Failed to start initial quiz:", err);
      setError(
        err.response?.data?.error || "Failed to start the initial assessment."
      );
    } finally {
      loadingAssessmentRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
  }, [])

  useEffect(() => {
    if (page !== "quiz") return;

    const startPreview = async () => {
      try {
        await proctoringRef.current?.startCameraPreview();
      } catch (err) {
        console.error("Failed to start camera preview:", err); // Keep existing console.error
        setAssessmentActive(false)
        await exitAssessmentFullscreen()
        setError(
          err.message ||
            "Unable to access the camera. Please allow camera permission and try again."
        );
      }
    };

    startPreview();
  }, [page]);

  // ----------------------------------------------------
  // Submit current answer
  // ----------------------------------------------------
  const handleNext = useCallback(async () => {
    if (!selectedAnswer || !question || !sessionId) return;

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

      if (result.assessment_completed) {
        console.log("Assessment completed:", result);
       
        setAssessmentActive(false);

        await exitAssessmentFullscreen();

        if (proctoringRef.current) {
          proctoringRef.current.cleanup();
        }

        setSelectedAnswer("");
        setQuestion(null);
        setPage("completed");
        return;
      }

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
  // 2. Start fullscreen from the actual Start button
  // ----------------------------------------------------
  const handleStartAssessment = async () => {

    if (!sessionId) {
      setError("Assessment session not found.");
      return;
    }
     await enterAssessmentFullscreen();

    try {
      setError("");
      setProctoringWarning(null);

      await proctoringRef.current.start(sessionId);

      console.log("Proctoring connection established. Waiting for AI...");
    } catch (err) {
      console.error("Failed to start proctoring:", err);
      setAssessmentActive(false);

      await exitAssessmentFullscreen();

      setError(
        err.message || // Keep existing error message logic
          "Unable to start proctoring. Please check your camera permission and try again."
      );
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!assessmentActive) return;

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assessmentActive]);

  // Enforce fullscreen while the assessment is active
  useEffect(() => {
    if (!assessmentActive) return;

    const handleFullscreenChange = () => {
      if (document.fullscreenElement) return;

      console.warn("Assessment exited fullscreen.");

      setAssessmentActive(false);

      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }

      setPage("terminated");
      setError(
        "The assessment was terminated because fullscreen mode was exited."
      );
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, [assessmentActive]);

  // Heartbeat
  useEffect(() => {
    if (!assessmentActive || !sessionId) return;

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

    return () => clearInterval(heartbeatTimer);
  }, [assessmentActive, sessionId]);

  // Handle page hide / unmount pause
  useEffect(() => {
    if (!assessmentActive || !sessionId) return;

    const handlePageHide = () => {
      if (!sessionId || !assessmentActive) return;

      pauseInitialQuizOnUnload(sessionId);

      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [assessmentActive, sessionId]);

  // Keyboard shortcut support
  useEffect(() => {
    if (page !== "quiz" || !assessmentActive) return;

    const handleKeyDown = (event) => {
      if (submitting) return;

      const key = event.key.toUpperCase();

      if (["A", "B", "C", "D"].includes(key)) {
        setSelectedAnswer(key);
      }

      if (event.key === "Enter" && selectedAnswer) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, selectedAnswer, submitting, handleNext, assessmentActive]);

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const currentSkillQuestion = skillQuestionsAnswered + 1;
  const questionsPerSkill = 10;

  const skillProgress = Math.min(
    100,
    Math.round(
      (skillQuestionsAnswered / questionsPerSkill) * 100
    )
  );

  const overallQuestion = questionsAnswered + 1;
  const totalQuestions = assessment?.total_questions || 50;

  const overallProgress = Math.min(
    100,
    Math.round(
      (questionsAnswered / totalQuestions) * 100
    )
  );


  // Instructions Screen
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

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">
              Before you begin
            </h2>
            <div className="mt-4 space-y-3 text-gray-600">
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <p>
                  Answer each question by selecting one of the four available options.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <p>
                  The assessment is adaptive, so the next question may change based on your previous answer.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <p>
                  Your answers are submitted to the server one question at a time.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <p>
                  If you leave an assessment that is still in progress, the backend can resume the existing quiz session.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            {loading && (
              <p className="text-sm text-gray-500">
                Checking your assessment status...
              </p>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Completed Screen
  if (page === "completed") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Completed
          </h1>
          <p className="mt-4 text-gray-600">
            You have successfully completed your initial skill assessment.
          </p>

          
          <button
            onClick={() => navigate("/app/dashboard")}
            className="mt-8 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Terminated Screen
  if (page === "terminated") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            !
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Terminated
          </h1>

          <p className="mt-4 text-gray-600">
            Your assessment was terminated because a proctoring violation was detected.
          </p>

          <button
            onClick={() => navigate("/app/dashboard")}
            className="mt-8 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <>
      {/* 4. Assessment Viewport (non-scrolling) */}
      <div className="h-[calc(100vh-80px)] overflow-hidden bg-[#f5f7f6]">

        {/* 13. Camera preview */}
        <div className="fixed bottom-5 left-5 z-40 w-48 overflow-hidden rounded-xl border-2 border-white bg-black shadow-xl">
          <video
            id="cameraVideo"
            autoPlay
            muted
            playsInline
            className="aspect-video w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium text-white">
                Camera active
              </span>
            </div>
          </div>
        </div>

        {/* Start / Resume Prompt View */}
        {!assessmentActive ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                {resumed ? "Resume Skill Assessment" : "Start Skill Assessment"}
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                {resumed
                  ? "Your previous progress has been saved. You will continue from the same question with the remaining time."
                  : "Your assessment is ready. Click below to enter full-screen mode and launch proctoring."}
              </p>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleStartAssessment}
                className="mt-6 w-full rounded-full bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition"
              >
                {resumed ? "Resume Skill Assessment" : "Start Skill Assessment"}
              </button>
            </div>
          </div>
        ) : question ? (
          /* 5. Main layout grid */
          <div className="h-full p-6">
            <div className="h-full grid grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)] gap-6">

              {/* 6. Question card */}
              <div className="h-full min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
                {/* Question Header */}
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
                        Assessment · {domain?.domain_name || "Skill Assessment"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-600">
                        {domain?.domain_name || "Assessment"}
                      </span>
                      <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-mono font-semibold text-orange-600">
                        {formatTime(remainingSeconds)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warnings / Errors Banner within Card */}
                {(error || proctoringWarning) && (
                  <div className="shrink-0 bg-orange-50 border-b border-orange-200 px-6 py-2 text-xs text-orange-800 flex items-center justify-between">
                    <span>{error || proctoringWarning?.message}</span>
                    {proctoringWarning && (
                      <span className="font-semibold">Violations: {proctoringWarning.violationCount}</span>
                    )}
                  </div>
                )}

                {/* 7. Question progress */}
                <div className="shrink-0 border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      {skill?.skill_name || "Current Skill"}
                    </span>
                    
                    <span className="text-xs font-medium text-slate-500">
                      QUESTION {currentSkillQuestion} / {questionsPerSkill}
                      <span className="mx-2">·</span>
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

                {/* 8. Question body */}
                <div className="flex-1 min-h-0 px-7 py-5 overflow-hidden">
                  <div className="flex gap-5">
                    <span className="pt-1 text-sm font-mono text-slate-400">
                      {String(overallQuestion).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl xl:text-2xl font-semibold leading-relaxed text-slate-900">
                        {question?.question_text}
                      </h2>

                      {/* 9. Answer cards rendering */}
                      <div className="mt-6 grid gap-3">
                        <AnswerOption
                          letter="A"
                          text={question?.option_a}
                          selected={selectedAnswer === "A"}
                          disabled={submitting}
                          onClick={() => setSelectedAnswer("A")}
                        />
                        <AnswerOption
                          letter="B"
                          text={question?.option_b}
                          selected={selectedAnswer === "B"}
                          disabled={submitting}
                          onClick={() => setSelectedAnswer("B")}
                        />
                        <AnswerOption
                          letter="C"
                          text={question?.option_c}
                          selected={selectedAnswer === "C"}
                          disabled={submitting}
                          onClick={() => setSelectedAnswer("C")}
                        />
                        <AnswerOption
                          letter="D"
                          text={question?.option_d}
                          selected={selectedAnswer === "D"}
                          disabled={submitting}
                          onClick={() => setSelectedAnswer("D")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10. Bottom navigation */}
                <div className="shrink-0 border-t border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {selectedAnswer
                        ? "Answer selected. Continue when ready."
                        : "Select an answer to continue."}
                    </p>

                    <button
                      type="button"
                      disabled={!selectedAnswer || submitting}
                      onClick={handleNext}
                      className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                        selectedAnswer
                          ? "bg-emerald-700 text-white hover:bg-emerald-800"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {submitting ? "Saving..." : "Next question →"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="h-full min-h-0 flex flex-col gap-6 overflow-hidden">
                {/* 11. Right-side Overall Progress card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Overall progress
                    </h3>

                    <span className="text-xs font-mono text-slate-500">
                      {assessment?.total_questions || 0} total
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
                        Q{overallQuestion} / {assessment?.total_questions}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">
                      Current skill
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {skill?.skill_name || "—"}
                      <span className="font-normal text-slate-500">
                        {" "}— Q{currentSkillQuestion} / {questionsPerSkill}
                      </span>
                    </p>
                  </div>
                </div>

                {/* 12. Assessment roadmap */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Assessment roadmap
                    </h3>

                    <span className="text-xs font-mono text-slate-500">
                      {assessment?.skills?.length || 0} skills
                    </span>
                  </div>

                  <div className="mt-5 space-y-0">
                    {assessment?.skills?.map((item, index) => {
                      const isCurrent = item.status === "current" || item.skill_id === skill?.skill_id;
                      const isCompleted = item.status === "completed";

                      return (
                        <div
                          key={item.skill_id || index}
                          className="relative flex gap-3 pb-5 last:pb-0"
                        >
                          {index < assessment.skills.length - 1 && (
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
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <p className="text-slate-500">No question available.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default InitialAssessment;