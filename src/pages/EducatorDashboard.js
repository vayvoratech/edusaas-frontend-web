import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getEducatorDashboard, getCourses, getStudentCandidates, getAnnouncements,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EducatorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [learners, setLearners] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getEducatorDashboard().then(setData).catch(() => {});
    if (user?.id) {
      getCourses({ educator_id: user.id, status: 'active' }).then(setCourses).catch(() => {});
    }
    getStudentCandidates().then(setLearners).catch(() => {});
    getAnnouncements().then(setRecent).catch(() => {});
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-sm text-slate-500">Manage your courses and track learner progress.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Enrolled Learners</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">{data?.enrolledLearners ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Avg score {data?.avgCompletion ?? 0}%</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Active Courses</div>
          <div className="text-3xl font-bold text-brand-green-600 mt-1">{data?.activeCourses ?? 0}</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Course Ratings</div>
          <div className="text-3xl font-bold text-brand-orange-600 mt-1">{data?.courseRatings ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Avg rating {data?.avgRating ?? 0} ★</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Upcoming Tasks</div>
          <div className="text-3xl font-bold text-red-600 mt-1">3</div>
          <div className="text-[11px] text-slate-500 mt-1">Tasks Pending</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Learner Performance">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.learnerPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="technical" stroke="#2563eb" strokeWidth={2} name="Technical Skills" />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Skill Gap Analysis">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.skillGapAnalysis || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Active Learners" className="lg:col-span-2">
          <ul className="space-y-3">
            {learners.slice(0, 4).map((l, i) => {
              const score = 60 + ((i * 17) % 35);
              return (
                <li key={l.id} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-xs">
                    {(l.name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">{l.name}</div>
                  </div>
                  <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${score > 80 ? 'bg-brand-green-500' : 'bg-brand-orange-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-10 text-right">{score}%</span>
                </li>
              );
            })}
            {learners.length === 0 && (
              <li className="text-sm text-slate-400 text-center py-4">No active learners yet.</li>
            )}
          </ul>
        </Card>

        <Card title="Announcements">
          <ul className="space-y-2 text-sm">
            {recent.slice(0, 4).map((a) => (
              <li key={a.id} className="flex gap-2">
                <span className="text-brand-orange-500">📣</span>
                <span className="text-slate-700 truncate">{a.title}</span>
              </li>
            ))}
            {recent.length === 0 && <li className="text-slate-400">No announcements.</li>}
          </ul>
          <Link to="/app/announcements">
            <Button className="mt-4 w-full" variant="outline">Send Announcement</Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/app/manage-courses"><Card className="!p-4"><div className="text-3xl">📚</div><div className="font-semibold mt-2">Manage Courses</div></Card></Link>
        <Link to="/app/learners"><Card className="!p-4"><div className="text-3xl">👥</div><div className="font-semibold mt-2">View Learners</div></Card></Link>
        <Link to="/app/insights"><Card className="!p-4"><div className="text-3xl">📈</div><div className="font-semibold mt-2">Insights Report</div></Card></Link>
        <Link to="/app/announcements"><Card className="!p-4"><div className="text-3xl">📣</div><div className="font-semibold mt-2">Send Announcement</div></Card></Link>
      </div>

      <Card title="My Courses" action={<Link to="/app/manage-courses" className="text-xs text-brand-blue-600 hover:underline">Manage →</Link>}>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-500">No active courses yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {courses.slice(0, 4).map((c) => (
              <li key={c.id} className="py-2.5 flex justify-between text-sm">
                <span className="font-medium text-slate-800">{c.title}</span>
                <span className="text-xs text-slate-500">{c.category} · {c.difficulty}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
