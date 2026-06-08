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

export default function SendAnnouncement() {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('all');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState('send-now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sentOk, setSentOk] = useState(false);
  const [recent, setRecent] = useState([]);

  const load = async () => {
    try { setRecent(await getAnnouncements()); }
    catch (_) {}
  };
  useEffect(() => { load(); }, []);

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

            <div className="flex gap-2">
              <Button type="submit" disabled={sending}>
                {sending ? 'Sending…' : schedule === 'send-now' ? 'Send Now' : 'Schedule'}
              </Button>
              <Button type="button" variant="outline">Save Draft</Button>
              <Button type="button" variant="outline">Preview</Button>
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
    </div>
  );
}
