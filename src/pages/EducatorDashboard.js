import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, StatPill } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { skillGapTrend, batchPerformance, topSkillGaps } from '../mocks/data';
import { getCourses, getInsights } from '../services/api';

export default function EducatorDashboard() {
  const [courses, setCourses] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => {});
    getInsights().then(setInsights).catch(() => {}); // admin-only; silently fall back
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Educator Dashboard</h2>
        <p className="text-sm text-slate-500">
          Batch analytics, curriculum alignment, and learning paths.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Skill Gap Trends" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={skillGapTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" name="BCA" dataKey="python" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" name="B.Tech" dataKey="aws" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" name="Grads" dataKey="devops" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Batch Performance">
          <div className="space-y-4">
            {batchPerformance.map((b) => (
              <div key={b.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">{b.name}</span>
                  <StatPill value={`${b.value}%`} tone={b.value >= 70 ? 'green' : 'orange'} />
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${b.value}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Top Skill Gaps">
          <ul className="space-y-3">
            {topSkillGaps.map((g) => (
              <li key={g.name} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ background: g.color }} />
                <span className="flex-1 text-sm text-slate-800">{g.name}</span>
                <span className="text-sm font-semibold">{g.value}%</span>
              </li>
            ))}
          </ul>
          <Button className="mt-5 w-full" variant="primary">
            Assign Learning Path →
          </Button>
        </Card>

        <Card title="Curriculum Alignment">
          <p className="text-sm text-slate-600">
            Compare your current syllabus against industry skill needs to spot mismatches.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-4 rounded-lg bg-brand-blue-50">
              <div className="text-xs text-slate-500">Live courses</div>
              <div className="text-2xl font-bold text-brand-blue-700">{courses.length}</div>
            </div>
            <div className="p-4 rounded-lg bg-brand-orange-100">
              <div className="text-xs text-slate-500">Enrollments</div>
              <div className="text-2xl font-bold text-brand-orange-600">
                {insights?.totals?.enrollments ?? '—'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
