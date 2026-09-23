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
} from 'lucide-react';

const navByRole = {
  student: [
    {
      to: '/app/dashboard',
      labelKey: 'dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/app/courses',
      labelKey: 'courses',
      icon: BookOpen,
    },
    {
      to: '/app/achievements',
      labelKey: 'achievements',
      icon: Trophy,
    },
    {
      to: '/app/tasks',
      labelKey: 'tasks_deadlines',
      icon: ListChecks,
    },
    {
      to: '/app/recommendations',
      labelKey: 'recommendations',
      icon: Sparkles,
    },
    {
      to: '/app/community',
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
      to: '/app/settings',
      labelKey: 'settings',
      icon: Settings,
    },
  ],

  educator: [
    {
      to: '/app/dashboard',
      labelKey: 'dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/app/manage-courses',
      labelKey: 'courses',
      icon: BookOpen,
    },
    {
      to: '/app/community',
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
    {
      to: '/app/dashboard',
      labelKey: 'dashboard',
      icon: LayoutDashboard,
    },
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
      to: '/app/community',
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
    {
      to: '/app/dashboard',
      labelKey: 'dashboard',
      icon: LayoutDashboard,
    },
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
      to: '/app/community',
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

export function Sidebar({
  mobileOpen = false,
  onClose = () => {},
}) {
  const { role } = useAuth();
  const { t } = useTranslation();

  const normalizedRole = role?.toLowerCase();

  const items =
    navByRole[normalizedRole] || navByRole.student;

  return (
    <>
      {mobileOpen && (
        <div
          className="
            fixed inset-0
            bg-slate-900/50
            dark:bg-black/70
            z-30
            md:hidden
            animate-fade-in
          "
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:sticky
          top-0 left-0
          z-40 md:z-auto
          h-screen
          w-64
          bg-white dark:bg-slate-950
          border-r
          border-slate-200 dark:border-slate-800
          flex flex-col
          transition-transform
          duration-300
          md:transform-none
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }
        `}
      >
        {/* Logo */}
        <div
          className="
            px-5 py-5
            border-b
            border-slate-100 dark:border-slate-800
            flex items-center justify-between
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-10 h-10
                rounded-xl
                bg-brand-blue-500
                text-white
                grid place-items-center
                font-bold
                text-lg
                shadow-sm
              "
            >
              E
            </div>

            <div>
              <div
                className="
                  text-sm
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                EduSaaS
              </div>

              <div
                className="
                  text-[10px]
                  text-slate-500
                  dark:text-slate-400
                  uppercase
                  tracking-wide
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
              w-9 h-9
              grid place-items-center
              rounded-lg
              text-slate-500
              dark:text-slate-400
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition
            "
            aria-label={t('close_menu')}
            title={t('close_menu')}
          >
            <X size={19} strokeWidth={2} />
          </button>
        </div>

        {/* Signed in */}
        <div
          className="
            px-3 py-3
            border-b
            border-slate-100 dark:border-slate-800
          "
        >
          <div
            className="
              text-[10px]
              uppercase
              tracking-wide
              text-slate-400
              dark:text-slate-500
              px-2
              mb-1
            "
          >
            {t('signed_in_as')}
          </div>

          <div
            className="
              px-2
              text-sm
              font-semibold
              text-slate-700
              dark:text-slate-200
            "
          >
            {role || t('guest')}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                    group
                    flex items-center
                    gap-3
                    px-3 py-2.5
                    rounded-lg
                    text-sm
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? `
                          bg-brand-blue-50
                          dark:bg-brand-blue-500/15
                          text-brand-blue-700
                          dark:text-blue-400
                          font-semibold
                        `
                        : `
                          text-slate-600
                          dark:text-slate-400
                          hover:bg-slate-100
                          dark:hover:bg-slate-800
                          hover:text-slate-900
                          dark:hover:text-slate-100
                        `
                    }
                  `
                }
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                  className="
                    shrink-0
                    transition-transform
                    duration-200
                    group-hover:scale-110
                  "
                />

                <span className="truncate">
                  {t(item.labelKey)}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="
            p-3
            border-t
            border-slate-100 dark:border-slate-800
            text-[10px]
            text-slate-400
            dark:text-slate-500
          "
        >
          © 2026 EduSaaS
        </div>
      </aside>
    </>
  );
}