import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gauge } from '../components/ui/Gauge';
import { SkillBar } from '../components/ui/SkillBar';
import { gapReport } from '../mocks/data';

export default function GapReport() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gap Analysis Report</h2>
          <p className="text-sm text-slate-500">
            Your skills vs. the requirements for Cloud Engineer roles.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Compare with Industry</Button>
          <Button variant="primary">Download Report</Button>
          <Button variant="accent">Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Readiness Overview">
          <div className="flex flex-col items-center">
            <Gauge value={gapReport.readiness} size={200} label="Overall Readiness" />
          </div>
        </Card>

        <Card title="Strengths" className="border-l-4 border-l-brand-green-500">
          <ul className="space-y-2">
            {gapReport.strengths.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <span className="text-brand-green-500">✓</span>
                <span className="text-slate-800">{s.name}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Needs Improvement" className="border-l-4 border-l-brand-orange-500">
          <ul className="space-y-2">
            {gapReport.needsImprovement.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <span className="text-brand-orange-500">⚠</span>
                <span className="text-slate-800">{s.name}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Skill Gap Analysis">
        <div className="space-y-4">
          {gapReport.breakdown.map((b) => (
            <SkillBar
              key={b.skill}
              name={b.skill}
              value={b.value}
              color={b.value >= 70 ? '#10b981' : b.value >= 40 ? '#f97316' : '#ef4444'}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
