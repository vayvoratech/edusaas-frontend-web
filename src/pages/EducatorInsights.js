import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
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
    const params = courseId && courseId !== 'all' ? { course_id: courseId } : {};
    getEducatorDashboard(params)
      .then((res) => {
        setData(res);
        if (res?.selectedCourseId) setSelectedCourseId(res.selectedCourseId);
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
      : (data?.courses || []).find((c) => c.id === selectedCourseId)?.title || 'Selected Course';

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
      ...(data?.learnerPerformance || []).map((r) => [r.week, r.technical, r.engagement]),
    ];
    downloadCsv(`educator_insights_${todayStamp()}.csv`, rows);
  };
  const onExportPdf = () => window.print();

  const proficiencyData = data?.learnerProficiency
    ? [
        { name: 'Basic', value: data.learnerProficiency.basic },
        { name: 'Intermediate', value: data.learnerProficiency.intermediate },
        { name: 'Advanced', value: data.learnerProficiency.advanced },
      ]
    : [];

  const hasData = !!data;
  return (
    <div className="space-y-6" id="print-area">
      <style>{printStyleHtml}</style>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Insights & Reports</h2>
          <p className="text-sm text-slate-500">
            Learner performance, engagement, and skill gaps for{' '}
            <span className="font-semibold text-brand-blue-700">{selectedCourseName}</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print">
          {(data?.courses || []).length > 0 && (
            <select
              value={selectedCourseId}
              onChange={(e) => onCourseChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="all">All Courses (Combined)</option>
              {data.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  Course: {c.title}
                </option>
              ))}
            </select>
          )}
          <Button variant="outline" onClick={onExportPdf} disabled={!hasData || loading}>📄 Export PDF</Button>
          <Button onClick={onExportCsv} disabled={!hasData || loading}>⬇ Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Enrolled Learners</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">{data?.enrolledLearners ?? '—'}</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Active Courses</div>
          <div className="text-3xl font-bold text-brand-green-600 mt-1">{data?.activeCourses ?? '—'}</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Avg Completion</div>
          <div className="text-3xl font-bold text-brand-orange-600 mt-1">{data?.avgCompletion ?? 0}%</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Avg Rating</div>
          <div className="text-3xl font-bold text-slate-700 mt-1">{data?.avgRating ?? '—'} ★</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Skill Gap Analysis">
          <div className="h-56">
            {(data?.skillGapAnalysis || []).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.skillGapAnalysis || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="skill" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(val) => [`${val}%`, 'Proficiency']} />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 italic">
                No skill gap assessments recorded yet.
              </div>
            )}
          </div>
        </Card>

        <Card title="Learner Proficiency">
          <div className="h-56">
            {proficiencyData.some((p) => p.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={proficiencyData} dataKey="value" nameKey="name" outerRadius={75} innerRadius={45}>
                    {proficiencyData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 italic">
                No learner proficiency data yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="Learner Performance & Engagement">
        <div className="h-64">
          {(data?.learnerPerformance || []).length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.learnerPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="technical" stroke="#2563eb" strokeWidth={2} name="Technical Skills (%)" />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement (%)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400 italic">
              No learner performance trends recorded yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
