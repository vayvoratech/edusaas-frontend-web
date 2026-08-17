import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../../services/api';

const initials = (name) =>
  (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function TopNav({ onOpenNav = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  const unreadCount = notifications.filter(
      (n) => !n.read_status
    ).length;
      

  const wrapRef = useRef(null);

  const displayName = user?.name || user?.firstName || 'Guest';
  const firstName = displayName.split(' ')[0];
  const displayRole = user?.role
    ? user.role[0].toUpperCase() + user.role.slice(1)
    : '';

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenMenu(false);
        setOpenNotif(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) {
        setNotifications([]);
        return;
      }

      try {
        setNotificationsLoading(true);
        setNotificationsError('');

        const data = await getNotifications();

        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotificationsError('Unable to load notifications.');
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
  }, [user?.id]);


  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onOpenNav}
            className="md:hidden w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 grid place-items-center shrink-0"
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
              Education SaaS Dashboard
            </h1>
            <div className="text-xs text-slate-500 hidden sm:block truncate">
              Welcome back, {firstName} — let&apos;s close those skill gaps.
            </div>
          </div>
        </div>

        <div ref={wrapRef} className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden xl:block relative">
            <input
              type="text"
              placeholder="Search courses, skills, candidates…"
              className="w-72 pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-100 focus:bg-white border border-transparent focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setOpenNotif((v) => !v);
                setOpenMenu(false);
              }}
              className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center"
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-brand-orange-500 text-white rounded-full grid place-items-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {openNotif && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm">
                  Notifications
                </div>
                <ul className="max-h-72 overflow-y-auto">
                  {notificationsLoading ? (
                    <li className="px-4 py-6 text-sm text-center text-slate-400">
                      Loading notifications...
                    </li>
                  ) : notificationsError ? (
                    <li className="px-4 py-6 text-sm text-center text-red-500">
                      {notificationsError}
                    </li>
                  ) : notifications.length === 0 ? (
                    <li className="px-4 py-6 text-sm text-center text-slate-400">
                      No notifications
                    </li>
                  ) : (
                    notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`px-4 py-3 text-sm border-b border-slate-50 hover:bg-slate-50 ${
                          !n.read_status ? 'bg-brand-blue-50/40' : ''
                        }`}
                      >
                        <div className="text-slate-800">
                          {n.title}
                        </div>

                        <div className="text-xs text-slate-400 mt-0.5">
                          {n.created_at
                            ? new Date(n.created_at).toLocaleString()
                            : ''}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setOpenMenu((v) => !v);
                setOpenNotif(false);
              }}
              className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-full hover:bg-slate-100"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-xs">
                  {initials(displayName)}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-slate-800 leading-tight">
                  {firstName}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {displayRole}
                </div>
              </div>
            </button>
            {openMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 animate-fade-in">
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    navigate('/app/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    navigate('/app/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Settings
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-brand-red-500 hover:bg-slate-50"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
