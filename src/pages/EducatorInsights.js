import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getEducatorDashboard } from '../services/api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b'];

export default function EducatorInsights() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getEducatorDashboard().then(setData).catch(() => setData(null));
  }, []);

  const proficiencyData = data?.learnerProficiency
    ? [
        { name: 'Basic', value: data.learnerProficiency.basic },
        { name: 'Intermediate', value: data.learnerProficiency.intermediate },
        { name: 'Advanced', value: data.learnerProficiency.advanced },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Insights & Reports</h2>
          <p className="text-sm text-slate-500">Learner performance, engagement, and skill gaps.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📄 Export PDF</Button>
          <Button>⬇ Export CSV</Button>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.skillGapAnalysis || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Learner Proficiency">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={proficiencyData} dataKey="value" nameKey="name" outerRadius={75} innerRadius={45}>
                  {proficiencyData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Learner Performance">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.learnerPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="technical" stroke="#2563eb" strokeWidth={2} name="Technical Skills" />
              <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
