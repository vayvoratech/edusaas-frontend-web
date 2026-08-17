import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getSettings, updateSettings } from '../services/api';

const TABS = ['General', 'Security', 'Notifications', 'Integrations'];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-brand-blue-600' : 'bg-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-5 w-5 bg-white rounded-full shadow transform transition ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
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
      <div>{children}</div>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('General');
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSettings();
        setSettings(data);
        setDraft(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load settings');
      }
    })();
  }, []);

  const setKey = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // only send what actually changed
      const patch = {};
      Object.keys(draft).forEach((k) => {
        if (JSON.stringify(draft[k]) !== JSON.stringify(settings?.[k])) patch[k] = draft[k];
      });
      if (Object.keys(patch).length === 0) {
        setSavedAt(Date.now());
        return;
      }
      const updated = await updateSettings(patch);
      setSettings(updated);
      setDraft(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => setDraft(settings || {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">System configuration and preferences.</p>
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
          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          {tab === 'General' && (
            <div>
              <Row title="Enable Auto-Backup" desc="Automatic daily backups of system data">
                <Toggle
                  checked={!!draft.enable_auto_backup}
                  onChange={(v) => setKey('enable_auto_backup', v)}
                />
              </Row>
              <Row title="Language">
                <select
                  value={draft.language || 'en-US'}
                  onChange={(e) => setKey('language', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm min-w-[180px]"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="hi-IN">Hindi</option>
                </select>
              </Row>
              <Row title="Time Zone">
                <select
                  value={draft.time_zone || 'GMT-05:00'}
                  onChange={(e) => setKey('time_zone', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm min-w-[200px]"
                >
                  <option value="GMT-08:00">GMT -08:00 Pacific Time</option>
                  <option value="GMT-05:00">GMT -05:00 Eastern Time</option>
                  <option value="GMT+00:00">GMT +00:00 UTC</option>
                  <option value="GMT+05:30">GMT +05:30 IST</option>
                </select>
              </Row>
            </div>
          )}

          {tab === 'Security' && (
            <div>
              <Row title="Two-Factor Authentication" desc="Require 2FA for admin logins">
                <Toggle
                  checked={!!draft.two_factor_auth}
                  onChange={(v) => setKey('two_factor_auth', v)}
                />
              </Row>
              <Row title="User Registration" desc="Allow self-registration for new users">
                <Toggle
                  checked={!!draft.user_registration}
                  onChange={(v) => setKey('user_registration', v)}
                />
              </Row>
            </div>
          )}

          {tab === 'Notifications' && (
            <div>
              <Row title="Email Alerts" desc="Receive system notifications by email">
                <Toggle
                  checked={!!draft.email_alerts}
                  onChange={(v) => setKey('email_alerts', v)}
                />
              </Row>
            </div>
          )}

          {tab === 'Integrations' && (
            <div>
              <Row title="API Access" desc="Enable API access for integrations">
                <Toggle checked={!!draft.api_access} onChange={(v) => setKey('api_access', v)} />
              </Row>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100">
          {savedAt && (
            <span className="text-xs text-brand-green-600 mr-auto">
              ✓ Saved {new Date(savedAt).toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" onClick={onReset} disabled={saving}>
            Reset
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
