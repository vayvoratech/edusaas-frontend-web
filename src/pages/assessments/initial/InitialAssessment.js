import { useCallback, useEffect, useState, useRef } from "react";
import InitialQuiz from "./InitialQuiz";
import {
  startInitialQuiz,
  activateInitialQuiz,
  heartbeatInitialQuiz,
  pauseInitialQuiz,
  pauseInitialQuizOnUnload
} from "../../../services/api";

import ProctoringService from "../../../services/proctoringServices";
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


const InitialAssessment = () => {
  const navigate = useNavigate();
  const proctoringRef = useRef(null);

  const assessmentActiveRef = useRef(false)
  const sessionIdRef = useRef(null)
  const skipAutoPauseRef = useRef(false)
  const pauseSentRef = useRef(false)

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
          setPage("quiz")
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

          skipAutoPauseRef.current = true;

          setAssessmentActive(false);

          await exitAssessmentFullscreen();

          if (proctoringRef.current) {
            proctoringRef.current.cleanup();
          }

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
  const [error, setError] = useState("");
  const [proctoringWarning, setProctoringWarning] = useState(null);

  // ----------------------------------------------------
  // Tab-switch blocking overlay — purely client-side and instant,
  // so it doesn't depend on a round trip through the AI proctoring
  // websocket. ProctoringService still separately reports TAB_SWITCH
  // to the backend for violation-count escalation (warning/pause/
  // terminate); this overlay is just the immediate UX block.
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
    assessmentActiveRef.current = assessmentActive;
  }, [assessmentActive]);

  const [quizData, setQuizData] = useState(null)

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
      pauseSentRef.current = false; // CRITICAL: Reset so assessment can pause again if resumed

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
        skillQuestionsAnswered: overallAnswered % 10,
        });
      setResumed(Boolean(quiz.resumed));
      setRemainingSeconds(quiz.timer?.remaining_seconds ?? 0);

      setAssessmentActive(false);
      setPage("ready");
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
  // 2. Start fullscreen from the actual Start button
  // ----------------------------------------------------
  const handleStartAssessment = async () => {

    if (!sessionId) {
      setError("Assessment session not found.");
      return;
    }

    setError("");
    setProctoringWarning(null);

    /*
     * Activate the server-side timer FIRST, before fullscreen/camera.
     * This is the exact moment the exam clock starts (or resumes) —
     * not when the "Resume Assessment" screen was loaded, and not
     * after however long the camera permission dialog takes.
     *
     * It also must happen before proctoring connects, since the
     * proctoring gateway requires the session to already be
     * "In Progress" server-side.
     */
    let activatedRemaining = null;
    try {
      const activateResponse = await activateInitialQuiz(sessionId);
      activatedRemaining = activateResponse?.data?.remaining_seconds;

      if (typeof activatedRemaining === "number") {
        setRemainingSeconds(activatedRemaining);
      }
    } catch (err) {
      console.error("Failed to activate assessment session:", err);
      setError(
        err.response?.data?.error ||
          "Unable to resume the assessment. Please try again."
      );
      return;
    }

    await enterAssessmentFullscreen();

    try {
      await proctoringRef.current.start(sessionId);

      console.log("Proctoring connection established. Waiting for AI...");
    } catch (err) {
      console.error("Failed to start proctoring:", err);
      setAssessmentActive(false);

      await exitAssessmentFullscreen();

      // The timer is already running server-side at this point (we
      // just activated it above). If proctoring fails to connect
      // (camera permission denied, etc.), hand the time back instead
      // of silently burning it while the student retries.
      try {
        await pauseInitialQuiz(sessionId);
      } catch (pauseErr) {
        console.error(
          "Failed to restore paused state after a failed start:",
          pauseErr
        );
      }

      setError(
        err.message || // Keep existing error message logic
          "Unable to start proctoring. Please check your camera permission and try again."
      );
    }
  };

  // ----------------------------------------------------
  // Pause the assessment and navigate away
  // This is the PRIMARY pause mechanism for normal SPA navigation
  // (button clicks / in-app navigation). It awaits the pause request
  // before navigating so we don't race the unmount cleanup below.
  // ----------------------------------------------------
  const handleExitAssessmentToDashboard = async () => {
    const currentSessionId = sessionIdRef.current;

    if (!currentSessionId || pauseSentRef.current) {
      // Already paused or no session - just navigate
      navigate("/app/dashboard");
      return;
    }

    if (!assessmentActiveRef.current) {
      // Assessment not active - just navigate
      navigate("/app/dashboard");
      return;
    }

    try {
      pauseSentRef.current = true; // Prevent duplicate pause requests
      console.log("Pausing assessment before exit...");
      await pauseInitialQuiz(currentSessionId);
      console.log("Assessment paused successfully");
    } catch (err) {
      console.error("Failed to pause assessment before exit:", err);
    } finally {
      // Navigate regardless of pause success/failure
      navigate("/app/dashboard");
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

  // Time's up — act on it immediately client-side instead of waiting
  // for the next heartbeat or answer submission to come back 409.
  useEffect(() => {
    if (!assessmentActive || remainingSeconds > 0) return;

    console.warn("Assessment time expired.");
    skipAutoPauseRef.current = true; // time is genuinely over, nothing to pause
    setAssessmentActive(false);

    (async () => {
      await exitAssessmentFullscreen();

      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }

      setPage("expired");
      setError("Your assessment time has expired.");
    })();
  }, [remainingSeconds, assessmentActive]);

  // Enforce fullscreen while the assessment is active
  useEffect(() => {
    if (!assessmentActive) return;

    const handleFullscreenChange = async () => {
      if (document.fullscreenElement) return;

      if (!assessmentActiveRef.current) return;

      console.warn("Assessment exited fullscreen. Pausing assessment.");

      const currentSessionId = sessionIdRef.current;

      if (!currentSessionId || pauseSentRef.current) return;

      try {
        pauseSentRef.current = true;

        await pauseInitialQuiz(currentSessionId);

        setAssessmentActive(false);

        if (proctoringRef.current) {
          proctoringRef.current.cleanup();
        }

        // Keep the existing quiz page.
        // The Resume screen will appear because assessmentActive=false.
        setResumed(true);
        setError("");
      } catch (err) {
        console.error("Failed to pause assessment after fullscreen exit:", err);

        // Do not silently continue the assessment if the server did not
        // successfully save the paused state.
        setAssessmentActive(false);
        setError(
          err.response?.data?.error ||
          "Unable to pause the assessment. Please try again."
        );
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
  }, [assessmentActive]);

  // Tab-switch blocking overlay. Fires the instant the tab is hidden
  // (switched away from, minimized, etc.) — the overlay is then shown
  // on top of the quiz until the student explicitly acknowledges it,
  // blocking further interaction in the meantime. The exam clock
  // deliberately keeps running through this — pausing it would let
  // students "stop the clock" by tab-switching, which defeats the
  // point of a timed test.
  useEffect(() => {
    if (!assessmentActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        setTabSwitchAlert(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
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

        // Session was flipped away from "In Progress" by something
        // else server-side (e.g. proctoring auto-terminated it).
        // Stop the client instead of leaving it ticking uselessly.
        if (data.active === false) {
          skipAutoPauseRef.current = true;
          setAssessmentActive(false);
          await exitAssessmentFullscreen();
          if (proctoringRef.current) proctoringRef.current.cleanup();
          setPage("expired");
          setError("Your assessment session is no longer active.");
        }
      } catch (err) {
        console.error("Assessment heartbeat failed:", err);

        const status = err.response?.status;

        // The server is authoritative on time. If it says the session
        // has expired or is gone, stop immediately instead of leaving
        // the student stuck on a clock that can no longer submit.
        if (status === 409 || status === 404 || status === 403) {
          skipAutoPauseRef.current = true;
          setAssessmentActive(false);
          await exitAssessmentFullscreen();
          if (proctoringRef.current) proctoringRef.current.cleanup();
          setPage("expired");
          setError(
            err.response?.data?.error || "Your assessment session has ended."
          );
        }
      }
    }, 10000);

    return () => clearInterval(heartbeatTimer);
  }, [assessmentActive, sessionId]);

  // Pagehide fallback: Use keepalive for browser refresh/tab close only.
  // Normal SPA navigation should use handleExitAssessmentToDashboard() instead,
  // since that can properly await the pause request before navigating.
  useEffect(() => {
    const handlePageHide = () => {
      const currentSessionId = sessionIdRef.current;

      if (
        !currentSessionId ||
        !assessmentActiveRef.current ||
        skipAutoPauseRef.current ||
        pauseSentRef.current
      ) {
        return;
      }

      // Only use keepalive fetch for unload (browser refresh/tab close).
      // This is a best-effort fallback and may not complete.
      console.log("Page hiding - attempting keepalive pause as fallback");
      pauseSentRef.current = true
      pauseInitialQuizOnUnload(currentSessionId);


      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  // React unmount cleanup - fallback only.
  // NOTE: this should NOT be relied upon as the primary pause mechanism,
  // because we cannot reliably wait for an async API call during unmount.
  // Uses the keepalive-based request for the same reason as the pagehide
  // handler above.
  useEffect(() => {
    return () => {
      const currentSessionId = sessionIdRef.current;

      if (
        !currentSessionId ||
        !assessmentActiveRef.current ||
        skipAutoPauseRef.current ||
        pauseSentRef.current
      ) {
        return;
      }
      pauseSentRef.current = true
      pauseInitialQuizOnUnload(currentSessionId);

      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }
    };
  }, []);


  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      // Immediately stop the temporary permission stream.
      stream.getTracks().forEach((track) => track.stop());

      setError("");
      return true;
    } catch (err) {
      console.error("Camera permission denied:", err);

      setError(
        "Camera permission is required to continue the assessment."
      );

      return false;
    }
  };
  
  const handleQuizComplete = useCallback((result) => {
    console.log("Initial quiz completed:", result);

    skipAutoPauseRef.current = true;
    setAssessmentActive(false);

    // For now, stop at quiz completion.
    // Coding assessment will be connected here next.
    setPage("completed");
    }, []);
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
            {error && (
              <p className="mb-4 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={ async () => {
                const cameraGranted = await requestCameraPermission();
                if(!cameraGranted){
                  return
                }
                await loadAssessment()
              }}
              disabled={loading}
              className="w-full rounded-full bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-50"
            >
              {loading ? "Loading Assessment..." : "Load Assessment"}
            </button>
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
            onClick={() => handleExitAssessmentToDashboard()}
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
            onClick={() => handleExitAssessmentToDashboard()}
            className="mt-8 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Expired Screen
  if (page === "expired") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            !
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Time Expired
          </h1>

          <p className="mt-4 text-gray-600">
            {error || "Your assessment time has expired."}
          </p>

          <button
            onClick={() => handleExitAssessmentToDashboard()}
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
      {/* Tab-switch blocking overlay */}
      {tabSwitchAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Return to the Assessment
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              You switched away from the assessment tab or window. This has
              been recorded as a proctoring violation. Complete the test
              first — you must stay on this tab until you finish.
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Tab switches detected: {tabSwitchCountRef.current}
            </p>

            <button
              type="button"
              onClick={() => setTabSwitchAlert(false)}
              className="mt-6 w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Return to Assessment
            </button>
          </div>
        </div>
      )}

      {/* 4. Assessment Viewport (non-scrolling) */}
      <div className="h-[calc(100vh-80px)] overflow-hidden bg-[#f5f7f6]">
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

        {page === "ready" ? (
            <div className="h-full flex items-center justify-center p-6">

            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">

                <h2 className="text-2xl font-bold text-slate-900">
                {resumed
                    ? "Resume Skill Assessment"
                    : "Start Skill Assessment"}
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
                {resumed
                    ? "Resume Skill Assessment"
                    : "Start Skill Assessment"}
                </button>

            </div>
            </div>

        ) : quizData ? (

            <InitialQuiz
            sessionId={sessionId}

            initialDomain={quizData.domain}
            initialSkill={quizData.skill}
            initialQuestion={quizData.question}
            initialAssessment={quizData.assessment}
            initialQuestionsAnswered={
                quizData.questionsAnswered
            }
            initialSkillQuestionsAnswered={
                quizData.skillQuestionsAnswered
            }

            remainingSeconds={remainingSeconds}
            assessmentActive={assessmentActive}
            proctoringWarning={proctoringWarning}
            tabSwitchAlert={tabSwitchAlert}

            onQuizComplete={handleQuizComplete}

            onError={(message) => {
                setError(message || "");
            }}
            />

        ) : (
            <div className="h-full flex items-center justify-center p-6">
            <p className="text-slate-500">
                No question available.
            </p>
            </div>
        )}

        </div>
    </>
  );
};

export default InitialAssessment;