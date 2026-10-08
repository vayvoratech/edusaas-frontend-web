
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
    main: 'from-indigo-600 via-blue-600 to-cyan-500',
    soft: 'from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-950/60 dark:via-blue-950/50 dark:to-cyan-950/40',
    softBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    strongText: 'text-indigo-800 dark:text-indigo-200',
    border: 'border-indigo-200 dark:border-indigo-800/70',
    iconIdle:
      'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
    orbOne: 'bg-indigo-400/25 dark:bg-indigo-500/15',
    orbTwo: 'bg-cyan-400/20 dark:bg-cyan-500/10',
    shadow: 'shadow-indigo-500/30',
  },

  educator: {
    main: 'from-orange-500 via-amber-500 to-yellow-400',
    soft: 'from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/55 dark:via-amber-950/45 dark:to-yellow-950/30',
    softBg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    strongText: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-800/70',
    iconIdle:
      'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60',
    orbOne: 'bg-orange-400/25 dark:bg-orange-500/15',
    orbTwo: 'bg-yellow-400/20 dark:bg-yellow-500/10',
    shadow: 'shadow-orange-500/30',
  },

  employer: {
    main: 'from-emerald-500 via-teal-500 to-cyan-500',
    soft: 'from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/55 dark:via-teal-950/45 dark:to-cyan-950/30',
    softBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    strongText: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-800/70',
    iconIdle:
      'bg-emerald-50 text-teal-700 border-emerald-100 dark:bg-emerald-950/50 dark:text-teal-300 dark:border-emerald-800/60',
    orbOne: 'bg-emerald-400/25 dark:bg-emerald-500/15',
    orbTwo: 'bg-cyan-400/20 dark:bg-cyan-500/10',
    shadow: 'shadow-teal-500/30',
  },

  admin: {
    main: 'from-fuchsia-600 via-purple-600 to-indigo-600',
    soft: 'from-fuchsia-50 via-purple-50 to-indigo-50 dark:from-fuchsia-950/55 dark:via-purple-950/45 dark:to-indigo-950/40',
    softBg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    strongText: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-800/70',
    iconIdle:
      'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
    orbOne: 'bg-purple-400/25 dark:bg-purple-500/15',
    orbTwo: 'bg-fuchsia-400/20 dark:bg-fuchsia-500/10',
    shadow: 'shadow-purple-500/30',
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

          @keyframes edusaasFloat {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }

            50% {
              transform: translate3d(12px, -10px, 0) scale(1.05);
            }
          }

          @keyframes edusaasGlow {
            0%, 100% {
              opacity: 0.35;
              transform: translateX(-15%);
            }

            50% {
              opacity: 0.75;
              transform: translateX(15%);
            }
          }

          @keyframes edusaasShimmer {
            0% {
              transform: translateX(-130%);
            }

            100% {
              transform: translateX(130%);
            }
          }

          @keyframes edusaasPulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.7;
            }

            50% {
              transform: scale(1.35);
              opacity: 0.25;
            }
          }

          .edusaas-sidebar-float {
            animation: edusaasFloat 8s ease-in-out infinite;
          }

          .edusaas-sidebar-float-delay {
            animation: edusaasFloat 10s ease-in-out infinite reverse;
          }

          .edusaas-sidebar-glow {
            animation: edusaasGlow 7s ease-in-out infinite;
          }

          .edusaas-sidebar-shimmer {
            animation: edusaasShimmer 2.8s ease-in-out infinite;
          }

          .edusaas-sidebar-pulse {
            animation: edusaasPulse 2s ease-in-out infinite;
          }
        `}
      </style>

      {/* ============================================================
          MOBILE BACKDROP
      ============================================================ */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-30
            md:hidden
            bg-slate-950/45
            dark:bg-black/70
            backdrop-blur-md
            transition-opacity
            duration-300
            animate-fade-in
          "
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ============================================================
          SIDEBAR
      ============================================================ */}

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

          bg-[#f7f9ff]
          dark:bg-[#070b17]

          border-r
          border-indigo-100/80
          dark:border-indigo-950/80

          shadow-[18px_0_55px_rgba(30,41,100,0.13)]
          dark:shadow-[18px_0_55px_rgba(0,0,0,0.55)]

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

        {/* ==========================================================
            BACKGROUND
        ========================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          {/* Main background */}
          <div
            className="
              absolute
              inset-0

              bg-gradient-to-br
              from-white
              via-indigo-50/70
              to-blue-50/80

              dark:from-[#070b17]
              dark:via-[#0b1022]
              dark:to-[#071522]
            "
          />

          {/* Top floating orb */}
          <div
            className={`
              edusaas-sidebar-float

              absolute
              -left-36
              -top-32

              h-[390px]
              w-[390px]

              rounded-full

              ${accent.orbOne}

              blur-[105px]
            `}
          />

          {/* Right floating orb */}
          <div
            className={`
              edusaas-sidebar-float-delay

              absolute
              -right-36
              top-[25%]

              h-[350px]
              w-[350px]

              rounded-full

              ${accent.orbTwo}

              blur-[110px]
            `}
          />

          {/* Bottom glow */}
          <div
            className="
              edusaas-sidebar-glow

              absolute
              -bottom-40
              left-[5%]

              h-[330px]
              w-[430px]

              rounded-full

              bg-indigo-300/15
              dark:bg-indigo-500/10

              blur-[115px]
            "
          />

          {/* Subtle grid */}
          <div
            className="
              absolute
              inset-0
              opacity-[0.12]
              dark:opacity-[0.07]
            "
            style={{
              backgroundImage:
                'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Right gradient edge */}
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

              opacity-25
            `}
          />
        </div>

        {/* ==========================================================
            BRAND
        ========================================================== */}

        <div
          className="
            relative
            z-10
            shrink-0

            px-4
            pt-4
            pb-3
          "
        >
          <div
            className="
              group

              relative
              overflow-hidden

              rounded-[22px]

              border
              border-white/70
              dark:border-slate-700/70

              bg-white/80
              dark:bg-slate-900/70

              backdrop-blur-2xl

              shadow-[0_18px_45px_rgba(30,41,100,0.12)]
              dark:shadow-[0_18px_45px_rgba(0,0,0,0.38)]

              transition-all
              duration-500

              hover:-translate-y-1
              hover:shadow-[0_24px_55px_rgba(30,41,100,0.18)]
              dark:hover:shadow-[0_24px_55px_rgba(0,0,0,0.48)]
            "
          >

            {/* Gradient top line */}
            <div
              className={`
                absolute
                left-0
                right-0
                top-0
                h-[4px]

                bg-gradient-to-r
                ${accent.main}
              `}
            />

            {/* Animated shine */}
            <span
              className="
                edusaas-sidebar-shimmer

                pointer-events-none
                absolute
                -left-1/2
                top-0

                h-full
                w-1/3

                rotate-[18deg]

                bg-white/30
                blur-xl
              "
            />

            <div
              className="
                relative

                flex
                items-center
                justify-between

                px-4
                py-4
              "
            >

              <div className="flex items-center gap-3">

                {/* Logo */}
                <div className="relative">

                  <div
                    className={`
                      absolute
                      -inset-3

                      rounded-2xl

                      bg-gradient-to-br
                      ${accent.main}

                      opacity-25
                      blur-xl
                    `}
                  />

                  <div
                    className={`
                      group/logo

                      relative

                      grid
                      h-12
                      w-12

                      place-items-center

                      overflow-hidden

                      rounded-[16px]

                      bg-gradient-to-br
                      ${accent.main}

                      text-white

                      shadow-xl
                      ${accent.shadow}

                      transition-all
                      duration-500

                      group-hover:scale-105
                      group-hover:rotate-2
                    `}
                  >

                    <span
                      className="
                        absolute
                        -left-12
                        top-0

                        h-full
                        w-8

                        rotate-[25deg]

                        bg-white/40
                        blur-sm

                        transition-all
                        duration-700

                        group-hover:left-[130%]
                      "
                    />

                    <span
                      className="
                        absolute
                        inset-[1px]

                        rounded-[15px]

                        border
                        border-white/30
                      "
                    />

                    <span
                      className="
                        relative
                        z-10

                        text-[21px]
                        font-black
                        tracking-tight
                      "
                    >
                      E
                    </span>

                    <span
                      className="
                        absolute
                        bottom-[3px]
                        right-[3px]

                        h-3
                        w-3

                        rounded-full

                        border-2
                        border-white

                        bg-emerald-400

                        shadow-[0_0_12px_rgba(52,211,153,0.85)]
                      "
                    />
                  </div>
                </div>

                {/* Brand text */}
                <div className="min-w-0">

                  <div
                    className="
                      text-[20px]
                      font-black
                      tracking-[-0.05em]

                      bg-gradient-to-r
                      from-slate-950
                      via-indigo-700
                      to-blue-600

                      bg-clip-text
                      text-transparent

                      dark:from-white
                      dark:via-indigo-200
                      dark:to-blue-300
                    "
                  >
                    EduSaaS
                  </div>

                  <div
                    className="
                      mt-1

                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.18em]

                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {t('skill_platform')}
                  </div>
                </div>
              </div>

              {/* Mobile close */}
              <button
                type="button"
                onClick={onClose}
                className="
                  md:hidden

                  grid
                  h-9
                  w-9

                  shrink-0
                  place-items-center

                  rounded-xl

                  border
                  border-slate-200
                  dark:border-slate-700

                  bg-slate-50/90
                  dark:bg-slate-800/80

                  text-slate-600
                  dark:text-slate-300

                  shadow-sm

                  transition-all
                  duration-300

                  hover:scale-105
                  hover:rotate-90

                  hover:border-red-200
                  hover:bg-red-50
                  hover:text-red-600

                  dark:hover:border-red-800
                  dark:hover:bg-red-950/40
                  dark:hover:text-red-400
                "
                aria-label={t('close_menu')}
                title={t('close_menu')}
              >
                <X size={17} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================================
            ACCOUNT CARD
        ========================================================== */}

        <div
          className="
            relative
            z-10
            shrink-0

            px-4
            pb-3
          "
        >
          <div
            className="
              group

              relative
              overflow-hidden

              rounded-[20px]

              border
              border-indigo-100/80
              dark:border-indigo-900/50

              bg-gradient-to-br
              from-white/90
              via-indigo-50/65
              to-blue-50/75

              dark:from-slate-900/90
              dark:via-indigo-950/40
              dark:to-blue-950/30

              backdrop-blur-2xl

              shadow-[0_14px_38px_rgba(30,41,100,0.10)]
              dark:shadow-[0_14px_38px_rgba(0,0,0,0.35)]

              transition-all
              duration-400

              hover:-translate-y-0.5
              hover:shadow-[0_18px_42px_rgba(30,41,100,0.15)]
              dark:hover:shadow-[0_18px_42px_rgba(0,0,0,0.45)]
            "
          >

            {/* Gradient top */}
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

            {/* Decorative glow */}
            <div
              className={`
                absolute
                -right-8
                -top-8

                h-24
                w-24

                rounded-full

                ${accent.orbOne}

                blur-2xl

                transition-all
                duration-500

                group-hover:scale-150
              `}
            />

            <div className="relative p-3.5">

              <div className="flex items-center justify-between">

                <div
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.18em]

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

              <div className="mt-3 flex items-center gap-3">

                {/* Avatar */}
                <div
                  className={`
                    relative

                    grid
                    h-11
                    w-11

                    shrink-0
                    place-items-center

                    rounded-[14px]

                    bg-gradient-to-br
                    ${accent.main}

                    text-white

                    shadow-lg
                    ${accent.shadow}

                    transition-all
                    duration-300

                    group-hover:scale-105
                  `}
                >
                  <UserRound
                    size={19}
                    strokeWidth={2.1}
                  />

                  <span
                    className="
                      edusaas-sidebar-pulse

                      absolute
                      bottom-[-2px]
                      right-[-2px]

                      h-3
                      w-3

                      rounded-full

                      border-2
                      border-white
                      dark:border-slate-900

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

                {/* Role badge */}
                <div
                  className={`
                    hidden
                    sm:block

                    shrink-0

                    rounded-xl

                    border

                    ${accent.border}
                    ${accent.softBg}

                    px-2.5
                    py-1.5

                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.12em]

                    ${accent.text}

                    shadow-sm
                  `}
                >
                  {normalizedRole || 'user'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================================
            WORKSPACE HEADER
        ========================================================== */}

        <div
          className="
            relative
            z-10

            flex
            items-center
            justify-between

            px-5
            pb-2.5
            pt-1
          "
        >
          <div className="flex items-center gap-2.5">

            <span
              className={`
                relative
                flex
                h-2
                w-2

                rounded-full

                bg-gradient-to-r
                ${accent.main}
              `}
            >
              <span
                className={`
                  absolute
                  -inset-1

                  rounded-full

                  bg-gradient-to-r
                  ${accent.main}

                  opacity-25
                  blur-sm
                `}
              />
            </span>

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
              rounded-xl

              border
              border-indigo-100
              dark:border-indigo-900/60

              bg-white/75
              dark:bg-slate-900/70

              px-2.5
              py-1

              text-[8px]
              font-black
              uppercase
              tracking-[0.08em]

              text-indigo-600
              dark:text-indigo-300

              shadow-sm
              backdrop-blur-md
            "
          >
            {items.length} modules
          </span>
        </div>

        {/* ==========================================================
            NAVIGATION
        ========================================================== */}

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
          <div className="space-y-1.5">

            {items.map((item) => {
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
                      min-h-[54px]

                      items-center
                      gap-3

                      overflow-hidden

                      rounded-[17px]

                      border

                      px-3
                      py-2.5

                      transition-all
                      duration-300
                      ease-out

                      ${
                        isActive
                          ? `
                            border-indigo-200/80
                            dark:border-indigo-800/60

                            bg-gradient-to-r
                            ${accent.soft}

                            text-slate-950
                            dark:text-white

                            shadow-[0_12px_30px_rgba(79,70,229,0.12)]
                            dark:shadow-[0_12px_30px_rgba(79,70,229,0.18)]

                            translate-x-1
                          `
                          : `
                            border-transparent

                            bg-white/30
                            dark:bg-slate-900/20

                            text-slate-600
                            dark:text-slate-400

                            hover:border-indigo-100
                            dark:hover:border-indigo-900/60

                            hover:bg-white/75
                            dark:hover:bg-slate-900/70

                            hover:text-slate-950
                            dark:hover:text-white

                            hover:shadow-[0_8px_25px_rgba(30,41,100,0.08)]
                            dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.25)]

                            hover:translate-x-1
                          `
                      }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>

                      {/* Active gradient glow */}
                      {isActive && (
                        <span
                          className={`
                            pointer-events-none

                            absolute
                            -right-10
                            top-1/2

                            h-20
                            w-20

                            -translate-y-1/2

                            rounded-full

                            bg-gradient-to-br
                            ${accent.main}

                            opacity-10
                            blur-2xl
                          `}
                        />
                      )}

                      {/* Active rail */}
                      <span
                        className={`
                          absolute
                          left-0
                          top-1/2

                          -translate-y-1/2

                          w-[4px]

                          rounded-r-full

                          bg-gradient-to-b
                          ${accent.main}

                          transition-all
                          duration-300

                          ${
                            isActive
                              ? 'h-9 opacity-100'
                              : 'h-0 opacity-0 group-hover:h-7 group-hover:opacity-70'
                          }
                        `}
                      />

                      {/* Hover shine */}
                      <span
                        className="
                          pointer-events-none

                          absolute
                          inset-y-0
                          -left-1/2

                          w-1/3

                          rotate-[18deg]

                          bg-white/25

                          opacity-0
                          blur-md

                          transition-all
                          duration-700

                          group-hover:left-[130%]
                          group-hover:opacity-100
                        "
                      />

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

                          rounded-[13px]

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

                                group-hover:border-indigo-200
                                dark:group-hover:border-indigo-800

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
                          strokeWidth={isActive ? 2.5 : 2}
                          className="
                            transition-transform
                            duration-300

                            group-hover:scale-110
                            group-hover:-rotate-2
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

                      {/* Active dot */}
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

                            shadow-[0_0_12px_rgba(16,185,129,0.8)]

                            animate-pulse
                          "
                        />
                      )}

                      {/* Arrow */}
                      <ChevronRight
                        size={15}
                        strokeWidth={2.5}
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

        {/* ==========================================================
            SYSTEM STATUS FOOTER
        ========================================================== */}

        <div
          className="
            relative
            z-10
            shrink-0

            border-t
            border-indigo-100/80
            dark:border-indigo-950/70

            px-4
            py-3
          "
        >
          <div
            className="
              group

              relative
              overflow-hidden

              rounded-[17px]

              border
              border-emerald-100
              dark:border-emerald-900/50

              bg-gradient-to-r
              from-white/85
              via-emerald-50/60
              to-teal-50/70

              dark:from-slate-900/90
              dark:via-emerald-950/30
              dark:to-teal-950/25

              px-3.5
              py-3

              shadow-[0_10px_30px_rgba(16,185,129,0.07)]
              dark:shadow-[0_10px_30px_rgba(0,0,0,0.30)]

              backdrop-blur-xl

              transition-all
              duration-300

              hover:-translate-y-0.5
            "
          >

            {/* Top accent */}
            <div
              className={`
                absolute
                left-4
                right-4
                top-0

                h-[2px]

                rounded-full

                bg-gradient-to-r
                ${accent.main}

                opacity-80
              `}
            />

            <div className="flex items-center gap-2.5">

              {/* Status indicator */}
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

                    shadow-[0_0_10px_rgba(16,185,129,0.75)]
                  "
                />
              </span>

              <span
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.12em]

                  text-slate-700
                  dark:text-slate-300
                "
              >
                System operational
              </span>

              <span
                className="
                  ml-auto

                  rounded-lg

                  border
                  border-slate-200
                  dark:border-slate-700

                  bg-white/80
                  dark:bg-slate-800

                  px-1.5
                  py-1

                  text-[8px]
                  font-black

                  text-slate-500
                  dark:text-slate-400

                  shadow-sm
                "
              >
                v1.0
              </span>
            </div>

            <div
              className="
                mt-2.5

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