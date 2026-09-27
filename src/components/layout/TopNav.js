import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  searchUsers,
  getCourses,
  sendConnectionRequest,
  removeConnection,
  resolveAssetUrl
} from '../../services/api';

const initials = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function TopNav({ onOpenNav = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [openMenu, setOpenMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [searchResults, setSearchResults] = useState({
    members: [],
    courses: []
  });

  const [showSearchResults, setShowSearchResults] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(5);

  const unreadCount = notifications.filter(
    (n) => !n.read_status
  ).length;

  const visibleNotifications = notifications.slice(
    0,
    displayLimit
  );

  const wrapRef = useRef(null);

  const displayName =
    user?.name ||
    user?.displayName ||
    user?.firstName ||
    t('guest');

  const firstName =
    user?.firstName ||
    displayName.split(' ')[0] ||
    t('guest');

  const displayRole = user?.role
    ? user.role[0].toUpperCase() +
      user.role.slice(1)
    : '';

  const [avatarErr, setAvatarErr] = useState(false);

  const rawAvatar =
    user?.avatar_url ||
    user?.avatar ||
    user?.imageUrl;

  const userAvatar =
    !avatarErr && rawAvatar
      ? resolveAssetUrl(rawAvatar)
      : null;

  useEffect(() => {
    setAvatarErr(false);
  }, [rawAvatar]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target)
      ) {
        setOpenMenu(false);
        setOpenNotif(false);
        setShowSearchResults(false);
        setDisplayLimit(5);
      }
    };

    document.addEventListener(
      'mousedown',
      onDocClick
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        onDocClick
      );
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

        setNotifications(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          'Failed to load notifications:',
          error
        );

        setNotificationsError(
          t('unable_to_load_notifications')
        );

        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();

    const handleNotifUpdate = () => {
      loadNotifications();
    };

    window.addEventListener(
      'notifications_updated',
      handleNotifUpdate
    );

    return () =>
      window.removeEventListener(
        'notifications_updated',
        handleNotifUpdate
      );
  }, [user?.id, t]);

  const [toastMessage, setToastMessage] =
    useState(null);

  const [sentRequests, setSentRequests] =
    useState({});

  const showToast = (
    message,
    type = 'success'
  ) => {
    setToastMessage({
      message,
      type
    });

    setTimeout(
      () => setToastMessage(null),
      3000
    );
  };

  const handleBellClick = async () => {
    setOpenMenu(false);

    if (!openNotif) {
      const hadUnread = unreadCount > 0;

      setDisplayLimit(
        hadUnread ? 50 : 5
      );

      setOpenNotif(true);

      if (hadUnread) {
        try {
          await markAllNotificationsRead();

          setNotifications((prev) =>
            prev.map((n) => ({
              ...n,
              read_status: true
            }))
          );

          window.dispatchEvent(
            new CustomEvent(
              'notifications_updated'
            )
          );
        } catch (err) {
          console.error(
            'Failed to mark all as read:',
            err
          );
        }
      }
    } else {
      setOpenNotif(false);
      setDisplayLimit(5);
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    const {
      id,
      read_status,
      type,
      reference_id
    } = notification;

    if (!read_status) {
      try {
        await markNotificationRead(id);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  read_status: true
                }
              : n
          )
        );

        window.dispatchEvent(
          new CustomEvent(
            'notifications_updated'
          )
        );
      } catch (err) {
        console.error(
          'Failed to mark as read:',
          err
        );
      }
    }

    setOpenNotif(false);
    setDisplayLimit(5);

    if (
      type === 'announcement' &&
      reference_id
    ) {
      try {
        const seenKey =
          `edu_seen_announcements_${
            user?.id || 'user'
          }`;

        const raw =
          localStorage.getItem(
            seenKey
          );

        const seen = raw
          ? JSON.parse(raw)
          : [];

        if (!seen.includes(reference_id)) {
          localStorage.setItem(
            seenKey,
            JSON.stringify([
              ...seen,
              reference_id
            ])
          );
        }
      } catch {}

      window.dispatchEvent(
        new CustomEvent(
          'announcements_seen'
        )
      );
    }

    if (type === 'connection_request') {
      navigate('/app/community', {
        state: {
          activeTab: 'Connections'
        }
      });
    } else if (
      type === 'new_post' ||
      type === 'new_job' ||
      type === 'new_course'
    ) {
      navigate('/app/community', {
        state: {
          scrollToPost: reference_id
        }
      });
    } else if (
      type === 'connection_accepted'
    ) {
      navigate('/app/community', {
        state: {
          activeTab: 'Connections'
        }
      });
    } else if (
      type === 'announcement'
    ) {
      navigate('/app/community', {
        state: {
          activeTab: 'Announcements'
        }
      });
    }
  };

  const handleConnect = async (
    targetUserId,
    e
  ) => {
    e.stopPropagation();

    try {
      const res =
        await sendConnectionRequest(
          targetUserId
        );

      if (
        res.success &&
        res.connection
      ) {
        setSentRequests((prev) => ({
          ...prev,
          [targetUserId]:
            res.connection.id
        }));
      }

      showToast(
        t('connection_request_sent'),
        'success'
      );
    } catch (err) {
      showToast(
        err.response?.data?.error ||
          t('failed_to_send_request'),
        'error'
      );
    }
  };

  const handleRemoveRequest = async (
    targetUserId,
    connectionId,
    e
  ) => {
    e.stopPropagation();

    try {
      const res =
        await removeConnection(
          connectionId
        );

      if (res.success) {
        setSentRequests((prev) => {
          const next = {
            ...prev
          };

          delete next[targetUserId];

          return next;
        });

        showToast(
          t('request_cancelled'),
          'success'
        );
      }
    } catch (err) {
      showToast(
        t('failed_to_cancel_request'),
        'error'
      );
    }
  };

  useEffect(() => {
    const q =
      globalSearchQuery.trim();

    if (q.length > 2) {
      setIsSearching(true);
      setShowSearchResults(true);

      const delayFn = setTimeout(() => {
        Promise.all([
          searchUsers(q).catch(() => ({
            data: []
          })),
          getCourses({
            search: q
          }).catch(() => [])
        ])
          .then(
            ([
              usersRes,
              coursesData
            ]) => {
              const members =
                usersRes.data
                  ? usersRes.data
                      .filter(
                        (u) =>
                          u.id !==
                          user?.id
                      )
                      .slice(0, 5)
                  : [];

              const existingRequests =
                {};

              members.forEach((m) => {
                if (
                  m.connection_status ===
                    'pending_sent' &&
                  m.connection_id
                ) {
                  existingRequests[
                    m.id
                  ] =
                    m.connection_id;
                }
              });

              setSentRequests(
                (prev) => ({
                  ...prev,
                  ...existingRequests
                })
              );

              setSearchResults({
                members,
                courses:
                  Array.isArray(
                    coursesData
                  )
                    ? coursesData.slice(
                        0,
                        5
                      )
                    : []
              });
            }
          )
          .finally(() =>
            setIsSearching(false)
          );
      }, 500);

      return () =>
        clearTimeout(delayFn);
    } else {
      setSearchResults({
        members: [],
        courses: []
      });

      setIsSearching(false);
      setShowSearchResults(false);
    }
  }, [
    globalSearchQuery,
    user?.id
  ]);

  return (
    <>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`px-6 py-3 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 ${
              toastMessage.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-slate-800 dark:bg-slate-700 text-white'
            }`}
          >
            <span>
              {toastMessage.type === 'error'
                ? '❌'
                : '✅'}
            </span>

            {toastMessage.message}
          </div>
        </div>
      )}

      <header className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_1px_12px_rgba(15,23,42,0.04)] sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">

          <div className="flex items-center gap-3 min-w-0 flex-1">

            <button
              type="button"
              onClick={onOpenNav}
              className="md:hidden w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 grid place-items-center shrink-0 shadow-sm hover:shadow transition-all duration-200"
              aria-label={t('open_menu')}
              title={t('open_menu')}
            >
              ☰
            </button>

            <div className="min-w-0">

              <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                {t('education_saas_dashboard')}
              </h1>

              <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">

                {user?.role === 'employer'
                  ? t('welcome_employer', {
                      name: firstName
                    })
                  : user?.role === 'educator'
                  ? t('welcome_educator', {
                      name: firstName
                    })
                  : t('welcome_student', {
                      name: firstName
                    })}

              </div>
            </div>
          </div>

          <div
            ref={wrapRef}
            className="flex items-center gap-2 sm:gap-3 shrink-0"
          >

            {/* Search */}
            <div className="hidden xl:block relative">

              <input
                type="text"
                placeholder={t('search_courses_skills_candidates')}
                value={
                  globalSearchQuery
                }
                onChange={(e) =>
                  setGlobalSearchQuery(
                    e.target.value
                  )
                }
                onFocus={() => {
                  if (
                    globalSearchQuery
                      .trim()
                      .length > 2
                  ) {
                    setShowSearchResults(
                      true
                    );
                  }
                }}
                aria-label={t('search')}
                className="w-full sm:w-80 lg:w-96 pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-100/70 dark:focus:ring-brand-blue-500/20 outline-none shadow-sm focus:shadow-md transition-all duration-200"
              />

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              {showSearchResults && (
                <div className="absolute top-full mt-2 w-[400px] right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2">

                  <div className="max-h-96 overflow-y-auto">

                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('searching')}
                      </div>
                    ) : searchResults.members
                        .length === 0 &&
                      searchResults.courses
                        .length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('no_results_for')}{' '}
                        "{globalSearchQuery}"
                      </div>
                    ) : (
                      <>
                        {searchResults
                          .members
                          .length >
                          0 && (
                          <div className="py-2">

                            <div className="px-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {t('members')}
                            </div>

                            {searchResults.members.map(
                              (member) => (
                                <div
                                  key={
                                    member.id
                                  }
                                  className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                                  onClick={() => {
                                    setShowSearchResults(
                                      false
                                    );

                                    navigate(
                                      '/app/community'
                                    );
                                  }}
                                >

                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs grid place-items-center shrink-0">
                                    {member.name
                                      .split(
                                        ' '
                                      )
                                      .map(
                                        (n) =>
                                          n[0]
                                      )
                                      .join(
                                        ''
                                      )
                                      .substring(
                                        0,
                                        2
                                      )}
                                  </div>

                                  <div className="flex-1">

                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                      {
                                        member.name
                                      }
                                    </div>

                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      @
                                      {member.username ||
                                        'user'}{' '}
                                      •{' '}
                                      {member
                                        .role
                                        ?.name ||
                                        member.role ||
                                        t('student')}
                                    </div>

                                  </div>

                                  {sentRequests[
                                    member.id
                                  ] ? (
                                    <button
                                      type="button"
                                      onClick={(
                                        e
                                      ) =>
                                        handleRemoveRequest(
                                          member.id,
                                          sentRequests[
                                            member
                                              .id
                                          ],
                                          e
                                        )
                                      }
                                      className="ml-auto px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full transition-colors"
                                    >
                                      {t('remove_request')}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(
                                        e
                                      ) =>
                                        handleConnect(
                                          member.id,
                                          e
                                        )
                                      }
                                      className="ml-auto px-3 py-1 bg-brand-blue-50 dark:bg-blue-500/15 hover:bg-brand-blue-100 dark:hover:bg-blue-500/25 text-brand-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full transition-colors"
                                    >
                                      {t('connect')}
                                    </button>
                                  )}

                                </div>
                              )
                            )}
                          </div>
                        )}

                        {searchResults
                          .courses
                          .length >
                          0 && (
                          <div className="py-2 border-t border-slate-100 dark:border-slate-800">

                            <div className="px-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {t('courses')}
                            </div>

                            {searchResults.courses.map(
                              (course) => (
                                <div
                                  key={
                                    course.id
                                  }
                                  className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                                  onClick={() => {
                                    setShowSearchResults(
                                      false
                                    );

                                    navigate(
                                      `/app/learning/${course.id}`
                                    );
                                  }}
                                >

                                  <div className="w-8 h-8 rounded bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs grid place-items-center shrink-0">
                                    📚
                                  </div>

                                  <div className="flex-1 min-w-0">

                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                      {
                                        course.title
                                      }
                                    </div>

                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {course.provider ||
                                        'EDU-SAAS'}
                                    </div>

                                  </div>

                                </div>
                              )
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">

              <button
                type="button"
                onClick={
                  handleBellClick
                }
                className="relative w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 grid place-items-center shadow-sm hover:shadow transition-all duration-200"
                aria-label={t('notifications')}
                title={t('notifications')}
              >
                🔔

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-brand-orange-500 text-white rounded-full grid place-items-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {openNotif && (
                <div className="absolute right-0 mt-3 w-72 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.14)] border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">

                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">

                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {t('notifications')}
                    </span>

                    {notifications.length >
                      5 &&
                      displayLimit ===
                        5 && (
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {t('latest_5')}
                        </span>
                      )}

                  </div>

                  <ul className="max-h-72 overflow-y-auto">

                    {notificationsLoading ? (
                      <li className="px-4 py-6 text-sm text-center text-slate-400">
                        {t('loading_notifications')}
                      </li>
                    ) : notificationsError ? (
                      <li className="px-4 py-6 text-sm text-center text-red-500">
                        {notificationsError}
                      </li>
                    ) : visibleNotifications.length ===
                      0 ? (
                      <li className="px-4 py-6 text-sm text-center text-slate-400">
                        {t('no_notifications')}
                      </li>
                    ) : (
                      visibleNotifications.map(
                        (n) => (
                          <li
                            key={n.id}
                            onClick={() =>
                              handleNotificationClick(
                                n
                              )
                            }
                            className={`px-4 py-3 text-sm border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                              !n.read_status
                                ? 'bg-brand-blue-50/40 dark:bg-blue-500/10'
                                : ''
                            }`}
                          >

                            <div className="text-slate-800 dark:text-slate-100">
                              {
                                n.message
                              }
                            </div>

                            <div className="text-xs text-slate-400 mt-0.5">
                              {n.created_at
                                ? new Date(
                                    n.created_at
                                  ).toLocaleString()
                                : ''}
                            </div>

                          </li>
                        )
                      )
                    )}

                  </ul>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  setOpenMenu(
                    (v) => !v
                  );
                  setOpenNotif(false);
                }}
                className="flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200"
                aria-label={t('profile')}
              >

                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    onError={() =>
                      setAvatarErr(
                        true
                      )
                    }
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-brand-blue-100 dark:bg-blue-500/20 text-brand-blue-700 dark:text-blue-400 grid place-items-center font-semibold text-xs shadow-sm">
                    {initials(
                      displayName
                    )}
                  </div>
                )}

                <div className="text-left hidden sm:block">

                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {firstName}
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {displayRole}
                  </div>

                </div>
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.14)] border border-slate-200 dark:border-slate-700 py-1.5 overflow-hidden animate-fade-in">

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(
                        false
                      );
                      navigate(
                        '/app/profile'
                      );
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                  >
                    {t('my_profile')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(
                        false
                      );
                      navigate(
                        '/app/settings'
                      );
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                  >
                    {t('settings')}
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate(
                        '/login'
                      );
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-brand-red-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {t('logout')}
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