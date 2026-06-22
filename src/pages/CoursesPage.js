import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getCourses, enrollCourse, getMyEnrollments } from '../services/api';

const CATEGORIES = ['', 'Programming', 'Data Science', 'Web Dev', 'Soft Skills', 'AI & ML', 'Management'];
const DIFFICULTIES = ['', 'beginner', 'intermediate', 'advanced'];

const iconFor = (c) => {
  const t = (c.title || '').toLowerCase();
  if (t.includes('python')) return '🐍';
  if (t.includes('data')) return '📊';
  if (t.includes('web')) return '🌐';
  if (t.includes('soft')) return '💬';
  if (t.includes('machine')) return '🤖';
  if (t.includes('project')) return '📋';
  return '📘';
};

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = async (filters) => {
    try {
      const [cs, es] = await Promise.all([
        getCourses({ status: 'active', ...filters }),
        getMyEnrollments().catch(() => []),
      ]);
      setCourses(cs);
      setEnrolledIds(new Set(es.map((e) => e.course_id)));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const onEnroll = async (id) => {
    setBusyId(id);
    try {
      await enrollCourse(id);
      setEnrolledIds((prev) => new Set(prev).add(id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusyId(null);
    }
  };

  const apply = () =>
    load({ category: category || undefined, difficulty: difficulty || undefined });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Courses</h2>
          <p className="text-sm text-slate-500">Browse and enroll.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c || 'all'} value={c}>{c || 'All Categories'}</option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d || 'all'} value={d}>{d ? d[0].toUpperCase() + d.slice(1) : 'All Difficulties'}</option>
            ))}
          </select>
          <Button onClick={apply}>Apply Filter</Button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      {courses.length === 0 && !error && (
        <Card>
          <div className="text-center py-10">
            <div className="text-5xl mb-3">📚</div>
            <h3 className="font-semibold text-slate-800">No courses available</h3>
            <p className="text-sm text-slate-500 mt-1">
              {category || difficulty
                ? 'No courses match the current filters. Try clearing them.'
                : 'No courses have been published yet. Check back soon.'}
            </p>
            {(category || difficulty) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setCategory(''); setDifficulty(''); load(); }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {courses.map((c) => {
          const enrolled = enrolledIds.has(c.id);
          return (
            <Card key={c.id} className="flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">{iconFor(c)}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 truncate">{c.title}</h3>
                  <div className="text-[11px] uppercase text-slate-400 mt-0.5">
                    {c.category} · {c.difficulty}
                  </div>
                </div>
              </div>
              {c.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{c.description}</p>
              )}
              <div className="mt-auto flex gap-2">
                {enrolled ? (
                  <Link to={`/app/learning/${c.id}`} className="flex-1">
                    <Button variant="success" className="w-full">Continue →</Button>
                  </Link>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => onEnroll(c.id)}
                    disabled={busyId === c.id}
                  >
                    {busyId === c.id ? 'Enrolling…' : 'Enroll'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
