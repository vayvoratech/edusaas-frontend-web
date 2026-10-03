import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  getInsights,
  getAllUsers,
  getAssessmentReports,
  getAdminRecentActivity,
} from '../services/api';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

/* =========================================================
   ADMIN DASHBOARD — EDITORIAL CONTROL CENTER
   Bright / Asymmetrical / Editorial / No Dark UI
   ========================================================= */

const ROLE_COLORS = {
  Student: '#3155F5',
  Educator: '#18A66A',
  Employer: '#F26B38',
  Admin: '#E4477A',
};

const ROLE_BADGES = {
  Student: 'bg-[#EEF2FF] text-[#3155F5]',
  Educator: 'bg-[#EAFBF3] text-[#128152]',
  Employer: 'bg-[#FFF1EA] text-[#D95528]',
  Admin: 'bg-[#FFF0F5] text-[#C93668]',
};

const QUICK_LINKS = [
  {
    to: '/app/users',
    icon: 'users',
    label: 'Manage Users',
    description: 'Accounts & roles',
    accent: '#3155F5',
  },
  {
    to: '/app/user-details',
    icon: 'profile',
    label: 'User Details',
    description: 'Profiles & records',
    accent: '#18A66A',
  },
  {
    to: '/app/reports',
    icon: 'report',
    label: 'Reports',
    description: 'Platform analytics',
    accent: '#F26B38',
  },
  {
    to: '/app/subscriptions',
    icon: 'card',
    label: 'Subscriptions',
    description: 'Plans & billing',
    accent: '#E4477A',
  },
];

/* =========================================================
   ICON SYSTEM
   ========================================================= */

function Icon({
  name,
  className = 'h-5 w-5',
  strokeWidth = 1.8,
}) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  const icons = {
    users: (
      <>
        <circle {...common} cx="9" cy="7" r="4" />
        <path {...common} d="M3 21v-2a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v2" />
        <path {...common} d="M16 3.5a4 4 0 0 1 0 7.5" />
        <path {...common} d="M19 14a5 5 0 0 1 3 4.5V21" />
      </>
    ),

    profile: (
      <>
        <circle {...common} cx="12" cy="8" r="3.5" />
        <path {...common} d="M5 20a7 7 0 0 1 14 0" />
        <rect {...common} x="3" y="3" width="18" height="18" rx="4" />
      </>
    ),

    report: (
      <>
        <path {...common} d="M6 3h9l4 4v14H6z" />
        <path {...common} d="M14 3v5h5" />
        <path {...common} d="M9 13h6" />
        <path {...common} d="M9 17h4" />
        <path {...common} d="M9 9h2" />
      </>
    ),

    card: (
      <>
        <rect {...common} x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path {...common} d="M2.5 10h19" />
        <path {...common} d="M7 15h3" />
      </>
    ),

    dashboard: (
      <>
        <rect {...common} x="3" y="3" width="7" height="7" rx="1.5" />
        <rect {...common} x="14" y="3" width="7" height="7" rx="1.5" />
        <rect {...common} x="3" y="14" width="7" height="7" rx="1.5" />
        <rect {...common} x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),

    book: (
      <>
        <path {...common} d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v19H7.5A2.5 2.5 0 0 1 5 18.5z" />
        <path {...common} d="M5 4.5v14" />
        <path {...common} d="M9 7h7" />
        <path {...common} d="M9 11h7" />
      </>
    ),

    enrollment: (
      <>
        <circle {...common} cx="9" cy="8" r="3.5" />
        <path {...common} d="M3 20a6 6 0 0 1 12 0" />
        <path {...common} d="M18 8v6" />
        <path {...common} d="M15 11h6" />
      </>
    ),

    briefcase: (
      <>
        <rect {...common} x="3" y="7" width="18" height="13" rx="2" />
        <path {...common} d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path {...common} d="M3 12h18" />
        <path {...common} d="M10 12v2h4v-2" />
      </>
    ),

    alert: (
      <>
        <path {...common} d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z" />
        <path {...common} d="M12 9v4" />
        <path {...common} d="M12 16h.01" />
      </>
    ),

    clipboard: (
      <>
        <rect {...common} x="5" y="4" width="14" height="17" rx="2" />
        <path {...common} d="M9 4V2h6v2" />
        <path {...common} d="M8.5 10h7" />
        <path {...common} d="M8.5 14h7" />
        <path {...common} d="M8.5 18h4" />
      </>
    ),

    check: (
      <>
        <circle {...common} cx="12" cy="12" r="9" />
        <path {...common} d="m8 12 2.5 2.5L16 9" />
      </>
    ),

    sparkles: (
      <>
        <path {...common} d="m12 3-1.2 4.3a5 5 0 0 1-3.5 3.5L3 12l4.3 1.2a5 5 0 0 1 3.5 3.5L12 21l1.2-4.3a5 5 0 0 1 3.5-3.5L21 12l-4.3-1.2a5 5 0 0 1-3.5-3.5z" />
        <path {...common} d="m19 3 .5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5z" />
      </>
    ),

    activity: (
      <>
        <path {...common} d="M3 12h4l2-7 4 14 2-7h6" />
      </>
    ),

    chart: (
      <>
        <path {...common} d="M4 19V5" />
        <path {...common} d="M4 19h17" />
        <path {...common} d="m7 15 4-5 3 2 5-7" />
      </>
    ),

    clock: (
      <>
        <circle {...common} cx="12" cy="12" r="9" />
        <path {...common} d="M12 7v5l3 2" />
      </>
    ),

    arrow: (
      <>
        <path {...common} d="M5 12h13" />
        <path {...common} d="m13 6 6 6-6 6" />
      </>
    ),

    arrowUp: (
      <>
        <path {...common} d="M12 19V5" />
        <path {...common} d="m6 11 6-6 6 6" />
      </>
    ),

    shield: (
      <>
        <path {...common} d="M12 3 20 6v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6z" />
        <path {...common} d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),

    lightning: (
      <>
        <path {...common} d="m13 2-9 11h7l-1 9 9-12h-7z" />
      </>
    ),

    filter: (
      <>
        <path {...common} d="M4 6h16" />
        <path {...common} d="M7 12h10" />
        <path {...common} d="M10 18h4" />
      </>
    ),

    menu: (
      <>
        <path {...common} d="M4 7h16" />
        <path {...common} d="M4 12h16" />
        <path {...common} d="M4 17h16" />
      </>
    ),

    chevron: (
      <>
        <path {...common} d="m9 6 6 6-6 6" />
      </>
    ),

    close: (
      <>
        <path {...common} d="m6 6 12 12" />
        <path {...common} d="m18 6-12 12" />
      </>
    ),

    userCheck: (
      <>
        <circle {...common} cx="9" cy="8" r="3.5" />
        <path {...common} d="M3 20a6 6 0 0 1 12 0" />
        <path {...common} d="m16 14 2 2 4-4" />
      </>
    ),

    file: (
      <>
        <path {...common} d="M6 3h8l5 5v13H6z" />
        <path {...common} d="M14 3v6h5" />
        <path {...common} d="M9 13h6" />
        <path {...common} d="M9 17h4" />
      </>
    ),

    target: (
      <>
        <circle {...common} cx="12" cy="12" r="8" />
        <circle {...common} cx="12" cy="12" r="4" />
        <circle {...common} cx="12" cy="12" r="1" />
      </>
    ),

    menuDots: (
      <>
        <circle cx="5" cy="12" r="1.4" fill="currentColor" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" />
        <circle cx="19" cy="12" r="1.4" fill="currentColor" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {icons[name] || icons.dashboard}
    </svg>
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

const initialsOf = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat('en-IN').format(number);
};

const clampPercent = (value) => {
  const number = Number(value || 0);

  if (Number.isNaN(number)) return 0;

  return Math.min(100, Math.max(0, number));
};

const getActivityIcon = (type) => {
  const value = String(type || '').toLowerCase();

  if (value.includes('enrollment')) return 'enrollment';
  if (value.includes('lesson')) return 'book';
  if (value.includes('task')) return 'clipboard';
  if (value.includes('achievement')) return 'target';
  if (value.includes('certificate')) return 'check';

  return 'activity';
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function AdminDashboard() {

  const [insights, setInsights] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [assessmentReports, setAssessmentReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [
          ins,
          us,
          reportsResponse,
          activityResponse,
        ] = await Promise.all([
          getInsights(),
          getAllUsers(),
          getAssessmentReports(),
          getAdminRecentActivity(10),
        ]);

        setInsights(ins);
        setUsers(us);

        const activities = Array.isArray(activityResponse)
          ? activityResponse
          : activityResponse?.activities ||
            activityResponse?.data ||
            [];

        setRecentActivity(activities);

        const reports = Array.isArray(reportsResponse)
          ? reportsResponse
          : reportsResponse?.reports ||
            reportsResponse?.data ||
            [];

        setAssessmentReports(reports);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            'Failed to load admin data'
        );
      }
    })();
  }, []);

  /* =========================================================
     DERIVED DATA
     ========================================================= */

  const activeUsers = (users || []).filter((user) => {
    const status = String(
      user?.status ?? ''
    )
      .trim()
      .toLowerCase();

    return status !== 'suspended';
  });

  const roleCounts = activeUsers.reduce((acc, user) => {
    const rawRole = String(user?.role ?? '').trim();

    const role = rawRole
      ? rawRole.charAt(0).toUpperCase() +
        rawRole.slice(1).toLowerCase()
      : 'Unknown';

    acc[role] = (acc[role] || 0) + 1;

    return acc;
  }, {});

  const activeUsersByRole = [
    'Student',
    'Educator',
    'Employer',
    'Admin',
  ]
    .map((role) => ({
      name: role,
      value: roleCounts[role] || 0,
      color: ROLE_COLORS[role] || '#D5D9E2',
    }))
    .filter((item) => item.value > 0);

  const totalActiveUsers = activeUsers.length;

  const pendingAssessmentReports = assessmentReports.filter(
    (report) => {
      const status = String(
        report?.status ?? ''
      ).toLowerCase();

      return [
        'pending',
        'open',
        'submitted',
        'reviewing',
        'under_review',
      ].includes(status);
    }
  );

  const pendingAssessmentCount =
    pendingAssessmentReports.length;

  const courseActive = Number(
    insights?.courses?.active || 0
  );

  const courseNew = Number(
    insights?.courses?.new_this_month ??
      insights?.courses?.newThisMonth ??
      0
  );

  const courseCompletion = clampPercent(
    insights?.courses?.completion_rate ??
      insights?.courses?.completionRate ??
      0
  );

  const enrollmentTotal = Number(
    insights?.enrollments?.total || 0
  );

  const enrollmentNew = Number(
    insights?.enrollments?.new_this_month ??
      insights?.enrollments?.newThisMonth ??
      0
  );

  const enrollmentRate = clampPercent(
    insights?.enrollments?.active_rate ??
      insights?.enrollments?.activeRate ??
      0
  );

  const openJobs = Number(
    insights?.jobs?.open || 0
  );

  const jobsNew = Number(
    insights?.jobs?.new_this_month ??
      insights?.jobs?.newThisMonth ??
      0
  );

  const applicationsReceived = Number(
    insights?.jobs?.applications ??
      insights?.jobs?.applications_received ??
      insights?.jobs?.applicationsReceived ??
      0
  );

  const assessmentsTaken = Number(
    insights?.assessments?.taken ??
      insights?.assessments?.total ??
      insights?.assessment?.taken ??
      0
  );

  const averageScore = Number(
    insights?.assessments?.average_score ??
      insights?.assessments?.averageScore ??
      insights?.assessment?.average_score ??
      0
  );

  const applications = Number(
    insights?.applications?.total ??
      insights?.applications ??
      insights?.jobs?.applications ??
      0
  );

  const topMissingSkills =
    insights?.skills?.missing ||
    insights?.skills?.top_missing ||
    insights?.top_missing_skills ||
    insights?.topMissingSkills ||
    [];

  const isLoading = !insights && !error;

  /* =========================================================
     LOADING STATE
     ========================================================= */

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#F7F4EE] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px] animate-pulse space-y-6">
          <div className="h-64 rounded-[32px] bg-white border border-[#E8E2D9]" />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="h-80 rounded-[28px] bg-white border border-[#E8E2D9] lg:col-span-7" />
            <div className="h-80 rounded-[28px] bg-white border border-[#E8E2D9] lg:col-span-5" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="h-44 rounded-[28px] bg-white border border-[#E8E2D9]" />
            <div className="h-44 rounded-[28px] bg-white border border-[#E8E2D9]" />
            <div className="h-44 rounded-[28px] bg-white border border-[#E8E2D9]" />
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
     ========================================================= */

  return (
    <div className="relative min-h-full overflow-hidden bg-[#F7F4EE] text-[#171A24]">
      {/* Decorative editorial shapes */}
      <div className="pointer-events-none absolute -right-32 top-32 h-72 w-72 rounded-full bg-[#3155F5]/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-[620px] h-72 w-72 rounded-full bg-[#F26B38]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[1050px] h-48 w-48 rounded-full bg-[#18A66A]/[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">

        {/* =====================================================
            TOP UTILITY BAR
            ===================================================== */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#DED9D0] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#171A24] text-white shadow-sm">
              <Icon
                name="dashboard"
                className="h-4.5 w-4.5"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#77736C]">
                Vayvora Administration
              </p>

              <div className="mt-0.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#18A66A]" />
                <span className="text-xs font-semibold text-[#53515B]">
                  Platform systems operational
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#DDD8CF] bg-white px-3 py-1.5 text-[11px] font-bold text-[#5E5A54] shadow-sm">
            <Icon
              name="clock"
              className="h-3.5 w-3.5"
            />
            Live administrative overview
          </div>
        </div>

        {/* =====================================================
            EDITORIAL HERO
            ===================================================== */}

        <section className="relative mb-7 overflow-hidden rounded-[32px] border border-[#D9D3C9] bg-white shadow-[0_18px_60px_rgba(31,35,48,0.08)]">
          <div className="grid min-h-[330px] lg:grid-cols-[1.4fr_0.6fr]">

            {/* Main title */}
            <div className="relative overflow-hidden px-6 py-9 sm:px-9 lg:px-12 lg:py-12">
              <div className="absolute right-0 top-0 h-full w-px bg-[#E7E2D9] lg:block" />

              {/* oversized decorative number */}
              <div className="pointer-events-none absolute -right-8 -top-20 select-none text-[210px] font-black leading-none tracking-[-0.08em] text-[#F4F1EA]">
                01
              </div>

              <div className="relative z-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D9D3C9] bg-[#FBF9F5] px-3 py-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3155F5] text-white">
                    <Icon
                      name="shield"
                      className="h-3 w-3"
                    />
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#57534E]">
                    Admin control center
                  </span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.045em] text-[#171A24] sm:text-5xl lg:text-7xl">
                  Everything
                  <br />
                  <span className="text-[#3155F5]">
                    under control.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-sm font-medium leading-6 text-[#6B6870] sm:text-base">
                  Manage users, monitor learning activity,
                  review assessments and understand the
                  platform from one administrative workspace.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/app/users">
                    <Button className="group !rounded-full !bg-[#171A24] !px-5 !py-2.5 !text-sm !font-bold !text-white transition-all duration-300 hover:!bg-[#3155F5] hover:shadow-[0_10px_25px_rgba(49,85,245,0.22)]">
                      <span className="mr-2">
                        <Icon
                          name="users"
                          className="h-4 w-4"
                        />
                      </span>
                      Manage Users
                      <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                        <Icon
                          name="arrow"
                          className="h-4 w-4"
                        />
                      </span>
                    </Button>
                  </Link>

                  <Link to="/app/reports">
                    <button className="group inline-flex items-center rounded-full border border-[#D8D3CA] bg-white px-5 py-2.5 text-sm font-bold text-[#292B35] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3155F5] hover:text-[#3155F5]">
                      <Icon
                        name="report"
                        className="mr-2 h-4 w-4"
                      />
                      View Reports
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Hero side statistics */}
            <div className="relative flex flex-col justify-between overflow-hidden bg-[#3155F5] p-7 text-white sm:p-9">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[30px] border-white/10" />
              <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full border-[18px] border-[#F26B38]/60" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
                    Current pulse
                  </span>

                  <Icon
                    name="activity"
                    className="h-5 w-5 text-white/80"
                  />
                </div>

                <div className="mt-12">
                  <p className="text-[76px] font-black leading-none tracking-[-0.07em]">
                    {formatNumber(totalActiveUsers)}
                  </p>

                  <p className="mt-2 text-sm font-bold text-white/75">
                    active platform users
                  </p>
                </div>
              </div>

              <div className="relative mt-10 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-black">
                    {formatNumber(courseActive)}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/65">
                    Courses
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-black">
                    {formatNumber(openJobs)}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/65">
                    Open jobs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-[22px] border border-[#F2B7A5] bg-[#FFF5F1] px-5 py-4 text-[#9D3E25]">
            <div className="mt-0.5">
              <Icon
                name="alert"
                className="h-5 w-5"
              />
            </div>

            <div>
              <p className="text-sm font-black">
                Dashboard data could not be loaded
              </p>

              <p className="mt-1 text-xs font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            KPI EDITORIAL GRID
            ===================================================== */}

        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#3155F5]">
                Platform numbers
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#171A24]">
                The numbers that matter
              </h2>
            </div>

            <div className="hidden items-center gap-2 text-xs font-bold text-[#77736C] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#18A66A]" />
              Updated from live platform data
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

            {/* Active Users — large editorial block */}
            <div className="group relative overflow-hidden rounded-[28px] border border-[#DCD7CE] bg-white p-6 shadow-[0_10px_40px_rgba(31,35,48,0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(31,35,48,0.10)] lg:col-span-7">
              <div className="absolute left-0 top-0 h-full w-1 bg-[#3155F5] transition-all duration-300 group-hover:w-2" />

              <div className="flex flex-col justify-between gap-8 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#3155F5]">
                      <Icon
                        name="users"
                        className="h-5 w-5"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#88837A]">
                        Active users
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-[#77736C]">
                        By platform role
                      </p>
                    </div>
                  </div>

                  <div className="mt-7">
                    <p className="text-6xl font-black tracking-[-0.065em] text-[#171A24]">
                      {formatNumber(totalActiveUsers)}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#18A66A]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EAFBF3]">
                        <Icon
                          name="arrowUp"
                          className="h-3 w-3"
                        />
                      </span>
                      Platform accounts currently active
                    </div>
                  </div>
                </div>

                <div className="relative h-[190px] w-full sm:w-[210px]">
                  {activeUsersByRole.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={activeUsersByRole}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={82}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {activeUsersByRole.map(
                            (entry) => (
                              <Cell
                                key={entry.name}
                                fill={entry.color}
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            borderRadius: 14,
                            border: '1px solid #E4E0D8',
                            boxShadow:
                              '0 10px 30px rgba(0,0,0,.08)',
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-full border-[18px] border-[#F0EDE7]">
                      <span className="text-xs font-bold text-[#99948A]">
                        No data
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[#ECE8E1] pt-5 sm:grid-cols-4">
                {[
                  'Student',
                  'Educator',
                  'Employer',
                  'Admin',
                ].map((role) => (
                  <div
                    key={role}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          ROLE_COLORS[role],
                      }}
                    />

                    <span className="text-[11px] font-bold text-[#66625B]">
                      {role}
                    </span>

                    <span className="ml-auto text-xs font-black text-[#171A24]">
                      {formatNumber(
                        roleCounts[role] || 0
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div className="group relative overflow-hidden rounded-[28px] border border-[#DCD7CE] bg-[#EAFBF3] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(24,166,106,0.12)] lg:col-span-5">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-[20px] border-white/60" />

              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4E7565]">
                    Active courses
                  </p>

                  <p className="mt-4 text-5xl font-black tracking-[-0.06em] text-[#123F2D]">
                    {formatNumber(courseActive)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#18A66A] shadow-sm">
                  <Icon
                    name="book"
                    className="h-5 w-5"
                  />
                </div>
              </div>

              <div className="relative mt-7">
                <div className="flex items-center justify-between text-xs font-bold text-[#467263]">
                  <span>Completion rate</span>
                  <span className="font-black">
                    {courseCompletion}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-[#18A66A] transition-all duration-700"
                    style={{
                      width: `${courseCompletion}%`,
                    }}
                  />
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#467263]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                    <Icon
                      name="arrowUp"
                      className="h-3 w-3 text-[#18A66A]"
                    />
                  </span>
                  {formatNumber(courseNew)} new this month
                </div>
              </div>
            </div>

            {/* Enrollments */}
            <div className="group relative overflow-hidden rounded-[28px] border border-[#DCD7CE] bg-white p-6 shadow-[0_10px_35px_rgba(31,35,48,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#F0C7B6] hover:shadow-[0_18px_45px_rgba(242,107,56,0.10)] lg:col-span-4">
              <div className="absolute right-0 top-0 h-1 w-24 bg-[#F26B38] transition-all duration-300 group-hover:w-full" />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#88837A]">
                    Enrollments
                  </p>

                  <p className="mt-3 text-4xl font-black tracking-[-0.055em]">
                    {formatNumber(enrollmentTotal)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1EA] text-[#F26B38]">
                  <Icon
                    name="enrollment"
                    className="h-5 w-5"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#77736C]">
                  <span>Active enrollment rate</span>
                  <span className="text-[#F26B38]">
                    {enrollmentRate}%
                  </span>
                </div>

                <div className="mt-2 h-1.5 rounded-full bg-[#F0ECE5]">
                  <div
                    className="h-full rounded-full bg-[#F26B38]"
                    style={{
                      width: `${enrollmentRate}%`,
                    }}
                  />
                </div>

                <p className="mt-4 text-xs font-bold text-[#77736C]">
                  <span className="text-[#F26B38]">
                    +{formatNumber(enrollmentNew)}
                  </span>{' '}
                  added this month
                </p>
              </div>
            </div>

            {/* Jobs */}
            <div className="group relative overflow-hidden rounded-[28px] border border-[#DCD7CE] bg-[#FFF1EA] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(242,107,56,0.13)] lg:col-span-4">
              <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-[#F26B38]/10" />

              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94624F]">
                    Open jobs
                  </p>

                  <p className="mt-3 text-4xl font-black tracking-[-0.055em] text-[#542618]">
                    {formatNumber(openJobs)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#F26B38] shadow-sm">
                  <Icon
                    name="briefcase"
                    className="h-5 w-5"
                  />
                </div>
              </div>

              <div className="relative mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/70 p-3">
                  <p className="text-lg font-black text-[#542618]">
                    +{formatNumber(jobsNew)}
                  </p>

                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-[#9A705E]">
                    New this month
                  </p>
                </div>

                <div className="rounded-xl bg-white/70 p-3">
                  <p className="text-lg font-black text-[#542618]">
                    {formatNumber(
                      applicationsReceived
                    )}
                  </p>

                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-[#9A705E]">
                    Applications
                  </p>
                </div>
              </div>
            </div>

            {/* Small system card */}
            <div className="group relative overflow-hidden rounded-[28px] border border-[#DCD7CE] bg-[#171A24] p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,26,36,0.18)] lg:col-span-4">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[14px] border-[#3155F5]/40" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Icon
                      name="lightning"
                      className="h-5 w-5 text-[#D8E0FF]"
                    />
                  </div>

                  <span className="rounded-full bg-[#18A66A]/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#7BE5B1]">
                    Live
                  </span>
                </div>

                <p className="mt-8 text-xl font-black tracking-[-0.025em]">
                  Platform pulse
                </p>

                <p className="mt-2 text-xs font-medium leading-5 text-white/55">
                  Administrative activity is being
                  monitored across the platform.
                </p>

                <div className="mt-6 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#18A66A]" />
                  <span className="text-xs font-bold text-white/75">
                    Systems responding normally
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ATTENTION + ASSESSMENT
            ===================================================== */}

        <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-12">

          {/* Needs attention */}
          <div className="relative overflow-hidden rounded-[30px] border border-[#DCD7CE] bg-[#FFF7D9] p-6 sm:p-7 lg:col-span-7">
            <div className="absolute right-0 top-0 h-full w-1.5 bg-[#F1B91E]" />

            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFEBA8] text-[#9B7300]">
                    <Icon
                      name="alert"
                      className="h-5 w-5"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A711F]">
                      Needs attention
                    </p>

                    <h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#332A0C]">
                      Assessment reviews
                    </h2>
                  </div>
                </div>

                <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-[#746126]">
                  Student termination reports currently
                  awaiting administrative review.
                </p>
              </div>

              <div className="text-right">
                <p className="text-6xl font-black leading-none tracking-[-0.07em] text-[#332A0C]">
                  {formatNumber(
                    pendingAssessmentCount
                  )}
                </p>

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#8A711F]">
                  Pending
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8DCA9] pt-5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#746126]">
                <Icon
                  name="clock"
                  className="h-4 w-4"
                />
                Administrative action required
              </div>

              <Link to="/app/assessment-reviews">
                <button className="group inline-flex items-center rounded-full bg-[#332A0C] px-4 py-2.5 text-xs font-black text-white transition-all duration-300 hover:bg-[#F1B91E] hover:text-[#332A0C]">
                  Review reports
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    <Icon
                      name="arrow"
                      className="h-4 w-4"
                    />
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Assessment activity */}
          <div className="relative overflow-hidden rounded-[30px] border border-[#DCD7CE] bg-white p-6 shadow-[0_10px_40px_rgba(31,35,48,0.05)] sm:p-7 lg:col-span-5">
            <div className="absolute left-0 top-0 h-1 w-full bg-[#E4477A]" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A737D]">
                  Assessment activity
                </p>

                <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">
                  Review queue
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0F5] text-[#E4477A]">
                <Icon
                  name="clipboard"
                  className="h-5 w-5"
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 divide-x divide-[#ECE8E1]">
              <div className="pr-5">
                <p className="text-3xl font-black tracking-[-0.05em]">
                  {formatNumber(
                    assessmentReports.length
                  )}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-[#88837A]">
                  Total reports
                </p>
              </div>

              <div className="pl-5">
                <p className="text-3xl font-black tracking-[-0.05em] text-[#E4477A]">
                  {formatNumber(
                    pendingAssessmentCount
                  )}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-[#88837A]">
                  Awaiting review
                </p>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-2 rounded-xl bg-[#F8F6F1] px-3 py-2.5 text-xs font-bold text-[#69655E]">
              <Icon
                name="shield"
                className="h-4 w-4 text-[#E4477A]"
              />
              Review status is calculated from live reports.
            </div>
          </div>
        </section>

        {/* =====================================================
            AI INSIGHTS — LARGE EDITORIAL PANEL
            ===================================================== */}

        <section className="relative mb-8 overflow-hidden rounded-[32px] bg-[#3155F5] p-6 text-white shadow-[0_18px_55px_rgba(49,85,245,0.16)] sm:p-8 lg:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[45px] border-white/10" />
          <div className="absolute -bottom-32 left-[35%] h-72 w-72 rounded-full border-[24px] border-[#F26B38]/30" />
          <div className="absolute right-[30%] top-12 h-5 w-5 rounded-full bg-[#C9FF3D]" />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Icon
                    name="sparkles"
                    className="h-6 w-6"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
                    Intelligence layer
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-[-0.035em]">
                    AI Insights Hub
                  </h2>
                </div>
              </div>

              <p className="mt-7 max-w-md text-sm font-medium leading-6 text-white/65">
                A compact view of learning performance,
                assessment outcomes and career activity
                across the platform.
              </p>

              <div className="mt-8 flex items-center gap-2 text-xs font-bold text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#C9FF3D]" />
                Insights connected to platform analytics
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-[22px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <Icon
                  name="clipboard"
                  className="h-5 w-5 text-white/65"
                />

                <p className="mt-7 text-3xl font-black">
                  {formatNumber(assessmentsTaken)}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-white/50">
                  Assessments
                </p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <Icon
                  name="target"
                  className="h-5 w-5 text-white/65"
                />

                <p className="mt-7 text-3xl font-black">
                  {Number.isFinite(averageScore)
                    ? `${Math.round(averageScore)}%`
                    : '0%'}
                </p>

                <div className="mt-2 h-1.5 rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#C9FF3D]"
                    style={{
                      width: `${clampPercent(
                        averageScore
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-white/50">
                  Average score
                </p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <Icon
                  name="briefcase"
                  className="h-5 w-5 text-white/65"
                />

                <p className="mt-7 text-3xl font-black">
                  {formatNumber(applications)}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-white/50">
                  Applications
                </p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <Icon
                  name="chart"
                  className="h-5 w-5 text-white/65"
                />

                <p className="mt-7 text-3xl font-black">
                  {Array.isArray(topMissingSkills)
                    ? topMissingSkills.length
                    : 0}
                </p>

                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-white/50">
                  Skill signals
                </p>
              </div>
            </div>
          </div>

          {Array.isArray(topMissingSkills) &&
            topMissingSkills.length > 0 && (
              <div className="relative mt-8 border-t border-white/10 pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                    Top missing skills
                  </span>

                  {topMissingSkills
                    .slice(0, 8)
                    .map((skill, index) => {
                      const label =
                        typeof skill === 'string'
                          ? skill
                          : skill?.name ||
                            skill?.skill ||
                            'Skill';

                      return (
                        <span
                          key={`${label}-${index}`}
                          className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/80"
                        >
                          {label}
                        </span>
                      );
                    })}
                </div>
              </div>
            )}
        </section>

        {/* =====================================================
            USERS + LIVE ACTIVITY
            ===================================================== */}

        <section className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-12">

          {/* Recent users */}
          <div className="overflow-hidden rounded-[30px] border border-[#DCD7CE] bg-white shadow-[0_10px_40px_rgba(31,35,48,0.045)] xl:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ECE8E1] px-6 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3155F5]">
                  People
                </p>

                <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">
                  Recent users
                </h2>
              </div>

              <Link
                to="/app/users"
                className="group inline-flex items-center rounded-full border border-[#DDD8CF] px-3.5 py-2 text-xs font-black text-[#53515B] transition-all hover:border-[#3155F5] hover:text-[#3155F5]"
              >
                Manage all
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  <Icon
                    name="arrow"
                    className="h-3.5 w-3.5"
                  />
                </span>
              </Link>
            </div>

            <div className="divide-y divide-[#F0ECE5]">
              {(users || [])
                .slice(0, 6)
                .map((user, index) => {
                  const role = String(
                    user?.role || 'Unknown'
                  );

                  const normalizedRole =
                    role.charAt(0).toUpperCase() +
                    role.slice(1).toLowerCase();

                  const badgeClass =
                    ROLE_BADGES[normalizedRole] ||
                    'bg-[#F3F2EE] text-[#66625B]';

                  const avatarColors = [
                    '#3155F5',
                    '#18A66A',
                    '#F26B38',
                    '#E4477A',
                  ];

                  return (
                    <div
                      key={
                        user?.id ||
                        user?.email ||
                        index
                      }
                      className="group flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-[#FAF8F4] sm:px-7"
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] text-sm font-black text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor:
                            avatarColors[
                              index %
                                avatarColors.length
                            ],
                        }}
                      >
                        {initialsOf(
                          user?.name ||
                            user?.email
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-[#22242D]">
                          {user?.name ||
                            'Unnamed user'}
                        </p>

                        <p className="mt-0.5 truncate text-xs font-medium text-[#88837A]">
                          {user?.email ||
                            'No email available'}
                        </p>
                      </div>

                      <span
                        className={`hidden rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider sm:inline-flex ${badgeClass}`}
                      >
                        {normalizedRole}
                      </span>

                      <Icon
                        name="chevron"
                        className="h-4 w-4 text-[#C5C0B7] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#3155F5]"
                      />
                    </div>
                  );
                })}

              {(!users || users.length === 0) && (
                <div className="px-7 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F1EB] text-[#88837A]">
                    <Icon
                      name="users"
                      className="h-5 w-5"
                    />
                  </div>

                  <p className="mt-4 text-sm font-black">
                    No users available
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#88837A]">
                    User records will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Live activity */}
          <div className="overflow-hidden rounded-[30px] border border-[#DCD7CE] bg-[#F1F3FF] xl:col-span-5">
            <div className="border-b border-[#D9DDEF] px-6 py-5 sm:px-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3155F5]">
                    Live stream
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">
                    Recent activity
                  </h2>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#3155F5] shadow-sm">
                  <Icon
                    name="activity"
                    className="h-4.5 w-4.5"
                  />
                </div>
              </div>
            </div>

            <div className="max-h-[460px] overflow-y-auto px-6 py-6 sm:px-7">
              {recentActivity.length > 0 ? (
                <div className="relative">
                  <div className="absolute bottom-4 left-[15px] top-4 w-px bg-[#D5D9EC]" />

                  <div className="space-y-6">
                    {recentActivity.map(
                      (activity, index) => {
                        const iconName =
                          getActivityIcon(
                            activity?.type
                          );

                        return (
                          <div
                            key={
                              activity?.id ||
                              `${activity?.when}-${index}`
                            }
                            className="group relative flex gap-4"
                          >
                            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#D5D9EC] bg-white text-[#3155F5] shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:bg-[#3155F5] group-hover:text-white">
                              <Icon
                                name={iconName}
                                className="h-3.5 w-3.5"
                              />
                            </div>

                            <div className="min-w-0 flex-1 pt-0.5">
                              <p className="text-xs font-black leading-5 text-[#252936]">
                                {activity?.title ||
                                  'Platform activity'}
                              </p>

                              <p className="mt-1 text-[11px] font-medium leading-5 text-[#73778A]">
                                {activity?.user
                                  ?.name ||
                                  activity?.user
                                    ?.email ||
                                  'Platform user'}

                                {activity?.course &&
                                  ` · ${
                                    activity.course
                                      ?.title ||
                                    activity.course
                                      ?.name ||
                                    ''
                                  }`}
                              </p>

                              {activity?.when && (
                                <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#9A9EB0]">
                                  <Icon
                                    name="clock"
                                    className="h-3 w-3"
                                  />

                                  {new Date(
                                    activity.when
                                  ).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#3155F5] shadow-sm">
                    <Icon
                      name="activity"
                      className="h-6 w-6"
                    />
                  </div>

                  <p className="mt-4 text-sm font-black text-[#292C39]">
                    No recent activity
                  </p>

                  <p className="mt-1 max-w-xs text-xs font-medium leading-5 text-[#7D8193]">
                    New platform events will appear
                    here as they happen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK ACCESS — EDITORIAL ROW
            ===================================================== */}

        <section className="mb-5">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F26B38]">
              Quick access
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-[-0.035em]">
              Administration shortcuts
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_LINKS.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className="group relative overflow-hidden rounded-[24px] border border-[#DCD7CE] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(31,35,48,0.08)]"
              >
                <div
                  className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full"
                  style={{
                    backgroundColor: item.accent,
                  }}
                />

                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: `${item.accent}12`,
                      color: item.accent,
                    }}
                  >
                    <Icon
                      name={item.icon}
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-[#252731]">
                      {item.label}
                    </p>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#969188]">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E7E2D9] text-[#8C877F] transition-all duration-300 group-hover:border-transparent group-hover:bg-[#171A24] group-hover:text-white">
                    <Icon
                      name="arrow"
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =====================================================
            FOOTER STATUS
            ===================================================== */}

        <div className="flex flex-col gap-3 border-t border-[#DDD8CF] pt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#99948A] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#18A66A]" />
            Vayvora Admin Console
          </div>

          <div className="flex items-center gap-4">
            <span>
              {formatNumber(activeUsers.length)} active
              users
            </span>

            <span className="hidden h-3 w-px bg-[#D4CFC6] sm:block" />

            <span>
              {formatNumber(recentActivity.length)} recent
              events
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
