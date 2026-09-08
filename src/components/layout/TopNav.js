import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead, searchUsers, getCourses, sendConnectionRequest, removeConnection } from '../../services/api';

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
  
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ members: [], courses: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(5);

  const unreadCount = notifications.filter(
      (n) => !n.read_status
    ).length;

  const visibleNotifications = notifications.slice(0, displayLimit);

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
        setShowSearchResults(false);
        setDisplayLimit(5);
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

  const [toastMessage, setToastMessage] = useState(null);
  const [sentRequests, setSentRequests] = useState({}); // { targetUserId: connectionId }

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBellClick = async () => {
    setOpenMenu(false);
    
    if (!openNotif) {
      const hadUnread = unreadCount > 0;
      setDisplayLimit(hadUnread ? 50 : 5);
      setOpenNotif(true);

      // Mark all as read when opening
      if (hadUnread) {
        try {
          await markAllNotificationsRead();
          setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
        } catch (err) {
          console.error("Failed to mark all as read:", err);
        }
      }
    } else {
      setOpenNotif(false);
      setDisplayLimit(5);
    }
  };

  const handleNotificationClick = async (notification) => {
    const { id, read_status, type, reference_id } = notification;

    if (!read_status) {
      try {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: true } : n));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }

    setOpenNotif(false);
    setDisplayLimit(5);

    if (type === 'connection_request') {
      navigate('/app/community', { state: { activeTab: 'Connections' } });
    } else if (type === 'new_post' || type === 'new_job' || type === 'new_course') {
      // Navigate to community and highlight the specific post
      navigate('/app/community', { state: { scrollToPost: reference_id } });
    } else if (type === 'connection_accepted') {
      navigate('/app/community', { state: { activeTab: 'Connections' } });
    }
  };

  const handleConnect = async (targetUserId, e) => {
    e.stopPropagation(); // prevent closing dropdown or navigating
    try {
      const res = await sendConnectionRequest(targetUserId);
      if (res.success && res.connection) {
        setSentRequests(prev => ({ ...prev, [targetUserId]: res.connection.id }));
      }
      showToast("Connection request sent!", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send request", "error");
    }
  };

  const handleRemoveRequest = async (targetUserId, connectionId, e) => {
    e.stopPropagation();
    try {
      const res = await removeConnection(connectionId);
      if (res.success) {
        setSentRequests(prev => {
          const next = { ...prev };
          delete next[targetUserId];
          return next;
        });
        showToast("Request cancelled", "success");
      }
    } catch (err) {
      showToast("Failed to cancel request", "error");
    }
  };

  useEffect(() => {
    const q = globalSearchQuery.trim();
    if (q.length > 2) {
      setIsSearching(true);
      setShowSearchResults(true);
      const delayFn = setTimeout(() => {
        Promise.all([
          searchUsers(q).catch(() => ({ data: [] })),
          getCourses({ search: q }).catch(() => [])
        ]).then(([usersRes, coursesData]) => {
          const members = usersRes.data ? usersRes.data.filter(u => u.id !== user?.id).slice(0, 5) : [];
          // Pre-populate sentRequests if any user has connection_status == 'pending'
          const existingRequests = {};
          members.forEach(m => {
            if (m.connection_status === 'pending_sent' && m.connection_id) {
              existingRequests[m.id] = m.connection_id;
            }
          });
          setSentRequests(prev => ({ ...prev, ...existingRequests }));
          
          setSearchResults({
            members,
            courses: Array.isArray(coursesData) ? coursesData.slice(0, 5) : []
          });
        }).finally(() => setIsSearching(false));
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setSearchResults({ members: [], courses: [] });
      setIsSearching(false);
      setShowSearchResults(false);
    }
  }, [globalSearchQuery, user?.id]);

  return (
    <>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-6 py-3 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 ${
            toastMessage.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'
          }`}>
            <span>{toastMessage.type === 'error' ? '❌' : '✅'}</span>
            {toastMessage.message}
          </div>
        </div>
      )}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
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
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onFocus={() => { if (globalSearchQuery.trim().length > 2) setShowSearchResults(true); }}
              className="w-72 pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-100 focus:bg-white border border-transparent focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            
            {showSearchResults && (
              <div className="absolute top-full mt-2 w-[400px] right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2">
                <div className="max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
                  ) : searchResults.members.length === 0 && searchResults.courses.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">No results found for "{globalSearchQuery}"</div>
                  ) : (
                    <>
                      {searchResults.members.length > 0 && (
                        <div className="py-2">
                          <div className="px-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Members</div>
                          {searchResults.members.map(member => (
                            <div key={member.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onClick={() => { setShowSearchResults(false); navigate('/app/community'); }}>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs grid place-items-center shrink-0">
                                {member.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-bold text-slate-800">{member.name}</div>
                                <div className="text-xs text-slate-500">@{member.username || 'user'} • {member.role?.name || member.role || 'Student'}</div>
                              </div>
                              {sentRequests[member.id] ? (
                                <button 
                                  onClick={(e) => handleRemoveRequest(member.id, sentRequests[member.id], e)}
                                  className="ml-auto px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-full transition-colors"
                                >
                                  Remove Request
                                </button>
                              ) : (
                                <button 
                                  onClick={(e) => handleConnect(member.id, e)}
                                  className="ml-auto px-3 py-1 bg-brand-blue-50 hover:bg-brand-blue-100 text-brand-blue-600 text-xs font-semibold rounded-full transition-colors"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.courses.length > 0 && (
                        <div className="py-2 border-t border-slate-100">
                          <div className="px-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Courses</div>
                          {searchResults.courses.map(course => (
                            <div key={course.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onClick={() => { setShowSearchResults(false); navigate(`/app/learning/${course.id}`); }}>
                              <div className="w-8 h-8 rounded bg-slate-800 text-white font-bold text-xs grid place-items-center shrink-0">
                                📚
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate">{course.title}</div>
                                <div className="text-xs text-slate-500">{course.provider || 'EDU-SAAS'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleBellClick}
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
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">Notifications</span>
                  {notifications.length > 5 && displayLimit === 5 && (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Latest 5
                    </span>
                  )}
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
                  ) : visibleNotifications.length === 0 ? (
                    <li className="px-4 py-6 text-sm text-center text-slate-400">
                      No notifications
                    </li>
                  ) : (
                    visibleNotifications.map((n) => (
                      <li
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`px-4 py-3 text-sm border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${
                          !n.read_status ? 'bg-brand-blue-50/40' : ''
                        }`}
                      >
                        <div className="text-slate-800">
                          {n.message}
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
    </>
  );
}
