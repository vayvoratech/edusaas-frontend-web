import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getMyTasks, createTask, updateTask, deleteTask } from '../services/api';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
};

const daysUntil = (iso) => {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso) - new Date()) / 86400000);
  return diff;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);

  const load = async () => {
    try { setTasks(await getMyTasks()); }
    catch (e) { setError(e.response?.data?.error || e.message); }
  };

  useEffect(() => { load(); }, []);

  const onAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask({ title: title.trim(), due_date: dueDate || null });
      setTitle(''); setDueDate(''); setAdding(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const onToggle = async (t) => {
    try {
      const updated = await updateTask(t.id, { status: t.status === 'done' ? 'pending' : 'done' });
      setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...updated } : x)));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const onRemove = async (t) => {
    if (!window.confirm(`Delete "${t.title}"?`)) return;
    try {
      await deleteTask(t.id);
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const pending = tasks.filter((t) => t.status === 'pending');
  const done = tasks.filter((t) => t.status === 'done');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tasks & Deadlines</h2>
          <p className="text-sm text-slate-500">Assignments, reminders, calendar.</p>
        </div>
        <Button onClick={() => setAdding(true)}>+ Add Task</Button>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      {adding && (
        <Card>
          <form onSubmit={onAdd} className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-slate-500">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you need to do?"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Due</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </form>
        </Card>
      )}

      <Card title={`Upcoming (${pending.length})`}>
        <ul className="divide-y divide-slate-100">
          {pending.length === 0 ? (
            <li className="py-6 text-sm text-slate-400 text-center">All caught up. 🎉</li>
          ) : (
            pending.map((t) => {
              const d = daysUntil(t.due_date);
              const urgent = d !== null && d <= 2;
              return (
                <li key={t.id} className="py-3 flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={t.status === 'done'}
                    onChange={() => onToggle(t)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">{t.title}</div>
                    <div className="text-xs text-slate-500">Due {fmtDate(t.due_date)}</div>
                  </div>
                  {d !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      urgent ? 'bg-red-100 text-red-700' : 'bg-brand-blue-100 text-brand-blue-700'
                    }`}>
                      {d > 0 ? `in ${d}d` : d === 0 ? 'today' : `${Math.abs(d)}d ago`}
                    </span>
                  )}
                  <button
                    onClick={() => onRemove(t)}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    🗑
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </Card>

      {done.length > 0 && (
        <Card title={`Completed (${done.length})`}>
          <ul className="divide-y divide-slate-100">
            {done.map((t) => (
              <li key={t.id} className="py-2.5 flex items-center gap-3 text-sm text-slate-500">
                <input
                  type="checkbox"
                  checked
                  onChange={() => onToggle(t)}
                  className="w-4 h-4"
                />
                <span className="line-through flex-1 truncate">{t.title}</span>
                <button
                  onClick={() => onRemove(t)}
                  className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
