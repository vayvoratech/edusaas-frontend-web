import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gauge } from '../components/ui/Gauge';
import { getReportsSummary, getTopReports, getExportHistory } from '../services/api';
import { downloadCsv, todayStamp, printStyleHtml } from '../utils/exports';

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
};

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [top, setTop] = useState([]);
  const [exports, setExports] = useState([]);
  const [error, setError] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '' });

  useEffect(() => {
    (async () => {
      try {
        const [s, t, e] = await Promise.all([
          getReportsSummary(),
          getTopReports(),
          getExportHistory(),
        ]);
        setSummary(s);
        setTop(t);
        setExports(e);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load reports');
      }
    })();
  }, []);

  const onExportCsv = () => {
    const rows = [
      ['EduSaaS — Reports Export'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Headline', 'Value'],
      ['Total Reports Generated', summary?.totalReports ?? 0],
      ['Active Alerts', summary?.activeAlerts ?? 0],
      ['Data Accuracy %', summary?.dataAccuracy ?? 0],
      ['System Uptime %', summary?.systemUptime ?? 0],
      [],
      ['Section: Course Engagement'],
      ['Month', 'Completions', 'Dropouts'],
      ...(summary?.courseEngagement || []).map((r) => [r.month, r.completions, r.dropouts]),
      [],
      ['Section: User Engagement'],
      ['Channel', 'Value'],
      ...(summary?.userEngagement || []).map((r) => [r.channel, r.value]),
      [],
      ['Section: Top Reports'],
      ['Title', 'Type'],
      ...top.map((r) => [r.title, r.type]),
      [],
      ['Section: Export History'],
      ['Title', 'Exported At', 'Format'],
      ...exports.map((r) => [r.title, r.exported_at, r.format || '']),
    ];
    downloadCsv(`reports_${todayStamp()}.csv`, rows);
  };
  const onExportPdf = () => window.print();

  const downloadReport = (r) => {
    const rows = [
      ['Report', r.title],
      ['Type', r.type],
      ['Generated', r.generated_at || ''],
      ['Exported', r.exported_at || ''],
      ['Format', r.format || ''],
      [],
      ['Payload'],
      ...Object.entries(r.payload || { note: 'no payload' }).map(([k, v]) => [k, JSON.stringify(v)]),
    ];
    const safe = (r.title || 'report').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    downloadCsv(`${safe}_${todayStamp()}.csv`, rows);
  };

  const startEdit = (r) => {
    setEditingReport(r);
    setEditDraft({ title: r.title });
  };

  const saveEdit = (e) => {
    e.preventDefault();
    // Server has no PATCH /reports/:id yet — keep change locally so the user sees feedback.
    // TODO(backend): add an endpoint and PATCH here.
    setTop((prev) =>
      prev.map((x) => (x.id === editingReport.id ? { ...x, title: editDraft.title } : x))
    );
    setEditingReport(null);
  };

  return (
    <div className="space-y-6" id="print-area">
      <style>{printStyleHtml}</style>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="text-sm text-slate-500">Platform performance and export history.</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={onExportPdf} disabled={!summary}>📄 Export PDF</Button>
          <Button variant="primary" onClick={onExportCsv} disabled={!summary}>⬇ Export CSV</Button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Total Reports Generated</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">
            {summary?.totalReports ?? '—'}
          </div>
          <div className="h-1.5 mt-3 rounded-full bg-brand-blue-100 overflow-hidden">
            <div className="h-full bg-brand-blue-500" style={{ width: '70%' }} />
          </div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Active Alerts</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{summary?.activeAlerts ?? '—'}</div>
          <div className="h-1.5 mt-3 rounded-full bg-red-100 overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: '30%' }} />
          </div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Data Accuracy</div>
          <div className="text-3xl font-bold text-brand-green-600 mt-1">
            {summary?.dataAccuracy ?? '—'}%
          </div>
          <div className="h-1.5 mt-3 rounded-full bg-brand-green-100 overflow-hidden">
            <div
              className="h-full bg-brand-green-500"
              style={{ width: `${summary?.dataAccuracy ?? 98}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Course Performance" className="lg:col-span-1">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary?.courseEngagement || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="completions" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="dropouts" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="User Engagement" className="lg:col-span-1">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.userEngagement || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="System Uptime" className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <Gauge value={summary?.systemUptime ?? 0} size={170} label="Uptime" />
            <div className="text-xs text-slate-500 mt-2 flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full" /> Downtime 2 hrs
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-brand-green-500 rounded-full" /> Uptime
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Top Reports">
          <ul className="divide-y divide-slate-100">
            {top.length === 0 ? (
              <li className="py-6 text-sm text-slate-400 text-center">No reports yet.</li>
            ) : (
              top.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue-100 grid place-items-center text-brand-blue-700">
                      📄
                    </div>
                    <div className="text-sm font-medium text-slate-800">{r.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs px-2 py-1 rounded border border-brand-blue-200 text-brand-blue-700 hover:bg-brand-blue-50"
                      onClick={() => startEdit(r)}
                    >
                      ✏ Edit
                    </button>
                    <button
                      className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
                      title="Download CSV"
                      onClick={() => downloadReport(r)}
                    >
                      ⬇
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card title="Export History">
          <ul className="divide-y divide-slate-100">
            {exports.length === 0 ? (
              <li className="py-6 text-sm text-slate-400 text-center">No exports yet.</li>
            ) : (
              exports.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-green-100 grid place-items-center text-brand-green-700">
                      {(r.format || 'pdf').toUpperCase() === 'CSV' ? '🟢' : '📄'}
                    </div>
                    <div className="text-sm font-medium text-slate-800">{r.title}</div>
                  </div>
                  <div className="text-xs text-slate-500">{fmtDate(r.exported_at)}</div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {editingReport && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in"
          onClick={() => setEditingReport(null)}
        >
          <form
            onSubmit={saveEdit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="font-semibold text-lg mb-1">Edit report</h3>
            <p className="text-xs text-slate-500 mb-4">
              Renaming saves locally for this session. Backend persistence is on the roadmap.
            </p>
            <div className="mb-5">
              <label className="text-xs text-slate-500">Title</label>
              <input
                value={editDraft.title}
                onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                autoFocus
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingReport(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
