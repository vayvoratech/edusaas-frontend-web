import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getCourse, getLessonsForCourse, getMyProgress, updateProgress } from '../services/api';

export default function LearningModule() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, ls, p] = await Promise.all([
          getCourse(courseId),
          getLessonsForCourse(courseId),
          getMyProgress().catch(() => []),
        ]);
        setCourse(c);
        setLessons(ls);
        const byLesson = {};
        for (const row of p) byLesson[row.lesson_id] = row;
        setProgress(byLesson);
        setActiveLessonId(ls[0]?.id || null);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    })();
  }, [courseId]);

  const overall = lessons.length === 0
    ? 0
    : Math.round((lessons.filter((l) => progress[l.id]?.completion_flag).length / lessons.length) * 100);
  const activeLesson = lessons.find((l) => l.id === activeLessonId);

  const onComplete = async () => {
    if (!activeLesson) return;
    try {
      const updated = await updateProgress(activeLesson.id, {
        completion_flag: true,
        watched_duration: (activeLesson.duration || 0) * 60,
      });
      setProgress((prev) => ({ ...prev, [activeLesson.id]: updated }));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  if (error) {
    return <div className="p-4 rounded-lg bg-red-50 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="text-xs uppercase text-slate-400">Learning Module</div>
          <h2 className="text-2xl font-bold text-slate-900">{course?.title || 'Loading…'}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            <Link to="/app/courses" className="hover:underline">← Back to Courses</Link>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2 text-sm">
          <span className="font-bold">{overall}%</span>{' '}
          <span className="text-slate-500">Complete</span>
          <div className="h-1.5 bg-slate-100 rounded-full mt-1 w-40">
            <div className="h-full bg-brand-blue-500 rounded-full" style={{ width: `${overall}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-2">
            {activeLesson ? `Welcome to ${course?.title}` : 'No lesson selected'}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Dive into advanced concepts and enhance your skills.
          </p>
          {activeLesson && (
            <>
              <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video grid place-items-center text-white relative">
                <div className="text-center">
                  <div className="text-5xl mb-3">🐍</div>
                  <div className="text-sm">{activeLesson.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{activeLesson.duration ?? '—'} min</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/30 px-3 py-2 text-xs flex justify-between">
                  <span>▶ 01:17</span>
                  <span>07:42</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={onComplete}>
                  {progress[activeLesson.id]?.completion_flag ? '✓ Completed' : 'Mark Complete'}
                </Button>
                <Button variant="outline">⬇ Download</Button>
              </div>
            </>
          )}
        </Card>

        <Card>
          <h4 className="text-xs uppercase text-slate-400 mb-3">Module Overview</h4>
          <ul className="space-y-1.5">
            {lessons.map((l, i) => {
              const done = progress[l.id]?.completion_flag;
              const active = l.id === activeLessonId;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => setActiveLessonId(l.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                      active
                        ? 'bg-brand-blue-50 border border-brand-blue-200 text-brand-blue-700'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full grid place-items-center text-[10px] ${
                      done ? 'bg-brand-green-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {done ? '✓' : i + 1}
                    </span>
                    <span className="flex-1 truncate">{l.title}</span>
                    {active && <span className="text-[10px] text-brand-blue-600">●</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
