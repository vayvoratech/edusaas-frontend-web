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

const TrashIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const EditIcon = ({ className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);
  // task currently queued for deletion (drives the confirm modal)
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // task currently being edited (drives the edit modal)
  const [editing, setEditing] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '', due_date: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (t) => {
    setEditing(t);
    setEditDraft({
      title: t.title || '',
      due_date: t.due_date ? t.due_date.slice(0, 10) : '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    if (!editDraft.title.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await updateTask(editing.id, {
        title: editDraft.title.trim(),
        due_date: editDraft.due_date || null,
      });
      setTasks((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...updated } : x)));
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSavingEdit(false);
    }
  };

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

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteTask(pendingDelete.id);
      setTasks((prev) => prev.filter((x) => x.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setDeleting(false);
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
                    <div className="text-xs text-slate-500">
                      {t.due_date ? `Due ${fmtDate(t.due_date)}` : 'No due date'}
                    </div>
                  </div>
                  {d !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      urgent ? 'bg-red-100 text-red-700' : 'bg-brand-blue-100 text-brand-blue-700'
                    }`}>
                      {d > 0 ? `in ${d}d` : d === 0 ? 'today' : `${Math.abs(d)}d ago`}
                    </span>
                  )}
                  <button
                    onClick={() => openEdit(t)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-brand-blue-200 text-brand-blue-600 bg-white hover:bg-brand-blue-50 transition text-xs font-medium"
                    aria-label={`Edit ${t.title}`}
                    title="Edit task"
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(t)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-xs font-medium shadow-sm"
                    aria-label={`Delete ${t.title}`}
                    title="Delete task"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    Delete
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
                  onClick={() => openEdit(t)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-brand-blue-200 text-brand-blue-600 bg-white hover:bg-brand-blue-50 transition text-xs font-medium"
                  aria-label={`Edit ${t.title}`}
                  title="Edit task"
                >
                  <EditIcon className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setPendingDelete(t)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-xs font-medium shadow-sm"
                  aria-label={`Delete ${t.title}`}
                  title="Delete task"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Edit-task modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in"
          onClick={() => !savingEdit && setEditing(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveEdit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-task-title"
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-brand-blue-100 text-brand-blue-600 grid place-items-center">
                <EditIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 id="edit-task-title" className="font-semibold text-slate-900">
                  Edit task
                </h3>
                <p className="text-sm text-slate-500">Update the title or due date.</p>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-slate-500">Title</label>
              <input
                value={editDraft.title}
                onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                autoFocus
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none"
              />
            </div>
            <div className="mb-5">
              <label className="text-xs text-slate-500">Due date</label>
              <input
                type="date"
                value={editDraft.due_date}
                onChange={(e) => setEditDraft({ ...editDraft, due_date: e.target.value })}
                className="block w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm-delete modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-red-100 text-red-600 grid place-items-center">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 id="confirm-delete-title" className="font-semibold text-slate-900">
                  Delete this task?
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-slate-800">
                    &ldquo;{pendingDelete.title}&rdquo;
                  </span>
                  ? This can&apos;t be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <Button
                variant="outline"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
