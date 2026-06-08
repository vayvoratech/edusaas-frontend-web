import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getMyRecommendations, enrollCourse, getMyEnrollments } from '../services/api';

const iconFor = (c) => {
  const t = (c?.title || '').toLowerCase();
  if (t.includes('python')) return '🐍';
  if (t.includes('data')) return '📊';
  if (t.includes('soft')) return '💬';
  if (t.includes('machine')) return '🤖';
  return '📘';
};

export default function RecommendationsPage() {
  const [recs, setRecs] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [r, e] = await Promise.all([
          getMyRecommendations(),
          getMyEnrollments().catch(() => []),
        ]);
        setRecs(r);
        setEnrolledIds(new Set(e.map((x) => x.course_id)));
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    })();
  }, []);

  const onEnroll = async (courseId) => {
    setBusyId(courseId);
    try {
      await enrollCourse(courseId);
      setEnrolledIds((prev) => new Set(prev).add(courseId));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Course Recommendations</h2>
        <p className="text-sm text-slate-500">Picked for you based on your progress and goals.</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {recs.map((r) => {
          const enrolled = enrolledIds.has(r.course_id);
          const c = r.course;
          if (!c) return null;
          return (
            <Card key={r.id}>
              <div className="flex items-start gap-3">
                <div className="text-4xl">{iconFor(c)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{c.title}</h3>
                  <div className="text-[11px] uppercase text-slate-400 mt-0.5">
                    Difficulty: {c.difficulty || 'beginner'}
                  </div>
                  {r.reason && (
                    <p className="text-sm text-slate-600 mt-2">{r.reason}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {enrolled ? (
                  <Button variant="success" className="flex-1" disabled>✓ Enrolled</Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => onEnroll(c.id)}
                    disabled={busyId === c.id}
                  >
                    {busyId === c.id ? 'Enrolling…' : 'Enroll Now →'}
                  </Button>
                )}
                <Button variant="outline">Preview</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {recs.length === 0 && (
        <Card>
          <p className="text-sm text-slate-500 text-center py-6">
            No recommendations yet. Take more assessments to unlock personalized picks.
          </p>
        </Card>
      )}
    </div>
  );
}
