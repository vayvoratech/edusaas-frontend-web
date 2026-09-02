import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  startInitialCodingAssessment,
  activateInitialCodingAssessment,
  heartbeatInitialCodingAssessment,
  pauseInitialCodingAssessment,
  pauseInitialCodingAssessmentOnUnload,
  runInitialCodingCode,
  submitInitialCodingAnswer,
  completeInitialCodingAssessment
} from "../../../services/api";
import ProctoringService from "../../../services/proctoringServices";

// ============================================================
// Constants
// ============================================================

const DEFAULT_CODE = {
  python: `def solve():
    # Write your solution here
    pass

solve()
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}
`,
  java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your solution here
    }
}
`,
  c: `#include <stdio.h>

int main() {
    // Write your solution here
    return 0;
}
`,
  javascript: `function solve() {
  // Write your solution here
}

solve();
`,
};

const LANGUAGE_LABELS = {
  python: "Python",
  cpp: "C++",
  java: "Java",
  c: "C",
  javascript: "JavaScript",
};

const FALLBACK_LANGUAGES = [
  "python",
  "cpp",
  "java",
  "c",
  "javascript",
];

const DRAFT_PREFIX = "vayvora_coding_draft";
const REQUEST_TIMEOUT_MS = 60000;

const normalizeLanguage = (language) => {
  const value = String(language || "").trim().toLowerCase();

  if (value === "py") return "python";
  if (value === "c++") return "cpp";
  if (value === "js") return "javascript";

  return value;
};

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const getLanguagesForQuestion = (question) => {
  if (
    question &&
    Array.isArray(question.supportedLanguages) &&
    question.supportedLanguages.length > 0
  ) {
    return question.supportedLanguages.map(normalizeLanguage);
  }

  return FALLBACK_LANGUAGES;
};

const templateFor = (language) =>
  DEFAULT_CODE[language] || "// Write your solution here\n";

const fetchWithTimeout = (promise, ms = REQUEST_TIMEOUT_MS) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("TIMEOUT"));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

// ============================================================
// Draft persistence (client-side safety net so in-progress code
// survives refreshes even before it has been submitted)
// ============================================================

const draftKey = (sessionId, questionId) =>
  `${DRAFT_PREFIX}:${sessionId}:${questionId}`;

const readDraft = (sessionId, questionId) => {
  try {
    return window.localStorage.getItem(draftKey(sessionId, questionId));
  } catch (err) {
    return null;
  }
};

const writeDraft = (sessionId, questionId, language, code) => {
  try {
    window.localStorage.setItem(
      draftKey(sessionId, questionId),
      JSON.stringify({
        language,
        code,
      })
    );
  } catch (err) {
    // Storage full/unavailable — non-fatal, submissions are still
    // persisted server-side.
  }
};

const clearDraft = (sessionId, questionId) => {
  try {
    window.localStorage.removeItem(draftKey(sessionId, questionId));
  } catch (err) {
    // ignore
  }
};

const enterCodingFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  } catch (err) {
    console.error("Failed to enter fullscreen:", err);
    throw new Error(
      "Fullscreen mode is required to continue the assessment."
    );
  }
};

const exitCodingFullscreen = async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error(
      "Failed to exit coding fullscreen:",
      error
    );
  }
};

// ============================================================
// Small inline icons (no external icon dependency)
// ============================================================

const Icon = {
  Pause: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ),
  Alert: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  ),
  Clock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  Check: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Play: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Send: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  ChevronLeft: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  ChevronRight: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Refresh: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
  Camera: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M23 7 16 12l7 5V7Z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  ),
};

// ============================================================
// Component
// ============================================================

const InitialCodingAssessment = ({
  sessionId,
  onComplete,
  onError,
  proctoringWarning,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-question working state, keyed by questionId.
  const [answers, setAnswers] = useState({});

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // "in_progress" | "paused" | "timed_out" | "completed"
  const [sessionStatus, setSessionStatus] = useState("ready");
  const [assessmentActive, setAssessmentActive] = useState(false);
  const [resuming, setResuming] = useState(false);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [showFinishModal, setShowFinishModal] = useState(false);


  // ---- purely presentational UI state (no effect on data/flow) ----
  const [problemTab, setProblemTab] = useState("description"); // "description" | "examples"
  const [consoleTab, setConsoleTab] = useState("result"); // "result" | "submission"
  const [leftPct, setLeftPct] = useState(42);
  const draggingRef = useRef(false);
  const splitContainerRef = useRef(null);

  const sessionIdRef = useRef(null);
  const assessmentActiveRef = useRef(false);
  const pauseSentRef = useRef(false);
  const skipAutoPauseRef = useRef(false);
  const answersRef = useRef({});
  const draftTimersRef = useRef({});
  const finalizingRef = useRef(false);
  const proctoringRef = useRef(null);
  const proctoringStartRef = useRef(false)

  useEffect(() => {
    proctoringRef.current = new ProctoringService({
      assessmentType: "CODING",

      onConnected: () => {
        console.log("Coding proctoring WebSocket connected.");
      },

      onStarted: (data) => {
        console.log("Coding AI proctoring started:", data);
        setError("");
        assessmentActiveRef.current = true;
        setAssessmentActive(true);
        setSessionStatus("in_progress");
      },

      onResult: (data) => {
        if (!data?.fraud) return;
        // Result handling managed via props/callbacks
      },

      onWarning: (data) => {
        console.warn("Coding proctoring warning:", data);
      },

      onPause: async (data) => {
        console.warn("Coding assessment paused by proctoring:", data);

        const sid = sessionIdRef.current || sessionId;

        if (
          !sid ||
          pauseSentRef.current ||
          skipAutoPauseRef.current
        ) {
          return;
        }

        pauseSentRef.current = true;

        assessmentActiveRef.current = false;
        setAssessmentActive(false);
        setSessionStatus("paused");

        try {
          await pauseInitialCodingAssessment(sid);
          proctoringStartRef.current = false
          await proctoringRef.current?.cleanup()
        } catch (error) {
          console.error(
            "Failed to persist AI proctoring pause:",
            error
          );
        }
      },

      onTerminate: async (data) => {
        console.error(
          "Coding assessment terminated by proctoring:",
          data
        );

        skipAutoPauseRef.current = true;

        assessmentActiveRef.current = false;
        setAssessmentActive(false);

        try {
          await exitCodingFullscreen();
        } catch (error) {
          console.error(
            "Failed to exit fullscreen after termination:",
            error
          );
        }

        proctoringRef.current?.cleanup();
        proctoringRef.current = null;

        setSessionStatus("terminated");

        setError(
          "Your coding assessment was terminated by the proctoring system."
        );
      },

      onDisconnected: () => {
        console.warn("Coding proctoring WebSocket disconnected.");
      },

      onError: (error) => {
        console.error("Coding proctoring error:", error);
      },
    });

    return () => {
      proctoringStartRef.current = false
      if (proctoringRef.current) {
        proctoringRef.current.cleanup();
        proctoringRef.current = null;
      }
    };
  }, [sessionId]);

  // The paused screen and the active assessment screen each render
  // their own <video id="cameraVideo"> element. Whenever we switch
  // between them, re-attach the live camera stream to whichever one
  // is now mounted, otherwise the preview can go blank while
  // proctoring keeps running in the background.
  useEffect(() => {
    proctoringRef.current?.bindVideoElement();
  }, [sessionStatus]);

  const currentQuestion = questions[currentIndex] || null;
  const currentQuestionId = currentQuestion
    ? currentQuestion.questionId ?? currentQuestion.question_id
    : null;
  const currentAnswer = currentQuestionId
    ? answers[currentQuestionId]
    : null;

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    assessmentActiveRef.current = assessmentActive;
  }, [assessmentActive]);

  // Reset presentational tabs when moving between questions so each
  // question opens on Description / Result by default.
  useEffect(() => {
    setProblemTab("description");
  }, [currentQuestionId]);

  // ----------------------------------------------------------
  // Build the initial per-question answer map from the server
  // response (restoring local draft -> last submission -> template).
  // ----------------------------------------------------------
  const buildInitialAnswers = useCallback(
    (receivedQuestions, sid) => {
      const next = {};

      receivedQuestions.forEach((question) => {
        const qid = question.questionId ?? question.question_id;
        const languages = getLanguagesForQuestion(question);
        const lastSubmission = question.lastSubmission || null;

        const defaultLanguage = lastSubmission?.language
          ? normalizeLanguage(lastSubmission.language)
          : languages[0];

        const draft = readDraft(sid, qid);

        let savedDraft = null;

        if (draft) {
          try {
            savedDraft = JSON.parse(draft);
          } catch {
            savedDraft = {
              language: defaultLanguage,
              code: draft,
            };
          }
        }

        const restoredLanguage = normalizeLanguage(
          savedDraft?.language ||
          lastSubmission?.language ||
          defaultLanguage
        );

        const restoredCode =
          savedDraft?.code ??
          lastSubmission?.code ??
          templateFor(restoredLanguage);

        next[qid] = {
          language: restoredLanguage,
          code: restoredCode,
          runResult: null,
          submitResult: lastSubmission
            ? {
                submission: {
                  status: lastSubmission.status,
                  score: lastSubmission.score,
                  totalMarks: lastSubmission.totalMarks,
                  passedTestCases: lastSubmission.passedTestCases,
                  totalTestCases: lastSubmission.totalTestCases,
                  submittedAt: lastSubmission.submittedAt,
                },
              }
            : null,
          submittedCode: lastSubmission?.code ?? null,
        };
      });

      return next;
    },
    []
  );

  // ----------------------------------------------------------
  // Load / resume the coding assessment
  // ----------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    const loadCodingAssessment = async () => {
      if (!sessionId) {
        const message = "Coding assessment session ID is missing.";
        setError(message);
        onError?.(message);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await startInitialCodingAssessment(sessionId);

        if (!mounted) return;

        const data = response?.data;

        if (!data) {
          throw new Error("Invalid coding assessment response.");
        }

        const effectiveSessionId = data.session?.sessionId ?? sessionId;
        sessionIdRef.current = effectiveSessionId;
        const serverStatus = data.session?.status;
        const remainingTime =
          data.session?.remainingSeconds ??
          data.session?.remaining_seconds ??
          0;

        if (serverStatus === "Completed") {
          onComplete?.(response);
          return;
        }

        const isTimedOut = serverStatus === "Timed Out";
        const isPaused = serverStatus === "Paused";
        const isInProgress = serverStatus === "In Progress";

        assessmentActiveRef.current = false;
        setAssessmentActive(false);

        setSessionStatus(
          isTimedOut
            ? "timed_out"
            : isPaused
            ? "paused"
            : isInProgress
            ? "paused"
            : "ready"
        );

        pauseSentRef.current = false;
        skipAutoPauseRef.current = false;
        proctoringStartRef.current = false;

        const receivedQuestions = Array.isArray(data.questions)
          ? data.questions
          : [];

        setQuestions(receivedQuestions);

        const initialAnswers = buildInitialAnswers(
          receivedQuestions,
          sessionIdRef.current
        );

        setAnswers(initialAnswers);

        const firstUnanswered = receivedQuestions.findIndex(
          (question) => !question.lastSubmission
        );

        setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
        setRemainingSeconds(Number(remainingTime));
        
      } catch (err) {
        if (!mounted) return;

        const message = getErrorMessage(
          err,
          "Unable to start the coding assessment."
        );

        setError(message);
        onError?.(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCodingAssessment();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);


  // ----------------------------------------------------------
  // Finalize
  // ----------------------------------------------------------
  const finalizeAssessment = useCallback(
    async (fallbackMessage) => {
      if (finalizingRef.current) return;
      finalizingRef.current = true;

      skipAutoPauseRef.current = true;
      assessmentActiveRef.current = false;
      setAssessmentActive(false);

      proctoringRef.current?.cleanup();
      proctoringRef.current = null;
      await exitCodingFullscreen();

      try {
        setCompleting(true);
        setError("");

        const response = await fetchWithTimeout(
          completeInitialCodingAssessment(
            sessionIdRef.current || sessionId
          ),
          60000
        );

        onComplete?.(response);
      } catch (err) {
        const message =
          err?.message === "TIMEOUT"
            ? "Assessment completion timed out. Please try again."
            : getErrorMessage(err, fallbackMessage);

        setError(message);
        onError?.(message);
        finalizingRef.current = false;
      } finally {
        setCompleting(false);
      }
    },
    [sessionId, onComplete, onError]
  );

  // ============================================================
  // Coding assessment timer
  // ============================================================
  useEffect(() => {
    if (loading || !assessmentActive) {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(timerId);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [loading, assessmentActive]);

  // Time expired
  useEffect(() => {
    if (loading || !assessmentActive || remainingSeconds > 0) return;

    setSessionStatus("timed_out");
    finalizeAssessment(
      "Coding assessment time expired, but completion failed."
    );
  }, [remainingSeconds, loading, assessmentActive, finalizeAssessment]);

  useEffect(() => {
    if (!assessmentActive || !sessionId) return;

    const heartbeatTimer = setInterval(async () => {
      try {
        const response = await heartbeatInitialCodingAssessment(
          sessionIdRef.current || sessionId
        );

        const data = response?.data;

        if (typeof data?.remaining_seconds === "number") {
          setRemainingSeconds(data.remaining_seconds);
        }

        if (data?.active === false) {
          if (data.status === "Timed Out") {
            assessmentActiveRef.current = false;
            setAssessmentActive(false);
            setSessionStatus("timed_out");

            skipAutoPauseRef.current = true;

            await finalizeAssessment(
              "Your coding assessment time has expired."
            );
          } else {
            assessmentActiveRef.current = false;
            setAssessmentActive(false);
            setSessionStatus("paused");

            console.log(
              "Server reports coding assessment is paused."
            );
          }
        }
      } catch (err) {
        const status = err.response?.status;

        if (status === 409 || status === 404 || status === 403) {
          setSessionStatus("timed_out");
          finalizeAssessment(
            err.response?.data?.error ||
              "Your coding assessment session has ended."
          );
        }
      }
    }, 10000);

    return () => clearInterval(heartbeatTimer);
  }, [assessmentActive, sessionId, finalizeAssessment]);

  // ----------------------------------------------------------
  // Pause / resume
  // ----------------------------------------------------------
   const handleResume = useCallback(async () => {
  const sid = sessionIdRef.current || sessionId;

  if (!sid) {
    setError("Coding assessment session ID is missing.");
    return;
  }

  try {
    setResuming(true);
    setError("");

    // 1. Enter fullscreen from the user click.
    await enterCodingFullscreen();

    // 2. Activate the coding assessment on the server.
    const response = await activateInitialCodingAssessment(sid);
      const data = response?.data;

      if (typeof data?.remaining_seconds === "number") {
        setRemainingSeconds(data.remaining_seconds);
      }

      pauseSentRef.current = false;
      skipAutoPauseRef.current = false;

      // 3. START PROCTORING.
      // This is the missing handshake in the coding assessment.
      if (!proctoringRef.current) {
        throw new Error("Proctoring service is not initialized.");
      }

      await proctoringRef.current.start(sid);

      console.log(
        "Coding proctoring connection established. Waiting for AI..."
      );

      // IMPORTANT:
      // onStarted from ProctoringService will set these.
      // Do not mark the assessment active before proctoring starts.

    } catch (err) {
      console.error(
        "Failed to resume coding assessment:",
        err
      );

      const message = getErrorMessage(
        err,
        "Unable to start the coding assessment."
      );

      setError(message);
      onError?.(message);

      assessmentActiveRef.current = false;
      setAssessmentActive(false);
      setSessionStatus("paused");

      // If proctoring partially started, clean it up.
      if (proctoringRef.current) {
        try {
          await proctoringRef.current.cleanup();
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup proctoring after start failure:",
            cleanupError
          );
        }
      }

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (fullscreenError) {
          console.error(
            "Failed to exit fullscreen after resume failure:",
            fullscreenError
          );
        }
      }

      // If activation succeeded but proctoring failed,
      // restore the server session to Paused.
      try {
        await pauseInitialCodingAssessment(sid);
      } catch (pauseError) {
        console.error(
          "Failed to pause coding assessment after proctoring failure:",
          pauseError
        );
      }
    } finally {
      setResuming(false);
    }
  }, [sessionId, onError]);
  

  const pauseCodingAssessment = useCallback(async () => {
    const sid = sessionIdRef.current || sessionId;

    if (
      !sid ||
      !assessmentActiveRef.current ||
      pauseSentRef.current ||
      skipAutoPauseRef.current
    ) {
      return;
    }

    pauseSentRef.current = true;

    assessmentActiveRef.current = false;
    setAssessmentActive(false);
    setSessionStatus("paused");

    try {
      await pauseInitialCodingAssessment(sid);

      console.log(
        "Coding assessment paused successfully:",
        sid
      );
    } catch (err) {
      console.error(
        "Failed to persist coding assessment pause:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "The assessment was interrupted, but the pause could not be saved."
        )
      );
    }
  }, [sessionId]);

  // ============================================================
  // Fullscreen enforcement
  // ============================================================
  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (document.fullscreenElement !== null) {
        return;
      }

      if (!assessmentActiveRef.current) {
        return;
      }

      if (skipAutoPauseRef.current) {
        return;
      }

      console.warn(
        "Coding assessment exited fullscreen. Pausing immediately."
      );

      await pauseCodingAssessment();
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
  }, [pauseCodingAssessment]);

  // Best-effort pause on hard refresh / tab close.
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sid = sessionIdRef.current || sessionId;

      if (pauseSentRef.current) {
        return;
      }

      Object.entries(answersRef.current || {}).forEach(([qid, answer]) => {
        if (answer && typeof answer.code === "string") {
          writeDraft(sid, qid, answer.language, answer.code);
        }
      });

      if (
        sid &&
        assessmentActiveRef.current &&
        !skipAutoPauseRef.current
      ) {
        pauseSentRef.current = true;
        pauseInitialCodingAssessmentOnUnload(sid);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [sessionId]);

  // ----------------------------------------------------------
  // Editor state helpers
  // ----------------------------------------------------------
  const updateAnswer = useCallback((questionId, patch) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        ...(typeof patch === "function" ? patch(prev[questionId]) : patch),
      },
    }));
  }, []);

  const handleCodeChange = (event) => {
    if (!currentQuestionId) return;

    const value = event.target.value;

    updateAnswer(currentQuestionId, { code: value, runResult: null });
    setError("");

    const sid = sessionIdRef.current || sessionId;

    if (draftTimersRef.current[currentQuestionId]) {
      clearTimeout(draftTimersRef.current[currentQuestionId]);
    }

    draftTimersRef.current[currentQuestionId] = setTimeout(() => {
      writeDraft(sid, currentQuestionId, currentAnswer?.language, value);
    }, 400);
  };

  const handleEditorKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();

      const textarea = event.target;
      const { selectionStart, selectionEnd, value } = textarea;
      const indent = "    ";

      const nextValue =
        value.slice(0, selectionStart) + indent + value.slice(selectionEnd);

      updateAnswer(currentQuestionId, { code: nextValue, runResult: null });

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd =
          selectionStart + indent.length;
      });
      return;
    }

    // Convenience shortcuts: Ctrl/Cmd+Enter to run, +Shift to submit.
    // Presentational only — both call the exact same handlers as the
    // toolbar buttons below.
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (event.shiftKey) {
        onClickSubmit();
      } else {
        onClickRun();
      }
    }
  };

  const handleLanguageChange = (event) => {
    if (!currentQuestion || !currentQuestionId) return;

    const language = normalizeLanguage(event.target.value);
    const previousLanguage = currentAnswer?.language;
    const currentCode = currentAnswer?.code ?? "";

    const isUntouched =
      !currentCode.trim() ||
      currentCode.trim() === templateFor(previousLanguage).trim();

    const nextCode = isUntouched ? templateFor(language) : currentCode;

    updateAnswer(currentQuestionId, {
      language,
      code: nextCode,
      runResult: null,
    });

    writeDraft(
      sessionIdRef.current || sessionId,
      currentQuestionId,
      language,
      nextCode
    );
  };

  const handleResetTemplate = () => {
    if (!currentQuestionId || !currentAnswer) return;

    if (
      !window.confirm(
        "Reset this question's editor back to the starter template? This cannot be undone."
      )
    ) {
      return;
    }

    const resetCode = templateFor(currentAnswer.language);

    updateAnswer(currentQuestionId, {
      code: resetCode,
      runResult: null,
    });

    clearDraft(sessionIdRef.current || sessionId, currentQuestionId);
  };

  const goToQuestion = (index) => {
    if (index < 0 || index >= questions.length) return;
    if (running || submitting || completing) return;

    setCurrentIndex(index);
    setError("");
  };

  const handlePrevious = () => goToQuestion(currentIndex - 1);
  const handleNext = () => goToQuestion(currentIndex + 1);

  // ----------------------------------------------------------
  // Run
  // ----------------------------------------------------------
  const handleRun = async () => {
    if (!currentQuestion || !currentAnswer) return;

    if (!currentAnswer.code.trim()) {
      setError("Please write some code before running it.");
      return;
    }

    try {
      setRunning(true);
      setError("");
      updateAnswer(currentQuestionId, { runResult: null });

      const response = await fetchWithTimeout(
        runInitialCodingCode({
          session_id: Number(sessionIdRef.current || sessionId),
          question_id: Number(currentQuestionId),
          language: currentAnswer.language,
          code: currentAnswer.code,
        })
      );

      updateAnswer(currentQuestionId, {
        runResult: response?.data || response,
      });
    } catch (err) {
      if (err.message === "TIMEOUT") {
        updateAnswer(currentQuestionId, {
          runResult: {
            status: "error",
            message: "Code execution timed out. Please try again.",
          },
        });
      } else {
        const message = getErrorMessage(err, "Unable to run your code.");
        setError(message);
        onError?.(message);
      }
    } finally {
      setRunning(false);
    }
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------
  const handleSubmit = async () => {
    if (!currentQuestion || !currentAnswer || !currentAnswer.code.trim()) {
      setError("Please write your solution before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetchWithTimeout(
        submitInitialCodingAnswer({
          sessionId: Number(sessionIdRef.current || sessionId),
          questionId: Number(currentQuestionId),
          language: currentAnswer.language,
          code: currentAnswer.code,
        })
      );

      const result = response?.data || response;

      updateAnswer(currentQuestionId, {
        submitResult: result,
        submittedCode: currentAnswer.code,
      });

      writeDraft(
        sessionIdRef.current || sessionId,
        currentQuestionId,
        currentAnswer.language,
        currentAnswer.code
      );
    } catch (err) {
      if (err.message === "TIMEOUT") {
        setError("Submission timed out. Please try again.");
      } else {
        const message = getErrorMessage(err, "Unable to submit your solution.");
        setError(message);
        onError?.(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Thin presentational wrappers: call the exact original handler,
  // then switch the (purely visual) console tab to show fresh output.
  const onClickRun = async () => {
    await handleRun();
    setConsoleTab("result");
  };

  const onClickSubmit = async () => {
    await handleSubmit();
    setConsoleTab("submission");
  };

  // ----------------------------------------------------------
  // Finish assessment
  // ----------------------------------------------------------
  const handleFinishConfirmed = async () => {
    if (answeredCount < totalQuestions) {
      setShowFinishModal(false);
      setError("Submit every coding question before completing the assessment.");
      return;
    }

    setShowFinishModal(false);
    await finalizeAssessment("Unable to complete the coding assessment.");
  };

  const answeredCount = questions.filter((question) => {
    const qid = question.questionId ?? question.question_id;
    return Boolean(answers[qid]?.submitResult);
  }).length;

  // ----------------------------------------------------------
  // Resizable split (presentational only — driven by mouse events,
  // never touches assessment data or handlers)
  // ----------------------------------------------------------
  const handleDividerMouseDown = () => {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!draggingRef.current || !splitContainerRef.current) return;

      const rect = splitContainerRef.current.getBoundingClientRect();
      const pct = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(62, Math.max(28, pct));

      setLeftPct(clamped);
    };

    const handleMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#111318]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#3161d1]" />

          <p className="mt-4 text-sm font-medium text-slate-200">
            Setting up your coding environment
          </p>

          <p className="mt-1 text-xs text-slate-500">
            This will only take a moment
          </p>
        </div>
      </div>
    );
  }

  if (sessionStatus === "paused") {
    return (
      <>
       <div className="fixed bottom-5 left-5 z-50 w-44 overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl">
          <video
            id="cameraVideo"
            autoPlay
            muted
            playsInline
            className="aspect-video w-full object-cover"
          />
        </div>
      <div className="h-full flex items-center justify-center bg-[#111318] p-6">
        <div className="max-w-md w-full rounded-xl border border-white/10 bg-[#181b22] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <Icon.Pause className="h-5 w-5" />
          </div>

          <h2 className="text-xl font-semibold text-white">
            Assessment paused
          </h2>

          <p className="mt-2.5 text-sm leading-6 text-slate-400">
            Your progress and remaining time were saved. Resume when
            you're ready to continue.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
            <Icon.Clock className="h-4 w-4 text-slate-500" />
            <p className="font-mono text-2xl font-semibold text-white tabular-nums">
              {formatTime(remainingSeconds)}
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleResume}
            disabled={resuming}
            className="mt-6 w-full rounded-lg bg-[#3161d1] py-2.5 text-sm font-medium text-white transition hover:bg-[#2952b3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resuming ? "Resuming…" : "Resume assessment"}
          </button>
        </div>
      </div>
      </>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="h-full flex items-center justify-center bg-[#111318] p-6">
        <div className="max-w-md rounded-xl border border-white/10 bg-[#181b22] p-8 text-center">
          <h2 className="text-base font-semibold text-white">
            No questions available
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            This assessment session doesn't have any coding questions to
            display.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (sessionStatus === "terminated") {
  return (
    <div className="h-full flex items-center justify-center bg-[#111318] p-6">
      <div className="max-w-md w-full rounded-xl border border-red-500/20 bg-[#181b22] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <Icon.Alert className="h-5 w-5" />
        </div>

        <h2 className="text-xl font-semibold text-white">
          Assessment terminated
        </h2>

        <p className="mt-2.5 text-sm leading-6 text-slate-400">
          Proctoring flagged this session and it was ended automatically.
          This assessment can't be resumed.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

  if (sessionStatus === "timed_out") {
    return (
      <div className="h-full flex items-center justify-center bg-[#111318] p-6">
        <div className="max-w-md w-full rounded-xl border border-white/10 bg-[#181b22] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
            <Icon.Alert className="h-5 w-5" />
          </div>

          <h2 className="text-xl font-semibold text-white">
            Time's up
          </h2>

          <p className="mt-2.5 text-sm leading-6 text-slate-400">
            Your allotted time has ended. Finalize the assessment to
            submit your results with everything you've saved so far.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              finalizeAssessment("Unable to complete the coding assessment.")
            }
            disabled={completing}
            className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-medium text-[#111318] transition hover:bg-slate-200 disabled:opacity-50"
          >
            {completing ? "Finalizing…" : "Finalize assessment"}
          </button>
        </div>
      </div>
    );
  }

  const questionNumber = currentIndex + 1;
  const totalQuestions = questions.length || 3;
  const timerDanger = remainingSeconds <= 300;
  const languages = getLanguagesForQuestion(currentQuestion);
  const code = currentAnswer?.code ?? "";
  const language = currentAnswer?.language ?? languages[0];
  const runResult = currentAnswer?.runResult ?? null;
  const submitResult = currentAnswer?.submitResult ?? null;
  const hasUnsubmittedEdits =
    currentAnswer?.submittedCode != null &&
    currentAnswer.submittedCode !== code;
  const lineCount = Math.max(code.split("\n").length, 1);
  const useLanguagePills = languages.length <= 5;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#eef1f4]">
      {/* Top bar */}
      <header className="shrink-0 bg-[#111318] text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3161d1]/20 font-mono text-sm font-bold text-[#7ea2ec]">
              {"{ }"}
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">
                Coding Assessment
              </p>
              <p className="mt-1 text-[11px] leading-none text-slate-400">
                Question {questionNumber} of {totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] leading-none text-slate-400">
                Submitted
              </p>
              <p className="mt-1 text-sm font-medium leading-none text-slate-100">
                {answeredCount} / {totalQuestions}
              </p>
            </div>

            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
                timerDanger
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  timerDanger ? "bg-red-400 animate-pulse" : "bg-[#f5a623] animate-pulse"
                }`}
              />
              <span
                className={`font-mono text-sm font-semibold tabular-nums ${
                  timerDanger ? "text-red-300" : "text-slate-100"
                }`}
              >
                {formatTime(remainingSeconds)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowFinishModal(true)}
              disabled={completing || answeredCount < totalQuestions}
              className="rounded-lg bg-[#3161d1] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2952b3] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Finish assessment
            </button>
          </div>
        </div>

        {(error || proctoringWarning) && (
          <div className="shrink-0 border-t border-white/10 bg-orange-500/10 px-5 py-1.5 text-xs text-orange-200 flex items-center justify-between gap-4">
            <span>{error || proctoringWarning?.message}</span>

            {proctoringWarning && (
              <span className="font-semibold whitespace-nowrap">
                Violations: {proctoringWarning.violationCount}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Question navigator */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {questions.map((question, index) => {
            const qid = question.questionId ?? question.question_id;
            const answer = answers[qid];
            const active = index === currentIndex;
            const submitted = Boolean(answer?.submitResult);
            const hasDraft =
              !submitted &&
              answer?.code &&
              answer.code.trim() !== templateFor(answer.language).trim();

            const score = answer?.submitResult?.submission?.score;
            const totalMarks =
              answer?.submitResult?.submission?.totalMarks ??
              question.totalMarks;

            const title = submitted
              ? `Question ${index + 1}: Submitted (${score ?? 0}/${
                  totalMarks ?? 100
                })`
              : hasDraft
              ? `Question ${index + 1}: In progress (not submitted)`
              : `Question ${index + 1}: Not started`;

            return (
              <button
                key={qid}
                type="button"
                title={title}
                onClick={() => goToQuestion(index)}
                disabled={running || submitting || completing}
                className={`flex h-8 min-w-[2.25rem] items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? "bg-[#111318] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    submitted
                      ? "bg-emerald-500"
                      : hasDraft
                      ? "bg-amber-500"
                      : active
                      ? "bg-slate-500"
                      : "bg-slate-300"
                  }`}
                />
                {index + 1}
              </button>
            );
          })}

          <span className="ml-2 text-[11px] text-slate-400">
            Navigate freely — each question is submitted independently.
          </span>
        </div>
      </div>

      {/* Camera monitor */}
      <div className="fixed bottom-5 left-5 z-50 w-44 overflow-hidden rounded-lg border border-black/10 bg-black shadow-xl">
        <video
          id="cameraVideo"
          autoPlay
          muted
          playsInline
          className="aspect-video w-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 bg-black/70 px-2 py-1">
          <Icon.Camera className="h-3 w-3 text-[#f5a623]" />
          <span className="text-[10px] font-medium text-white">
            Recording
          </span>
        </div>
      </div>

      {/* Main split view */}
      <div
        ref={splitContainerRef}
        className="min-h-0 flex-1 overflow-hidden flex"
      >
        {/* Problem panel */}
        <section
          style={{ width: `${leftPct}%` }}
          className="min-h-0 shrink-0 flex flex-col overflow-hidden border-r border-slate-200 bg-white"
        >
          <div className="shrink-0 border-b border-slate-200 px-6 pt-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {currentQuestion.title}
              </h2>

              <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {currentQuestion.totalMarks ?? 100} pts
              </span>
            </div>

            <div className="mt-4 flex items-center gap-5">
              <button
                type="button"
                onClick={() => setProblemTab("description")}
                className={`border-b-2 pb-2.5 text-sm font-medium transition ${
                  problemTab === "description"
                    ? "border-[#3161d1] text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Description
              </button>

              <button
                type="button"
                onClick={() => setProblemTab("examples")}
                className={`border-b-2 pb-2.5 text-sm font-medium transition ${
                  problemTab === "examples"
                    ? "border-[#3161d1] text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Examples
                {Array.isArray(currentQuestion.sampleTestCases) && (
                  <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {currentQuestion.sampleTestCases.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {problemTab === "description" && (
              <div className="space-y-6">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {currentQuestion.description}
                </p>

                {currentQuestion.inputFormat && (
                  <section>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Input format
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-[13px] leading-5 text-slate-700">
                      {currentQuestion.inputFormat}
                    </p>
                  </section>
                )}

                {currentQuestion.outputFormat && (
                  <section>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Output format
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-[13px] leading-5 text-slate-700">
                      {currentQuestion.outputFormat}
                    </p>
                  </section>
                )}

                {currentQuestion.constraints && (
                  <section>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Constraints
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-[13px] leading-5 text-slate-700">
                      {currentQuestion.constraints}
                    </p>
                  </section>
                )}
              </div>
            )}

            {problemTab === "examples" && (
              <div className="space-y-3">
                {Array.isArray(currentQuestion.sampleTestCases) &&
                currentQuestion.sampleTestCases.length > 0 ? (
                  currentQuestion.sampleTestCases.map((testCase, index) => (
                    <div
                      key={
                        testCase.testCaseId ?? testCase.test_case_id ?? index
                      }
                      className="overflow-hidden rounded-md border border-slate-200"
                    >
                      <div className="border-b border-slate-200 bg-slate-50 px-3.5 py-1.5">
                        <span className="text-[11px] font-medium text-slate-500">
                          Example {index + 1}
                        </span>
                      </div>

                      <div className="grid gap-3 p-3.5">
                        <div>
                          <p className="text-[11px] font-medium text-slate-400">
                            Input
                          </p>

                          <pre className="mt-1 whitespace-pre-wrap font-mono text-[13px] text-slate-700">
                            {testCase.inputData ?? testCase.input_data ?? ""}
                          </pre>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium text-slate-400">
                            Expected output
                          </p>

                          <pre className="mt-1 whitespace-pre-wrap font-mono text-[13px] font-medium text-slate-900">
                            {testCase.expectedOutput ??
                              testCase.expected_output ??
                              ""}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No sample test cases were provided for this question.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Drag handle */}
        <div
          onMouseDown={handleDividerMouseDown}
          className="group relative w-1.5 shrink-0 cursor-col-resize bg-slate-200 hover:bg-[#3161d1]/40 active:bg-[#3161d1]/60"
        >
          <div className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400 group-hover:bg-[#3161d1]" />
        </div>

        {/* Editor panel */}
        <section className="min-h-0 flex-1 flex flex-col overflow-hidden bg-white">
          {/* Editor toolbar */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2">
            {useLanguagePills ? (
              <div className="flex flex-wrap items-center gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    disabled={running || submitting || completing}
                    onClick={() =>
                      handleLanguageChange({ target: { value: lang } })
                    }
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      language === lang
                        ? "bg-[#111318] text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {LANGUAGE_LABELS[lang] || lang}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={language}
                onChange={handleLanguageChange}
                disabled={running || submitting || completing}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#3161d1] focus:ring-2 focus:ring-[#3161d1]/20"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {LANGUAGE_LABELS[lang] || lang}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-3">
              {hasUnsubmittedEdits && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  Unsaved changes
                </span>
              )}

              <button
                type="button"
                onClick={handleResetTemplate}
                disabled={running || submitting || completing}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon.Refresh className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Code editor */}
          <div className="min-h-0 flex-1 flex bg-[#16171d]">
            <div
              aria-hidden="true"
              className="select-none overflow-hidden px-3 py-4 text-right font-mono text-[13px] leading-6 text-[#565a66]"
              style={{ minWidth: `${String(lineCount).length + 2}ch` }}
            >
              {Array.from({ length: lineCount }).map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
            </div>

            <textarea
              key={currentQuestionId}
              value={code}
              onChange={handleCodeChange}
              onKeyDown={handleEditorKeyDown}
              spellCheck={false}
              disabled={running || submitting || completing}
              className="h-full min-h-[360px] w-full resize-none border-0 border-l border-white/5 bg-transparent py-4 pl-3 pr-5 font-mono text-[13px] leading-6 text-[#e4e6eb] outline-none placeholder:text-slate-500"
              placeholder="Write your solution here..."
            />
          </div>

          {/* Console */}
          <div className="shrink-0 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-4 px-4 pt-2">
              <button
                type="button"
                onClick={() => setConsoleTab("result")}
                className={`border-b-2 pb-2 text-xs font-semibold transition ${
                  consoleTab === "result"
                    ? "border-[#3161d1] text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Run result
              </button>

              <button
                type="button"
                onClick={() => setConsoleTab("submission")}
                className={`border-b-2 pb-2 text-xs font-semibold transition ${
                  consoleTab === "submission"
                    ? "border-[#3161d1] text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Submission
                {submitResult && (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
                )}
              </button>
            </div>

            <div className="max-h-52 overflow-y-auto px-4 py-3">
              {consoleTab === "result" && (
                <>
                  {!runResult && (
                    <p className="text-xs text-slate-400">
                      Run your code (or press ⌘/Ctrl + Enter) to see the
                      output here.
                    </p>
                  )}

                  {runResult && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-600">
                          Output
                        </p>

                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            runResult.status === "success"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {runResult.status || "completed"}
                        </span>
                      </div>

                      {runResult.message && (
                        <p className="mt-2 font-mono text-xs text-red-600">
                          {runResult.message}
                        </p>
                      )}

                      {Array.isArray(runResult.results) && (
                        <div className="mt-2.5 space-y-1.5">
                          {runResult.results.map((result, index) => (
                            <div
                              key={
                                result.testCaseId ??
                                result.test_case_id ??
                                index
                              }
                              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5"
                            >
                              <span className="text-xs text-slate-600">
                                Test case{" "}
                                {result.testCaseId ??
                                  result.test_case_id ??
                                  index + 1}
                              </span>

                              <span
                                className={`flex items-center gap-1 text-xs font-semibold ${
                                  result.passed
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                              >
                                {result.passed ? (
                                  <Icon.Check className="h-3 w-3" />
                                ) : null}
                                {result.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {runResult.stdout && (
                        <pre className="mt-2.5 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-700">
                          {runResult.stdout}
                        </pre>
                      )}

                      {runResult.stderr && (
                        <pre className="mt-2.5 whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 p-2.5 font-mono text-xs text-red-600">
                          {runResult.stderr}
                        </pre>
                      )}
                    </>
                  )}
                </>
              )}

              {consoleTab === "submission" && (
                <>
                  {!submitResult && (
                    <p className="text-xs text-slate-400">
                      You haven't submitted this question yet.
                    </p>
                  )}

                  {submitResult && (
                    <div className="flex items-center justify-between gap-4 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                      <div>
                        <p className="text-xs font-semibold text-emerald-800">
                          {hasUnsubmittedEdits
                            ? "Last submission on record"
                            : "Submission recorded"}
                        </p>

                        <p className="mt-0.5 text-[11px] text-emerald-700">
                          {submitResult.submission?.status ||
                            submitResult.status ||
                            "Submitted"}
                        </p>
                      </div>

                      <span className="font-mono text-sm font-semibold text-emerald-700">
                        {submitResult.submission?.score ?? 0}/
                        {submitResult.submission?.totalMarks ??
                          currentQuestion.totalMarks ??
                          100}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="shrink-0 border-t border-red-200 bg-red-50 px-4 py-2.5">
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Action bar */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={
                  currentIndex === 0 || running || submitting || completing
                }
                className="flex items-center gap-1 rounded-md px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon.ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClickRun}
                  disabled={running || submitting || completing || !code.trim()}
                  title="⌘/Ctrl + Enter"
                  className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon.Play className="h-3.5 w-3.5" />
                  {running ? "Running…" : "Run code"}
                </button>

                <button
                  type="button"
                  onClick={onClickSubmit}
                  disabled={running || submitting || completing || !code.trim()}
                  title="⌘/Ctrl + Shift + Enter"
                  className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon.Send className="h-3.5 w-3.5" />
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  currentIndex >= questions.length - 1 ||
                  running ||
                  submitting ||
                  completing
                }
                className="flex items-center gap-1 rounded-md px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <Icon.ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {showFinishModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">
              Finish coding assessment?
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              You've submitted {answeredCount} of {totalQuestions} questions.
              Every question must be submitted before you can complete the
              assessment. This can't be undone.
            </p>

            <div className="mt-4 space-y-1.5">
              {questions.map((question, index) => {
                const qid = question.questionId ?? question.question_id;
                const answer = answers[qid];
                const submitted = Boolean(answer?.submitResult);
                const score = answer?.submitResult?.submission?.score ?? 0;
                const totalMarks =
                  answer?.submitResult?.submission?.totalMarks ??
                  question.totalMarks ??
                  100;

                return (
                  <div
                    key={qid}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-slate-700">
                      Question {index + 1}: {question.title}
                    </span>

                    <span
                      className={`flex items-center gap-1 font-mono font-semibold ${
                        submitted ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {submitted && <Icon.Check className="h-3 w-3" />}
                      {submitted ? `${score}/${totalMarks}` : "Not submitted"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                disabled={completing}
                className="rounded-md px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Keep working
              </button>

              <button
                type="button"
                onClick={handleFinishConfirmed}
                disabled={completing || answeredCount < totalQuestions}
                className="rounded-md bg-[#111318] px-5 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:opacity-50"
              >
                {completing ? "Finalizing…" : "Finish assessment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialCodingAssessment;