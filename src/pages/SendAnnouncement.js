import React, { useEffect, useState } from 'react';
import {
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Megaphone,
  Save,
  Send,
  Sparkles,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  getAnnouncements,
  sendAnnouncement,
} from '../services/api';

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
    try {
      setRecent(await getAnnouncements());
    } catch (_) {}
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
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          title,
          audience,
          message,
          schedule,
          scheduledAt,
        })
      );

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
        title: title.trim(),
        message: message.trim(),
        audience,
        scheduled_at:
          schedule === 'schedule-later' && scheduledAt
            ? scheduledAt
            : null,
      });

      setSentOk(true);
      setTitle('');
      setMessage('');

      localStorage.removeItem(DRAFT_KEY);

      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSending(false);
    }
  };

  const audienceLabel = {
    all: 'All Learners',
    course: 'My Course Learners',
    educators: 'Educators only',
  };

  return (
    <div className="relative min-h-full overflow-hidden">
      {/* =========================================================
          BACKGROUND LIGHTING
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
      </div>

      <div className="space-y-6">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 opacity-30 blur-lg" />

                <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/25">
                  <Megaphone className="h-6 w-6" />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full border border-blue-200/70 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    Communication
                  </span>

                  <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                    <Sparkles className="h-3.5 w-3.5" />
                    Educator tools
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Send Announcement
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Reach learners with updates, exam reminders, important
                  notices, and course communications.
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 shadow-sm lg:flex">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Bell className="h-4.5 w-4.5" />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400">
                  Communication
                </div>
                <div className="text-sm font-bold text-slate-800">
                  Stay connected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            MAIN GRID
        ========================================================= */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* =====================================================
              COMPOSE
          ===================================================== */}
          <div className="xl:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              {/* top glow */}
              <div className="pointer-events-none absolute -top-28 right-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative border-b border-slate-100/80 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Compose Announcement
                    </h3>

                    <p className="text-xs text-slate-500">
                      Create a clear and engaging message for your audience.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={onSubmit}
                className="relative space-y-6 p-5 sm:p-7"
              >
                {/* TITLE */}
                <div>
                  <label className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Title</span>
                    <span className="font-normal normal-case tracking-normal text-slate-400">
                      Required
                    </span>
                  </label>

                  <div className="group relative">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Upcoming Course Update"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 transition-transform duration-300 group-focus-within:scale-x-100" />
                  </div>
                </div>

                {/* AUDIENCE */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    Audience
                  </label>

                  <div className="relative">
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 pr-11 text-sm font-medium text-slate-800 outline-none transition-all hover:border-blue-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="all">All Learners</option>
                      <option value="course">My Course Learners</option>
                      <option value="educators">Educators only</option>
                    </select>

                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Sending to{' '}
                    <span className="font-semibold text-slate-600">
                      {audienceLabel[audience]}
                    </span>
                  </div>
                </div>

                {/* MESSAGE */}
                <div>
                  <label className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Message</span>
                    <span className="font-normal normal-case tracking-normal text-slate-400">
                      Required
                    </span>
                  </label>

                  <div className="group relative">
                    <textarea
                      rows={7}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hello everyone, …"
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 font-mono text-sm leading-6 text-slate-800 outline-none transition-all placeholder:font-sans placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 transition-transform duration-300 group-focus-within:scale-x-100" />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Keep your message clear and easy to understand.</span>
                    <span>{message.length} characters</span>
                  </div>
                </div>

                {/* SCHEDULE */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-indigo-500" />

                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Delivery
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* SEND NOW */}
                    <label
                      className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                        schedule === 'send-now'
                          ? 'border-blue-300 bg-blue-50/80 shadow-sm'
                          : 'border-transparent bg-white/60 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={schedule === 'send-now'}
                        onChange={() => setSchedule('send-now')}
                        className="h-4 w-4 accent-blue-600"
                      />

                      <div
                        className={`grid h-9 w-9 place-items-center rounded-lg ${
                          schedule === 'send-now'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Send className="h-4 w-4" />
                      </div>

                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Send Now
                        </div>
                        <div className="text-xs text-slate-500">
                          Deliver the announcement immediately.
                        </div>
                      </div>
                    </label>

                    {/* SCHEDULE LATER */}
                    <label
                      className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                        schedule === 'schedule-later'
                          ? 'border-violet-300 bg-violet-50/70 shadow-sm'
                          : 'border-transparent bg-white/60 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={schedule === 'schedule-later'}
                          onChange={() =>
                            setSchedule('schedule-later')
                          }
                          className="h-4 w-4 accent-violet-600"
                        />

                        <div
                          className={`grid h-9 w-9 place-items-center rounded-lg ${
                            schedule === 'schedule-later'
                              ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <CalendarClock className="h-4 w-4" />
                        </div>

                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            Schedule Later
                          </div>
                          <div className="text-xs text-slate-500">
                            Choose when this announcement should be delivered.
                          </div>
                        </div>
                      </div>

                      {schedule === 'schedule-later' && (
                        <div className="mt-3 pl-0 sm:pl-12">
                          <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) =>
                              setScheduledAt(e.target.value)
                            }
                            className="w-full rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 sm:max-w-sm"
                          />
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* STATUS MESSAGES */}
                <div className="space-y-3">
                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 text-sm text-red-700 shadow-sm">
                      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-100 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                      </div>

                      <div>
                        <div className="font-bold">Something went wrong</div>
                        <div className="mt-0.5 text-red-600/80">
                          {error}
                        </div>
                      </div>
                    </div>
                  )}

                  {sentOk && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4 text-sm text-emerald-700 shadow-sm">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
                        <Check className="h-4 w-4" />
                      </div>

                      <div>
                        <div className="font-bold">
                          Announcement sent successfully
                        </div>

                        <div className="mt-0.5 text-emerald-600/80">
                          Your announcement has been delivered to the selected
                          audience.
                        </div>
                      </div>
                    </div>
                  )}

                  {draftSaved && (
                    <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-sm text-blue-700 shadow-sm">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600">
                        <Save className="h-4 w-4" />
                      </div>

                      <div>
                        <div className="font-bold">Draft saved</div>

                        <div className="mt-0.5 text-blue-600/80">
                          Your draft was saved locally and will be restored
                          next time you open this page.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap">
                  <Button
                    type="submit"
                    disabled={sending}
                    className="!rounded-xl"
                  >
                    <span className="flex items-center gap-2">
                      {sending ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Sending…
                        </>
                      ) : (
                        <>
                          {schedule === 'send-now' ? (
                            <Send className="h-4 w-4" />
                          ) : (
                            <CalendarClock className="h-4 w-4" />
                          )}

                          {schedule === 'send-now'
                            ? 'Send Now'
                            : 'Schedule'}
                        </>
                      )}
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveDraft}
                    className="!rounded-xl"
                  >
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Draft
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!title.trim() && !message.trim()) {
                        setError(
                          'Add a title or message to preview.'
                        );
                        return;
                      }

                      setError(null);
                      setPreviewing(true);
                    }}
                    className="!rounded-xl"
                  >
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </span>
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* =====================================================
              RECENT ANNOUNCEMENTS
          ===================================================== */}
          <div className="xl:col-span-1">
            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative border-b border-slate-100/80 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                      <Bell className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Recent Announcements
                      </h3>

                      <p className="text-xs text-slate-500">
                        Your latest communications
                      </p>
                    </div>
                  </div>

                  {recent.length > 0 && (
                    <div className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-600">
                      {recent.length}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative p-3">
                {recent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                    <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-400">
                      <Megaphone className="h-7 w-7" />
                    </div>

                    <div className="font-semibold text-slate-700">
                      No announcements yet
                    </div>

                    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                      Once you send an announcement, your recent messages
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recent.slice(0, 6).map((a, index) => (
                      <li
                        key={a.id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white/70 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative mt-0.5 shrink-0">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 transition-colors group-hover:from-blue-100 group-hover:to-violet-100">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>

                            {index < recent.slice(0, 6).length - 1 && (
                              <div className="absolute left-1/2 top-10 h-5 w-px -translate-x-1/2 bg-slate-100" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold text-slate-800">
                              {a.title}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                              <span>{fmtRel(a.created_at)}</span>
                              <span>•</span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                                {a.audience}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* SIDE INFO */}
              <div className="relative mx-3 mb-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50/70 to-violet-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-700">
                      Communication tip
                    </div>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      Keep important announcements concise and make the
                      action required by learners easy to identify.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            QUICK INFO
        ========================================================= */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="group rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <div className="text-sm font-bold text-slate-800">
                  Targeted Audience
                </div>
                <div className="text-xs text-slate-500">
                  Choose who receives your message.
                </div>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <CalendarClock className="h-5 w-5" />
              </div>

              <div>
                <div className="text-sm font-bold text-slate-800">
                  Flexible Delivery
                </div>
                <div className="text-xs text-slate-500">
                  Send immediately or schedule ahead.
                </div>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Save className="h-5 w-5" />
              </div>

              <div>
                <div className="text-sm font-bold text-slate-800">
                  Local Drafts
                </div>
                <div className="text-xs text-slate-500">
                  Save your work and continue later.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          PREVIEW MODAL
      ========================================================= */}
      {previewing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewing(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_100px_rgba(15,23,42,0.3)] backdrop-blur-xl"
          >
            {/* modal glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-violet-500/15 blur-3xl" />

            {/* HEADER */}
            <div className="relative border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                    <Eye className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      Announcement Preview
                    </div>

                    <h3 className="mt-0.5 text-xl font-black text-slate-900">
                      Preview
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewing(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="relative p-6">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    {audienceLabel[audience]}
                  </span>

                  <span className="text-[11px] text-slate-400">
                    •
                  </span>

                  <span className="text-[11px] font-medium text-slate-500">
                    {schedule === 'send-now'
                      ? 'Sending immediately'
                      : scheduledAt
                      ? `Scheduled for ${new Date(
                          scheduledAt
                        ).toLocaleString()}`
                      : 'Scheduled (no date set)'}
                  </span>
                </div>

                <h3 className="text-xl font-black leading-tight text-slate-900">
                  {title || (
                    <span className="font-medium italic text-slate-400">
                      Untitled announcement
                    </span>
                  )}
                </h3>

                <div className="my-4 h-px bg-gradient-to-r from-blue-100 via-violet-100 to-transparent" />

                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {message || (
                    <span className="italic text-slate-400">
                      No message body yet.
                    </span>
                  )}
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Preview only – nothing has been sent.
                </div>

                <div className="ml-auto">
                  <Button
                    onClick={() => setPreviewing(false)}
                    className="!rounded-xl"
                  >
                    <span className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Close Preview
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}