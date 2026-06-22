import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getJobs, createJob, updateJob, deleteJob } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const params = user?.role === 'employer' ? { employer_id: user.id } : {};
      setJobs(await getJobs(params));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [user?.id]);

  const onSave = async (e) => {
    e.preventDefault();
    const data = {
      title: editing.title, description: editing.description,
      requirements: editing.requirements,
      required_skills: (editing.required_skills_csv || '').split(',').map((s) => s.trim()).filter(Boolean),
      status: editing.status || 'open',
    };
    try {
      if (editing.id) await updateJob(editing.id, data);
      else await createJob(data);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const onDelete = async (j) => {
    if (!window.confirm(`Delete "${j.title}"?`)) return;
    try { await deleteJob(j.id); load(); }
    catch (err) { setError(err.response?.data?.error || err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Job Listings</h2>
          <p className="text-sm text-slate-500">Create, manage, and archive postings.</p>
        </div>
        <Button onClick={() => setEditing({ status: 'open', required_skills_csv: '' })}>
          + Post a Job
        </Button>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {jobs.length === 0 ? (
          <Card className="md:col-span-2">
            <p className="text-sm text-slate-500 text-center py-6">
              No jobs posted yet. Click "Post a Job" to create your first listing.
            </p>
          </Card>
        ) : (
          jobs.map((j) => (
            <Card key={j.id}>
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{j.title}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Posted {new Date(j.created_at).toLocaleDateString()} · Status:{' '}
                    <span className={
                      j.status === 'open' ? 'text-brand-green-700 font-medium'
                      : 'text-slate-500'
                    }>{j.status}</span>
                  </div>
                  {j.description && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{j.description}</p>
                  )}
                  {(j.required_skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {j.required_skills.map((s) => (
                        <span
                          key={s}
                          title={s}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-brand-blue-100 text-brand-blue-700 truncate max-w-[140px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing({
                    ...j,
                    required_skills_csv: (j.required_skills || []).join(', '),
                  })}
                >
                  ✏ Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(j)}>🗑 Archive</Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={onSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="font-semibold text-lg mb-4">{editing.id ? 'Edit job' : 'Post a job'}</h3>
            <div className="mb-3">
              <label className="text-xs text-slate-500">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Description</label>
              <textarea
                rows={3}
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Requirements</label>
              <textarea
                rows={2}
                value={editing.requirements || ''}
                onChange={(e) => setEditing({ ...editing, requirements: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Required skills (comma-separated)</label>
              <input
                value={editing.required_skills_csv || ''}
                onChange={(e) => setEditing({ ...editing, required_skills_csv: e.target.value })}
                placeholder="react, node, postgres"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>
            <div className="mb-5">
              <label className="text-xs text-slate-500">Status</label>
              <select
                value={editing.status || 'open'}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit">{editing.id ? 'Save' : 'Post'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
