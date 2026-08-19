import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import {
  getUserProfile, fetchGapReport, saveUserProfile, uploadProfileResume,
  getMyEnrollments, getCourses, getMyAchievements,
  getMyCertificates, getMyRecommendations,
} from '../services/api';

const initials = (name) =>
  (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

// Deterministic accent so the same person always gets the same avatar color,
// instead of every avatar looking identical.
const AVATAR_RING = [
  'from-brand-blue-400 to-brand-blue-600',
  'from-violet-400 to-violet-600',
  'from-brand-green-400 to-brand-green-600',
  'from-brand-orange-400 to-brand-orange-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
];
const avatarGradient = (name) => {
  const s = name || '?';
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_RING[hash % AVATAR_RING.length];
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
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);          // /api/users/:id response
  const [gap, setGap] = useState(null);                  // gap report
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certs, setCerts] = useState([]);
  const [recs, setRecs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ career_goal: '', institution: '', company: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.allSettled([
      getUserProfile(user.id).then(setProfile),
      fetchGapReport(user.id).then(setGap),
      getMyEnrollments().then(setEnrollments),
      getCourses().then(setCourses),
      getMyAchievements().then(setAchievements),
      getMyCertificates().then(setCerts),
      getMyRecommendations().then(setRecs),
    ]).finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (profile?.profile) {
      setDraft({
        career_goal: profile.profile.career_goal || '',
        institution: profile.profile.institution || '',
        company: profile.profile.company || '',
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
  if (!resumeFile || !user?.id) return;

  setResumeUploading(true);
  setError(null);

  try {
    const result = await uploadProfileResume(
      user.id,
      resumeFile
    );

    setProfile((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
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
    setSaving(true); setError(null);
    try {
      const saved = await saveUserProfile(user.id, draft);
      setProfile((p) => ({ ...p, profile: saved }));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const display = {
    name: profile?.name || user?.name || '—',
    role: profile?.role || user?.role || '—',
    email: profile?.email || user?.email || '—',
    institution: profile?.profile?.institution || '—',
    company: profile?.profile?.company || '—',
    career_goal: profile?.profile?.career_goal || '—',
  };

  // Build learning history from real enrollments + courses
  const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
  const completed = enrollments.filter((e) => e.completion_percentage >= 100);
  const inProgress = enrollments.filter((e) => e.completion_percentage < 100);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Education SaaS Profile Board
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          A complete picture of who you are, what you&apos;ve learned, and what&apos;s next.
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
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br ${avatarGradient(
                display.name,
              )} text-white grid place-items-center font-semibold text-2xl sm:text-3xl shadow-md ring-4 ring-white`}
            >
              {initials(display.name)}
            </div>
            <h3 className="mt-3 font-bold text-lg text-slate-900 truncate px-2">
              {display.name}
            </h3>
            <div className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-blue-50 text-brand-blue-700 border border-brand-blue-100 inline-block mt-1.5">
              {cap(display.role)}
            </div>
          </div>

          <dl className="mt-6 space-y-3.5 text-sm divide-y divide-slate-100">
            <div>
              <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Email
              </dt>
              <dd className="font-medium text-slate-800 break-all mt-0.5">{display.email}</dd>
            </div>
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

          <Button
            variant="outline"
            className="w-full mt-6 transition-transform active:scale-[0.98]"
            onClick={() => setEditing(true)}
          >
            Edit profile
          </Button>
        </Card>

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
      </div>

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
              {achievements.slice(0, 6).map((a) => (
                <li
                  key={a.id}
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
                {recs.slice(0, 3).map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-slate-50 transition-colors"
                  >
                    <span aria-hidden="true">📘</span>
                    <span className="font-medium text-slate-800 truncate">
                      {r.course?.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

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
                Edit profile
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

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="min-w-[84px]">
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>

           {/* Resume */}
<div>
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
          </form>
        </div>
      )}
    </div>
  );
}