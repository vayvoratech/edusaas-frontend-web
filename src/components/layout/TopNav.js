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

import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
  Users,
  BookOpen,
  UserPlus,
  X,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

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

  const communityRoute = (() => {
    const role = String(user?.role || '').toLowerCase();

    if (role === 'student') {
      return '/app/student-community';
    }

    if (
      role === 'educator' ||
      role === 'teacher' ||
      role === 'instructor'
    ) {
      return '/app/educator-community';
    }

    if (role === 'employer') {
      return '/app/employer-community';
    }

    if (role === 'admin') {
      return '/app/admin-community';
    }

    return '/app/student-community';
  })();

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
      navigate(communityRoute, {
        state: {
          activeTab: 'Connections'
        }
      });
    } else if (
      type === 'new_post' ||
      type === 'new_job' ||
      type === 'new_course'
    ) {
      navigate(communityRoute, {
        state: {
          scrollToPost: reference_id
        }
      });
    } else if (
      type === 'connection_accepted'
    ) {
      navigate(communityRoute, {
        state: {
          activeTab: 'Connections'
        }
      });
    } else if (
      type === 'announcement'
    ) {
      navigate(communityRoute, {
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
      {/* =========================================================
          TOAST
      ========================================================= */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-5 fade-in duration-300">
          <div
            className={`
              relative
              overflow-hidden

              min-w-[260px]

              px-5
              py-3

              rounded-2xl

              backdrop-blur-xl

              border

              shadow-[0_18px_45px_rgba(15,23,42,0.18)]

              flex
              items-center
              gap-3

              text-sm
              font-bold

              ${
                toastMessage.type === 'error'
                  ? `
                    bg-red-500/95
                    border-red-400/30
                    text-white
                  `
                  : `
                    bg-slate-900/95
                    dark:bg-slate-800/95
                    border-white/10
                    text-white
                  `
              }
            `}
          >
            <span
              className={`
                w-8
                h-8
                rounded-xl
                grid
                place-items-center

                ${
                  toastMessage.type === 'error'
                    ? 'bg-white/15'
                    : 'bg-emerald-500/20'
                }
              `}
            >
              {toastMessage.type === 'error' ? (
                <AlertCircle size={17} />
              ) : (
                <Check size={17} />
              )}
            </span>

            <span className="flex-1">
              {toastMessage.message}
            </span>
          </div>
        </div>
      )}

      {/* =========================================================
          TOP NAV
      ========================================================= */}
      <header
        className="
          sticky
          top-0
          z-50

          bg-white/80
          dark:bg-[#070b16]/80

          backdrop-blur-2xl

          border-b
          border-slate-200/70
          dark:border-white/[0.06]

          shadow-[0_4px_25px_rgba(15,23,42,0.04)]
          dark:shadow-[0_4px_25px_rgba(0,0,0,0.18)]

          transition-all
          duration-300
        "
      >
        {/* Ambient gradient */}
        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px

            bg-gradient-to-r
            from-transparent
            via-blue-500/50
            to-transparent
          "
        />

        <div
          className="
            relative

            flex
            items-center
            justify-between
            gap-3

            px-4
            sm:px-6
            lg:px-7

            py-2.5
          "
        >
          {/* =====================================================
              LEFT
          ===================================================== */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={onOpenNav}
              className="
                md:hidden

                relative

                w-10
                h-10

                rounded-xl

                grid
                place-items-center
                shrink-0

                bg-gradient-to-br
                from-blue-50
                to-indigo-50

                dark:from-blue-500/10
                dark:to-indigo-500/10

                border
                border-blue-100
                dark:border-blue-500/15

                text-blue-600
                dark:text-blue-400

                shadow-sm

                hover:scale-105
                hover:shadow-md

                transition-all
                duration-200
              "
              aria-label={t('open_menu')}
              title={t('open_menu')}
            >
              <Menu size={20} strokeWidth={2.2} />
            </button>

            {/* Page Heading */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="
                    text-base
                    sm:text-lg

                    font-black
                    tracking-tight

                    bg-gradient-to-r
                    from-slate-900
                    via-blue-700
                    to-indigo-700

                    dark:from-white
                    dark:via-blue-200
                    dark:to-indigo-300

                    bg-clip-text
                    text-transparent

                    truncate
                  "
                >
                  {t('education_saas_dashboard')}
                </h1>

                <span
                  className="
                    hidden
                    lg:inline-flex

                    items-center
                    gap-1

                    px-2
                    py-0.5

                    rounded-full

                    bg-blue-500/10
                    dark:bg-blue-400/10

                    border
                    border-blue-500/10

                    text-[8px]
                    font-bold

                    uppercase
                    tracking-wider

                    text-blue-600
                    dark:text-blue-400
                  "
                >
                  <Sparkles size={9} />
                  Platform
                </span>
              </div>

              <div
                className="
                  mt-0.5

                  text-[11px]
                  sm:text-xs

                  text-slate-500
                  dark:text-slate-400

                  hidden
                  sm:block

                  truncate
                "
              >
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

          {/* =====================================================
              RIGHT CONTROLS
          ===================================================== */}
          <div
            ref={wrapRef}
            className="
              flex
              items-center
              gap-2
              sm:gap-2.5

              shrink-0
            "
          >
            {/* ===================================================
                SEARCH
            =================================================== */}
            <div className="hidden xl:block relative">
              <div className="relative group">
                <input
                  type="text"
                  placeholder={t(
                    'search_courses_skills_candidates'
                  )}
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
                  className="
                    w-[330px]
                    lg:w-[390px]

                    pl-11
                    pr-10

                    py-2.5

                    text-sm

                    rounded-2xl

                    bg-slate-100/70
                    dark:bg-white/[0.045]

                    text-slate-900
                    dark:text-slate-100

                    placeholder-slate-400
                    dark:placeholder-slate-500

                    border
                    border-slate-200/80
                    dark:border-white/[0.08]

                    outline-none

                    focus:bg-white
                    dark:focus:bg-slate-950

                    focus:border-blue-400
                    dark:focus:border-blue-500/40

                    focus:ring-4
                    focus:ring-blue-500/10

                    shadow-sm

                    focus:shadow-[0_8px_28px_rgba(59,130,246,0.10)]

                    transition-all
                    duration-300
                  "
                />

                <Search
                  size={17}
                  strokeWidth={2}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2

                    text-slate-400
                    dark:text-slate-500

                    group-focus-within:text-blue-500

                    transition-colors
                    duration-200
                  "
                />

                {globalSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2

                      w-6
                      h-6

                      rounded-lg

                      grid
                      place-items-center

                      text-slate-400

                      hover:bg-slate-200
                      dark:hover:bg-slate-800

                      hover:text-slate-700
                      dark:hover:text-white

                      transition-colors
                    "
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Search Results */}
              {showSearchResults && (
                <div
                  className="
                    absolute
                    top-full
                    mt-3

                    right-0

                    w-[400px]

                    overflow-hidden

                    rounded-2xl

                    bg-white/95
                    dark:bg-slate-950/95

                    backdrop-blur-2xl

                    border
                    border-slate-200/80
                    dark:border-white/[0.08]

                    shadow-[0_25px_70px_rgba(15,23,42,0.18)]

                    z-50

                    animate-in
                    slide-in-from-top-2
                    fade-in
                    duration-200
                  "
                >
                  {/* Results header */}
                  <div
                    className="
                      px-4
                      py-3

                      border-b
                      border-slate-100
                      dark:border-white/[0.06]

                      bg-gradient-to-r
                      from-blue-50/70
                      to-indigo-50/50

                      dark:from-blue-500/[0.07]
                      dark:to-indigo-500/[0.04]
                    "
                  >
                    <div className="flex items-center gap-2">
                      <Search
                        size={14}
                        className="text-blue-500"
                      />

                      <span
                        className="
                          text-xs
                          font-bold
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
                        Search results
                      </span>

                      {globalSearchQuery && (
                        <span
                          className="
                            ml-auto
                            max-w-[180px]
                            truncate

                            text-[10px]
                            font-semibold

                            px-2
                            py-1

                            rounded-lg

                            bg-white
                            dark:bg-white/[0.06]

                            text-slate-500
                            dark:text-slate-400

                            border
                            border-slate-200
                            dark:border-white/[0.06]
                          "
                        >
                          "{globalSearchQuery}"
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-8 text-center">
                        <div
                          className="
                            mx-auto
                            mb-3

                            w-10
                            h-10

                            rounded-xl

                            grid
                            place-items-center

                            bg-blue-500/10
                            text-blue-500
                          "
                        >
                          <Loader2
                            size={19}
                            className="animate-spin"
                          />
                        </div>

                        <div
                          className="
                            text-sm
                            font-semibold
                            text-slate-600
                            dark:text-slate-300
                          "
                        >
                          {t('searching')}
                        </div>
                      </div>
                    ) : searchResults.members
                        .length === 0 &&
                      searchResults.courses
                        .length === 0 ? (
                      <div className="p-8 text-center">
                        <div
                          className="
                            mx-auto
                            mb-3

                            w-11
                            h-11

                            rounded-2xl

                            grid
                            place-items-center

                            bg-slate-100
                            dark:bg-white/[0.05]

                            text-slate-400
                          "
                        >
                          <Search size={19} />
                        </div>

                        <div
                          className="
                            text-sm
                            font-semibold
                            text-slate-600
                            dark:text-slate-300
                          "
                        >
                          {t('no_results_for')}{' '}
                          "{globalSearchQuery}"
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Members */}
                        {searchResults
                          .members
                          .length > 0 && (
                          <div className="py-2">
                            <div
                              className="
                                px-4
                                pt-2
                                pb-2

                                flex
                                items-center
                                gap-2
                              "
                            >
                              <Users
                                size={13}
                                className="text-blue-500"
                              />

                              <span
                                className="
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-[0.16em]
                                  text-slate-400
                                "
                              >
                                {t('members')}
                              </span>
                            </div>

                            {searchResults.members.map(
                              (member) => (
                                <div
                                  key={
                                    member.id
                                  }
                                  className="
                                    group

                                    px-4
                                    py-2.5

                                    flex
                                    items-center
                                    gap-3

                                    hover:bg-blue-50/70
                                    dark:hover:bg-blue-500/[0.06]

                                    cursor-pointer

                                    transition-colors
                                  "
                                  onClick={() => {
                                    setShowSearchResults(
                                      false
                                    );

                                    navigate(communityRoute);
                                  }}
                                >
                                  <div
                                    className="
                                      relative
                                      shrink-0

                                      w-9
                                      h-9

                                      rounded-xl

                                      bg-gradient-to-br
                                      from-blue-500
                                      via-indigo-500
                                      to-violet-600

                                      text-white

                                      font-bold
                                      text-[10px]

                                      grid
                                      place-items-center

                                      shadow-[0_5px_14px_rgba(79,70,229,0.20)]
                                    "
                                  >
                                    {member.name
                                      .split(' ')
                                      .map(
                                        (n) =>
                                          n[0]
                                      )
                                      .join('')
                                      .substring(
                                        0,
                                        2
                                      )}

                                    <span
                                      className="
                                        absolute
                                        right-[-1px]
                                        bottom-[-1px]

                                        w-2.5
                                        h-2.5

                                        rounded-full

                                        bg-emerald-400

                                        border-2
                                        border-white
                                        dark:border-slate-950
                                      "
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div
                                      className="
                                        text-sm
                                        font-bold

                                        text-slate-800
                                        dark:text-slate-100

                                        truncate
                                      "
                                    >
                                      {member.name}
                                    </div>

                                    <div
                                      className="
                                        text-[10px]

                                        text-slate-500
                                        dark:text-slate-400

                                        truncate
                                      "
                                    >
                                      @
                                      {member.username ||
                                        'user'}{' '}
                                      •{' '}
                                      {member
                                        .role
                                        ?.name ||
                                        member.role ||
                                        t(
                                          'student'
                                        )}
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
                                            member.id
                                          ],
                                          e
                                        )
                                      }
                                      className="
                                        shrink-0

                                        px-3
                                        py-1.5

                                        rounded-lg

                                        bg-slate-100
                                        dark:bg-white/[0.06]

                                        border
                                        border-slate-200
                                        dark:border-white/[0.07]

                                        text-slate-600
                                        dark:text-slate-300

                                        text-[10px]
                                        font-bold

                                        hover:bg-slate-200
                                        dark:hover:bg-white/[0.10]

                                        transition-all
                                      "
                                    >
                                      {t(
                                        'remove_request'
                                      )}
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
                                      className="
                                        shrink-0

                                        flex
                                        items-center
                                        gap-1

                                        px-3
                                        py-1.5

                                        rounded-lg

                                        bg-gradient-to-r
                                        from-blue-500
                                        to-indigo-600

                                        text-white

                                        text-[10px]
                                        font-bold

                                        shadow-[0_4px_12px_rgba(59,130,246,0.20)]

                                        hover:shadow-[0_6px_16px_rgba(59,130,246,0.30)]

                                        hover:-translate-y-0.5

                                        transition-all
                                      "
                                    >
                                      <UserPlus
                                        size={11}
                                      />

                                      {t(
                                        'connect'
                                      )}
                                    </button>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* Courses */}
                        {searchResults
                          .courses
                          .length > 0 && (
                          <div
                            className="
                              py-2

                              border-t
                              border-slate-100
                              dark:border-white/[0.06]
                            "
                          >
                            <div
                              className="
                                px-4
                                pt-2
                                pb-2

                                flex
                                items-center
                                gap-2
                              "
                            >
                              <BookOpen
                                size={13}
                                className="text-violet-500"
                              />

                              <span
                                className="
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-[0.16em]
                                  text-slate-400
                                "
                              >
                                {t('courses')}
                              </span>
                            </div>

                            {searchResults.courses.map(
                              (course) => (
                                <div
                                  key={
                                    course.id
                                  }
                                  className="
                                    group

                                    px-4
                                    py-2.5

                                    flex
                                    items-center
                                    gap-3

                                    hover:bg-violet-50/60
                                    dark:hover:bg-violet-500/[0.06]

                                    cursor-pointer

                                    transition-colors
                                  "
                                  onClick={() => {
                                    setShowSearchResults(
                                      false
                                    );

                                    navigate(
                                      `/app/learning/${course.id}`
                                    );
                                  }}
                                >
                                  <div
                                    className="
                                      w-9
                                      h-9

                                      rounded-xl

                                      grid
                                      place-items-center

                                      bg-gradient-to-br
                                      from-violet-500
                                      to-indigo-600

                                      text-white

                                      shadow-[0_5px_14px_rgba(139,92,246,0.20)]
                                    "
                                  >
                                    <BookOpen
                                      size={16}
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div
                                      className="
                                        text-sm
                                        font-bold

                                        text-slate-800
                                        dark:text-slate-100

                                        truncate
                                      "
                                    >
                                      {
                                        course.title
                                      }
                                    </div>

                                    <div
                                      className="
                                        text-[10px]

                                        text-slate-500
                                        dark:text-slate-400

                                        truncate
                                      "
                                    >
                                      {course.provider ||
                                        'EDU-SAAS'}
                                    </div>
                                  </div>

                                  <ArrowRight
                                    size={14}
                                    className="
                                      text-slate-300
                                      dark:text-slate-600

                                      group-hover:text-violet-500

                                      group-hover:translate-x-0.5

                                      transition-all
                                    "
                                  />
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

            {/* ===================================================
                NOTIFICATIONS
            =================================================== */}
            <div className="relative">
              <button
                type="button"
                onClick={handleBellClick}
                className="
                  relative

                  w-10
                  h-10

                  rounded-xl

                  grid
                  place-items-center

                  bg-slate-100/80
                  dark:bg-white/[0.045]

                  border
                  border-slate-200/80
                  dark:border-white/[0.08]

                  text-slate-600
                  dark:text-slate-300

                  hover:bg-blue-50
                  dark:hover:bg-blue-500/10

                  hover:text-blue-600
                  dark:hover:text-blue-400

                  hover:border-blue-200
                  dark:hover:border-blue-500/20

                  hover:scale-105

                  shadow-sm

                  transition-all
                  duration-200
                "
                aria-label={t('notifications')}
                title={t('notifications')}
              >
                <Bell
                  size={18}
                  strokeWidth={2}
                />

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-1
                      -right-1

                      min-w-[17px]
                      h-[17px]

                      px-1

                      text-[9px]
                      font-black

                      bg-gradient-to-br
                      from-red-500
                      to-rose-600

                      text-white

                      rounded-full

                      grid
                      place-items-center

                      border-2
                      border-white
                      dark:border-[#070b16]

                      shadow-[0_3px_10px_rgba(239,68,68,0.40)]

                      animate-pulse
                    "
                  >
                    {unreadCount > 99
                      ? '99+'
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {openNotif && (
                <div
                  className="
                    absolute
                    right-0
                    mt-3

                    w-72
                    sm:w-96

                    overflow-hidden

                    rounded-2xl

                    bg-white/95
                    dark:bg-slate-950/95

                    backdrop-blur-2xl

                    border
                    border-slate-200/80
                    dark:border-white/[0.08]

                    shadow-[0_25px_70px_rgba(15,23,42,0.18)]

                    animate-in
                    slide-in-from-top-2
                    fade-in
                    duration-200
                  "
                >
                  {/* Notification Header */}
                  <div
                    className="
                      relative

                      px-4
                      py-3.5

                      border-b
                      border-slate-100
                      dark:border-white/[0.06]

                      bg-gradient-to-r
                      from-blue-50/70
                      via-indigo-50/40
                      to-transparent

                      dark:from-blue-500/[0.08]
                      dark:via-indigo-500/[0.04]
                      dark:to-transparent
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="
                          w-8
                          h-8

                          rounded-xl

                          grid
                          place-items-center

                          bg-gradient-to-br
                          from-blue-500
                          to-indigo-600

                          text-white

                          shadow-[0_5px_15px_rgba(59,130,246,0.25)]
                        "
                      >
                        <Bell size={15} />
                      </div>

                      <div>
                        <div
                          className="
                            text-sm
                            font-bold

                            text-slate-800
                            dark:text-white
                          "
                        >
                          {t('notifications')}
                        </div>

                        <div
                          className="
                            text-[9px]

                            text-slate-400
                            dark:text-slate-500
                          "
                        >
                          Stay updated with your activity
                        </div>
                      </div>

                      {notifications.length >
                        5 &&
                        displayLimit === 5 && (
                          <span
                            className="
                              ml-auto

                              text-[9px]
                              font-bold

                              px-2
                              py-1

                              rounded-lg

                              bg-white
                              dark:bg-white/[0.06]

                              border
                              border-slate-200
                              dark:border-white/[0.06]

                              text-slate-500
                              dark:text-slate-400
                            "
                          >
                            {t('latest_5')}
                          </span>
                        )}
                    </div>
                  </div>

                  <ul className="max-h-80 overflow-y-auto">
                    {notificationsLoading ? (
                      <li className="px-4 py-10 text-center">
                        <Loader2
                          size={22}
                          className="
                            mx-auto
                            mb-2

                            text-blue-500

                            animate-spin
                          "
                        />

                        <div
                          className="
                            text-xs
                            font-semibold
                            text-slate-400
                          "
                        >
                          {t(
                            'loading_notifications'
                          )}
                        </div>
                      </li>
                    ) : notificationsError ? (
                      <li className="px-4 py-10 text-center">
                        <AlertCircle
                          size={22}
                          className="
                            mx-auto
                            mb-2
                            text-red-400
                          "
                        />

                        <div
                          className="
                            text-xs
                            font-semibold
                            text-red-500
                          "
                        >
                          {notificationsError}
                        </div>
                      </li>
                    ) : visibleNotifications.length ===
                      0 ? (
                      <li className="px-4 py-10 text-center">
                        <div
                          className="
                            mx-auto
                            mb-3

                            w-11
                            h-11

                            rounded-2xl

                            grid
                            place-items-center

                            bg-slate-100
                            dark:bg-white/[0.05]

                            text-slate-400
                          "
                        >
                          <Bell size={18} />
                        </div>

                        <div
                          className="
                            text-xs
                            font-semibold
                            text-slate-400
                          "
                        >
                          {t(
                            'no_notifications'
                          )}
                        </div>
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
                            className={`
                              group

                              relative

                              px-4
                              py-3.5

                              border-b
                              border-slate-100
                              dark:border-white/[0.05]

                              cursor-pointer

                              transition-all

                              ${
                                !n.read_status
                                  ? `
                                    bg-blue-50/70
                                    dark:bg-blue-500/[0.07]

                                    hover:bg-blue-100/70
                                    dark:hover:bg-blue-500/[0.11]
                                  `
                                  : `
                                    hover:bg-slate-50
                                    dark:hover:bg-white/[0.035]
                                  `
                              }
                            `}
                          >
                            {/* unread indicator */}
                            {!n.read_status && (
                              <span
                                className="
                                  absolute
                                  left-0
                                  top-3.5

                                  w-[3px]
                                  h-8

                                  rounded-r-full

                                  bg-gradient-to-b
                                  from-blue-400
                                  to-indigo-600
                                "
                              />
                            )}

                            <div className="flex gap-3">
                              <div
                                className={`
                                  shrink-0

                                  w-8
                                  h-8

                                  rounded-xl

                                  grid
                                  place-items-center

                                  ${
                                    !n.read_status
                                      ? `
                                        bg-blue-500/10
                                        text-blue-500
                                      `
                                      : `
                                        bg-slate-100
                                        dark:bg-white/[0.05]

                                        text-slate-400
                                      `
                                  }
                                `}
                              >
                                <Bell size={14} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div
                                  className="
                                    text-xs
                                    leading-relaxed

                                    text-slate-700
                                    dark:text-slate-200
                                  "
                                >
                                  {n.message}
                                </div>

                                <div
                                  className="
                                    mt-1

                                    text-[9px]

                                    text-slate-400
                                    dark:text-slate-500
                                  "
                                >
                                  {n.created_at
                                    ? new Date(
                                        n.created_at
                                      ).toLocaleString()
                                    : ''}
                                </div>
                              </div>

                              {!n.read_status && (
                                <span
                                  className="
                                    shrink-0

                                    w-1.5
                                    h-1.5

                                    mt-1

                                    rounded-full

                                    bg-blue-500

                                    shadow-[0_0_8px_rgba(59,130,246,0.7)]
                                  "
                                />
                              )}
                            </div>
                          </li>
                        )
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* ===================================================
                PROFILE
            =================================================== */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(
                    (v) => !v
                  );
                  setOpenNotif(false);
                }}
                className="
                  group

                  flex
                  items-center
                  gap-2

                  pl-1
                  pr-1.5
                  sm:pr-2

                  py-1

                  rounded-2xl

                  border
                  border-transparent

                  hover:border-slate-200
                  dark:hover:border-white/[0.08]

                  hover:bg-slate-50
                  dark:hover:bg-white/[0.04]

                  transition-all
                  duration-200
                "
                aria-label={t('profile')}
              >
                {/* Avatar */}
                <div className="relative">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={displayName}
                      onError={() =>
                        setAvatarErr(
                          true
                        )
                      }
                      className="
                        w-9
                        h-9

                        rounded-xl

                        object-cover

                        border
                        border-white
                        dark:border-white/10

                        shadow-[0_4px_14px_rgba(15,23,42,0.12)]

                        group-hover:scale-105

                        transition-transform
                        duration-200
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-9
                        h-9

                        rounded-xl

                        bg-gradient-to-br
                        from-blue-500
                        via-indigo-600
                        to-violet-600

                        text-white

                        grid
                        place-items-center

                        font-black
                        text-xs

                        border
                        border-white/20

                        shadow-[0_5px_16px_rgba(79,70,229,0.25)]

                        group-hover:scale-105

                        transition-transform
                        duration-200
                      "
                    >
                      {initials(
                        displayName
                      )}
                    </div>
                  )}

                  {/* Online */}
                  <span
                    className="
                      absolute
                      right-[-1px]
                      bottom-[-1px]

                      w-2.5
                      h-2.5

                      rounded-full

                      bg-emerald-400

                      border-2
                      border-white
                      dark:border-[#070b16]

                      shadow-[0_0_8px_rgba(52,211,153,0.65)]
                    "
                  />
                </div>

                {/* User information */}
                <div className="text-left hidden sm:block max-w-[100px]">
                  <div
                    className="
                      text-xs
                      font-bold

                      text-slate-800
                      dark:text-slate-100

                      leading-tight

                      truncate
                    "
                  >
                    {firstName}
                  </div>

                  <div
                    className="
                      mt-0.5

                      text-[9px]

                      text-slate-400
                      dark:text-slate-500

                      leading-tight

                      truncate
                    "
                  >
                    {displayRole}
                  </div>
                </div>

                <ChevronDown
                  size={14}
                  className={`
                    hidden
                    sm:block

                    text-slate-400

                    transition-transform
                    duration-200

                    ${
                      openMenu
                        ? 'rotate-180'
                        : ''
                    }
                  `}
                />
              </button>

              {/* =================================================
                  PROFILE MENU
              ================================================= */}
              {openMenu && (
                <div
                  className="
                    absolute
                    right-0
                    mt-3

                    w-60

                    overflow-hidden

                    rounded-2xl

                    bg-white/95
                    dark:bg-slate-950/95

                    backdrop-blur-2xl

                    border
                    border-slate-200/80
                    dark:border-white/[0.08]

                    shadow-[0_25px_70px_rgba(15,23,42,0.18)]

                    animate-in
                    slide-in-from-top-2
                    fade-in
                    duration-200
                  "
                >
                  {/* Profile Header */}
                  <div
                    className="
                      relative

                      px-4
                      py-4

                      bg-gradient-to-br
                      from-blue-50
                      via-indigo-50/60
                      to-violet-50

                      dark:from-blue-500/[0.10]
                      dark:via-indigo-500/[0.06]
                      dark:to-violet-500/[0.08]

                      border-b
                      border-slate-100
                      dark:border-white/[0.06]
                    "
                  >
                    <div className="flex items-center gap-3">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={displayName}
                          className="
                            w-11
                            h-11

                            rounded-xl

                            object-cover

                            border
                            border-white
                            dark:border-white/10

                            shadow-md
                          "
                        />
                      ) : (
                        <div
                          className="
                            w-11
                            h-11

                            rounded-xl

                            bg-gradient-to-br
                            from-blue-500
                            to-violet-600

                            text-white

                            grid
                            place-items-center

                            font-black
                            text-sm

                            shadow-[0_6px_18px_rgba(79,70,229,0.25)]
                          "
                        >
                          {initials(
                            displayName
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div
                          className="
                            text-sm
                            font-bold

                            text-slate-800
                            dark:text-white

                            truncate
                          "
                        >
                          {displayName}
                        </div>

                        <div
                          className="
                            mt-0.5

                            text-[10px]

                            text-blue-600
                            dark:text-blue-400

                            font-semibold
                          "
                        >
                          {displayRole}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
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
                      className="
                        group

                        w-full

                        flex
                        items-center
                        gap-3

                        px-3
                        py-2.5

                        rounded-xl

                        text-left

                        text-sm

                        text-slate-700
                        dark:text-slate-200

                        hover:bg-blue-50
                        dark:hover:bg-blue-500/[0.08]

                        transition-colors
                      "
                    >
                      <span
                        className="
                          w-8
                          h-8

                          rounded-lg

                          grid
                          place-items-center

                          bg-slate-100
                          dark:bg-white/[0.05]

                          text-slate-500
                          dark:text-slate-400

                          group-hover:bg-blue-500/10
                          group-hover:text-blue-500

                          transition-colors
                        "
                      >
                        <UserRound
                          size={15}
                        />
                      </span>

                      <span className="flex-1 font-semibold">
                        {t('my_profile')}
                      </span>

                      <ArrowRight
                        size={13}
                        className="
                          text-slate-300
                          dark:text-slate-700

                          group-hover:text-blue-500

                          transition-colors
                        "
                      />
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
                      className="
                        group

                        w-full

                        flex
                        items-center
                        gap-3

                        px-3
                        py-2.5

                        rounded-xl

                        text-left

                        text-sm

                        text-slate-700
                        dark:text-slate-200

                        hover:bg-indigo-50
                        dark:hover:bg-indigo-500/[0.08]

                        transition-colors
                      "
                    >
                      <span
                        className="
                          w-8
                          h-8

                          rounded-lg

                          grid
                          place-items-center

                          bg-slate-100
                          dark:bg-white/[0.05]

                          text-slate-500
                          dark:text-slate-400

                          group-hover:bg-indigo-500/10
                          group-hover:text-indigo-500

                          transition-colors
                        "
                      >
                        <Settings
                          size={15}
                        />
                      </span>

                      <span className="flex-1 font-semibold">
                        {t('settings')}
                      </span>

                      <ArrowRight
                        size={13}
                        className="
                          text-slate-300
                          dark:text-slate-700

                          group-hover:text-indigo-500

                          transition-colors
                        "
                      />
                    </button>

                    <div
                      className="
                        my-1.5
                        h-px

                        bg-slate-100
                        dark:bg-white/[0.06]
                      "
                    />

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate(
                          '/login'
                        );
                      }}
                      className="
                        group

                        w-full

                        flex
                        items-center
                        gap-3

                        px-3
                        py-2.5

                        rounded-xl

                        text-left

                        text-sm

                        text-red-500

                        hover:bg-red-50
                        dark:hover:bg-red-500/[0.08]

                        transition-colors
                      "
                    >
                      <span
                        className="
                          w-8
                          h-8

                          rounded-lg

                          grid
                          place-items-center

                          bg-red-50
                          dark:bg-red-500/10

                          text-red-500
                        "
                      >
                        <LogOut
                          size={15}
                        />
                      </span>

                      <span className="flex-1 font-semibold">
                        {t('logout')}
                      </span>

                      <ArrowRight
                        size={13}
                        className="
                          text-red-300

                          group-hover:text-red-500

                          transition-colors
                        "
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}