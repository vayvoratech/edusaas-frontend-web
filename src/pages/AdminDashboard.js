import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, StatPill } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getInsights, getAllUsers, getAssessmentReports, getAdminRecentActivity } from '../services/api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const ROLE_COLORS = {
  Student: '#2563eb',
  Educator: '#10b981',
  Employer: '#f59e0b',
  Admin: '#8b5cf6',
};

const ROLE_BADGES = {
  Student: 'bg-brand-blue-100 text-brand-blue-700',
  Educator: 'bg-brand-green-100 text-brand-green-600',
  Employer: 'bg-brand-orange-100 text-brand-orange-600',
  Admin: 'bg-violet-100 text-violet-700',
};

const initialsOf = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const QUICK_LINKS = [
  { to: '/app/users', icon: '👥', label: 'Manage Users' },
  { to: '/app/user-details', icon: '📋', label: 'User Details' },
  { to: '/app/reports', icon: '📑', label: 'Reports' },
  { to: '/app/subscriptions', icon: '💳', label: 'Subscriptions' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
const [assessmentReports, setAssessmentReports] = useState([]);
const [recentActivity, setRecentActivity] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const [ins, us, reportsResponse, activityResponse] = await Promise.all([
  getInsights(),
  getAllUsers(),
  getAssessmentReports(),
  getAdminRecentActivity(10),
]);

setInsights(ins);
setUsers(us);

const activities = Array.isArray(activityResponse)
  ? activityResponse
  : activityResponse?.activities || activityResponse?.data || [];

setRecentActivity(activities);

const reports = Array.isArray(reportsResponse)
  ? reportsResponse
  : reportsResponse?.reports ||
    reportsResponse?.data ||
    [];

setAssessmentReports(reports);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load admin data');
      }
    })();
  }, []);

  const activeUsers = (users || []).filter((user) => {
    const status = String(user?.status ?? '').trim().toLowerCase();
    return status !== 'suspended';
  });

  const roleCounts = activeUsers.reduce((acc, user) => {
    const rawRole = String(user?.role ?? '').trim();
    const role = rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase() : 'Unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const activeUsersByRole = ['Student', 'Educator', 'Employer', 'Admin']
    .map((role) => ({
      name: role,
      value: roleCounts[role] || 0,
      color: ROLE_COLORS[role] || '#cbd5e1',
    }))
    .filter((item) => item.value > 0);

  const totalActiveUsers = activeUsers.length;

  const pendingAssessmentReports = assessmentReports.filter((report) => {
  const status = String(report?.status ?? '').toLowerCase();

  return [
    'pending',
    'open',
    'submitted',
    'reviewing',
    'under_review',
  ].includes(status);
});

const pendingAssessmentCount = pendingAssessmentReports.length;

  const stats = [
    { label: 'Active Users', tone: 'blue', isActiveUsers: true },
    { label: 'Active Courses', tone: 'green', isActiveCourses: true },
    { label: 'Enrollments', tone: 'orange', isEnrollments: true },
    { label: 'Open Jobs', tone: 'slate', isOpenJobs: true },
  ];

  // Purely presentational: skeleton shown until the first load settles.
  const isLoading = !insights && !error;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue-900 via-brand-blue-700 to-brand-blue-500 p-6 text-white shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest">
              Admin Console
            </span>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-brand-blue-100">
              User management, permissions, and platform usage at a glance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="!border-white/40 !bg-white/10 !text-white hover:!bg-white/20 focus:ring-white/40"
              onClick={() => navigate('/app/users')}
            >
              👥 Manage Users
            </Button>
            <Button
              variant="outline"
              className="!border-transparent !bg-white !text-brand-blue-700 hover:!bg-brand-blue-50"
              onClick={() => navigate('/app/reports')}
            >
              📑 View Reports
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <span aria-hidden>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div className="mt-4 h-3 w-24 rounded bg-slate-200" />
                <div className="mt-3 h-8 w-16 rounded bg-slate-100" />
                <div className="mt-6 h-1.5 w-full rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-2" />
            <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        </div>
      ) : (
        <>
          {/* KPI stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => {
              if (s.isActiveUsers) {
                return (
                  <Card key={s.label} className="!p-4 flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-blue-100 text-brand-blue-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </span>
                        <span className="text-xs font-medium text-slate-500">{s.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-brand-blue-100 px-2.5 py-1 text-xs font-semibold text-brand-blue-700">
                        <span className="text-[10px] uppercase tracking-wide opacity-75">Total</span>
                        <span>{totalActiveUsers}</span>
                      </div>
                    </div>

                    <div className="mt-3 h-36">
                      {activeUsersByRole.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={activeUsersByRole}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={24}
                              outerRadius={56}
                              paddingAngle={2}
                              stroke="white"
                              strokeWidth={2}
                            >
                              {activeUsersByRole.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [`${value} users`, name || 'Role']}
                              labelFormatter={(label) => label}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                          No active users
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeUsersByRole.map((entry) => (
                        <div
                          key={entry.name}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                        >
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          {entry.name}
                          <span className="font-semibold text-slate-700">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              }

              if (s.isActiveCourses) {
                const completionRate = Math.min(Math.max(insights?.courses?.completion_rate ?? 0, 0), 100);

                return (
                  <Card key={s.label} className="!p-4 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-green-100 text-brand-green-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </span>
                      <span className="text-xs font-medium text-slate-500">{s.label}</span>
                    </div>
                    <div className="mt-3 text-3xl font-bold leading-none text-slate-900">
                      {insights?.courses?.active ?? 0}
                    </div>
                    <div className="mt-2.5">
                      <StatPill value={`+${insights?.courses?.new_this_month ?? 0} New This Month`} tone={s.tone} />
                    </div>
                    <div className="mt-auto pt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                        <span>Completion Rate</span>
                        <span className="font-semibold text-slate-700">{insights?.courses?.completion_rate ?? 0}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-brand-green-100">
                        <div
                          className="h-full rounded-full bg-brand-green-500 transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              }

              if (s.isEnrollments) {
                const activeRate = Math.min(Math.max(insights?.enrollments?.active_rate ?? 0, 0), 100);

                return (
                  <Card key={s.label} className="!p-4 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-orange-100 text-brand-orange-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a3 3 0 11-6 0 3 3 0 016 0zM3 13a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </span>
                      <span className="text-xs font-medium text-slate-500">{s.label}</span>
                    </div>
                    <div className="mt-3 text-3xl font-bold leading-none text-slate-900">
                      {insights?.enrollments?.total ?? 0}
                    </div>
                    <div className="mt-2.5">
                      <StatPill value={`+${insights?.enrollments?.new_this_month ?? 0} New This Month`} tone={s.tone} />
                    </div>
                    <div className="mt-auto pt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                        <span>Active Enrollment Rate</span>
                        <span className="font-semibold text-slate-700">{insights?.enrollments?.active_rate ?? 0}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-brand-orange-100">
                        <div
                          className="h-full rounded-full bg-brand-orange-500 transition-all duration-500"
                          style={{ width: `${activeRate}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              }

              if (s.isOpenJobs) {
                return (
                  <Card key={s.label} className="!p-4 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-8.995-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="text-xs font-medium text-slate-500">{s.label}</span>
                    </div>
                    <div className="mt-3 text-3xl font-bold leading-none text-slate-900">
                      {insights?.jobs?.open ?? 0}
                    </div>
                    <div className="mt-2.5">
                      <StatPill value={`+${insights?.jobs?.new_this_month ?? 0} New This Month`} tone={s.tone} />
                    </div>
                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Applications Received</span>
                        <span className="font-semibold text-slate-700">{insights?.jobs?.applications_received ?? 0}</span>
                      </div>
                    </div>
                  </Card>
                );
              }

              return (
                <Card key={s.label} className="!p-4">
                  <div className="text-xs text-slate-500">{s.label}</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">{s.value}</div>
                  <StatPill value={`avg score ${insights?.assessments?.average_score ?? 0}%`} tone={s.tone} />
                </Card>
              );
            })}
          </div>

{/* Needs Attention */}
<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
  <Card
    title="Needs Attention"
    className="lg:col-span-2"
    action={
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Admin actions
      </span>
    }
  >
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/60 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
            ⚠️
          </div>

          <div className="min-w-0">
            <div className="font-semibold text-slate-800">
              Assessment Reviews
            </div>

            <div className="mt-0.5 text-xs text-slate-500">
              Student termination reports awaiting administrative review
            </div>
          </div>
        </div>

        <div className="ml-3 flex shrink-0 items-center gap-3">
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
            {pendingAssessmentCount}
          </span>

          <Button
            variant="outline"
            onClick={() => navigate('/app/assessment-reviews')}
          >
            Review
          </Button>
        </div>
      </div>

      {pendingAssessmentCount === 0 && (
        <div className="rounded-xl border border-brand-green-100 bg-brand-green-50 p-3 text-sm text-brand-green-700">
          ✓ No assessment termination reports are currently awaiting review.
        </div>
      )}
    </div>
  </Card>

  <Card
    title="Assessment Activity"
    action={
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Current
      </span>
    }
  >
    <div className="space-y-4">
      <div>
        <div className="text-xs text-slate-500">
          Total reports
        </div>
        <div className="mt-1 text-2xl font-bold text-slate-900">
          {assessmentReports.length}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">
          Awaiting review
        </span>

        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
          {pendingAssessmentCount}
        </span>
      </div>
    </div>
  </Card>
</div>


          {/* Insights + recent users */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <Card
              title="AI Insights Hub"
              className="lg:col-span-2"
              action={
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Platform analytics
                </span>
              }
            >
              <p className="text-sm text-slate-600">
                Aggregated platform metrics and the skills your learners need most.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <span aria-hidden>📝</span> Assessments Taken
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {insights?.assessments?.count ?? 0}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <span aria-hidden>🎯</span> Average Score
                  </div>
                  <div className="mt-1 text-2xl font-bold text-brand-blue-700">
                    {insights?.assessments?.average_score ?? 0}%
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-brand-blue-100">
                    <div
                      className="h-full rounded-full bg-brand-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(insights?.assessments?.average_score ?? 0, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <span aria-hidden>💼</span> Applications
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {insights?.jobs?.applications_received ?? 0}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Top Missing Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {(insights?.top_missing_skills || []).length > 0 ? (
                    (insights?.top_missing_skills || []).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-brand-orange-100 px-2.5 py-1 text-xs font-medium text-brand-orange-600"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No skill gaps detected yet.</span>
                  )}
                </div>
              </div>
            </Card>

            <Card
              title="Recent Users"
              action={
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Latest signups
                </span>
              }
            >
              <ul className="divide-y divide-slate-100">
                {users.slice(0, 6).map((u) => {
                  const color = ROLE_COLORS[u.role] || '#94a3b8';
                  return (
                    <li key={u.id} className="flex items-center gap-3 py-2.5">
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: `${color}1A`, color }}
                      >
                        {initialsOf(u.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-800">{u.name}</div>
                        <div className="truncate text-xs text-slate-500">{u.email}</div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ROLE_BADGES[u.role] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role}
                      </span>
                    </li>
                  );
                })}
                {users.length === 0 && (
                  <li className="py-3 text-xs text-slate-400">No users yet.</li>
                )}
              </ul>
              <Button className="mt-4 w-full" variant="outline" onClick={() => navigate('/app/users')}>
                Manage all users
              </Button>
            </Card>
          </div>



          {/* Live activity */}
<Card
  title="Live Activity"
  action={
    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      Platform events
    </span>
  }
>
  {recentActivity.length === 0 ? (
    <div className="py-8 text-center text-sm text-slate-500">
      No recent activity available.
    </div>
  ) : (
    <ul className="divide-y divide-slate-100">
      {recentActivity.map((activity) => (
        <li
          key={`${activity.type}-${activity.id}`}
          className="flex items-start gap-3 py-3"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
            {activity.type === 'enrollment' && '📚'}
            {activity.type === 'lesson' && '▶️'}
            {activity.type === 'task' && '✅'}
            {activity.type === 'achievement' && '🏆'}
            {activity.type === 'certificate' && '🎓'}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800">
              {activity.title}
            </p>

           <p className="mt-0.5 text-xs text-slate-500">
  {activity.user?.name || activity.user?.email || 'Unknown user'}
{activity.course
  ? ` • ${activity.course?.title || activity.course?.name || 'Course'}`
  : ''}
  
</p>
            <p className="mt-1 text-[11px] text-slate-400">
              {activity.when
                ? new Date(activity.when).toLocaleString()
                : 'Recently'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )}
</Card>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {QUICK_LINKS.map((q) => (
              <Link key={q.to} to={q.to} className="group">
                <Card className="!p-4 transition group-hover:border-brand-blue-200 group-hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">{q.icon}</div>
                    <span className="text-[10px] text-slate-400 transition-colors group-hover:text-brand-blue-600">
                      →
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-800">{q.label}</div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
