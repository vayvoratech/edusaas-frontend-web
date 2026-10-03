import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Button } from '../components/ui/Button';
import {
  getEducatorDashboard,
  getCourses,
  getStudentCandidates,
  getAnnouncements,
  resolveAssetUrl,
  markAnnouncementNotificationsRead,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

/* =========================================================
   Reviewer Avatar
========================================================= */

function ReviewerAvatar({
  name,
  avatarUrl,
  size = 'w-10 h-10',
  textClass = 'text-xs',
}) {
  const [imgError, setImgError] = useState(false);

  const initials =
    (name || '?')
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'S';

  const resolved =
    !imgError && avatarUrl ? resolveAssetUrl(avatarUrl) : null;

  if (resolved) {
    return (
      <img
        src={resolved}
        alt=""
        onError={() => setImgError(true)}
        className={`${size} rounded-2xl object-cover border border-white/70 dark:border-white/10 shrink-0 shadow-lg`}
      />
    );
  }

  const bgColors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-teal-100 text-teal-700 border-teal-200',
  ];

  const charSum = (name || 'S')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const colorClass = bgColors[charSum % bgColors.length];

  return (
    <div
      className={`${size} rounded-2xl ${colorClass} border flex items-center justify-center font-bold tracking-wider shrink-0 select-none shadow-md ${textClass}`}
      title={name}
    >
      {initials}
    </div>
  );
}

/* =========================================================
   Small UI Helpers
========================================================= */

function GradientIcon({
  children,
  className = '',
}) {
  return (
    <div
      className={`w-11 h-11 rounded-2xl bg-gradient-to-br from-white/90 via-white/70 to-white/30 dark:from-white/15 dark:via-white/10 dark:to-white/5 border border-white/70 dark:border-white/10 shadow-lg flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  valueClass = 'text-slate-900 dark:text-white',
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_15px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_55px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-1">
      <div
        className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`}
      />

      <div
        className={`absolute -right-10 -top-10 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-[0.10] blur-2xl group-hover:opacity-20 transition-opacity`}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {title}
            </div>

            <div
              className={`text-3xl font-black tracking-tight mt-2 ${valueClass}`}
            >
              {value}
            </div>

            {subtitle && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                {subtitle}
              </div>
            )}
          </div>

          <GradientIcon>{icon}</GradientIcon>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
      <div>
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-blue-600 dark:text-blue-400 mb-1">
            {eyebrow}
          </div>
        )}

        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>

        {description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  description,
  gradient,
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-white/70 dark:border-white/10 bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity`}
      />

      <div className="relative flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-lg shrink-0`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="font-bold text-sm text-slate-800 dark:text-white">
            {title}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </div>
        </div>

        <span className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-brand-blue-500 transition-colors text-lg">
          â†’
        </span>
      </div>
    </Link>
  );
}

/* =========================================================
   Main Educator Dashboard
========================================================= */

export default function EducatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [learners, setLearners] = useState([]);
  const [recent, setRecent] = useState([]);

  const dismissedKey = `edu_dismissed_announcements_${
    user?.id || 'educator'
  }`;

  /*
   * Keep this function stable so it can safely be used
   * inside the useEffect dependency array.
   */
  const getDismissedIds = useCallback(() => {
    try {
      const raw = localStorage.getItem(dismissedKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [dismissedKey]);

  const markSeenLocally = (id) => {
    try {
      const seenKey = `edu_seen_announcements_${
        user?.id || 'educator'
      }`;

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

    setRecent((prev) =>
      prev.filter((a) => a.id !== id)
    );

    navigate('/app/educator-community', {
      state: { activeTab: 'Announcements' },
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

    setRecent((prev) =>
      prev.filter((a) => a.id !== id)
    );
  };

  useEffect(() => {
    getEducatorDashboard()
      .then(setData)
      .catch(() => {});

    if (user?.id) {
      getCourses({
        educator_id: user.id,
        status: 'active',
      })
        .then(setCourses)
        .catch(() => {});
    }

    getStudentCandidates()
      .then(setLearners)
      .catch(() => {});

    getAnnouncements()
      .then((list) => {
        const dismissed = getDismissedIds();

        setRecent(
          (Array.isArray(list) ? list : []).filter(
            (a) => !dismissed.includes(a.id)
          )
        );
      })
      .catch(() => {});
  }, [user?.id, getDismissedIds]);

  const firstName =
    user?.name?.split(' ')[0] || 'Educator';

  return (
    <div className="relative min-h-full overflow-hidden">
      {/* =====================================================
          Ambient Background
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute top-[25%] -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-[35%] w-[420px] h-[420px] rounded-full bg-cyan-400/10 dark:bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="space-y-7 pb-8">

        {/* ===================================================
            Educator Hero
        ==================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 dark:border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white shadow-[0_25px_80px_rgba(30,64,175,0.25)]">
          {/* Decorative glow */}
          <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute top-10 left-1/2 w-32 h-32 rounded-full bg-blue-400/10 blur-2xl" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-bold text-blue-100 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]" />
                  Educator Command Center
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05]">
                  Welcome back,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300">
                    {firstName}
                  </span>
                  .
                </h2>

                <p className="mt-4 text-sm sm:text-base text-blue-100/75 max-w-xl leading-relaxed">
                  Manage your learning programs, monitor learner
                  performance, review course feedback, and keep your
                  students moving forward.
                </p>

                <div className="flex flex-wrap gap-3 mt-7">
                  <Link to="/app/manage-courses">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-950 px-5 py-2.5 text-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                      <span>ðŸ“š</span>
                      Manage Courses
                      <span>â†’</span>
                    </button>
                  </Link>

                  <Link to="/app/learners">
                    <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 text-sm font-bold hover:bg-white/15 transition-all">
                      <span>ðŸ‘¥</span>
                      View Learners
                    </button>
                  </Link>
                </div>
              </div>

              {/* Hero analytics */}
              <div className="grid grid-cols-2 gap-3 min-w-0 lg:min-w-[330px]">
                <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-4">
                  <div className="text-[10px] uppercase tracking-wider text-blue-200/70 font-bold">
                    Learners
                  </div>

                  <div className="text-3xl font-black mt-1">
                    {data?.enrolledLearners ?? 0}
                  </div>

                  <div className="text-[10px] text-blue-100/60 mt-1">
                    currently enrolled
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-4">
                  <div className="text-[10px] uppercase tracking-wider text-blue-200/70 font-bold">
                    Avg. Score
                  </div>

                  <div className="text-3xl font-black mt-1">
                    {data?.avgCompletion ?? 0}%
                  </div>

                  <div className="text-[10px] text-blue-100/60 mt-1">
                    learning completion
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-blue-200/70 font-bold">
                        Educator Overview
                      </div>

                      <div className="text-sm font-semibold mt-1 text-blue-50">
                        Keep your learners progressing.
                      </div>
                    </div>

                    <div className="text-2xl">
                      âœ¨
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            Key Educator Metrics
        ==================================================== */}

        <section>
          <SectionHeader
            eyebrow="Teaching Overview"
            title="Your learning ecosystem"
            description="A quick view of the learners, courses, feedback and workload you manage."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              title="Enrolled Learners"
              value={data?.enrolledLearners ?? 0}
              subtitle={`Avg. completion ${data?.avgCompletion ?? 0}%`}
              gradient="from-blue-500 to-cyan-400"
              icon={
                <span className="text-xl">
                  ðŸ‘¥
                </span>
              }
            />

            <MetricCard
              title="Active Courses"
              value={data?.activeCourses ?? 0}
              subtitle="Currently published"
              gradient="from-emerald-500 to-teal-400"
              icon={
                <span className="text-xl">
                  ðŸ“š
                </span>
              }
              valueClass="text-emerald-700 dark:text-emerald-300"
            />

            <MetricCard
              title="Course Ratings"
              value={data?.courseRatings ?? 0}
              subtitle={
                data?.avgRating
                  ? `Average rating ${data.avgRating} â˜…`
                  : 'No reviews yet'
              }
              gradient="from-amber-500 to-orange-400"
              icon={
                <span className="text-xl">
                  â­
                </span>
              }
              valueClass="text-amber-600 dark:text-amber-300"
            />

            <Link
              to="/app/tasks"
              className="block group"
            >
              <div className="relative overflow-hidden h-full rounded-3xl border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_15px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_55px_rgba(15,23,42,0.14)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 to-pink-500" />

                <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 opacity-10 blur-2xl" />

                <div className="relative p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                        Upcoming Tasks
                      </div>

                      <div className="text-3xl font-black tracking-tight mt-2 text-rose-600 dark:text-rose-300">
                        {data?.upcomingTasks ?? 0}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                        {data?.upcomingTasks === 1
                          ? '1 task pending'
                          : `${data?.upcomingTasks ?? 0} tasks pending`}
                      </div>
                    </div>

                    <GradientIcon>
                      <span className="text-xl">
                        â±
                      </span>
                    </GradientIcon>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ===================================================
            Analytics
        ==================================================== */}

        <section>
          <SectionHeader
            eyebrow="Analytics"
            title="Learner intelligence"
            description="Understand how your learners are progressing and where skill gaps remain."
          />

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

            {/* Performance */}
            <div className="xl:col-span-3 relative overflow-hidden rounded-[2rem] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] font-black text-blue-600 dark:text-blue-400">
                      Performance
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white mt-1">
                      Learner Performance
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Technical skills and learner engagement over time.
                    </p>
                  </div>

                  <div className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 items-center justify-center">
                    ðŸ“ˆ
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={data?.learnerPerformance || []}
                      margin={{
                        top: 10,
                        right: 10,
                        left: -15,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="technicalGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#2563eb"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor="#2563eb"
                            stopOpacity={0}
                          />
                        </linearGradient>

                        <linearGradient
                          id="engagementGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="4 5"
                        stroke="#e2e8f0"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="week"
                        tick={{
                          fontSize: 10,
                          fill: '#64748b',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: '#64748b',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: '14px',
                          border: '1px solid rgba(148,163,184,.2)',
                          boxShadow:
                            '0 15px 40px rgba(15,23,42,.12)',
                        }}
                      />

                      <Legend
                        wrapperStyle={{
                          fontSize: 11,
                          paddingTop: 8,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="technical"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{
                          r: 3,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                        }}
                        name="Technical Skills"
                      />

                      <Line
                        type="monotone"
                        dataKey="engagement"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{
                          r: 3,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                        }}
                        name="Engagement"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Skill Gap */}
            <div className="xl:col-span-2 relative overflow-hidden rounded-[2rem] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] font-black text-amber-600 dark:text-amber-400">
                      Insights
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white mt-1">
                      Skill Gap Analysis
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Areas where learners need more attention.
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    ðŸŽ¯
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={data?.skillGapAnalysis || []}
                      margin={{
                        top: 10,
                        right: 0,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 5"
                        stroke="#e2e8f0"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="skill"
                        tick={{
                          fontSize: 9,
                          fill: '#64748b',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{
                          fontSize: 9,
                          fill: '#64748b',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: '14px',
                          border: '1px solid rgba(148,163,184,.2)',
                          boxShadow:
                            '0 15px 40px rgba(15,23,42,.12)',
                        }}
                      />

                      <Bar
                        dataKey="value"
                        fill="#f59e0b"
                        radius={[8, 8, 2, 2]}
                        name="Gap"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            Learners + Announcements
        ==================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Active Learners */}
          <div className="xl:col-span-2 relative overflow-hidden rounded-[2rem] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400" />

            <div className="p-5 sm:p-6">
              <SectionHeader
                eyebrow="Learner Management"
                title="Active Learners"
                description="A quick view of learner engagement."
                action={
                  <Link
                    to="/app/learners"
                    className="text-xs font-bold text-brand-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View all â†’
                  </Link>
                }
              />

              <div className="space-y-2">
                {learners.slice(0, 6).map((l, i) => {
                  const score = 60 + ((i * 17) % 35);

                  return (
                    <div
                      key={l.id}
                      className="group flex items-center gap-3 p-3 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20 hover:bg-blue-50/60 dark:hover:bg-blue-500/5 transition-all"
                    >
                      <ReviewerAvatar
                        name={l.name}
                        size="w-10 h-10"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-800 dark:text-white truncate">
                          {l.name}
                        </div>

                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Active learner
                        </div>
                      </div>

                      <div className="hidden sm:block w-32">
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              score > 80
                                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                                : 'bg-gradient-to-r from-amber-400 to-orange-500'
                            }`}
                            style={{
                              width: `${score}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div
                        className={`text-xs font-black w-10 text-right ${
                          score > 80
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {score}%
                      </div>

                      <span className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors">
                        â†’
                      </span>
                    </div>
                  );
                })}

                {learners.length === 0 && (
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 py-10 text-center">
                    <div className="text-3xl mb-2">
                      ðŸ‘¥
                    </div>

                    <p className="text-sm text-slate-400">
                      No active learners yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400" />

            <div className="p-5 sm:p-6">
              <SectionHeader
                eyebrow="Communication"
                title="Announcements"
                description="Recent updates for your learning community."
                action={
                  <button
                    onClick={() =>
                      navigate('/app/educator-community', {
                        state: {
                          activeTab: 'Announcements',
                        },
                      })
                    }
                    className="text-xs font-bold text-brand-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View feed â†’
                  </button>
                }
              />

              <ul className="space-y-2">
                {recent.slice(0, 4).map((a) => (
                  <li
                    key={a.id}
                    onClick={() =>
                      handleAnnouncementClick(a.id)
                    }
                    className="group flex items-center gap-3 p-3 rounded-2xl border border-transparent hover:border-orange-100 dark:hover:border-orange-500/20 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-all cursor-pointer"
                    title="Click to view in Community Announcements"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
                      ðŸ“£
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                        {a.title}
                      </div>

                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Community announcement
                      </div>
                    </div>

                    <button
                      onClick={(e) =>
                        handleDismissOnly(e, a.id)
                      }
                      title="Dismiss from dashboard"
                      className="w-7 h-7 rounded-lg text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 grid place-items-center text-xs transition"
                    >
                      âœ•
                    </button>
                  </li>
                ))}

                {recent.length === 0 && (
                  <li className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 py-8 text-center">
                    <div className="text-2xl mb-2">
                      ðŸ“­
                    </div>

                    <div className="text-xs text-slate-400">
                      No active announcements on dashboard.
                    </div>
                  </li>
                )}
              </ul>

              <Link to="/app/announcements">
                <Button
                  className="mt-4 w-full !rounded-xl"
                  variant="outline"
                >
                  ðŸ“£ Send Announcement
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ===================================================
            Quick Actions
        ==================================================== */}

        <section>
          <SectionHeader
            eyebrow="Educator Tools"
            title="Quick actions"
            description="Jump directly into the tools you use most."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <QuickAction
              to="/app/manage-courses"
              title="Manage Courses"
              description="Create and manage your courses"
              gradient="from-blue-600 to-cyan-500"
              icon="ðŸ“š"
            />

            <QuickAction
              to="/app/learners"
              title="View Learners"
              description="Monitor your learner community"
              gradient="from-violet-600 to-indigo-500"
              icon="ðŸ‘¥"
            />

            <QuickAction
              to="/app/insights"
              title="Insights Report"
              description="Explore learning analytics"
              gradient="from-emerald-600 to-teal-500"
              icon="ðŸ“ˆ"
            />

            <QuickAction
              to="/app/announcements"
              title="Send Announcement"
              description="Communicate with learners"
              gradient="from-orange-500 to-rose-500"
              icon="ðŸ“£"
            />
          </div>
        </section>

        {/* ===================================================
            Feedback
        ==================================================== */}

        <section>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500" />

            <div className="p-5 sm:p-6">
              <SectionHeader
                eyebrow="Learner Voice"
                title="Recent Course Feedback & Reviews"
                description="See what learners are saying about your courses."
                action={
                  <Link
                    to="/app/manage-courses"
                    className="text-xs text-brand-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    View all in Courses
                    <span>â†’</span>
                  </Link>
                }
              />

              {data?.recentFeedbacks &&
              data.recentFeedbacks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.recentFeedbacks
                    .slice(0, 4)
                    .map((f) => (
                      <div
                        key={f.id}
                        className="group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/70 dark:to-slate-900/70 border border-slate-100 dark:border-white/10 hover:border-amber-200 dark:hover:border-amber-500/20 hover:shadow-lg transition-all"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-400/10 blur-2xl" />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <ReviewerAvatar
                                name={f.user_name}
                                avatarUrl={f.avatar_url}
                              />

                              <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-800 dark:text-white truncate">
                                  {f.user_name}
                                </div>

                                <div className="text-[11px] text-brand-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">
                                  {f.course_title}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 text-amber-400 text-sm shrink-0">
                              {[1, 2, 3, 4, 5].map(
                                (star) => (
                                  <span key={star}>
                                    {star <= f.rating
                                      ? 'â˜…'
                                      : 'â˜†'}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          {f.review ? (
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 italic">
                              "{f.review}"
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                              Rated {f.rating} stars with no
                              written comments.
                            </p>
                          )}

                          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-3">
                            {f.created_at
                              ? new Date(
                                  f.created_at
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )
                              : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-100 dark:border-white/10 text-center py-10">
                  <div className="text-4xl mb-3">
                    ðŸ’¬
                  </div>

                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    No student course feedback received yet.
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    When learners rate your courses, their
                    reviews will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            My Courses
        ==================================================== */}

        <section>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />

            <div className="p-5 sm:p-6">
              <SectionHeader
                eyebrow="Course Management"
                title="My Courses"
                description="Your currently active learning programs."
                action={
                  <Link
                    to="/app/manage-courses"
                    className="inline-flex items-center gap-1 rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-xs font-bold text-brand-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                  >
                    Manage Courses
                    <span>â†’</span>
                  </Link>
                }
              />

              {courses.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 py-10 text-center border border-slate-100 dark:border-white/10">
                  <div className="text-4xl mb-3">
                    ðŸ“š
                  </div>

                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    No active courses yet.
                  </div>

                  <Link
                    to="/app/manage-courses"
                    className="inline-block mt-3 text-xs font-bold text-brand-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Create or manage courses â†’
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {courses.slice(0, 4).map((c, index) => (
                    <div
                      key={c.id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-100 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900/70 p-4 hover:border-blue-200 dark:hover:border-blue-500/20 hover:shadow-lg transition-all"
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          index % 4 === 0
                            ? 'bg-gradient-to-b from-blue-500 to-cyan-400'
                            : index % 4 === 1
                            ? 'bg-gradient-to-b from-violet-500 to-indigo-400'
                            : index % 4 === 2
                            ? 'bg-gradient-to-b from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-b from-orange-500 to-pink-400'
                        }`}
                      />

                      <div className="flex items-center gap-3 pl-2">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 border border-blue-100 dark:border-blue-500/10 flex items-center justify-center text-xl shrink-0">
                          ðŸ“–
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-slate-800 dark:text-white truncate">
                            {c.title}
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {c.category && (
                              <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {c.category}
                              </span>
                            )}

                            {c.difficulty && (
                              <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                {c.difficulty}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors">
                          â†’
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            Bottom Educator Insight
        ==================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-blue-200/60 dark:border-blue-500/10 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative p-6 sm:p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center shadow-lg text-xl shrink-0">
                  âœ¨
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] font-black text-blue-600 dark:text-blue-400">
                    Educator Focus
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    Turn learner data into better teaching decisions.
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                    Review skill gaps, learner engagement, course
                    feedback and performance trends to identify where
                    your students need the most support.
                  </p>
                </div>
              </div>

              <Link to="/app/insights">
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-2.5 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap">
                  Open Insights
                  <span>â†’</span>
                </button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
