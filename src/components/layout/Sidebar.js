
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  ListChecks,
  Sparkles,
  MessageCircle,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  TrendingUp,
  BriefcaseBusiness,
  UserRound,
  Settings,
  Users,
  FileText,
  Megaphone,
  GraduationCap,
  UserRoundCheck,
  CreditCard,
  X,
  ChevronRight,
  ShieldCheck,
  CircleDot,
} from 'lucide-react';

/* ================================================================
   NAVIGATION
================================================================ */

const navByRole = {
  student: [
    { to: '/app/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { to: '/app/courses', labelKey: 'courses', icon: BookOpen },
    { to: '/app/achievements', labelKey: 'achievements', icon: Trophy },
    { to: '/app/tasks', labelKey: 'tasks_deadlines', icon: ListChecks },
    { to: '/app/recommendations', labelKey: 'recommendations', icon: Sparkles },
    {
      to: '/app/student-community',
      labelKey: 'community',
      icon: MessageCircle,
    },
    {
      to: '/app/my-insights',
      labelKey: 'insights',
      icon: BarChart3,
    },
    {
      to: '/app/engagement-trends',
      labelKey: 'engagement_trends',
      icon: CalendarDays,
    },
    {
      to: '/app/assessments',
      labelKey: 'assessments',
      icon: ClipboardCheck,
    },
    {
      to: '/app/gap-report',
      labelKey: 'gap_report',
      icon: TrendingUp,
    },
    {
      to: '/app/job-applications',
      labelKey: 'job_applications',
      icon: BriefcaseBusiness,
    },
    {
      to: '/app/profile',
      labelKey: 'my_profile',
      icon: UserRound,
    },
    {
      to: '/app/my-subscription',
      labelKey: 'My Subscriptions',
      icon: CreditCard,
    },
    {
      to: '/app/help-support',
      labelKey: 'Help & Support',
      icon: MessageCircle,
    },
    {
      to: '/app/settings',
      labelKey: 'settings',
      icon: Settings,
    },
  ],

  educator: [
    { to: '/app/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { to: '/app/manage-courses', labelKey: 'courses', icon: BookOpen },
    {
      to: '/app/educator-community',
      labelKey: 'community',
      icon: MessageCircle,
    },
    {
      to: '/app/learners',
      labelKey: 'learners',
      icon: Users,
    },
    {
      to: '/app/insights',
      labelKey: 'insights',
      icon: BarChart3,
    },
    {
      to: '/app/announcements',
      labelKey: 'announcements',
      icon: Megaphone,
    },
    {
      to: '/app/profile',
      labelKey: 'my_profile',
      icon: UserRound,
    },
    {
      to: '/app/educator-assessments',
      labelKey: 'assessments',
      icon: ClipboardCheck,
    },
    {
      to: '/app/settings',
      labelKey: 'settings',
      icon: Settings,
    },
  ],

  employer: [
    { to: '/app/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    {
      to: '/app/job-listings',
      labelKey: 'job_listings',
      icon: FileText,
    },
    {
      to: '/app/certificate-validation',
      labelKey: 'certificate_validation',
      icon: GraduationCap,
    },
    {
      to: '/app/employer-community',
      labelKey: 'community',
      icon: MessageCircle,
    },
    {
      to: '/app/candidates',
      labelKey: 'candidates',
      icon: UserRoundCheck,
    },
    {
      to: '/app/analytics',
      labelKey: 'analytics',
      icon: BarChart3,
    },
    {
      to: '/app/profile',
      labelKey: 'profile',
      icon: UserRound,
    },
    {
      to: '/app/settings',
      labelKey: 'settings',
      icon: Settings,
    },
  ],

  admin: [
    { to: '/app/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    {
      to: '/app/users',
      labelKey: 'user_management',
      icon: Users,
    },
    {
      to: '/app/user-details',
      labelKey: 'user_details',
      icon: FileText,
    },
    {
      to: '/app/admin-community',
      labelKey: 'community',
      icon: MessageCircle,
    },
    {
      to: '/app/reports',
      labelKey: 'reports',
      icon: FileText,
    },
    {
      to: '/app/settings',
      labelKey: 'settings',
      icon: Settings,
    },
    {
      to: '/app/subscriptions',
      labelKey: 'subscriptions',
      icon: CreditCard,
    },
    {
      to: '/app/profile',
      labelKey: 'profile',
      icon: UserRound,
    },
  ],
};

/* ================================================================
   ROLE COLOR SYSTEM
================================================================ */

const roleAccent = {
  student: {
    main: 'from-blue-600 via-indigo-500 to-cyan-500',
    soft: 'from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-cyan-950/30',
    softBg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    strongText: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800/70',
    iconIdle:
      'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
    orbOne: 'bg-blue-300/25 dark:bg-blue-500/15',
    orbTwo: 'bg-cyan-300/20 dark:bg-cyan-500/10',
    shadow: 'shadow-blue-500/25',
  },

  educator: {
    main: 'from-amber-500 via-orange-500 to-rose-500',
    soft: 'from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/45 dark:via-orange-950/40 dark:to-rose-950/30',
    softBg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    strongText: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-800/70',
    iconIdle:
      'bg-amber-50 text-orange-700 border-amber-100 dark:bg-amber-950/50 dark:text-orange-300 dark:border-orange-800/60',
    orbOne: 'bg-amber-300/25 dark:bg-amber-500/15',
    orbTwo: 'bg-rose-300/20 dark:bg-rose-500/10',
    shadow: 'shadow-orange-500/25',
  },

  employer: {
    main: 'from-emerald-500 via-teal-500 to-sky-500',
    soft: 'from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/45 dark:via-teal-950/40 dark:to-sky-950/30',
    softBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    strongText: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-800/70',
    iconIdle:
      'bg-emerald-50 text-teal-700 border-emerald-100 dark:bg-emerald-950/50 dark:text-teal-300 dark:border-emerald-800/60',
    orbOne: 'bg-emerald-300/25 dark:bg-emerald-500/15',
    orbTwo: 'bg-sky-300/20 dark:bg-sky-500/10',
    shadow: 'shadow-teal-500/25',
  },

  admin: {
    main: 'from-violet-600 via-indigo-500 to-fuchsia-500',
    soft: 'from-violet-50 via-indigo-50 to-fuchsia-50 dark:from-violet-950/45 dark:via-indigo-950/40 dark:to-fuchsia-950/30',
    softBg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-300',
    strongText: 'text-violet-800 dark:text-violet-200',
    border: 'border-violet-200 dark:border-violet-800/70',
    iconIdle:
      'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60',
    orbOne: 'bg-violet-300/25 dark:bg-violet-500/15',
    orbTwo: 'bg-fuchsia-300/20 dark:bg-fuchsia-500/10',
    shadow: 'shadow-violet-500/25',
  },
};

/* ================================================================
   SIDEBAR
================================================================ */

export function Sidebar({
  mobileOpen = false,
  onClose = () => {},
}) {
  const { role } = useAuth();
  const { t } = useTranslation();

  const normalizedRole = role?.toLowerCase();

  const items =
    navByRole[normalizedRole] || navByRole.student;

  const accent =
    roleAccent[normalizedRole] || roleAccent.student;

  return (
    <>
      <style>
        {`
          .edusaas-sidebar-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .edusaas-sidebar-scroll::-webkit-scrollbar {
            width: 0;
            height: 0;
            display: none;
          }

          .edusaas-sidebar-scroll::-webkit-scrollbar-thumb {
            background: transparent;
          }

          .edusaas-sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
      </style>

      {/* MOBILE BACKDROP */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-30
            md:hidden

            bg-slate-950/30
            dark:bg-black/60

            backdrop-blur-[4px]

            transition-opacity
            duration-300

            animate-fade-in
          "
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          md:sticky

          top-0
          left-0

          z-40
          md:z-auto

          h-screen

          w-[19rem]
          max-w-[88vw]

          overflow-hidden

          flex
          flex-col

          bg-[#f5f7fb]
          dark:bg-[#080d18]

          border-r
          border-slate-200/90
          dark:border-slate-800/80

          shadow-[20px_0_60px_rgba(15,23,42,0.14),10px_0_30px_rgba(99,102,241,0.07)]
          dark:shadow-[20px_0_60px_rgba(0,0,0,0.45),10px_0_30px_rgba(30,41,59,0.25)]

          transition-all
          duration-300
          ease-out

          md:transform-none

          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }
        `}
      >
        {/* BACKGROUND AURORA */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="
              absolute
              inset-0

              bg-gradient-to-br
              from-white
              via-[#f6f8ff]
              to-[#eef7ff]

              dark:from-[#080d18]
              dark:via-[#0b1220]
              dark:to-[#0a1724]
            "
          />

          <div
            className={`
              absolute
              -left-32
              -top-28

              h-[380px]
              w-[380px]

              rounded-full

              ${accent.orbOne}

              blur-[100px]
            `}
          />

          <div
            className={`
              absolute
              -right-32
              top-[30%]

              h-[330px]
              w-[330px]

              rounded-full

              ${accent.orbTwo}

              blur-[100px]
            `}
          />

          <div
            className="
              absolute
              -bottom-40
              left-[15%]

              h-[350px]
              w-[350px]

              rounded-full

              bg-indigo-200/10
              dark:bg-indigo-500/5

              blur-[110px]
            "
          />

          <div
            className="
              absolute
              inset-0

              opacity-[0.10]
              dark:opacity-[0.08]
            "
            style={{
              backgroundImage:
                'radial-gradient(rgba(71,85,105,0.22) 0.7px, transparent 0.7px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div
            className={`
              absolute
              right-0
              top-0
              bottom-0

              w-[2px]

              bg-gradient-to-b
              from-transparent
              via-current
              to-transparent

              ${accent.text}

              opacity-[0.16]
            `}
          />
        </div>

        {/* BRAND */}

        <div
          className="
            relative
            z-10
            shrink-0
            px-4
            pt-4
            pb-2.5
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[20px]

              border
              border-slate-200/90
              dark:border-slate-700/80

              bg-white/95
              dark:bg-slate-900/85

              shadow-[0_14px_34px_rgba(15,23,42,0.10)]
              dark:shadow-[0_14px_34px_rgba(0,0,0,0.30)]

              backdrop-blur-xl

              transition-all
              duration-300

              hover:-translate-y-0.5

              hover:shadow-[0_18px_42px_rgba(15,23,42,0.14)]
              dark:hover:shadow-[0_18px_42px_rgba(0,0,0,0.42)]
            "
          >
            <div
              className={`
                absolute
                left-0
                right-0
                top-0
                h-[3px]
                bg-gradient-to-r
                ${accent.main}
              `}
            />

            <div
              className="
                flex
                items-center
                justify-between
                px-4
                py-3.5
              "
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`
                      absolute
                      -inset-2
                      rounded-2xl
                      bg-gradient-to-br
                      ${accent.main}
                      opacity-20
                      blur-xl
                    `}
                  />

                  <div
                    className={`
                      group
                      relative
                      grid
                      h-11
                      w-11
                      place-items-center
                      overflow-hidden
                      rounded-[14px]

                      bg-gradient-to-br
                      ${accent.main}

                      text-white

                      shadow-lg
                      ${accent.shadow}

                      transition-all
                      duration-300

                      hover:scale-105
                      hover:-rotate-2
                    `}
                  >
                    <span
                      className="
                        absolute
                        -left-10
                        top-0
                        h-full
                        w-7
                        rotate-[25deg]
                        bg-white/35
                        blur-sm
                        transition-all
                        duration-700
                        group-hover:left-[120%]
                      "
                    />

                    <span
                      className="
                        absolute
                        inset-[1px]
                        rounded-[13px]
                        border
                        border-white/25
                      "
                    />

                    <span
                      className="
                        relative
                        z-10
                        text-[20px]
                        font-black
                      "
                    >
                      E
                    </span>

                    <span
                      className="
                        absolute
                        bottom-[3px]
                        right-[3px]
                        h-2.5
                        w-2.5
                        rounded-full
                        border-2
                        border-white
                        bg-emerald-400
                        shadow-[0_0_10px_rgba(16,185,129,0.7)]
                      "
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <div
                    className="
                      text-[19px]
                      font-black
                      tracking-[-0.045em]

                      text-slate-950
                      dark:text-white
                    "
                  >
                    EduSaaS
                  </div>

                  <div
                    className="
                      mt-0.5
                      text-[9px]
                      font-extrabold
                      uppercase
                      tracking-[0.16em]

                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {t('skill_platform')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="
                  md:hidden

                  grid
                  h-9
                  w-9
                  place-items-center

                  rounded-xl

                  border
                  border-slate-200
                  dark:border-slate-700

                  bg-slate-50
                  dark:bg-slate-800/80

                  text-slate-600
                  dark:text-slate-300

                  shadow-sm

                  transition-all
                  duration-300

                  hover:border-red-200
                  hover:bg-red-50
                  hover:text-red-600

                  dark:hover:border-red-800
                  dark:hover:bg-red-950/40
                  dark:hover:text-red-400

                  hover:rotate-90
                "
                aria-label={t('close_menu')}
                title={t('close_menu')}
              >
                <X size={17} strokeWidth={2.3} />
              </button>
            </div>
          </div>
        </div>

        {/* ACCOUNT */}

        <div
          className="
            relative
            z-10
            shrink-0
            px-4
            pt-1
            pb-2.5
          "
        >
          <div
            className="
              group
              relative
              overflow-hidden
              rounded-[18px]

              border
              border-slate-200/90
              dark:border-slate-700/80

              bg-white/95
              dark:bg-slate-900/85

              shadow-[0_10px_30px_rgba(15,23,42,0.08)]
              dark:shadow-[0_10px_30px_rgba(0,0,0,0.30)]

              backdrop-blur-xl

              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)]
              dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.40)]
            "
          >
            <div
              className={`
                absolute
                left-0
                right-0
                top-0
                h-[3px]
                bg-gradient-to-r
                ${accent.main}
              `}
            />

            <div
              className={`
                absolute
                -right-10
                -top-10
                h-24
                w-24
                rounded-full
                ${accent.orbOne}
                blur-2xl
              `}
            />

            <div className="relative p-3.5">
              <div className="flex items-center justify-between">
                <div
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.14em]

                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {t('signed_in_as')}
                </div>

                <ShieldCheck
                  size={16}
                  className={`${accent.text} opacity-90`}
                />
              </div>

              <div className="mt-2.5 flex items-center gap-3">
                <div
                  className={`
                    relative
                    grid
                    h-10
                    w-10
                    shrink-0
                    place-items-center
                    rounded-xl

                    bg-gradient-to-br
                    ${accent.main}

                    text-white
                    shadow-lg
                    ${accent.shadow}
                  `}
                >
                  <UserRound size={18} strokeWidth={2} />

                  <span
                    className="
                      absolute
                      bottom-[-2px]
                      right-[-2px]
                      h-3
                      w-3
                      rounded-full
                      border-2
                      border-white
                      bg-emerald-400
                    "
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="
                      truncate
                      text-[14px]
                      font-extrabold
                      capitalize

                      text-slate-900
                      dark:text-white
                    "
                  >
                    {role || t('guest')}
                  </div>

                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      gap-1.5
                      text-[10px]
                      font-bold

                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    <CircleDot
                      size={10}
                      className="text-emerald-500"
                    />

                    Account active
                  </div>
                </div>

                <div
                  className={`
                    hidden
                    sm:block
                    shrink-0
                    rounded-lg
                    border

                    ${accent.border}
                    ${accent.softBg}

                    px-2
                    py-1.5

                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.10em]

                    ${accent.text}
                  `}
                >
                  {normalizedRole || 'user'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE HEADER */}

        <div
          className="
            relative
            z-10
            flex
            items-center
            justify-between
            px-5
            pb-2
            pt-1
          "
        >
          <div className="flex items-center gap-2">
            <span
              className={`
                h-2
                w-2
                rounded-full
                bg-gradient-to-r
                ${accent.main}
                shadow-sm
              `}
            />

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]

                text-slate-500
                dark:text-slate-400
              "
            >
              Workspace
            </span>
          </div>

          <span
            className="
              rounded-lg

              border
              border-slate-200
              dark:border-slate-700

              bg-white
              dark:bg-slate-800/80

              px-2
              py-1

              text-[9px]
              font-extrabold

              text-slate-500
              dark:text-slate-300

              shadow-sm
            "
          >
            {String(items.length).padStart(2, '0')} modules
          </span>
        </div>

        {/* NAVIGATION */}

        <nav
          className="
            edusaas-sidebar-scroll
            relative
            z-10
            min-h-0
            flex-1
            overflow-y-auto
            px-3
            pb-4
          "
        >
          <div className="space-y-2">
            {items.map((item, index) => {
              const ItemIcon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/app/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                      group
                      relative
                      flex
                      min-h-[52px]
                      items-center
                      gap-3
                      overflow-hidden
                      rounded-[16px]
                      border
                      px-3
                      py-2.5

                      transition-all
                      duration-300
                      ease-out

                      ${
                        isActive
                          ? `
                            border-slate-200
                            dark:border-slate-700/80

                            bg-gradient-to-r
                            ${accent.soft}

                            text-slate-950
                            dark:text-white

                            shadow-[0_10px_28px_rgba(15,23,42,0.11)]
                            dark:shadow-[0_10px_28px_rgba(0,0,0,0.30)]

                            translate-x-0.5
                          `
                          : `
                            border-transparent

                            bg-white/35
                            dark:bg-slate-900/25

                            text-slate-600
                            dark:text-slate-400

                            hover:border-slate-200/90
                            dark:hover:border-slate-700

                            hover:bg-white
                            dark:hover:bg-slate-800/80

                            hover:text-slate-950
                            dark:hover:text-white

                            hover:shadow-[0_7px_22px_rgba(15,23,42,0.08)]
                            dark:hover:shadow-[0_7px_22px_rgba(0,0,0,0.25)]

                            hover:translate-x-0.5
                          `
                      }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* ACTIVE RAIL */}

                      <span
                        className={`
                          absolute
                          left-0
                          top-1/2
                          -translate-y-1/2
                          w-[3px]
                          rounded-r-full

                          bg-gradient-to-b
                          ${accent.main}

                          transition-all
                          duration-300

                          ${
                            isActive
                              ? 'h-8 opacity-100'
                              : 'h-0 opacity-0 group-hover:h-6 group-hover:opacity-70'
                          }
                        `}
                      />

                      {/* ACTIVE LIGHT */}

                      {isActive && (
                        <span
                          className="
                            pointer-events-none
                            absolute
                            inset-0

                            bg-gradient-to-r
                            from-white/75
                            via-white/30
                            to-transparent

                            dark:from-white/10
                            dark:via-white/5
                            dark:to-transparent

                            opacity-80
                          "
                        />
                      )}

                      {/* INDEX */}

                      <span
                        className={`
                          relative
                          z-10
                          hidden
                          sm:block
                          w-5
                          shrink-0
                          text-center
                          text-[9px]
                          font-black

                          ${
                            isActive
                              ? accent.text
                              : 'text-slate-400 dark:text-slate-600'
                          }
                        `}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {/* ICON */}

                      <span
                        className={`
                          relative
                          z-10
                          grid
                          h-10
                          w-10
                          shrink-0
                          place-items-center
                          rounded-[12px]
                          border

                          transition-all
                          duration-300

                          ${
                            isActive
                              ? `
                                border-white/60
                                dark:border-white/20

                                bg-gradient-to-br
                                ${accent.main}

                                text-white

                                shadow-lg
                                ${accent.shadow}

                                scale-105
                              `
                              : `
                                ${accent.iconIdle}

                                group-hover:border-slate-200
                                dark:group-hover:border-slate-600

                                group-hover:bg-white
                                dark:group-hover:bg-slate-800

                                group-hover:shadow-md
                                group-hover:scale-105
                              `
                          }
                        `}
                      >
                        <ItemIcon
                          size={18}
                          strokeWidth={isActive ? 2.4 : 2}
                          className="
                            transition-transform
                            duration-300
                            group-hover:scale-110
                          "
                        />
                      </span>

                      {/* LABEL */}

                      <span
                        className={`
                          relative
                          z-10
                          min-w-0
                          flex-1
                          truncate
                          text-[14px]
                          leading-5

                          ${
                            isActive
                              ? 'font-extrabold text-slate-950 dark:text-white'
                              : 'font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white'
                          }
                        `}
                      >
                        {t(item.labelKey)}
                      </span>

                      {/* ACTIVE DOT */}

                      {isActive && (
                        <span
                          className="
                            relative
                            z-10
                            hidden
                            sm:block
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                            bg-emerald-500
                            shadow-[0_0_10px_rgba(16,185,129,0.75)]
                          "
                        />
                      )}

                      {/* ARROW */}

                      <ChevronRight
                        size={15}
                        strokeWidth={2.4}
                        className={`
                          relative
                          z-10
                          shrink-0
                          transition-all
                          duration-300

                          ${
                            isActive
                              ? `
                                ${accent.text}
                                opacity-100
                                translate-x-0
                              `
                              : `
                                text-slate-300
                                dark:text-slate-600

                                opacity-0
                                -translate-x-2

                                group-hover:translate-x-0
                                group-hover:opacity-100
                              `
                          }
                        `}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* SYSTEM STATUS FOOTER */}

        <div
          className="
            relative
            z-10
            shrink-0

            border-t
            border-slate-200/80
            dark:border-slate-800/80

            px-4
            py-3
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[15px]

              border
              border-slate-200/90
              dark:border-slate-700/80

              bg-white/95
              dark:bg-slate-900/85

              px-3.5
              py-3

              shadow-[0_10px_28px_rgba(15,23,42,0.08)]
              dark:shadow-[0_10px_28px_rgba(0,0,0,0.30)]

              backdrop-blur-xl
            "
          >
            <div
              className={`
                absolute
                left-3
                right-3
                top-0
                h-[2px]
                rounded-full
                bg-gradient-to-r
                ${accent.main}
                opacity-80
              `}
            />

            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-emerald-400
                    opacity-40
                  "
                />

                <span
                  className="
                    relative
                    inline-flex
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-emerald-500
                  "
                />
              </span>

              <span
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.12em]

                  text-slate-600
                  dark:text-slate-300
                "
              >
                System operational
              </span>

              <span
                className="
                  ml-auto
                  rounded-md

                  border
                  border-slate-200
                  dark:border-slate-700

                  bg-slate-50
                  dark:bg-slate-800

                  px-1.5
                  py-1

                  text-[9px]
                  font-extrabold

                  text-slate-500
                  dark:text-slate-400
                "
              >
                v1.0
              </span>
            </div>

            <div
              className="
                mt-2
                flex
                items-center
                justify-between
                gap-2
              "
            >
              <span
                className="
                  text-[9px]
                  font-bold

                  text-slate-500
                  dark:text-slate-400
                "
              >
                © 2026 EduSaaS
              </span>

              <span
                className="
                  text-right
                  text-[8px]
                  font-extrabold
                  uppercase
                  tracking-[0.08em]

                  text-slate-400
                  dark:text-slate-500
                "
              >
                Learn · Grow · Succeed
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

