import { useCallback, useEffect, useState, useRef } from "react";
import InitialQuiz from "./InitialQuiz";
import InitialCodingAssessment from "./InitialCodingAssessment";
import {
  startInitialQuiz,
  activateInitialQuiz,
  heartbeatInitialQuiz,
  pauseInitialQuiz,
  pauseInitialQuizOnUnload,
  submitAssessmentReport
} from "../../../services/api";

import ProctoringService from "../../../services/proctoringServices";
import { useLocation, useNavigate } from "react-router-dom";
import { getInitialCodingAssessmentInfo } from "../../../services/api";

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
// Initial Assessment
// ----------------------------------------------------
const InitialAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCodingStage = location.state?.phase === "coding";

  const isRestartApproved =
    location.state?.restartApproved === true;

  const proctoringRef = useRef(null);

  // Hide the normal application shell while the assessment is active.
  useEffect(() => {
    document.body.classList.add("assessment-mode");

    return () => {
      document.body.classList.remove("assessment-mode");
    };
  }, []);

  const assessmentActiveRef = useRef(false);
  const sessionIdRef = useRef(null);
  const skipAutoPauseRef = useRef(false);
  const pauseSentRef = useRef(false);

  const assessmentTerminatedRef = useRef(false);

  useEffect(() => {
    proctoringRef.current =
      new ProctoringService({
        onConnected: () => {
          console.log("Proctoring WebSocket connected.");
        },

        onStarted: (data) => {
          console.log("AI proctoring started:", data);
          setStartingProctoring(false);
          setError("");
          setAssessmentActive(true);
          setPage("quiz");
        },

        onResult: (data) => {
          if (!data?.fraud) return;

          const fraud = data.fraud;

          if (fraud.new_violation === true) {
            setProctoringWarning({
              violationType: fraud.violation_type || "PROCTORING",
              message:
                fraud.message || "A proctoring violation was detected.",
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
            message:
              fraud?.message || "A proctoring violation was detected.",
            violationCount: fraud?.violation_count ?? 0,
            action: fraud?.action || "WARNING",
          });
        },

        onPause: (data) => {
          console.warn("Assessment paused by proctoring:", data);
        },

                onTerminate: async (data) => {
          console.error("Assessment terminated:", data);

          assessmentTerminatedRef.current = true;
          skipAutoPauseRef.current = true;
          assessmentActiveRef.current = false;

          setAssessmentActive(false);

          await exitAssessmentFullscreen();

          if (proctoringRef.current) {
            proctoringRef.current.cleanup();
          }

          setShowReportForm(false);
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
    const [page, setPage] = useState(
    isCodingStage || isRestartApproved
      ? "instructions"
      : "checking"
  );
  const [loading, setLoading] = useState(false);
  const loadingAssessmentRef = useRef(false);
  const [error, setError] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportEvidence, setReportEvidence] = useState("");
  const [reportEvidenceFile, setReportEvidenceFile] = useState(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState("");
  
  const [startingProctoring, setStartingProctoring] = useState(false);
  const [proctoringWarning, setProctoringWarning] = useState(null);

  const [codingInfo, setCodingInfo] = useState(null);

  // ----------------------------------------------------
  // Tab-switch blocking overlay
  // ----------------------------------------------------
  const [tabSwitchAlert, setTabSwitchAlert] = useState(false);
  const tabSwitchCountRef = useRef(0);

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

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (page !== "instructions") return;

    const loadCodingInfo = async () => {
      try {
        const response = await getInitialCodingAssessmentInfo();
        setCodingInfo(response.data);
      } catch (error) {
        console.error(
          "Failed to load coding assessment info:",
          error
        );
      }
    };

    loadCodingInfo();
  }, [page]);

  useEffect(() => {
    assessmentActiveRef.current = assessmentActive;
  }, [assessmentActive]);

  const [quizData, setQuizData] = useState(null);

  // ----------------------------------------------------
  // Load Assessment configuration
  // ----------------------------------------------------
  const loadAssessment = async () => {
    if (loadingAssessmentRef.current) {
      return;
    }

    loadingAssessmentRef.current = true;

    try {
      setLoading(true);
      setError("");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError(
          "Your browser does not support camera and microphone access. Please use Chrome, Edge, or Firefox."
        );
        return;
      }

      let testStream = null;

      try {
        testStream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
      } catch (mediaErr) {
        console.error(
          "Camera and Microphone permission denied:",
          mediaErr
        );

        if (
          mediaErr.name === "NotAllowedError" ||
          mediaErr.name === "PermissionDeniedError"
        ) {
          setError(
            "Camera and microphone permissions are required to load the assessment. Please allow camera and microphone access in your browser site settings and click Load Assessment again."
          );
        } else if (
          mediaErr.name === "NotFoundError" ||
          mediaErr.name === "DevicesNotFoundError"
        ) {
          setError(
            "Camera or microphone device was not found. Please connect your camera and microphone and try again."
          );
        } else {
          setError(
            `Camera and microphone access error: ${
              mediaErr.message || "Permission not granted"
            }.`
          );
        }

        return;
      } finally {
        if (testStream) {
          testStream.getTracks().forEach((track) =>
            track.stop()
          );
        }
      }

      const response = await startInitialQuiz();

      console.log("Initial Quiz Started:", response);

      const quiz = response.data;

      if (quiz.phase === "coding") {
        console.log(
          "Initial quiz completed. Entering/resuming coding assessment."
        );

        setSessionId(quiz.session_id);
        setQuizData(quiz);

        console.log(
          "SETTING CODING QUIZ DATA:",
          quiz
        );

        setAssessmentActive(false);

        console.log(
          "CODING QUIZ DATA BEFORE PAGE:",
          quiz
        );

        setPage("coding");

        return;
      }

      if (quiz.phase === "completed") {
        console.log(
          "Initial assessment already completed."
        );

        setSessionId(quiz.session_id);
        setAssessmentActive(false);
        setPage("completed");

        return;
      }

      setSessionId(quiz.session_id);

      pauseSentRef.current = false;

      const overallAnswered =
        quiz.assessment?.overall_question
          ? Math.max(
              quiz.assessment.overall_question - 1,
              0
            )
          : 0;

      setQuizData({
        domain: quiz.domain,
        skill: quiz.skill,
        question: quiz.question,
        assessment: quiz.assessment,
        questionsAnswered: overallAnswered,
        skillQuestionsAnswered:
          overallAnswered % 10,
      });

      setResumed(Boolean(quiz.resumed));
      setRemainingSeconds(
        quiz.timer?.remaining_seconds ?? 0
      );

      setAssessmentActive(false);
      setPage("ready");
    } catch (err) {
      console.error(
        "Failed to start initial quiz:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Failed to start the initial assessment."
      );
    } finally {
      loadingAssessmentRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page !== "quiz") return;

    const startPreview = async () => {
      try {
        await proctoringRef.current?.startCameraPreview();
      } catch (err) {
        console.error(
          "Failed to start camera preview:",
          err
        );

        setAssessmentActive(false);

        await exitAssessmentFullscreen();

        setError(
          err.message ||
            "Unable to access the camera. Please allow camera permission and try again."
        );
      }
    };

    startPreview();
  }, [page]);

  // ----------------------------------------------------
  // Start fullscreen
  // ----------------------------------------------------
  const handleStartAssessment = async () => {
    if (!sessionId) {
      setError("Assessment session not found.");
      return;
    }

    setStartingProctoring(true);
    setError("");
    setProctoringWarning(null);

    let activatedRemaining = null;

    try {
      const activateResponse =
        await activateInitialQuiz(sessionId);

      activatedRemaining =
        activateResponse?.data?.remaining_seconds;

      if (typeof activatedRemaining === "number") {
        setRemainingSeconds(activatedRemaining);
      }
    } catch (err) {
      setStartingProctoring(false);

      console.error(
        "Failed to activate assessment session:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to resume the assessment. Please try again."
      );

      return;
    }

    await enterAssessmentFullscreen();

    try {
      await proctoringRef.current.start(sessionId);

      console.log(
        "Proctoring connection established. Waiting for AI..."
      );
    } catch (err) {
      setStartingProctoring(false);

      console.error(
        "Failed to start proctoring:",
        err
      );

      setAssessmentActive(false);

      await exitAssessmentFullscreen();

      try {
        await pauseInitialQuiz(sessionId);
      } catch (pauseErr) {
        console.error(
          "Failed to restore paused state after a failed start:",
          pauseErr
        );
      }

      setError(
        err.message ||
          "Unable to start proctoring. The AI service may be starting up. Please wait a few seconds and try again."
      );
    }
  };

  // ----------------------------------------------------
  // Pause assessment and navigate
  // ----------------------------------------------------
  const handleExitAssessmentToDashboard =
    async () => {
      const currentSessionId =
        sessionIdRef.current;

      if (
        !currentSessionId ||
        pauseSentRef.current
      ) {
        navigate("/app/dashboard");
        return;
      }

      if (!assessmentActiveRef.current) {
        navigate("/app/dashboard");
        return;
      }

      try {
        pauseSentRef.current = true;

        console.log(
          "Pausing assessment before exit..."
        );

        await pauseInitialQuiz(
          currentSessionId
        );

        console.log(
          "Assessment paused successfully"
        );
      } catch (err) {
        console.error(
          "Failed to pause assessment before exit:",
          err
        );
      } finally {
        navigate("/app/dashboard");
      }
    };

  // ----------------------------------------------------
  // Assessment report
  // ----------------------------------------------------
  const handleSubmitAssessmentReport =
    async (e) => {
      e.preventDefault();

      if (!sessionId) {
        setReportError(
          "Assessment session not found."
        );
        return;
      }

      if (!reportReason.trim()) {
        setReportError(
          "Please provide a reason for reporting the termination."
        );
        return;
      }

      try {
        setReportSubmitting(true);
        setReportError("");

        const formData = new FormData();

        formData.append(
          "quiz_session_id",
          sessionId
        );

        formData.append(
          "assessment_type",
          "INITIAL"
        );

        formData.append(
          "reason",
          reportReason.trim()
        );

        if (reportEvidence.trim()) {
          formData.append(
            "additional_evidence",
            reportEvidence.trim()
          );
        }

        if (reportEvidenceFile) {
          formData.append(
            "evidence",
            reportEvidenceFile
          );
        }

        await submitAssessmentReport(formData);

        setReportSubmitted(true);
        setShowReportForm(false);
      } catch (err) {
        console.error(
          "Assessment report submission failed:",
          err.response?.data || err.message
        );

        setReportError(
          err.response?.data?.error ||
            "Failed to submit the assessment report."
        );
      } finally {
        setReportSubmitting(false);
      }
    };

  // ----------------------------------------------------
  // Timer countdown
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // Time expired
  // ----------------------------------------------------
  useEffect(() => {
    if (
      !assessmentActive ||
      remainingSeconds > 0
    ) {
      return;
    }

    console.warn(
      "Assessment time expired."
    );

    skipAutoPauseRef.current = true;

    setAssessmentActive(false);

    (async () => {
      await exitAssessmentFullscreen();

      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }

      setPage("expired");

      setError(
        "Your assessment time has expired."
      );
    })();
  }, [
    remainingSeconds,
    assessmentActive,
  ]);

  // ----------------------------------------------------
  // Fullscreen enforcement
  // ----------------------------------------------------
  useEffect(() => {
    if (
      page !== "quiz" ||
      !assessmentActive
    ) {
      return;
    }

    const handleFullscreenChange =
      async () => {
        if (
          document.fullscreenElement !== null
        ) {
          return;
        }

        if (!assessmentActiveRef.current) {
          return;
        }

        console.warn(
          "Fullscreen exited during initial quiz. Pausing assessment."
        );

        if (pauseSentRef.current) {
          return;
        }

        const currentSessionId =
          sessionIdRef.current;

        if (!currentSessionId) {
          setAssessmentActive(false);
          setPage("ready");
          setResumed(true);

          setError(
            "Assessment was interrupted because fullscreen mode was exited."
          );

          return;
        }

        try {
          pauseSentRef.current = true;

          await pauseInitialQuiz(
            currentSessionId
          );

          setAssessmentActive(false);
          setResumed(true);
          setPage("ready");

          setError(
            "Assessment was interrupted because fullscreen mode was exited. Click Resume to continue."
          );
        } catch (err) {
          console.error(
            "Failed to pause assessment after fullscreen exit:",
            err
          );

          setAssessmentActive(false);
          setResumed(true);
          setPage("ready");

          setError(
            err.response?.data?.error ||
              "Assessment was interrupted because fullscreen mode was exited."
          );
        } finally {
          pauseSentRef.current = false;
        }
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
  }, [
    page,
    assessmentActive,
  ]);

  // ----------------------------------------------------
  // Tab switch blocking overlay
  // ----------------------------------------------------
  useEffect(() => {
    if (!assessmentActive) return;

    const handleVisibilityChange =
      () => {
        if (document.hidden) {
          tabSwitchCountRef.current += 1;
          setTabSwitchAlert(true);
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [assessmentActive]);

  // ----------------------------------------------------
  // Heartbeat
  // ----------------------------------------------------
  useEffect(() => {
    if (
      !assessmentActive ||
      !sessionId
    ) {
      return;
    }

    const heartbeatTimer =
      setInterval(async () => {
        try {
          const response =
            await heartbeatInitialQuiz(
              sessionId
            );

          const data = response.data;

          if (
            typeof data.remaining_seconds ===
            "number"
          ) {
            setRemainingSeconds(
              data.remaining_seconds
            );
          }

          if (data.active === false) {
            skipAutoPauseRef.current =
              true;

            setAssessmentActive(false);

            await exitAssessmentFullscreen();

            if (proctoringRef.current) {
              proctoringRef.current.cleanup();
            }

            setPage("expired");

            setError(
              "Your assessment session is no longer active."
            );
          }
        } catch (err) {
          console.error(
            "Assessment heartbeat failed:",
            err
          );

          const status =
            err.response?.status;

          if (
            status === 409 ||
            status === 404 ||
            status === 403
          ) {
            skipAutoPauseRef.current =
              true;

            setAssessmentActive(false);

            await exitAssessmentFullscreen();

            if (proctoringRef.current) {
              proctoringRef.current.cleanup();
            }

            setPage("expired");

            setError(
              err.response?.data?.error ||
                "Your assessment session has ended."
            );
          }
        }
      }, 10000);

    return () =>
      clearInterval(heartbeatTimer);
  }, [
    assessmentActive,
    sessionId,
  ]);

  // ----------------------------------------------------
  // Pagehide fallback
  // ----------------------------------------------------
  useEffect(() => {
    const handlePageHide = () => {
      const currentSessionId =
        sessionIdRef.current;

      if (
        !currentSessionId ||
        !assessmentActiveRef.current ||
        skipAutoPauseRef.current ||
        pauseSentRef.current
      ) {
        return;
      }

      console.log(
        "Page hiding - attempting keepalive pause as fallback"
      );

      pauseSentRef.current = true;

      pauseInitialQuizOnUnload(
        currentSessionId
      );

      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }
    };

    window.addEventListener(
      "pagehide",
      handlePageHide
    );

    return () => {
      window.removeEventListener(
        "pagehide",
        handlePageHide
      );
    };
  }, []);

  // ----------------------------------------------------
  // React unmount cleanup
  // ----------------------------------------------------
  useEffect(() => {
    return () => {
      const currentSessionId =
        sessionIdRef.current;

      if (
        !currentSessionId ||
        !assessmentActiveRef.current ||
        skipAutoPauseRef.current ||
        pauseSentRef.current
      ) {
        return;
      }

      pauseSentRef.current = true;

      pauseInitialQuizOnUnload(
        currentSessionId
      );

      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }
    };
  }, []);

  // ----------------------------------------------------
  // Quiz complete
  // ----------------------------------------------------
  const handleQuizComplete =
    useCallback(async (result) => {
      console.log(
        "Initial quiz completed:",
        result
      );

      skipAutoPauseRef.current = true;

      setAssessmentActive(false);

      if (proctoringRef.current) {
        try {
          await proctoringRef.current.cleanup();
        } catch (cleanupError) {
          console.error(
            "Failed to clean up quiz proctoring before switching to coding assessment:",
            cleanupError
          );
        }
      }

      setPage("coding");
    }, []);

  // ----------------------------------------------------
  // Instructions Screen
  // ----------------------------------------------------
  if (page === "instructions") {
    const isCodingAssessment =
      isCodingStage;

    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
        {/* Ambient gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.08] shadow-2xl shadow-black/30 backdrop-blur-2xl">
            {/* Header */}
            <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 px-6 py-8 text-center sm:px-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-violet-500 to-blue-600 text-2xl text-white shadow-xl shadow-violet-900/30">
                {isCodingAssessment ? "Γîÿ" : "Γ£ª"}
              </div>

              <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                {isCodingAssessment
                  ? "Practical Evaluation"
                  : "Skill Evaluation"}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {isCodingAssessment
                  ? "Coding Assessment"
                  : "Initial Skill Assessment"}
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {isCodingAssessment
                  ? "Complete the coding assessment to evaluate your practical problem-solving skills."
                  : "Complete this assessment to personalize your learning path."}
              </p>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              {/* Overview */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="group rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-blue-500/10 p-5 shadow-lg shadow-violet-950/10 transition duration-300 hover:-translate-y-1 hover:border-violet-300/30">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
                    Γ£ª
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-200/80">
                    Assessment
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    Coding Assessment
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Practical evaluation
                  </p>
                </div>

                <div className="group rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-5 shadow-lg shadow-cyan-950/10 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200">
                    #
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200/80">
                    Questions
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {codingInfo?.question_count
                      ? `${codingInfo.question_count} Coding Problems`
                      : "Coding Problems"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Solve each problem carefully
                  </p>
                </div>

                <div className="group rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-5 shadow-lg shadow-blue-950/10 transition duration-300 hover:-translate-y-1 hover:border-blue-300/30">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-200">
                    &lt;/&gt;
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-200/80">
                    Format
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {codingInfo?.format ||
                      "Practical Coding"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Hands-on evaluation
                  </p>
                </div>
              </div>

              {/* What to Expect */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                    Γ£ô
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white">
                      What to expect
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Keep these points in mind before starting
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    "Solve coding problems using the provided coding environment.",
                    "Read each problem and its requirements carefully.",
                    "Manage your time across the available coding problems.",
                    "Your solutions will be evaluated as part of the assessment.",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.035] p-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-300">
                        Γ£ô
                      </span>

                      <p className="text-sm leading-6 text-slate-300">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Before Begin */}
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 font-bold text-amber-300">
                    !
                  </div>

                  <div>
                    <h2 className="font-bold text-amber-100">
                      Before you begin
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-amber-100/70">
                      Make sure you are ready to complete the coding assessment. The assessment rules you accepted earlier will continue to apply.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error + Button */}
              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-[1px] flex-1">
                  {error && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200 shadow-lg shadow-red-950/10">
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 font-bold text-red-300">
                          !
                        </span>

                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={loadAssessment}
                  disabled={loading}
                  className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-blue-950/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-900/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span>
                        {isCodingAssessment
                          ? "Starting Coding Assessment..."
                          : "Loading Assessment..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isCodingAssessment
                          ? "Start Coding Assessment"
                          : "Start Assessment"}
                      </span>

                      <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                        ΓåÆ
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Coding Assessment
  // ----------------------------------------------------
  if (page === "coding") {
    return (
      <InitialCodingAssessment
        sessionId={sessionId}
        proctoringWarning={
          proctoringWarning
        }
        onComplete={async (result) => {
          console.log(
            "Coding assessment completed:",
            result
          );

          await exitAssessmentFullscreen();

          setPage("completed");
        }}
      />
    );
  }

  // ----------------------------------------------------
  // Completed Screen
  // ----------------------------------------------------
  if (page === "completed") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
        </div>

        <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 text-4xl font-bold text-emerald-300 shadow-xl shadow-emerald-950/20">
            Γ£ô
          </div>

          <div className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Successfully Completed
          </div>

          <h1 className="text-3xl font-extrabold text-white md:text-4xl">
            Assessment Completed
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
            You have successfully completed your initial skill assessment.
          </p>

          <button
            onClick={() =>
              handleExitAssessmentToDashboard()
            }
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-950/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Go to Dashboard
            <span>ΓåÆ</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Terminated Screen
  // ----------------------------------------------------
  if (page === "terminated") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-red-400/15 bg-white/[0.08] p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-10">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-400/20 bg-gradient-to-br from-red-500/20 to-orange-500/10 text-4xl font-bold text-red-300">
              !
            </div>

            <div className="mb-3 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-300">
              Proctoring Action
            </div>

            <h1 className="text-3xl font-extrabold text-white">
              Assessment Terminated
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Your assessment was terminated because a proctoring violation was detected.
            </p>

            {reportSubmitted ? (
              <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-left">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 font-bold text-emerald-300">
                    Γ£ô
                  </div>

                  <div>
                    <p className="font-semibold text-emerald-200">
                      Report submitted successfully
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-100/70">
                      An administrator will review your assessment termination.
                    </p>
                  </div>
                </div>
              </div>
            ) : !showReportForm ? (
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportForm(true);
                    setReportError("");
                  }}
                  className="rounded-2xl border border-red-400/20 bg-red-500/15 px-6 py-3 font-semibold text-red-200 transition hover:bg-red-500/25"
                >
                  Report to Admin
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleExitAssessmentToDashboard()
                  }
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <form
                onSubmit={
                  handleSubmitAssessmentReport
                }
                className="mt-8 text-left"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-white">
                    Report Assessment Termination
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Explain why you believe the termination was incorrect.
                  </p>

                  <div className="mt-5">
                    <label className="block text-sm font-semibold text-slate-200">
                      Reason{" "}
                      <span className="text-red-400">
                        *
                      </span>
                    </label>

                    <textarea
                      value={reportReason}
                      onChange={(e) =>
                        setReportReason(
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Explain why you are reporting the termination..."
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
                      disabled={
                        reportSubmitting
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm font-semibold text-slate-200">
                      Additional Evidence / Explanation
                    </label>

                    <textarea
                      value={reportEvidence}
                      onChange={(e) =>
                        setReportEvidence(
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Provide any additional information that may help the administrator review your report..."
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
                      disabled={
                        reportSubmitting
                      }
                    />

                    <label className="mt-5 block text-sm font-semibold text-slate-200">
                      Supporting Evidence
                    </label>

                    <div className="mt-2 rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-4">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) =>
                          setReportEvidenceFile(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                        className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-violet-500/15 file:px-4 file:py-2 file:font-semibold file:text-violet-200 hover:file:bg-violet-500/25"
                        disabled={
                          reportSubmitting
                        }
                      />

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Upload PNG, JPG, JPEG, or PDF. Maximum size: 10 MB.
                      </p>
                    </div>
                  </div>

                  {reportError && (
                    <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm leading-6 text-red-200">
                      {reportError}
                    </div>
                  )}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReportForm(false);
                        setReportError("");
                      }}
                      disabled={
                        reportSubmitting
                      }
                      className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-2.5 font-medium text-slate-300 transition hover:bg-white/[0.1] disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        reportSubmitting
                      }
                      className="rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reportSubmitting
                        ? "Submitting..."
                        : "Submit Report"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Expired Screen
  // ----------------------------------------------------
  if (page === "expired") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-orange-400/15 bg-white/[0.08] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-400/20 bg-gradient-to-br from-orange-500/20 to-red-500/10 text-4xl font-bold text-orange-300">
            !
          </div>

          <div className="mb-3 inline-flex rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-300">
            Assessment Ended
          </div>

          <h1 className="text-3xl font-extrabold text-white md:text-4xl">
            Assessment Time Expired
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-300">
            {error ||
              "Your assessment time has expired."}
          </p>

          <button
            onClick={() =>
              handleExitAssessmentToDashboard()
            }
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3.5 font-semibold text-white shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Go to Dashboard
            <span>ΓåÆ</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Quiz screen
  // ----------------------------------------------------
  return (
    <>
      {/* Tab-switch blocking overlay */}
      {tabSwitchAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 px-4 backdrop-blur-xl">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-red-400/20 bg-white/[0.09] p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-3xl font-bold text-red-300">
              !
            </div>

            <div className="mb-2 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
              Proctoring Alert
            </div>

            <h2 className="text-xl font-bold text-white">
              Return to the Assessment
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              You switched away from the assessment tab or window. This has been recorded as a proctoring violation. Complete the test first ΓÇö you must stay on this tab until you finish.
            </p>

            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3">
              <p className="text-xs text-slate-400">
                Tab switches detected
              </p>

              <p className="mt-1 text-xl font-bold text-red-300">
                {tabSwitchCountRef.current}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setTabSwitchAlert(false)
              }
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-950/30 transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Return to Assessment
            </button>
          </div>
        </div>
      )}

      {/* Assessment Viewport */}
      <div className="h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        {/* Ambient background */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        {/* Camera */}
        <div className="fixed bottom-5 left-5 z-40 w-52 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl shadow-black/50">
          <div className="relative">
            <video
              id="cameraVideo"
              autoPlay
              muted
              playsInline
              className="aspect-video w-full object-cover"
            />

            <div className="absolute left-2 top-2 rounded-full border border-white/10 bg-black/50 px-2 py-1 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-[9px] font-bold uppercase tracking-wider text-white">
                  Live
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/60 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <span className="text-[10px] font-medium text-white/90">
                Camera & Mic active
              </span>
            </div>
          </div>
        </div>

        {page === "ready" ? (
          <div className="relative flex h-full items-center justify-center p-6">
            <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400" />

              <div className="p-8 text-center sm:p-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-2xl text-cyan-200">
                  {resumed ? "Γå╗" : "Γû╢"}
                </div>

                <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                  {resumed
                    ? "Session Resumption"
                    : "Ready to Begin"}
                </div>

                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                  {resumed
                    ? "Resume Skill Assessment"
                    : "Start Skill Assessment"}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {resumed
                    ? "Your previous progress has been saved. You will continue from the same question with the remaining time."
                    : "Your assessment is ready. Click below to enter full-screen mode and launch proctoring."}
                </p>

                {/* Assessment status */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Security
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      Proctored
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Mode
                    </p>

                    <p className="mt-1 text-sm font-semibold text-cyan-300">
                      Full Screen
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-left text-xs leading-6 text-red-200">
                    <div className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 font-bold text-red-300">
                        !
                      </span>

                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    handleStartAssessment
                  }
                  disabled={
                    startingProctoring
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-950/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {startingProctoring ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                      <span>
                        Connecting Proctoring AI... Please wait...
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {resumed
                          ? "Resume Skill Assessment"
                          : "Start Skill Assessment"}
                      </span>

                      <span className="text-lg">
                        ΓåÆ
                      </span>
                    </>
                  )}
                </button>

                <p className="mt-4 text-[11px] leading-5 text-slate-500">
                  Camera, microphone and fullscreen access are required while the assessment is active.
                </p>
              </div>
            </div>
          </div>
        ) : quizData ? (
          <InitialQuiz
            sessionId={sessionId}
            initialDomain={
              quizData.domain
            }
            initialSkill={
              quizData.skill
            }
            initialQuestion={
              quizData.question
            }
            initialAssessment={
              quizData.assessment
            }
            initialQuestionsAnswered={
              quizData.questionsAnswered
            }
            initialSkillQuestionsAnswered={
              quizData.skillQuestionsAnswered
            }
            remainingSeconds={
              remainingSeconds
            }
            assessmentActive={
              assessmentActive
            }
            proctoringWarning={
              proctoringWarning
            }
            tabSwitchAlert={
              tabSwitchAlert
            }
            onQuizComplete={
              handleQuizComplete
            }
            onError={(message) => {
              setError(message || "");
            }}
          />
        ) : (
          <div className="relative flex h-full items-center justify-center p-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-8 py-6 text-center backdrop-blur-xl">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />

              <p className="text-sm font-medium text-slate-300">
                No question available.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InitialAssessment;
