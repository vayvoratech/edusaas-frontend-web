import React, { useEffect, useState } from 'react';
import { Card, StatPill } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getJobs,  getEligibleStudents, inviteCandidate, getUserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from "react-router-dom";

const initials = (n) => (n || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function Candidates() {
  const location = useLocation();
  const selectedCandidate = location.state?.candidate;
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  // Modals
  const [viewing, setViewing] = useState(null);          // candidate selected for View Profile
  const [viewProfile, setViewProfile] = useState(null);  // hydrated profile from API
  const [viewLoading, setViewLoading] = useState(false);

  const [inviting, setInviting] = useState(null);        // candidate selected for Invite
  const [inviteJob, setInviteJob] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
  if (!user?.id) return;

  getJobs({ employer_id: user.id })
    .then(async (js) => {
      setJobs(js);

      if (!js.length) {
        setCandidates([]);
        return;
      }

      // Use the employer's first posted job
      const job = js[0];

      setInviteJob(job.id);

      try {
        const response = await getEligibleStudents(job.id);

        console.log("ELIGIBLE STUDENTS:", response);

        setCandidates(response.eligible_students || []);
      } catch (e) {
        setError(
          e.response?.data?.error || e.message
        );
        setCandidates([]);
      }
    })
    .catch((e) => {
      setError(
        e.response?.data?.error || e.message
      );
    });
}, [user?.id]);

 const filtered = candidates.filter((c) =>
  !q ||
  c.name?.toLowerCase().includes(q.toLowerCase()) ||
  c.domain_role?.toLowerCase().includes(q.toLowerCase()) ||
  c.fit_category?.toLowerCase().includes(q.toLowerCase())
);

  const openView = async (c) => {
    setViewing(c);
    setViewProfile(null);
    setViewLoading(true);
    try {
      const p = await getUserProfile(c.id);
      setViewProfile(p);
    } catch (_) {
      setViewProfile(null);
    } finally {
      setViewLoading(false);
    }
  };

  const openInvite = (c) => {
    setInviting(c);
    setInviteMessage(
      `Hi ${c.name?.split(' ')[0] || 'there'}, we'd love for you to apply to one of our roles.`
    );
    setInviteError(null);
    setInviteSent(false);
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!inviteJob) {
      setInviteError('Pick a job to invite for.');
      return;
    }
    setInviteBusy(true);
    setInviteError(null);
    try {
      await inviteCandidate(inviteJob, inviting.id, inviteMessage);
      setInviteSent(true);
    } catch (err) {
      setInviteError(err.response?.data?.error || err.message);
    } finally {
      setInviteBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Candidates</h2>
          <p className="text-sm text-slate-500">Skill-matched students for your open roles.</p>
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search candidates…"
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm w-64"
        />
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-sm shrink-0">
              {initials(c.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-800 truncate">{c.name}</div>
              <div className="text-xs text-slate-500 truncate">{c.role_target}</div>
            </div>
            <StatPill label="Match" value={`${c.skill_match}%`} tone={c.skill_match >= 80 ? 'green' : c.skill_match >= 60 ? 'orange' : 'slate'} />
            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => openView(c)}>
              View Profile
            </Button>
            <Button size="sm" className="w-full sm:w-auto" onClick={() => openInvite(c)}>
              Invite
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <Card className="md:col-span-2">
            <p className="text-sm text-slate-500 text-center py-6">No candidates match.</p>
          </Card>
        )}
      </div>

      {/* View Profile modal */}
      {viewing && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in"
          onClick={() => setViewing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold">
                {initials(viewing.name)}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{viewing.name}</h3>
                <div className="text-xs text-slate-500 truncate">{viewing.email}</div>
              </div>
            </div>

            {viewLoading ? (
              <p className="text-sm text-slate-500">Loading profile…</p>
            ) : (
              <dl className="space-y-2 text-sm">
                <Row k="Role" v={viewProfile?.role || viewing.role || '—'} />
                <Row k="Target role" v={viewing.role_target} />
                <Row k="Skill match" v={`${viewing.skill_match}%`} />
                <Row k="Career goal" v={viewProfile?.profile?.career_goal || '—'} />
                <Row k="Institution" v={viewProfile?.profile?.institution || '—'} />
                <Row k="Company" v={viewProfile?.profile?.company || '—'} />
                <Row
                  k="Last login"
                  v={viewProfile?.last_login ? new Date(viewProfile.last_login).toLocaleString() : '—'}
                />
              </dl>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              <Button
                onClick={() => {
                  setViewing(null);
                  openInvite(viewing);
                }}
              >
                Invite this candidate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {inviting && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in"
          onClick={() => !inviteBusy && setInviting(null)}
        >
          <form
            onSubmit={sendInvite}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="font-semibold text-lg">Invite {inviting.name}</h3>
            <p className="text-sm text-slate-500 mb-4">
              Sends an in-app notification to the candidate.
            </p>

            {jobs.length === 0 ? (
              <div className="p-3 mb-3 rounded-lg bg-amber-50 text-amber-700 text-sm">
                You have no jobs to invite for yet. Post a job first.
              </div>
            ) : (
              <div className="mb-3">
                <label className="text-xs text-slate-500">Job</label>
                <select
                  value={inviteJob}
                  onChange={(e) => setInviteJob(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} · {j.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-5">
              <label className="text-xs text-slate-500">Message</label>
              <textarea
                rows={4}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>

            {inviteError && (
              <div className="p-3 mb-3 rounded-lg bg-red-50 text-red-600 text-sm">{inviteError}</div>
            )}
            {inviteSent && (
              <div className="p-3 mb-3 rounded-lg bg-brand-green-50 text-brand-green-700 text-sm">
                ✓ Invite sent.
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setInviting(null)} disabled={inviteBusy}>
                {inviteSent ? 'Close' : 'Cancel'}
              </Button>
              {!inviteSent && (
                <Button type="submit" disabled={inviteBusy || jobs.length === 0}>
                  {inviteBusy ? 'Sending…' : 'Send invite'}
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-slate-800 text-right break-words max-w-[60%]">{v}</dd>
    </div>
  );
}
