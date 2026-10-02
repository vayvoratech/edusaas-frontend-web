import { useCallback, useEffect, useState, useRef } from "react";
import InitialQuiz from "./InitialQuiz";
import InitialCodingAssessment from "./InitialCodingAssessment";
import {
  startInitialQuiz,
  activateInitialQuiz,
  heartbeatInitialQuiz,
  pauseInitialQuiz,
  pauseInitialQuizOnUnload,
  getMyAssessmentReports,
  getAssessmentOverview

} from "../../../services/api";

import ProctoringService from "../../../services/proctoringServices";
import { useLocation, useNavigate } from "react-router-dom";
import { getInitialCodingAssessmentInfo } from "../../../services/api";
import AssessmentTerminationReport from "../../../components/AssessmentTerminationReport";


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
//  Answer cards component
// ----------------------------------------------------


const InitialAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();

const isCodingStage = location.state?.phase === "coding";
const isRestartApproved = location.state?.restartApproved === true;

  const proctoringRef = useRef(null);

  // Hide the normal application shell while the assessment is active.
  useEffect(() => {
    document.body.classList.add("assessment-mode");

    return () => {
      document.body.classList.remove("assessment-mode");
    };
  }, []);

  const assessmentActiveRef = useRef(false)
  const sessionIdRef = useRef(null)
  const skipAutoPauseRef = useRef(false)
  const pauseSentRef = useRef(false)
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

  assessmentActiveRef.current = true;
  setAssessmentActive(true);

  setPage("quiz");
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

          setLastProctoringViolation({
  violationType: fraud.violation_type,
  message: fraud.message,
  violationCount: fraud.violation_count,
  action: fraud.action,
});
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

  assessmentTerminatedRef.current = true;
  skipAutoPauseRef.current = true;

  assessmentActiveRef.current = false;
setAssessmentActive(false);

setLastProctoringViolation({
    violationType: data?.violation_type || "PROCTORING",
    message:
      data?.reason ||
      data?.message ||
      "The assessment was terminated.",
    violationCount: data?.violation_count ?? 2,
    action: "TERMINATE_EXAM",
  });

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
  const [startingProctoring, setStartingProctoring] = useState(false);
  const [proctoringWarning, setProctoringWarning] = useState(null);
  const [lastProctoringViolation, setLastProctoringViolation] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [, setReportError] = useState("");
  const [terminationReport, setTerminationReport] = useState(null);
  const [, setAssessmentStatusLoading] =
  useState(true);



  const [codingInfo, setCodingInfo] = useState(null);

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
  let cancelled = false;

  const loadTerminationStatus = async () => {
    try {
      const [overview, reports] = await Promise.all([
        getAssessmentOverview(),
        getMyAssessmentReports(),
      ]);

      if (cancelled) return;

      const currentSessionId = isCodingStage
  ? overview?.codingAssessment?.sessionId
  : overview?.initialAssessment?.sessionId;

const currentStatus = isCodingStage
  ? overview?.codingAssessment?.status
  : overview?.initialAssessment?.status;

const currentReportStage = isCodingStage
  ? "INITIAL_CODING"
  : "INITIAL_QUIZ";

const reportsList = Array.isArray(reports)
  ? reports
  : [];

const currentReport =
  reportsList.find(
    (report) =>
      Number(report.quiz_session_id) ===
        Number(currentSessionId) &&
      report.assessment_stage === currentReportStage
  ) || null;

      // Keep the current session ID available for
      // termination reporting / restart flow.
      if (currentSessionId) {
        setSessionId(currentSessionId);
      }

      setTerminationReport(currentReport);

      if (currentReport) {
        setReportSubmitted(true);
      }

      /*
       * TERMINATED SESSION
       *
       * The old session must remain visible until the
       * student has dealt with the termination report.
       */
      if (
  currentStatus === "Terminated" &&
  !isRestartApproved
) {
  setShowReportForm(false);
  setPage("terminated");
  return;
}

      /*
       * NORMAL INITIAL ASSESSMENT
       *
       * There is no terminated session, so show the
       * normal instructions/start screen.
       */
      setPage("instructions");
    } catch (err) {
      console.error(
        "Failed to load assessment status:",
        err.response?.data || err.message
      );

      // If status checking itself fails, don't leave the
      // student permanently stuck on the checking screen.
      setError(
        err.response?.data?.error ||
          "Failed to check assessment status. Please try again."
      );

      setPage("instructions");
    } finally {
      if (!cancelled) {
        setAssessmentStatusLoading(false);
      }
    }
  };

  loadTerminationStatus();

  return () => {
    cancelled = true;
  };
}, [isRestartApproved, isCodingStage]);

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
      console.error("Failed to load coding assessment info:", error);
    }
  };

  loadCodingInfo();
}, [page]);


  useEffect(() => {
    assessmentActiveRef.current = assessmentActive;
  }, [assessmentActive]);

  const [quizData, setQuizData] = useState(null)

  // Load Assessment configuration
  const loadAssessment = async () => {
    if (loadingAssessmentRef.current) {
      return;
    }
    loadingAssessmentRef.current = true;
    try {
      setLoading(true);
      setError("");

      // Request browser permission for both Camera and Microphone upfront
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(
          "Your browser does not support camera and microphone access. Please use Chrome, Edge, or Firefox."
        );
        return;
      }

      let testStream = null;
      try {
        testStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (mediaErr) {
        console.error("Camera and Microphone permission denied:", mediaErr);
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
            `Camera and microphone access error: ${mediaErr.message || "Permission not granted"}.`
          );
        }
        return;
      } finally {
        if (testStream) {
          testStream.getTracks().forEach((track) => track.stop());
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
  console.log("SETTING CODING QUIZ DATA:", quiz);


  setAssessmentActive(false);
  console.log("CODING QUIZ DATA BEFORE PAGE:", quiz);
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

  const errorCode = err.response?.data?.code;
  const errorMessage = err.response?.data?.error || "";

  if (
    errorCode === "ASSESSMENT_TERMINATED" ||
    errorMessage.toLowerCase().includes("assessment has been terminated")
  ) {
    setAssessmentActive(false);

    setError(
      errorMessage ||
        "This assessment has been terminated. Please report the issue to Admin before restarting."
    );

    setPage("terminated");

    return;
  }

  if (
  errorCode === "ASSESSMENT_TIME_EXPIRED" ||
  errorMessage.toLowerCase().includes("assessment has already expired")
) {
  setAssessmentActive(false);

  setError(
    errorMessage || "This assessment has already expired."
  );

  return;
}

  setError(
    errorMessage || "Failed to start the initial assessment."
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

    setStartingProctoring(true);
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
      console.log("RESUME STEP 1: Activating assessment...");
      const activateResponse = await activateInitialQuiz(sessionId);
      console.log("RESUME STEP 2: Assessment activated:", activateResponse);
      activatedRemaining = activateResponse?.data?.remaining_seconds;

      if (typeof activatedRemaining === "number") {
        setRemainingSeconds(activatedRemaining);
      }
    } catch (err) {
      setStartingProctoring(false);
      console.error("Failed to activate assessment session:", err);
      setError(
        err.response?.data?.error ||
        "Unable to resume the assessment. Please try again."
      );
      return;
    }

    await enterAssessmentFullscreen();

    try {
      console.log("RESUME STEP 3: Starting proctoring...");
      await proctoringRef.current.start(sessionId);
      console.log("RESUME STEP 4: Proctoring start returned.");

      console.log("Proctoring connection established. Waiting for AI...");
    } catch (err) {
      setStartingProctoring(false);
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
        "Unable to start proctoring. The AI service may be starting up. Please wait a few seconds and try again."
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

  // ----------------------------------------------------
  // Fullscreen enforcement
  // If the student exits fullscreen while the quiz is active,
  // pause the quiz and return to the resume screen.
  // ----------------------------------------------------
  useEffect(() => {
    if (page !== "quiz" || !assessmentActive) return;

    const handleFullscreenChange = async () => {
      // Still in fullscreen — nothing to do.
     if (document.fullscreenElement !== null) {
  return;
}

if (assessmentTerminatedRef.current) {
  return;
}

if (skipAutoPauseRef.current) {
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

      const currentSessionId = sessionIdRef.current;

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

        await pauseInitialQuiz(currentSessionId);

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

        // Even if the pause request fails, stop the local assessment.
     if (err.response?.status === 409) {
  assessmentTerminatedRef.current = true;
  skipAutoPauseRef.current = true;

  setAssessmentActive(false);
  setPage("terminated");

  return;
}

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
  }, [page, assessmentActive]);
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
         assessmentTerminatedRef.current ||
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
        assessmentTerminatedRef.current ||
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

  const handleQuizComplete = useCallback(async (result) => {
    console.log("Initial quiz completed:", result);

    skipAutoPauseRef.current = true;
    setAssessmentActive(false);

    // Release the quiz's proctoring connection FIRST. The backend keys
    // active proctoring sessions by session_id alone, and the coding
    // assessment reuses this same session_id - so the quiz's socket
    // must be fully closed before the coding assessment tries to open
    // its own, or the backend will reject it as already active.
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

    // Quiz is complete.
    // Move to the coding assessment using the same session ID.

    setPage("coding");
  }, []);

  // Checking existing assessment status
if (page === "checking") {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />

        <h2 className="text-xl font-semibold text-gray-900">
          Checking Assessment Status
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Please wait while we check your previous assessment status.
        </p>
      </div>
    </div>
  );
}

 // Instructions Screen
if (page === "instructions") {

  const isCodingAssessment = isCodingStage;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 md:p-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {isCodingAssessment
              ? "Initial Assessment — Stage 2: Coding Assessment"
              : "Initial Assessment — Stage 1: Initial Quiz"}
          </h1>

          <p className="mt-3 text-gray-500">
            {isCodingAssessment
              ? "Complete the coding assessment to evaluate your practical problem-solving skills."
              : "Complete the initial quiz to evaluate your knowledge and skills."}
          </p>
        </div>

        {/* =========================================================
            CODING ASSESSMENT INSTRUCTIONS
           ========================================================= */}
        {isCodingAssessment ? (
          <>
            {/* Coding Assessment Overview */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Assessment */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm text-slate-500">Assessment</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  Coding Assessment
                </p>
              </div>

              {/* Questions */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Questions</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {codingInfo?.question_count
                    ? `${codingInfo.question_count} Coding Problems`
                    : "Coding Problems"}
                </p>
              </div>

              {/* Format */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Format</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {codingInfo?.format || "Practical Coding"}
                </p>
              </div>
            </div>

            {/* What to Expect */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-semibold text-slate-900">
                What to expect
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <div className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm leading-6 text-slate-600">
                    Solve coding problems using the provided coding environment.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm leading-6 text-slate-600">
                    Read each problem and its requirements carefully.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm leading-6 text-slate-600">
                    Manage your time across the available coding problems.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm leading-6 text-slate-600">
                    Your solutions will be evaluated as part of the assessment.
                  </p>
                </div>

              </div>
            </div>

            {/* Before You Begin */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <span className="font-bold text-amber-600">!</span>

                <div>
                  <h2 className="font-semibold text-amber-900">
                    Before you begin
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Make sure you are ready to complete the coding assessment.
                    The assessment rules you accepted earlier will continue to apply.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* =========================================================
             INITIAL QUIZ INSTRUCTIONS
             ========================================================= */
          <>
            {/* Initial Quiz Overview */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Assessment */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm text-slate-500">Assessment</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  Initial Quiz
                </p>
              </div>

              {/* Stage */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Stage</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  Stage 1
                </p>
              </div>

              {/* Format */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Format</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  Multiple Choice Quiz
                </p>
              </div>
            </div>

            {/* What to Expect */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-semibold text-slate-900">
                What to expect
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <div className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm leading-6 text-slate-600">
                    Answer the questions based on your knowledge and skills.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm leading-6 text-slate-600">
                    Read each question and all available options carefully.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm leading-6 text-slate-600">
                    Manage your time while completing the quiz.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm leading-6 text-slate-600">
                    Your responses will be evaluated as part of the assessment.
                  </p>
                </div>

              </div>
            </div>

            {/* Before You Begin */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <span className="font-bold text-amber-600">!</span>

                <div>
                  <h2 className="font-semibold text-amber-900">
                    Before you begin
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Make sure you are ready to complete the initial quiz.
                    The assessment rules you accepted earlier will continue to apply.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =========================================================
            START BUTTON
           ========================================================= */}
        <div className="mt-8 flex justify-end">

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
  if (isCodingAssessment) {
    setPage("coding");
    return;
  }

  loadAssessment();
}}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? isCodingAssessment
                ? "Starting Coding Assessment..."
                : "Loading Assessment..."
              : isCodingAssessment
              ? "Start Coding Assessment →"
              : "Start Assessment"}
          </button>

        </div>
      </div>
    </div>
  );
}

// Coding Assessment
if (page === "coding") {
  return (
    <InitialCodingAssessment
      sessionId={sessionId}
      proctoringWarning={proctoringWarning}
      onComplete={async (result) => {
        console.log("Coding assessment completed:", result);

        await exitAssessmentFullscreen();
        setPage("completed");
      }}
    />
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

  // Admin approved the termination report
  if (terminationReport?.status === "Approved") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <div className="text-center">

            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ✓
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Assessment Restart Approved
            </h1>

            <p className="mt-4 text-gray-600">
              Admin has approved your assessment termination report.
            </p>

            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-left">
              <p className="text-sm font-semibold text-green-800">
  {terminationReport?.assessment_stage === "INITIAL_CODING"
    ? "You can now restart your Coding Assessment."
    : "You can now restart your Initial Quiz."}
</p>

             <p className="mt-2 text-sm text-green-700">
  {terminationReport?.assessment_stage === "INITIAL_CODING"
    ? "Your coding assessment termination report was approved by Admin."
    : "Your initial quiz termination report was approved by Admin."}
</p>
            </div>

            <button
              type="button"
              onClick={() => {
                const stage = terminationReport?.assessment_stage;

                // Old terminated session must not be reused
                setSessionId(null);

                setReportSubmitted(false);
                setShowReportForm(false);
                setTerminationReport(null);

                if (stage === "INITIAL_CODING") {
                  navigate("/app/initial-assessment", {
                    state: {
                      phase: "coding",
                    },
                  });
                  return;
                }

                // INITIAL_QUIZ
                navigate("/app/initial-assessment", {
                  state: {
                    phase: "quiz",
                  },
                });
              }}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Restart Assessment →
            </button>

          </div>
        </div>
      </div>
    );
  }

  // Normal terminated state
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 md:p-10">

        <div className="text-center">

          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            !
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Terminated
          </h1>

          <p className="mt-4 text-gray-600">
            Your assessment was terminated because a proctoring violation was
            detected.
          </p>

          {reportSubmitted ? (
  <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-left">
    <p className="text-sm font-semibold text-yellow-800">
      Report Status: {terminationReport?.status || "Pending"}
    </p>

    <p className="mt-2 text-sm text-yellow-700">
      Your termination report has been submitted and is waiting for Admin
      review.
    </p>
  </div>
) : !showReportForm ? (
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">

              <button
                type="button"
                onClick={() => {
                  setShowReportForm(true);
                  setReportError("");
                }}
                className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Report to Admin
              </button>

              <button
                type="button"
                onClick={() => handleExitAssessmentToDashboard()}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>

            </div>
          ) : (
            <AssessmentTerminationReport
              sessionId={sessionId}
              assessmentType={isCodingStage ? "CODING" : "INITIAL"}
              assessmentStage={
                isCodingStage
                  ? "INITIAL_CODING"
                  : "INITIAL_QUIZ"
              }
              onCancel={() => {
                setShowReportForm(false);
              }}
             onSubmitted={(report) => {
  setReportSubmitted(true);
  setTerminationReport(report);
  setShowReportForm(false);
}}
            />
          )}

        </div>
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

    {/* Assessment Viewport */}
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
              Camera & Mic active
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

            {resumed && lastProctoringViolation && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">

                <p className="text-sm font-semibold text-amber-900">
                  Proctoring Violation{" "}
                  {lastProctoringViolation.violationCount} of 2
                </p>

                <p className="mt-1 text-sm text-amber-800">
                  {lastProctoringViolation.message}
                </p>

                {lastProctoringViolation.violationCount === 1 && (
                  <p className="mt-2 text-xs text-amber-700">
                    This is your first accepted violation. One more accepted
                    proctoring violation will terminate the assessment.
                  </p>
                )}

              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleStartAssessment}
              disabled={startingProctoring}
              className="mt-6 w-full rounded-full bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {startingProctoring ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  <span>Connecting Proctoring AI... Please wait...</span>
                </>
              ) : resumed ? (
                "Resume Skill Assessment"
              ) : (
                "Start Skill Assessment"
              )}
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
