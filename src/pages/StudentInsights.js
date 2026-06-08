import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getStudentDashboard, fetchGapReport } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

export default function StudentInsights() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);
  const [gap, setGap] = useState(null);

  useEffect(() => {
    getStudentDashboard().then(setDash).catch(() => {});
    if (user?.id) fetchGapReport(user.id).then(setGap).catch(() => {});
  }, [user?.id]);

  const learnerProf = [
    { name: 'Basic', value: 22 },
    { name: 'Intermediate', value: 48 },
    { name: 'Advanced', value: 30 },
  ];
  const skillGapData = (gap?.missing_skills || ['Tech', 'Comm', 'Critical']).map((s, i) => ({
    skill: s, value: 90 - i * 15,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Insights</h2>
          <p className="text-sm text-slate-500">Your performance, gaps and engagement trends.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📄 Export PDF</Button>
          <Button>⬇ Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Skill Gap Analysis">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGapData}>
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
                <Pie data={learnerProf} dataKey="value" nameKey="name" outerRadius={75} innerRadius={45}>
                  {learnerProf.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Engagement Trends">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dash?.learningProgress || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Recent Activity">
        <ul className="divide-y divide-slate-100">
          {(dash?.recentActivity || []).map((a) => (
            <li key={a.id} className="py-2.5 flex justify-between text-sm">
              <span className="text-slate-800">✓ {a.title}</span>
              <span className="text-xs text-slate-500">{a.when}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
