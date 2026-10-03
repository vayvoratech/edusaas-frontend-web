import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import './profile-premium.css';

import {
  getUserProfile,
  updateUserName,
  fetchGapReport,
  saveUserProfile,
  uploadProfileResume,
  uploadProfileAvatar,
  deleteProfileAvatar,
  resolveAssetUrl,
  getMyEnrollments,
  getCourses,
  getMyAchievements,
  getMyCertificates,
  getMyRecommendations,
  getEducatorDashboard,
  getAnnouncements,
  getJobs,
  getEmployerDashboard,
  getInsights,
  getAllUsers,
} from '../services/api';

/* =========================================================
   HELPERS
========================================================= */

const initials = (name = '') => {
  const value = String(name || '').trim();

  if (!value) return 'U';

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
};

const cap = (value = '') => {
  if (!value) return '';
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
};

const AVATAR_PALETTES = [
  'linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)',
  'linear-gradient(135deg,#0f766e 0%,#2563eb 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#db2777 100%)',
  'linear-gradient(135deg,#ea580c 0%,#eab308 100%)',
  'linear-gradient(135deg,#0891b2 0%,#4f46e5 100%)',
  'linear-gradient(135deg,#059669 0%,#0f766e 100%)',
  'linear-gradient(135deg,#be123c 0%,#7c3aed 100%)',
  'linear-gradient(135deg,#1d4ed8 0%,#0f766e 100%)',
];

const getAvatarStyle = (name = '') => {
  const text = String(name || 'User');

  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

const formatDate = (date) => {
  if (!date) return 'Recent';

  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recent';
  }
};

const normalizeArray = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }

  return [];
};

/* =========================================================
   ICONS
========================================================= */

const Icon = ({ name, size = 20, className = '' }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  };

  const icons = {
    user: (
      <svg {...common}>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),

    edit: (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
    ),

    camera: (
      <svg {...common}>
        <path d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3Z" />
        <circle cx="12" cy="12.5" r="3.5" />
      </svg>
    ),

    shield: (
      <svg {...common}>
        <path d="M12 3 20 6v5c0 5-3.3 8.7-8 10-4.7-1.3-8-5-8-10V6Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),

    mail: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),

    building: (
      <svg {...common}>
        <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
        <path d="M16 9h2a2 2 0 0 1 2 2v10" />
        <path d="M8 7h4M8 11h4M8 15h4M10 21v-3h4v3" />
      </svg>
    ),

    briefcase: (
      <svg {...common}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18M10 12v2h4v-2" />
      </svg>
    ),

    target: (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),

    map: (
      <svg {...common}>
        <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3Z" />
        <path d="M9 3v15M15 6v15" />
      </svg>
    ),

    globe: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.3 3 14.7 0 18M12 3c-3 3.3-3 14.7 0 18" />
      </svg>
    ),

    book: (
      <svg {...common}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21Z" />
        <path d="M4 5.5v15M8 7h8M8 11h8" />
      </svg>
    ),

    award: (
      <svg {...common}>
        <circle cx="12" cy="8" r="5" />
        <path d="m8.5 12.5-1 8 4.5-2.5 4.5 2.5-1-8" />
      </svg>
    ),

    certificate: (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h4" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),

    chart: (
      <svg {...common}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),

    users: (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    megaphone: (
      <svg {...common}>
        <path d="m3 11 14-5v12L3 13Z" />
        <path d="M17 10a4 4 0 0 1 0 4M6 14l2 6h3l-2-6" />
        <path d="M21 8v8" />
      </svg>
    ),

    settings: (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2h.84A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.42-1.42.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.39 6.5V6h2v.5a1.7 1.7 0 0 0 1.03 1.54 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 11a1.7 1.7 0 0 0 1.56 1.03H22v2h-1.04A1.7 1.7 0 0 0 19.4 15Z" />
      </svg>
    ),

    arrow: (
      <svg {...common}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    ),

    file: (
      <svg {...common}>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h5M9 13h6M9 17h6M9 9h2" />
      </svg>
    ),

    check: (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    ),

    close: (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    ),

    location: (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),

    sparkles: (
      <svg {...common}>
        <path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2Z" />
        <path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6Z" />
      </svg>
    ),
  };

  return icons[name] || icons.user;
};

/* =========================================================
   SMALL UI HELPERS
========================================================= */

const SectionSkeleton = ({ lines = 3 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded-full bg-slate-200 w-2/3" />
          <div className="h-2.5 rounded-full bg-slate-100 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ icon, title, action }) => (
  <div className="py-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
    <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-slate-200 shadow-sm grid place-items-center text-slate-500">
      {typeof icon === 'string' ? (
        <span className="text-xl">{icon}</span>
      ) : (
        icon
      )}
    </div>

    <p className="mt-3 text-sm font-medium text-slate-600">{title}</p>

    {action}
  </div>
);

const GlassCard = ({ children, className = '' }) => (
  <div
    className={[
      'profile-glass relative overflow-hidden rounded-3xl',
      className,
    ].join(' ')}
  >
    {children}
  </div>
);

const StatCard = ({ icon, label, value, description, tone = 'blue' }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-violet-50 text-violet-600 border-violet-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/40">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-10 h-10 rounded-xl border grid place-items-center ${tones[tone] || tones.blue}`}
        >
          {icon}
        </div>

        <div className="text-right min-w-0">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </div>
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
};

const QuickAction = ({
  to,
  icon,
  title,
  description,
  tone = 'blue',
}) => {
  const tones = {
    blue: {
      box: 'bg-blue-50 text-blue-600 border-blue-100',
      hover: 'group-hover:text-blue-700',
    },
    emerald: {
      box: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      hover: 'group-hover:text-emerald-700',
    },
    purple: {
      box: 'bg-violet-50 text-violet-600 border-violet-100',
      hover: 'group-hover:text-violet-700',
    },
    amber: {
      box: 'bg-amber-50 text-amber-600 border-amber-100',
      hover: 'group-hover:text-amber-700',
    },
  };

  const current = tones[tone] || tones.blue;

  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-11 h-11 rounded-xl border grid place-items-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${current.box}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div
            className={`text-sm font-semibold text-slate-800 transition-colors ${current.hover}`}
          >
            {title}
          </div>
          <div className="mt-0.5 text-xs leading-5 text-slate-500">
            {description}
          </div>
        </div>
      </div>

      <Icon
        name="arrow"
        size={16}
        className="text-slate-300 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-slate-600"
      />
    </Link>
  );
};

/* =========================================================
   PROFILE COMPONENT
========================================================= */

export default function Profile() {
  const { user, updateAuthUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [gap, setGap] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certs, setCerts] = useState([]);
  const [recs, setRecs] = useState([]);
  const [educatorStats, setEducatorStats] = useState(null);
  const [employerStats, setEmployerStats] = useState(null);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [adminInsights, setAdminInsights] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [editing, setEditing] = useState(false);

  const [draft, setDraft] = useState({
    career_goal: '',
    institution: '',
    company: '',
    specialization: '',
    title: '',
    bio: '',
    industry: '',
    location: '',
    website: '',
    about_company: '',
    department: '',
    clearance: '',
    office_location: '',
    admin_scope: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  const [loading, setLoading] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const fileInputRef = useRef(null);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('edu_user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const targetUserId = storedUser?.id || user?.id;

  const userRole = (
    profile?.role ||
    storedUser?.role ||
    user?.role ||
    'student'
  ).toLowerCase();

  const isEducator = userRole === 'educator';
  const isEmployer = userRole === 'employer';
  const isAdmin = userRole === 'admin';

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    if (!targetUserId) {
      setLoading(false);
      return undefined;
    }

    const handleProfileLoaded = (data) => {
      if (cancelled || !data) return;

      setProfile(data);

      const nextName =
        data?.name ||
        data?.full_name ||
        data?.username ||
        storedUser?.name ||
        user?.fullName ||
        'User';

      if (typeof updateAuthUser === 'function') {
        updateAuthUser({
          name: nextName,
          role: data?.role || userRole,
          avatar_url:
            data?.avatar_url ||
            data?.profile?.avatar_url ||
            data?.profile?.preferences?.avatar_url ||
            null,
        });
      }
    };

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isAdmin) {
          const results = await Promise.allSettled([
            getUserProfile(targetUserId),
            getInsights(),
            getAllUsers(),
            getAnnouncements(),
          ]);

          if (cancelled) return;

          const [profileResult, insightsResult, usersResult, announcementsResult] =
            results;

          if (profileResult.status === 'fulfilled') {
            handleProfileLoaded(profileResult.value);
          }

          if (insightsResult.status === 'fulfilled') {
            setAdminInsights(insightsResult.value);
          }

          if (usersResult.status === 'fulfilled') {
            setAdminUsers(
              normalizeArray(usersResult.value, ['users', 'results'])
            );
          }

          if (announcementsResult.status === 'fulfilled') {
            setAnnouncements(
              normalizeArray(announcementsResult.value, ['announcements', 'results'])
            );
          }

          return;
        }

        if (isEducator) {
          const results = await Promise.allSettled([
            getUserProfile(targetUserId),
            getCourses(),
            getEducatorDashboard(),
            getAnnouncements(),
          ]);

          if (cancelled) return;

          const [
            profileResult,
            coursesResult,
            educatorResult,
            announcementsResult,
          ] = results;

          if (profileResult.status === 'fulfilled') {
            handleProfileLoaded(profileResult.value);
          }

          if (coursesResult.status === 'fulfilled') {
            setCourses(
              normalizeArray(coursesResult.value, ['courses', 'results'])
            );
          }

          if (educatorResult.status === 'fulfilled') {
            setEducatorStats(educatorResult.value);
          }

          if (announcementsResult.status === 'fulfilled') {
            setAnnouncements(
              normalizeArray(announcementsResult.value, ['announcements', 'results'])
            );
          }

          return;
        }

        if (isEmployer) {
          const results = await Promise.allSettled([
            getUserProfile(targetUserId),
            getJobs({ employer_id: targetUserId }),
            getEmployerDashboard(),
            getAnnouncements(),
          ]);

          if (cancelled) return;

          const [
            profileResult,
            jobsResult,
            employerResult,
            announcementsResult,
          ] = results;

          if (profileResult.status === 'fulfilled') {
            handleProfileLoaded(profileResult.value);
          }

          if (jobsResult.status === 'fulfilled') {
            setEmployerJobs(
              normalizeArray(jobsResult.value, ['jobs', 'results'])
            );
          }

          if (employerResult.status === 'fulfilled') {
            setEmployerStats(employerResult.value);
          }

          if (announcementsResult.status === 'fulfilled') {
            setAnnouncements(
              normalizeArray(announcementsResult.value, ['announcements', 'results'])
            );
          }

          return;
        }

        const results = await Promise.allSettled([
          getUserProfile(targetUserId),
          fetchGapReport(targetUserId),
          getMyEnrollments(),
          getCourses(),
          getMyAchievements(),
          getMyCertificates(),
          getMyRecommendations(),
          getAnnouncements(),
        ]);

        if (cancelled) return;

        const [
          profileResult,
          gapResult,
          enrollmentsResult,
          coursesResult,
          achievementsResult,
          certificatesResult,
          recommendationsResult,
          announcementsResult,
        ] = results;

        if (profileResult.status === 'fulfilled') {
          handleProfileLoaded(profileResult.value);
        }

        if (gapResult.status === 'fulfilled') {
          setGap(gapResult.value);
        }

        if (enrollmentsResult.status === 'fulfilled') {
          setEnrollments(
            normalizeArray(enrollmentsResult.value, [
              'enrollments',
              'results',
            ])
          );
        }

        if (coursesResult.status === 'fulfilled') {
          setCourses(
            normalizeArray(coursesResult.value, ['courses', 'results'])
          );
        }

        if (achievementsResult.status === 'fulfilled') {
          setAchievements(
            normalizeArray(achievementsResult.value, [
              'achievements',
              'results',
            ])
          );
        }

        if (certificatesResult.status === 'fulfilled') {
          setCerts(
            normalizeArray(certificatesResult.value, [
              'certificates',
              'results',
            ])
          );
        }

        if (recommendationsResult.status === 'fulfilled') {
          setRecs(
            normalizeArray(recommendationsResult.value, [
              'recommendations',
              'results',
            ])
          );
        }

        if (announcementsResult.status === 'fulfilled') {
          setAnnouncements(
            normalizeArray(announcementsResult.value, [
              'announcements',
              'results',
            ])
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
              err?.message ||
              'Failed to load profile.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [targetUserId, isAdmin, isEducator, isEmployer, storedUser?.name, updateAuthUser, user?.fullName, userRole]);

  /* =========================================================
     DRAFT
  ========================================================= */

  useEffect(() => {
    if (!profile) return;

    const source = profile?.profile || {};
    const preferences = source?.preferences || profile?.preferences || {};

    setDraft({
      career_goal:
        source?.career_goal ||
        preferences?.career_goal ||
        profile?.career_goal ||
        '',

      institution:
        source?.institution ||
        preferences?.institution ||
        profile?.institution ||
        '',

      company:
        source?.company ||
        preferences?.company ||
        profile?.company ||
        '',

      specialization:
        source?.specialization ||
        preferences?.specialization ||
        profile?.specialization ||
        '',

      title:
        source?.title ||
        preferences?.title ||
        profile?.title ||
        '',

      bio:
        source?.bio ||
        preferences?.bio ||
        profile?.bio ||
        '',

      industry:
        source?.industry ||
        preferences?.industry ||
        profile?.industry ||
        '',

      location:
        source?.location ||
        preferences?.location ||
        profile?.location ||
        '',

      website:
        source?.website ||
        preferences?.website ||
        profile?.website ||
        '',

      about_company:
        source?.about_company ||
        preferences?.about_company ||
        profile?.about_company ||
        '',

      department:
        source?.department ||
        preferences?.department ||
        profile?.department ||
        '',

      clearance:
        source?.clearance ||
        preferences?.clearance ||
        profile?.clearance ||
        '',

      office_location:
        source?.office_location ||
        preferences?.office_location ||
        profile?.office_location ||
        '',

      admin_scope:
        source?.admin_scope ||
        preferences?.admin_scope ||
        profile?.admin_scope ||
        '',
    });
  }, [profile]);

  /* =========================================================
     MODAL BODY LOCK
  ========================================================= */

  useEffect(() => {
    if (!editing) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setEditing(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editing]);

  /* =========================================================
     RESUME
  ========================================================= */

  const onResumeUpload = async () => {
    if (!resumeFile || !targetUserId) return;

    setResumeUploading(true);
    setError(null);

    try {
      const result = await uploadProfileResume(targetUserId, resumeFile);

      setProfile((previous) => ({
        ...previous,
        profile: {
          ...(previous?.profile || {}),
          resume: result?.resume || result?.data?.resume,
        },
      }));

      setResumeFile(null);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Failed to upload resume.'
      );
    } finally {
      setResumeUploading(false);
    }
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const onSave = async (event) => {
    event.preventDefault();

    if (!targetUserId) return;

    setSaving(true);
    setError(null);

    try {
      const result = await saveUserProfile(targetUserId, draft);

      const savedProfile =
        result?.profile ||
        result?.data?.profile ||
        result;

      setProfile((previous) => ({
        ...(previous || {}),
        profile: savedProfile,
      }));

      setEditing(false);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Failed to save profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     NAME
  ========================================================= */

  const startNameEditing = () => {
    setNameDraft(display.name);
    setNameError(null);
    setIsEditingName(true);
  };

  const cancelNameEditing = () => {
    setIsEditingName(false);
    setNameDraft(display.name);
    setNameError(null);
  };

  const onSaveName = async (event) => {
    event.preventDefault();

    const nextName = String(nameDraft || '').trim();

    if (!nextName) {
      setNameError('Name cannot be empty.');
      return;
    }

    if (!targetUserId) return;

    setSavingName(true);
    setNameError(null);

    try {
      const result = await updateUserName(targetUserId, nextName);

      const updatedName =
        result?.name ||
        result?.data?.name ||
        result?.user?.name ||
        nextName;

      setProfile((previous) => ({
        ...(previous || {}),
        name: updatedName,
      }));

      if (typeof updateAuthUser === 'function') {
        updateAuthUser({
          name: updatedName,
        });
      } else {
        try {
          const current = JSON.parse(
            localStorage.getItem('edu_user') || '{}'
          );

          localStorage.setItem(
            'edu_user',
            JSON.stringify({
              ...current,
              name: updatedName,
            })
          );

          window.dispatchEvent(new Event('edu_user_updated'));
        } catch {
          // Best effort local update.
        }
      }

      try {
        if (typeof user?.reload === 'function') {
          await user.reload();
        }
      } catch {
        // Best effort Clerk refresh.
      }

      setIsEditingName(false);
    } catch (err) {
      setNameError(
        err?.response?.data?.error ||
          err?.message ||
          'Failed to update name.'
      );
    } finally {
      setSavingName(false);
    }
  };

  /* =========================================================
     AVATAR
  ========================================================= */

  const onAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !targetUserId) return;

    setAvatarError(null);

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    setAvatarUploading(true);
    setImageLoadFailed(false);

    try {
      const result = await uploadProfileAvatar(targetUserId, file);

      const newUrl =
        result?.avatar_url ||
        result?.data?.avatar_url ||
        result?.avatar ||
        result?.data?.avatar;

      if (!newUrl) {
        throw new Error('Avatar URL was not returned by the server.');
      }

      setProfile((previous) => {
        const previousProfile = previous?.profile || {};
        const previousPreferences =
          previousProfile?.preferences ||
          previous?.preferences ||
          {};

        return {
          ...(previous || {}),
          avatar_url: newUrl,
          profile: {
            ...previousProfile,
            avatar_url: newUrl,
            preferences: {
              ...previousPreferences,
              avatar_url: newUrl,
            },
          },
        };
      });

      if (typeof updateAuthUser === 'function') {
        updateAuthUser({
          avatar_url: newUrl,
          avatar: newUrl,
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setAvatarError(
        err?.response?.data?.error ||
          err?.message ||
          'Failed to upload profile photo.'
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const onRemoveAvatar = async () => {
    if (!targetUserId) return;

    setAvatarUploading(true);
    setAvatarError(null);

    try {
      await deleteProfileAvatar(targetUserId);

      setProfile((previous) => {
        const previousProfile = previous?.profile || {};
        const previousPreferences =
          previousProfile?.preferences ||
          previous?.preferences ||
          {};

        const {
          avatar_url: _profileAvatar,
          ...profileWithoutAvatar
        } = previousProfile;

        const {
          avatar_url: _preferenceAvatar,
          ...preferencesWithoutAvatar
        } = previousPreferences;

        return {
          ...(previous || {}),
          avatar_url: null,
          profile: {
            ...profileWithoutAvatar,
            avatar_url: null,
            preferences: preferencesWithoutAvatar,
          },
        };
      });

      setImageLoadFailed(false);

      if (typeof updateAuthUser === 'function') {
        updateAuthUser({
          avatar_url: null,
          avatar: null,
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setAvatarError(
        err?.response?.data?.error ||
          err?.message ||
          'Failed to remove profile photo.'
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  /* =========================================================
     DISPLAY DATA
  ========================================================= */

  const rawEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    user?.email ||
    profile?.email ||
    storedUser?.email ||
    '';

  const rawUsername =
    profile?.username ||
    user?.username ||
    storedUser?.username ||
    (rawEmail ? rawEmail.split('@')[0] : 'user');

  const rawName =
    profile?.name && profile.name.trim().toLowerCase() !== 'user'
      ? profile.name
      : profile?.full_name ||
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
        user?.name ||
        storedUser?.name ||
        rawUsername ||
        'User';
  const formattedUsername = String(rawUsername || 'user').startsWith('@')
    ? String(rawUsername)
    : `@${rawUsername}`;

  const profilePreferences =
    profile?.profile?.preferences ||
    profile?.preferences ||
    {};

  const avatarUrl =
    profile?.avatar_url ||
    profile?.profile?.avatar_url ||
    profilePreferences?.avatar_url ||
    user?.avatar_url ||
    user?.imageUrl ||
    storedUser?.avatar_url ||
    storedUser?.avatar ||
    null;

  const resolvedAvatarUrl = avatarUrl
    ? resolveAssetUrl(avatarUrl)
    : null;

  const prefs = profile?.profile || profile || {};

  const display = {
    name: rawName,
    username: formattedUsername,
    role: userRole,
    email: rawEmail,

    avatarUrl: resolvedAvatarUrl,

    institution:
      prefs?.institution ||
      profilePreferences?.institution ||
      'Not provided',

    company:
      prefs?.company ||
      profilePreferences?.company ||
      'Not provided',

    career_goal:
      prefs?.career_goal ||
      profilePreferences?.career_goal ||
      'Not specified',

    specialization:
      prefs?.specialization ||
      profilePreferences?.specialization ||
      'Not specified',

    title:
      prefs?.title ||
      profilePreferences?.title ||
      'Not specified',

    bio:
      prefs?.bio ||
      profilePreferences?.bio ||
      '',

    industry:
      prefs?.industry ||
      profilePreferences?.industry ||
      'Not specified',

    location:
      prefs?.location ||
      profilePreferences?.location ||
      'Not specified',

    website:
      prefs?.website ||
      profilePreferences?.website ||
      '',

    about_company:
      prefs?.about_company ||
      profilePreferences?.about_company ||
      prefs?.bio ||
      '',

    department:
      prefs?.department ||
      profilePreferences?.department ||
      'IT Operations & Platform Governance',

    clearance:
      prefs?.clearance ||
      profilePreferences?.clearance ||
      'Super Administrator (Tier 1)',

    office_location:
      prefs?.office_location ||
      profilePreferences?.office_location ||
      'HQ Operations Center',

    admin_scope:
      prefs?.admin_scope ||
      profilePreferences?.admin_scope ||
      'Platform governance, security configuration, user management, and AI model oversight.',

    organization:
      prefs?.institution ||
      profilePreferences?.institution ||
      'Vayvora Technologies / EduSaaS Central',
  };

  useEffect(() => {
    setImageLoadFailed(false);
  }, [resolvedAvatarUrl]);

  /* =========================================================
     COURSE DATA
  ========================================================= */

  const courseById = useMemo(
    () =>
      Object.fromEntries(
        courses.map((course) => [course.id, course])
      ),
    [courses]
  );

  const completed = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          Number(enrollment?.completion_percentage || 0) >= 100
      ),
    [enrollments]
  );

  const inProgress = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          Number(enrollment?.completion_percentage || 0) < 100
      ),
    [enrollments]
  );

  const authoredCourses = useMemo(
    () =>
      courses.filter(
        (course) =>
          course?.educator_id === targetUserId ||
          course?.educator_id === user?.id ||
          course?.educator_id === user?.clerk_id ||
          (educatorStats?.courses &&
            educatorStats.courses.some(
              (educatorCourse) => educatorCourse?.id === course?.id
            )) ||
          (course?.provider &&
            rawName &&
            String(course.provider).toLowerCase() ===
              String(rawName).toLowerCase())
      ),
    [
      courses,
      targetUserId,
      user?.id,
      user?.clerk_id,
      educatorStats,
      rawName,
    ]
  );

  /* =========================================================
     METRICS
  ========================================================= */

  const adminTotals = adminInsights?.totals || {};

  const adminRoleCounts = {
    student: adminUsers.filter(
      (item) => String(item?.role || '').toLowerCase() === 'student'
    ).length,

    educator: adminUsers.filter(
      (item) => String(item?.role || '').toLowerCase() === 'educator'
    ).length,

    employer: adminUsers.filter(
      (item) => String(item?.role || '').toLowerCase() === 'employer'
    ).length,

    admin: adminUsers.filter(
      (item) => String(item?.role || '').toLowerCase() === 'admin'
    ).length,
  };

  const totalRoleUsers = Object.values(adminRoleCounts).reduce(
    (sum, value) => sum + value,
    0
  );

  const activeEmployerJobs = employerJobs.filter((job) => {
    const status = String(job?.status || '').toLowerCase();

    return (
      status === 'open' ||
      status === 'active' ||
      status === 'published' ||
      !status
    );
  });

  const activeJobCount =
    employerStats?.jobOpenings ??
    employerStats?.activeJobOpenings ??
    activeEmployerJobs.length;

  const applicantCount =
    employerStats?.newApplicants ??
    employerStats?.totalApplicants ??
    employerStats?.applicants ??
    0;

  const strongMatches =
    Number(
      employerStats?.strongMatches ??
        employerStats?.matchDistribution?.strong ??
        0
    ) || 0;

  const goodMatches =
    Number(
      employerStats?.goodMatches ??
        employerStats?.matchDistribution?.good ??
        0
    ) || 0;

  const potentialMatches =
    Number(
      employerStats?.potentialMatches ??
        employerStats?.matchDistribution?.potential ??
        0
    ) || 0;

  const totalMatches =
    strongMatches + goodMatches + potentialMatches;

  const strongPercentage =
    totalMatches > 0
      ? Math.round((strongMatches / totalMatches) * 100)
      : 0;

  const goodPercentage =
    totalMatches > 0
      ? Math.round((goodMatches / totalMatches) * 100)
      : 0;

  const potentialPercentage =
    totalMatches > 0
      ? Math.round((potentialMatches / totalMatches) * 100)
      : 0;

  /* =========================================================
     PAGE HEADER
  ========================================================= */

  const pageTitle = isAdmin
    ? 'Administrator Profile & Platform Governance'
    : isEducator
      ? 'Educator Profile & Teaching Portfolio'
      : isEmployer
        ? 'Employer Profile & Recruitment Hub'
        : 'Education SaaS Profile Board';

  const pageSubtitle = isAdmin
    ? 'Manage your platform identity, governance responsibilities, and operational overview.'
    : isEducator
      ? 'Showcase your teaching profile, courses, learner impact, and academic presence.'
      : isEmployer
        ? 'Manage your recruitment identity, hiring activity, and access to qualified talent.'
        : 'Your learning identity, progress, achievements, career direction, and recommendations.';

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="profile-page-premium relative min-h-full overflow-hidden">
      {/* Aurora background */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute top-20 right-0 h-96 w-96 rounded-full bg-violet-300/15 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative space-y-6 pb-12">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_20px_70px_-35px_rgba(15,23,42,0.35)]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/60 to-violet-50/80 pointer-events-none" />

          <div className="relative p-5 sm:p-7">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
                  <Icon name="sparkles" size={14} />
                  {isAdmin
                    ? 'Platform Governance'
                    : isEducator
                      ? 'Teaching Portfolio'
                      : isEmployer
                        ? 'Recruitment Workspace'
                        : 'Personal Learning Hub'}
                </div>

                <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                  {pageTitle}
                </h1>

                <p className="mt-2 max-w-3xl text-sm sm:text-[15px] leading-6 text-slate-600">
                  {pageSubtitle}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white bg-white/80 px-3 py-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-600">
                    Profile active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white grid place-items-center shrink-0">
                !
              </div>

              <div>
                <p className="font-semibold">Something needs attention</p>
                <p className="mt-0.5 text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* ===================================================
              PROFILE SIDEBAR
          =================================================== */}

          <GlassCard className="lg:sticky lg:top-5 self-start">
            <div className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600" />

              <div className="absolute inset-x-0 top-0 h-28 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_30%),radial-gradient(circle_at_80%_30%,white,transparent_25%)]" />

              <div className="relative px-5 sm:px-6 pt-12 pb-6">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] p-1.5 shadow-2xl shadow-blue-900/20"
                      style={{
                        background:
                          'linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,255,255,.45))',
                      }}
                    >
                      {display.avatarUrl && !imageLoadFailed ? (
                        <img
                          src={display.avatarUrl}
                          alt={`${display.name} profile`}
                          className="w-full h-full rounded-[1.5rem] object-cover bg-white"
                          onError={() => setImageLoadFailed(true)}
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-[1.5rem] grid place-items-center text-white text-3xl sm:text-4xl font-bold"
                          style={{
                            background: getAvatarStyle(display.name),
                          }}
                        >
                          {initials(display.name)}
                        </div>
                      )}
                    </div>

                    <label
                      htmlFor="profile-avatar-upload"
                      className="absolute -right-1 -bottom-1 w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-lg grid place-items-center text-slate-600 hover:text-blue-600 hover:scale-105 transition-all cursor-pointer"
                      title="Change profile photo"
                    >
                      {avatarUploading ? (
                        <span className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                      ) : (
                        <Icon name="camera" size={18} />
                      )}
                    </label>

                    <input
                      ref={fileInputRef}
                      id="profile-avatar-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      className="hidden"
                      onChange={onAvatarUpload}
                      disabled={avatarUploading}
                    />
                  </div>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={onRemoveAvatar}
                      disabled={avatarUploading}
                      className="mt-3 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      Remove photo
                    </button>
                  )}

                  {avatarError && (
                    <p className="mt-2 text-xs text-red-600 max-w-xs">
                      {avatarError}
                    </p>
                  )}

                  {/* Name */}
                  {!isEditingName ? (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 break-words">
                        {display.name}
                      </h2>

                      <button
                        type="button"
                        onClick={startNameEditing}
                        aria-label="Edit name"
                        className="w-8 h-8 rounded-lg grid place-items-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        <Icon name="edit" size={15} />
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={onSaveName}
                      className="mt-4 w-full max-w-sm"
                    >
                      <div className="flex gap-2">
                        <input
                          value={nameDraft}
                          onChange={(event) =>
                            setNameDraft(event.target.value)
                          }
                          autoFocus
                          className="min-w-0 flex-1 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          aria-label="Name"
                        />

                        <button
                          type="submit"
                          disabled={savingName}
                          className="px-3 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 transition-colors"
                        >
                          {savingName ? '...' : 'Save'}
                        </button>

                        <button
                          type="button"
                          onClick={cancelNameEditing}
                          className="px-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>

                      {nameError && (
                        <p className="text-xs text-red-600 mt-2 text-left">
                          {nameError}
                        </p>
                      )}
                    </form>
                  )}

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {display.username}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                    {isAdmin && <Icon name="shield" size={14} />}
                    {cap(display.role)}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                  {isAdmin ? (
                    <dl className="space-y-4">
                      <InfoRow
                        icon={<Icon name="mail" size={16} />}
                        label="Email"
                        value={display.email || 'Not provided'}
                      />

                      <InfoRow
                        icon={<Icon name="user" size={16} />}
                        label="Username"
                        value={display.username}
                      />

                      <InfoRow
                        icon={<Icon name="building" size={16} />}
                        label="Organization / Institution"
                        value={display.organization}
                      />

                      <InfoRow
                        icon={<Icon name="settings" size={16} />}
                        label="Department / Unit"
                        value={display.department}
                      />

                      <InfoRow
                        icon={<Icon name="shield" size={16} />}
                        label="Administrative Clearance"
                        value={
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {display.clearance}
                          </span>
                        }
                      />

                      <InfoRow
                        icon={<Icon name="location" size={16} />}
                        label="Office / Station"
                        value={display.office_location}
                      />

                      <InfoRow
                        icon={<Icon name="chart" size={16} />}
                        label="Governance Scope"
                        value={display.admin_scope}
                      />
                    </dl>
                  ) : isEducator ? (
                    <dl className="space-y-4">
                      <InfoRow
                        icon={<Icon name="mail" size={16} />}
                        label="Email"
                        value={display.email || 'Not provided'}
                      />

                      <InfoRow
                        icon={<Icon name="user" size={16} />}
                        label="Username"
                        value={display.username}
                      />

                      <InfoRow
                        icon={<Icon name="building" size={16} />}
                        label="Institution / Affiliation"
                        value={display.institution}
                      />

                      <InfoRow
                        icon={<Icon name="book" size={16} />}
                        label="Department / Specialization"
                        value={display.specialization}
                      />

                      <InfoRow
                        icon={<Icon name="briefcase" size={16} />}
                        label="Designation / Title"
                        value={display.title}
                      />

                      {display.bio && (
                        <InfoRow
                          icon={<Icon name="sparkles" size={16} />}
                          label="About"
                          value={display.bio}
                        />
                      )}
                    </dl>
                  ) : isEmployer ? (
                    <dl className="space-y-4">
                      <InfoRow
                        icon={<Icon name="mail" size={16} />}
                        label="Email"
                        value={display.email || 'Not provided'}
                      />

                      <InfoRow
                        icon={<Icon name="user" size={16} />}
                        label="Username"
                        value={display.username}
                      />

                      <InfoRow
                        icon={<Icon name="building" size={16} />}
                        label="Company / Organization"
                        value={display.company}
                      />

                      <InfoRow
                        icon={<Icon name="briefcase" size={16} />}
                        label="Industry / Sector"
                        value={display.industry}
                      />

                      <InfoRow
                        icon={<Icon name="user" size={16} />}
                        label="Designation / Recruiter Role"
                        value={display.title}
                      />

                      <InfoRow
                        icon={<Icon name="location" size={16} />}
                        label="Location / HQ"
                        value={display.location}
                      />

                      {display.website && (
                        <InfoRow
                          icon={<Icon name="globe" size={16} />}
                          label="Website"
                          value={
                            <a
                              href={
                                display.website.startsWith('http')
                                  ? display.website
                                  : `https://${display.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline break-all"
                            >
                              {display.website}
                            </a>
                          }
                        />
                      )}

                      {display.about_company && (
                        <InfoRow
                          icon={<Icon name="building" size={16} />}
                          label="About Company"
                          value={display.about_company}
                        />
                      )}
                    </dl>
                  ) : (
                    <dl className="space-y-4">
                      <InfoRow
                        icon={<Icon name="mail" size={16} />}
                        label="Email"
                        value={display.email || 'Not provided'}
                      />

                      <InfoRow
                        icon={<Icon name="user" size={16} />}
                        label="Username"
                        value={display.username}
                      />

                      <InfoRow
                        icon={<Icon name="building" size={16} />}
                        label="Institution"
                        value={display.institution}
                      />

                      <InfoRow
                        icon={<Icon name="briefcase" size={16} />}
                        label="Company"
                        value={display.company}
                      />

                      <InfoRow
                        icon={<Icon name="target" size={16} />}
                        label="Career Goal"
                        value={display.career_goal}
                      />
                    </dl>
                  )}
                </div>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                    className="w-full rounded-xl"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon name="edit" size={16} />
                      Edit profile
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ===================================================
              RIGHT CONTENT
          =================================================== */}

          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* =================================================
                ADMIN TOP
            ================================================= */}

            {isAdmin ? (
              <>
                <GlassCard>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <SectionHeading
                          eyebrow="Administration"
                          title="Administrative Operations & Governance"
                          description="A compact overview of your platform administration workspace."
                          icon={<Icon name="shield" size={20} />}
                        />
                      </div>

                      <Link
                        to="/app/dashboard"
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Admin Console
                        <Icon name="arrow" size={15} />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                      <StatCard
                        icon={<Icon name="certificate" size={19} />}
                        label="Assessments Taken"
                        value={adminInsights?.assessments?.count ?? 0}
                        description="Recorded platform assessments"
                        tone="blue"
                      />

                      <StatCard
                        icon={<Icon name="chart" size={19} />}
                        label="Average Test Score"
                        value={`${adminInsights?.assessments?.average_score ?? 0}%`}
                        description="Across available assessment results"
                        tone="emerald"
                      />

                      <StatCard
                        icon={<Icon name="briefcase" size={19} />}
                        label="Job Applications"
                        value={adminTotals?.applications ?? 0}
                        description="Applications recorded in the platform"
                        tone="purple"
                      />
                    </div>

                    <div className="mt-6">
                      <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
                        Governance navigation
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <QuickAction
                          to="/app/users"
                          icon={<Icon name="users" size={19} />}
                          title="User Management"
                          description="Accounts, roles and access"
                          tone="blue"
                        />

                        <QuickAction
                          to="/app/reports"
                          icon={<Icon name="chart" size={19} />}
                          title="Reports & Audits"
                          description="Operational reports and oversight"
                          tone="emerald"
                        />

                        <QuickAction
                          to="/app/settings"
                          icon={<Icon name="settings" size={19} />}
                          title="System Configuration"
                          description="Platform settings and controls"
                          tone="amber"
                        />

                        <QuickAction
                          to="/app/dashboard"
                          icon={<Icon name="sparkles" size={19} />}
                          title="AI Insights Hub"
                          description="Analytics and AI-assisted insights"
                          tone="purple"
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <GlassCard>
                    <div className="p-5 sm:p-6">
                      <SectionHeading
                        eyebrow="Platform scale"
                        title="Platform Scale & Role Distribution"
                        description="Current account and platform distribution."
                        icon={<Icon name="users" size={20} />}
                      />

                      <Link
                        to="/app/users"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Open user management
                        <Icon name="arrow" size={14} />
                      </Link>

                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <MiniMetric
                          label="Total Accounts"
                          value={
                            adminTotals?.users ??
                            adminUsers.length
                          }
                        />

                        <MiniMetric
                          label="Published Courses"
                          value={
                            adminTotals?.courses ??
                            courses.length
                          }
                        />

                        <MiniMetric
                          label="Total Enrollments"
                          value={
                            adminTotals?.enrollments ??
                            'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'
                          }
                        />

                        <MiniMetric
                          label="Open Job Listings"
                          value={
                            adminTotals?.jobs ??
                            'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'
                          }
                        />
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-800">
                            Role distribution
                          </span>

                          <span className="text-xs text-slate-400">
                            {totalRoleUsers || adminUsers.length} users
                          </span>
                        </div>

                        <div className="h-3 rounded-full overflow-hidden bg-slate-100 flex">
                          <div
                            className="bg-blue-500 transition-all"
                            style={{
                              width: `${
                                totalRoleUsers
                                  ? (adminRoleCounts.student /
                                      totalRoleUsers) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />

                          <div
                            className="bg-emerald-500 transition-all"
                            style={{
                              width: `${
                                totalRoleUsers
                                  ? (adminRoleCounts.educator /
                                      totalRoleUsers) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />

                          <div
                            className="bg-amber-500 transition-all"
                            style={{
                              width: `${
                                totalRoleUsers
                                  ? (adminRoleCounts.employer /
                                      totalRoleUsers) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />

                          <div
                            className="bg-violet-500 transition-all"
                            style={{
                              width: `${
                                totalRoleUsers
                                  ? (adminRoleCounts.admin /
                                      totalRoleUsers) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <RoleLegend
                            label="Students"
                            value={adminRoleCounts.student}
                            className="text-blue-600"
                          />

                          <RoleLegend
                            label="Educators"
                            value={adminRoleCounts.educator}
                            className="text-emerald-600"
                          />

                          <RoleLegend
                            label="Employers"
                            value={adminRoleCounts.employer}
                            className="text-amber-600"
                          />

                          <RoleLegend
                            label="Admins"
                            value={adminRoleCounts.admin}
                            className="text-violet-600"
                          />
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <SectionHeading
                          eyebrow="Live activity"
                          title="System Activity & Announcements"
                          description="Recent users and platform notices."
                          icon={<Icon name="megaphone" size={20} />}
                        />

                        <Link
                          to="/app/announcements"
                          className="text-xs font-semibold text-blue-600 hover:underline shrink-0"
                        >
                          Manage
                        </Link>
                      </div>

                      <div className="mt-5">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">
                          Recent users
                        </div>

                        {adminUsers.slice(0, 3).length === 0 ? (
                          <p className="text-sm text-slate-400">
                            No recent user activity.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {adminUsers.slice(0, 3).map((item, index) => {
                              const name =
                                item?.name ||
                                item?.full_name ||
                                item?.username ||
                                'User';

                              return (
                                <div
                                  key={item?.id || `user-${index}`}
                                  className="flex items-center gap-3"
                                >
                                  <div
                                    className="w-9 h-9 rounded-xl grid place-items-center text-xs font-bold text-white shrink-0"
                                    style={{
                                      background:
                                        getAvatarStyle(name),
                                    }}
                                  >
                                    {initials(name)}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-slate-800 truncate">
                                      {name}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">
                                      {item?.email ||
                                        item?.username ||
                                        'Account'}
                                    </div>
                                  </div>

                                  <span className="text-[10px] uppercase font-bold rounded-full bg-slate-100 text-slate-500 px-2 py-1">
                                    {item?.role || 'user'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-5 border-t border-slate-100">
                        <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">
                          Announcements
                        </div>

                        {announcements.slice(0, 2).length === 0 ? (
                          <p className="text-sm text-slate-400">
                            No announcements available.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {announcements.slice(0, 2).map((item, index) => (
                              <AnnouncementCompact
                                key={item?.id || `admin-announcement-${index}`}
                                item={item}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <Link
                        to="/app/announcements"
                        className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        + Send Platform Broadcast
                        <Icon name="arrow" size={14} />
                      </Link>
                    </div>
                  </GlassCard>
                </div>

                <GlassCard>
                  <div className="p-5 sm:p-6">
                    <SectionHeading
                      eyebrow="Announcements"
                      title={`Announcements (${announcements.length})`}
                      description="Latest messages published across the platform."
                      icon={<Icon name="megaphone" size={20} />}
                    />

                    {loading ? (
                      <div className="mt-5">
                        <SectionSkeleton lines={3} />
                      </div>
                    ) : announcements.length === 0 ? (
                      <div className="mt-5">
                        <EmptyState
                          icon={<Icon name="megaphone" size={21} />}
                          title="No announcements published yet."
                          action={
                            <Link
                              to="/app/announcements"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm mt-3 hover:underline"
                            >
                              Post an announcement
                              <Icon name="arrow" size={14} />
                            </Link>
                          }
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                        {announcements.slice(0, 4).map((item, index) => (
                          <AnnouncementCard
                            key={item?.id || `announcement-${index}`}
                            item={item}
                            to="/app/announcements"
                            actionLabel="View details"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </GlassCard>
              </>
            ) : isEducator ? (
              <>
                {/* =================================================
                    EDUCATOR PORTFOLIO
                ================================================= */}

                <GlassCard>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <SectionHeading
                        eyebrow="Courses"
                        title={`Teaching Portfolio (${authoredCourses.length})`}
                        description="Courses and learning experiences associated with your educator profile."
                        icon={<Icon name="book" size={20} />}
                      />

                      <Link
                        to="/app/courses"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                      >
                        Create Course
                        <Icon name="arrow" size={14} />
                      </Link>
                    </div>

                    {loading ? (
                      <div className="mt-6">
                        <SectionSkeleton lines={4} />
                      </div>
                    ) : authoredCourses.length === 0 ? (
                      <div className="mt-6">
                        <EmptyState
                          icon={<Icon name="book" size={21} />}
                          title="No authored courses found."
                          action={
                            <Link
                              to="/app/courses"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm mt-3 hover:underline"
                            >
                              Open course workspace
                              <Icon name="arrow" size={14} />
                            </Link>
                          }
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {authoredCourses.map((course, index) => (
                          <div
                            key={course?.id || `course-${index}`}
                            className="group rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-[10px] uppercase tracking-wide font-bold px-2.5 py-1 rounded-full ${
                                  course?.active !== false
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {course?.active !== false
                                  ? 'Active'
                                  : 'Inactive'}
                              </span>

                              <span className="text-[10px] font-semibold text-slate-400">
                                {course?.difficulty || 'Standard'}
                              </span>
                            </div>

                            <h3 className="mt-3 text-sm font-bold text-slate-900 line-clamp-2">
                              {course?.title || 'Untitled course'}
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-slate-500 line-clamp-3">
                              {course?.description ||
                                'No course description available.'}
                            </p>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <span className="text-[11px] font-semibold text-slate-400 truncate">
                                {course?.category || 'General'}
                              </span>

                              <Link
                                to={`/app/courses/${course?.id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700"
                              >
                                View course
                                <Icon name="arrow" size={13} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <GlassCard>
                    <div className="p-5 sm:p-6">
                      <SectionHeading
                        eyebrow="Impact"
                        title="Teaching Impact & Reach"
                        description="Learner engagement and course performance."
                        icon={<Icon name="chart" size={20} />}
                      />

                      <Link
                        to="/app/insights"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        View insights
                        <Icon name="arrow" size={14} />
                      </Link>

                      {loading ? (
                        <div className="mt-6">
                          <SectionSkeleton lines={4} />
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3 mt-5">
                            <MiniMetric
                              label="Enrolled Learners"
                              value={
                                educatorStats?.enrolledLearners ?? 0
                              }
                            />

                            <MiniMetric
                              label="Avg Completion"
                              value={`${educatorStats?.avgCompletion ?? 0}%`}
                            />

                            <MiniMetric
                              label="Active Courses"
                              value={
                                educatorStats?.activeCourses ??
                                authoredCourses.filter(
                                  (course) => course?.active !== false
                                ).length
                              }
                            />

                            <MiniMetric
                              label="Course Feedback"
                              value={
                                educatorStats?.avgRating ??
                                educatorStats?.averageRating ??
                                'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'
                              }
                            />
                          </div>

                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-800">
                                Cohort completion
                              </span>

                              <span className="text-xs font-bold text-blue-600">
                                {educatorStats?.avgCompletion ?? 0}%
                              </span>
                            </div>

                            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      Number(
                                        educatorStats?.avgCompletion || 0
                                      )
                                    )
                                  )}%`,
                                }}
                              />
                            </div>

                            <div className="mt-2 text-xs text-slate-400">
                              Based on available learner progress data
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="p-5 sm:p-6">
                      <SectionHeading
                        eyebrow="Updates"
                        title={`Announcements (${announcements.length})`}
                        description="Messages relevant to your teaching workspace."
                        icon={<Icon name="megaphone" size={20} />}
                      />

                      {loading ? (
                        <div className="mt-5">
                          <SectionSkeleton lines={3} />
                        </div>
                      ) : announcements.length === 0 ? (
                        <div className="mt-5">
                          <EmptyState
                            icon={<Icon name="megaphone" size={21} />}
                            title="No announcements published yet."
                            action={
                              <Link
                                to="/app/announcements"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm mt-3 hover:underline"
                              >
                                Post an announcement
                                <Icon name="arrow" size={14} />
                              </Link>
                            }
                          />
                        </div>
                      ) : (
                        <div className="space-y-3 mt-5">
                          {announcements.slice(0, 4).map((item, index) => (
                            <AnnouncementCard
                              key={item?.id || `educator-announcement-${index}`}
                              item={item}
                              to="/app/announcements"
                              actionLabel="View details"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </>
            ) : isEmployer ? (
              <>
                {/* =================================================
                    EMPLOYER PIPELINE
                ================================================= */}

                <GlassCard>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <SectionHeading
                        eyebrow="Recruitment"
                        title="Recruitment Pipeline & Reach"
                        description="A hiring overview for your active recruitment workspace."
                        icon={<Icon name="briefcase" size={20} />}
                      />

                      <Link
                        to="/app/candidates"
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Candidate Pool
                        <Icon name="arrow" size={14} />
                      </Link>
                    </div>

                    {loading ? (
                      <div className="mt-6">
                        <SectionSkeleton lines={4} />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                          <StatCard
                            icon={<Icon name="briefcase" size={18} />}
                            label="Active Openings"
                            value={activeJobCount}
                            tone="blue"
                          />

                          <StatCard
                            icon={<Icon name="users" size={18} />}
                            label="Total Applicants"
                            value={applicantCount}
                            tone="emerald"
                          />

                          <StatCard
                            icon={<Icon name="sparkles" size={18} />}
                            label="Top AI Matches"
                            value={
                              employerStats?.topMatches ??
                              employerStats?.aiMatches ??
                              strongMatches
                            }
                            tone="purple"
                          />

                          <StatCard
                            icon={<Icon name="check" size={18} />}
                            label="Pre-Qualified"
                            value={strongMatches + goodMatches}
                            tone="amber"
                          />
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                Candidate Match Distribution
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                AI matching quality across available candidates
                              </div>
                            </div>

                            <span className="text-xs font-bold text-slate-500">
                              {totalMatches} matches
                            </span>
                          </div>

                          <div className="h-3 rounded-full overflow-hidden bg-slate-100 flex mt-4">
                            <div
                              className="bg-emerald-500"
                              style={{
                                width: `${strongPercentage}%`,
                              }}
                            />

                            <div
                              className="bg-blue-500"
                              style={{
                                width: `${goodPercentage}%`,
                              }}
                            />

                            <div
                              className="bg-amber-400"
                              style={{
                                width: `${potentialPercentage}%`,
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                            <MatchLegend
                              label="Strong"
                              value={strongMatches}
                              percentage={strongPercentage}
                              dot="bg-emerald-500"
                            />

                            <MatchLegend
                              label="Good"
                              value={goodMatches}
                              percentage={goodPercentage}
                              dot="bg-blue-500"
                            />

                            <MatchLegend
                              label="Potential"
                              value={potentialMatches}
                              percentage={potentialPercentage}
                              dot="bg-amber-400"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <GlassCard>
                    <div className="p-5 sm:p-6">
                      <SectionHeading
                        eyebrow="Tools"
                        title="Recruiter Quick Actions & Tools"
                        description="Shortcuts for your hiring workflow."
                        icon={<Icon name="settings" size={20} />}
                      />

                      <Link
                        to="/app/dashboard"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Employer Dashboard
                        <Icon name="arrow" size={14} />
                      </Link>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                        <QuickAction
                          to="/app/candidates"
                          icon={<Icon name="users" size={19} />}
                          title="Candidate Search"
                          description="Filter pre-assessed talent"
                          tone="emerald"
                        />

                        <QuickAction
                          to="/app/employer-community"
                          icon={<Icon name="users" size={19} />}
                          title="Community"
                          description="Engage with educators & peers"
                          tone="blue"
                        />

                        <QuickAction
                          to="/app/dashboard"
                          icon={<Icon name="chart" size={19} />}
                          title="Hiring Analytics"
                          description="Pipeline conversion rates"
                          tone="purple"
                        />

                        <QuickAction
                          to="/app/settings"
                          icon={<Icon name="settings" size={19} />}
                          title="Preferences"
                          description="Notifications & profile settings"
                          tone="amber"
                        />
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="p-5 sm:p-6">
                      <SectionHeading
                        eyebrow="Hiring updates"
                        title={`Hiring Updates & Announcements (${announcements.length})`}
                        description="Platform messages useful to your recruitment workspace."
                        icon={<Icon name="megaphone" size={20} />}
                      />

                      <Link
                        to="/app/candidates"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Explore Candidates
                        <Icon name="arrow" size={14} />
                      </Link>

                      {loading ? (
                        <div className="mt-5">
                          <SectionSkeleton lines={3} />
                        </div>
                      ) : announcements.length === 0 ? (
                        <div className="mt-5">
                          <EmptyState
                            icon={<Icon name="megaphone" size={21} />}
                            title="No recruitment announcements published yet."
                            action={
                              <Link
                                to="/app/candidates"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm mt-3 hover:underline"
                              >
                                Explore candidate talent pool
                                <Icon name="arrow" size={14} />
                              </Link>
                            }
                          />
                        </div>
                      ) : (
                        <div className="space-y-3 mt-5">
                          {announcements.slice(0, 4).map((item, index) => (
                            <AnnouncementCard
                              key={
                                item?.id ||
                                `employer-announcement-${index}`
                              }
                              item={item}
                              to="/app/candidates"
                              actionLabel="View talent"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </>
            ) : (
              <>
                {/* =================================================
                    STUDENT
                ================================================= */}

                <GlassCard>
                  <div className="p-5 sm:p-6">
                    <SectionHeading
                      eyebrow="Learning history"
                      title="Learning History"
                      description="Your completed learning, active courses, and certificates."
                      icon={<Icon name="book" size={20} />}
                    />

                    {loading ? (
                      <div className="mt-6">
                        <SectionSkeleton lines={5} />
                      </div>
                    ) : enrollments.length === 0 ? (
                      <div className="mt-6">
                        <EmptyState
                          icon={<Icon name="book" size={21} />}
                          title="No enrollments found yet."
                          action={
                            <Link
                              to="/app/courses"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm mt-3 hover:underline"
                            >
                              Explore courses
                              <Icon name="arrow" size={14} />
                            </Link>
                          }
                        />
                      </div>
                    ) : (
                      <div className="mt-6 space-y-6">
                        {completed.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center">
                                <Icon name="check" size={15} />
                              </span>

                              <span className="text-sm font-bold text-slate-900">
                                Completed
                              </span>

                              <span className="text-xs font-semibold text-slate-400">
                                {completed.length}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {completed.map((enrollment, index) => {
                                const course =
                                  courseById[enrollment?.course_id] ||
                                  enrollment?.course ||
                                  {};

                                return (
                                  <div
                                    key={
                                      enrollment?.id ||
                                      `completed-${index}`
                                    }
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-9 h-9 rounded-xl bg-white border border-emerald-100 text-emerald-600 grid place-items-center shrink-0">
                                        <Icon
                                          name="certificate"
                                          size={17}
                                        />
                                      </div>

                                      <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-900 truncate">
                                          {course?.title ||
                                            enrollment?.course_title ||
                                            'Completed course'}
                                        </div>

                                        <div className="text-xs text-slate-500 truncate">
                                          {course?.provider ||
                                            enrollment?.provider ||
                                            'Learning program'}
                                        </div>
                                      </div>
                                    </div>

                                    <span className="shrink-0 text-[10px] uppercase font-bold rounded-full bg-emerald-100 text-emerald-700 px-2 py-1">
                                      100%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {inProgress.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                                <Icon name="chart" size={15} />
                              </span>

                              <span className="text-sm font-bold text-slate-900">
                                In progress
                              </span>

                              <span className="text-xs font-semibold text-slate-400">
                                {inProgress.length}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {inProgress.map((enrollment, index) => {
                                const percentage = Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(
                                      enrollment?.completion_percentage || 0
                                    )
                                  )
                                );

                                const course =
                                  courseById[enrollment?.course_id] ||
                                  enrollment?.course ||
                                  {};

                                return (
                                  <div
                                    key={
                                      enrollment?.id ||
                                      `progress-${index}`
                                    }
                                    className="rounded-2xl border border-slate-200/80 bg-white p-4"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="min-w-0">
                                        <div className="text-sm font-bold text-slate-900 truncate">
                                          {course?.title ||
                                            enrollment?.course_title ||
                                            'Learning course'}
                                        </div>

                                        <div className="text-xs text-slate-500 mt-1 truncate">
                                          {course?.provider ||
                                            enrollment?.provider ||
                                            'Learning program'}
                                        </div>
                                      </div>

                                      <span className="text-sm font-bold text-blue-600 shrink-0">
                                        {percentage}%
                                      </span>
                                    </div>

                                    <div
                                      className="h-2 rounded-full bg-slate-100 overflow-hidden mt-4"
                                      role="progressbar"
                                      aria-valuenow={percentage}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                      aria-label="Course completion"
                                    >
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-[width] duration-700"
                                        style={{
                                          width: `${percentage}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {certs.length > 0 && (
                          <div className="pt-5 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 grid place-items-center">
                                <Icon name="certificate" size={15} />
                              </span>

                              <span className="text-sm font-bold text-slate-900">
                                Certificates
                              </span>

                              <span className="text-xs font-semibold text-slate-400">
                                {certs.length}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {certs.slice(0, 4).map((certificate, index) => (
                                <div
                                  key={
                                    certificate?.id ||
                                    certificate?.certificate_code ||
                                    `certificate-${index}`
                                  }
                                  className="rounded-2xl border border-violet-100 bg-violet-50/40 p-3.5"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-violet-100 text-violet-600 grid place-items-center shrink-0">
                                      <Icon
                                        name="certificate"
                                        size={18}
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <div className="text-sm font-bold text-slate-900 truncate">
                                        {certificate?.title ||
                                          certificate?.course_title ||
                                          'Certificate'}
                                      </div>

                                      <div className="text-[11px] text-slate-500 mt-1">
                                        {certificate?.certificate_code ||
                                          'Certificate issued'}
                                      </div>

                                      <div className="text-[11px] text-slate-400 mt-0.5">
                                        {formatDate(
                                          certificate?.issued_at ||
                                            certificate?.issue_date ||
                                            certificate?.created_at
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Gap */}
                  <GlassCard>
                    <div className="p-5 sm:p-6">
                      <SectionHeading
                        eyebrow="Career readiness"
                        title="Gap Analysis"
                        description="Understand the skills between your current profile and your target role."
                        icon={<Icon name="target" size={20} />}
                      />

                      {loading ? (
                        <div className="mt-5">
                          <SectionSkeleton lines={4} />
                        </div>
                      ) : (
                        <div className="mt-5">
                          <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                              Target role
                            </div>

                            <div className="mt-1 text-sm font-bold text-slate-900">
                              {display.career_goal}
                            </div>
                          </div>

                          <div className="mt-5">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="font-semibold text-slate-600">
                                Readiness score
                              </span>

                              <span className="font-bold text-orange-600">
                                {gap?.readiness_score ?? 0}%
                              </span>
                            </div>

                            <div
                              className="h-2.5 bg-slate-100 rounded-full overflow-hidden"
                              role="progressbar"
                              aria-valuenow={gap?.readiness_score ?? 0}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label="Readiness score"
                            >
                              <div
                                className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-[width] duration-700"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      Number(
                                        gap?.readiness_score || 0
                                      )
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-6">
                            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">
                              Missing skills
                            </div>

                            {(gap?.missing_skills || []).length === 0 ? (
                              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                                Take an assessment to generate your gap report.
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {gap.missing_skills.map((skill) => (
                                  <li
                                    key={skill}
                                    className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-2 text-sm text-slate-700"
                                  >
                                    <span className="w-6 h-6 rounded-lg bg-white text-orange-500 grid place-items-center shrink-0">
                                      !
                                    </span>
                                    <span>{skill}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* Achievements */}
                  <GlassCard>
                    <div className="p-5 sm:p-6">
                      <SectionHeading
                        eyebrow="Recognition"
                        title={`Achievements (${achievements.length})`}
                        description="Milestones and recommendations from your learning journey."
                        icon={<Icon name="award" size={20} />}
                      />

                      {loading ? (
                        <div className="mt-5">
                          <SectionSkeleton lines={3} />
                        </div>
                      ) : achievements.length === 0 ? (
                        <div className="mt-5">
                          <EmptyState
                            icon={<Icon name="award" size={21} />}
                            title="No badges yet."
                          />
                        </div>
                      ) : (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
                          {achievements.slice(0, 6).map((achievement, index) => (
                            <li
                              key={
                                achievement?.id ||
                                achievement?.badge_name ||
                                `achievement-${index}`
                              }
                              className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
                                <Icon name="award" size={17} />
                              </div>

                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-slate-900 truncate">
                                  {achievement?.badge_name}
                                </div>

                                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {achievement?.milestone}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {!loading && recs.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-slate-100">
                          <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 mb-3">
                            Recommended for you
                          </div>

                          <ul className="space-y-2">
                            {recs
                              .filter(
                                (recommendation) =>
                                  recommendation?.type !==
                                    'ai_suggestions' &&
                                  (recommendation?.course?.title ||
                                    recommendation?.title)
                              )
                              .slice(0, 3)
                              .map((recommendation, index) => (
                                <li
                                  key={
                                    recommendation?.id ||
                                    recommendation?.course_id ||
                                    `recommendation-${index}`
                                  }
                                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center shrink-0">
                                    <Icon name="book" size={15} />
                                  </div>

                                  <span className="font-semibold text-sm text-slate-800 truncate">
                                    {recommendation?.course?.title ||
                                      recommendation?.title}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </GlassCard>

                  {/* Announcements */}
                  <GlassCard className="md:col-span-2">
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <SectionHeading
                          eyebrow="Updates & notices"
                          title={`Course Announcements (${announcements.length})`}
                          description="Latest updates from your learning environment."
                          icon={<Icon name="megaphone" size={20} />}
                        />

                        <span className="hidden sm:inline-flex text-xs font-semibold text-slate-400">
                          Updates & Notices
                        </span>
                      </div>

                      {loading ? (
                        <div className="mt-5">
                          <SectionSkeleton lines={3} />
                        </div>
                      ) : announcements.length === 0 ? (
                        <div className="mt-5 py-8 text-center text-sm text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                          No course announcements yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                          {announcements.slice(0, 4).map((item, index) => (
                            <AnnouncementCard
                              key={
                                item?.id ||
                                `student-announcement-${index}`
                              }
                              item={item}
                              to="/app/dashboard"
                              actionLabel="View in Dashboard"
                              student
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </>
            )}
          </div>
        </div>

        {/* =====================================================
            EDIT PROFILE MODAL
        ===================================================== */}

        {editing && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md grid place-items-center z-50 p-3 sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setEditing(false);
              }
            }}
          >
            <form
              onSubmit={onSave}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/80 bg-white/95 shadow-2xl"
            >
              <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur-xl px-5 sm:px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-600">
                      Profile settings
                    </div>

                    <h3
                      id="edit-profile-title"
                      className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-slate-950"
                    >
                      Edit{' '}
                      {isAdmin
                        ? 'Administrator Profile'
                        : isEducator
                          ? 'Educator Profile'
                          : isEmployer
                            ? 'Employer Profile'
                            : 'Profile'}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    aria-label="Close"
                    className="w-9 h-9 rounded-xl grid place-items-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {isAdmin ? (
                  <div className="space-y-4">
                    <FormField
                      id="organization"
                      label="Organization / Institution"
                      value={draft.institution}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          institution: value,
                        })
                      }
                      placeholder="e.g. Vayvora Technologies / EduSaaS Central"
                    />

                    <FormField
                      id="department"
                      label="Department / Governance Unit"
                      value={draft.department}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          department: value,
                        })
                      }
                      placeholder="e.g. IT Operations & Platform Governance"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        id="admin-title"
                        label="Administrative Title"
                        value={draft.title}
                        onChange={(value) =>
                          setDraft({
                            ...draft,
                            title: value,
                          })
                        }
                        placeholder="e.g. Lead Systems Admin"
                      />

                      <FormField
                        id="clearance"
                        label="Clearance Level"
                        value={draft.clearance}
                        onChange={(value) =>
                          setDraft({
                            ...draft,
                            clearance: value,
                          })
                        }
                        placeholder="e.g. Super Administrator"
                      />
                    </div>

                    <FormField
                      id="office_location"
                      label="Office / Station Location"
                      value={draft.office_location}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          office_location: value,
                        })
                      }
                      placeholder="e.g. HQ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Operations Center / Hybrid"
                    />

                    <FormField
                      id="admin_scope"
                      label="Administrative Scope & Oversight"
                      value={draft.admin_scope}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          admin_scope: value,
                        })
                      }
                      placeholder="Brief summary of governance scope..."
                      textarea
                      rows={4}
                    />
                  </div>
                ) : isEducator ? (
                  <div className="space-y-4">
                    <FormField
                      id="institution"
                      label="Institution / University / Organization"
                      value={draft.institution}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          institution: value,
                        })
                      }
                      placeholder="e.g. Stanford University / Tech Academy"
                    />

                    <FormField
                      id="specialization"
                      label="Department / Area of Specialization"
                      value={draft.specialization}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          specialization: value,
                        })
                      }
                      placeholder="e.g. Computer Science & Artificial Intelligence"
                    />

                    <FormField
                      id="educator-title"
                      label="Designation / Title"
                      value={draft.title}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          title: value,
                        })
                      }
                      placeholder="e.g. Senior Professor / Lead Instructor"
                    />

                    <FormField
                      id="bio"
                      label="Teaching Bio & Research Interests"
                      value={draft.bio}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          bio: value,
                        })
                      }
                      placeholder="Brief bio about your teaching journey, research interests, or course goals..."
                      textarea
                      rows={4}
                    />
                  </div>
                ) : isEmployer ? (
                  <div className="space-y-4">
                    <FormField
                      id="company"
                      label="Company / Organization Name"
                      value={draft.company}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          company: value,
                        })
                      }
                      placeholder="e.g. Vayvora Technologies / Google"
                    />

                    <FormField
                      id="industry"
                      label="Industry / Sector"
                      value={draft.industry}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          industry: value,
                        })
                      }
                      placeholder="e.g. Artificial Intelligence & Cloud Services"
                    />

                    <FormField
                      id="employer-title"
                      label="Designation / Recruiter Role"
                      value={draft.title}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          title: value,
                        })
                      }
                      placeholder="e.g. Head of Talent Acquisition / Technical Recruiter"
                    />

                    <FormField
                      id="location"
                      label="Location / Headquarters"
                      value={draft.location}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          location: value,
                        })
                      }
                      placeholder="e.g. Hyderabad, India / Remote"
                    />

                    <FormField
                      id="website"
                      label="Company Website"
                      value={draft.website}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          website: value,
                        })
                      }
                      placeholder="e.g. https://vayvoratech.com"
                    />

                    <FormField
                      id="about_company"
                      label="About Company & Hiring Mission"
                      value={draft.about_company}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          about_company: value,
                          bio: value,
                        })
                      }
                      placeholder="Share what your company does, culture, and what type of candidate talent you seek..."
                      textarea
                      rows={4}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FormField
                      id="career_goal"
                      label="Career goal"
                      value={draft.career_goal}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          career_goal: value,
                        })
                      }
                      placeholder="e.g. Cloud Engineer"
                    />

                    <FormField
                      id="student-institution"
                      label="Institution"
                      value={draft.institution}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          institution: value,
                        })
                      }
                      placeholder="e.g. XYZ University"
                    />

                    <FormField
                      id="student-company"
                      label="Company"
                      value={draft.company}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          company: value,
                        })
                      }
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                )}

                {/* Resume */}
                {!isEducator && !isEmployer && !isAdmin && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 grid place-items-center">
                        <Icon name="file" size={16} />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-800">
                          Resume
                        </label>

                        <p className="text-xs text-slate-400">
                          PDF, DOC or DOCX Ãƒâ€šÃ‚Â· Max 5 MB
                        </p>
                      </div>
                    </div>

                    {profile?.profile?.resume ? (
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-red-500">
                            <Icon name="file" size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {profile.profile.resume.file_name}
                            </p>

                            <p className="text-xs text-emerald-600 mt-0.5">
                              Resume uploaded
                            </p>
                          </div>
                        </div>

                        <label className="shrink-0 cursor-pointer">
                          <span className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                            Replace
                          </span>

                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(event) =>
                              setResumeFile(
                                event.target.files?.[0] || null
                              )
                            }
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-red-500">
                          <Icon name="file" size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700">
                            Upload your resume
                          </p>

                          <p className="text-xs text-slate-400 mt-0.5">
                            PDF, DOC or DOCX Ãƒâ€šÃ‚Â· Max 5 MB
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors">
                          Upload
                          <Icon name="arrow" size={13} />
                        </span>

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(event) =>
                            setResumeFile(
                              event.target.files?.[0] || null
                            )
                          }
                        />
                      </label>
                    )}

                    {resumeFile && (
                      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-3">
                        <span className="text-xs font-medium text-blue-700 truncate max-w-full">
                          Selected: {resumeFile.name}
                        </span>

                        <Button
                          type="button"
                          onClick={onResumeUpload}
                          disabled={resumeUploading}
                          className="text-xs px-3 py-1.5 shrink-0 rounded-lg"
                        >
                          {resumeUploading
                            ? 'UploadingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦'
                            : 'Confirm Upload'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 backdrop-blur-xl px-5 sm:px-6 py-4">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="min-w-[100px] rounded-xl"
                  >
                    {saving ? 'SavingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦' : 'Save changes'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SUPPORT COMPONENTS
========================================================= */

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 grid place-items-center shrink-0">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <dt className="text-[10px] uppercase tracking-[0.14em] font-bold text-slate-400">
          {label}
        </dt>

        <dd className="mt-1 text-sm leading-5 font-semibold text-slate-800 break-words">
          {value || 'Not provided'}
        </dd>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-10 h-10 rounded-xl bg-slate-950 text-white grid place-items-center shrink-0 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.17em] font-bold text-blue-600">
            {eyebrow}
          </div>
        )}

        <h2 className="mt-1 text-base sm:text-lg font-bold tracking-tight text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs sm:text-sm leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5">
      <div className="text-xl font-bold tracking-tight text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400">
        {label}
      </div>
    </div>
  );
}

function RoleLegend({ label, value, className = '' }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
      <span className={`font-semibold ${className}`}>
        {label}
      </span>

      <span className="font-bold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function MatchLegend({
  label,
  value,
  percentage,
  dot,
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />

      <div className="min-w-0">
        <div className="font-semibold text-slate-700">
          {label}
        </div>

        <div className="text-[10px] text-slate-400">
          {value} Ãƒâ€šÃ‚Â· {percentage}%
        </div>
      </div>
    </div>
  );
}

function AnnouncementCard({
  item,
  to,
  actionLabel,
  student = false,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-slate-50/70 hover:shadow-lg hover:shadow-slate-200/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center shrink-0">
            <Icon name="megaphone" size={15} />
          </div>

          <span className="text-sm font-bold text-slate-900 line-clamp-1">
            {item?.title || 'Announcement'}
          </span>
        </div>

        <span
          className={`text-[9px] uppercase tracking-wide font-bold px-2 py-1 rounded-full shrink-0 ${
            student
              ? 'bg-amber-50 text-amber-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {item?.audience === 'course'
            ? 'My Course'
            : item?.audience || 'All'}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-600 line-clamp-3">
        {item?.message || 'No message available.'}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400 truncate">
          {item?.educator?.name
            ? `By ${item.educator.name} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ `
            : ''}
          {formatDate(item?.created_at)}
        </span>

        <Link
          to={to}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
        >
          {actionLabel}
          <Icon name="arrow" size={13} />
        </Link>
      </div>
    </div>
  );
}

function AnnouncementCompact({ item }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-800 line-clamp-1">
          {item?.title || 'Announcement'}
        </span>

        <span className="text-[9px] uppercase font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 shrink-0">
          {item?.audience || 'All'}
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-5 text-slate-500 line-clamp-2">
        {item?.message || 'No message available.'}
      </p>

      <div className="mt-2 text-[10px] text-slate-400">
        {formatDate(item?.created_at)}
      </div>
    </div>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  rows = 3,
}) {
  const className =
    'w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-50 hover:border-slate-300';

  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-bold text-slate-600"
      >
        {label}
      </label>

      {textarea ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${className} mt-1.5 resize-none`}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${className} mt-1.5`}
        />
      )}
    </div>
  );
}
