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
import { getReportsSummary, getTopReports, getExportHistory, generateReport, getPlatformHealth, updateReport} from '../services/api';
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

const MetricCard = ({ label, value, description, icon, tone = 'blue' }) => {
  const tones = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-700',
      value: 'text-blue-700',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-100 text-green-700',
      value: 'text-green-700',
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'bg-amber-100 text-amber-700',
      value: 'text-amber-700',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-100 text-red-700',
      value: 'text-red-700',
    },
    slate: {
      bg: 'bg-slate-50',
      icon: 'bg-slate-100 text-slate-700',
      value: 'text-slate-700',
    },
  };

  const style = tones[tone] || tones.blue;

  return (
    <Card className="!p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className={`text-3xl font-bold mt-2 ${style.value}`}>
            {value ?? '—'}
          </div>
          {description && (
            <div className="text-xs text-slate-500 mt-2">{description}</div>
          )}
        </div>

        <div
          className={`w-10 h-10 rounded-xl grid place-items-center text-lg ${style.icon}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

const StatusItem = ({ label, value, description, status = 'unavailable' }) => {
  const statusConfig = {
    healthy: {
      dot: 'bg-green-500',
      text: 'Operational',
      textClass: 'text-green-700',
    },
    warning: {
      dot: 'bg-amber-500',
      text: 'Attention',
      textClass: 'text-amber-700',
    },
    unavailable: {
      dot: 'bg-slate-400',
      text: 'Not monitored',
      textClass: 'text-slate-600',
    },
  };

  const config = statusConfig[status] || statusConfig.unavailable;

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-800">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">
          {description}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
        <div className="text-right">
          <div className={`text-xs font-medium ${config.textClass}`}>
            {config.text}
          </div>
          {value != null && (
            <div className="text-xs text-slate-500">{value}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [top, setTop] = useState([]);
  const [exports, setExports] = useState([]);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '' });
  const [generating, setGenerating] = useState(false);
   const [savingEdit, setSavingEdit] = useState(false);

//health of platfrom
  const backendStatus = health?.services?.backend?.status;

const databaseStatus = health?.services?.database?.status;

const backendHealth =
  backendStatus === 'ok' ? 'Healthy' :
  backendStatus === 'error' ? 'Unavailable' :
  'Checking...';

const databaseHealth =
  databaseStatus === 'ok' ? 'Healthy' :
  databaseStatus === 'error' ? 'Unavailable' :
  'Checking...';

const healthResponseTime = health?.responseTimeMs;

  const loadReports = async () => {
    const [s, t, e, hd] = await Promise.all([
      getReportsSummary(),
      getTopReports(),
      getExportHistory(),
      getPlatformHealth(),
    ]);

    setSummary(s);
    setTop(t);
    setExports(e);
    setHealth(hd);
  };

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        await loadReports();
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            'Failed to load reports'
        );
      }
    })();
  }, []);

  const onGenerateReport = async () => {
    setGenerating(true);
    setError(null);

    try {
      await generateReport('Course Performance');
      await loadReports();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to generate report'
      );
    } finally {
      setGenerating(false);
    }
  };

 const onExportCsv = () => {
  const rows = [
    ['EduSaaS — Reports & Platform Analytics'],
    ['Generated', new Date().toLocaleString()],
    [],

    ['Overview'],
    ['Metric', 'Value'],
    ['Total Users', summary?.users?.total ?? 'N/A'],
    ['Active Users This Month', summary?.users?.activeThisMonth ?? 'N/A'],
    ['New Users This Month', summary?.users?.newThisMonth ?? 'N/A'],
    ['Total Reports Generated', summary?.totalReports ?? 'N/A'],
    ['Active Alerts', summary?.activeAlerts ?? 'N/A'],
    ['Open Jobs', summary?.recruitment?.openJobs ?? 'N/A'],
    [],

    ['Platform Health'],
    ['Metric', 'Value'],
    ['Data Accuracy', summary?.dataAccuracy ?? 'Not monitored'],
    ['System Uptime', summary?.systemUptime ?? 'Not monitored'],
    ['Backend API', backendHealth ?? 'N/A'],
    ['Database', databaseHealth ?? 'N/A'],
    ['Health Response Time', healthResponseTime != null ? `${healthResponseTime} ms` : 'N/A'],
    [],

    ['Learning & Assessment'],
    ['Metric', 'Value'],
    ['Total Enrollments', summary?.learning?.totalEnrollments ?? 'N/A'],
    ['Completed Enrollments', summary?.learning?.completedEnrollments ?? 'N/A'],
    ['Dropped Enrollments', summary?.learning?.droppedEnrollments ?? 'N/A'],
    ['Total Assessments', summary?.assessments?.totalAssessments ?? 'N/A'],
    ['Completed Assessments', summary?.assessments?.completedAssessments ?? 'N/A'],
    [],

    ['Recruitment'],
    ['Metric', 'Value'],
    ['Total Jobs', summary?.recruitment?.totalJobs ?? 'N/A'],
    ['Open Jobs', summary?.recruitment?.openJobs ?? 'N/A'],
    ['Total Applications', summary?.recruitment?.totalApplications ?? 'N/A'],
    ['Shortlisted Applications', summary?.recruitment?.shortlistedApplications ?? 'N/A'],
    ['Selected Applications', summary?.recruitment?.selectedApplications ?? 'N/A'],
    ['Rejected Applications', summary?.recruitment?.rejectedApplications ?? 'N/A'],
  ];

  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell ?? '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute(
    'download',
    `edusaas-platform-report-${new Date().toISOString().slice(0, 10)}.csv`
  );

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
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
      ...Object.entries(r.payload || { note: 'no payload' }).map(
        ([k, v]) => [k, JSON.stringify(v)]
      ),
    ];

    const safe = (r.title || 'report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');

    downloadCsv(`${safe}_${todayStamp()}.csv`, rows);
  };

  const startEdit = (r) => {
    setEditingReport(r);
    setEditDraft({ title: r.title });
  };

  const saveEdit = async (e) => {
  e.preventDefault();

  const title = editDraft.title.trim();

  if (!title) {
    setError('Report title is required');
    return;
  }

  try {
     setSavingEdit(true);
    setError(null);

    const updatedReport = await updateReport(
      editingReport.id,
      { title }
    );

    setTop((prev) =>
      prev.map((x) =>
        x.id === updatedReport.id
          ? updatedReport
          : x
      )
    );

    setEditingReport(null);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to update report'
    );
  }finally {
    setSavingEdit(false);
  }
};

  const uptimeAvailable = summary?.systemUptime != null;
  const accuracyAvailable = summary?.dataAccuracy != null;

  return (
    <div className="space-y-6" id="print-area">
      <style>{printStyleHtml}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Reports & Platform Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitor platform usage, learning activity, recruitment and system health.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 no-print">
          <Button
            variant="primary"
            onClick={onGenerateReport}
            disabled={generating}
          >
            {generating ? 'Generating...' : '+ Generate Report'}
          </Button>

          <Button
            variant="primary"
            onClick={onExportPdf}
            disabled={!summary}
          >
            Export PDF
          </Button>

          <Button
            variant="primary"
            onClick={onExportCsv}
            disabled={!summary}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Platform Overview
            </h3>
            <p className="text-xs text-slate-500">
              Current platform activity based on available application data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
          <MetricCard
            label="Total Users"
            value={summary?.users?.total}
            description="All registered users"
            icon="👥"
            tone="blue"
          />

          <MetricCard
            label="Active Users"
            value={summary?.users?.activeThisMonth}
            description="Active this month"
            icon="✓"
            tone="green"
          />

          <MetricCard
            label="New Users"
            value={summary?.users?.newThisMonth}
            description="Joined this month"
            icon="+"
            tone="blue"
          />

          <MetricCard
            label="Reports Generated"
            value={summary?.totalReports}
            description="Stored reports"
            icon="▤"
            tone="slate"
          />

          <MetricCard
            label="Active Alerts"
            value={summary?.activeAlerts}
            description="Unread active notifications"
            icon="!"
            tone="red"
          />

          <MetricCard
            label="Open Jobs"
            value={summary?.recruitment?.openJobs}
            description="Currently open"
            icon="⌕"
            tone="amber"
          />
        </div>
      </div>

      {/* Platform Health */}
      <Card title="Platform Health">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          <div>
            <StatusItem
              label="Data Accuracy"
              value={accuracyAvailable ? `${summary.dataAccuracy}%` : null}
              description={
                accuracyAvailable
                  ? 'Measured by the platform monitoring system.'
                  : 'No authoritative data-quality metric is available.'
              }
              status={accuracyAvailable ? 'healthy' : 'unavailable'}
            />

            <StatusItem
              label="System Uptime"
              value={uptimeAvailable ? `${summary.systemUptime}%` : null}
              description={
                uptimeAvailable
                  ? 'Based on recorded platform uptime.'
                  : 'No uptime-monitoring history is currently available.'
              }
              status={uptimeAvailable ? 'healthy' : 'unavailable'}
            />
          </div>

          <div className="mt-1 lg:mt-0">
            <StatusItem
  label="Backend API"
  value={backendHealth}
  description={
    backendStatus === 'ok'
      ? 'Backend API is responding normally.'
      : backendStatus === 'error'
        ? 'Backend API is currently unavailable.'
        : 'Checking backend API health...'
  }
  status={
    backendStatus === 'ok'
      ? 'healthy'
      : backendStatus === 'error'
        ? 'unavailable'
        : 'unavailable'
  }
/>

               <StatusItem
  label="Database"
  value={databaseHealth}
  description={
    databaseStatus === 'ok'
      ? 'Database connection is responding normally.'
      : databaseStatus === 'error'
        ? 'Database connection is currently unavailable.'
        : 'Checking database health...'
  }
  status={
    databaseStatus === 'ok'
      ? 'healthy'
      : databaseStatus === 'error'
        ? 'unavailable'
        : 'unavailable'
  }
/>
          </div>
        </div>

 {/* return health response */}
        <div className="mt-4 text-xs text-gray-500">
  Health response:{' '}
  {healthResponseTime != null
    ? `${healthResponseTime} ms`
    : 'Checking...'}
</div>

        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">
          Health metrics marked <strong>Not monitored</strong> are intentionally
          not presented as healthy or unhealthy because the backend does not
          currently provide authoritative monitoring data for them.
        </div>
      </Card>

      {/* Learning + Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Learning & Assessment">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Enrollments</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {summary?.learning?.totalEnrollments ?? '—'}
              </div>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <div className="text-xs text-green-700">Completed</div>
              <div className="text-2xl font-bold text-green-700 mt-1">
                {summary?.learning?.completedEnrollments ?? '—'}
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <div className="text-xs text-amber-700">Dropped</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {summary?.learning?.droppedEnrollments ?? '—'}
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <div className="text-xs text-blue-700">Assessments</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {summary?.assessments?.totalAssessments ?? '—'}
              </div>
            </div>

                        <div className="rounded-xl bg-purple-50 p-4">
                <div className="text-xs text-purple-700">Completion Rate</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">
             {summary?.learning?.completionRate != null
             ? `${summary.learning.completionRate}%`
              : '—'}
          </div>
        </div>

         <div className="rounded-xl bg-red-50 p-4">
         <div className="text-xs text-red-700">Dropout Rate</div>
       <div className="text-2xl font-bold text-red-700 mt-1">
         {summary?.learning?.dropoutRate != null
       ? `${summary.learning.dropoutRate}%`
         : '—'}
       </div>
       </div>

          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Completed assessments</span>
            <span className="font-semibold text-slate-800">
              {summary?.assessments?.completedAssessments ?? '—'}
            </span>
          </div>
        </Card>

        {/* Recruitment */}
        <Card title="Recruitment Performance">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Jobs</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {summary?.recruitment?.totalJobs ?? '—'}
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <div className="text-xs text-blue-700">Open</div>
              <div className="text-xl font-bold text-blue-700 mt-1">
                {summary?.recruitment?.openJobs ?? '—'}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Applications</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {summary?.recruitment?.totalApplications ?? '—'}
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 p-3">
              <div className="text-xs text-amber-700">Shortlisted</div>
              <div className="text-xl font-bold text-amber-700 mt-1">
                {summary?.recruitment?.shortlistedApplications ?? '—'}
              </div>
            </div>

            <div className="rounded-xl bg-green-50 p-3">
              <div className="text-xs text-green-700">Selected</div>
              <div className="text-xl font-bold text-green-700 mt-1">
                {summary?.recruitment?.selectedApplications ?? '—'}
              </div>
            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <div className="text-xs text-red-700">Rejected</div>
              <div className="text-xl font-bold text-red-700 mt-1">
                {summary?.recruitment?.rejectedApplications ?? '—'}
              </div>
            </div>

                     <div className="rounded-xl bg-purple-50 p-3">
  <div className="text-xs text-purple-700">Shortlist Rate</div>
  <div className="text-xl font-bold text-purple-700 mt-1">
    {summary?.recruitment?.shortlistRate != null
      ? `${summary.recruitment.shortlistRate}%`
      : '—'}
  </div>
</div>

<div className="rounded-xl bg-indigo-50 p-3">
  <div className="text-xs text-indigo-700">Selection Rate</div>
  <div className="text-xl font-bold text-indigo-700 mt-1">
    {summary?.recruitment?.selectionRate != null
      ? `${summary.recruitment.selectionRate}%`
      : '—'}
  </div>
</div>

          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Learning Completion Trend">
          <div className="h-64">
            {summary?.courseEngagement?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.courseEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    name="Completions"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="dropouts"
                    name="Dropouts"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-sm text-slate-400">
                No learning trend data available.
              </div>
            )}
          </div>
        </Card>

        <Card title="User Engagement">
          <div className="h-64">
            {summary?.userEngagement?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.userEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Users"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-sm text-slate-400">
                No user engagement data available.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top reports + export history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Top Reports">
          <ul className="divide-y divide-slate-100">
            {top.length === 0 ? (
              <li className="py-6 text-sm text-slate-400 text-center">
                No reports yet.
              </li>
            ) : (
              top.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 grid place-items-center text-blue-700 shrink-0">
                      ▤
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {r.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.type || 'Report'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 no-print">
                    <button
                      className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </button>

                    <button
                      className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
                      title="Download CSV"
                      onClick={() => downloadReport(r)}
                    >
                      ↓
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
              <li className="py-6 text-sm text-slate-400 text-center">
                No exports yet.
              </li>
            ) : (
              exports.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-green-100 grid place-items-center text-green-700 shrink-0">
                      {String(r.format || 'pdf').toUpperCase() === 'CSV'
                        ? 'CSV'
                        : 'PDF'}
                    </div>

                    <div className="text-sm font-medium text-slate-800 truncate">
                      {r.title}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 shrink-0">
                    {fmtDate(r.exported_at)}
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {/* Edit report modal */}
      {editingReport && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4"
          onClick={() => setEditingReport(null)}
        >
          <form
            onSubmit={saveEdit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="font-semibold text-lg mb-1">
              Edit report
            </h3>

          <p className="text-xs text-slate-500 mb-4">
  Update the report title. Changes are saved to the backend.
</p>
            <div className="mb-5">
              <label className="text-xs text-slate-500">
                Title
              </label>

              <input
                value={editDraft.title}
                onChange={(e) =>
                  setEditDraft({
                    ...editDraft,
                    title: e.target.value,
                  })
                }
                autoFocus
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingReport(null)}
              >
                Cancel
              </Button>

            <Button type="submit" disabled={savingEdit}>
  {savingEdit ? 'Saving...' : 'Save'}
</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}