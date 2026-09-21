import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  startFinalQuiz,
  activateFinalQuiz,
  heartbeatFinalQuiz,
  pauseFinalQuiz,
  pauseFinalQuizOnUnload,
  submitAssessmentReport
} from "../../../services/api";
import ProctoringService from "../../../services/proctoringServices";
import FinalQuiz from "./FinalQuiz";
import { Button } from '../../../components/ui/Button';



const FinalAssessment = () => {
  // SESSION / ASSESSMENT STATE
  const [sessionId, setSessionId] = useState(null);
  const [quizData, setQuizData] = useState(null)
  const [assessmentState, setAssessmentState] = useState("loading");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const navigate = useNavigate();

  //report assessmnet termination
const [showReportForm, setShowReportForm] = useState(false);
const [reportReason, setReportReason] = useState("");
const [reportEvidence, setReportEvidence] = useState("");
const [reportSubmitting, setReportSubmitting] = useState(false);
const [reportSubmitted, setReportSubmitted] = useState(false);
const [reportError, setReportError] = useState("");



  // PROCTORING / CAMERA STATE
  const [proctoringError, setProctoringError] = useState(null);
  const [proctoringWarning, setProctoringWarning] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);


  // REFS
  const sessionIdRef = useRef(null);
  const assessmentActiveRef = useRef(false);
  const pauseSentRef = useRef(false);
  const heartbeatIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const proctoringRef = useRef(null);
  const tabSwitchCountRef = useRef(0);
  const intentionalFullscreenExitRef = useRef(false)

  // KEEP SESSION REF SYNCHRONIZED
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // PROCTORING CLEANUP
  const stopProctoring = useCallback(async () => {
    const proctoring = proctoringRef.current;

    if (!proctoring) {
      return;
    }

    proctoringRef.current = null;

    try {
      await proctoring.cleanup();
    } catch (error) {
      console.error(
        "Final proctoring cleanup failed:",
        error
      );
    }
  }, []);

  // FULLSCREEN EXIT
  const exitFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      return;
    }

    intentionalFullscreenExitRef.current = true;

    try {
      await document.exitFullscreen();
    } catch (error) {
      intentionalFullscreenExitRef.current = false;
      console.error("Failed to exit fullscreen:", error);
    }
  }, []);

  // CLEAR TIMERS
  const clearAssessmentTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // LOAD / RESUME FINAL ASSESSMENT
  useEffect(() => {
    let cancelled = false;

    const loadAssessment = async () => {
      try {
        setAssessmentState("loading");
        const response = await startFinalQuiz();
        if (cancelled) return;
        const data = response?.data || response;
        const overallAnswered = data.assessment?.overall_question
          ? Math.max(
              Number(data.assessment.overall_question) - 1,
              0
            )
          : 0;

        setQuizData({
          domain: data.domain,
          skill: data.skill,
          question: data.question,
          assessment: data.assessment,
          questionsAnswered: overallAnswered,
          skillQuestionsAnswered: overallAnswered % 10,
        });
        const session = data?.session_id;
        if (!session) {
          throw new Error("Final assessment session was not returned.");
        }

        sessionIdRef.current = session;
        setSessionId(session);
        const timer = data?.timer || {};
        setRemainingSeconds(Number(timer?.remaining_seconds || 0));
        setAssessmentState("ready");
      } catch (error) {
        console.error("Failed to start final assessment:", error);
        setProctoringError(
          error?.response?.data?.error ||
          error?.message ||
          "Unable to start the final assessment."
        );
        setAssessmentState("error");
      }
    };

    loadAssessment();
    return () => {
      cancelled = true;
    };
  }, []);

  const startAssessment = useCallback(async () => {
    if (!sessionIdRef.current) {
      console.error("Cannot activate final assessment without session.");
      return;
    }

    if (assessmentActiveRef.current) {
      return;
    }

    try {
      setProctoringError(null);
      setProctoringWarning(null);
      pauseSentRef.current = false;

      /*
      * ----------------------------------------------------------
      * 1. REFRESH FINAL ASSESSMENT STATE
      *
      * This is important for resume.
      *
      * FinalQuiz keeps the current question in its own local state.
      * When it is unmounted during a pause, that local state is lost.
      *
      * Reloading here gets the authoritative question from the
      * backend using quiz_sessions.current_question_id.
      * ----------------------------------------------------------
      */
      const assessmentResponse = await startFinalQuiz();

      const assessmentData =
        assessmentResponse?.data || assessmentResponse;

      if (!assessmentData?.session_id) {
        throw new Error(
          "Final assessment session was not returned."
        );
      }

      setQuizData({
        domain: assessmentData.domain,
        skill: assessmentData.skill,
        question: assessmentData.question,
        assessment: assessmentData.assessment,
        questionsAnswered: Math.max(
          Number(
            assessmentData.assessment?.overall_question ?? 1
          ) - 1,
          0
        ),
        skillQuestionsAnswered: Math.max(
          Number(
            assessmentData.assessment?.overall_question ?? 1
          ) - 1,
          0
        ) % 10,
      });

      /*
      * Keep the authoritative session ID.
      */
      sessionIdRef.current =
        assessmentData.session_id;

      setSessionId(
        assessmentData.session_id
      );

      /*
      * Update remaining time from the backend.
      */
      setRemainingSeconds(
        Number(
          assessmentData.timer?.remaining_seconds || 0
        )
      );

      /*
      * ----------------------------------------------------------
      * 2. ACTIVATE SERVER TIMER
      * ----------------------------------------------------------
      */
      const response = await activateFinalQuiz(
        sessionIdRef.current
      );

      const data =
        response?.data || response;

      setRemainingSeconds(
        Number(
          data?.remaining_seconds ??
          data?.timer?.remaining_seconds ??
          assessmentData.timer?.remaining_seconds ??
          0
        )
      );

      /*
      * ----------------------------------------------------------
      * 3. ENTER FULLSCREEN
      * ----------------------------------------------------------
      */
      try {
        await document.documentElement.requestFullscreen();
      } catch (fullscreenError) {
        console.error(
          "Fullscreen request failed:",
          fullscreenError
        );

        await pauseFinalQuiz(
          sessionIdRef.current
        );

        setProctoringError(
          "Fullscreen mode is required to continue."
        );

        return;
      }

      /*
      * ----------------------------------------------------------
      * 4. START PROCTORING
      * ----------------------------------------------------------
      */
      try {
        const proctoring =
          new ProctoringService({
            onConnected: () => {
              console.log(
                "Final proctoring connected."
              );
            },

            onStarted: () => {
              console.log(
                "Final proctoring started."
              );
            },

            onWarning: (warning) => {
              console.warn(
                "Final proctoring warning:",
                warning
              );

              setProctoringWarning(
                warning?.message ||
                  "Proctoring warning detected."
              );
            },

            onPause: () => {
              console.warn(
                "Final proctoring paused."
              );
            },

            onTerminate: () => {
              console.warn(
                "Final assessment terminated by proctoring."
              );

              assessmentActiveRef.current = false;

              clearAssessmentTimers();

              proctoringRef.current?.cleanup();
              proctoringRef.current = null;

              exitFullscreen();

              setAssessmentState(
                "terminated"
              );
            },

            onDisconnected: () => {
              console.warn(
                "Final proctoring disconnected."
              );
            },

            onError: (error) => {
              console.error(
                "Final proctoring error:",
                error
              );

              setProctoringError(
                "Proctoring service encountered an error."
              );
            },
          });

        proctoringRef.current =
          proctoring;

        await proctoring.start(
          sessionIdRef.current
        );
      } catch (proctoringErrorValue) {
        console.error(
          "Failed to start final proctoring:",
          proctoringErrorValue
        );

        await pauseFinalQuiz(
          sessionIdRef.current
        );

        proctoringRef.current?.cleanup();
        proctoringRef.current = null;

        await exitFullscreen();

        setProctoringError(
          "Unable to start proctoring. The assessment has been paused."
        );

        return;
      }

      /*
      * ----------------------------------------------------------
      * 5. ASSESSMENT IS NOW ACTIVE
      * ----------------------------------------------------------
      */
      assessmentActiveRef.current = true;

      setAssessmentState("quiz");

    } catch (error) {
      console.error(
        "Failed to activate final assessment:",
        error
      );

      assessmentActiveRef.current = false;

      setProctoringError(
        error?.response?.data?.error ||
          error?.message ||
          "Unable to start the assessment."
      );
    }
  }, [
    clearAssessmentTimers,
    exitFullscreen,
  ]);


  // CLIENT COUNTDOWN
  useEffect(() => {
    if (assessmentState !== "quiz" || !assessmentActiveRef.current) {
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearAssessmentTimers();
          assessmentActiveRef.current = false;
          setAssessmentState("expired");
          void stopProctoring();
          void exitFullscreen();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [assessmentState, clearAssessmentTimers, exitFullscreen, stopProctoring]);

  // SERVER HEARTBEAT
  useEffect(() => {
    if (assessmentState !== "quiz" || !sessionIdRef.current) {
      return;
    }

    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        const response = await heartbeatFinalQuiz(sessionIdRef.current);
        const data = response?.data || response;

        if (data?.active === false) {
          clearAssessmentTimers();
          assessmentActiveRef.current = false;

          if (data?.status === "Timed Out") {
            setAssessmentState("expired");
          } else {
            setAssessmentState("ready");
          }

          await stopProctoring();
          await exitFullscreen();
          return;
        }

        if (data?.remaining_seconds !== undefined) {
          setRemainingSeconds(Number(data.remaining_seconds));
        }
      } catch (error) {
        console.error("Final assessment heartbeat failed:", error);
      }
    }, 10000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [assessmentState, clearAssessmentTimers, exitFullscreen, stopProctoring]);

  // PAUSE ASSESSMENT
  const pauseAssessment = useCallback(async () => {
    if (!sessionIdRef.current || pauseSentRef.current) {
      return;
    }

    pauseSentRef.current = true;

    try {
      await pauseFinalQuiz(sessionIdRef.current);
      assessmentActiveRef.current = false;
      clearAssessmentTimers();
      await stopProctoring();
      await exitFullscreen();
      setAssessmentState("ready");
    } catch (error) {
      console.error("Failed to pause final assessment:", error);
      pauseSentRef.current = false;
    }
  }, [clearAssessmentTimers, exitFullscreen, stopProctoring]);

  // FULLSCREEN CHANGE
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const currentlyFullscreen = Boolean(document.fullscreenElement);

      // The application itself requested fullscreen exit.
      if (!currentlyFullscreen && intentionalFullscreenExitRef.current) {
        intentionalFullscreenExitRef.current = false;
        return;
      }

      // Student/browser exited fullscreen while the assessment
      // is actively running.
      if (assessmentActiveRef.current && !currentlyFullscreen) {
        await pauseAssessment();
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
  }, [pauseAssessment]);

  // TAB SWITCH DETECTION
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && assessmentActiveRef.current) {
        tabSwitchCountRef.current += 1;
        setTabSwitchCount(tabSwitchCountRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // PAGE UNLOAD
  useEffect(() => {
    const handlePageHide = () => {
      if (
        assessmentActiveRef.current &&
        sessionIdRef.current &&
        !pauseSentRef.current
      ) {
        pauseSentRef.current = true;
        pauseFinalQuizOnUnload(sessionIdRef.current);

        if (proctoringRef.current) {
          proctoringRef.current.cleanup();
        }
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  // UNMOUNT CLEANUP
  useEffect(() => {
    return () => {
      clearAssessmentTimers();

      if (
        assessmentActiveRef.current &&
        sessionIdRef.current &&
        !pauseSentRef.current
      ) {
        pauseSentRef.current = true;
        pauseFinalQuizOnUnload(sessionIdRef.current);
      }

      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }
    };
  }, [clearAssessmentTimers]);

  // FINAL QUIZ COMPLETED
  const handleQuizCompleted = useCallback(async () => {
    assessmentActiveRef.current = false;
    clearAssessmentTimers();

    await stopProctoring();

    setAssessmentState("completed");

    await exitFullscreen();
  }, [clearAssessmentTimers, exitFullscreen, stopProctoring]);

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  const cameraPreviewStyle = {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    width: "180px",
    height: "135px",
    objectFit: "cover",
    zIndex: 1000,
    opacity: assessmentState === "quiz" ? 1 : 0,
    pointerEvents: "none",
  };


  const handleSubmitAssessmentReport = async (e) => {
  e.preventDefault();

  if (!sessionId) {
    setReportError("Assessment session not found.");
    return;
  }

  if (!reportReason.trim()) {
    setReportError("Please provide a reason for reporting the termination.");
    return;
  }

  try {
    setReportSubmitting(true);
    setReportError("");

    await submitAssessmentReport({
      quiz_session_id: sessionId,
      assessment_type: "FINAL",
      reason: reportReason.trim(),
      evidence: reportEvidence.trim() || null,
    });

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

  return (
    <>
      {/* Persistent camera element.
          It must remain mounted for the entire assessment
          because ProctoringService attaches the camera stream
          before the quiz state is rendered. */}
      <video
        id="cameraVideo"
        autoPlay
        muted
        playsInline
        style={cameraPreviewStyle}
      />

      {assessmentState === "loading" && (
        <div className="assessment-loading">
          Loading final assessment...
        </div>
      )}

      {assessmentState === "error" && (
        <div className="assessment-error">
          <h2>Unable to start assessment</h2>

          <p>
            {proctoringError ||
              "Something went wrong while loading the final assessment."}
          </p>
        </div>
      )}

      {assessmentState === "expired" && (
        <div className="assessment-expired">
          <h2>Assessment Expired</h2>

          <p>
            Your 30-minute assessment time has expired.
          </p>
        </div>
      )}

      {assessmentState === "terminated" && (

    <div className="h-full flex items-center justify-center bg-[#111318] p-6">
      <div className="max-w-md w-full rounded-xl border border-red-500/20 bg-[#181b22] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          !
        </div>

        <h2 className="text-xl font-semibold text-white">
          Assessment Terminated
        </h2>

        <p className="mt-2.5 text-sm leading-6 text-slate-400">
          The assessment was terminated by the proctoring system.
        </p>

        {!reportSubmitted && !showReportForm && (
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowReportForm(true)}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Report to Admin
            </button>

            <button
              type="button"
              onClick={ () => navigate("/student/dashboard")}
              className="w-full rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {showReportForm && !reportSubmitted && (
          <form
            onSubmit={handleSubmitAssessmentReport}
            className="mt-6 text-left"
          >
            <label className="block text-xs font-medium text-slate-300">
              Reason
            </label>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Explain why you believe the assessment was terminated incorrectly..."
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-slate-600 bg-[#111318] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />

            <label className="mt-4 block text-xs font-medium text-slate-300">
              Additional Evidence / Explanation
            </label>

            <textarea
              value={reportEvidence}
              onChange={(e) => setReportEvidence(e.target.value)}
              placeholder="Provide any additional details that may help the admin review..."
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-slate-600 bg-[#111318] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />

            {reportError && (
              <p className="mt-3 text-xs text-red-400">
                {reportError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReportForm(false);
                  setReportError("");
                }}
                disabled={reportSubmitting}
                className="flex-1 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={reportSubmitting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {reportSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}

        {reportSubmitted && (
          <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-sm font-medium text-green-400">
              Report submitted successfully.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              An administrator can now review your assessment termination.
            </p>

            <button
              type="button"
              onClick={() => navigate("/student/dashboard")}
              className="mt-4 w-full rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-600"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
      )}

      {assessmentState === "completed" && (
        <div className="assessment-completed">
          <h2>Final Assessment Completed</h2>

          <p>
            Your assessment has been submitted successfully.
          </p>
        </div>
      )}

      {assessmentState === "ready" && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

            <h2 className="text-2xl font-bold text-slate-900">
              Final Assessment
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              You are about to begin your final proctored assessment.
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900">
                Before you begin
              </h3>

              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• The assessment is proctored.</li>
                <li>• Your camera and microphone may be required.</li>
                <li>• The assessment will run in fullscreen mode.</li>
                <li>• Do not switch tabs or leave the assessment window.</li>
                <li>• Make sure you have a stable internet connection.</li>
                <li>• Once started, the assessment timer will begin.</li>
              </ul>
            </div>

            <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-5">
              <h3 className="font-semibold text-slate-900">
                Assessment Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-slate-400">Duration</span>
                  <p className="font-medium text-slate-700">
                    30 minutes
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Type</span>
                  <p className="font-medium text-slate-700">
                    Final Quiz
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Proctoring</span>
                  <p className="font-medium text-slate-700">
                    Enabled
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick = {startAssessment}
              >
                Start Final Assessment
              </Button>
            </div>

          </div>
        </div>
      )}

      {assessmentState === "quiz" && (
        <div className="final-assessment-container">
          {proctoringWarning && (
            <div className="proctoring-warning">
              {proctoringWarning}
            </div>
          )}

          <FinalQuiz
            sessionId={sessionId}
            initialDomain={quizData?.domain}
            initialSkill={quizData?.skill}
            initialQuestion={quizData?.question}
            initialAssessment={quizData?.assessment}
            initialQuestionsAnswered={
              quizData?.questionsAnswered ?? 0
            }
            initialSkillQuestionsAnswered={
              quizData?.skillQuestionsAnswered ?? 0
            }
            remainingSeconds={remainingSeconds}
            tabSwitchCount={tabSwitchCount}
            onPause={pauseAssessment}
            onCompleted={handleQuizCompleted}
          />
        </div>
      )}
    </>
  );
};

export default FinalAssessment;