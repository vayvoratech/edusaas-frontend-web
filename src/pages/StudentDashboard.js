import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
} from '../services/api';




// Helper function to format relative time from an ISO string.
const fmtRel = (iso) => {
  if (!iso) return '—';

  const diff = (new Date() - new Date(iso)) / 60000;

  if (diff < 60) {
    return `${Math.round(diff)}m ago`;
  }

  if (diff < 1440) {
    return `${Math.round(diff / 60)}h ago`;
  }

  return `${Math.round(diff / 1440)}d ago`;
};


// Data for the main navigation cards on the dashboard.
const moduleCards = [
  {
    to: '/app/learning',
    emoji: '💬',
    title: 'Learning Module',
    sub: 'Continue your video lessons',
  },
  {
    to: '/app/achievements',
    emoji: '🏆',
    title: 'Achievements',
    sub: 'View your badges and certificates',
  },
  {
    to: '/app/tasks',
    emoji: '✅',
    title: 'Tasks & Deadlines',
    sub: 'Stay on top of your assignments',
  },
  {
    to: '/app/recommendations',
    emoji: '✨',
    title: 'Course Recommendations',
    sub: 'Picked for your goals',
  },
];


export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for dashboard data, tasks, achievements,
  // recommendations, and assignments, notifications, Interviews
  const [dash, setDash] = useState(null);
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

  const dismissedKey = `edu_dismissed_announcements_${user?.id || 'student'}`;
  const getDismissedIds = () => {
    try {
      const raw = localStorage.getItem(dismissedKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const markSeenLocally = (id) => {
    try {
      const seenKey = `edu_seen_announcements_${user?.id || 'student'}`;
      const raw = localStorage.getItem(seenKey);
      const seen = raw ? JSON.parse(raw) : [];
      if (!seen.includes(id)) {
        localStorage.setItem(seenKey, JSON.stringify([...seen, id]));
      }
    } catch {}
  };

  const handleAnnouncementClick = (id) => {
    try {
      const dismissed = getDismissedIds();
      if (!dismissed.includes(id)) {
        localStorage.setItem(dismissedKey, JSON.stringify([...dismissed, id]));
      }
    } catch {}
    markSeenLocally(id);
    markAnnouncementNotificationsRead(id).finally(() => {
      window.dispatchEvent(new CustomEvent('notifications_updated'));
      window.dispatchEvent(new CustomEvent('announcements_seen'));
    });
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    navigate('/app/community', { state: { activeTab: 'Announcements' } });
  };

  const handleDismissOnly = (e, id) => {
    e.stopPropagation();
    try {
      const dismissed = getDismissedIds();
      if (!dismissed.includes(id)) {
        localStorage.setItem(dismissedKey, JSON.stringify([...dismissed, id]));
      }
    } catch {}
    markSeenLocally(id);
    markAnnouncementNotificationsRead(id).finally(() => {
      window.dispatchEvent(new CustomEvent('notifications_updated'));
      window.dispatchEvent(new CustomEvent('announcements_seen'));
    });
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Fetch all necessary data when the component mounts or when token becomes ready.
  const loadDashboardData = React.useCallback(() => {
    setDashError(null);

    getStudentDashboard()
      .then((data) => {
        setDash(data);
        setDashError(null);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
        setDashError(err.response?.data?.error || err.message || "Failed to load dashboard");
      });

    getAnnouncements()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const dismissed = getDismissedIds();
        setAnnouncements(list.filter((a) => !dismissed.includes(a.id)));
      })
      .catch((err) => {
        console.error("Announcements error:", err);
        setAnnouncements([]);
      });

    getMyTasks({ status: "pending" })
      .then(setTasks)
      .catch(() => {});

    getMyAchievements()
      .then(setAchievements)
      .catch(() => {});

    getMyRecommendations()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const normalized = [];
        list.forEach((item, itemIdx) => {
          if (item.type === "ai_suggestions" || item.source === "ai") {
            const suggestions = Array.isArray(item.suggestions) ? item.suggestions : [];
            suggestions.forEach((s, idx) => {
              normalized.push({
                id: s.course_id || `ai-${itemIdx}-${idx}`,
                title: s.title || "Recommended Course",
                description: s.description || s.reason || "AI generated recommendation for you.",
                category: s.category || "AI Recommendation",
                difficulty: s.difficulty || "Intermediate",
                thumbnail_url: s.thumbnail_url || null,
                reason: s.reason || "Recommended based on your career path",
                source: "ai",
              });
            });
          } else if (item.course) {
            normalized.push({
              ...item.course,
              reason: item.reason || "Recommended based on your skill gap",
              source: "curated",
            });
          } else if (item.id && item.title) {
            normalized.push({
              ...item,
              reason: item.reason || "Recommended course",
              source: "curated",
            });
          }
        });
        setRecs(normalized);
      })
      .catch((err) => {
        console.error("Recommendations error:", err);
        setRecs([]);
      });

    getRecommendedJobs()
      .then((data) => {
        setRecommendedJobs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Recommended jobs error:", err);
        setRecommendedJobs([]);
      });

    getNotifications()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const filteredNotifications = list
          .map((notification) => ({
            ...notification,
            normalizedType: (notification.type || "")
              .trim()
              .toLowerCase()
              .replace(/[\s-]+/g, "_"),
          }))
          .filter((notification) => {
            const notificationAge = now - new Date(notification.created_at).getTime();
            return (
              notificationAge <= twentyFourHours &&
              [
                "job_invitation",
                "application",
                "application_selected",
                "interview_scheduled",
                "interview_rescheduled",
                "interview_cancelled",
              ].includes(notification.normalizedType)
            );
          });

        const applicationNotifications = filteredNotifications
          .filter((notification) => notification.normalizedType === "application")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const latestApplication = applicationNotifications.length > 0 ? [applicationNotifications[0]] : [];
        const otherNotifications = filteredNotifications.filter(
          (notification) => notification.normalizedType !== "application"
        );

        const studentNotifications = [...latestApplication, ...otherNotifications].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setNotifications(studentNotifications);
      })
      .catch((err) => {
        console.error("Notifications error:", err);
        setNotifications([]);
      });

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
        console.error("My applications error:", err.response?.data || err.message);
        setMyApplications([]);
      });
  }, [dismissedKey]);

  useEffect(() => {
    loadDashboardData();
    const handleTokenReady = () => {
      loadDashboardData();
    };
    window.addEventListener("edu_token_ready", handleTokenReady);
    return () => window.removeEventListener("edu_token_ready", handleTokenReady);
  }, [loadDashboardData]);


const handleViewInterview = async (jobId) => {
  if (!jobId) return;

  try {
    setLoadingInterview(true);

    const data = await getMyInterview(jobId);

    setSelectedInterview(data);
  } catch (err) {
    console.error(
      "Failed to load interview:",
      err.response?.data || err.message
    );

    alert(
      err.response?.data?.error ||
        "Failed to load interview details."
    );
  } finally {
    setLoadingInterview(false);
  }
};


  // ----------------------------------------------------
  // Loading dashboard data
  // ----------------------------------------------------
  if (!dash) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-3">
        <div className="text-gray-500 font-medium">
          {dashError ? "Unable to load dashboard data." : "Loading dashboard..."}
        </div>
        {dashError && (
          <Button size="sm" onClick={() => loadDashboardData()}>
            Retry
          </Button>
        )}
      </div>
    );
  }


  // ----------------------------------------------------
  // Fresh student - assessment not completed
  // ----------------------------------------------------
  if (!dash.assessmentCompleted) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">

          <div className="bg-white rounded-xl shadow-lg p-10 text-center">

            <h1 className="text-3xl font-bold text-gray-900">
              Initial Skill Assessment
            </h1>

            <p className="mt-4 text-gray-500">
              Complete this assessment to personalize your
              learning path.
            </p>

            <Link
              to="/app/initial-assessment"
              className="inline-block mt-8 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Start Skill Assessment
            </Link>

          </div>

        </div>
      </div>
    );
  }


  // Get the next upcoming task deadline.
  const nextDeadline = tasks[0];
  const appliedJobIds = new Set(
  myApplications
    .map((application) => application.job_id ?? application.job?.id)
    .filter(Boolean)
    .map(String)
);

const availableJobs = recommendedJobs.filter(
  (job) => !appliedJobIds.has(String(job.id))
);

  return (
    <div className="space-y-6">

      {/* ------------------------------------------------ */}
      {/* Welcome card with user info */}
      {/* ------------------------------------------------ */}

      <Card className="bg-gradient-to-r from-brand-blue-500 via-brand-blue-600 to-brand-blue-700 text-white border-0">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div>

            <div className="text-xs uppercase tracking-wider text-white/70">
              Welcome back
            </div>

            <h2 className="text-2xl font-bold">

              {user?.name?.split(" ")[0] || user?.name}

              {dash?.domainRole &&
                `, aspiring ${dash.domainRole}`}

              <p className="text-[17px]">
                let's close those skill gaps. 🚀
              </p>

            </h2>

            <div className="text-sm text-white/80 mt-1">

              Readiness Score:

              <span className="font-bold">
                {' '}
                {dash?.readinessScore ?? 0}%
              </span>

              {' • '}

              {dash?.coursesEnrolled ?? 0} active courses

            </div>

          </div>


          <div className="flex items-center gap-2">

            <Link to="/app/learning-paths">
              <Button variant="accent">
                View Learning Path
              </Button>
            </Link>

            <Link to="/app/recommendations">
              <Button variant="accent">
                View Recommendations
              </Button>
            </Link>

          </div>


          <div className="flex items-center gap-4">

            <ProgressRing
              value={dash?.readinessScore ?? 0}
              size={88}
            />

            <Link to="/app/courses">
              <Button variant="accent">
                Continue Learning →
              </Button>
            </Link>

          </div>

        </div>

      </Card>


      {/* ------------------------------------------------ */}
      {/* Key metric summary cards */}
      {/* ------------------------------------------------ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card className="!p-4">

          <div className="text-xs text-slate-500">
            Courses Enrolled
          </div>

          <div className="text-3xl font-bold text-brand-blue-700 mt-1">
            {dash?.coursesEnrolled ?? 0}
          </div>

          <div className="text-[11px] text-slate-500 mt-1">
            {dash?.activeCourses ?? 0} active
          </div>

        </Card>


        <Card className="!p-4">

          <div className="text-xs text-slate-500">
            Achievements Earned
          </div>

          <div className="text-3xl font-bold text-brand-orange-600 mt-1">
            {achievements.length}
          </div>

          <div className="text-[11px] text-slate-500 mt-1">
            Badges collected
          </div>

        </Card>


        <Card className="!p-4">

          <div className="text-xs text-slate-500">
            Tasks Due This Week
          </div>

          <div className="text-3xl font-bold text-red-600 mt-1">
            {dash?.tasksDue ?? 0}
          </div>

          <div className="text-[11px] text-slate-500 mt-1">
            Upcoming Tasks
          </div>

        </Card>


        <Card className="!p-4">

          <div className="text-xs text-slate-500">
            Learning Hours Logged
          </div>

          <div className="text-3xl font-bold text-slate-700 mt-1">
            {dash?.learningHoursLogged ?? 0}
          </div>

          <div className="text-[11px] text-slate-500 mt-1">
            Hours this month
          </div>

        </Card>

      </div>


      {/* ------------------------------------------------ */}
      {/* Course Announcements Banner */}
      {/* ------------------------------------------------ */}
      {announcements.length > 0 && (
        <Card className="!p-4 sm:!p-5 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 via-white to-white shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 grid place-items-center text-sm font-bold shrink-0">
                📣
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Course Announcements
                </h3>
                <p className="text-[11px] text-slate-500">
                  Click any announcement to open in Community Feed (will clear from dashboard once clicked)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                {announcements.length} {announcements.length === 1 ? 'New' : 'New'}
              </span>
              <button
                onClick={() => navigate('/app/community', { state: { activeTab: 'Announcements' } })}
                className="text-xs text-brand-blue-600 hover:underline font-semibold hidden sm:inline"
              >
                Community Feed →
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                onClick={() => handleAnnouncementClick(a.id)}
                className="p-3.5 sm:p-4 rounded-xl bg-white border border-amber-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group relative"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm group-hover:text-amber-800 transition-colors">
                      {a.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {a.audience === 'course' ? 'My Course' : 'All Learners'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      {a.educator?.name && (
                        <span className="font-medium text-slate-700">By {a.educator.name}</span>
                      )}
                      <span>•</span>
                      <span>{fmtRel(a.created_at)}</span>
                    </div>
                    <button
                      onClick={(e) => handleDismissOnly(e, a.id)}
                      title="Dismiss from dashboard"
                      className="w-5 h-5 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 grid place-items-center text-xs transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">
                  {a.message}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-amber-700 font-medium pt-2 border-t border-amber-50">
                  <span className="group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>View in Community Feed</span>
                    <span>→</span>
                  </span>
                  <span className="text-slate-400 font-normal">Click to open & clear from dashboard</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}


      {/* ------------------------------------------------ */}
      {/* Learning progress chart and recent activity */}
      {/* ------------------------------------------------ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">

        <Card
          title="Learning Analytics"
          className="lg:col-span-2 flex flex-col"
        >

          <div className="h-72 overflow-hidden -mt-4">

            <div className="overflow-x-auto overflow-y-hidden h-full">

              <div
                style={{
                  minWidth: Math.max(
                    (dash?.learningAnalytics?.length || 4) * 120,
                    600
                  ),
                  height: '100%',
                }}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={dash?.learningAnalytics || []}
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
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      domain={[0, 100]}
                      unit="%"
                      ticks={[0, 20, 40, 60, 80, 100]}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: 'none',
                        boxShadow:
                          '0 10px 25px rgba(0,0,0,.12)',
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

          <Card
            title="Recent Activity"
            className="flex-1 flex flex-col"
          >

            <ul className="space-y-2 text-sm">

              {(dash?.recentActivity || []).map((a, idx) => (

                <li
                  key={a.id || `act-${idx}`}
                  className="flex items-center gap-2"
                >

                  <span className="text-brand-blue-500">
                    ✓
                  </span>

                  <span className="flex-1 truncate text-slate-700">
                    {a.title}
                  </span>

                  <span className="text-[11px] text-slate-400">
                    {a.when}
                  </span>

                </li>

              ))}

            </ul>

          </Card>


          <Card
            title="Next Deadline"
            className="flex-1 flex flex-col justify-center"
          >

            {nextDeadline ? (

              <div>

                <div className="font-semibold text-slate-800">
                  {nextDeadline.title}
                </div>

                <div className="text-xs text-slate-500">
                  Due {fmtRel(nextDeadline.due_date)}
                </div>

              </div>

            ) : (

              <p className="text-sm text-slate-500">
                Nothing due. 🎉
              </p>

            )}

          </Card>

        </div>

      </div>


      {/* ------------------------------------------------ */}
      {/* Navigation cards */}
      {/* ------------------------------------------------ */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {moduleCards.map((m) => (

          <Link
            key={m.to}
            to={m.to}
          >

            <Card className="hover:shadow-md transition !p-4 h-full">

              <div className="text-3xl">
                {m.emoji}
              </div>

              <div className="font-semibold text-slate-900 mt-2">
                {m.title}
              </div>

              <div className="text-[11px] text-slate-500 mt-1">
                {m.sub}
              </div>

              <div className="text-xs text-brand-blue-600 mt-3">
                Open →
              </div>

            </Card>

          </Link>

        ))}

      </div>


      {/* ------------------------------------------------ */}
      {/* Assigned courses */}
      {/* ------------------------------------------------ */}

      {assignments.length > 0 && (

        <Card
          title="Assigned to You"
          action={
            <span className="text-xs text-slate-500">
              {assignments.length} from your educators
            </span>
          }
        >

          <ul className="space-y-2">

            {assignments.map((a) => {

              const overdue =
                a.due_date &&
                a.status !== 'completed' &&
                new Date(a.due_date) < new Date();

              return (

                <li
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                >

                  <div className="text-2xl">
                    📚
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="font-medium text-slate-800 truncate">
                      {a.course?.title || 'Course'}
                    </div>

                    <div className="text-xs text-slate-500 truncate">

                      Assigned by {a.educator_name || 'your educator'}

                      {a.due_date && (
                        <>
                          {' · '}

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

                            {overdue && ' (overdue)'}

                          </span>
                        </>
                      )}

                      {!a.due_date && ' · No due date'}

                    </div>


                    {a.note && (

                      <div className="text-[11px] text-slate-500 italic mt-1 truncate">
                        “{a.note}”
                      </div>

                    )}

                  </div>


                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      a.status === 'completed'
                        ? 'bg-brand-green-50 text-brand-green-700'
                        : a.status === 'in-progress'
                        ? 'bg-brand-blue-50 text-brand-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {a.status}
                  </span>


                  <Link
                    to={`/app/courses/${a.course_id}`}
                    className="text-xs px-2.5 py-1 rounded bg-brand-blue-600 text-white hover:bg-brand-blue-700"
                  >
                    Start
                  </Link>

                </li>

              );

            })}

          </ul>

        </Card>

      )}


{/* Eligible Job Opportunities */}
{/* ------------------------------------------------ */}

{availableJobs.length > 0 && (
  <Card
    title="Job Opportunities"
    action={
      <span className="text-xs text-slate-500">
        {availableJobs.length} job
        {availableJobs.length !== 1 ? "s" : ""} matched
      </span>
    }
  >
    <div className="space-y-3">
      {availableJobs.map((job) => (
        <div
          key={job.id}
          className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💼</span>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {job.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Job Opportunity
                  </p>
                </div>
              </div>

              {job.description && (
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                  {job.description}
                </p>
              )}

              {job.required_skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.required_skills.map((skill, idx) => (
                    <span
                      key={`${skill}-${idx}`}
                      className="text-[11px] px-2 py-1 rounded-full bg-brand-blue-50 text-brand-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">

              {job.skill_match !== undefined && (
                <span className="text-xs font-semibold text-brand-green-700">
                  {job.skill_match}% Skill Match
                </span>
              )}
            <Link
  to={`/app/jobs/${job.id}`}
  className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-brand-blue-600 text-white text-sm hover:bg-brand-blue-700">
  View Job 
</Link>
     </div>
          </div>
             </div>
      ))}
    </div>
  </Card>
)}


      {/* ------------------------------------------------ */}
      {/* Job Invitations */}
      {/* ------------------------------------------------ */}

         <Card
  title=" Career Notifications"
  action={
    notifications.length > 0 && (
      <span className="text-xs text-slate-500">
        {notifications.length} notification
        {notifications.length !== 1 ? "s" : ""}
      </span>
    )
  }
>
 {notifications.length === 0 ? (
  <div className="text-sm text-slate-400 text-center py-6">
    No notifications yet.
  </div>
) : (
  <div className="space-y-3">
    {notifications.map((notification, idx) => {
      const type = String(notification.type || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

      const isInterview =
        type === "interview_scheduled" ||
        type === "interview_rescheduled" ||
        type === "interview_cancelled";

      const notificationTitle =
  type === "interview_scheduled"
    ? "Interview Scheduled"
    : type === "interview_rescheduled"
    ? "Interview Rescheduled"
    : type === "interview_cancelled"
    ? "Interview Cancelled"
    : type === "application_selected"
    ? "Application Selected"
    : type === "application"
    ? "Application Update"
    : "Job Invitation";

      const notificationIcon = isInterview ? "📅" : type === "application_selected" ? "🎉" : type === "application" ? "📋" : "💼";

      return (
        <div
          key={notification.id || `notif-${idx}`}
          className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
        >
          <div className="flex items-start gap-3">

            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center shrink-0">
              {notificationIcon}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">

              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-sm text-slate-800">
                  {notificationTitle}
                </div>

                {!notification.read_status && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-brand-blue-50 text-brand-blue-700 font-medium">
                    New
                  </span>
                )}
              </div>

              {/* Message */}
              <p className="text-sm text-slate-600 mt-1">
                {notification.message}
              </p>

              {/* Time */}
              {notification.created_at && (
                <div className="text-[11px] text-slate-400 mt-2">
                  {fmtRel(notification.created_at)}
                </div>
              )}

            {/* Action */}
{notification.job_id && (
  type === "interview_cancelled" ? (
    <Link
      to={`/app/jobs/${notification.job_id}`}
      className="inline-flex mt-3 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
    >
      View Job →
    </Link>
  ) : isInterview ? (
    <button
      type="button"
      onClick={() =>
        handleViewInterview(notification.job_id)
      }
      disabled={loadingInterview}
      className="inline-flex mt-3 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      {loadingInterview
        ? "Loading..."
        : "View Interview →"}
    </button>
  ) : (
    <Link
      to={`/app/jobs/${notification.job_id}`}
      className="inline-flex mt-3 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
    >
      View Job →
    </Link>
  )
)}
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}
</Card>

{recs.length > 0 && (
  <Card
    title="Recommended for You"
    action={
      <Link
        to="/app/recommendations"
        className="text-xs text-brand-blue-600 hover:underline"
      >
        See all →
      </Link>
    }
  >
    <ul className="space-y-2 text-sm">
      {recs.slice(0, 3).map((r, idx) => (
        <li
          key={r.id || `rec-${idx}`}
          className="flex items-center gap-2"
        >
          <span className="text-brand-blue-500">
            📘
          </span>

          <span className="font-medium text-slate-800">
            {r.title}
          </span>

          <span className="text-xs text-slate-500 truncate">
            — {r.reason}
          </span>
        </li>
      ))}
    </ul>
  </Card>
)}


        {selectedApplication && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    onClick={() => setSelectedApplication(null)}
  >
    <div
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Application Details
          </h2>

          <p className="mt-1 text-base text-slate-500">
            {selectedApplication.job?.title || "Job Opportunity"}
          </p>

          {selectedApplication.job?.company && (
            <p className="mt-1 text-sm text-slate-400">
              {selectedApplication.job.company}
            </p>
          )} 
        </div>
        <button
          type="button"
          onClick={() => setSelectedApplication(null)}
          className="text-2xl text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="space-y-5 px-6 py-6">

        {/* Application Status */}
        <div className="rounded-xl bg-slate-50 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Application Status
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                String(selectedApplication.status).toLowerCase() ===
                "shortlisted"
                  ? "bg-green-100 text-green-700"
                  : String(selectedApplication.status).toLowerCase() ===
                    "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {String(selectedApplication.status).toLowerCase() ===
              "shortlisted"
                ? "Shortlisted"
                : String(selectedApplication.status).toLowerCase() ===
                  "rejected"
                ? "Rejected"
                : "Submitted"}
            </span>
          </div>
        </div>

        {/* Application Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Skill Match</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {selectedApplication.skill_match != null
                ? `${selectedApplication.skill_match}%`
                : "N/A"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Applied On</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              {selectedApplication.applied_at
                ? new Date(
                    selectedApplication.applied_at
                  ).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Submitted Resume */}
        {selectedApplication.application_data?.resume?.url && (
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-800">
                  Submitted Resume
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedApplication.application_data.resume.file_name ||
                    "Resume"}
                </p>
              </div>

              <a
                href={
                  selectedApplication.application_data.resume.url.startsWith(
                    "http"
                  )
                    ? selectedApplication.application_data.resume.url
                    : `http://localhost:5000${selectedApplication.application_data.resume.url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Open Resume
              </a>
            </div>
          </div>
        )}

        {/* Application Video */}
        {selectedApplication.application_data?.video?.key && (
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-800">
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
    const result = await getApplicationVideoUrl(
      selectedApplication.job_id,
      selectedApplication.id
    );

    if (result?.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
  } catch (err) {
    console.error(
      "Failed to open application video:",
      err.response?.data || err.message
    );
  }
}}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Watch Video
              </button>
            </div>
          </div>
        )}

        {/* Interview */}
        <div className="rounded-xl border border-slate-200 p-5">
          <p className="font-semibold text-slate-800">
            Interview
          </p>

          {selectedApplication.interview ? (
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium">Status:</span>{" "}
                {selectedApplication.interview.status || "Scheduled"}
              </p>

              {selectedApplication.interview.scheduled_at && (
                <p>
                  <span className="font-medium">Scheduled:</span>{" "}
                  {new Date(
                    selectedApplication.interview.scheduled_at
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
      <div className="flex justify-end border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          onClick={() => setSelectedApplication(null)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

  {/* Interview Details */}
{selectedInterview && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
      {/* Header */}
      <div className="border-b px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Interview Details
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {selectedInterview.job_title}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedInterview(null)}
          className="text-slate-400 hover:text-slate-700 text-xl leading-none"
        >
           ×
        </button>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Status
          </span>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              selectedInterview.interview?.status === "cancelled"
                ? "bg-red-50 text-red-700"
                : selectedInterview.interview?.status === "rescheduled"
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {selectedInterview.interview?.status
              ?.replace(/_/g, " ")
              ?.replace(/\b\w/g, (char) =>
                char.toUpperCase()
              )}
          </span>
        </div>

        {/* Date & Time */}
        <div>
          <div className="text-xs text-slate-500">
            Date & Time
          </div>

          <div className="text-sm font-medium text-slate-800 mt-1">
            {selectedInterview.interview?.scheduled_at
              ? new Date(
                  selectedInterview.interview.scheduled_at
                ).toLocaleString()
              : "Not available"}
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="text-xs text-slate-500">
            Duration
          </div>

          <div className="text-sm font-medium text-slate-800 mt-1">
            {selectedInterview.interview?.duration
              ? `${selectedInterview.interview.duration} minutes`
              : "Not specified"}
          </div>
        </div>

        {/* Interview Type */}
        <div>
          <div className="text-xs text-slate-500">
            Interview Type
          </div>

          <div className="text-sm font-medium text-slate-800 mt-1">
            {selectedInterview.interview?.interview_type ===
            "in-person"
              ? "In-person"
              : "Online"}
          </div>
        </div>

        {/* Join Interview */}
       {selectedInterview.interview?.status === "scheduled" &&
        selectedInterview.interview?.interview_type === "online" &&
        selectedInterview.interview?.meeting_link && (
        <div>
        <div className="text-xs text-slate-500">
        Interview
         </div>

      <a
        href={selectedInterview.interview.meeting_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex mt-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
      >
        Join Interview →
      </a>
    </div>
  )}

        {/* Notes */}
        {selectedInterview.interview?.notes && (
          <div>
            <div className="text-xs text-slate-500">
              Notes
            </div>

            <div className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {selectedInterview.interview.notes}
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="border-t px-5 py-3 flex justify-end">
        <button
          type="button"
          onClick={() => setSelectedInterview(null)}
          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}

</div>
)}
