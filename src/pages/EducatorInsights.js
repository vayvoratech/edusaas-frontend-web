import React, { useEffect, useState } from 'react';
import {
ResponsiveContainer,
BarChart,
Bar,
PieChart,
Pie,
Cell,
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getEducatorDashboard } from '../services/api';
import { downloadCsv, todayStamp, printStyleHtml } from '../utils/exports';

const COLORS = ['#2563eb', '#10b981', '#f59e0b'];

export default function EducatorInsights() {
const [data, setData] = useState(null);
const [selectedCourseId, setSelectedCourseId] = useState('all');
const [loading, setLoading] = useState(false);

const loadData = (courseId) => {
setLoading(true);


const params =
  courseId && courseId !== 'all'
    ? { course_id: courseId }
    : {};

getEducatorDashboard(params)
  .then((res) => {
    setData(res);

    if (res?.selectedCourseId) {
      setSelectedCourseId(res.selectedCourseId);
    }
  })
  .catch(() => setData(null))
  .finally(() => setLoading(false));


};

useEffect(() => {
loadData('all');
}, []);

const onCourseChange = (newCourseId) => {
setSelectedCourseId(newCourseId);
loadData(newCourseId);
};

const selectedCourseName =
selectedCourseId === 'all'
? 'All Courses (Combined)'
: (data?.courses || []).find((c) => c.id === selectedCourseId)?.title ||
'Selected Course';

const onExportCsv = () => {
const rows = [
['EduSaaS — Educator Insights Export'],
['Scope', selectedCourseName],
['Generated', new Date().toLocaleString()],
[],
['Headline', 'Value'],
['Enrolled Learners', data?.enrolledLearners ?? 0],
['Active Courses', data?.activeCourses ?? 0],
['Avg Completion %', data?.avgCompletion ?? 0],
['Avg Rating', data?.avgRating ?? 0],
[],
['Section: Skill Gap Analysis'],
['Skill', 'Score'],
...(data?.skillGapAnalysis || []).map((r) => [r.skill, r.value]),
[],
['Section: Learner Proficiency'],
['Level', 'Percentage'],
['Basic', data?.learnerProficiency?.basic ?? 0],
['Intermediate', data?.learnerProficiency?.intermediate ?? 0],
['Advanced', data?.learnerProficiency?.advanced ?? 0],
[],
['Section: Learner Performance'],
['Week', 'Technical Skills', 'Engagement'],
...(data?.learnerPerformance || []).map((r) => [
r.week,
r.technical,
r.engagement,
]),
];


downloadCsv(`educator_insights_${todayStamp()}.csv`, rows);


};

const onExportPdf = () => window.print();

const proficiencyData = data?.learnerProficiency
? [
{
name: 'Basic',
value: data.learnerProficiency.basic,
},
{
name: 'Intermediate',
value: data.learnerProficiency.intermediate,
},
{
name: 'Advanced',
value: data.learnerProficiency.advanced,
},
]
: [];

const hasData = !!data;

return ( <div
   className="relative min-h-full overflow-hidden bg-[#f6f8fc] pb-10"
   id="print-area"
 > <style>{printStyleHtml}</style>

```
  {/* Decorative background */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden"
  >
    <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
    <div className="absolute right-[-120px] top-24 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />
    <div className="absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full bg-emerald-200/20 blur-3xl" />

    <div
      className="absolute inset-0 opacity-[0.28]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
        backgroundSize: '42px 42px',
        maskImage:
          'linear-gradient(to bottom, black 0%, transparent 75%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, transparent 75%)',
      }}
    />
  </div>

  <div className="relative space-y-6">
    {/* Header */}
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#eaf2ff] via-[#f5efff] to-[#fff3e9] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-[32%] h-64 w-64 rounded-full bg-purple-300/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[22%] top-[15%] h-32 w-32 rounded-full bg-orange-200/25 blur-2xl"
      />

      <div className="relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-600 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" />
              Educator Analytics
            </div>

            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Insights{' '}
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-orange-500 bg-clip-text text-transparent">
                & Reports
              </span>
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
              Track learner performance, engagement, proficiency, and skill
              gaps across your courses from one clear analytics dashboard.
            </p>

            <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-white/80 bg-white/55 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Current scope:
              <span className="truncate font-extrabold text-slate-900">
                {selectedCourseName}
              </span>
            </div>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2">
            {(data?.courses || []).length > 0 && (
              <select
                value={selectedCourseId}
                onChange={(e) => onCourseChange(e.target.value)}
                className="min-h-[42px] rounded-xl border border-white/80 bg-white/80 px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none backdrop-blur transition-all hover:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">All Courses (Combined)</option>

                {data.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    Course: {c.title}
                  </option>
                ))}
              </select>
            )}

            <Button
              variant="outline"
              onClick={onExportPdf}
              disabled={!hasData || loading}
              className="!min-h-[42px] !rounded-xl !border-white/80 !bg-white/80 !font-bold !text-slate-700 !shadow-sm backdrop-blur transition-all hover:!border-blue-200 hover:!bg-white hover:!text-blue-700 hover:!shadow-md"
            >
              📄 Export PDF
            </Button>

            <Button
              onClick={onExportCsv}
              disabled={!hasData || loading}
              className="!min-h-[42px] !rounded-xl !bg-slate-950 !font-bold !text-white !shadow-sm transition-all hover:!bg-blue-600 hover:!shadow-lg"
            >
              ⬇ Export CSV
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* Loading indicator */}
    {loading && (
      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white/80 shadow-sm backdrop-blur">
        <div className="h-1 w-full overflow-hidden bg-blue-50">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-orange-400" />
        </div>

        <div className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Updating insights...
        </div>
      </div>
    )}

    {/* Summary cards */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="group !overflow-hidden !rounded-2xl !border !border-blue-100/80 !bg-gradient-to-br !from-white !via-blue-50/50 !to-indigo-50/70 !p-0 !shadow-[0_12px_35px_rgba(37,99,235,0.08)] transition-all duration-300 hover:-translate-y-1 hover:!shadow-[0_18px_45px_rgba(37,99,235,0.14)]">
        <div className="relative p-5">
          <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-blue-200/30 blur-2xl transition-all group-hover:bg-blue-300/40" />

          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg shadow-sm">
                👥
              </div>

              <span className="rounded-full bg-blue-100/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                Learners
              </span>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Enrolled Learners
            </div>

            <div className="mt-1 text-3xl font-black text-blue-700">
              {data?.enrolledLearners ?? '—'}
            </div>
          </div>
        </div>
      </Card>

      <Card className="group !overflow-hidden !rounded-2xl !border !border-emerald-100/80 !bg-gradient-to-br !from-white !via-emerald-50/50 !to-teal-50/70 !p-0 !shadow-[0_12px_35px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-1 hover:!shadow-[0_18px_45px_rgba(16,185,129,0.14)]">
        <div className="relative p-5">
          <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-emerald-200/30 blur-2xl transition-all group-hover:bg-emerald-300/40" />

          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg shadow-sm">
                📚
              </div>

              <span className="rounded-full bg-emerald-100/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Courses
              </span>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Courses
            </div>

            <div className="mt-1 text-3xl font-black text-emerald-600">
              {data?.activeCourses ?? '—'}
            </div>
          </div>
        </div>
      </Card>

      <Card className="group !overflow-hidden !rounded-2xl !border !border-orange-100/80 !bg-gradient-to-br !from-white !via-orange-50/50 !to-amber-50/70 !p-0 !shadow-[0_12px_35px_rgba(245,158,11,0.08)] transition-all duration-300 hover:-translate-y-1 hover:!shadow-[0_18px_45px_rgba(245,158,11,0.14)]">
        <div className="relative p-5">
          <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-orange-200/30 blur-2xl transition-all group-hover:bg-orange-300/40" />

          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-lg shadow-sm">
                📈
              </div>

              <span className="rounded-full bg-orange-100/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                Progress
              </span>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Avg Completion
            </div>

            <div className="mt-1 text-3xl font-black text-orange-600">
              {data?.avgCompletion ?? 0}%
            </div>
          </div>
        </div>
      </Card>

      <Card className="group !overflow-hidden !rounded-2xl !border !border-violet-100/80 !bg-gradient-to-br !from-white !via-violet-50/50 !to-fuchsia-50/60 !p-0 !shadow-[0_12px_35px_rgba(124,58,237,0.08)] transition-all duration-300 hover:-translate-y-1 hover:!shadow-[0_18px_45px_rgba(124,58,237,0.14)]">
        <div className="relative p-5">
          <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-violet-200/30 blur-2xl transition-all group-hover:bg-violet-300/40" />

          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-lg shadow-sm">
                ⭐
              </div>

              <span className="rounded-full bg-violet-100/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-violet-700">
                Rating
              </span>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Avg Rating
            </div>

            <div className="mt-1 text-3xl font-black text-violet-700">
              {data?.avgRating ?? '—'}{' '}
              <span className="text-xl text-amber-500">★</span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card
        title="Skill Gap Analysis"
        className="!overflow-hidden !rounded-[1.5rem] !border !border-slate-200/80 !bg-white/90 !shadow-[0_15px_45px_rgba(15,23,42,0.06)] backdrop-blur"
      >
        <div className="relative h-56 overflow-hidden rounded-2xl border border-blue-50 bg-gradient-to-br from-blue-50/70 via-white to-violet-50/50 p-2">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl" />

          {(data?.skillGapAnalysis || []).length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.skillGapAnalysis || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#dbe5f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="skill"
                  tick={{
                    fontSize: 11,
                    fill: '#475569',
                    fontWeight: 600,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#64748b',
                    fontWeight: 600,
                  }}
                  domain={[0, 100]}
                  unit="%"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                  contentStyle={{
                    borderRadius: 14,
                    border: '1px solid #dbeafe',
                    background: 'rgba(255,255,255,0.96)',
                    boxShadow: '0 12px 30px rgba(15,23,42,0.10)',
                  }}
                  formatter={(val) => [`${val}%`, 'Proficiency']}
                />
                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[8, 8, 2, 2]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium italic text-slate-500">
              No skill gap assessments recorded yet.
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Learner Proficiency"
        className="!overflow-hidden !rounded-[1.5rem] !border !border-slate-200/80 !bg-white/90 !shadow-[0_15px_45px_rgba(15,23,42,0.06)] backdrop-blur"
      >
        <div className="relative h-56 overflow-hidden rounded-2xl border border-emerald-50 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/50 p-2">
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl" />

          {proficiencyData.some((p) => p.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={proficiencyData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                  stroke="none"
                >
                  {proficiencyData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: '1px solid #dbeafe',
                    background: 'rgba(255,255,255,0.96)',
                    boxShadow: '0 12px 30px rgba(15,23,42,0.10)',
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#475569',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium italic text-slate-500">
              No learner proficiency data yet.
            </div>
          )}
        </div>
      </Card>
    </div>

    {/* Performance */}
    <Card
      title="Learner Performance & Engagement"
      className="!overflow-hidden !rounded-[1.5rem] !border !border-slate-200/80 !bg-white/90 !shadow-[0_15px_45px_rgba(15,23,42,0.06)] backdrop-blur"
    >
      <div className="relative h-64 overflow-hidden rounded-2xl border border-violet-50 bg-gradient-to-br from-violet-50/60 via-white to-blue-50/50 p-2">
        <div className="pointer-events-none absolute bottom-[-30px] right-[-20px] h-32 w-32 rounded-full bg-violet-200/25 blur-3xl" />

        {(data?.learnerPerformance || []).length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.learnerPerformance || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#dbe5f0"
                vertical={false}
              />

              <XAxis
                dataKey="week"
                tick={{
                  fontSize: 11,
                  fill: '#475569',
                  fontWeight: 600,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                  fontWeight: 600,
                }}
                domain={[0, 100]}
                unit="%"
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: '1px solid #ddd6fe',
                  background: 'rgba(255,255,255,0.96)',
                  boxShadow: '0 12px 30px rgba(15,23,42,0.10)',
                }}
              />

              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#475569',
                }}
              />

              <Line
                type="monotone"
                dataKey="technical"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: '#2563eb',
                  strokeWidth: 2,
                  stroke: '#ffffff',
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: '#ffffff',
                }}
                name="Technical Skills (%)"
              />

              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#10b981"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: '#10b981',
                  strokeWidth: 2,
                  stroke: '#ffffff',
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: '#ffffff',
                }}
                name="Engagement (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium italic text-slate-500">
            No learner performance trends recorded yet.
          </div>
        )}
      </div>
    </Card>
  </div>
</div>


);
}
