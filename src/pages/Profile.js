import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import {
  getUserProfile, updateUserName, fetchGapReport, saveUserProfile, uploadProfileResume,
  uploadProfileAvatar, deleteProfileAvatar, resolveAssetUrl,
  getMyEnrollments, getCourses, getMyAchievements,
  getMyCertificates, getMyRecommendations,
  getEducatorDashboard, getAnnouncements,
  getJobs, getEmployerDashboard,
  getInsights, getAllUsers,
} from '../services/api';

const initials = (name) =>
  (name || '?')
    .replace(/^@/, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

// Deterministic vibrant gradient palette with guaranteed inline styles so it never fails or goes blank
const AVATAR_PALETTES = [
  { background: 'linear-gradient(135deg, #ec4899, #e11d48)' }, // Pink / Rose
  { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }, // Violet / Indigo
  { background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }, // Blue
  { background: 'linear-gradient(135deg, #10b981, #059669)' }, // Emerald / Green
  { background: 'linear-gradient(135deg, #f59e0b, #d97706)' }, // Amber / Orange
  { background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }, // Cyan / Sky
  { background: 'linear-gradient(135deg, #d946ef, #a21caf)' }, // Fuchsia
  { background: 'linear-gradient(135deg, #f43f5e, #be123c)' }, // Rose / Crimson
];

const getAvatarStyle = (name) => {
  const s = (name || '?').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
};

function SectionSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2.5 animate-pulse" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-slate-100"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <div className="text-3xl mb-2 opacity-60" aria-hidden="true">{icon}</div>
      <p className="text-sm text-slate-500">{title}</p>
      {action}
    </div>
  );
}

export default function Profile() {
  const { user, updateAuthUser } = useAuth();
  const [profile, setProfile] = useState(null);          // /api/users/:id response
  const [gap, setGap] = useState(null);                  // gap report
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
  const fileInputRef = React.useRef(null);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('edu_user')) || {};
    } catch {
      return {};
    }
  })();

  const targetUserId = storedUser.id || user?.id;
  const userRole = (profile?.role || storedUser?.role || user?.role || 'student').toLowerCase();
  const isEducator = userRole === 'educator';
  const isEmployer = userRole === 'employer';
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (!targetUserId) return;
    setLoading(true);

    const handleProfileLoaded = (userProf) => {
      setProfile(userProf);
      if (userProf?.name && updateAuthUser) {
        updateAuthUser({
          name: userProf.name,
          role: userProf.role,
          avatar_url: userProf.avatar_url || userProf.profile?.preferences?.avatar_url || null,
        });
      }
    };

    if (isAdmin) {
      Promise.allSettled([
        getUserProfile(targetUserId).then(handleProfileLoaded),
        getInsights().then(setAdminInsights).catch(() => null),
        getAllUsers().then((res) => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          setAdminUsers(list);
        }).catch(() => null),
        getAnnouncements().then((res) => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          setAnnouncements(list);
        }).catch(() => null),
      ]).finally(() => setLoading(false));
    } else if (isEducator) {
      Promise.allSettled([
        getUserProfile(targetUserId).then(handleProfileLoaded),
        getCourses().then((res) => {
          const list = Array.isArray(res) ? res : (res?.courses || []);
          setCourses(list);
        }),
        getEducatorDashboard().then(setEducatorStats).catch(() => null),
        getAnnouncements().then((res) => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          setAnnouncements(list);
        }).catch(() => null),
      ]).finally(() => setLoading(false));
    } else if (isEmployer) {
      Promise.allSettled([
        getUserProfile(targetUserId).then(handleProfileLoaded),
        getJobs({ employer_id: targetUserId }).then((res) => {
          const list = Array.isArray(res) ? res : (res?.jobs || []);
          setEmployerJobs(list);
        }),
        getEmployerDashboard().then(setEmployerStats).catch(() => null),
        getAnnouncements().then((res) => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          setAnnouncements(list);
        }).catch(() => null),
      ]).finally(() => setLoading(false));
    } else {
      Promise.allSettled([
        getUserProfile(targetUserId).then(handleProfileLoaded),
        fetchGapReport(targetUserId).then(setGap),
        getMyEnrollments().then(setEnrollments),
        getCourses().then((res) => {
          const list = Array.isArray(res) ? res : (res?.courses || []);
          setCourses(list);
        }),
        getMyAchievements().then(setAchievements),
        getMyCertificates().then(setCerts),
        getMyRecommendations().then(setRecs),
        getAnnouncements().then((res) => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          setAnnouncements(list);
        }).catch(() => null),
      ]).finally(() => setLoading(false));
    }
  }, [targetUserId, isEducator, isEmployer, isAdmin, updateAuthUser]);

  useEffect(() => {
    if (profile?.profile) {
      const prefs = profile.profile.preferences || profile.preferences || {};
      setDraft({
        career_goal: profile.profile.career_goal || '',
        institution: profile.profile.institution || prefs.institution || prefs.organization || '',
        company: profile.profile.company || prefs.company || '',
        specialization: profile.profile.specialization || prefs.specialization || '',
        title: profile.profile.title || prefs.title || prefs.designation || '',
        bio: profile.profile.bio || prefs.bio || '',
        industry: prefs.industry || '',
        location: prefs.location || '',
        website: prefs.website || '',
        about_company: prefs.about_company || prefs.company_bio || prefs.bio || '',
        department: prefs.department || '',
        clearance: prefs.clearance || '',
        office_location: prefs.office_location || '',
        admin_scope: prefs.admin_scope || '',
      });
    }
  }, [profile]);

  // Quality-of-life modal behavior: lock background scroll and allow Esc to close.
  useEffect(() => {
    if (!editing) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setEditing(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [editing]);

  const onResumeUpload = async () => {
    if (!resumeFile || !targetUserId) return;

    setResumeUploading(true);
    setError(null);

    try {
      const result = await uploadProfileResume(
        targetUserId,
        resumeFile
      );

      setProfile((prev) => ({
        ...prev,
        profile: {
          ...prev?.profile,
          resume: result.resume,
        },
      }));

      setResumeFile(null);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to upload resume."
      );
    } finally {
      setResumeUploading(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!targetUserId) return;
    setSaving(true); setError(null);
    try {
      const saved = await saveUserProfile(targetUserId, draft);
      setProfile((p) => ({ ...p, profile: saved }));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async (e) => {
    if (e) e.preventDefault();
    if (!targetUserId || !nameDraft.trim()) return;
    setSavingName(true);
    setNameError(null);
    try {
      const res = await updateUserName(targetUserId, nameDraft.trim());
      const updatedName = res?.user?.name || nameDraft.trim();
      setProfile((p) => ({ ...p, name: updatedName }));

      // Update cached user in localStorage and AuthContext immediately
      if (updateAuthUser) {
        updateAuthUser({ name: updatedName });
      } else {
        try {
          const currentStored = JSON.parse(localStorage.getItem('edu_user') || '{}');
          const updated = { ...currentStored, name: updatedName };
          localStorage.setItem('edu_user', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('edu_user_updated', { detail: updated }));
        } catch (_) {}
      }

      // Best effort reload Clerk user in frontend session if supported
      try {
        if (user?.reload && typeof user.reload === 'function') {
          user.reload();
        }
      } catch (_) {}

      setIsEditingName(false);
    } catch (err) {
      setNameError(err.response?.data?.error || err.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !targetUserId) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image size must be under 5 MB.');
      return;
    }

    setAvatarUploading(true);
    setAvatarError(null);
    setImageLoadFailed(false);

    try {
      const res = await uploadProfileAvatar(targetUserId, file);
      const newUrl = res.avatar_url;
      setProfile((prev) => ({
        ...prev,
        avatar_url: newUrl,
        preferences: {
          ...(prev?.preferences || {}),
          avatar_url: newUrl,
        },
        profile: {
          ...(prev?.profile || {}),
          preferences: {
            ...(prev?.profile?.preferences || {}),
            avatar_url: newUrl,
          },
        },
      }));

      if (updateAuthUser) {
        updateAuthUser({ avatar_url: newUrl, avatar: newUrl });
      }
    } catch (err) {
      setAvatarError(err.response?.data?.error || err.message || 'Failed to upload profile picture.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!targetUserId) return;
    setAvatarUploading(true);
    setAvatarError(null);

    try {
      await deleteProfileAvatar(targetUserId);
      setProfile((prev) => {
        const nextPrefs = { ...(prev?.preferences || {}) };
        delete nextPrefs.avatar_url;
        const nextProfilePrefs = { ...(prev?.profile?.preferences || {}) };
        delete nextProfilePrefs.avatar_url;
        return {
          ...prev,
          avatar_url: null,
          preferences: nextPrefs,
          profile: {
            ...(prev?.profile || {}),
            preferences: nextProfilePrefs,
          },
        };
      });
      if (updateAuthUser) {
        updateAuthUser({ avatar_url: null, avatar: null });
      }
      setImageLoadFailed(false);
    } catch (err) {
      setAvatarError(err.response?.data?.error || err.message || 'Failed to remove profile picture.');
    } finally {
      setAvatarUploading(false);
    }
  };

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
    (rawEmail ? rawEmail.split('@')[0] : '');

  const rawName =
    profile?.name ||
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) ||
    user?.name ||
    storedUser?.name ||
    rawUsername ||
    'User';

  const formattedUsername = rawUsername
    ? (rawUsername.startsWith('@') ? rawUsername : `@${rawUsername}`)
    : '';

  const avatarUrl =
    profile?.profile?.preferences?.avatar_url ||
    profile?.preferences?.avatar_url ||
    profile?.avatar_url ||
    null;

  const prefs = profile?.profile?.preferences || profile?.preferences || {};

  const display = {
    name: rawName,
    username: formattedUsername,
    role: userRole,
    email: rawEmail || '—',
    avatarUrl,
    institution: profile?.profile?.institution || prefs?.institution || '—',
    company: profile?.profile?.company || prefs?.company || '—',
    career_goal: profile?.profile?.career_goal || '—',
    specialization: profile?.profile?.specialization || prefs?.specialization || '—',
    title: profile?.profile?.title || prefs?.title || prefs?.designation || '—',
    bio: profile?.profile?.bio || prefs?.bio || '',
    industry: prefs?.industry || '—',
    location: prefs?.location || '—',
    website: prefs?.website || '',
    about_company: prefs?.about_company || prefs?.company_bio || prefs?.bio || profile?.profile?.bio || '',
    department: prefs?.department || 'IT Operations & Platform Governance',
    clearance: prefs?.clearance || 'Super Administrator (Tier 1)',
    office_location: prefs?.office_location || prefs?.location || 'HQ Operations Center',
    admin_scope: prefs?.admin_scope || prefs?.bio || profile?.profile?.bio || 'Platform governance, security configuration, user management, and AI model oversight.',
    organization: profile?.profile?.institution || profile?.profile?.company || prefs?.organization || prefs?.institution || prefs?.company || 'Vayvora Technologies / EduSaaS Central',
  };

  // Build learning history from real enrollments + courses (for student view)
  const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
  const completed = enrollments.filter((e) => e.completion_percentage >= 100);
  const inProgress = enrollments.filter((e) => e.completion_percentage < 100);

  // Authored courses for educator view
  const authoredCourses = courses.filter((c) =>
    c.educator_id === targetUserId ||
    c.educator_id === user?.id ||
    c.educator_id === user?.clerk_id ||
    (educatorStats?.courses && educatorStats.courses.some((ec) => ec.id === c.id)) ||
    (c.provider && rawName && c.provider.toLowerCase() === rawName.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {isAdmin
            ? 'Administrator Profile & Platform Governance'
            : isEducator
            ? 'Educator Profile & Teaching Portfolio'
            : isEmployer
            ? 'Employer Profile & Recruitment Hub'
            : 'Education SaaS Profile Board'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin
            ? 'Manage administrative credentials, system access, and platform operations.'
            : isEducator
            ? 'Manage your professional credentials, authored courses, and teaching impact.'
            : isEmployer
            ? 'Manage your company profile, active job postings, and talent pipeline.'
            : "A complete picture of who you are, what you've learned, and what's next."}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm"
        >
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:sticky lg:top-6 lg:self-start">
          <div className="text-center">
            <div className="relative inline-block mx-auto group">
              {display.avatarUrl && !imageLoadFailed ? (
                <img
                  src={resolveAssetUrl(display.avatarUrl)}
                  alt={display.name}
                  onError={() => setImageLoadFailed(true)}
                  className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full object-cover shadow-md ring-4 ring-white transition-opacity duration-200"
                />
              ) : (
                <div
                  style={getAvatarStyle(display.name)}
                  className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full text-white grid place-items-center font-bold text-2xl sm:text-3xl shadow-md ring-4 ring-white select-none transition-all duration-300"
                >
                  {initials(display.name)}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              {/* Camera Upload Badge Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                title={display.avatarUrl ? "Change profile picture" : "Upload profile picture"}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-slate-700 shadow-md border border-slate-200 grid place-items-center hover:bg-brand-blue-50 hover:text-brand-blue-600 hover:border-brand-blue-300 transition-all transform hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {avatarUploading ? (
                  <svg className="animate-spin w-4 h-4 text-brand-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {display.avatarUrl && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={avatarUploading}
                  className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors underline cursor-pointer"
                >
                  Remove photo
                </button>
              </div>
            )}

            {avatarError && (
              <p className="text-xs text-red-600 font-medium mt-1">{avatarError}</p>
            )}

            {isEditingName ? (
              <form
                onSubmit={handleSaveName}
                className="mt-3.5 px-2 flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-1.5 w-full max-w-xs">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    autoFocus
                    placeholder="Enter your name"
                    className="w-full px-3 py-1.5 text-base font-bold text-slate-900 bg-white border border-brand-blue-400 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-blue-200 text-center"
                  />
                </div>
                {nameError && (
                  <p className="text-xs text-red-600 font-medium">{nameError}</p>
                )}
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    disabled={savingName || !nameDraft.trim()}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-brand-blue-600 hover:bg-brand-blue-700 disabled:opacity-50 rounded-md shadow-xs transition-colors"
                  >
                    {savingName ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    disabled={savingName}
                    onClick={() => {
                      setIsEditingName(false);
                      setNameError(null);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-3.5 flex items-center justify-center gap-2 px-2">
                <h3 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight truncate">
                  {display.name}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(display.name);
                    setNameError(null);
                    setIsEditingName(true);
                  }}
                  title="Edit name"
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-brand-blue-700 bg-brand-blue-50 hover:bg-brand-blue-100 border border-brand-blue-200 rounded-full transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95"
                >
                  <svg
                    className="w-3 h-3 text-brand-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <span>Edit</span>
                </button>
              </div>
            )}

            {display.username && (
              <p className="text-sm font-medium text-slate-500 mt-1 tracking-tight truncate px-2">
                {display.username}
              </p>
            )}
            <div className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block mt-2 border ${
              isAdmin
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-brand-blue-50 text-brand-blue-700 border-brand-blue-100'
            }`}>
              {isAdmin ? '🛡️ Super Administrator' : cap(display.role)}
            </div>
          </div>

          {isAdmin ? (
            <dl className="mt-6 space-y-3.5 text-sm divide-y divide-slate-100">
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Email
                </dt>
                <dd className="font-medium text-slate-800 break-all mt-0.5">{display.email}</dd>
              </div>
              {display.username && (
                <div className="pt-3.5">
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Username
                  </dt>
                  <dd className="font-medium text-slate-800 break-all mt-0.5">{display.username}</dd>
                </div>
              )}
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Organization / Institution
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.organization}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Department / Unit
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.department}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Administrative Clearance
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  {display.clearance}
                </dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Office / Station
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.office_location}</dd>
              </div>
              {display.admin_scope && (
                <div className="pt-3.5">
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Governance Scope & Oversight
                  </dt>
                  <dd className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                    {display.admin_scope}
                  </dd>
                </div>
              )}
            </dl>
          ) : isEducator ? (
            <dl className="mt-6 space-y-3.5 text-sm divide-y divide-slate-100">
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Email
                </dt>
                <dd className="font-medium text-slate-800 break-all mt-0.5">{display.email}</dd>
              </div>
              {display.username && (
                <div className="pt-3.5">
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Username
                  </dt>
                  <dd className="font-medium text-slate-800 break-all mt-0.5">{display.username}</dd>
                </div>
              )}
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Institution / Affiliation
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.institution}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Department / Specialization
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.specialization}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Designation / Title
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.title}</dd>
              </div>
              {display.bio && (
                <div className="pt-3.5">
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    About
                  </dt>
                  <dd className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                    {display.bio}
                  </dd>
                </div>
              )}
            </dl>
          ) : isEmployer ? (
            <dl className="mt-6 space-y-3.5 text-sm divide-y divide-slate-100">
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Email
                </dt>
                <dd className="font-medium text-slate-800 break-all mt-0.5">{display.email}</dd>
              </div>
              {display.username && (
                <div className="pt-3.5">
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Username
                  </dt>
                  <dd className="font-medium text-slate-800 break-all mt-0.5">{display.username}</dd>
                </div>
              )}
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Company / Organization
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.company}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Industry / Sector
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.industry}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Designation / Recruiter Role
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.title}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Location / HQ
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.location}</dd>
              </div>
              {display.website && (
                <div className="pt-3.5">
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Website
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href={display.website.startsWith('http') ? display.website : `https://${display.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-blue-600 hover:text-brand-blue-700 hover:underline break-all"
                    >
                      {display.website}
                    </a>
                  </dd>
                </div>
              )}
              {display.about_company && (
                <div className="pt-3.5">
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    About Company
                  </dt>
                  <dd className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                    {display.about_company}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <dl className="mt-6 space-y-3.5 text-sm divide-y divide-slate-100">
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Email
                </dt>
                <dd className="font-medium text-slate-800 break-all mt-0.5">{display.email}</dd>
              </div>
              {display.username && (
                <div className="pt-3.5">
                  <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Username
                  </dt>
                  <dd className="font-medium text-slate-800 break-all mt-0.5">{display.username}</dd>
                </div>
              )}
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Institution
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.institution}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Company
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.company}</dd>
              </div>
              <div className="pt-3.5">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Career Goal
                </dt>
                <dd className="font-medium text-slate-800 mt-0.5">{display.career_goal}</dd>
              </div>
            </dl>
          )}

          <Button
            variant="outline"
            className="w-full mt-6 transition-transform active:scale-[0.98]"
            onClick={() => setEditing(true)}
          >
            Edit profile
          </Button>
        </Card>

        {isAdmin ? (
          <Card
            title="Administrative Operations & Governance Shortcuts"
            className="lg:col-span-2"
            action={
              <Link
                to="/app/dashboard"
                className="text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
              >
                Admin Console →
              </Link>
            }
          >
            <div className="space-y-4">
              {/* Operational Platform Performance Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      Assessments Taken
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">
                      {adminInsights?.assessments?.count ?? 0}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Evaluated skill tests
                    </div>
                  </div>
                  <span className="text-2xl" aria-hidden="true">📝</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      Average Test Score
                    </div>
                    <div className="text-xl font-bold text-brand-blue-700 mt-0.5">
                      {adminInsights?.assessments?.average_score ?? 0}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Platform cohort score
                    </div>
                  </div>
                  <span className="text-2xl" aria-hidden="true">🎯</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      Job Applications
                    </div>
                    <div className="text-xl font-bold text-emerald-600 mt-0.5">
                      {adminInsights?.totals?.applications ?? 0}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Candidate submissions
                    </div>
                  </div>
                  <span className="text-2xl" aria-hidden="true">💼</span>
                </div>
              </div>

              {/* Administrative Governance Navigation Shortcuts */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Platform Governance Modules
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    to="/app/users"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-brand-blue-400 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-blue-50 text-brand-blue-600 grid place-items-center text-lg font-bold group-hover:scale-105 transition-transform">
                        👥
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-blue-600 transition-colors">
                          User Management
                        </div>
                        <div className="text-xs text-slate-500">
                          {adminUsers.length > 0 ? `${adminUsers.length} total registered accounts` : 'Inspect users, assign roles, & toggle access'}
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-brand-blue-600 text-xs font-semibold">Open →</span>
                  </Link>

                  <Link
                    to="/app/reports"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-brand-blue-400 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center text-lg font-bold group-hover:scale-105 transition-transform">
                        📊
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                          Reports & Audits
                        </div>
                        <div className="text-xs text-slate-500">
                          Platform trends, dropout analytics, & CSV exports
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-emerald-600 text-xs font-semibold">Open →</span>
                  </Link>

                  <Link
                    to="/app/settings"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-brand-blue-400 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 grid place-items-center text-lg font-bold group-hover:scale-105 transition-transform">
                        ⚙️
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                          System Configuration
                        </div>
                        <div className="text-xs text-slate-500">
                          Maintenance mode, session timeouts, & security
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-amber-600 text-xs font-semibold">Open →</span>
                  </Link>

                  <Link
                    to="/app/dashboard"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-brand-blue-400 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 grid place-items-center text-lg font-bold group-hover:scale-105 transition-transform">
                        🤖
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
                          AI Insights Hub
                        </div>
                        <div className="text-xs text-slate-500">
                          Missing skills radar & platform test metrics
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-purple-600 text-xs font-semibold">Open →</span>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ) : isEducator ? (
          <Card
            title={`Teaching Portfolio (${authoredCourses.length})`}
            className="lg:col-span-2"
            action={
              <Link
                to="/app/courses"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 bg-brand-blue-50 hover:bg-brand-blue-100 px-3 py-1.5 rounded-lg border border-brand-blue-200 transition-colors"
              >
                <span>+ Create Course</span>
              </Link>
            }
          >
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <SectionSkeleton lines={4} />
                <SectionSkeleton lines={4} />
              </div>
            ) : authoredCourses.length === 0 ? (
              <EmptyState
                icon="📚"
                title="You haven't authored any courses yet."
                action={
                  <Link
                    to="/app/courses"
                    className="text-brand-blue-600 hover:text-brand-blue-700 font-medium text-sm mt-2 hover:underline underline-offset-2"
                  >
                    Create your first course →
                  </Link>
                }
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {authoredCourses.map((c) => {
                  const isActive = (c.status || '').toLowerCase() === 'active';
                  return (
                    <div
                      key={c.id}
                      className="flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 bg-white hover:border-brand-blue-300 hover:shadow-sm transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {c.status || 'Active'}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 capitalize">
                            {c.difficulty || 'All levels'}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-brand-blue-600 transition-colors">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {c.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 truncate max-w-[120px]">
                          {c.category || 'General'}
                        </span>
                        <Link
                          to={`/app/courses/${c.id}`}
                          className="font-medium text-brand-blue-600 hover:text-brand-blue-700 hover:underline shrink-0"
                        >
                          View course →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        ) : isEmployer ? (
          <Card
            title={`Active Job Openings (${employerJobs.length})`}
            className="lg:col-span-2"
            action={
              <Link
                to="/app/jobs"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 bg-brand-blue-50 hover:bg-brand-blue-100 px-3 py-1.5 rounded-lg border border-brand-blue-200 transition-colors"
              >
                <span>+ Post New Job</span>
              </Link>
            }
          >
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <SectionSkeleton lines={4} />
                <SectionSkeleton lines={4} />
              </div>
            ) : employerJobs.length === 0 ? (
              <EmptyState
                icon="💼"
                title="No active job postings published yet."
                action={
                  <Link
                    to="/app/jobs"
                    className="text-brand-blue-600 hover:text-brand-blue-700 font-medium text-sm mt-2 hover:underline underline-offset-2"
                  >
                    Post your first job opening →
                  </Link>
                }
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {employerJobs.map((j) => {
                  const isOpen = (j.status || '').toLowerCase() === 'open' || (j.status || '').toLowerCase() === 'active';
                  return (
                    <div
                      key={j.id}
                      className="flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 bg-white hover:border-brand-blue-300 hover:shadow-sm transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              isOpen
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {j.status || 'Open'}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 capitalize">
                            {j.job_type || j.type || 'Full-time'}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-brand-blue-600 transition-colors">
                          {j.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {j.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 truncate max-w-[120px]">
                          {j.location || 'Remote'}
                        </span>
                        <Link
                          to="/app/jobs"
                          className="font-medium text-brand-blue-600 hover:text-brand-blue-700 hover:underline shrink-0"
                        >
                          View applicants →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        ) : (
          <Card title="Learning History" className="lg:col-span-2">
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-6">
                <SectionSkeleton />
                <SectionSkeleton />
              </div>
            ) : enrollments.length === 0 ? (
              <EmptyState
                icon="🎓"
                title="You're not enrolled in any courses yet."
                action={
                  <Link
                    to="/app/courses"
                    className="text-brand-blue-600 hover:text-brand-blue-700 font-medium text-sm mt-2 hover:underline underline-offset-2"
                  >
                    Browse courses →
                  </Link>
                }
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2.5">
                    Completed ({completed.length})
                  </div>
                  {completed.length === 0 ? (
                    <div className="text-xs text-slate-400">None yet.</div>
                  ) : (
                    <ul className="space-y-2">
                      {completed.map((e) => {
                        const c = courseById[e.course_id];
                        return (
                          <li
                            key={e.id}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-brand-green-500 shrink-0" aria-hidden="true">✓</span>
                            <span className="text-slate-700 truncate">{c?.title || 'Course'}</span>
                            {c?.provider && (
                              <span className="text-xs text-slate-400 shrink-0">({c.provider})</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2.5">
                    In Progress ({inProgress.length})
                  </div>
                  {inProgress.length === 0 ? (
                    <div className="text-xs text-slate-400">None.</div>
                  ) : (
                    <ul className="space-y-3">
                      {inProgress.map((e) => {
                        const c = courseById[e.course_id];
                        const pct = Math.round(e.completion_percentage);
                        return (
                          <li key={e.id}>
                            <div className="flex justify-between text-xs mb-1 gap-2">
                              <span className="text-slate-700 truncate">{c?.title || 'Course'}</span>
                              <span className="font-semibold text-slate-800 shrink-0">{pct}%</span>
                            </div>
                            <div
                              className="h-1.5 bg-slate-100 rounded-full overflow-hidden"
                              role="progressbar"
                              aria-valuenow={pct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${c?.title || 'Course'} progress`}
                            >
                              <div
                                className="h-full bg-brand-blue-500 rounded-full transition-[width] duration-500 ease-out"
                                style={{ width: `${e.completion_percentage}%` }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {!loading && certs.length > 0 && (
              <div className="border-t border-slate-100 pt-4 mt-5">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2.5">
                  Certificates ({certs.length})
                </div>
                <ul className="space-y-2 text-sm">
                  {certs.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50 transition-colors"
                    >
                      <span aria-hidden="true">📜</span>
                      <span className="font-mono text-xs text-slate-700">{c.certificate_code}</span>
                      <span className="text-xs text-slate-400">
                        issued {new Date(c.issued_date).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card
            title="Platform Scale & Role Distribution"
            action={
              <Link
                to="/app/users"
                className="text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
              >
                All Users Directory →
              </Link>
            }
          >
            {loading ? (
              <SectionSkeleton lines={4} />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Total Accounts
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {adminInsights?.totals?.users ?? adminUsers.length}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Registered users</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Published Courses
                    </div>
                    <div className="text-2xl font-bold text-brand-blue-600 mt-1">
                      {adminInsights?.totals?.courses ?? courses.length}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Active curriculum</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Total Enrollments
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">
                      {adminInsights?.totals?.enrollments ?? '—'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Course participants</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Open Job Listings
                    </div>
                    <div className="text-2xl font-bold text-amber-600 mt-1">
                      {adminInsights?.totals?.jobs ?? '—'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Active hiring postings</div>
                  </div>
                </div>

                {/* Role Breakdown Bar */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700">Platform User Distribution</span>
                    <span className="text-slate-400">{adminUsers.length} total accounts</span>
                  </div>
                  {(() => {
                    const total = adminUsers.length || 1;
                    const sCount = adminUsers.filter((u) => (u.role || '').toLowerCase() === 'student').length;
                    const eCount = adminUsers.filter((u) => (u.role || '').toLowerCase() === 'educator').length;
                    const emCount = adminUsers.filter((u) => (u.role || '').toLowerCase() === 'employer').length;
                    const aCount = adminUsers.filter((u) => (u.role || '').toLowerCase() === 'admin').length;
                    const sPct = Math.round((sCount / total) * 100);
                    const ePct = Math.round((eCount / total) * 100);
                    const emPct = Math.round((emCount / total) * 100);
                    const aPct = Math.max(0, 100 - sPct - ePct - emPct);

                    return (
                      <div>
                        <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
                          <div style={{ width: `${sPct}%` }} className="bg-brand-blue-500 transition-all" title={`Students: ${sCount}`} />
                          <div style={{ width: `${ePct}%` }} className="bg-emerald-500 transition-all" title={`Educators: ${eCount}`} />
                          <div style={{ width: `${emPct}%` }} className="bg-amber-500 transition-all" title={`Employers: ${emCount}`} />
                          <div style={{ width: `${aPct}%` }} className="bg-purple-500 transition-all" title={`Admins: ${aCount}`} />
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2.5 text-[11px]">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full bg-brand-blue-500 shrink-0" />
                            <span className="text-slate-600 truncate">Students ({sPct}%)</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-600 truncate">Educators ({ePct}%)</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-slate-600 truncate">Employers ({emPct}%)</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                            <span className="text-slate-600 truncate">Admins ({aPct}%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </Card>

          <Card
            title="System Activity & Announcements"
            action={
              <Link
                to="/app/announcements"
                className="text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
              >
                Broadcast Center →
              </Link>
            }
          >
            {loading ? (
              <SectionSkeleton lines={4} />
            ) : (
              <div className="space-y-3">
                {/* Recent Users / Audit Snippet */}
                {adminUsers.slice(0, 3).map((u) => (
                  <div key={u.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-brand-blue-100 text-brand-blue-700 font-semibold grid place-items-center text-[10px] shrink-0">
                        {(u.name || '?')[0]}
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 truncate block">{u.name}</span>
                        <span className="text-slate-400 text-[10px] truncate block">{u.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-white border border-slate-200 text-slate-600 shrink-0">
                      {u.role}
                    </span>
                  </div>
                ))}

                {/* System Announcements */}
                {announcements.slice(0, 2).map((a) => (
                  <div key={a.id} className="p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-all text-xs">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-slate-800 truncate">{a.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Notice'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] line-clamp-1">{a.message}</p>
                  </div>
                ))}

                <Link
                  to="/app/announcements"
                  className="block text-center py-2 text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 bg-brand-blue-50/60 hover:bg-brand-blue-50 rounded-lg border border-brand-blue-100 transition-colors"
                >
                  + Send Platform Broadcast
                </Link>
              </div>
            )}
          </Card>
        </div>
      ) : isEducator ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card
            title="Teaching Impact & Reach"
            action={
              <Link
                to="/app/insights"
                className="text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
              >
                Learner Insights →
              </Link>
            }
          >
            {loading ? (
              <SectionSkeleton lines={4} />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Enrolled Learners
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {educatorStats?.enrolledLearners ?? 0}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Across all authored courses
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Avg Completion
                    </div>
                    <div className="text-2xl font-bold text-brand-blue-600 mt-1">
                      {educatorStats?.avgCompletion ?? 0}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Student progress rate
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Active Courses
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {educatorStats?.activeCourses ?? authoredCourses.filter((c) => (c.status || '').toLowerCase() === 'active').length}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Published & live
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Course Feedback
                    </div>
                    {educatorStats?.avgRating ? (
                      <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1">
                        <span>★</span>
                        <span>{educatorStats.avgRating}</span>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-slate-400 mt-1">
                        —
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {educatorStats?.courseRatings
                        ? `${educatorStats.courseRatings} review${educatorStats.courseRatings === 1 ? '' : 's'}`
                        : 'No reviews yet'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">Cohort Completion Rate</span>
                    <span className="font-bold text-slate-900">{educatorStats?.avgCompletion ?? 0}%</span>
                  </div>
                  <div
                    className="h-2 bg-slate-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={educatorStats?.avgCompletion ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-brand-blue-500 to-indigo-500 rounded-full transition-[width] duration-500 ease-out"
                      style={{ width: `${Math.min(100, educatorStats?.avgCompletion ?? 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card
            title={`Announcements (${announcements.length})`}
            action={
              <Link
                to="/app/announcements"
                className="text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
              >
                Manage →
              </Link>
            }
          >
            {loading ? (
              <SectionSkeleton lines={3} />
            ) : announcements.length === 0 ? (
              <EmptyState
                icon="📢"
                title="No announcements published yet."
                action={
                  <Link
                    to="/app/announcements"
                    className="text-brand-blue-600 hover:text-brand-blue-700 font-medium text-sm mt-2 hover:underline underline-offset-2"
                  >
                    Post an announcement →
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-3">
                {announcements.slice(0, 4).map((a) => (
                  <li
                    key={a.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {a.title}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                        {a.audience || 'All'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {a.message}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                      <span>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </span>
                      <Link to="/app/announcements" className="text-brand-blue-600 font-medium hover:underline">
                        View details
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : isEmployer ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card
            title="Recruitment Pipeline & Reach"
            action={
              <Link
                to="/app/candidates"
                className="text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
              >
                Candidate Pool →
              </Link>
            }
          >
            {loading ? (
              <SectionSkeleton lines={4} />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Active Openings
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {employerStats?.jobOpenings ?? employerJobs.filter((j) => (j.status || '').toLowerCase() === 'open' || (j.status || '').toLowerCase() === 'active').length}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Accepting candidates
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Total Applicants
                    </div>
                    <div className="text-2xl font-bold text-brand-blue-600 mt-1">
                      {employerStats?.newApplicants ?? 0}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Received applications
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Top AI Matches
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">
                      {employerStats?.topMatches ?? 0}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      High assessment fits
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Pre-Qualified
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {(employerStats?.candidateMatches?.strong || 0) + (employerStats?.candidateMatches?.good || 0)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Benchmarked talent
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">Candidate Match Distribution</span>
                    <span className="font-bold text-slate-900">
                      {employerStats?.topMatches ? `${employerStats.topMatches} Strong Matches` : 'Ready to hire'}
                    </span>
                  </div>
                  <div
                    className="h-2 bg-slate-100 rounded-full overflow-hidden flex"
                    role="progressbar"
                  >
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          employerStats?.candidateMatches?.strong
                            ? (employerStats.candidateMatches.strong / Math.max(1, (employerStats?.candidateMatches?.strong || 0) + (employerStats?.candidateMatches?.good || 0) + (employerStats?.candidateMatches?.possible || 0))) * 100
                            : 45
                        )}%`,
                      }}
                      title="Strong Matches"
                    />
                    <div
                      className="h-full bg-brand-blue-500"
                      style={{
                        width: `${Math.min(
                          100,
                          employerStats?.candidateMatches?.good
                            ? (employerStats.candidateMatches.good / Math.max(1, (employerStats?.candidateMatches?.strong || 0) + (employerStats?.candidateMatches?.good || 0) + (employerStats?.candidateMatches?.possible || 0))) * 100
                            : 35
                        )}%`,
                      }}
                      title="Good Matches"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Strong Fit
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-blue-500 inline-block" /> Good Fit
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Potential Fit
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card
            title={`Hiring Updates & Announcements (${announcements.length})`}
            action={
              <Link
                to="/app/candidates"
                className="text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
              >
                Explore Candidates →
              </Link>
            }
          >
            {loading ? (
              <SectionSkeleton lines={3} />
            ) : announcements.length === 0 ? (
              <EmptyState
                icon="📢"
                title="No recruitment announcements published yet."
                action={
                  <Link
                    to="/app/candidates"
                    className="text-brand-blue-600 hover:text-brand-blue-700 font-medium text-sm mt-2 hover:underline underline-offset-2"
                  >
                    Explore candidate talent pool →
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-3">
                {announcements.slice(0, 4).map((a) => (
                  <li
                    key={a.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {a.title}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                        {a.audience || 'All'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {a.message}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                      <span>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </span>
                      <Link to="/app/candidates" className="text-brand-blue-600 font-medium hover:underline">
                        View talent
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card title="Gap Analysis">
            {loading ? (
              <SectionSkeleton lines={4} />
            ) : (
              <>
                <div className="mb-3 text-sm text-slate-600">
                  Target role:{' '}
                  <span className="font-semibold text-slate-800">{display.career_goal}</span>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">Gap score</span>
                    <span className="text-brand-orange-600 font-bold">
                      {gap?.readiness_score ?? 0}% readiness
                    </span>
                  </div>
                  <div
                    className="h-1.5 bg-slate-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={gap?.readiness_score ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Readiness score"
                  >
                    <div
                      className="h-full bg-brand-orange-500 rounded-full transition-[width] duration-500 ease-out"
                      style={{ width: `${gap?.readiness_score ?? 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2.5">
                    Missing skills
                  </div>
                  {(gap?.missing_skills || []).length === 0 ? (
                    <div className="text-xs text-slate-400">
                      Take an assessment to generate your gap report.
                    </div>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {gap.missing_skills.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-slate-700">
                          <span className="text-brand-orange-500 shrink-0" aria-hidden="true">⚠</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </Card>

          <Card title={`Achievements (${achievements.length})`}>
            {loading ? (
              <SectionSkeleton lines={3} />
            ) : achievements.length === 0 ? (
              <EmptyState icon="🏅" title="No badges yet." />
            ) : (
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {achievements.slice(0, 6).map((a, aIdx) => (
                  <li
                    key={a.id || a.badge_name || `ach-${aIdx}`}
                    className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                  >
                    <span className="text-xl shrink-0" aria-hidden="true">🏅</span>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 truncate">{a.badge_name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{a.milestone}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!loading && recs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2.5">
                  Recommended for you
                </div>
                <ul className="space-y-2 text-sm">
                  {recs
                    .filter((r) => r.type !== "ai_suggestions" && (r.course?.title || r.title))
                    .slice(0, 3)
                    .map((r, rIdx) => (
                      <li
                        key={r.id || r.course_id || `rec-item-${rIdx}`}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50 transition-colors"
                      >
                        <span aria-hidden="true">📘</span>
                        <span className="font-medium text-slate-800 truncate">
                          {r.course?.title || r.title}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </Card>

          <Card
            title={`Course Announcements (${announcements.length})`}
            action={
              <span className="text-xs text-slate-400">Updates & Notices</span>
            }
          >
            {loading ? (
              <SectionSkeleton lines={3} />
            ) : announcements.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">
                No course announcements yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {announcements.slice(0, 4).map((a, aIdx) => (
                  <li key={a.id || `announcement-${aIdx}`} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-800">
                        {a.title}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 shrink-0">
                        {a.audience === 'course' ? 'My Course' : 'All'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {a.message}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                      <span>
                        {a.educator?.name ? `By ${a.educator.name} • ` : ''}
                        {a.created_at ? new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </span>
                      <Link to="/app/dashboard" className="text-brand-blue-600 font-medium hover:underline">
                        View in Dashboard
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] grid place-items-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditing(false);
          }}
        >
          <form
            onSubmit={onSave}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="edit-profile-title" className="font-semibold text-lg text-slate-900">
                Edit {isAdmin ? 'Administrator Profile' : isEducator ? 'Educator Profile' : isEmployer ? 'Employer Profile' : 'Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Close"
                className="text-slate-400 hover:text-slate-600 rounded-md w-7 h-7 grid place-items-center hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
              >
                ✕
              </button>
            </div>

            {isAdmin ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="organization" className="text-xs font-medium text-slate-500">
                    Organization / Institution
                  </label>
                  <input
                    id="organization"
                    value={draft.institution}
                    onChange={(e) => setDraft({ ...draft, institution: e.target.value })}
                    placeholder="e.g. Vayvora Technologies / EduSaaS Central"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="text-xs font-medium text-slate-500">
                    Department / Governance Unit
                  </label>
                  <input
                    id="department"
                    value={draft.department}
                    onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                    placeholder="e.g. IT Operations & Platform Governance"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="title" className="text-xs font-medium text-slate-500">
                      Administrative Title
                    </label>
                    <input
                      id="title"
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="e.g. Lead Systems Admin"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="clearance" className="text-xs font-medium text-slate-500">
                      Clearance Level
                    </label>
                    <input
                      id="clearance"
                      value={draft.clearance}
                      onChange={(e) => setDraft({ ...draft, clearance: e.target.value })}
                      placeholder="e.g. Super Administrator"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="office_location" className="text-xs font-medium text-slate-500">
                    Office / Station Location
                  </label>
                  <input
                    id="office_location"
                    value={draft.office_location}
                    onChange={(e) => setDraft({ ...draft, office_location: e.target.value })}
                    placeholder="e.g. HQ — Operations Center / Hybrid"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="admin_scope" className="text-xs font-medium text-slate-500">
                    Administrative Scope & Oversight
                  </label>
                  <textarea
                    id="admin_scope"
                    rows={3}
                    value={draft.admin_scope}
                    onChange={(e) => setDraft({ ...draft, admin_scope: e.target.value })}
                    placeholder="Brief summary of governance scope (e.g. cross-platform access, security configuration, uptime, AI models)..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100 resize-none"
                  />
                </div>
              </div>
            ) : isEducator ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="institution" className="text-xs font-medium text-slate-500">
                    Institution / University / Organization
                  </label>
                  <input
                    id="institution"
                    value={draft.institution}
                    onChange={(e) => setDraft({ ...draft, institution: e.target.value })}
                    placeholder="e.g. Stanford University / Tech Academy"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="specialization" className="text-xs font-medium text-slate-500">
                    Department / Area of Specialization
                  </label>
                  <input
                    id="specialization"
                    value={draft.specialization}
                    onChange={(e) => setDraft({ ...draft, specialization: e.target.value })}
                    placeholder="e.g. Computer Science & Artificial Intelligence"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="title" className="text-xs font-medium text-slate-500">
                    Designation / Title
                  </label>
                  <input
                    id="title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="e.g. Senior Professor / Lead Instructor"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="text-xs font-medium text-slate-500">
                    Teaching Bio & Research Interests
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={draft.bio}
                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                    placeholder="Brief bio about your teaching journey, research interests, or course goals..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100 resize-none"
                  />
                </div>
              </div>
            ) : isEmployer ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="company" className="text-xs font-medium text-slate-500">
                    Company / Organization Name
                  </label>
                  <input
                    id="company"
                    value={draft.company}
                    onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                    placeholder="e.g. Vayvora Technologies / Google"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="industry" className="text-xs font-medium text-slate-500">
                    Industry / Sector
                  </label>
                  <input
                    id="industry"
                    value={draft.industry}
                    onChange={(e) => setDraft({ ...draft, industry: e.target.value })}
                    placeholder="e.g. Artificial Intelligence & Cloud Services"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="title" className="text-xs font-medium text-slate-500">
                    Designation / Recruiter Role
                  </label>
                  <input
                    id="title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="e.g. Head of Talent Acquisition / Technical Recruiter"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="text-xs font-medium text-slate-500">
                    Location / Headquarters
                  </label>
                  <input
                    id="location"
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    placeholder="e.g. Hyderabad, India / Remote"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="text-xs font-medium text-slate-500">
                    Company Website
                  </label>
                  <input
                    id="website"
                    value={draft.website}
                    onChange={(e) => setDraft({ ...draft, website: e.target.value })}
                    placeholder="e.g. https://vayvoratech.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="about_company" className="text-xs font-medium text-slate-500">
                    About Company & Hiring Mission
                  </label>
                  <textarea
                    id="about_company"
                    rows={3}
                    value={draft.about_company}
                    onChange={(e) => setDraft({ ...draft, about_company: e.target.value, bio: e.target.value })}
                    placeholder="Share what your company does, culture, and what type of candidate talent you seek..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="career_goal" className="text-xs font-medium text-slate-500">
                    Career goal
                  </label>
                  <input
                    id="career_goal"
                    value={draft.career_goal}
                    onChange={(e) => setDraft({ ...draft, career_goal: e.target.value })}
                    placeholder="e.g. Cloud Engineer"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="institution" className="text-xs font-medium text-slate-500">
                    Institution
                  </label>
                  <input
                    id="institution"
                    value={draft.institution}
                    onChange={(e) => setDraft({ ...draft, institution: e.target.value })}
                    placeholder="e.g. XYZ University"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="text-xs font-medium text-slate-500">
                    Company
                  </label>
                  <input
                    id="company"
                    value={draft.company}
                    onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 outline-none transition-colors focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="min-w-[84px]">
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>

            {/* Resume - only for students */}
            {!isEducator && !isEmployer && !isAdmin && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="text-xs font-medium text-slate-500">
                  Resume
                </label>

                {profile?.profile?.resume ? (
                  <div className="mt-1.5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                        <span className="text-lg">📄</span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {profile.profile.resume.file_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Resume uploaded
                        </p>
                      </div>
                    </div>

                    <label className="shrink-0 cursor-pointer">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                        Replace
                      </span>

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) =>
                          setResumeFile(e.target.files?.[0] || null)
                        }
                      />
                    </label>
                  </div>
                ) : (
                  <label className="mt-1.5 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <span className="text-lg">📄</span>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        Upload your resume
                      </p>
                      <p className="text-xs text-slate-400">
                        PDF, DOC or DOCX · Max 5 MB
                      </p>
                    </div>

                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-brand-blue-600 text-white text-xs font-medium hover:bg-brand-blue-700 transition-colors">
                      Upload
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) =>
                        setResumeFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                )}

                {resumeFile && (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                    <span className="text-xs text-blue-700 truncate">
                      Selected: {resumeFile.name}
                    </span>

                    <Button
                      type="button"
                      onClick={onResumeUpload}
                      disabled={resumeUploading}
                      className="text-xs px-3 py-1.5 shrink-0"
                    >
                      {resumeUploading ? "Uploading…" : "Confirm Upload"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}