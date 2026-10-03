import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getMyProgress } from '../services/api';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const displayHours = (hours) =>
  `${Number(hours || 0).toFixed(hours % 1 ? 1 : 0)} hrs`;

/* =========================================================
   Professional SVG Icons
========================================================= */

const ChartIcon = ({ size = 20, strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 19V5" />
    <path d="M4 19h17" />
    <path d="m7 15 4-4 3 2 5-6" />
    <path d="M19 7h-4" />
    <path d="M19 7v4" />
  </svg>
);

const ClockIcon = ({ size = 20, strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

const ActivityIcon = ({ size = 20, strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12h4l2.2-6 4.2 12 2.2-6H21" />
  </svg>
);

const ArrowLeftIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRightIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const SparkleIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m12 3 1.45 5.55L19 10l-5.55 1.45L12 17l-1.45-5.55L5 10l5.55-1.45L12 3Z" />
    <path d="m19 16 .65 2.35L22 19l-2.35.65L19 22l-.65-2.35L16 19l2.35-.65L19 16Z" />
  </svg>
);

const CalendarCheckIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4.5" width="18" height="17" rx="3" />
    <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
    <path d="m8 15 2.2 2.2L16 12.5" />
  </svg>
);

/* =========================================================
   Progress Normalisation
========================================================= */

export const normaliseDailyWatchHours = (payload) => {
  const unwrapEntries = (value) => {
    if (Array.isArray(value)) return value;

    if (!value || typeof value !== 'object') return [];

    if (Array.isArray(value.dailyWatchHours)) return value.dailyWatchHours;
    if (Array.isArray(value.daily_watch_hours)) return value.daily_watch_hours;
    if (Array.isArray(value.daily)) return value.daily;
    if (Array.isArray(value.progress)) return value.progress;
    if (Array.isArray(value.trends)) return value.trends;
    if (Array.isArray(value.data)) return value.data;

    if (value.data && typeof value.data === 'object') {
      return unwrapEntries(value.data);
    }

    if (value.result && typeof value.result === 'object') {
      return unwrapEntries(value.result);
    }

    if (value.payload && typeof value.payload === 'object') {
      return unwrapEntries(value.payload);
    }

    return Object.entries(value || {}).map(([date, entry]) => ({
      date,
      ...(typeof entry === 'object' && entry !== null
        ? entry
        : { hours: entry }),
    }));
  };

  const shouldCount = (item) => {
    const completeValue =
      item?.completion_flag ??
      item?.completionFlag ??
      item?.is_completed ??
      item?.isCompleted ??
      item?.completed ??
      item?.status;

    if (completeValue == null) return true;

    if (typeof completeValue === 'boolean') return completeValue;

    if (typeof completeValue === 'number') return completeValue === 1;

    if (typeof completeValue === 'string') {
      return [
        'completed',
        'complete',
        'done',
        'finished',
        'success',
      ].includes(completeValue.trim().toLowerCase());
    }

    return false;
  };

  const entries = unwrapEntries(payload);

  return entries.reduce((result, item) => {
    if (!shouldCount(item)) return result;

    const date = String(
      item?.date ??
        item?.day ??
        item?.watched_at ??
        item?.watchedAt ??
        item?.last_watched_at ??
        item?.lastWatchedAt ??
        item?.updated_at ??
        item?.updatedAt ??
        item?.created_at ??
        item?.createdAt ??
        ''
    ).slice(0, 10);

    const hourValue =
      item?.hours ??
      item?.watch_hours ??
      item?.watchHours ??
      item?.total_hours ??
      item?.totalHours;

    const minuteValue =
      item?.minutes_watched ??
      item?.minutesWatched ??
      item?.total_minutes ??
      item?.totalMinutes;

    const secondValue =
      item?.watched_duration ??
      item?.watchedDuration ??
      item?.watch_time ??
      item?.watchTime ??
      item?.seconds_watched ??
      item?.secondsWatched ??
      item?.total_seconds ??
      item?.totalSeconds ??
      item?.duration ??
      item?.value;

    const numericValue = (value) =>
      typeof value === 'string'
        ? Number(String(value).match(/[\d.]+/)?.[0] ?? 0)
        : Number(value ?? 0);

    const seconds =
      secondValue != null
        ? numericValue(secondValue)
        : minuteValue != null
          ? numericValue(minuteValue) * 60
          : hourValue != null
            ? numericValue(hourValue) * 3600
            : 0;

    const hours = seconds / 3600;

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      Number.isFinite(hours) &&
      hours > 0
    ) {
      result[date] = Number(
        ((result[date] || 0) + hours).toFixed(2)
      );
    }

    return result;
  }, {});
};

/* =========================================================
   Main Component
========================================================= */

export default function EngagementTrends() {
  const today = useMemo(() => new Date(), []);

  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [hoursByDay, setHoursByDay] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    () => dateKey(today)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    const monthParam = `${month.getFullYear()}-${String(
      month.getMonth() + 1
    ).padStart(2, '0')}`;

    getMyProgress({ month: monthParam })
      .then((data) => {
        if (active) {
          setHoursByDay(normaliseDailyWatchHours(data));
        }
      })
      .catch(() => {
        if (!active) return;

        setHoursByDay({});
        setError('Watch hours could not be loaded for this month.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [month]);

  const calendarDays = useMemo(() => {
    const leading = (month.getDay() + 6) % 7;

    const count = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();

    return Array.from(
      { length: leading + count },
      (_, i) =>
        i < leading
          ? null
          : new Date(
              month.getFullYear(),
              month.getMonth(),
              i - leading + 1
            )
    );
  }, [month]);

  const weeklyTotals = useMemo(
    () =>
      Array.from(
        {
          length: Math.ceil(calendarDays.length / 7),
        },
        (_, i) => {
          const days = calendarDays
            .slice(i * 7, i * 7 + 7)
            .filter(Boolean);

          const total = days.reduce(
            (sum, day) =>
              sum + (hoursByDay[dateKey(day)] || 0),
            0
          );

          const formatter = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return {
            label: `${formatter.format(days[0])} Ã¢â‚¬â€œ ${formatter.format(
              days[days.length - 1]
            )}`,
            total,
          };
        }
      ),
    [calendarDays, hoursByDay]
  );

  const monthTotal = calendarDays
    .filter(Boolean)
    .reduce(
      (sum, day) =>
        sum + (hoursByDay[dateKey(day)] || 0),
      0
    );

  const dailyChartData = calendarDays
    .filter(Boolean)
    .map((day) => ({
      day: day.getDate(),
      hours: hoursByDay[dateKey(day)] || 0,
    }));

  const selectedHours = hoursByDay[selectedDate] || 0;

  const selected = new Date(`${selectedDate}T00:00:00`);

  const changeMonth = (offset) => {
    const next = new Date(
      month.getFullYear(),
      month.getMonth() + offset,
      1
    );

    setSelectedDate(dateKey(next));
    setMonth(next);
  };

  return (
    <div className="engagement-trends-page space-y-6">
      <style>{`
        .engagement-trends-page {
          position: relative;
          isolation: isolate;
        }

        .engagement-trends-page::before {
          content: "";
          position: absolute;
          top: -80px;
          left: -100px;
          width: 320px;
          height: 320px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(37, 99, 235, 0.12),
            rgba(99, 102, 241, 0.06) 42%,
            transparent 72%
          );
          filter: blur(8px);
          pointer-events: none;
          z-index: -1;
        }

        .engagement-trends-page::after {
          content: "";
          position: absolute;
          right: -120px;
          top: 280px;
          width: 360px;
          height: 360px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(139, 92, 246, 0.09),
            transparent 70%
          );
          filter: blur(12px);
          pointer-events: none;
          z-index: -1;
        }

        .engagement-header {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 24px;
          padding: 24px;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.98),
              rgba(248,250,252,.94)
            );
          box-shadow:
            0 18px 50px rgba(15,23,42,.06),
            inset 0 1px 0 rgba(255,255,255,.95);
        }

        .engagement-header::before {
          content: "";
          position: absolute;
          right: -80px;
          top: -110px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(79,70,229,.16),
            transparent 68%
          );
          pointer-events: none;
        }

        .engagement-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #4f46e5;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .engagement-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          box-shadow: 0 0 0 5px rgba(79,70,229,.08);
        }

        .engagement-title {
          margin: 0;
          position: relative;
          font-size: clamp(28px, 4vw, 38px);
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -.045em;
          background: linear-gradient(
            100deg,
            #0f172a 0%,
            #1d4ed8 42%,
            #6d28d9 85%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }

        .engagement-subtitle {
          margin-top: 9px;
          max-width: 720px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.65;
          font-weight: 550;
        }

        .engagement-header-icon {
          position: absolute;
          right: 28px;
          bottom: 22px;
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.85);
          border-radius: 18px;
          color: #fff;
          background: linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed);
          box-shadow:
            0 15px 35px rgba(37,99,235,.24),
            inset 0 1px 0 rgba(255,255,255,.35);
          transform: rotate(4deg);
        }

        .engagement-card {
          position: relative;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: rgba(255,255,255,.94);
          box-shadow:
            0 14px 38px rgba(15,23,42,.055),
            inset 0 1px 0 rgba(255,255,255,.96);
          transition:
            transform .28s ease,
            box-shadow .28s ease,
            border-color .28s ease;
        }

        .engagement-card:hover {
          transform: translateY(-3px);
          border-color: #cbd5e1;
          box-shadow:
            0 22px 48px rgba(15,23,42,.09),
            0 0 0 1px rgba(99,102,241,.04);
        }

        .calendar-header {
          position: relative;
          overflow: hidden;
          padding: 20px 22px;
          color: white;
          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(255,255,255,.18),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #1d4ed8 0%,
              #2563eb 42%,
              #4f46e5 75%,
              #6d28d9 100%
            );
        }

        .calendar-header::after {
          content: "";
          position: absolute;
          left: -20%;
          bottom: -70px;
          width: 75%;
          height: 140px;
          border-radius: 50%;
          background: rgba(255,255,255,.07);
          transform: rotate(-5deg);
        }

        .calendar-label {
          position: relative;
          z-index: 1;
          margin: 0;
          color: rgba(255,255,255,.68);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .calendar-month {
          position: relative;
          z-index: 1;
          margin-top: 4px;
          color: white;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: -.025em;
        }

        .month-controls {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 8px;
        }

        .month-button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.22);
          border-radius: 13px;
          color: white;
          background: rgba(255,255,255,.12);
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition:
            transform .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .month-button:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,.22);
          box-shadow: 0 10px 20px rgba(15,23,42,.12);
        }

        .month-summary {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
          padding: 13px 15px;
          border: 1px solid #dbeafe;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #f5f3ff
            );
        }

        .month-summary::before {
          content: "";
          position: absolute;
          left: -30px;
          top: -40px;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: rgba(59,130,246,.10);
          filter: blur(12px);
        }

        .month-summary-label {
          position: relative;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .month-summary-value {
          position: relative;
          font-size: 20px;
          font-weight: 950;
          letter-spacing: -.025em;
          background: linear-gradient(90deg,#1d4ed8,#6366f1,#7c3aed);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }

        .weekday-label {
          padding-bottom: 8px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .calendar-day {
          position: relative;
          min-height: 56px;
          border: 1px solid #eef2f7;
          border-radius: 12px;
          padding: 7px;
          text-align: left;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(15,23,42,.025);
          transition:
            transform .2s ease,
            border-color .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .calendar-day:hover {
          transform: translateY(-2px);
          border-color: #bfdbfe;
          background: linear-gradient(
            145deg,
            #fff,
            #eff6ff
          );
          box-shadow: 0 10px 22px rgba(37,99,235,.09);
        }

        .calendar-day.has-hours {
          border-color: #dbeafe;
          background: linear-gradient(
            145deg,
            #ffffff,
            #eff6ff
          );
        }

        .calendar-day.selected {
          border-color: #6366f1;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(129,140,248,.16),
              transparent 45%
            ),
            linear-gradient(145deg,#eff6ff,#f5f3ff);
          box-shadow:
            0 0 0 3px rgba(99,102,241,.11),
            0 12px 25px rgba(79,70,229,.12);
        }

        .calendar-day-number {
          display: block;
          color: #334155;
          font-size: 12px;
          font-weight: 850;
        }

        .calendar-day-hours {
          display: block;
          margin-top: 5px;
          color: #2563eb;
          font-size: 9px;
          font-weight: 900;
        }

        .calendar-day-empty {
          color: #cbd5e1;
        }

        .analysis-card {
          min-height: 335px;
        }

        .analysis-heading {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .analysis-icon {
          flex: 0 0 auto;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dbeafe;
          border-radius: 14px;
          color: #2563eb;
          background: linear-gradient(135deg,#eff6ff,#eef2ff);
          box-shadow: 0 8px 18px rgba(37,99,235,.08);
        }

        .analysis-title {
          color: #0f172a;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .analysis-description {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.5;
        }

        .selected-day-card {
          position: relative;
          overflow: hidden;
          border: 1px solid #e0e7ff;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(129,140,248,.13),
              transparent 42%
            ),
            linear-gradient(135deg,#f8fafc,#eef2ff);
        }

        .selected-day-card::after {
          content: "";
          position: absolute;
          right: -40px;
          bottom: -70px;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(79,70,229,.08);
          filter: blur(10px);
        }

        .selected-day-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ddd6fe;
          border-radius: 14px;
          color: #7c3aed;
          background: linear-gradient(135deg,#f5f3ff,#ede9fe);
        }

        .selected-day-label {
          color: #64748b;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .selected-day-date {
          margin-top: 7px;
          color: #1e293b;
          font-size: 13px;
          font-weight: 750;
          line-height: 1.5;
        }

        .selected-day-hours {
          margin-top: 8px;
          font-size: 30px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -.04em;
          background: linear-gradient(90deg,#2563eb,#4f46e5,#7c3aed);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }

        .selected-day-description {
          margin-top: 7px;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.55;
        }

        .weekly-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .weekly-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e0e7ff;
          border-radius: 14px;
          color: #4f46e5;
          background: linear-gradient(135deg,#eef2ff,#f5f3ff);
        }

        .weekly-title {
          color: #0f172a;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .weekly-description {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
        }

        .weekly-item {
          position: relative;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          padding: 15px;
          background: linear-gradient(135deg,#ffffff,#f8fafc);
          transition:
            transform .22s ease,
            border-color .22s ease,
            box-shadow .22s ease;
        }

        .weekly-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(
            180deg,
            #2563eb,
            #4f46e5,
            #7c3aed
          );
          opacity: .75;
        }

        .weekly-item:hover {
          transform: translateY(-2px);
          border-color: #c7d2fe;
          box-shadow: 0 12px 25px rgba(79,70,229,.08);
        }

        .weekly-range {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }

        .weekly-hours {
          margin-top: 5px;
          font-size: 21px;
          font-weight: 950;
          letter-spacing: -.03em;
          background: linear-gradient(90deg,#1d4ed8,#6366f1);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }

        .status-message {
          margin-top: 14px;
          padding: 10px 13px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 650;
        }

        .loading-message {
          border: 1px solid #dbeafe;
          color: #2563eb;
          background: #eff6ff;
        }

        .error-message {
          border: 1px solid #fecaca;
          color: #dc2626;
          background: #fef2f2;
        }

        @media (max-width: 700px) {
          .engagement-header {
            padding: 20px;
          }

          .engagement-header-icon {
            right: 18px;
            bottom: 18px;
            width: 48px;
            height: 48px;
            border-radius: 15px;
          }

          .engagement-subtitle {
            max-width: calc(100% - 65px);
          }
        }

        @media (max-width: 480px) {
          .engagement-header {
            border-radius: 19px;
          }

          .engagement-title {
            font-size: 27px;
          }

          .engagement-subtitle {
            max-width: 100%;
            padding-right: 0;
          }

          .engagement-header-icon {
            display: none;
          }

          .calendar-header {
            padding: 17px;
          }

          .calendar-month {
            font-size: 18px;
          }

          .month-button {
            width: 36px;
            height: 36px;
          }

          .calendar-day {
            min-height: 51px;
            padding: 6px;
          }

          .calendar-day-hours {
            font-size: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .engagement-card,
          .calendar-day,
          .month-button,
          .weekly-item {
            transition: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="engagement-header">
        <div className="engagement-eyebrow">
          <span className="engagement-eyebrow-dot" />
          Learning Analytics
        </div>

        <h2 className="engagement-title">
          Engagement Trends
        </h2>

        <p className="engagement-subtitle">
          Review your completed course watch time across each day
          and week. Explore your learning rhythm and track your
          progress throughout the month.
        </p>

        <div className="engagement-header-icon">
          <ActivityIcon size={27} />
        </div>
      </div>

      {/* =====================================================
          CALENDAR + DAILY ANALYSIS
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)] gap-5 sm:gap-6 items-stretch">

        {/* ===================================================
            WATCH TIME CALENDAR
        ==================================================== */}

        <div className="engagement-card">
          <div className="calendar-header">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="calendar-label">
                  Watch Time Calendar
                </p>

                <h3 className="calendar-month">
                  {monthFormatter.format(month)}
                </h3>
              </div>

              <div className="month-controls">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="month-button"
                  aria-label="Previous month"
                >
                  <ArrowLeftIcon />
                </button>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="month-button"
                  aria-label="Next month"
                >
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <div className="month-summary">
              <div className="month-summary-label">
                Total watched this month
              </div>

              <div className="month-summary-value">
                {displayHours(monthTotal)}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
              {weekDays.map((day) => (
                <div
                  className="weekday-label"
                  key={day}
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-12 sm:min-h-14"
                    />
                  );
                }

                const key = dateKey(day);
                const hours = hoursByDay[key] || 0;
                const selectedDay = key === selectedDate;

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    aria-label={`${dayFormatter.format(
                      day
                    )}: ${displayHours(hours)} watched`}
                    className={`calendar-day ${
                      selectedDay
                        ? 'selected'
                        : hours > 0
                          ? 'has-hours'
                          : ''
                    }`}
                  >
                    <span className="calendar-day-number">
                      {day.getDate()}
                    </span>

                    <span
                      className={`calendar-day-hours ${
                        hours <= 0
                          ? 'calendar-day-empty'
                          : ''
                      }`}
                    >
                      {hours > 0
                        ? displayHours(hours)
                        : 'Ã¢â‚¬â€'}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading && (
              <div className="status-message loading-message">
                Loading your watch hoursÃ¢â‚¬Â¦
              </div>
            )}

            {error && (
              <div className="status-message error-message">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            RIGHT ANALYTICS COLUMN
        ==================================================== */}

        <div className="space-y-4">

          {/* DAILY WATCH ANALYSIS */}

          <div className="engagement-card analysis-card p-5">
            <div className="analysis-heading">
              <div className="analysis-icon">
                <ChartIcon size={21} />
              </div>

              <div>
                <div className="analysis-title">
                  Daily Watch-Hour Analysis
                </div>

                <div className="analysis-description">
                  Completed course viewing hours by day.
                </div>
              </div>
            </div>

            <div className="mt-4 h-[245px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={dailyChartData}
                  margin={{
                    top: 8,
                    right: 8,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="watchHoursFill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2563eb"
                        stopOpacity={0.38}
                      />

                      <stop
                        offset="55%"
                        stopColor="#6366f1"
                        stopOpacity={0.16}
                      />

                      <stop
                        offset="95%"
                        stopColor="#7c3aed"
                        stopOpacity={0.015}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 10,
                      fill: '#64748b',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: '#64748b',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    formatter={(value) => [
                      displayHours(value),
                      'Completed watched',
                    ]}
                    labelFormatter={(label) =>
                      `${monthFormatter.format(month)} ${label}`
                    }
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow:
                        '0 12px 30px rgba(15,23,42,.10)',
                      fontSize: '12px',
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fill="url(#watchHoursFill)"
                    activeDot={{
                      r: 5,
                      strokeWidth: 3,
                      stroke: '#fff',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SELECTED DAY */}

          <div className="engagement-card selected-day-card p-5">
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <div className="selected-day-icon">
                  <CalendarCheckIcon size={21} />
                </div>

                <div>
                  <div className="selected-day-label">
                    Selected Day
                  </div>

                  <div className="selected-day-date">
                    {dayFormatter.format(selected)}
                  </div>
                </div>
              </div>

              <div className="selected-day-hours">
                {displayHours(selectedHours)}
              </div>

              <p className="selected-day-description">
                Completed course watch time for this date.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          WEEKLY WATCH HOURS
      ====================================================== */}

      <div className="engagement-card p-5 sm:p-6">
        <div className="weekly-header">
          <div className="weekly-icon">
            <ClockIcon size={21} />
          </div>

          <div>
            <div className="weekly-title">
              Weekly Watch Hours
            </div>

            <div className="weekly-description">
              Completed watch-hour totals for each week in
              the selected month.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
          {weeklyTotals.map((week) => (
            <div
              key={week.label}
              className="weekly-item"
            >
              <div className="relative z-10">
                <div className="weekly-range">
                  {week.label}
                </div>

                <div className="weekly-hours">
                  {displayHours(week.total)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          LEARNING ACTIVITY FOOTER
      ====================================================== */}

      <div className="flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-slate-400">
        <SparkleIcon size={14} />
        Keep learning consistently to build stronger momentum.
      </div>
    </div>
  );
}