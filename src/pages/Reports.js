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

import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  FileBarChart,
  FileDown,
  FileText,
  Gauge,
  LineChart as LineChartIcon,
  Pencil,
  Save,
  Server,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  getReportsSummary,
  getTopReports,
  getExportHistory,
  generateReport,
  getPlatformHealth,
  updateReport,
} from '../services/api';

import {
  downloadCsv,
  todayStamp,
  printStyleHtml,
} from '../utils/exports';

const fmtDate = (iso) => {
  if (!iso) return 'â€”';

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

/* =========================================================
   METRIC CARD
========================================================= */

const MetricCard = ({
  label,
  value,
  description,
  icon,
  tone = 'blue',
}) => {
  const tones = {
    blue: {
      glow: 'bg-blue-500/10',
      icon: 'from-blue-500 to-indigo-600',
      iconShadow: 'shadow-blue-500/20',
      value: 'text-blue-700',
      badge: 'bg-blue-50 text-blue-700 border-blue-100',
    },

    green: {
      glow: 'bg-emerald-500/10',
      icon: 'from-emerald-500 to-green-600',
      iconShadow: 'shadow-emerald-500/20',
      value: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },

    amber: {
      glow: 'bg-amber-500/10',
      icon: 'from-amber-400 to-orange-600',
      iconShadow: 'shadow-amber-500/20',
      value: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-700 border-amber-100',
    },

    red: {
      glow: 'bg-red-500/10',
      icon: 'from-red-500 to-rose-600',
      iconShadow: 'shadow-red-500/20',
      value: 'text-red-700',
      badge: 'bg-red-50 text-red-700 border-red-100',
    },

    slate: {
      glow: 'bg-slate-500/10',
      icon: 'from-slate-600 to-slate-800',
      iconShadow: 'shadow-slate-500/20',
      value: 'text-slate-700',
      badge: 'bg-slate-50 text-slate-700 border-slate-100',
    },

    purple: {
      glow: 'bg-violet-500/10',
      icon: 'from-violet-500 to-purple-600',
      iconShadow: 'shadow-violet-500/20',
      value: 'text-violet-700',
      badge: 'bg-violet-50 text-violet-700 border-violet-100',
    },
  };

  const style = tones[tone] || tones.blue;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,0.1)]">
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${style.glow} blur-3xl transition-transform duration-500 group-hover:scale-150`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </div>

          <div
            className={`mt-2 text-3xl font-black tracking-tight ${style.value}`}
          >
            {value ?? 'â€”'}
          </div>

          {description && (
            <div className="mt-2 text-xs leading-5 text-slate-500">
              {description}
            </div>
          )}
        </div>

        <div
          className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${style.icon} text-white shadow-lg ${style.iconShadow} transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
};

/* =========================================================
   STATUS ITEM
========================================================= */

const StatusItem = ({
  label,
  value,
  description,
  status = 'unavailable',
  icon,
}) => {
  const statusConfig = {
    healthy: {
      dot: 'bg-emerald-500',
      ring: 'ring-emerald-100',
      text: 'Operational',
      textClass: 'text-emerald-700',
      bg: 'bg-emerald-50/70',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },

    warning: {
      dot: 'bg-amber-500',
      ring: 'ring-amber-100',
      text: 'Attention',
      textClass: 'text-amber-700',
      bg: 'bg-amber-50/70',
      iconBg: 'bg-amber-100 text-amber-600',
    },

    unavailable: {
      dot: 'bg-slate-400',
      ring: 'ring-slate-100',
      text: 'Not monitored',
      textClass: 'text-slate-600',
      bg: 'bg-slate-50/70',
      iconBg: 'bg-slate-100 text-slate-500',
    },
  };

  const config =
    statusConfig[status] || statusConfig.unavailable;

  return (
    <div
      className={`group flex items-center justify-between gap-4 rounded-2xl border border-slate-100/80 ${config.bg} px-4 py-4 transition-all duration-300 hover:border-slate-200 hover:bg-white`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${config.iconBg}`}
        >
          {icon || <Activity className="h-4 w-4" />}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-800">
            {label}
          </div>

          <div className="mt-0.5 text-xs leading-5 text-slate-500">
            {description}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="flex items-center justify-end gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${config.dot} ring-4 ${config.ring} transition-transform group-hover:scale-110`}
          />

          <div
            className={`text-xs font-bold ${config.textClass}`}
          >
            {config.text}
          </div>
        </div>

        {value != null && (
          <div className="mt-1 text-xs font-medium text-slate-500">
            {value}
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   SMALL STAT CARD
========================================================= */

const MiniStat = ({
  label,
  value,
  tone = 'slate',
  icon,
}) => {
  const styles = {
    slate: {
      bg: 'from-slate-50 to-white',
      icon: 'bg-slate-100 text-slate-600',
      value: 'text-slate-900',
    },

    blue: {
      bg: 'from-blue-50 to-white',
      icon: 'bg-blue-100 text-blue-600',
      value: 'text-blue-700',
    },

    green: {
      bg: 'from-emerald-50 to-white',
      icon: 'bg-emerald-100 text-emerald-600',
      value: 'text-emerald-700',
    },

    amber: {
      bg: 'from-amber-50 to-white',
      icon: 'bg-amber-100 text-amber-600',
      value: 'text-amber-700',
    },

    red: {
      bg: 'from-red-50 to-white',
      icon: 'bg-red-100 text-red-600',
      value: 'text-red-700',
    },

    purple: {
      bg: 'from-violet-50 to-white',
      icon: 'bg-violet-100 text-violet-600',
      value: 'text-violet-700',
    },

    indigo: {
      bg: 'from-indigo-50 to-white',
      icon: 'bg-indigo-100 text-indigo-600',
      value: 'text-indigo-700',
    },
  };

  const style = styles[tone] || styles.slate;

  return (
    <div
      className={`group rounded-2xl border border-white/80 bg-gradient-to-br ${style.bg} p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">
            {label}
          </div>

          <div
            className={`mt-1 text-2xl font-black ${style.value}`}
          >
            {value ?? 'â€”'}
          </div>
        </div>

        {icon && (
          <div
            className={`grid h-9 w-9 place-items-center rounded-xl ${style.icon} transition-transform group-hover:scale-110`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   REPORTS PAGE
========================================================= */

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

  /* =========================================================
     PLATFORM HEALTH
  ========================================================= */

  const backendStatus =
    health?.services?.backend?.status;

  const databaseStatus =
    health?.services?.database?.status;

  const backendHealth =
    backendStatus === 'ok'
      ? 'Healthy'
      : backendStatus === 'error'
      ? 'Unavailable'
      : 'Checking...';

  const databaseHealth =
    databaseStatus === 'ok'
      ? 'Healthy'
      : databaseStatus === 'error'
      ? 'Unavailable'
      : 'Checking...';

  const healthResponseTime =
    health?.responseTimeMs;

  /* =========================================================
     LOAD REPORTS
  ========================================================= */

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

  /* =========================================================
     GENERATE REPORT
  ========================================================= */

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

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const onExportCsv = () => {
    const rows = [
      ['EduSaaS â€” Reports & Platform Analytics'],
      ['Generated', new Date().toLocaleString()],
      [],

      ['Overview'],
      ['Metric', 'Value'],
      ['Total Users', summary?.users?.total ?? 'N/A'],
      [
        'Active Users This Month',
        summary?.users?.activeThisMonth ?? 'N/A',
      ],
      [
        'New Users This Month',
        summary?.users?.newThisMonth ?? 'N/A',
      ],
      [
        'Total Reports Generated',
        summary?.totalReports ?? 'N/A',
      ],
      ['Active Alerts', summary?.activeAlerts ?? 'N/A'],
      [
        'Open Jobs',
        summary?.recruitment?.openJobs ?? 'N/A',
      ],
      [],

      ['Platform Health'],
      ['Metric', 'Value'],
      [
        'Data Accuracy',
        summary?.dataAccuracy ?? 'Not monitored',
      ],
      [
        'System Uptime',
        summary?.systemUptime ?? 'Not monitored',
      ],
      ['Backend API', backendHealth ?? 'N/A'],
      ['Database', databaseHealth ?? 'N/A'],
      [
        'Health Response Time',
        healthResponseTime != null
          ? `${healthResponseTime} ms`
          : 'N/A',
      ],
      [],

      ['Learning & Assessment'],
      ['Metric', 'Value'],
      [
        'Total Enrollments',
        summary?.learning?.totalEnrollments ?? 'N/A',
      ],
      [
        'Completed Enrollments',
        summary?.learning?.completedEnrollments ?? 'N/A',
      ],
      [
        'Dropped Enrollments',
        summary?.learning?.droppedEnrollments ?? 'N/A',
      ],
      [
        'Total Assessments',
        summary?.assessments?.totalAssessments ?? 'N/A',
      ],
      [
        'Completed Assessments',
        summary?.assessments?.completedAssessments ?? 'N/A',
      ],
      [],

      ['Recruitment'],
      ['Metric', 'Value'],
      [
        'Total Jobs',
        summary?.recruitment?.totalJobs ?? 'N/A',
      ],
      [
        'Open Jobs',
        summary?.recruitment?.openJobs ?? 'N/A',
      ],
      [
        'Total Applications',
        summary?.recruitment?.totalApplications ?? 'N/A',
      ],
      [
        'Shortlisted Applications',
        summary?.recruitment?.shortlistedApplications ?? 'N/A',
      ],
      [
        'Selected Applications',
        summary?.recruitment?.selectedApplications ?? 'N/A',
      ],
      [
        'Rejected Applications',
        summary?.recruitment?.rejectedApplications ?? 'N/A',
      ],
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
      `edusaas-platform-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     PDF
  ========================================================= */

  const onExportPdf = () => window.print();

  /* =========================================================
     DOWNLOAD REPORT
  ========================================================= */

  const downloadReport = (r) => {
    const rows = [
      ['Report', r.title],
      ['Type', r.type],
      ['Generated', r.generated_at || ''],
      ['Exported', r.exported_at || ''],
      ['Format', r.format || ''],
      [],
      ['Payload'],
      ...Object.entries(
        r.payload || { note: 'no payload' }
      ).map(([k, v]) => [
        k,
        JSON.stringify(v),
      ]),
    ];

    const safe = (r.title || 'report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');

    downloadCsv(
      `${safe}_${todayStamp()}.csv`,
      rows
    );
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const startEdit = (r) => {
    setEditingReport(r);
    setEditDraft({
      title: r.title,
    });
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
    } finally {
      setSavingEdit(false);
    }
  };

  const uptimeAvailable =
    summary?.systemUptime != null;

  const accuracyAvailable =
    summary?.dataAccuracy != null;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="relative min-h-full overflow-hidden"
      id="print-area"
    >
      <style>{printStyleHtml}</style>

      {/* =====================================================
          RADIANT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute right-[-180px] top-[20%] h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute bottom-[-180px] left-[30%] h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      <div className="space-y-7">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 opacity-30 blur-xl" />

                <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/25">
                  <FileBarChart className="h-7 w-7" />
                </div>
              </div>

              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-200/70 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    Analytics Center
                  </span>

                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Platform intelligence
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Reports & Platform Analytics
                </h2>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                  Monitor platform usage, learning activity,
                  recruitment, reports, and system health from one
                  central dashboard.
                </p>
              </div>
            </div>

            <div className="no-print flex flex-wrap gap-2">
              <Button
                variant="primary"
                onClick={onGenerateReport}
                disabled={generating}
                className="!rounded-xl"
              >
                <span className="flex items-center gap-2">
                  {generating ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}

                  {generating
                    ? 'Generating...'
                    : 'Generate Report'}
                </span>
              </Button>

              <Button
                variant="primary"
                onClick={onExportPdf}
                disabled={!summary}
                className="!rounded-xl"
              >
                <span className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Export PDF
                </span>
              </Button>

              <Button
                variant="primary"
                onClick={onExportCsv}
                disabled={!summary}
                className="!rounded-xl"
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 text-sm text-red-700 shadow-sm">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div>
              <div className="font-bold">
                Something went wrong
              </div>

              <div className="mt-0.5 text-red-600/80">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            PLATFORM OVERVIEW
        ===================================================== */}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-7 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />

                <h3 className="text-base font-black text-slate-900">
                  Platform Overview
                </h3>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Current platform activity based on available
                application data.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            <MetricCard
              label="Total Users"
              value={summary?.users?.total}
              description="All registered users"
              icon={<Users className="h-5 w-5" />}
              tone="blue"
            />

            <MetricCard
              label="Active Users"
              value={summary?.users?.activeThisMonth}
              description="Active this month"
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="green"
            />

            <MetricCard
              label="New Users"
              value={summary?.users?.newThisMonth}
              description="Joined this month"
              icon={<TrendingUp className="h-5 w-5" />}
              tone="blue"
            />

            <MetricCard
              label="Reports Generated"
              value={summary?.totalReports}
              description="Stored reports"
              icon={<FileText className="h-5 w-5" />}
              tone="slate"
            />

            <MetricCard
              label="Active Alerts"
              value={summary?.activeAlerts}
              description="Unread active notifications"
              icon={<AlertCircle className="h-5 w-5" />}
              tone="red"
            />

            <MetricCard
              label="Open Jobs"
              value={summary?.recruitment?.openJobs}
              description="Currently open"
              icon={<Target className="h-5 w-5" />}
              tone="amber"
            />
          </div>
        </section>

        {/* =====================================================
            PLATFORM HEALTH
        ===================================================== */}

        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                  <Gauge className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    Platform Health
                  </h3>

                  <p className="text-xs text-slate-500">
                    Current service and monitoring status.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Live health check
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="space-y-3">
                <StatusItem
                  label="Data Accuracy"
                  value={
                    accuracyAvailable
                      ? `${summary.dataAccuracy}%`
                      : null
                  }
                  description={
                    accuracyAvailable
                      ? 'Measured by the platform monitoring system.'
                      : 'No authoritative data-quality metric is available.'
                  }
                  status={
                    accuracyAvailable
                      ? 'healthy'
                      : 'unavailable'
                  }
                  icon={
                    <Target className="h-4 w-4" />
                  }
                />

                <StatusItem
                  label="System Uptime"
                  value={
                    uptimeAvailable
                      ? `${summary.systemUptime}%`
                      : null
                  }
                  description={
                    uptimeAvailable
                      ? 'Based on recorded platform uptime.'
                      : 'No uptime-monitoring history is currently available.'
                  }
                  status={
                    uptimeAvailable
                      ? 'healthy'
                      : 'unavailable'
                  }
                  icon={
                    <Activity className="h-4 w-4" />
                  }
                />
              </div>

              <div className="space-y-3">
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
                  icon={
                    <Server className="h-4 w-4" />
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
                  icon={
                    <Database className="h-4 w-4" />
                  }
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock3 className="h-4 w-4 text-slate-400" />

                <span>
                  Health response:{' '}
                  <strong className="text-slate-700">
                    {healthResponseTime != null
                      ? `${healthResponseTime} ms`
                      : 'Checking...'}
                  </strong>
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                Metrics marked{' '}
                <strong className="text-slate-700">
                  Not monitored
                </strong>{' '}
                are intentionally not presented as healthy or
                unhealthy because the backend does not currently
                provide authoritative monitoring data for them.
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            LEARNING + RECRUITMENT
        ===================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* LEARNING */}
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
                  <BarChart3 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    Learning & Assessment
                  </h3>

                  <p className="text-xs text-slate-500">
                    Learner progress and assessment activity.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MiniStat
                  label="Enrollments"
                  value={
                    summary?.learning?.totalEnrollments
                  }
                  tone="slate"
                  icon={<Users className="h-4 w-4" />}
                />

                <MiniStat
                  label="Completed"
                  value={
                    summary?.learning?.completedEnrollments
                  }
                  tone="green"
                  icon={
                    <CheckCircle2 className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Dropped"
                  value={
                    summary?.learning?.droppedEnrollments
                  }
                  tone="amber"
                  icon={
                    <TrendingDown className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Assessments"
                  value={
                    summary?.assessments?.totalAssessments
                  }
                  tone="blue"
                  icon={
                    <FileBarChart className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Completion Rate"
                  value={
                    summary?.learning?.completionRate != null
                      ? `${summary.learning.completionRate}%`
                      : 'â€”'
                  }
                  tone="purple"
                  icon={
                    <TrendingUp className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Dropout Rate"
                  value={
                    summary?.learning?.dropoutRate != null
                      ? `${summary.learning.dropoutRate}%`
                      : 'â€”'
                  }
                  tone="red"
                  icon={
                    <TrendingDown className="h-4 w-4" />
                  }
                />
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                <span className="text-xs font-medium text-slate-500">
                  Completed assessments
                </span>

                <span className="text-sm font-black text-slate-800">
                  {summary?.assessments
                    ?.completedAssessments ?? 'â€”'}
                </span>
              </div>
            </div>
          </div>

          {/* RECRUITMENT */}
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-black text-slate-900">
                    Recruitment Performance
                  </h3>

                  <p className="text-xs text-slate-500">
                    Jobs and application pipeline metrics.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <MiniStat
                  label="Jobs"
                  value={
                    summary?.recruitment?.totalJobs
                  }
                  tone="slate"
                  icon={
                    <FileText className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Open"
                  value={
                    summary?.recruitment?.openJobs
                  }
                  tone="blue"
                  icon={
                    <Activity className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Applications"
                  value={
                    summary?.recruitment?.totalApplications
                  }
                  tone="slate"
                  icon={
                    <Users className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Shortlisted"
                  value={
                    summary?.recruitment
                      ?.shortlistedApplications
                  }
                  tone="amber"
                  icon={
                    <Target className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Selected"
                  value={
                    summary?.recruitment
                      ?.selectedApplications
                  }
                  tone="green"
                  icon={
                    <CheckCircle2 className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Rejected"
                  value={
                    summary?.recruitment
                      ?.rejectedApplications
                  }
                  tone="red"
                  icon={
                    <TrendingDown className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Shortlist Rate"
                  value={
                    summary?.recruitment?.shortlistRate != null
                      ? `${summary.recruitment.shortlistRate}%`
                      : 'â€”'
                  }
                  tone="purple"
                  icon={
                    <TrendingUp className="h-4 w-4" />
                  }
                />

                <MiniStat
                  label="Selection Rate"
                  value={
                    summary?.recruitment?.selectionRate != null
                      ? `${summary.recruitment.selectionRate}%`
                      : 'â€”'
                  }
                  tone="indigo"
                  icon={
                    <Target className="h-4 w-4" />
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            CHARTS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* LEARNING CHART */}
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <LineChartIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">
                      Learning Completion Trend
                    </h3>

                    <p className="text-xs text-slate-500">
                      Completions versus dropouts over time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-72">
                {summary?.courseEngagement?.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={summary.courseEngagement}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="month"
                        tick={{
                          fontSize: 11,
                          fill: '#64748b',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 11,
                          fill: '#64748b',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          boxShadow:
                            '0 12px 35px rgba(15,23,42,0.12)',
                        }}
                      />

                      <Legend
                        wrapperStyle={{
                          fontSize: 11,
                          paddingTop: 10,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="completions"
                        name="Completions"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{
                          r: 3,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 5,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="dropouts"
                        name="Dropouts"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{
                          r: 3,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 5,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-full place-items-center rounded-2xl bg-slate-50/60 text-sm text-slate-400">
                    No learning trend data available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* USER ENGAGEMENT */}
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">
                      User Engagement
                    </h3>

                    <p className="text-xs text-slate-500">
                      Current engagement by channel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-72">
                {summary?.userEngagement?.length ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={summary.userEngagement}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="channel"
                        tick={{
                          fontSize: 11,
                          fill: '#64748b',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 11,
                          fill: '#64748b',
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          boxShadow:
                            '0 12px 35px rgba(15,23,42,0.12)',
                        }}
                      />

                      <Bar
                        dataKey="value"
                        name="Users"
                        fill="#6366f1"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-full place-items-center rounded-2xl bg-slate-50/60 text-sm text-slate-400">
                    No user engagement data available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            TOP REPORTS + EXPORT HISTORY
        ===================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* TOP REPORTS */}
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">
                      Top Reports
                    </h3>

                    <p className="text-xs text-slate-500">
                      Recently generated platform reports.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                  {top.length}
                </span>
              </div>

              <ul className="space-y-2">
                {top.length === 0 ? (
                  <li className="rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-400">
                    No reports yet.
                  </li>
                ) : (
                  top.map((r) => (
                    <li
                      key={r.id}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 transition-transform group-hover:scale-105">
                          <FileBarChart className="h-4.5 w-4.5" />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-slate-800">
                            {r.title}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500">
                            {r.type || 'Report'}
                          </div>
                        </div>
                      </div>

                      <div className="no-print flex shrink-0 items-center gap-1.5">
                        <button
                          className="grid h-8 w-8 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100"
                          onClick={() => startEdit(r)}
                          title="Edit report"
                          type="button"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                          title="Download CSV"
                          onClick={() =>
                            downloadReport(r)
                          }
                          type="button"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* EXPORT HISTORY */}
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Download className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">
                      Export History
                    </h3>

                    <p className="text-xs text-slate-500">
                      Previously exported reports.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                  {exports.length}
                </span>
              </div>

              <ul className="space-y-2">
                {exports.length === 0 ? (
                  <li className="rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-400">
                    No exports yet.
                  </li>
                ) : (
                  exports.map((r) => (
                    <li
                      key={r.id}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/70 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 text-[9px] font-black text-emerald-700">
                          {String(
                            r.format || 'pdf'
                          ).toUpperCase() === 'CSV'
                            ? 'CSV'
                            : 'PDF'}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-slate-800">
                            {r.title}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500">
                            {String(
                              r.format || 'pdf'
                            ).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
                        <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                        {fmtDate(r.exported_at)}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          EDIT REPORT MODAL
      ========================================================= */}

      {editingReport && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-md"
          onClick={() => setEditingReport(null)}
        >
          <form
            onSubmit={saveEdit}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_100px_rgba(15,23,42,0.3)] backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/15 blur-3xl" />

            <div className="relative border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                    <Pencil className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      Report Management
                    </div>

                    <h3 className="mt-0.5 text-xl font-black text-slate-900">
                      Edit Report
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Close edit report"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative p-6">
              <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <FileText className="h-4 w-4" />
                  </div>

                  <p className="text-xs leading-5 text-slate-600">
                    Update the report title. Changes are saved to
                    the backend.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setEditingReport(null)
                  }
                  className="!rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={savingEdit}
                  className="!rounded-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    {savingEdit ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}

                    {savingEdit
                      ? 'Saving...'
                      : 'Save Changes'}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}