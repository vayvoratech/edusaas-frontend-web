import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import {
  getStudentDashboard, getMyTasks, getMyAchievements, getMyRecommendations,
  getMyAssignments,
} from '../services/api';

const fmtRel = (iso) => {
  if (!iso) return '—';
  const diff = (new Date() - new Date(iso)) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
};

const moduleCards = [
  { to: '/app/learning', emoji: '💬', title: 'Learning Module', sub: 'Continue your video lessons' },
  { to: '/app/achievements', emoji: '🏆', title: 'Achievements', sub: 'View your badges and certificates' },
  { to: '/app/tasks', emoji: '✅', title: 'Tasks & Deadlines', sub: 'Stay on top of your assignments' },
  { to: '/app/recommendations', emoji: '✨', title: 'Course Recommendations', sub: 'Picked for your goals' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recs, setRecs] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    getStudentDashboard().then(setDash).catch(() => {});
    getMyTasks({ status: 'pending' }).then(setTasks).catch(() => {});
    getMyAchievements().then(setAchievements).catch(() => {});
    getMyRecommendations().then(setRecs).catch(() => {});
    getMyAssignments().then(setAssignments).catch(() => {});
  }, []);

  const nextDeadline = tasks[0];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-brand-blue-500 via-brand-blue-600 to-brand-blue-700 text-white border-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/70">Welcome back</div>
            <h2 className="text-2xl font-bold">
              {user?.name?.split(' ')[0] || user?.name}, let's close those skill gaps. 🚀
            </h2>
            <div className="text-sm text-white/80 mt-1">
              You're {dash?.skillsReadiness ?? 0}% ready · {dash?.coursesEnrolled ?? 0} active courses.
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={dash?.skillsReadiness ?? 0} size={88} />
            <Link to="/app/courses">
              <Button variant="accent">Continue Learning →</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Courses Enrolled</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">{dash?.coursesEnrolled ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">{dash?.activeCourses ?? 0} active</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Achievements Earned</div>
          <div className="text-3xl font-bold text-brand-orange-600 mt-1">{achievements.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Badges collected</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Tasks Due This Week</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{dash?.tasksDue ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Upcoming Tasks</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Learning Hours Logged</div>
          <div className="text-3xl font-bold text-slate-700 mt-1">{dash?.learningHoursLogged ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Hours this month</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Learning Progress" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dash?.learningProgress || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <Card title="Recent Activity">
            <ul className="space-y-2 text-sm">
              {(dash?.recentActivity || []).map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <span className="text-brand-blue-500">✓</span>
                  <span className="flex-1 truncate text-slate-700">{a.title}</span>
                  <span className="text-[11px] text-slate-400">{a.when}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Next Deadline">
            {nextDeadline ? (
              <div>
                <div className="font-semibold text-slate-800">{nextDeadline.title}</div>
                <div className="text-xs text-slate-500">Due {fmtRel(nextDeadline.due_date)}</div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nothing due. 🎉</p>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {moduleCards.map((m) => (
          <Link key={m.to} to={m.to}>
            <Card className="hover:shadow-md transition !p-4 h-full">
              <div className="text-3xl">{m.emoji}</div>
              <div className="font-semibold text-slate-900 mt-2">{m.title}</div>
              <div className="text-[11px] text-slate-500 mt-1">{m.sub}</div>
              <div className="text-xs text-brand-blue-600 mt-3">Open →</div>
            </Card>
          </Link>
        ))}
      </div>

      {assignments.length > 0 && (
        <Card
          title="Assigned to You"
          action={<span className="text-xs text-slate-500">{assignments.length} from your educators</span>}
        >
          <ul className="space-y-2">
            {assignments.map((a) => {
              const overdue =
                a.due_date && a.status !== 'completed' && new Date(a.due_date) < new Date();
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  <div className="text-2xl">📚</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">
                      {a.course?.title || 'Course'}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      Assigned by {a.educator_name || 'your educator'}
                      {a.due_date && (
                        <>
                          {' · '}
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>
                            Due {new Date(a.due_date).toLocaleDateString()}
                            {overdue && ' (overdue)'}
                          </span>
                        </>
                      )}
                      {!a.due_date && ' · No due date'}
                    </div>
                    {a.note && (
                      <div className="text-[11px] text-slate-500 italic mt-1 truncate">
                        “{a.note}”
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      a.status === 'completed'
                        ? 'bg-brand-green-50 text-brand-green-700'
                        : a.status === 'in-progress'
                        ? 'bg-brand-blue-50 text-brand-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {a.status}
                  </span>
                  <Link
                    to={`/app/courses/${a.course_id}`}
                    className="text-xs px-2.5 py-1 rounded bg-brand-blue-600 text-white hover:bg-brand-blue-700"
                  >
                    Start
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {recs.length > 0 && (
        <Card title="Recommended for You" action={<Link to="/app/recommendations" className="text-xs text-brand-blue-600 hover:underline">See all →</Link>}>
          <ul className="space-y-2 text-sm">
            {recs.slice(0, 3).map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <span className="text-brand-blue-500">📘</span>
                <span className="font-medium text-slate-800">{r.course?.title}</span>
                <span className="text-xs text-slate-500 truncate">— {r.reason}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
