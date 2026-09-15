import React, { useEffect, useState } from 'react';
import { Card, StatPill } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getInsights, getAllUsers } from '../services/api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const ROLE_COLORS = {
  Student: '#2563eb',
  Educator: '#10b981',
  Employer: '#f59e0b',
  Admin: '#8b5cf6',
};

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

  const activeUsers = (users || []).filter((user) => {
    const status = String(user?.status ?? '').trim().toLowerCase();
    return status !== 'suspended';
  });

  const roleCounts = activeUsers.reduce((acc, user) => {
    const rawRole = String(user?.role ?? '').trim();
    const role = rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase() : 'Unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const activeUsersByRole = ['Student', 'Educator', 'Employer', 'Admin']
    .map((role) => ({
      name: role,
      value: roleCounts[role] || 0,
      color: ROLE_COLORS[role] || '#cbd5e1',
    }))
    .filter((item) => item.value > 0);

  const totalActiveUsers = activeUsers.length;
  const stats = [
    { label: 'Active Users', tone: 'blue', isActiveUsers: true },
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
        {stats.map((s) => {
          if (s.isActiveUsers) {
            return (
              <Card
                key={s.label}
                className="!p-4"
                title={s.label}
                action={
                  <div className="flex items-center gap-2 rounded-full bg-brand-blue-100 px-2.5 py-1 text-xs font-semibold text-brand-blue-700">
                    <span className="text-[10px] uppercase tracking-wide opacity-75">Total Active Users</span>
                    <span>{totalActiveUsers}</span>
                  </div>
                }
              >
                <div className="h-36">
                  {activeUsersByRole.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeUsersByRole}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={24}
                          outerRadius={56}
                          paddingAngle={2}
                          stroke="white"
                          strokeWidth={2}
                        >
                          {activeUsersByRole.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} users`, name || 'Role']}
                          labelFormatter={(label) => label}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No active users
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {activeUsersByRole.map((entry) => (
                    <div
                      key={entry.name}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </Card>
            );
          }

          return (
            <Card key={s.label} className="!p-4">
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
              <StatPill value={`avg score ${insights?.assessments?.average_score ?? 0}%`} tone={s.tone} />
            </Card>
          );
        })}
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
