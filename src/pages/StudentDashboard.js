import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import {
  getStudentDashboard,
  getAssessmentOverview,
  getMyTasks,
  getMyAchievements,
  getMyRecommendations,
  getMyAssignments,
  getRecommendedJobs,
  getNotifications
} from '../services/api';

// Format relative time from an ISO timestamp
const fmtRel = (iso) => {
  if (!iso) return '—';
  const diff = (new Date() - new Date(iso)) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
};

// Navigation module configurations
const moduleCards = [
  { to: '/app/learning', emoji: '💬', title: 'Learning Module', sub: 'Continue your video lessons' },
  { to: '/app/achievements', emoji: '🏆', title: 'Achievements', sub: 'View your badges and certificates' },
  { to: '/app/tasks', emoji: '✅', title: 'Tasks & Deadlines', sub: 'Stay on top of your assignments' },
  { to: '/app/recommendations', emoji: '✨', title: 'Course Recommendations', sub: 'Picked for your goals' }
];

export default function StudentDashboard() {
  const { user } = useAuth();

  // State management for dashboard sections
  const [dash, setDash] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recs, setRecs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assessmentOverview, setAssessmentOverview] = useState(null)
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch initial dashboard data on mount
  useEffect(() => {
    console.log("CALLING STUDENT DASHBOARD API");

    getStudentDashboard()
      .then((data) => {
        console.log("STUDENT DASHBOARD DATA:", data);
        console.log("ASSESSMENT COMPLETED:", data?.assessmentCompleted);
        setDash(data);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
      });
    
    getAssessmentOverview().then(setAssessmentOverview).catch(() => {})

    getMyTasks({ status: "pending" })
      .then(setTasks)
      .catch(() => {});

    getMyAchievements()
      .then(setAchievements)
      .catch(() => {});

    getMyRecommendations()
      .then(setRecs)
      .catch(() => {});

    getMyAssignments()
      .then(setAssignments)
      .catch(() => {});

    getRecommendedJobs()
      .then((data) => {
        console.log("THIS IS MY STUDENT DASHBOARD FILE", data);
        console.log("FIRST JOB:", data.jobs?.[0]);
        console.log("FIRST JOB ID:", data.jobs?.[0]?.id);
        setRecommendedJobs(data.jobs || []);
      })
      .catch((err) => {
        console.error("Recommended jobs error:", err);
        setRecommendedJobs([]);
      });

    getNotifications()
      .then((data) => {
        console.log("ALL NOTIFICATIONS:", data);
        const invitations = Array.isArray(data)
          ? data.filter((n) => {
              const type = String(n.type || "")
                .trim()
                .toLowerCase()
                .replace(/[\s-]+/g, "_");
              console.log("TYPE CHECK:", n.type, "→", type);
              return type === "job_invitation";
            })
          : [];
        console.log("FILTERED INVITATIONS:", invitations);
        setNotifications(invitations);
      })
      .catch((err) => {
        console.error("Notifications error:", err);
        setNotifications([]);
      });
  }, []);

  // Loading indicator screen
  if (!dash) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  // Target next deadline
  const nextDeadline = tasks[0];
  const initialStatus =
    assessmentOverview?.initialAssessment?.status;

  const codingStatus =
    assessmentOverview?.codingAssessment?.status;

  const assessmentResumable =
    initialStatus === "In Progress" ||
    initialStatus === "Paused" ||
    codingStatus === "In Progress" ||
    codingStatus === "Paused";

  const assessmentCompleted =
    initialStatus === "Completed" &&
    codingStatus === "Completed";

  const assessmentCta = !assessmentOverview
    ? null
    : assessmentCompleted
    ? {
        label: "View Learning Path",
        to: "/app/learning-paths",
      }
    : assessmentResumable
    ? {
        label: "Resume your test",
        to: "/app/initial-assessment",
      }
    : {
        label: "Start Skill Assessment",
        to: "/app/initial-assessment",
      };

  return (
    <div className="space-y-6">
      {/* Welcome header card */}
      <Card className="bg-gradient-to-r from-brand-blue-500 via-brand-blue-600 to-brand-blue-700 text-white border-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/70">Welcome back</div>
            <h2 className="text-2xl font-bold">
              {user?.name?.split(" ")[0] || user?.name}
              {dash?.domainRole && `, aspiring ${dash.domainRole}`}
              <p className="text-[17px]">let's close those skill gaps. 🚀</p>
            </h2>
            <div className="text-sm text-white/80 mt-1">
              Readiness Score: <span className="font-bold">{dash?.readinessScore ?? 0}%</span> {' • '}
              {dash?.coursesEnrolled ?? 0} active courses
            </div>
          </div>

          <div className="flex items-center gap-2">
            {assessmentCta && (
              <Link to={assessmentCta.to}>
                <Button variant="accent">
                  {assessmentCta.label}
                </Button>
              </Link>
            )}

            <Link to="/app/recommendations">
              <Button variant="accent">View Recommendations</Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ProgressRing value={dash?.readinessScore ?? 0} size={88} />
            <Link to="/app/courses">
              <Button variant="accent">Continue Learning →</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Primary performance metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Courses Enrolled</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">{dash?.coursesEnrolled ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">{dash?.activeCourses ?? 0} active</div>
        </Card>

        <Card className="!p-4">
          <div className="text-xs text-slate-500">Achievements Earned</div>
          <div className="text-3xl font-bold text-brand-orange-600 mt-1">{achievements.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Badges collected</div>
        </Card>

        <Card className="!p-4">
          <div className="text-xs text-slate-500">Tasks Due This Week</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{dash?.tasksDue ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Upcoming Tasks</div>
        </Card>

        <Card className="!p-4">
          <div className="text-xs text-slate-500">Learning Hours Logged</div>
          <div className="text-3xl font-bold text-slate-700 mt-1">{dash?.learningHoursLogged ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Hours this month</div>
        </Card>
      </div>

      {/* Analytics chart and recent activity grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <Card title="Learning Analytics" className="lg:col-span-2 flex flex-col">
          <div className="h-72 overflow-hidden -mt-4">
            <div className="overflow-x-auto overflow-y-hidden h-full">
              <div style={{ minWidth: Math.max((dash?.learningAnalytics?.length || 4) * 120, 600), height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dash?.learningAnalytics || []} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                    <defs>
                      <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      axisLine={false} 
                      tickLine={false} 
                      label={{ value: 'Time', position: 'bottom', offset: 0, fill: '#334155', fontWeight: 500 }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      unit="" 
                      ticks={[0, 20, 40, 60, 80, 100]} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      label={{ value: 'Progress', angle: -90, position: 'insideLeft', offset: -5, fill: '#334155', fontWeight: 500 }}
                    />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,.12)' }} />
                    <Legend verticalAlign="top" height={35} wrapperStyle={{ paddingTop: 0 }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: 20 }} iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="readiness"
                      name="Quiz Scores"
                      stroke="#f97316"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorQuiz)"
                      dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#f97316' }}
                      activeDot={{ r: 8 }}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                    />
                    <Area
                      type="monotone"
                      dataKey="lessonPercentage"
                      name="Videos Watched"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorLessons)"
                      dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#22c55e' }}
                      activeDot={{ r: 8 }}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                    />
                    <Area
                      type="monotone"
                      dataKey="assignmentPercentage"
                      name="Assignments Completed"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAssignments)"
                      dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#2563eb' }}
                      activeDot={{ r: 8 }}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4 sm:gap-6 h-full">
          {/* Recent activity list */}
          <Card title="Recent Activity" className="flex-1 flex flex-col">
            <ul className="space-y-2 text-sm">
              {(dash?.recentActivity || []).map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <span className="text-brand-blue-500">✓</span>
                  <span className="flex-1 truncate text-slate-700">{a.title}</span>
                  <span className="text-[11px] text-slate-400">{a.when}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Upcoming deadline status */}
          <Card title="Next Deadline" className="flex-1 flex flex-col justify-center">
            {nextDeadline ? (
              <div>
                <div className="font-semibold text-slate-800">{nextDeadline.title}</div>
                <div className="text-xs text-slate-500">Due {fmtRel(nextDeadline.due_date)}</div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nothing due. 🎉</p>
            )}
          </Card>
        </div>
      </div>

      {/* Feature module navigation grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {moduleCards.map((m) => (
          <Link key={m.to} to={m.to}>
            <Card className="hover:shadow-md transition !p-4 h-full">
              <div className="text-3xl">{m.emoji}</div>
              <div className="font-semibold text-slate-900 mt-2">{m.title}</div>
              <div className="text-[11px] text-slate-500 mt-1">{m.sub}</div>
              <div className="text-xs text-brand-blue-600 mt-3">Open →</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Educator course assignments */}
      {assignments.length > 0 && (
        <Card
          title="Assigned to You"
          action={<span className="text-xs text-slate-500">{assignments.length} from your educators</span>}
        >
          <ul className="space-y-2">
            {assignments.map((a) => {
              const overdue = a.due_date && a.status !== 'completed' && new Date(a.due_date) < new Date();
              return (
                <li key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <div className="text-2xl">📚</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">{a.course?.title || 'Course'}</div>
                    <div className="text-xs text-slate-500 truncate">
                      Assigned by {a.educator_name || 'your educator'}
                      {a.due_date && (
                        <>
                          {' · '}
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>
                            Due {new Date(a.due_date).toLocaleDateString()}
                            {overdue && ' (overdue)'}
                          </span>
                        </>
                      )}
                      {!a.due_date && ' · No due date'}
                    </div>
                    {a.note && <div className="text-[11px] text-slate-500 italic mt-1 truncate">“{a.note}”</div>}
                  </div>

                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    a.status === 'completed'
                      ? 'bg-brand-green-50 text-brand-green-700'
                      : a.status === 'in-progress'
                      ? 'bg-brand-blue-50 text-brand-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
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

      {/* Eligible job opportunities */}
      {recommendedJobs.length > 0 && (
        <Card
          title="Job Opportunities"
          action={
            <span className="text-xs text-slate-500">
              {recommendedJobs.length} job{recommendedJobs.length !== 1 ? "s" : ""} matched
            </span>
          }
        >
          <div className="space-y-3">
            {recommendedJobs.map((job) => (
              <div key={job.id} className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💼</span>
                      <div>
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <p className="text-xs text-slate-500">Job Opportunity</p>
                      </div>
                    </div>
                    {job.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{job.description}</p>
                    )}
                    {job.required_skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.required_skills.map((skill) => (
                          <span key={skill} className="text-[11px] px-2 py-1 rounded-full bg-brand-blue-50 text-brand-blue-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2">
                    {job.skill_match !== undefined && (
                      <span className="text-xs font-semibold text-brand-green-700">{job.skill_match}% Skill Match</span>
                    )}
                    <Link
                      to={`/app/jobs/${job.id}`}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-brand-blue-600 text-white text-sm hover:bg-brand-blue-700"
                    >
                      View Job →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Direct job invitations */}
      <Card
        title="Job Invitations"
        action={
          notifications.length > 0 && (
            <span className="text-xs text-slate-500">
              {notifications.length} invitation{notifications.length !== 1 ? "s" : ""}
            </span>
          )
        }
      >
        {notifications.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6">No job invitations yet.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center shrink-0">
                    💼
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm text-slate-800">Job Invitation</div>
                      {!notification.read_status && (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-brand-blue-50 text-brand-blue-700 font-medium">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                    {notification.created_at && (
                      <div className="text-[11px] text-slate-400 mt-2">{fmtRel(notification.created_at)}</div>
                    )}
                    {notification.job_id && (
                      <Link
                        to={`/app/jobs/${notification.job_id}`}
                        className="inline-flex mt-3 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                      >
                        View Job →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Personalized course recommendations */}
      {recs.length > 0 && (
        <Card
          title="Recommended for You"
          action={
            <Link to="/app/recommendations" className="text-xs text-brand-blue-600 hover:underline">
              See all →
            </Link>
          }
        >
          <ul className="space-y-2 text-sm">
            {recs.slice(0, 3).map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <span className="text-brand-blue-500">📘</span>
                <span className="font-medium text-slate-800">{r.course?.title}</span>
                <span className="text-xs text-slate-500 truncate">— {r.reason}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}