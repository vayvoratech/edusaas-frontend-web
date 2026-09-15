import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAllUsers } from '../services/api';

const ROLES = ['', 'student', 'educator', 'employer', 'admin'];
const STATUSES = ['', 'active', 'suspended'];

const initials = (name) =>
  (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: 'medium',
    });
  } catch {
    return iso;
  }
}

function toCsv(users) {
  const header = 'Name,Email,Role,Domain Role,Status,Date Joined\n';
  const rows = users
    .map(
      (u) =>
        `"${(u.name || '').replace(/"/g, '""')}","${(u.email || '').replace(
          /"/g,
          '""'
        )}","${(u.role || '').replace(/"/g, '""')}","${(
          u.domain_role || ''
        ).replace(/"/g, '""')}","${(u.status || 'active').replace(
          /"/g,
          '""'
        )}","${fmtDate(u.created_at)}"`
    )
    .join('\n');
  return header + rows;
}

function downloadCsv(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function UserDetails() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [joinedDate, setJoinedDate] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setAllUsers(data);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || 'Failed to load users'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const users = allUsers.filter((u) => {
    if (role && u.role !== role) return false;
    if (status && (u.status || 'active') !== status) return false;
    if (joinedDate && u.created_at) {
      const joined = new Date(u.created_at).toISOString().slice(0, 10);
      if (joined !== joinedDate) return false;
    }
    return true;
  });

  const applyFilters = () => {
    // Filters are applied client-side via the derived `users` above
  };

  const handleExport = () => {
    if (users.length === 0) return;
    const csv = toCsv(users);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`users-${timestamp}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Details</h2>
          <p className="text-sm text-slate-500">
            View all registered users and their details.
          </p>
        </div>
        <Button
          variant="success"
          onClick={handleExport}
          disabled={loading || users.length === 0}
        >
          ⬇ Export Users
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Filters — same style as UserManagement */}
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
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Joined Date</label>
            <input
              type="date"
              value={joinedDate}
              onChange={(e) => setJoinedDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm min-w-[150px]"
            />
          </div>
          <Button onClick={applyFilters}>Apply Filter</Button>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Role</th>
                <th className="text-left px-5 py-3 font-medium">Domain Role</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Date Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No users match.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-xs">
                          {initials(u.name)}
                        </div>
                        <div className="font-semibold text-slate-800">
                          {u.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-blue-100 text-brand-blue-700 capitalize">
                        {u.role || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 capitalize">
                      {u.domain_role || '—'}
                    </td>
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
                    <td className="px-5 py-3 text-slate-600">
                      {fmtDate(u.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
