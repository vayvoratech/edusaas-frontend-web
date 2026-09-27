import React, { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../components/ui/Card';
import { getMyProgress} from '../services/api';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const displayHours = (hours) => `${Number(hours || 0).toFixed(hours % 1 ? 1 : 0)} hrs`;

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
    if (value.data && typeof value.data === 'object') return unwrapEntries(value.data);
    if (value.result && typeof value.result === 'object') return unwrapEntries(value.result);
    if (value.payload && typeof value.payload === 'object') return unwrapEntries(value.payload);

    return Object.entries(value || {}).map(([date, entry]) => ({
      date,
      ...(typeof entry === 'object' && entry !== null ? entry : { hours: entry }),
    }));
  };

  const shouldCount = (item) => {
    const completeValue = item?.completion_flag ?? item?.completionFlag ?? item?.is_completed ?? item?.isCompleted ?? item?.completed ?? item?.status;
    if (completeValue == null) return true;
    if (typeof completeValue === 'boolean') return completeValue;
    if (typeof completeValue === 'number') return completeValue === 1;
    if (typeof completeValue === 'string') {
      return ['completed', 'complete', 'done', 'finished', 'success'].includes(completeValue.trim().toLowerCase());
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

    const hourValue = item?.hours ?? item?.watch_hours ?? item?.watchHours ?? item?.total_hours ?? item?.totalHours;
    const minuteValue = item?.minutes_watched ?? item?.minutesWatched ?? item?.total_minutes ?? item?.totalMinutes;
    const secondValue = item?.watched_duration ?? item?.watchedDuration ?? item?.watch_time ?? item?.watchTime ?? item?.seconds_watched ?? item?.secondsWatched ?? item?.total_seconds ?? item?.totalSeconds ?? item?.duration ?? item?.value;
    const numericValue = (value) => typeof value === 'string' ? Number(String(value).match(/[\d.]+/)?.[0] ?? 0) : Number(value ?? 0);

    const seconds = secondValue != null
      ? numericValue(secondValue)
      : minuteValue != null
        ? numericValue(minuteValue) * 60
        : hourValue != null
          ? numericValue(hourValue) * 3600
          : 0;

    const hours = seconds / 3600;

    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(hours) && hours > 0) {
      result[date] = Number(((result[date] || 0) + hours).toFixed(2));
    }
    return result;
  }, {});
};

export default function EngagementTrends() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [hoursByDay, setHoursByDay] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const monthParam = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;

    getMyProgress({ month: monthParam })
      .then((data) => active && setHoursByDay(normaliseDailyWatchHours(data)))
      .catch(() => {
        if (!active) return;
        setHoursByDay({});
        setError('Watch hours could not be loaded for this month.');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [month]);

  const calendarDays = useMemo(() => {
    const leading = (month.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: leading + count }, (_, i) => i < leading ? null : new Date(month.getFullYear(), month.getMonth(), i - leading + 1));
  }, [month]);

  const weeklyTotals = useMemo(() => Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, i) => {
    const days = calendarDays.slice(i * 7, i * 7 + 7).filter(Boolean);
    const total = days.reduce((sum, day) => sum + (hoursByDay[dateKey(day)] || 0), 0);
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return { label: `${formatter.format(days[0])} – ${formatter.format(days[days.length - 1])}`, total };
  }), [calendarDays, hoursByDay]);

  const monthTotal = calendarDays.filter(Boolean).reduce((sum, day) => sum + (hoursByDay[dateKey(day)] || 0), 0);
  const dailyChartData = calendarDays.filter(Boolean).map((day) => ({
    day: day.getDate(),
    hours: hoursByDay[dateKey(day)] || 0,
  }));
  const selectedHours = hoursByDay[selectedDate] || 0;
  const selected = new Date(`${selectedDate}T00:00:00`);
  const changeMonth = (offset) => {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setSelectedDate(dateKey(next));
    setMonth(next);
  };

  return <div className="space-y-6">
    <div><h2 className="text-2xl font-bold text-slate-900">Engagement Trends</h2><p className="text-sm text-slate-500">Review completed watch time for course content across each day and week.</p></div>
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)] gap-5 sm:gap-6 items-stretch">
      <Card className="overflow-hidden !p-0">
        <div className="bg-gradient-to-r from-brand-blue-700 via-brand-blue-600 to-indigo-600 px-5 sm:px-7 py-3 text-white">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.16em] text-white/70">Watch time calendar</p><h3 className="mt-1 text-xl font-bold">{monthFormatter.format(month)}</h3></div>
            <div className="flex gap-2"><button type="button" onClick={() => changeMonth(-1)} className="w-10 h-10 rounded-xl bg-white/15 text-xl hover:bg-white/25" aria-label="Previous month">‹</button><button type="button" onClick={() => changeMonth(1)} className="w-10 h-10 rounded-xl bg-white/15 text-xl hover:bg-white/25" aria-label="Next month">›</button></div>
          </div>
        </div>
        <div className="p-3 sm:p-5">
          <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2"><span className="text-sm text-slate-500">Total watched this month</span><span className="text-lg font-bold text-brand-blue-700">{displayHours(monthTotal)}</span></div>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
          {weekDays.map((day) => <div className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400" key={day}>{day}</div>)}
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} />;
            const key = dateKey(day); const hours = hoursByDay[key] || 0; const selectedDay = key === selectedDate;
            return <button type="button" key={key} onClick={() => setSelectedDate(key)} aria-label={`${dayFormatter.format(day)}: ${displayHours(hours)} watched`} className={`min-h-12 sm:min-h-14 rounded-lg border px-1.5 py-1 text-left shadow-sm transition-all ${selectedDay ? 'border-brand-blue-500 bg-brand-blue-50 ring-2 ring-brand-blue-500/30 shadow-brand-blue-100' : hours > 0 ? 'border-brand-blue-100 bg-gradient-to-br from-white to-brand-blue-50/70 hover:-translate-y-0.5 hover:border-brand-blue-300' : 'border-slate-100 hover:border-brand-blue-200 hover:bg-slate-50'}`}>
              <span className="block text-xs font-semibold text-slate-700">{day.getDate()}</span><span className={`mt-1 block text-[9px] sm:text-[10px] font-bold ${hours > 0 ? 'text-brand-blue-700' : 'text-slate-300'}`}>{hours > 0 ? displayHours(hours) : '—'}</span>
            </button>;
          })}
          </div>
        </div>
        {loading && <p className="mt-4 text-sm text-slate-500">Loading watch hours…</p>}{error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </Card>
      <div className="space-y-4">
        <Card title="Daily Watch-Hour Analysis" className="h-[332px]"><p className="text-xs text-slate-500 -mt-2 mb-3">Completed course viewing hours by day.</p><ResponsiveContainer width="100%" height="85%"><AreaChart data={dailyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}><defs><linearGradient id="watchHoursFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [displayHours(value), 'Completed watched']} labelFormatter={(label) => `${monthFormatter.format(month)} ${label}`} /><Area type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={3} fill="url(#watchHoursFill)" /></AreaChart></ResponsiveContainer></Card>
        <Card title="Selected Day" className="bg-slate-50"><div className="text-sm font-medium text-slate-800">{dayFormatter.format(selected)}</div><div className="mt-2 text-2xl font-bold text-slate-900">{displayHours(selectedHours)}</div><p className="mt-1 text-xs text-slate-500">Completed course watch time for this date.</p></Card>
      </div>
    </div>
    <Card title="Weekly Watch Hours"><p className="text-xs text-slate-500 -mt-2 mb-3">Completed watch-hour totals for each week in the selected month.</p><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{weeklyTotals.map((week) => <div key={week.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><div className="text-xs text-slate-500">{week.label}</div><div className="mt-1 text-xl font-bold text-slate-900">{displayHours(week.total)}</div></div>)}</div></Card>
  </div>;
}
