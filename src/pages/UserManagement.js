import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAllUsers, updateUser, deleteUser, registerUser } from '../services/api';

const ROLES = ['', 'student', 'educator', 'employer', 'admin'];
const STATUSES = ['', 'active', 'suspended'];

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
};

const initials = (name) =>
  (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState({ name: '', email: '', password: '', role: 'student' });
  const [createError, setCreateError] = useState(null);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Unified confirm modal: { user, action, label, description, danger }
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const load = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers(filters || {});
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const applyFilters = () => {
    setPage(1);
    load({
      role: role || undefined,
      status: status || undefined,
      q: q || undefined,
    });
  };

  const askToggleStatus = (u) => {
    const next = u.status === 'suspended' ? 'active' : 'suspended';
    setConfirm({
      user: u,
      action: 'toggle',
      label: next === 'suspended' ? 'Suspend' : 'Reactivate',
      title: next === 'suspended' ? 'Suspend this user?' : 'Reactivate this user?',
      description:
        next === 'suspended'
          ? `Are you sure you want to suspend ${u.name}? They won't be able to sign in until reactivated.`
          : `Reactivate ${u.name}? They'll be able to sign in again immediately.`,
      danger: next === 'suspended',
      next,
    });
  };

  const askDelete = (u) => {
    setConfirm({
      user: u,
      action: 'delete',
      label: 'Delete',
      title: 'Delete this user?',
      description: `Are you sure you want to delete ${u.name}? This can't be undone.`,
      danger: true,
    });
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirmBusy(true);
    try {
      if (confirm.action === 'delete') {
        await deleteUser(confirm.user.id);
        setUsers((prev) => prev.filter((x) => x.id !== confirm.user.id));
      } else if (confirm.action === 'toggle') {
        const updated = await updateUser(confirm.user.id, { status: confirm.next });
        setUsers((prev) =>
          prev.map((x) => (x.id === confirm.user.id ? { ...x, ...updated } : x))
        );
      }
      setConfirm(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setConfirmBusy(false);
    }
  };

  const onSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUser(editing.id, {
        name: editing.name,
        role: editing.role,
        status: editing.status,
      });
      setUsers((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...updated } : x)));
      setEditing(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);
    const d = createDraft;
    if (!d.name.trim()) return setCreateError('Name is required');
    if (!EMAIL_RE.test(d.email.trim())) return setCreateError('Enter a valid email');
    if (!PWD_RE.test(d.password)) {
      return setCreateError(
        'Password must be at least 8 chars with uppercase, lowercase, and a digit.'
      );
    }
    setSubmittingCreate(true);
    try {
      await registerUser({
        name: d.name.trim(),
        email: d.email.trim().toLowerCase(),
        password: d.password,
        role: d.role,
      });
      setCreating(false);
      setCreateDraft({ name: '', email: '', password: '', role: 'student' });
      await load();
    } catch (err) {
      setCreateError(err.response?.data?.error || err.message);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const visible = users.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">Roles, status, last login activity.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search users…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm w-56 outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100"
          />
          <Button variant="primary" onClick={() => setCreating(true)}>+ Add New User</Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3 mb-1">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm min-w-[140px]"
            >
              {ROLES.map((r) => (
                <option key={r || 'all'} value={r}>
                  {r ? r[0].toUpperCase() + r.slice(1) : 'All Roles'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm min-w-[140px]"
            >
              {STATUSES.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s ? s[0].toUpperCase() + s.slice(1) : 'All Statuses'}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={applyFilters}>Apply Filter</Button>
        </div>
      </Card>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Role</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Last Login</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">Loading…</td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">No users match.</td>
                </tr>
              ) : (
                visible.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-xs">
                          {initials(u.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-700">{u.role}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.status === 'suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-brand-green-100 text-brand-green-700'
                        }`}
                      >
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{fmtDate(u.last_login)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-brand-blue-200 text-brand-blue-600 bg-white hover:bg-brand-blue-50 text-xs font-medium"
                          onClick={() => setEditing({ ...u })}
                        >
                          ✏ Edit
                        </button>
                        <button
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                            u.status === 'suspended'
                              ? 'border border-brand-green-200 text-brand-green-700 bg-white hover:bg-brand-green-50'
                              : 'border border-amber-200 text-amber-700 bg-white hover:bg-amber-50'
                          }`}
                          onClick={() => askToggleStatus(u)}
                        >
                          {u.status === 'suspended' ? '↻ Reactivate' : '⏸ Suspend'}
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs font-medium shadow-sm"
                          onClick={() => askDelete(u)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-500 border-t border-slate-100">
          <div>
            Showing {users.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, users.length)} of{' '}
            {users.length} users
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 3)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-2.5 py-1 rounded ${
                    p === page ? 'bg-brand-blue-600 text-white' : 'border border-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            {totalPages > 3 && <span className="px-1">…</span>}
            <button
              className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next ›
            </button>
          </div>
        </div>
      </Card>

      {/* Edit user modal */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in" onClick={() => setEditing(null)}>
          <form
            onSubmit={onSaveEdit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="font-semibold text-lg mb-4">Edit user</h3>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Name</label>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Role</label>
              <select
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              >
                {ROLES.slice(1).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="text-xs text-slate-500">Status</label>
              <select
                value={editing.status || 'active'}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              >
                {STATUSES.slice(1).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </div>
      )}

      {/* Create user modal */}
      {creating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in" onClick={() => !submittingCreate && setCreating(false)}>
          <form
            onSubmit={onCreate}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="font-semibold text-lg mb-4">Add new user</h3>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Full name</label>
              <input
                value={createDraft.name}
                onChange={(e) => setCreateDraft({ ...createDraft, name: e.target.value })}
                autoFocus
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Email</label>
              <input
                type="email"
                value={createDraft.email}
                onChange={(e) => setCreateDraft({ ...createDraft, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Temporary password</label>
              <input
                type="text"
                value={createDraft.password}
                onChange={(e) => setCreateDraft({ ...createDraft, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 font-mono"
                placeholder="Min 8 chars, mixed case + digit"
              />
            </div>
            <div className="mb-5">
              <label className="text-xs text-slate-500">Role</label>
              <select
                value={createDraft.role}
                onChange={(e) => setCreateDraft({ ...createDraft, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              >
                {ROLES.slice(1).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            {createError && (
              <div className="p-3 mb-3 rounded-lg bg-red-50 text-red-600 text-sm">{createError}</div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreating(false)} disabled={submittingCreate}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingCreate}>
                {submittingCreate ? 'Creating…' : 'Create user'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Unified confirm modal (delete or suspend) */}
      {confirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in" onClick={() => !confirmBusy && setConfirm(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 shrink-0 rounded-full grid place-items-center ${
                confirm.danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {confirm.action === 'delete' ? '🗑' : confirm.next === 'suspended' ? '⏸' : '↻'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{confirm.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{confirm.description}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setConfirm(null)} disabled={confirmBusy}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={runConfirm}
                disabled={confirmBusy}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 ${
                  confirm.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-blue-600 hover:bg-brand-blue-700'
                }`}
              >
                {confirmBusy ? 'Working…' : `Yes, ${confirm.label.toLowerCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
