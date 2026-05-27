import React from 'react';
import { Card, StatPill } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gauge } from '../components/ui/Gauge';

const candidates = [
  { name: 'Raj Mehta', role: 'Cloud Engineer', match: 82, avatar: 'https://i.pravatar.cc/80?img=12' },
  { name: 'Anita Verma', role: 'Data Analyst', match: 77, avatar: 'https://i.pravatar.cc/80?img=45' },
  { name: 'Vikram Singh', role: 'DevOps Engineer', match: 71, avatar: 'https://i.pravatar.cc/80?img=33' },
];

export default function EmployerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Employer Dashboard</h2>
        <p className="text-sm text-slate-500">
          Talent readiness, candidate search, and workforce insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Talent Readiness">
          <div className="flex flex-col items-center">
            <Gauge value={64} size={180} label="Pipeline Readiness" />
            <p className="text-xs text-slate-500 text-center mt-3 max-w-xs">
              Across 280 active candidates in your shortlist.
            </p>
          </div>
        </Card>

        <Card title="Find Candidates" className="lg:col-span-2">
          <div className="space-y-3">
            {candidates.map((c) => (
              <div
                key={c.name}
                className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-800 truncate">{c.name}</div>
                  <div className="text-xs text-slate-500 truncate">{c.role}</div>
                </div>
                <StatPill label="Match" value={`${c.match}%`} tone={c.match >= 80 ? 'green' : 'orange'} />
                <Button size="sm" variant="outline" className="w-full sm:w-auto">Invite for Assessment</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Post Skill Requirements">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-800">AWS Solutions Architect</div>
            <div className="text-xs text-slate-500 mb-3">12 candidates available</div>
            <Button size="sm" variant="success">Continue Posting</Button>
          </div>
          <div className="p-4 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-800">Senior Data Engineer</div>
            <div className="text-xs text-slate-500 mb-3">8 candidates available</div>
            <Button size="sm" variant="success">Continue Posting</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
