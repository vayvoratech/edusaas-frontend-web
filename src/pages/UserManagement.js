import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAllUsers, updateUser, deleteUser } from '../services/api';

const ROLES = ['', 'student', 'educator', 'employer', 'admin'];
const STATUSES = ['', 'active', 'suspended'];

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
};

const initials = (name) =>
  (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  useEffect(() => {
    load();
  }, []);

  const applyFilters = () => {
    setPage(1);
    load({
      role: role || undefined,
      status: status || undefined,
      q: q || undefined,
    });
  };

  const onToggleStatus = async (u) => {
    const next = u.status === 'suspended' ? 'active' : 'suspended';
    try {
      const updated = await updateUser(u.id, { status: next });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated } : x)));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const onDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
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
          <Button variant="primary">Add New User</Button>
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
                      <div className="flex justify-end gap-2">
                        <button
                          className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
                          onClick={() => setEditing({ ...u })}
                        >
                          ✏ Edit
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
                          onClick={() => onToggleStatus(u)}
                          title={u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        >
                          {u.status === 'suspended' ? '↻' : '⏸'}
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(u)}
                        >
                          🗑
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
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, users.length)} of{' '}
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

      {editing && (
        <div className="fixed inset-0 bg-slate-900/40 grid place-items-center z-50 p-4">
          <form
            onSubmit={onSaveEdit}
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
    </div>
  );
}
