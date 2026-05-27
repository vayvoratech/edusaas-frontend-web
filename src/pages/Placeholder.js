import React from 'react';
import { Card } from '../components/ui/Card';

export default function Placeholder({ title, description }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <Card className="text-center py-16">
        <div className="text-5xl mb-3">🛠️</div>
        <h3 className="text-lg font-semibold text-slate-900">Coming soon</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          This screen is part of the next build. The data model and routing are already wired up — UI to follow.
        </p>
      </Card>
    </div>
  );
}
