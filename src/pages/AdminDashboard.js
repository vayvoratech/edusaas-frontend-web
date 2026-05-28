import React, { useEffect, useState } from 'react';
import { Card, StatPill } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getInsights, getAllUsers } from '../services/api';

export default function AdminDashboard() {
  const [insights, setInsights] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [ins, us] = await Promise.all([getInsights(), getAllUsers()]);
        setInsights(ins);
        setUsers(us);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load admin data');
      }
    })();
  }, []);

  const t = insights?.totals || {};
  const stats = [
    { label: 'Active Users', value: t.users ?? '—', tone: 'blue' },
    { label: 'Active Courses', value: t.courses ?? '—', tone: 'green' },
    { label: 'Enrollments', value: t.enrollments ?? '—', tone: 'orange' },
    { label: 'Open Jobs', value: t.jobs ?? '—', tone: 'slate' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-sm text-slate-500">
          User management, permissions, and platform usage.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="!p-4">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            <StatPill value={`avg score ${insights?.assessments?.average_score ?? 0}%`} tone={s.tone} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card title="AI Insights Hub">
          <p className="text-sm text-slate-600">
            Aggregated platform metrics and the skills your learners need most.
          </p>
          <ul className="mt-4 text-sm space-y-2">
            <li className="flex justify-between"><span>Assessments taken</span><span className="font-semibold">{insights?.assessments?.count ?? 0}</span></li>
            <li className="flex justify-between"><span>Average score</span><span className="font-semibold text-brand-blue-700">{insights?.assessments?.average_score ?? 0}%</span></li>
            <li className="flex justify-between"><span>Applications received</span><span className="font-semibold">{t.applications ?? 0}</span></li>
          </ul>
          <div className="mt-4">
            <div className="text-xs uppercase text-slate-400 mb-2">Top Missing Skills</div>
            <div className="flex flex-wrap gap-2">
              {(insights?.top_missing_skills || []).map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-full bg-brand-orange-100 text-brand-orange-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Recent Users">
          <ul className="text-sm divide-y divide-slate-100">
            {users.slice(0, 6).map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-blue-100 text-brand-blue-700">
                  {u.role}
                </span>
              </li>
            ))}
            {users.length === 0 && (
              <li className="text-xs text-slate-400 py-3">No users yet.</li>
            )}
          </ul>
          <Button className="mt-4 w-full" variant="outline">Manage all users</Button>
        </Card>
      </div>
    </div>
  );
}
