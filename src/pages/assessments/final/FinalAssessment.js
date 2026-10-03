import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  startFinalQuiz,
  activateFinalQuiz,
  heartbeatFinalQuiz,
  pauseFinalQuiz,
  pauseFinalQuizOnUnload,
    submitAssessmentReport,
    getMyAssessmentReports
} from "../../../services/api";
import ProctoringService from "../../../services/proctoringServices";
import FinalQuiz from "./FinalQuiz";
import { Button } from "../../../components/ui/Button";

const FinalAssessment = () => {
  // SESSION / ASSESSMENT STATE
  const [sessionId, setSessionId] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [assessmentState, setAssessmentState] = useState("loading");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const navigate = useNavigate();

  // REPORT ASSESSMENT TERMINATION
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [, setTerminationReport] = useState(null);
  const [reportEvidence, setReportEvidence] = useState("");
  const [reportEvidenceFile, setReportEvidenceFile] = useState(null);
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
  const intentionalFullscreenExitRef = useRef(false);

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
          throw new Error(
            "Final assessment session was not returned."
          );
        }

        sessionIdRef.current = session;
        setSessionId(session);

        const timer = data?.timer || {};

        setRemainingSeconds(
          Number(timer?.remaining_seconds || 0)
        );

        setAssessmentState("ready");
      } catch (error) {
        console.error(
          "Failed to start final assessment:",
          error
        );

        if (
  error?.response?.status === 409 &&
  error?.response?.data?.code === "ASSESSMENT_TERMINATED"
) {
  try {
    const reports = await getMyAssessmentReports();

    const reportList = Array.isArray(reports)
      ? reports
      : reports?.reports || [];

    const terminatedReport = reportList.find(
      (report) =>
        String(report.assessment_stage).toUpperCase() ===
        "FINAL_QUIZ"
    );

    setTerminationReport(
      terminatedReport || null
    );

    setAssessmentState("terminated");
    setShowReportForm(false);

    return;
  } catch (reportError) {
    console.error(
      "Failed to load assessment termination report:",
      reportError
    );
  }
}

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

  // START ASSESSMENT
  const startAssessment = useCallback(async () => {
    if (!sessionIdRef.current) {
      console.error(
        "Cannot activate final assessment without session."
      );
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
        skillQuestionsAnswered:
          Math.max(
            Number(
              assessmentData.assessment?.overall_question ?? 1
            ) - 1,
            0
          ) % 10,
      });

      sessionIdRef.current =
        assessmentData.session_id;

      setSessionId(
        assessmentData.session_id
      );

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
    if (
      assessmentState !== "quiz" ||
      !assessmentActiveRef.current
    ) {
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
  }, [
    assessmentState,
    clearAssessmentTimers,
    exitFullscreen,
    stopProctoring,
  ]);

  // SERVER HEARTBEAT
  useEffect(() => {
    if (
      assessmentState !== "quiz" ||
      !sessionIdRef.current
    ) {
      return;
    }

    heartbeatIntervalRef.current = setInterval(
      async () => {
        try {
          const response =
            await heartbeatFinalQuiz(
              sessionIdRef.current
            );

          const data =
            response?.data || response;

          if (data?.active === false) {
            clearAssessmentTimers();

            assessmentActiveRef.current = false;

            if (
              data?.status === "Timed Out"
            ) {
              setAssessmentState("expired");
            } else {
              setAssessmentState("ready");
            }

            await stopProctoring();
            await exitFullscreen();

            return;
          }

          if (
            data?.remaining_seconds !==
            undefined
          ) {
            setRemainingSeconds(
              Number(data.remaining_seconds)
            );
          }
        } catch (error) {
          console.error(
            "Final assessment heartbeat failed:",
            error
          );
        }
      },
      10000
    );

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(
          heartbeatIntervalRef.current
        );

        heartbeatIntervalRef.current = null;
      }
    };
  }, [
    assessmentState,
    clearAssessmentTimers,
    exitFullscreen,
    stopProctoring,
  ]);

  // PAUSE ASSESSMENT
  const pauseAssessment = useCallback(
    async () => {
      if (
        !sessionIdRef.current ||
        pauseSentRef.current
      ) {
        return;
      }

      pauseSentRef.current = true;

      try {
        await pauseFinalQuiz(
          sessionIdRef.current
        );

        assessmentActiveRef.current = false;

        clearAssessmentTimers();

        await stopProctoring();

        await exitFullscreen();

        setAssessmentState("ready");
      } catch (error) {
        console.error(
          "Failed to pause final assessment:",
          error
        );

        pauseSentRef.current = false;
      }
    },
    [
      clearAssessmentTimers,
      exitFullscreen,
      stopProctoring,
    ]
  );

  // FULLSCREEN CHANGE
  useEffect(() => {
    const handleFullscreenChange =
      async () => {
        const currentlyFullscreen =
          Boolean(
            document.fullscreenElement
          );

        if (
          !currentlyFullscreen &&
          intentionalFullscreenExitRef.current
        ) {
          intentionalFullscreenExitRef.current =
            false;

          return;
        }

        if (
          assessmentActiveRef.current &&
          !currentlyFullscreen
        ) {
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
    const handleVisibilityChange =
      () => {
        if (
          document.hidden &&
          assessmentActiveRef.current
        ) {
          tabSwitchCountRef.current += 1;

          setTabSwitchCount(
            tabSwitchCountRef.current
          );
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

        pauseFinalQuizOnUnload(
          sessionIdRef.current
        );

        if (proctoringRef.current) {
          proctoringRef.current.cleanup();
        }
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

        pauseFinalQuizOnUnload(
          sessionIdRef.current
        );
      }

      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
      }
    };
  }, [clearAssessmentTimers]);

  // FINAL QUIZ COMPLETED
  const handleQuizCompleted =
    useCallback(async () => {
      assessmentActiveRef.current = false;

      clearAssessmentTimers();

      await stopProctoring();

      setAssessmentState("completed");

      await exitFullscreen();
    }, [
      clearAssessmentTimers,
      exitFullscreen,
      stopProctoring,
    ]);

  // CAMERA PREVIEW
  const cameraPreviewStyle = {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    width: "180px",
    height: "135px",
    objectFit: "cover",
    zIndex: 1000,
    opacity:
      assessmentState === "quiz" ? 1 : 0,
    pointerEvents: "none",
    borderRadius: "16px",
    border:
      "1px solid rgba(255,255,255,0.22)",
    boxShadow:
      "0 20px 50px rgba(0,0,0,0.35)",
  };

  // REPORT SUBMISSION
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
          "FINAL"
        );

        formData.append(
          "assessment_stage",
          "FINAL_QUIZ"
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

        await submitAssessmentReport(
          formData
        );

        setReportSubmitted(true);
        setShowReportForm(false);
      } catch (err) {
        console.error(
          "Assessment report submission failed:",
          err.response?.data ||
            err.message
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="absolute right-[-180px] top-[10%] h-[520px] w-[520px] rounded-full bg-blue-600/20 blur-[130px]" />

        <div className="absolute bottom-[-220px] left-[30%] h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_35%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.15),rgba(2,6,23,0.85))]" />
      </div>

      {/* Persistent camera element */}
      <video
        id="cameraVideo"
        autoPlay
        muted
        playsInline
        style={cameraPreviewStyle}
      />

      {/* LOADING */}
      {assessmentState === "loading" && (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.07] p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/20">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white">
              Preparing Your Assessment
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Please wait while we securely prepare
              your final assessment session.
            </p>

            <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}
      {assessmentState === "error" && (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-[30px] border border-red-400/20 bg-white/[0.07] p-9 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-2xl text-red-300">
              !
            </div>

            <h2 className="mt-6 text-2xl font-bold text-white">
              Unable to Start Assessment
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {proctoringError ||
                "Something went wrong while loading the final assessment."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/student/dashboard")
              }
              className="mt-7 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:scale-[1.02]"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* EXPIRED */}
      {assessmentState === "expired" && (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-[30px] border border-amber-400/20 bg-white/[0.07] p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/15 text-3xl">
              Î“Ã…â–’
            </div>

            <h2 className="mt-6 text-3xl font-bold text-white">
              Assessment Expired
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Your 30-minute assessment time has
              expired. Your assessment session has
              been securely closed.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/student/dashboard")
              }
              className="mt-7 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* TERMINATED */}
      {assessmentState === "terminated" && (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-xl rounded-[32px] border border-red-400/20 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-2xl sm:p-10">
            {!showReportForm &&
              !reportSubmitted && (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/10 text-3xl text-red-300 ring-1 ring-red-400/20">
                    !
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    Assessment Terminated
                  </div>

                  <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
                    Assessment Terminated
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                    The assessment was terminated by
                    the proctoring system.
                  </p>

                  {proctoringError && (
                    <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-300">
                        Proctoring Notice
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-200/80">
                        {proctoringError}
                      </p>
                    </div>
                  )}

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowReportForm(true)
                      }
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5"
                    >
                      Report to Admin
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/student/dashboard"
                        )
                      }
                      className="rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}

            {/* REPORT FORM */}
            {showReportForm &&
              !reportSubmitted && (
                <form
                  onSubmit={
                    handleSubmitAssessmentReport
                  }
                >
                  <div className="mb-7">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                      Assessment Review
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-white">
                      Report Termination
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Provide details so an administrator
                      can review the termination.
                    </p>
                  </div>

                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Reason
                  </label>

                  <textarea
                    value={reportReason}
                    onChange={(e) =>
                      setReportReason(
                        e.target.value
                      )
                    }
                    placeholder="Explain why you believe the assessment was terminated incorrectly..."
                    rows={4}
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                  />

                  <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Supporting Evidence
                  </label>

                  <div className="mt-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) =>
                        setReportEvidenceFile(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                      className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-300 hover:file:bg-violet-500/25"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      PNG, JPG, JPEG, or PDF. Maximum
                      size: 10 MB.
                    </p>
                  </div>

                  <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Additional Evidence /
                    Explanation
                  </label>

                  <textarea
                    value={reportEvidence}
                    onChange={(e) =>
                      setReportEvidence(
                        e.target.value
                      )
                    }
                    placeholder="Provide any additional details that may help the admin review..."
                    rows={3}
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                  />

                  {reportError && (
                    <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3">
                      <p className="text-xs leading-5 text-red-300">
                        {reportError}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReportForm(
                          false
                        );
                        setReportError("");
                      }}
                      disabled={
                        reportSubmitting
                      }
                      className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        reportSubmitting
                      }
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reportSubmitting
                        ? "Submitting..."
                        : "Submit Report"}
                    </button>
                  </div>
                </form>
              )}

            {/* REPORT SUCCESS */}
            {reportSubmitted && (
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/15 text-3xl text-emerald-300 ring-1 ring-emerald-400/20">
                  Î“Â£Ã´
                </div>

                <h2 className="mt-6 text-2xl font-bold text-white">
                  Report Submitted
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                  Your report has been submitted
                  successfully. An administrator can now
                  review your assessment termination.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/student/dashboard"
                    )
                  }
                  className="mt-7 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPLETED */}
      {assessmentState === "completed" && (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-[32px] border border-emerald-400/20 bg-white/[0.07] p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/15 text-3xl text-emerald-300 ring-1 ring-emerald-400/20">
              Î“Â£Ã´
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              Assessment Submitted
            </div>

            <h2 className="mt-5 text-3xl font-bold text-white">
              Final Assessment Completed
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Your assessment has been submitted
              successfully.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/dashboard"
                )
              }
              className="mt-7 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* READY / INTRO SCREEN */}
      {assessmentState === "ready" && (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-5xl">
            {/* TOP BRAND AREA */}
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 text-lg font-bold text-white shadow-lg shadow-violet-600/20">
                  V
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Vayvora
                  </p>

                  <p className="text-xs text-slate-500">
                    Assessment Center
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Secure Assessment
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-2xl">
              {/* HERO */}
              <div className="relative overflow-hidden border-b border-white/10 px-6 py-9 sm:px-10 sm:py-11">
                <div className="absolute right-[-80px] top-[-120px] h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="absolute bottom-[-120px] left-[35%] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    Final Assessment
                  </div>

                  <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Ready to demonstrate
                    <span className="bg-gradient-to-r from-violet-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                      {" "}what youÎ“Ã‡Ã–ve learned?
                    </span>
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    You are about to begin your final
                    proctored assessment. Make sure you
                    are prepared before starting.
                  </p>
                </div>
              </div>

              {/* CONTENT */}
              <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.35fr_0.85fr]">
                {/* BEFORE YOU BEGIN */}
                <div className="rounded-2xl border border-white/10 bg-black/10 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                      Î“Â£Ã´
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        Before you begin
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Please review these requirements.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      "The assessment is proctored.",
                      "Camera and microphone may be required.",
                      "Fullscreen mode is required.",
                      "Do not switch tabs or leave the window.",
                      "Maintain a stable internet connection.",
                      "The timer starts once the assessment begins.",
                    ].map(
                      (item, index) => (
                        <div
                          key={item}
                          className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5"
                        >
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-300">
                            {index + 1}
                          </div>

                          <p className="text-xs leading-5 text-slate-300">
                            {item}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* ASSESSMENT DETAILS */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/[0.08] to-blue-500/[0.05] p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      Î“Ã¹Ãª
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        Assessment Details
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Final evaluation
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/10 px-4 py-3">
                      <span className="text-xs text-slate-500">
                        Duration
                      </span>

                      <span className="text-sm font-semibold text-white">
                        30 minutes
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/10 px-4 py-3">
                      <span className="text-xs text-slate-500">
                        Type
                      </span>

                      <span className="text-sm font-semibold text-white">
                        Final Quiz
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/10 px-4 py-3">
                      <span className="text-xs text-slate-500">
                        Proctoring
                      </span>

                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION AREA */}
              <div className="flex flex-col gap-4 border-t border-white/10 bg-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-sm text-amber-300">
                    !
                  </div>

                  <p className="max-w-md text-xs leading-5 text-slate-500">
                    Starting the assessment activates the
                    timer and proctoring session.
                  </p>
                </div>

                <Button
                  variant="primary"
                  onClick={startAssessment}
                >
                  Start Final Assessment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ */}
      {assessmentState === "quiz" && (
        <div className="relative z-10 min-h-screen">
          {/* PROCTORING WARNING */}
          {proctoringWarning && (
            <div className="fixed left-1/2 top-4 z-[1100] w-[calc(100%-32px)] max-w-xl -translate-x-1/2">
              <div className="rounded-2xl border border-amber-400/30 bg-amber-950/80 px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-sm text-amber-300">
                    !
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Proctoring Warning
                    </p>

                    <p className="mt-1 text-sm leading-5 text-amber-100/80">
                      {proctoringWarning}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <FinalQuiz
            sessionId={sessionId}
            initialDomain={quizData?.domain}
            initialSkill={quizData?.skill}
            initialQuestion={quizData?.question}
            initialAssessment={
              quizData?.assessment
            }
            initialQuestionsAnswered={
              quizData?.questionsAnswered ?? 0
            }
            initialSkillQuestionsAnswered={
              quizData?.skillQuestionsAnswered ??
              0
            }
            remainingSeconds={
              remainingSeconds
            }
            tabSwitchCount={
              tabSwitchCount
            }
            onPause={pauseAssessment}
            onCompleted={
              handleQuizCompleted
            }
          />
        </div>
      )}
    </div>
  );
};

export default FinalAssessment;
