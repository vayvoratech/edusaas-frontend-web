import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { learningPath } from '../mocks/data';
import { getCourses, getMyEnrollments, enrollCourse } from '../services/api';

const icons = { aws: '☁️', devops: '⚙️', k8s: '🐳', default: '📘' };
const pickIcon = (course) => {
  const t = (course.title || '').toLowerCase();
  if (t.includes('aws') || t.includes('cloud')) return icons.aws;
  if (t.includes('devops')) return icons.devops;
  if (t.includes('kuber')) return icons.k8s;
  return icons.default;
};

export default function LearningPath() {
  const [courses, setCourses] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [cs, es] = await Promise.all([
          getCourses(),
          getMyEnrollments().catch(() => []),
        ]);
        setCourses(cs);
        setEnrolledIds(new Set(es.map((e) => e.course_id)));
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load courses');
      }
    })();
  }, []);

  const onEnroll = async (id) => {
    setBusyId(id);
    try {
      await enrollCourse(id);
      setEnrolledIds((prev) => new Set(prev).add(id));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Enroll failed');
    } finally {
      setBusyId(null);
    }
  };

  // Live courses if loaded; otherwise fall back to mock learning path steps
  const items = courses
    ? courses.map((c) => ({
        id: c.id,
        title: c.title,
        provider: c.provider,
        duration: c.category,
        icon: pickIcon(c),
        enrolled: enrolledIds.has(c.id),
      }))
    : learningPath.steps.map((s, i) => ({
        id: `mock-${i}`,
        title: s.title,
        provider: s.provider,
        duration: s.duration,
        icon: icons[s.icon] || icons.default,
        enrolled: s.status === 'enrolled',
      }));

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

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {items.map((step, i) => (
          <Card key={step.id} className="relative">
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-blue-500 text-white grid place-items-center text-sm font-bold shadow">
              {i + 1}
            </div>
            <div className="text-4xl mb-2">{step.icon}</div>
            <h3 className="font-semibold text-slate-900">{step.title}</h3>
            <div className="text-xs text-slate-500 mt-1">
              {step.provider} · {step.duration}
            </div>
            <div className="mt-4 flex gap-2">
              {step.enrolled ? (
                <Button variant="success" className="flex-1">Continue</Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled={busyId === step.id || String(step.id).startsWith('mock-')}
                    onClick={() => onEnroll(step.id)}
                  >
                    {busyId === step.id ? 'Enrolling…' : 'Enroll'}
                  </Button>
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
