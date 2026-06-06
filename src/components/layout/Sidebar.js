import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navByRole = {
  Student: [
    { to: '/app/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/app/assessments', label: 'Assessments', icon: '📝' },
    { to: '/app/learning-paths', label: 'Learning Paths', icon: '📚' },
    { to: '/app/gap-report', label: 'Gap Report', icon: '📊' },
    { to: '/app/profile', label: 'Profile', icon: '👤' },
    { to: '/app/marketplace', label: 'Marketplace', icon: '🛒' },
  ],
  Educator: [
    { to: '/app/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/app/analytics', label: 'Batch Analytics', icon: '📈' },
    { to: '/app/curriculum', label: 'Curriculum', icon: '📘' },
    { to: '/app/profile', label: 'Profile', icon: '👤' },
  ],
  Employer: [
    { to: '/app/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/app/candidates', label: 'Candidates', icon: '🧑‍💼' },
    { to: '/app/workforce', label: 'Workforce', icon: '📊' },
    { to: '/app/profile', label: 'Profile', icon: '👤' },
  ],
  Admin: [
    { to: '/app/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/app/users', label: 'User Management', icon: '👥' },
    { to: '/app/reports', label: 'Reports', icon: '📑' },
    { to: '/app/settings', label: 'Settings', icon: '⚙️' },
    { to: '/app/ai-insights', label: 'AI Insights', icon: '🤖' },
    { to: '/app/subscriptions', label: 'Subscriptions', icon: '💳' },
    { to: '/app/profile', label: 'Profile', icon: '👤' },
  ],
};

export function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { role, switchRole } = useAuth();
  const items = navByRole[role] || navByRole.Student;
  const roles = ['Student', 'Educator', 'Employer', 'Admin'];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 md:z-auto h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform md:transform-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-blue-500 text-white grid place-items-center font-bold">
              E
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">EduSaaS</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                Skill Platform
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 grid place-items-center rounded-md hover:bg-slate-100"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="px-3 py-3 border-b border-slate-100">
          <div className="text-[10px] uppercase tracking-wide text-slate-400 px-2 mb-2">
            Role
          </div>
          <div className="grid grid-cols-2 gap-1">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${
                  role === r
                    ? 'bg-brand-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-brand-blue-50 text-brand-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400">
          © 2026 EduSaaS
        </div>
      </aside>
    </>
  );
}
