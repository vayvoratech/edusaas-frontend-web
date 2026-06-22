import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const TABS = ['Account', 'Notifications', 'Privacy', 'Preferences'];
const PREFS_KEY = 'edu_user_prefs';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-brand-blue-600' : 'bg-slate-300'
      }`}
    >
      <span className={`inline-block h-5 w-5 bg-white rounded-full shadow transform transition ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`} />
    </button>
  );
}

function Row({ title, desc, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
      <div>
        <div className="font-medium text-slate-800">{title}</div>
        {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

const defaults = {
  profile_visibility: 'classmates',
  dark_mode: false,
  learning_reminders: true,
  language: 'en-US',
  time_zone: 'GMT-05:00',
  weekly_digest: true,
  activity_visible: true,
  show_progress: true,
  theme: 'Light',
};

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
};

export default function StudentSettings() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Account');
  const initial = loadPrefs();
  const [draft, setDraft] = useState({ ...initial, email: user?.email || '' });
  const [saved, setSaved] = useState(null); // 'ok' | 'error' | null

  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  // Apply dark mode immediately so toggling is WYSIWYG.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!draft.dark_mode);
  }, [draft.dark_mode]);

  const onSave = () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const { email, ...prefsToStore } = draft;
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefsToStore));
      setSaved('ok');
      setTimeout(() => setSaved(null), 2500);
    } catch {
      setSaved('error');
    }
  };

  const onCancel = () => {
    const stored = loadPrefs();
    setDraft({ ...stored, email: user?.email || '' });
    document.documentElement.classList.toggle('dark', !!stored.dark_mode);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Account, notifications, privacy, preferences.</p>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex border-b border-slate-200 px-5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition ${
                tab === t
                  ? 'border-brand-blue-600 text-brand-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="px-5 py-2">
          {tab === 'Account' && (
            <div>
              <Row title="Profile Visibility">
                <select
                  value={draft.profile_visibility}
                  onChange={(e) => set('profile_visibility', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm min-w-[180px]"
                >
                  <option value="classmates">Visible to All Classmates</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </Row>
              <Row title="Email Address" desc="Read-only — contact admin to change">
                <input
                  value={draft.email}
                  readOnly
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-sm w-64"
                />
              </Row>
              <Row title="Change Password" desc="Reset link via email coming soon">
                <Button variant="outline" disabled>Change</Button>
              </Row>
              <Row title="Enable Dark Mode" desc="Switches the entire app to dark theme">
                <Toggle checked={draft.dark_mode} onChange={(v) => set('dark_mode', v)} />
              </Row>
              <Row title="Learning Reminders" desc="Receive task reminders">
                <Toggle checked={draft.learning_reminders} onChange={(v) => set('learning_reminders', v)} />
              </Row>
              <Row title="Language">
                <select
                  value={draft.language}
                  onChange={(e) => set('language', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm min-w-[180px]"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="hi-IN">Hindi</option>
                </select>
              </Row>
              <Row title="Time Zone">
                <select
                  value={draft.time_zone}
                  onChange={(e) => set('time_zone', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm min-w-[200px]"
                >
                  <option value="GMT-08:00">GMT -08:00 Pacific</option>
                  <option value="GMT-05:00">GMT -05:00 Eastern</option>
                  <option value="GMT+05:30">GMT +05:30 IST</option>
                </select>
              </Row>
            </div>
          )}

          {tab === 'Notifications' && (
            <div>
              <Row title="Weekly digest email" desc="A summary of your progress and recommendations">
                <Toggle checked={draft.weekly_digest} onChange={(v) => set('weekly_digest', v)} />
              </Row>
              <Row title="Learning reminders" desc="Push notifications for upcoming tasks">
                <Toggle checked={draft.learning_reminders} onChange={(v) => set('learning_reminders', v)} />
              </Row>
            </div>
          )}

          {tab === 'Privacy' && (
            <div>
              <Row title="Show my activity to classmates" desc="Your recent submissions and comments">
                <Toggle checked={draft.activity_visible} onChange={(v) => set('activity_visible', v)} />
              </Row>
              <Row title="Show progress on leaderboards">
                <Toggle checked={draft.show_progress} onChange={(v) => set('show_progress', v)} />
              </Row>
            </div>
          )}

          {tab === 'Preferences' && (
            <div>
              <Row title="Theme">
                <select
                  value={draft.theme}
                  onChange={(e) => set('theme', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm min-w-[140px]"
                >
                  <option>Light</option>
                  <option>Dark</option>
                  <option>SaaS Blue-White</option>
                </select>
              </Row>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100">
          {saved === 'ok' && (
            <span className="text-xs text-brand-green-700 mr-auto">✓ Saved</span>
          )}
          {saved === 'error' && (
            <span className="text-xs text-red-600 mr-auto">Failed to save</span>
          )}
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
