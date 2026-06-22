import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAnnouncements, sendAnnouncement } from '../services/api';

const fmtRel = (iso) => {
  const diff = (new Date() - new Date(iso)) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
};

const DRAFT_KEY = 'edu_announcement_draft';

export default function SendAnnouncement() {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('all');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState('send-now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sentOk, setSentOk] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [recent, setRecent] = useState([]);

  const load = async () => {
    try { setRecent(await getAnnouncements()); }
    catch (_) {}
  };
  useEffect(() => {
    load();
    // restore draft if present
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setTitle(d.title || '');
        setAudience(d.audience || 'all');
        setMessage(d.message || '');
        setSchedule(d.schedule || 'send-now');
        setScheduledAt(d.scheduledAt || '');
      }
    } catch (_) {}
  }, []);

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, audience, message, schedule, scheduledAt }));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch (_) {
      setError('Could not save draft.');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSentOk(false);
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }
    setSending(true);
    try {
      await sendAnnouncement({
        title: title.trim(), message: message.trim(), audience,
        scheduled_at: schedule === 'schedule-later' && scheduledAt ? scheduledAt : null,
      });
      setSentOk(true);
      setTitle(''); setMessage('');
      localStorage.removeItem(DRAFT_KEY);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Send Announcement</h2>
        <p className="text-sm text-slate-500">Reach learners with updates, exam reminders, or notices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Upcoming Course Update"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              >
                <option value="all">All Learners</option>
                <option value="course">My Course Learners</option>
                <option value="educators">Educators only</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Message</label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hello everyone, …"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-1.5">
                <input type="radio" checked={schedule === 'send-now'} onChange={() => setSchedule('send-now')} />
                Send Now
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" checked={schedule === 'schedule-later'} onChange={() => setSchedule('schedule-later')} />
                Schedule Later
              </label>
              {schedule === 'schedule-later' && (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              )}
            </div>

            {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
            {sentOk && <div className="p-3 rounded-lg bg-brand-green-50 text-brand-green-700 text-sm">✓ Announcement sent.</div>}
            {draftSaved && <div className="p-3 rounded-lg bg-brand-blue-50 text-brand-blue-700 text-sm">💾 Draft saved locally. It will be restored next time you open this page.</div>}

            <div className="flex gap-2 flex-wrap">
              <Button type="submit" disabled={sending}>
                {sending ? 'Sending…' : schedule === 'send-now' ? 'Send Now' : 'Schedule'}
              </Button>
              <Button type="button" variant="outline" onClick={saveDraft}>Save Draft</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!title.trim() && !message.trim()) {
                    setError('Add a title or message to preview.');
                    return;
                  }
                  setError(null);
                  setPreviewing(true);
                }}
              >
                Preview
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Recent Announcements">
          <ul className="divide-y divide-slate-100">
            {recent.length === 0 ? (
              <li className="py-6 text-sm text-slate-400 text-center">None yet.</li>
            ) : (
              recent.slice(0, 6).map((a) => (
                <li key={a.id} className="py-2.5 text-sm flex items-start gap-2">
                  <span className="text-brand-blue-500 mt-0.5">✓</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-800 truncate">{a.title}</div>
                    <div className="text-xs text-slate-500">{fmtRel(a.created_at)} · {a.audience}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {previewing && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in"
          onClick={() => setPreviewing(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
          >
            <div className="text-xs uppercase text-slate-400 mb-2">Preview</div>
            <h3 className="text-xl font-bold text-slate-900">
              {title || <span className="text-slate-400 italic">Untitled announcement</span>}
            </h3>
            <div className="text-[11px] text-slate-500 mt-1">
              Audience: {audience} · {schedule === 'send-now'
                ? 'Sending immediately'
                : scheduledAt
                ? `Scheduled for ${new Date(scheduledAt).toLocaleString()}`
                : 'Scheduled (no date set)'}
            </div>
            <div className="mt-4 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
              {message || <span className="text-slate-400 italic">No message body yet.</span>}
            </div>
            <div className="flex justify-end mt-5">
              <Button onClick={() => setPreviewing(false)}>Close preview</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
