import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getEmployerDashboard, getJobs, getEligibleStudents,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#2563eb', '#10b981', '#f59e0b'];

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
  getEmployerDashboard().then(setData).catch(() => {});

  if (!user?.id) return;

  getJobs({ employer_id: user.id })
    .then(async (jobs) => {
      setJobs(jobs);

      if (!jobs.length) {
        setCandidates([]);
        return;
      }

      // For now, use the employer's first job
      const job = jobs[0];

      try {
        const response = await getEligibleStudents(job.id);

        console.log("ELIGIBLE STUDENTS:", response);

        setCandidates(response.eligible_students || []);
      } catch (err) {
        console.error("Eligible students error:", err);
        setCandidates([]);
      }
    })
    .catch((err) => {
      console.error("Jobs error:", err);
      setJobs([]);
      setCandidates([]);
    });
}, [user?.id]);
  

  const matchData = data?.candidateMatches ? [
    { name: 'Strong', value: data.candidateMatches.strong },
    { name: 'Good', value: data.candidateMatches.good },
    { name: 'Possible', value: data.candidateMatches.possible },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-sm text-slate-500">Find the best candidates for your roles.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Job Openings</div>
          <div className="text-3xl font-bold text-brand-blue-700 mt-1">{data?.jobOpenings ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active Listings</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">New Applicants</div>
          <div className="text-3xl font-bold text-brand-orange-600 mt-1">{data?.newApplicants ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Candidates</div>
        </Card>
        <Card className="!p-4">
          <div className="text-xs text-slate-500">Top Matches</div>
          <div className="text-3xl font-bold text-brand-green-600 mt-1">{data?.topMatches ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Best Fits</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Recent Job Listings">
          <ul className="space-y-3">
            {jobs.slice(0, 4).map((j) => (
              <li key={j.id} className="flex items-start gap-2 text-sm">
                <span className="text-brand-blue-500">📋</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">{j.title}</div>
                  <div className="text-[11px] text-slate-500">Posted {new Date(j.created_at).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
            {jobs.length === 0 && <li className="text-slate-400 text-center py-3">No listings yet.</li>}
          </ul>
        </Card>

        <Card title="Candidate Matches">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={matchData} dataKey="value" nameKey="name" outerRadius={65} innerRadius={40}>
                  {matchData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Skills Insights">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.skillsInsights || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="skill" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Recommended Candidates" className="lg:col-span-2">
          <div className="space-y-3">
            {candidates.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                <div className="w-9 h-9 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-xs">
                  {(c.name || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-800 truncate">{c.name}</div>
                  <div className="text-xs text-slate-500 truncate">{c.role_target}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  c.skill_match >= 80 ? 'bg-brand-green-100 text-brand-green-700'
                  : c.skill_match >= 60 ? 'bg-brand-orange-100 text-brand-orange-700'
                  : 'bg-slate-200 text-slate-700'
                }`}>{c.skill_match >= 80 ? 'Skill Fit' : c.skill_match >= 60 ? 'Good Fit' : 'Possible Fit'}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Hiring Actions">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-brand-blue-500">✓</span>
              <Link to="/app/job-listings" className="text-slate-700 hover:underline">Post a Job Opening</Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-blue-500">✓</span>
              <Link to="/app/job-listings" className="text-slate-700 hover:underline">Review Applications</Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-brand-blue-500">✓</span>
              <Link to="/app/candidates" className="text-slate-700 hover:underline">Schedule Interviews</Link>
            </li>
          </ul>
          <Link to="/app/job-listings">
            <Button className="mt-4 w-full">+ Post a Job</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
