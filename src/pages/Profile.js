import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import {
  getUserProfile, fetchGapReport, saveUserProfile,
  getMyEnrollments, getCourses, getMyAchievements,
  getMyCertificates, getMyRecommendations,
} from '../services/api';

const initials = (name) =>
  (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

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

  useEffect(() => {
    if (!user?.id) return;
    getUserProfile(user.id).then(setProfile).catch(() => {});
    fetchGapReport(user.id).then(setGap).catch(() => {});
    getMyEnrollments().then(setEnrollments).catch(() => {});
    getCourses().then(setCourses).catch(() => {});
    getMyAchievements().then(setAchievements).catch(() => {});
    getMyCertificates().then(setCerts).catch(() => {});
    getMyRecommendations().then(setRecs).catch(() => {});
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Education SaaS Profile Board</h2>
        <p className="text-sm text-slate-500">
          A complete picture of who you are, what you&apos;ve learned, and what&apos;s next.
        </p>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <div className="text-center">
            <div className="w-28 h-28 mx-auto rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-3xl ring-4 ring-brand-blue-50">
              {initials(display.name)}
            </div>
            <h3 className="mt-3 font-bold text-lg text-slate-900">{display.name}</h3>
            <div className="text-xs px-2 py-0.5 rounded-full bg-brand-blue-100 text-brand-blue-700 inline-block mt-1">
              {cap(display.role)}
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <div>
              <div className="text-xs text-slate-500">Email</div>
              <div className="font-medium text-slate-800 break-all">{display.email}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Institution</div>
              <div className="font-medium text-slate-800">{display.institution}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Company</div>
              <div className="font-medium text-slate-800">{display.company}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Career Goal</div>
              <div className="font-medium text-slate-800">{display.career_goal}</div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-5" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        </Card>

        <Card title="Learning History" className="lg:col-span-2">
          {enrollments.length === 0 ? (
            <div className="text-sm text-slate-500 py-6 text-center">
              You&apos;re not enrolled in any courses yet.{' '}
              <Link to="/app/courses" className="text-brand-blue-600 hover:underline">
                Browse courses →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                  Completed ({completed.length})
                </div>
                {completed.length === 0 ? (
                  <div className="text-xs text-slate-400">None yet.</div>
                ) : (
                  <ul className="space-y-1.5">
                    {completed.map((e) => {
                      const c = courseById[e.course_id];
                      return (
                        <li key={e.id} className="flex items-center gap-2">
                          <span className="text-brand-green-500">✓</span>
                          <span>{c?.title || 'Course'}</span>
                          {c?.provider && (
                            <span className="text-xs text-slate-400">({c.provider})</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                  In Progress ({inProgress.length})
                </div>
                {inProgress.length === 0 ? (
                  <div className="text-xs text-slate-400">None.</div>
                ) : (
                  <ul className="space-y-2">
                    {inProgress.map((e) => {
                      const c = courseById[e.course_id];
                      return (
                        <li key={e.id}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span>{c?.title || 'Course'}</span>
                            <span className="font-semibold">{Math.round(e.completion_percentage)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-blue-500"
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

          {certs.length > 0 && (
            <div className="border-t border-slate-100 pt-4 mt-5">
              <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                Certificates ({certs.length})
              </div>
              <ul className="space-y-1.5 text-sm">
                {certs.map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <span>📜</span>
                    <span className="font-mono text-xs">{c.certificate_code}</span>
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
          <div className="mb-3 text-sm text-slate-600">
            Target Role:{' '}
            <span className="font-semibold text-slate-800">{display.career_goal}</span>
          </div>
          <div className="mb-4 text-sm">
            Gap Score:{' '}
            <span className="text-brand-orange-600 font-bold">
              {gap?.readiness_score ?? 0}% Readiness
            </span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Missing Skills</div>
            {(gap?.missing_skills || []).length === 0 ? (
              <div className="text-xs text-slate-400">
                Take an assessment to generate your gap report.
              </div>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {gap.missing_skills.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-slate-700">
                    <span className="text-brand-orange-500">⚠</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card title={`Achievements (${achievements.length})`}>
          {achievements.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No badges yet.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {achievements.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100">
                  <span className="text-xl">🏅</span>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 truncate">{a.badge_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{a.milestone}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {recs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                Recommended for you
              </div>
              <ul className="space-y-1.5 text-sm">
                {recs.slice(0, 3).map((r) => (
                  <li key={r.id} className="flex items-center gap-2">
                    <span>📘</span>
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
        <div className="fixed inset-0 bg-slate-900/40 grid place-items-center z-50 p-4">
          <form onSubmit={onSave} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-lg mb-4">Edit profile</h3>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Career goal</label>
              <input
                value={draft.career_goal}
                onChange={(e) => setDraft({ ...draft, career_goal: e.target.value })}
                placeholder="e.g. Cloud Engineer"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Institution</label>
              <input
                value={draft.institution}
                onChange={(e) => setDraft({ ...draft, institution: e.target.value })}
                placeholder="e.g. XYZ University"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-5">
              <label className="text-xs text-slate-500">Company</label>
              <input
                value={draft.company}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                placeholder="e.g. Acme Corp"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
