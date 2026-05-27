import React from 'react';
import { Card, StatPill } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const stats = [
  { label: 'Active Users', value: '1,250', tone: 'blue' },
  { label: 'Active Courses', value: '450', tone: 'green' },
  { label: 'Open Assessments', value: '83', tone: 'orange' },
  { label: 'Subscriptions', value: '37', tone: 'slate' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-sm text-slate-500">
          User management, permissions, and platform usage.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="!p-4">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            <StatPill value="↑ 4.2% this month" tone={s.tone} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card title="AI Insights Hub">
          <p className="text-sm text-slate-600">
            Predictive analytics for future in-demand skills and personalized recommendations across your learner base.
          </p>
          <ul className="mt-4 text-sm space-y-2">
            <li className="flex justify-between"><span>Cloud-native skills</span><span className="font-semibold text-brand-blue-700">↑ 28%</span></li>
            <li className="flex justify-between"><span>Generative AI literacy</span><span className="font-semibold text-brand-orange-600">↑ 41%</span></li>
            <li className="flex justify-between"><span>Cybersecurity fundamentals</span><span className="font-semibold text-brand-green-600">↑ 19%</span></li>
          </ul>
          <Button className="mt-5 w-full" variant="primary">Open Insights Hub →</Button>
        </Card>

        <Card title="Subscription Management">
          <p className="text-sm text-slate-600">
            Billing, integrations, and system health.
          </p>
          <ul className="mt-4 text-sm space-y-2">
            <li className="flex justify-between"><span>Active subscriptions</span><span className="font-semibold">37</span></li>
            <li className="flex justify-between"><span>Trial accounts</span><span className="font-semibold">12</span></li>
            <li className="flex justify-between"><span>Churn this month</span><span className="font-semibold text-brand-red-500">2</span></li>
          </ul>
          <Button className="mt-5 w-full" variant="outline">Manage Plans</Button>
        </Card>
      </div>
    </div>
  );
}
