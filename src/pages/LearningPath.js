import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { learningPath } from '../mocks/data';

const icons = { aws: '☁️', devops: '⚙️', k8s: '🐳' };

export default function LearningPath() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Your Learning Path to {learningPath.targetRole}
        </h2>
        <p className="text-sm text-slate-500">
          A curated sequence to close your skill gaps in the right order.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {learningPath.steps.map((step, i) => (
          <Card key={step.title} className="relative">
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-blue-500 text-white grid place-items-center text-sm font-bold shadow">
              {i + 1}
            </div>
            <div className="text-4xl mb-2">{icons[step.icon]}</div>
            <h3 className="font-semibold text-slate-900">{step.title}</h3>
            <div className="text-xs text-slate-500 mt-1">
              {step.provider} · {step.duration}
            </div>
            <div className="mt-4 flex gap-2">
              {step.status === 'enrolled' ? (
                <Button variant="success" className="flex-1">Continue</Button>
              ) : (
                <>
                  <Button variant="primary" className="flex-1">Enroll</Button>
                  <Button variant="outline">Start</Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-brand-orange-100 via-white to-brand-blue-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-brand-orange-600 font-semibold">
              Suggested Project
            </div>
            <h3 className="font-bold text-lg text-slate-900">
              {learningPath.suggestedProject}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Apply what you&apos;ve learned with a hands-on project employers will recognize.
            </p>
          </div>
          <Button variant="accent">Start Project →</Button>
        </div>
      </Card>
    </div>
  );
}
