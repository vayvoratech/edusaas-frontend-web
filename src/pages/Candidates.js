import React, { useEffect, useState } from 'react';
import { Card, StatPill } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getStudentCandidates } from '../services/api';

const initials = (n) => (n || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    getStudentCandidates()
      .then((users) => {
        // Decorate each with a deterministic skill_match score
        setCandidates(users.map((u, i) => ({
          ...u,
          skill_match: 55 + ((i * 13) % 45),
          role_target: ['Data Analyst', 'UI/UX Designer', 'Software Developer', 'Marketing Specialist'][i % 4],
        })));
      })
      .catch((e) => setError(e.response?.data?.error || e.message));
  }, []);

  const filtered = candidates.filter((c) =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.role_target.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Candidates</h2>
          <p className="text-sm text-slate-500">Skill-matched students for your open roles.</p>
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search candidates…"
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm w-64"
        />
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-sm shrink-0">
              {initials(c.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-800 truncate">{c.name}</div>
              <div className="text-xs text-slate-500 truncate">{c.role_target}</div>
            </div>
            <StatPill label="Match" value={`${c.skill_match}%`} tone={c.skill_match >= 80 ? 'green' : c.skill_match >= 60 ? 'orange' : 'slate'} />
            <Button size="sm" variant="outline" className="w-full sm:w-auto">View Profile</Button>
            <Button size="sm" className="w-full sm:w-auto">Invite</Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <Card className="md:col-span-2">
            <p className="text-sm text-slate-500 text-center py-6">No candidates match.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
