import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { getEmployerDashboard } from '../services/api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

export default function EmployerAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => { getEmployerDashboard().then(setData).catch(() => {}); }, []);

  const matchData = data?.candidateMatches ? [
    { name: 'Strong Match', value: data.candidateMatches.strong },
    { name: 'Good Match', value: data.candidateMatches.good },
    { name: 'Possible Match', value: data.candidateMatches.possible },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Hiring Analytics</h2>
        <p className="text-sm text-slate-500">Job performance, candidate matches, and skills demand.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Job Openings</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">{data?.jobOpenings ?? '—'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active listings</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">New Applicants</div>
          <div className="text-3xl font-bold text-brand-orange-600 mt-1">{data?.newApplicants ?? '—'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across all listings</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Top Matches</div>
          <div className="text-3xl font-bold text-brand-green-600 mt-1">{data?.topMatches ?? '—'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Best fits</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Candidate Matches">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={matchData} dataKey="value" nameKey="name" outerRadius={75} innerRadius={45}>
                  {matchData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Skills Insights">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.skillsInsights || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
