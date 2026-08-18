import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getCourses, enrollCourse, getMyEnrollments } from '../services/api';

// Constants for filtering courses.
const CATEGORIES = ['', 'Programming', 'Data Science', 'Web Dev', 'Soft Skills', 'AI & ML', 'Management'];
const DIFFICULTIES = ['', 'beginner', 'intermediate', 'advanced'];

// Helper function to determine an icon for a course based on its title.
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

// This component displays a list of available courses that users can browse and enroll in.
export default function CoursesPage() {
  // State for courses, enrollments, filters, and UI status.
  const [courses, setCourses] = useState([]);
  const [enrollmentsMap, setEnrollmentsMap] = useState(new Map());
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [busyId, setBusyId] = useState(null); // Tracks which course is being enrolled in.
  const [error, setError] = useState(null);

  // Fetches courses and user's enrollments from the API.
  const load = async (filters) => {
    try {
      const [cs, es] = await Promise.all([
        getCourses({ status: 'active', ...filters }),
        getMyEnrollments().catch(() => []),
      ]);
      setCourses(cs);
      setEnrollmentsMap(new Map(es.map((e) => [e.course_id, e])));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // Load initial data when the component mounts.
  useEffect(() => { load(); }, []);

  // Handles enrolling a user in a course.
  const onEnroll = async (id) => {
    setBusyId(id);
    try {
      await enrollCourse(id);
      load(); // Reload courses and enrollments
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusyId(null);
    }
  };

  // Applies the selected category and difficulty filters.
  const apply = () =>
    load({ category: category || undefined, difficulty: difficulty || undefined });

  return (
    <div className="space-y-6">
      {/* Page header and filter controls. */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Courses</h2>
          <p className="text-sm text-slate-500">Browse and enroll.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Category filter dropdown. */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c || 'all'} value={c}>{c || 'All Categories'}</option>
            ))}
          </select>
          {/* Difficulty filter dropdown. */}
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

      {/* Display any errors that occur. */}
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      {/* Display a message when no courses are found. */}
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

      {/* Grid of course cards. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {courses.map((c) => {
          const enrollment = enrollmentsMap.get(c.id);
          const enrolled = !!enrollment;
          const completed = enrollment?.completion_percentage >= 100;
          return (
            <Card key={c.id} className="flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">{iconFor(c)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 truncate">{c.title}</h3>
                    {completed && <span className="text-xs font-medium text-white bg-brand-green-500 px-2 py-0.5 rounded-full">✓ Completed</span>}
                  </div>
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
                    <Button variant={completed ? 'outline' : 'success'} className="w-full">
                      {completed ? 'Review Course' : 'Continue →'}
                    </Button>
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
