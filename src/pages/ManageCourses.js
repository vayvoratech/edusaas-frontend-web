import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getCourses, createCourse, updateCourse, deleteCourse,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#2563eb', '#10b981', '#f59e0b'];
const STATUSES = ['', 'active', 'draft', 'archived'];

export default function ManageCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('Last Updated');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const filters = user?.role === 'educator' ? { educator_id: user.id } : {};
      if (status) filters.status = status;
      setCourses(await getCourses(filters));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [status, user?.id]);

  const summary = {
    active: courses.filter((c) => c.status === 'active').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    archived: courses.filter((c) => c.status === 'archived').length,
  };
  const pieData = [
    { name: 'Active', value: summary.active },
    { name: 'Draft', value: summary.draft },
    { name: 'Archived', value: summary.archived },
  ];

  const onSave = async (e) => {
    e.preventDefault();
    const data = {
      title: editing.title, category: editing.category,
      difficulty: editing.difficulty, status: editing.status,
      description: editing.description,
    };
    try {
      if (editing.id) {
        await updateCourse(editing.id, data);
      } else {
        await createCourse(data);
      }
      setEditing(null); setCreating(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const onDelete = async (c) => {
    if (!window.confirm(`Delete "${c.title}"?`)) return;
    try {
      await deleteCourse(c.id);
      setCourses((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const sorted = [...courses].sort((a, b) => {
    if (sort === 'Title') return a.title.localeCompare(b.title);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Courses</h2>
          <p className="text-sm text-slate-500">Create, edit, archive, and track engagement.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s || 'all'} value={s}>{s ? `Status: ${s}` : 'Status: All'}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
          >
            <option>Last Updated</option>
            <option>Title</option>
          </select>
          <Button onClick={() => { setEditing({ status: 'active', difficulty: 'beginner' }); setCreating(true); }}>
            + Create Course
          </Button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Course Title</th>
                  <th className="text-left px-5 py-3 font-medium">Category</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Difficulty</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No courses.</td></tr>
                ) : (
                  sorted.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-medium text-slate-800">{c.title}</td>
                      <td className="px-5 py-3 text-slate-600">{c.category || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          c.status === 'active' ? 'bg-brand-green-100 text-brand-green-700'
                          : c.status === 'draft' ? 'bg-brand-orange-100 text-brand-orange-700'
                          : 'bg-slate-200 text-slate-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 capitalize text-slate-600">{c.difficulty || 'beginner'}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 mr-1"
                          onClick={() => setEditing({ ...c })}
                        >
                          ✏ Edit
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(c)}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Course Summary">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} innerRadius={40}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 text-sm space-y-1.5">
            <li className="flex justify-between">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-blue-500 mr-2"/>Active</span>
              <strong>{summary.active}</strong>
            </li>
            <li className="flex justify-between">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-green-500 mr-2"/>Draft</span>
              <strong>{summary.draft}</strong>
            </li>
            <li className="flex justify-between">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-orange-500 mr-2"/>Archived</span>
              <strong>{summary.archived}</strong>
            </li>
          </ul>
        </Card>
      </div>

      {(creating || editing) && (
        <div className="fixed inset-0 bg-slate-900/40 grid place-items-center z-50 p-4">
          <form onSubmit={onSave} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-lg mb-4">{editing?.id ? 'Edit course' : 'Create course'}</h3>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Title</label>
              <input
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Category</label>
              <input
                value={editing.category || ''}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Difficulty</label>
                <select
                  value={editing.difficulty || 'beginner'}
                  onChange={(e) => setEditing({ ...editing, difficulty: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Status</label>
                <select
                  value={editing.status || 'active'}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="mb-5">
              <label className="text-xs text-slate-500">Description</label>
              <textarea
                rows={3}
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setEditing(null); setCreating(false); }}
              >
                Cancel
              </Button>
              <Button type="submit">{editing?.id ? 'Save' : 'Create'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
