import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  MessageCircle,
  Trophy,
  CheckSquare,
  Sparkles,
  Target,
  ArrowRight,
  Check,
  BookOpen,
  Clock3,
  Timer,
  Megaphone,
  X,
  Rocket,
  PartyPopper,
  BriefcaseBusiness,
  CircleDollarSign,
  BookMarked,
} from "lucide-react";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import AppDialog from '../components/ui/AppDialog';

import {
  getStudentDashboard,
  getMyTasks,
  getMyAchievements,
  getMyRecommendations,
  getMyAssignments,
  getRecommendedJobs,
  getNotifications,
  getMyInterview,
  getMyJobApplications,
  getApplicationVideoUrl,
  getAnnouncements,
  markAnnouncementNotificationsRead,
   getAssessmentOverview,
  getMyAssessmentReports
} from '../services/api';


// ----------------------------------------------------
// Helper
// ----------------------------------------------------

const fmtRel = (iso) => {
  if (!iso) return '-';

  const diff = (new Date() - new Date(iso)) / 60000;

  if (diff < 0) {
    const futureMinutes = Math.abs(diff);

    if (futureMinutes < 60) {
      return `in ${Math.round(futureMinutes)}m`;
    }

    if (futureMinutes < 1440) {
      return `in ${Math.round(futureMinutes / 60)}h`;
    }

    return `in ${Math.round(futureMinutes / 1440)}d`;
  }

  if (diff < 60) {
    return `${Math.max(0, Math.round(diff))}m ago`;
  }

  if (diff < 1440) {
    return `${Math.round(diff / 60)}h ago`;
  }

  return `${Math.round(diff / 1440)}d ago`;
};


// ----------------------------------------------------
// Dashboard navigation cards
// ----------------------------------------------------


const moduleCards = [
  {
    to: '/app/learning',
    icon: MessageCircle,
    title: 'Learning Module',
    sub: 'Continue your video lessons',
  },
  {
    to: '/app/achievements',
    icon: Trophy,
    title: 'Achievements',
    sub: 'View your badges and certificates',
  },
  {
    to: '/app/tasks',
    icon: CheckSquare,
    title: 'Tasks & Deadlines',
    sub: 'Stay on top of your assignments',
  },
  {
    to: '/app/recommendations',
    icon: Sparkles,
    title: 'Course Recommendations',
    sub: 'Picked for your goals',
  },
];


// ----------------------------------------------------
// Reusable professional hover classes
// ----------------------------------------------------

const boxHover =
  'group transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]';



const buttonHover =
  'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(37,99,235,0.24)] active:translate-y-0 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-brand-blue-500/20';


// ----------------------------------------------------
// Component
// ----------------------------------------------------

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ----------------------------------------------------
  // State
  // ----------------------------------------------------

  const [dash, setDash] = useState(null);
  const [assessmentOverview, setAssessmentOverview] = useState(null);
  const [terminationReport, setTerminationReport] = useState(null);
  const [assessmentStatusLoading, setAssessmentStatusLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recs, setRecs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [dashError, setDashError] = useState(null);

  const [dialog, setDialog] = useState({
    open: false,
    type: 'error',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    destructive: false,
    onConfirm: null,
  });


  // ----------------------------------------------------
  // Dialog helpers
  // ----------------------------------------------------

  const closeDialog = () => {
    setDialog((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const showDialog = (options) => {
    setDialog({
      open: true,
      type: 'error',
      title: 'Something went wrong',
      message: '',
      confirmText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      destructive: false,
      onConfirm: closeDialog,
      ...options,
    });
  };


  // ----------------------------------------------------
  // Announcement helpers
  // ----------------------------------------------------

  const dismissedKey = `edu_dismissed_announcements_${user?.id || 'student'}`;

  /*
   * IMPORTANT:
   * The previous version had:
   *
   * }, [getDismissedIds]);
   *
   * This referenced the callback itself and could cause
   * initialization/dependency problems.
   *
   * It should depend on dismissedKey instead.
   */
  const getDismissedIds = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(dismissedKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [dismissedKey]);


  const markSeenLocally = (id) => {
    try {
      const seenKey = `edu_seen_announcements_${user?.id || 'student'}`;
      const raw = localStorage.getItem(seenKey);
      const seen = raw ? JSON.parse(raw) : [];

      if (!seen.includes(id)) {
        localStorage.setItem(
          seenKey,
          JSON.stringify([...seen, id])
        );
      }
    } catch {}
  };


  const handleAnnouncementClick = (id) => {
    try {
      const dismissed = getDismissedIds();

      if (!dismissed.includes(id)) {
        localStorage.setItem(
          dismissedKey,
          JSON.stringify([...dismissed, id])
        );
      }
    } catch {}

    markSeenLocally(id);

    markAnnouncementNotificationsRead(id).finally(() => {
      window.dispatchEvent(
        new CustomEvent('notifications_updated')
      );

      window.dispatchEvent(
        new CustomEvent('announcements_seen')
      );
    });

    setAnnouncements((prev) =>
      prev.filter((a) => a.id !== id)
    );

    navigate('/app/student-community', {
      state: {
        activeTab: 'Announcements',
      },
    });
  };


  const handleDismissOnly = (e, id) => {
    e.stopPropagation();

    try {
      const dismissed = getDismissedIds();

      if (!dismissed.includes(id)) {
        localStorage.setItem(
          dismissedKey,
          JSON.stringify([...dismissed, id])
        );
      }
    } catch {}

    markSeenLocally(id);

    markAnnouncementNotificationsRead(id).finally(() => {
      window.dispatchEvent(
        new CustomEvent('notifications_updated')
      );

      window.dispatchEvent(
        new CustomEvent('announcements_seen')
      );
    });

    setAnnouncements((prev) =>
      prev.filter((a) => a.id !== id)
    );
  };


  // ----------------------------------------------------
  // Load dashboard data
  // ----------------------------------------------------

  const loadDashboardData = React.useCallback(() => {
    setDashError(null);

    // Dashboard
    getStudentDashboard()
      .then((data) => {
        setDash(data);
        setDashError(null);
      })
      .catch((err) => {
        console.error('Dashboard error:', err);

        setDashError(
          err.response?.data?.error ||
            err.message ||
            'Failed to load dashboard'
        );
      });


    // Announcements
    getAnnouncements()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];

        let dismissed = [];

        try {
          const rawDismissed =
            localStorage.getItem(dismissedKey);

          dismissed = rawDismissed
            ? JSON.parse(rawDismissed)
            : [];
        } catch {
          dismissed = [];
        }

        setAnnouncements(
          list.filter(
            (a) => !dismissed.includes(a.id)
          )
        );
      })
      .catch((err) => {
        console.error(
          'Announcements error:',
          err
        );

        setAnnouncements([]);
      });


    // Tasks
    getMyTasks({ status: 'pending' })
      .then(setTasks)
      .catch(() => {});


    // Achievements
    getMyAchievements()
      .then(setAchievements)
      .catch(() => {});


    // Recommendations
    getMyRecommendations()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : [];

        const normalized = [];

        list.forEach((item, itemIdx) => {
          if (
            item.type === 'ai_suggestions' ||
            item.source === 'ai'
          ) {
            const suggestions = Array.isArray(
              item.suggestions
            )
              ? item.suggestions
              : [];

            suggestions.forEach((s, idx) => {
              normalized.push({
                id:
                  s.course_id ||
                  `ai-${itemIdx}-${idx}`,

                title:
                  s.title ||
                  'Recommended Course',

                description:
                  s.description ||
                  s.reason ||
                  'AI generated recommendation for you.',

                category:
                  s.category ||
                  'AI Recommendation',

                difficulty:
                  s.difficulty ||
                  'Intermediate',

                thumbnail_url:
                  s.thumbnail_url ||
                  null,

                reason:
                  s.reason ||
                  'Recommended based on your career path',

                source: 'ai',
              });
            });
          } else if (item.course) {
            normalized.push({
              ...item.course,

              reason:
                item.reason ||
                'Recommended based on your skill gap',

              source: 'curated',
            });
          } else if (item.id && item.title) {
            normalized.push({
              ...item,

              reason:
                item.reason ||
                'Recommended course',

              source: 'curated',
            });
          }
        });

        setRecs(normalized);
      })
      .catch((err) => {
        console.error(
          'Recommendations error:',
          err
        );

        setRecs([]);
      });


    // Assignments
    getMyAssignments()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.assignments)
          ? data.assignments
          : [];

        setAssignments(list);
      })
      .catch((err) => {
        console.error(
          'Assignments error:',
          err
        );

        setAssignments([]);
      });


    // Recommended jobs
    getRecommendedJobs()
      .then((data) => {
        setRecommendedJobs(
          Array.isArray(data)
            ? data
            : data?.jobs || []
        );
      })
      .catch(() => {
        setRecommendedJobs([]);
      });


    // Career notifications
    getNotifications()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : [];

        const now = Date.now();

        const twentyFourHours =
          24 * 60 * 60 * 1000;

        const filteredNotifications = list
          .map((notification) => ({
            ...notification,

            normalizedType: (
              notification.type || ''
            )
              .trim()
              .toLowerCase()
              .replace(/[\s-]+/g, '_'),
          }))
          .filter((notification) => {
            const notificationAge =
              now -
              new Date(
                notification.created_at
              ).getTime();

            return (
              notificationAge <=
                twentyFourHours &&
              [
                'job_invitation',
                'application',
                'application_selected',
                'interview_scheduled',
                'interview_rescheduled',
                'interview_cancelled',
              ].includes(
                notification.normalizedType
              )
            );
          });


        const applicationNotifications =
          filteredNotifications
            .filter(
              (notification) =>
                notification.normalizedType ===
                'application'
            )
            .sort(
              (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
            );


        const latestApplication =
          applicationNotifications.length > 0
            ? [applicationNotifications[0]]
            : [];


        const otherNotifications =
          filteredNotifications.filter(
            (notification) =>
              notification.normalizedType !==
              'application'
          );


        const studentNotifications = [
          ...latestApplication,
          ...otherNotifications,
        ].sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );

        setNotifications(
          studentNotifications
        );
      })
      .catch(() => {
        setNotifications([]);
      });


    // My applications
    getMyJobApplications()
      .then((data) => {
        const applications = Array.isArray(data)
          ? data
          : Array.isArray(data?.applications)
          ? data.applications
          : [];

        setMyApplications(applications);
      })
      .catch((err) => {
        console.error(
          'My applications error:',
          err.response?.data ||
            err.message
        );

        setMyApplications([]);
      });
  }, [dismissedKey]);


  // ----------------------------------------------------
  // Initial loading
  // ----------------------------------------------------

  useEffect(() => {
    loadDashboardData();

    const handleTokenReady = () => {
      loadDashboardData();
    };

    window.addEventListener(
      'edu_token_ready',
      handleTokenReady
    );

    return () =>
      window.removeEventListener(
        'edu_token_ready',
        handleTokenReady
      );
  }, [loadDashboardData]);

  useEffect(() => {
  let cancelled = false;

  const loadAssessmentStatus = async () => {
    try {
      const [overview, reports] = await Promise.all([
        getAssessmentOverview(),
        getMyAssessmentReports(),
      ]);

      if (cancelled) return;

      setAssessmentOverview(overview);

      const sessionId =
        overview?.initialAssessment?.sessionId;

      const initialReports = Array.isArray(reports)
  ? reports
      .filter(
        (report) =>
          report.assessment_stage === "INITIAL_QUIZ"
      )
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
  : [];

 const currentReport =
  initialReports.find(
    (report) =>
      Number(report.quiz_session_id) ===
        Number(sessionId) &&
      report.assessment_stage === "INITIAL_QUIZ"
  ) || null;

      setTerminationReport(currentReport);
    } catch (err) {
      console.error(
        "Failed to load assessment status:",
        err
      );
    } finally {
      if (!cancelled) {
        setAssessmentStatusLoading(false);
      }
    }
  };

  loadAssessmentStatus();

  return () => {
    cancelled = true;
  };
}, []);


  // ----------------------------------------------------
  // Interview
  // ----------------------------------------------------

  const handleViewInterview = async (jobId) => {
    if (!jobId) return;

    try {
      setLoadingInterview(true);

      const data =
        await getMyInterview(jobId);

      setSelectedInterview(data);
    } catch (err) {
      console.error(
        'Failed to load interview:',
        err.response?.data ||
          err.message
      );

      showDialog({
        type: 'error',
        title: 'Interview Unavailable',
        message:
          err.response?.data?.error ||
          'Failed to load interview details.',
        confirmText: 'OK',
      });
    } finally {
      setLoadingInterview(false);
    }
  };


  // ----------------------------------------------------
  // Loading state
  // ----------------------------------------------------
  if (!dash || assessmentStatusLoading) {
    return (
      <div
        className="
          min-h-screen
          bg-gradient-to-br
          from-slate-50
          via-white
          to-blue-50/30
          flex
          flex-col
          items-center
          justify-center
          gap-4
          px-6
        "
      >
        <div
          className="
            w-14
            h-14
            rounded-2xl
            bg-brand-blue-50
            border
            border-brand-blue-100
            grid
            place-items-center
            shadow-sm
          "
        >
          <div
            className="
              w-6
              h-6
              rounded-full
              border-2
              border-brand-blue-200
              border-t-brand-blue-600
              animate-spin
            "
          />
        </div>

        <div className="text-center">
          <div className="text-slate-700 font-semibold">
            {dashError
              ? 'Unable to load dashboard data.'
              : 'Loading your dashboard...'}
          </div>

          <div className="mt-1 text-xs text-slate-400">
            {dashError
              ? 'Please try again.'
              : 'Preparing your personalized learning overview.'}
          </div>
        </div>

        {dashError && (
          <Button
            size="sm"
            onClick={() => loadDashboardData()}
            className={buttonHover}
          >
            Retry
          </Button>
        )}
      </div>
    );
  }


  // ----------------------------------------------------
  // Assessment
  // ----------------------------------------------------


if (
  assessmentOverview?.initialAssessment?.status === "Terminated" &&
  terminationReport?.status !== "Approved"
) {
  return (
    <div className="min-h-screen bg-gray-100 px-3 py-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white px-6 py-8 text-center shadow-sm">

          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <span className="text-2xl font-medium text-red-500">
              !
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">
            Assessment Terminated
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Your Initial Assessment was terminated because a proctoring
            violation was detected.
          </p>

          {/* Report Status */}
          <div className="mx-auto mt-5 max-w-xl rounded-lg border border-yellow-200 bg-yellow-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-800">
              Report Status
            </p>

            <p className="mt-1 text-lg font-semibold text-yellow-700">
              {terminationReport?.status || "Not Submitted"}
            </p>

            <p className="mt-2 text-sm text-yellow-700">
              You cannot restart the assessment until your report is approved
              by Admin.
            </p>
          </div>

          {/* Admin Response */}
          {terminationReport?.admin_notes && (
            <div className="mx-auto mt-4 max-w-xl rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                Admin Response
              </p>

              <p className="mt-1 text-sm text-blue-700">
                {terminationReport.admin_notes.trim()
                  ? terminationReport.admin_notes
                  : "No additional response was provided by Admin."}
              </p>
            </div>
          )}

          {/* Contact Admin */}
          <div className="mt-5">
            <Link
              to={`/app/help-support?category=assessment_termination&sessionId=${assessmentOverview?.initialAssessment?.sessionId}&assessmentType=INITIAL&assessmentStage=INITIAL_QUIZ&open=report`}
            >
              <Button variant="primary">
                Contact Admin
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}


if (
  assessmentOverview?.initialAssessment?.status ===
    "Terminated" &&
  terminationReport?.status === "Approved"
) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-10 text-center">

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl text-green-600">
              ✓
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Restart Approved
          </h1>

          <p className="mt-4 text-gray-500">
            Admin has approved your assessment termination report.
          </p>
{terminationReport?.admin_notes &&
  terminationReport.admin_notes.trim() &&
  terminationReport.admin_notes.trim().toLowerCase() !== "null" && (
  <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-left">
    <p className="text-sm font-semibold text-blue-800">
      Admin Response
    </p>

    <p className="mt-1 text-sm text-blue-700">
      {terminationReport.admin_notes.trim()}
    </p>
  </div>
)}


          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm font-semibold text-green-800">
              Your assessment can now be restarted.
            </p>

            <p className="mt-2 text-sm text-green-700">
              Click the button below to start a new assessment session.
            </p>
          </div>

          <Button
  variant="primary"
  className="mt-6"
  onClick={() =>
    navigate("/app/initial-assessment", {
      state: {
        phase: "quiz",
        restartApproved: true,
      },
    })
  }
>
  Restart Assessment →
</Button>

        </div>
      </div>
    </div>
  );
}


  if (!dash.assessmentCompleted) {
    return (
      <div
        className="
          min-h-screen
          bg-gradient-to-br
          from-slate-50
          via-white
          to-blue-50/40
          p-4
          sm:p-8
          flex
          items-center
        "
      >
        <div className="max-w-4xl mx-auto w-full">

          <div
            className="
              group
              bg-white
              rounded-3xl
              border border-slate-200
              shadow-[0_20px_60px_rgba(15,23,42,0.10)]
              p-7
              sm:p-10
              lg:p-14
              text-center
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-brand-blue-200
              hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]
            "
          >

            <div
              className="
                mx-auto
                w-16
                h-16
                rounded-2xl
                bg-brand-blue-50
                border border-brand-blue-100
                grid
                place-items-center
                text-3xl
                shadow-sm
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:-rotate-2
              "
            >
              <Target className="h-8 w-8 text-brand-blue-600" strokeWidth={2} />
            </div>

            <div className="mt-6 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
              Personalize your learning path
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Initial Skill Assessment
            </h1>

            <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-gray-500">
              Complete this assessment to personalize your
              learning path and get recommendations based
              on your current skills and career goals.
            </p>

            <Link
              to="/app/initial-assessment"
              className={`
                inline-flex
                items-center
                justify-center
                mt-8
                px-6
                py-3
                rounded-xl
                bg-blue-600
                text-white
                font-semibold
                shadow-sm
                hover:bg-blue-700
                ${buttonHover}
              `}
            >
              Start Skill Assessment

              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />
              </span>
            </Link>

          </div>

        </div>
      </div>
    );
  }


  // ----------------------------------------------------
  // Dashboard calculations
  // ----------------------------------------------------

  const nextDeadline = tasks[0];

  const appliedJobIds = new Set(
    myApplications
      .map(
        (application) =>
          application.job_id ??
          application.job?.id
      )
      .filter(Boolean)
      .map(String)
  );


  const availableJobs =
    recommendedJobs.filter(
      (job) =>
        !appliedJobIds.has(
          String(job.id)
        )
    );


  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------

  return (
    <>
      <AppDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        showCancel={dialog.showCancel}
        destructive={dialog.destructive}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />


      <div className="space-y-6 pb-8">

        {/* ================================================= */}
        {/* Welcome */}
        {/* ================================================= */}

        <Card
          className="
            !p-0
            overflow-hidden
            bg-gradient-to-br
            from-brand-blue-500
            via-brand-blue-600
            to-brand-blue-700
            text-white
            border-0
            shadow-lg
            shadow-brand-blue-500/10
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_20px_40px_rgba(37,99,235,0.18)]
          "
        >

          <div
            className="
              relative
              overflow-hidden
              p-6
              sm:p-7
              lg:p-8
            "
          >

            <div
              className="
                absolute
                -right-20
                -top-24
                w-64
                h-64
                rounded-full
                bg-white/10
                blur-2xl
                pointer-events-none
              "
            />

            <div
              className="
                absolute
                right-10
                bottom-[-100px]
                w-52
                h-52
                rounded-full
                bg-blue-300/10
                blur-2xl
                pointer-events-none
              "
            />

            <div className="relative flex flex-col xl:flex-row items-start xl:items-center justify-between gap-7">

              <div className="min-w-0">

                <div className="text-[11px] uppercase tracking-[0.16em] text-white/65 font-semibold">
                  Welcome back
                </div>

                <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">

                  {user?.username?.replace(/^@/, '') || user?.name?.split(' ')[0] ||
                    user?.name ||
                    'Student'}

                  {dash?.domainRole &&
                    `, aspiring ${dash.domainRole}`}

                </h2>

                <p className="mt-1 text-sm sm:text-base font-normal text-white/85">
                  Let's close those skill gaps. <Rocket className="h-4 w-4 text-white/90" strokeWidth={2} />
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/75">

                  <span>
                    Readiness Score:
                    <strong className="ml-1 text-lg text-white">
                      {dash?.readinessScore ?? 0}%
                    </strong>
                  </span>

                  <span className="hidden sm:inline text-white/40">

                  </span>

                  <span>
                    {dash?.coursesEnrolled ?? 0}{' '}
                    active courses
                  </span>

                </div>

              </div>


              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">

                <div className="flex flex-wrap items-center gap-2">

                  <Link to="/app/learning-paths">
                    <Button
                      variant="accent"
                      className={buttonHover}
                    >
                      View Learning Path
                    </Button>
                  </Link>

                  <Link to="/app/recommendations">
                    <Button
                      variant="accent"
                      className={buttonHover}
                    >
                      View Recommendations
                    </Button>
                  </Link>

                </div>


                <div className="flex items-center gap-3">

                  <div className="transition-transform duration-300 hover:scale-105">
                    <ProgressRing
                      value={
                        dash?.readinessScore ?? 0
                      }
                      size={88}
                    />
                  </div>

                  <Link to="/app/courses">
                    <Button
                      variant="accent"
                      className={buttonHover}
                    >
                      Continue Learning <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />
                    </Button>
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </Card>


        {/* ================================================= */}
        {/* Key Metrics */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <Card
            className={`
              !p-5
              min-h-[132px]
              flex
              flex-col
              justify-between
              ${boxHover}
            `}
          >
            <div className="flex items-center justify-between gap-3">

              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Courses Enrolled
              </div>

              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center text-sm">
                <BookOpen className="h-4 w-4" strokeWidth={2} />
              </span>

            </div>

            <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-blue-700 transition-transform duration-300 group-hover:scale-[1.03]">
              {dash?.coursesEnrolled ?? 0}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              {dash?.activeCourses ?? 0} active
            </div>
          </Card>


          <Card
            className={`
              !p-5
              min-h-[132px]
              flex
              flex-col
              justify-between
              ${boxHover}
            `}
          >
            <div className="flex items-center justify-between gap-3">

              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Achievements Earned
              </div>

              <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 grid place-items-center text-sm">
                <Trophy className="h-4 w-4" strokeWidth={2} />
              </span>

            </div>

            <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-brand-orange-600 transition-transform duration-300 group-hover:scale-[1.03]">
              {achievements.length}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Badges collected
            </div>
          </Card>


          <Card
            className={`
              !p-5
              min-h-[132px]
              flex
              flex-col
              justify-between
              ${boxHover}
            `}
          >
            <div className="flex items-center justify-between gap-3">

              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Tasks Due This Week
              </div>

              <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center text-sm">
                <Clock3 className="h-4 w-4" strokeWidth={2} />
              </span>

            </div>

            <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-red-600 transition-transform duration-300 group-hover:scale-[1.03]">
              {dash?.tasksDue ?? 0}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Upcoming Tasks
            </div>
          </Card>


          <Card
            className={`
              !p-5
              min-h-[132px]
              flex
              flex-col
              justify-between
              ${boxHover}
            `}
          >
            <div className="flex items-center justify-between gap-3">

              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Learning Hours Logged
              </div>

              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 grid place-items-center text-sm">
                <Timer className="h-4 w-4" strokeWidth={2} />
              </span>

            </div>

            <div className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-700 transition-transform duration-300 group-hover:scale-[1.03]">
              {dash?.learningHoursLogged ?? 0}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Hours this month
            </div>
          </Card>

        </div>


        {/* ================================================= */}
        {/* Announcements */}
        {/* ================================================= */}

        {announcements.length > 0 && (
          <Card
            className="
              !p-0
              overflow-hidden
              border-l-4
              border-l-amber-500
              bg-gradient-to-br
              from-amber-50/70
              via-white
              to-white
              shadow-sm
              transition-all
              duration-300
              hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]
            "
          >

            <div className="p-5 sm:p-6">

              <div className="flex items-start sm:items-center justify-between gap-4 mb-4">

                <div className="flex items-center gap-2.5 min-w-0">

                  <span
                    className="
                      w-9 h-9
                      rounded-xl
                      bg-amber-100
                      text-amber-700
                      grid
                      place-items-center
                      text-sm
                      font-bold
                      shrink-0
                      shadow-sm
                      ring-1
                      ring-amber-200/70
                      transition-transform
                      duration-300
                      hover:scale-110
                      hover:-rotate-3
                    "
                  >
                    <Megaphone className="h-4 w-4" strokeWidth={2} />
                  </span>

                  <div className="min-w-0">

                    <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight">
                      Course Announcements
                    </h3>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Click any announcement to open in Community Feed
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-2 shrink-0">

                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold ring-1 ring-amber-200/70">
                    {announcements.length} New
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/app/student-community', {
                        state: {
                          activeTab: 'Announcements',
                        },
                      })
                    }
                    className="
                      text-xs
                      text-brand-blue-600
                      hover:text-brand-blue-700
                      hover:underline
                      font-semibold
                      hidden
                      sm:inline
                      transition-all
                      duration-200
                    "
                  >
                    Community Feed <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />
                  </button>

                </div>

              </div>


              <div className="space-y-3">

                {announcements.map((a) => (
                  <div
                    key={a.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      handleAnnouncementClick(a.id)
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' ||
                        e.key === ' '
                      ) {
                        e.preventDefault();
                        handleAnnouncementClick(
                          a.id
                        );
                      }
                    }}
                    className="
                      group
                      p-4 sm:p-5
                      rounded-2xl
                      bg-white
                      border border-amber-200/80
                      shadow-sm
                      transition-all
                      duration-300
                      ease-out
                      hover:-translate-y-1
                      hover:border-amber-300
                      hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]
                      cursor-pointer
                      relative
                      focus:outline-none
                      focus:ring-4
                      focus:ring-amber-500/15
                    "
                  >

                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">

                      <div className="flex items-center gap-2 min-w-0">

                        <span className="font-semibold text-slate-800 text-sm group-hover:text-amber-800 transition-colors duration-200 truncate">
                          {a.title}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium shrink-0">
                          {a.audience === 'course'
                            ? 'My Course'
                            : 'All Learners'}
                        </span>

                      </div>


                      <div className="flex items-center gap-2">

                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 flex items-center gap-1.5">

                          {a.educator?.name && (
                            <span className="font-medium text-slate-700">
                              By {a.educator.name}
                            </span>
                          )}

                          <span> </span>

                          <span>
                            {fmtRel(a.created_at)}
                          </span>

                        </div>


                        <button
                          type="button"
                          onClick={(e) =>
                            handleDismissOnly(
                              e,
                              a.id
                            )
                          }
                          title="Dismiss from dashboard"
                          aria-label="Dismiss announcement"
                          className="
                            w-6 h-6
                            rounded-full
                            text-slate-300
                            hover:text-slate-600
                            hover:bg-slate-100
                            grid
                            place-items-center
                            text-xs
                            transition-all
                            duration-200
                            hover:scale-110
                            active:scale-95
                          "
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>

                      </div>

                    </div>


                    <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">
                      {a.message}
                    </p>


                    <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-amber-700 font-medium pt-2 border-t border-amber-50">

                      <span className="group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center gap-1">
                        <span>
                          View in Community Feed
                        </span>

                        <span><ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} /></span>
                      </span>

                      <span className="text-slate-400 font-normal">
                        Click to open & clear from dashboard
                      </span>

                    </div>

                  </div>
                ))}

              </div>

            </div>

          </Card>
        )}


        {/* ================================================= */}
        {/* Analytics + Recent Activity */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">

          <Card
            title="Learning Analytics"
            className="lg:col-span-2 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
          >

            <div className="h-80 sm:h-96 overflow-hidden -mt-2">

              <div className="overflow-x-auto overflow-y-hidden h-full px-1 sm:px-2">

                <div
                  className="
                    h-full
                    rounded-xl
                    transition-all
                    duration-300
                    ease-out
                    hover:bg-slate-50/40
                  "
                  style={{
                    minWidth: Math.max(
                      (dash?.learningAnalytics
                        ?.length || 4) * 120,
                      600
                    ),
                  }}
                >

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={
                        dash?.learningAnalytics ||
                        []
                      }
                      margin={{
                        top: 0,
                        right: 20,
                        left: 10,
                        bottom: 10,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="label"
                        tick={{
                          fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        domain={[0, 100]}
                        unit="%"
                        ticks={[
                          0,
                          20,
                          40,
                          60,
                          80,
                          100,
                        ]}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: 14,
                          border:
                            '1px solid rgba(226,232,240,.9)',
                          boxShadow:
                            '0 14px 30px rgba(15,23,42,.12)',
                        }}
                      />

                      <Legend
                        verticalAlign="top"
                        height={35}
                        wrapperStyle={{
                          paddingTop: 0,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="readiness"
                        name="Readiness"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{
                          r: 6,
                          strokeWidth: 2,
                          fill: '#fff',
                        }}
                        activeDot={{ r: 9 }}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                      />

                      <Line
                        type="monotone"
                        dataKey="lessonPercentage"
                        name="Lessons"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{
                          r: 6,
                          strokeWidth: 2,
                          fill: '#fff',
                        }}
                        activeDot={{ r: 9 }}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                      />

                      <Line
                        type="monotone"
                        dataKey="assignmentPercentage"
                        name="Assignments"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{
                          r: 6,
                          strokeWidth: 2,
                          fill: '#fff',
                        }}
                        activeDot={{ r: 9 }}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>

          </Card>


          <div className="flex flex-col gap-4 sm:gap-6 h-full">

            {/* Recent Activity */}

            <Card
              title="Recent Activity"
              className="flex-1 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
            >

              <ul className="space-y-2.5 text-sm">

                {(dash?.recentActivity || []).map(
                  (a, idx) => (
                    <li
                      key={
                        a.id ||
                        `act-${idx}`
                      }
                      className="
                        group
                        flex
                        items-center
                        gap-2.5
                        rounded-xl
                        px-3
                        py-2.5
                        -mx-3
                        border
                        border-transparent
                        transition-all
                        duration-300
                        ease-out
                        hover:bg-slate-50
                        hover:border-slate-200
                        hover:shadow-sm
                        hover:-translate-y-0.5
                      "
                    >

                      <span
                        className="
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-brand-green-50
                          text-brand-green-600
                          text-xs
                          font-bold
                          transition-all
                          duration-300
                          group-hover:scale-110
                          group-hover:bg-brand-green-100
                        "
                      >
                        <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
                      </span>

                      <span className="flex-1 truncate text-slate-700 group-hover:text-slate-900 transition-colors">
                        {a.title}
                      </span>

                      <span className="text-[11px] text-slate-400 shrink-0">
                        {a.when}
                      </span>

                    </li>
                  )
                )}

                {(!dash?.recentActivity ||
                  dash.recentActivity.length === 0) && (
                  <li className="text-sm text-slate-400 text-center py-5">
                    No recent activity yet.
                  </li>
                )}

              </ul>

            </Card>


            {/* Next Deadline */}

            <Card
              title="Next Deadline"
              className="flex-1 flex flex-col justify-center overflow-hidden transition-all duration-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
            >

              {nextDeadline ? (
                <div
                  className="
                    group
                    rounded-xl
                    bg-slate-50
                    border border-slate-100
                    p-3.5
                    transition-all
                    duration-300
                    ease-out
                    hover:-translate-y-1
                    hover:bg-white
                    hover:border-brand-blue-200
                    hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]
                  "
                >

                  <div className="font-semibold text-slate-800 tracking-tight group-hover:text-brand-blue-700 transition-colors">
                    {nextDeadline.title}
                  </div>

                  <div className="mt-1.5 text-xs font-medium text-slate-500">
                    Due {fmtRel(
                      nextDeadline.due_date
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="text-2xl">
                    <PartyPopper className="h-5 w-5" strokeWidth={2} />
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Nothing due. Great work!
                  </p>
                </div>
              )}

            </Card>

          </div>

        </div>


        {/* ================================================= */}
        {/* Navigation Cards */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {moduleCards.map((m) => (

            <Link
              key={m.to}
              to={m.to}
              className="group block h-full"
            >

              <Card
                className="
                  !p-4 sm:!p-5
                  h-full
                  rounded-2xl
                  border-slate-200/80
                  transition-all
                  duration-300
                  ease-out
                  hover:-translate-y-1.5
                  hover:border-brand-blue-200
                  hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)]
                "
              >

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-slate-50
                    border border-slate-100
                    grid place-items-center
                    text-2xl
                    shadow-sm
                    transition-all
                    duration-300
                    ease-out
                    group-hover:scale-110
                    group-hover:-rotate-2
                    group-hover:bg-brand-blue-50
                    group-hover:border-brand-blue-100
                  "
                >
                  {m.emoji}
                </div>


                <div
                  className="
                    font-semibold
                    text-slate-900
                    mt-3
                    tracking-tight
                    transition-colors
                    duration-200
                    group-hover:text-brand-blue-700
                  "
                >
                  {m.title}
                </div>


                <div className="text-xs leading-relaxed text-slate-500 mt-1">
                  {m.sub}
                </div>


                <div
                  className="
                    mt-4
                    text-xs
                    font-semibold
                    text-brand-blue-600
                    transition-all
                    duration-200
                    group-hover:text-brand-blue-700
                    group-hover:translate-x-1
                  "
                >
                  Open <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />
                </div>

              </Card>

            </Link>

          ))}

        </div>


        {/* ================================================= */}
        {/* Assigned Courses */}
        {/* ================================================= */}

        {assignments.length > 0 && (
          <Card
            title="Assigned to You"
            action={
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                {assignments.length} from your educators
              </span>
            }
            className="transition-all duration-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
          >

            <ul className="space-y-3">

              {assignments.map((a) => {

                const overdue =
                  a.due_date &&
                  a.status !== 'completed' &&
                  new Date(a.due_date) <
                    new Date();


                return (
                  <li
                    key={a.id}
                    className="
                      group
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      gap-3.5
                      p-4
                      rounded-2xl
                      border
                      border-slate-200/80
                      bg-white
                      transition-all
                      duration-300
                      ease-out
                      hover:-translate-y-1
                      hover:bg-slate-50
                      hover:border-slate-300
                      hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)]
                    "
                  >

                    <div
                      className="
                        w-11 h-11
                        rounded-xl
                        bg-brand-blue-50
                        border border-brand-blue-100
                        grid
                        place-items-center
                        text-2xl
                        shrink-0
                        shadow-sm
                        transition-all
                        duration-300
                        ease-out
                        group-hover:scale-110
                        group-hover:-rotate-2
                        group-hover:bg-brand-blue-100
                      "
                    >
                      <BookOpen className="h-4 w-4" strokeWidth={2} />
                    </div>


                    <div className="flex-1 min-w-0">

                      <div className="font-semibold text-slate-800 truncate tracking-tight group-hover:text-brand-blue-700 transition-colors">
                        {a.course?.title ||
                          'Course'}
                      </div>


                      <div className="mt-1 text-xs text-slate-500 truncate">

                        Assigned by{' '}
                        {a.educator_name ||
                          'your educator'}

                        {a.due_date && (
                          <>
                            {' . '}

                            <span
                              className={
                                overdue
                                  ? 'text-red-600 font-medium'
                                  : ''
                              }
                            >
                              Due{' '}
                              {new Date(
                                a.due_date
                              ).toLocaleDateString()}

                              {overdue &&
                                ' (overdue)'}
                            </span>
                          </>
                        )}

                        {!a.due_date &&
                          ' . No due date'}

                      </div>


                      {a.note && (
                        <div className="mt-2 text-[11px] text-slate-500 italic truncate">
                          â€œ{a.note}â€
                        </div>
                      )}

                    </div>


                    <div className="flex items-center justify-between sm:justify-end gap-2">

                      <span
                        className={`
                          text-[10px]
                          uppercase
                          tracking-wider
                          px-2.5
                          py-1
                          rounded-full
                          font-semibold
                          ring-1
                          ring-inset
                          transition-all
                          duration-200
                          group-hover:scale-105
                          ${
                            a.status ===
                            'completed'
                              ? 'bg-brand-green-50 text-brand-green-700'
                              : a.status ===
                                'in-progress'
                              ? 'bg-brand-blue-50 text-brand-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }
                        `}
                      >
                        {a.status}
                      </span>


                      <Link
                        to={`/app/courses/${a.course_id}`}
                        className={`
                          inline-flex
                          items-center
                          justify-center
                          text-xs
                          font-semibold
                          px-3
                          py-1.5
                          rounded-lg
                          bg-brand-blue-600
                          text-white
                          shadow-sm
                          hover:bg-brand-blue-700
                          ${buttonHover}
                        `}
                      >
                        Start
                      </Link>

                    </div>

                  </li>
                );
              })}

            </ul>

          </Card>
        )}


        {/* ================================================= */}
        {/* Job Opportunities */}
        {/* ================================================= */}

        {availableJobs.length > 0 && (
          <Card
            title="Job Opportunities"
            action={
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                {availableJobs.length} job
                {availableJobs.length !==
                1
                  ? 's'
                  : ''}{' '}
                matched
              </span>
            }
            className="transition-all duration-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
          >

            <div className="space-y-3">

              {availableJobs.map((job) => (

                <div
                  key={job.id}
                  className="
                    group
                    p-5 sm:p-6
                    rounded-2xl
                    border
                    border-slate-200/80
                    bg-white
                    hover:bg-slate-50
                    hover:border-slate-300
                    hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]
                    hover:-translate-y-1
                    transition-all
                    duration-300
                  "
                >

                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start gap-3.5">

                        <span
                          className="
                            text-2xl
                            transition-transform
                            duration-300
                            group-hover:scale-110
                            group-hover:-rotate-3
                          "
                        >
                          <BriefcaseBusiness className="h-4 w-4" strokeWidth={2} />
                        </span>

                        <div>

                          <h3 className="font-semibold text-slate-900 text-lg tracking-tight group-hover:text-brand-blue-700 transition-colors">
                            {job.title}
                          </h3>

                          <p className="text-xs text-slate-500 mt-0.5">
                            Job Opportunity
                          </p>

                        </div>

                      </div>


                      <div className="flex flex-wrap gap-x-4 gap-y-2.5 mt-5 text-xs text-slate-600">

                        {job.location && (
                          <span className="transition-colors group-hover:text-slate-800">
                            ðŸ“ {job.location}
                          </span>
                        )}

                        {job.employment_type && (
                          <span className="transition-colors group-hover:text-slate-800">
                            <BriefcaseBusiness className="h-4 w-4" strokeWidth={2} /> {job.employment_type}
                          </span>
                        )}

                        {job.work_mode && (
                          <span className="transition-colors group-hover:text-slate-800">
                            ðŸ  {job.work_mode}
                          </span>
                        )}

                        {job.salary && (
                          <span className="transition-colors group-hover:text-slate-800">
                            <CircleDollarSign className="h-4 w-4" strokeWidth={2} /> {job.salary}
                          </span>
                        )}

                      </div>


                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                        {job.qualification && (
                          <div
                            className="
                              rounded-xl
                              border
                              border-transparent
                              p-2
                              transition-all
                              duration-200
                              hover:border-slate-200
                              hover:bg-white
                            "
                          >

                            <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                              Qualification
                            </p>

                            <p className="text-sm font-medium text-slate-700 mt-0.5">
                              {job.qualification ===
                              'bachelors'
                                ? "Bachelor's Degree"
                                : job.qualification ===
                                  'masters'
                                ? "Master's Degree"
                                : job.qualification ===
                                  'diploma'
                                ? 'Diploma'
                                : job.qualification ===
                                  'any'
                                ? 'Any Qualification'
                                : job.qualification}
                            </p>

                          </div>
                        )}


                        {job.eligible_branches
                          ?.length > 0 && (
                          <div
                            className="
                              rounded-xl
                              border
                              border-transparent
                              p-2
                              transition-all
                              duration-200
                              hover:border-slate-200
                              hover:bg-white
                            "
                          >

                            <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                              Eligible Branches
                            </p>

                            <p className="text-sm font-medium text-slate-700 mt-0.5">
                              {Array.isArray(
                                job.eligible_branches
                              )
                                ? job.eligible_branches.join(
                                    ', '
                                  )
                                : job.eligible_branches}
                            </p>

                          </div>
                        )}

                      </div>


                      {job.required_skills
                        ?.length > 0 && (
                        <div className="mt-4">

                          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-2">
                            Required Skills
                          </p>

                          <div className="flex flex-wrap gap-1.5">

                            {job.required_skills.map(
                              (
                                skill,
                                idx
                              ) => (
                                <span
                                  key={`${skill}-${idx}`}
                                  className="
                                    text-[11px]
                                    px-2.5
                                    py-1.5
                                    rounded-full
                                    bg-brand-blue-50
                                    text-brand-blue-700
                                    font-medium
                                    ring-1
                                    ring-brand-blue-100
                                    transition-all
                                    duration-200
                                    hover:bg-brand-blue-100
                                    hover:-translate-y-0.5
                                  "
                                >
                                  {skill}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}


                      {job.application_deadline && (
                        <div className="mt-4 text-xs">

                          <span className="text-slate-400">
                            Application Deadline:
                          </span>{' '}

                          <span className="font-medium text-slate-700">
                            {new Date(
                              job.application_deadline
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </span>

                        </div>
                      )}

                    </div>


                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 shrink-0">

                      {job.skill_match !==
                        undefined && (
                        <span className="text-xs font-semibold text-brand-green-700">
                          {job.skill_match}% Skill Match
                        </span>
                      )}


                      <Link
                        to={`/app/jobs/${job.id}`}
                        className={`
                          inline-flex
                          items-center
                          justify-center
                          px-4
                          py-2.5
                          rounded-xl
                          bg-brand-blue-600
                          text-white
                          text-sm
                          font-semibold
                          shadow-sm
                          hover:bg-brand-blue-700
                          ${buttonHover}
                        `}
                      >
                        View Job <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />
                      </Link>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </Card>
        )}


        {/* ================================================= */}
        {/* Career Notifications */}
        {/* ================================================= */}

        <Card
          title="Career Notifications"
          action={
            notifications.length > 0 && (
              <span className="text-[11px] font-medium text-slate-500">
                {notifications.length} notification
                {notifications.length !== 1
                  ? 's'
                  : ''}
              </span>
            )
          }
          className="transition-all duration-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
        >

          {notifications.length === 0 ? (
            <div
              className="
                text-sm
                text-slate-400
                text-center
                py-8
                rounded-xl
                bg-slate-50
                border
                border-slate-100
                transition-all
                duration-300
                hover:bg-white
                hover:border-slate-200
                hover:shadow-sm
              "
            >
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-3.5">

              {notifications.map(
                (notification, idx) => {
                  const type = String(
                    notification.type || ''
                  )
                    .trim()
                    .toLowerCase()
                    .replace(
                      /[\s-]+/g,
                      '_'
                    );

                  const isInterview =
                    type ===
                      'interview_scheduled' ||
                    type ===
                      'interview_rescheduled' ||
                    type ===
                      'interview_cancelled';

                  const notificationTitle =
                    type ===
                    'interview_scheduled'
                      ? 'Interview Scheduled'
                      : type ===
                        'interview_rescheduled'
                      ? 'Interview Rescheduled'
                      : type ===
                        'interview_cancelled'
                      ? 'Interview Cancelled'
                      : type ===
                        'application_selected'
                      ? 'Application Selected'
                      : type === 'application'
                      ? 'Application Update'
                      : 'Job Invitation';

                  const notificationIcon =
                    isInterview
                      ? '<CalendarDays className="h-4 w-4" strokeWidth={2} />'
                      : type ===
                        'application_selected'
                      ? '<PartyPopper className="h-5 w-5" strokeWidth={2} />'
                      : type ===
                        'application'
                      ? '<ClipboardList className="h-4 w-4" strokeWidth={2} />'
                      : '<BriefcaseBusiness className="h-4 w-4" strokeWidth={2} />';

                  return (
                    <div
                      key={
                        notification.id ||
                        `notif-${idx}`
                      }
                      className="
                        group
                        p-4 sm:p-5
                        rounded-2xl
                        border
                        border-slate-200/80
                        bg-white
                        transition-all
                        duration-300
                        ease-out
                        hover:-translate-y-1
                        hover:bg-slate-50
                        hover:border-slate-300
                        hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]
                      "
                    >

                      <div className="flex items-start gap-3.5">

                        {/* Icon */}

                        <div
                          className="
                            w-11 h-11
                            rounded-xl
                            bg-brand-blue-50
                            border border-brand-blue-100
                            text-brand-blue-700
                            grid place-items-center
                            shrink-0
                            shadow-sm
                            text-base
                            transition-all
                            duration-300
                            group-hover:scale-110
                            group-hover:-rotate-2
                            group-hover:bg-brand-blue-100
                          "
                        >
                          {notificationIcon}
                        </div>


                        {/* Details */}

                        <div className="flex-1 min-w-0">

                          {/* Header */}

                          <div className="flex items-center justify-between gap-2">

                            <div
                              className="
                                font-semibold
                                text-sm
                                text-slate-800
                                tracking-tight
                                transition-colors
                                duration-200
                                group-hover:text-brand-blue-700
                              "
                            >
                              {notificationTitle}
                            </div>

                            {!notification.read_status && (
                              <span
                                className="
                                  text-[10px]
                                  px-2.5
                                  py-1
                                  rounded-full
                                  bg-brand-blue-50
                                  text-brand-blue-700
                                  font-semibold
                                  ring-1
                                  ring-brand-blue-100
                                  transition-all
                                  duration-200
                                  group-hover:scale-105
                                  shrink-0
                                "
                              >
                                New
                              </span>
                            )}

                          </div>


                          {/* Message */}

                          <p className="text-sm leading-relaxed text-slate-600 mt-1.5">
                            {notification.message}
                          </p>


                          {/* Time */}

                          {notification.created_at && (
                            <div className="text-[11px] font-medium text-slate-400 mt-2.5">
                              {fmtRel(
                                notification.created_at
                              )}
                            </div>
                          )}


                          {/* Action */}

                          {notification.job_id && (
                            <>
                              {type ===
                              'interview_cancelled' ? (
                                <Link
                                  to={`/app/jobs/${notification.job_id}`}
                                  className={`
                                    inline-flex
                                    items-center
                                    justify-center
                                    mt-3
                                    px-3.5
                                    py-2
                                    rounded-xl
                                    bg-brand-blue-600
                                    text-white
                                    text-xs
                                    font-semibold
                                    shadow-sm
                                    hover:bg-brand-blue-700
                                    ${buttonHover}
                                  `}
                                >
                                  View Job <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />
                                </Link>
                              ) : isInterview ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewInterview(
                                      notification.job_id
                                    )
                                  }
                                  disabled={
                                    loadingInterview
                                  }
                                  className={`
                                    inline-flex
                                    items-center
                                    justify-center
                                    mt-3
                                    px-3.5
                                    py-2
                                    rounded-xl
                                    bg-brand-blue-600
                                    text-white
                                    text-xs
                                    font-semibold
                                    shadow-sm
                                    hover:bg-brand-blue-700
                                    ${buttonHover}
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    disabled:hover:translate-y-0
                                    disabled:hover:shadow-none
                                  `}
                                >
                                  {loadingInterview
                                    ? 'Loading...'
                                    : 'View Interview <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />'}
                                </button>
                              ) : (
                                <Link
                                  to={`/app/jobs/${notification.job_id}`}
                                  className={`
                                    inline-flex
                                    items-center
                                    justify-center
                                    mt-3
                                    px-3.5
                                    py-2
                                    rounded-xl
                                    bg-brand-blue-600
                                    text-white
                                    text-xs
                                    font-semibold
                                    shadow-sm
                                    hover:bg-brand-blue-700
                                    ${buttonHover}
                                  `}
                                >
                                  View Job <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />
                                </Link>
                              )}
                            </>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </Card>


        {/* ================================================= */}
        {/* Recommendations */}
        {/* ================================================= */}

        {recs.length > 0 && (
          <Card
            title="Recommended for You"
            action={
              <Link
                to="/app/recommendations"
                className="
                  text-xs
                  font-semibold
                  text-brand-blue-600
                  hover:text-brand-blue-700
                  hover:translate-x-0.5
                  transition-all
                  duration-200
                "
              >
                See all <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />
              </Link>
            }
            className="transition-all duration-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
          >

            <ul className="space-y-2.5 text-sm">

              {recs
                .slice(0, 3)
                .map((r, idx) => (

                  <li
                    key={
                      r.id ||
                      `rec-${idx}`
                    }
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      -mx-3
                      border
                      border-transparent
                      hover:bg-slate-50
                      hover:border-slate-200
                      hover:shadow-sm
                      hover:-translate-y-0.5
                      transition-all
                      duration-300
                    "
                  >

                    <span
                      className="
                        w-8 h-8
                        rounded-lg
                        bg-brand-blue-50
                        border border-brand-blue-100
                        grid
                        place-items-center
                        text-brand-blue-500
                        shrink-0
                        transition-all
                        duration-300
                        group-hover:scale-110
                        group-hover:-rotate-2
                      "
                    >
                      <BookMarked className="h-4 w-4" strokeWidth={2} />
                    </span>


                    <span className="font-semibold text-slate-800 tracking-tight group-hover:text-brand-blue-700 transition-colors shrink-0">
                      {r.title}
                    </span>


                    <span className="text-xs text-slate-500 truncate leading-relaxed">
                      - {r.reason}
                    </span>

                  </li>

                ))}

            </ul>

          </Card>
        )}


        {/* ================================================= */}
        {/* Application Modal */}
        {/* ================================================= */}

        {selectedApplication && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-slate-950/45
              backdrop-blur-sm
              p-4
            "
            onClick={() =>
              setSelectedApplication(null)
            }
          >

            <div
              className="
                w-full
                max-w-2xl
                max-h-[90vh]
                overflow-y-auto
                rounded-2xl
                bg-white
                shadow-2xl
                shadow-slate-900/20
                ring-1
                ring-slate-200/80
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* Header */}

              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 sm:px-6 py-5">

                <div>

                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-blue-600">
                    Application
                  </div>

                  <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    Application Details
                  </h2>

                  <p className="mt-1 text-base text-slate-500">
                    {selectedApplication.job
                      ?.title ||
                      'Job Opportunity'}
                  </p>

                  {selectedApplication
                    .job?.company && (
                    <p className="mt-1 text-sm text-slate-400">
                      {
                        selectedApplication
                          .job.company
                      }
                    </p>
                  )}

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setSelectedApplication(
                      null
                    )
                  }
                  className="
                    shrink-0
                    rounded-xl
                    border
                    border-slate-200
                    p-2
                    text-xl
                    text-slate-400
                    hover:bg-slate-50
                    hover:text-slate-700
                    hover:border-slate-300
                    hover:scale-105
                    active:scale-95
                    transition-all
                    duration-200
                  "
                  aria-label="Close"
                >
                  Ã—
                </button>

              </div>


              <div className="space-y-5 px-5 sm:px-6 py-6">

                {/* Application Status */}

                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 shadow-sm">

                  <div className="flex items-center justify-between gap-4 rounded-xl bg-white border border-slate-100 px-4 py-3">

                    <span className="text-sm text-slate-500">
                      Application Status
                    </span>

                    <span
                      className={`
                        rounded-full
                        px-3
                        py-1
                        text-sm
                        font-semibold
                        transition-transform
                        duration-200
                        hover:scale-105
                        ${
                          String(
                            selectedApplication.status
                          ).toLowerCase() ===
                          'shortlisted'
                            ? 'bg-green-100 text-green-700'
                            : String(
                                selectedApplication.status
                              ).toLowerCase() ===
                              'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }
                      `}
                    >
                      {String(
                        selectedApplication.status
                      ).toLowerCase() ===
                      'shortlisted'
                        ? 'Shortlisted'
                        : String(
                            selectedApplication.status
                          ).toLowerCase() ===
                          'rejected'
                        ? 'Rejected'
                        : 'Submitted'}
                    </span>

                  </div>

                </div>


                {/* Application Information */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div
                    className="
                      group
                      rounded-2xl
                      border
                      border-slate-200/80
                      bg-white
                      p-4
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-brand-blue-200
                      hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]
                    "
                  >

                    <p className="text-sm text-slate-500">
                      Skill Match
                    </p>

                    <p className="mt-1 text-lg font-semibold text-slate-800 group-hover:text-brand-blue-700 transition-colors">
                      {selectedApplication.skill_match !=
                      null
                        ? `${selectedApplication.skill_match}%`
                        : 'N/A'}
                    </p>

                  </div>


                  <div
                    className="
                      group
                      rounded-2xl
                      border
                      border-slate-200/80
                      bg-white
                      p-4
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-brand-blue-200
                      hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]
                    "
                  >

                    <p className="text-sm text-slate-500">
                      Applied On
                    </p>

                    <p className="mt-1 text-lg font-semibold text-slate-800 group-hover:text-brand-blue-700 transition-colors">
                      {selectedApplication.applied_at
                        ? new Date(
                            selectedApplication.applied_at
                          ).toLocaleDateString()
                        : 'N/A'}
                    </p>

                  </div>

                </div>


                {/* Resume */}

                {selectedApplication
                  .application_data
                  ?.resume?.url && (
                  <div
                    className="
                      group
                      rounded-2xl
                      border
                      border-slate-200/80
                      bg-white
                      p-5
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-brand-blue-200
                      hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]
                    "
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                      <div>

                        <p className="font-semibold text-slate-800 group-hover:text-brand-blue-700 transition-colors">
                          Submitted Resume
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {selectedApplication
                            .application_data
                            .resume
                            .file_name ||
                            'Resume'}
                        </p>

                      </div>


                      <a
                        href={
                          selectedApplication
                            .application_data
                            .resume
                            .url.startsWith(
                              'http'
                            )
                            ? selectedApplication
                                .application_data
                                .resume.url
                            : `http://localhost:5000${selectedApplication.application_data.resume.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          inline-flex
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-600
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-white
                          hover:bg-blue-700
                          ${buttonHover}
                        `}
                      >
                        Open Resume
                      </a>

                    </div>

                  </div>
                )}


                {/* Application Video */}

                {selectedApplication
                  .application_data
                  ?.video?.key && (
                  <div
                    className="
                      group
                      rounded-2xl
                      border
                      border-slate-200/80
                      bg-white
                      p-5
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-slate-300
                      hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]
                    "
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                      <div>

                        <p className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                          Video Introduction
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Video submitted with this application
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const result =
                              await getApplicationVideoUrl(
                                selectedApplication.job_id,
                                selectedApplication.id
                              );

                            if (result?.url) {
                              window.open(
                                result.url,
                                '_blank',
                                'noopener,noreferrer'
                              );
                            }
                          } catch (err) {
                            console.error(
                              'Failed to open application video:',
                              err.response
                                ?.data ||
                                err.message
                            );
                          }
                        }}
                        className={`
                          inline-flex
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-slate-900
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-white
                          hover:bg-slate-800
                          ${buttonHover}
                        `}
                      >
                        Watch Video
                      </button>

                    </div>

                  </div>
                )}


                {/* Interview */}

                <div
                  className="
                    group
                    rounded-2xl
                    border
                    border-slate-200/80
                    bg-white
                    p-5
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-brand-blue-200
                    hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]
                  "
                >

                  <p className="font-semibold text-slate-800 group-hover:text-brand-blue-700 transition-colors">
                    Interview
                  </p>


                  {selectedApplication.interview ? (
                    <div className="mt-3 space-y-1 text-sm text-slate-600">

                      <p>
                        <span className="font-medium">
                          Status:
                        </span>{' '}
                        {selectedApplication
                          .interview
                          .status ||
                          'Scheduled'}
                      </p>


                      {selectedApplication
                        .interview
                        .scheduled_at && (
                        <p>
                          <span className="font-medium">
                            Scheduled:
                          </span>{' '}
                          {new Date(
                            selectedApplication
                              .interview
                              .scheduled_at
                          ).toLocaleString()}
                        </p>
                      )}

                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      No interview scheduled yet.
                    </p>
                  )}

                </div>

              </div>


              {/* Footer */}

              <div className="flex justify-end border-t border-slate-200 bg-slate-50/70 px-5 sm:px-6 py-4">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedApplication(
                      null
                    )
                  }
                  className={`
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-slate-600
                    shadow-sm
                    hover:bg-slate-50
                    hover:border-slate-300
                    ${buttonHover}
                  `}
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}


        {/* ================================================= */}
        {/* Interview Details Modal */}
        {/* ================================================= */}

        {selectedInterview && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-slate-950/45
              backdrop-blur-sm
              p-4
            "
          >

            <div
              className="
                w-full
                max-w-md
                max-h-[90vh]
                overflow-y-auto
                rounded-2xl
                bg-white
                shadow-2xl
                shadow-slate-900/20
                ring-1
                ring-slate-200/80
              "
            >

              {/* Header */}

              <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-4">

                <div>

                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-blue-600">
                    Career
                  </div>

                  <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                    Interview Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedInterview.job_title}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setSelectedInterview(
                      null
                    )
                  }
                  className="
                    shrink-0
                    rounded-xl
                    border
                    border-slate-200
                    p-2
                    text-xl
                    text-slate-400
                    hover:bg-slate-50
                    hover:text-slate-700
                    hover:border-slate-300
                    hover:scale-105
                    active:scale-95
                    transition-all
                    duration-200
                  "
                  aria-label="Close interview details"
                >
                  Ã—
                </button>

              </div>


              {/* Details */}

              <div className="p-5 space-y-5">

                {/* Status */}

                <div
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-xl
                    bg-slate-50
                    border
                    border-slate-100
                    px-4
                    py-3
                    transition-all
                    duration-300
                    hover:bg-white
                    hover:border-slate-200
                    hover:shadow-sm
                  "
                >

                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  <span
                    className={`
                      px-3
                      py-1.5
                      rounded-full
                      text-xs
                      font-semibold
                      ring-1
                      ring-inset
                      transition-transform
                      duration-200
                      hover:scale-105
                      ${
                        selectedInterview
                          .interview
                          ?.status ===
                        'cancelled'
                          ? 'bg-red-50 text-red-700'
                          : selectedInterview
                              .interview
                              ?.status ===
                            'rescheduled'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-green-50 text-green-700'
                      }
                    `}
                  >
                    {selectedInterview
                      .interview
                      ?.status
                      ?.replace(
                        /_/g,
                        ' '
                      )
                      ?.replace(
                        /\b\w/g,
                        (char) =>
                          char.toUpperCase()
                      )}
                  </span>

                </div>


                {/* Date */}

                <div
                  className="
                    group
                    rounded-xl
                    border
                    border-transparent
                    p-2
                    transition-all
                    duration-200
                    hover:border-slate-200
                    hover:bg-slate-50
                  "
                >

                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                    Date & Time
                  </div>

                  <div className="mt-1.5 text-sm font-semibold text-slate-800">
                    {selectedInterview
                      .interview
                      ?.scheduled_at
                      ? new Date(
                          selectedInterview
                            .interview
                            .scheduled_at
                        ).toLocaleString()
                      : 'Not available'}
                  </div>

                </div>


                {/* Duration */}

                <div
                  className="
                    group
                    rounded-xl
                    border
                    border-transparent
                    p-2
                    transition-all
                    duration-200
                    hover:border-slate-200
                    hover:bg-slate-50
                  "
                >

                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                    Duration
                  </div>

                  <div className="mt-1.5 text-sm font-semibold text-slate-800">
                    {selectedInterview
                      .interview
                      ?.duration
                      ? `${selectedInterview.interview.duration} minutes`
                      : 'Not specified'}
                  </div>

                </div>


                {/* Interview Type */}

                <div
                  className="
                    group
                    rounded-xl
                    border
                    border-transparent
                    p-2
                    transition-all
                    duration-200
                    hover:border-slate-200
                    hover:bg-slate-50
                  "
                >

                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                    Interview Type
                  </div>

                  <div className="mt-1.5 text-sm font-semibold text-slate-800">
                    {selectedInterview
                      .interview
                      ?.interview_type ===
                    'in-person'
                      ? 'In-person'
                      : 'Online'}
                  </div>

                </div>


                {/* Join Interview */}

                {selectedInterview
                  .interview
                  ?.status ===
                  'scheduled' &&
                  selectedInterview
                    .interview
                    ?.interview_type ===
                    'online' &&
                  selectedInterview
                    .interview
                    ?.meeting_link && (
                    <div>

                      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        Interview
                      </div>

                      <a
                        href={
                          selectedInterview
                            .interview
                            .meeting_link
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          inline-flex
                          items-center
                          justify-center
                          mt-2
                          px-3.5
                          py-2
                          rounded-xl
                          bg-brand-blue-600
                          text-white
                          text-xs
                          font-semibold
                          shadow-sm
                          hover:bg-brand-blue-700
                          ${buttonHover}
                        `}
                      >
                        Join Interview <ArrowRight className="ml-2 inline-block h-4 w-4" strokeWidth={2.5} />
                      </a>

                    </div>
                  )}


                {/* Notes */}

                {selectedInterview
                  .interview
                  ?.notes && (
                  <div>

                    <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                      Notes
                    </div>

                    <div
                      className="
                        group
                        mt-2
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-100
                        p-3.5
                        text-sm
                        leading-relaxed
                        text-slate-700
                        transition-all
                        duration-300
                        hover:bg-white
                        hover:border-slate-200
                        hover:shadow-sm
                      "
                    >
                      {selectedInterview
                        .interview.notes}
                    </div>

                  </div>
                )}

              </div>


              {/* Footer */}

              <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 flex justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedInterview(
                      null
                    )
                  }
                  className={`
                    px-4
                    py-2
                    rounded-xl
                    bg-white
                    border
                    border-slate-200
                    text-slate-700
                    text-sm
                    font-semibold
                    shadow-sm
                    hover:bg-slate-50
                    hover:border-slate-300
                    ${buttonHover}
                  `}
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
}

