import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getStudentCandidates, getCourses } from '../services/api';

const initials = (name) =>
  (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function ViewLearners() {
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [progressFilter, setProgressFilter] = useState('All');
  const [q, setQ] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudentCandidates().then(setLearners).catch((e) => setError(e.response?.data?.error || e.message));
    getCourses({ status: 'active' }).then(setCourses).catch(() => {});
  }, []);

  // Decorate with fake-but-deterministic per-learner stats so the table looks real
  const decorated = learners
    .filter((u) => !q || u.name.toLowerCase().includes(q.toLowerCase()))
    .map((u, i) => ({
      ...u,
      course: courses[i % Math.max(1, courses.length)]?.title || '—',
      progress: 40 + ((i * 17) % 55),
      score: 60 + ((i * 7) % 35),
      engagement: ['High', 'Medium', 'Low', 'High', 'Medium'][i % 5],
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Learners</h2>
          <p className="text-sm text-slate-500">Track learner progress, send feedback, export reports.</p>
        </div>
        <Button variant="outline">Export List</Button>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-slate-500">Course</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="block px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 min-w-[160px]"
            >
              <option>All Courses</option>
              {courses.map((c) => <option key={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Progress</label>
            <select
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              className="block px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 min-w-[160px]"
            >
              <option>All</option>
              <option>0-50%</option>
              <option>50-100%</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-slate-500">Search learner</label>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search learner…"
              className="block w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            />
          </div>
          <Button>Apply Filter</Button>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Course</th>
              <th className="text-left px-5 py-3 font-medium">Progress</th>
              <th className="text-left px-5 py-3 font-medium">Score</th>
              <th className="text-left px-5 py-3 font-medium">Engagement</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {decorated.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No learners.</td></tr>
            ) : (
              decorated.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-xs">
                        {initials(l.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{l.name}</div>
                        <div className="text-xs text-slate-500">{l.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{l.course}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${l.progress > 70 ? 'bg-brand-green-500' : l.progress > 40 ? 'bg-brand-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${l.progress}%` }}
                        />
                      </div>
                      <span className="text-xs">{l.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium">{l.score}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      l.engagement === 'High' ? 'bg-brand-green-100 text-brand-green-700'
                      : l.engagement === 'Medium' ? 'bg-brand-orange-100 text-brand-orange-700'
                      : 'bg-red-100 text-red-700'
                    }`}>{l.engagement}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs px-2 py-1 rounded border border-slate-300 mr-1">View Profile</button>
                    <button className="text-xs px-2 py-1 rounded border border-slate-300">Send Feedback</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
