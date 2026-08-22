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
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);
  const [selectedMatchType, setSelectedMatchType] = useState(null);

  useEffect(() => {
  getEmployerDashboard()
    .then(setData)
    .catch((err) => console.error("Dashboard error:", err));

  if (!user?.id) return;

  getJobs({ employer_id: user.id })
    .then(async (jobs) => {
      setJobs(jobs);

      if (!jobs.length) {
        setCandidates([]);
        return;
      }

      try {
  const responses = await Promise.all(
    jobs.map(async (job) => {
      try {
        const response = await getEligibleStudents(job.id);

        return {
          job,
          candidates: response.eligible_students || [],
        };
            } catch (err) {
        console.error(
          "Eligible students error:",
          err.response?.status,
          err.response?.data
        );

        return {
          job,
          candidates: [],
        };
      }
    })
  );

  const allCandidates = responses.flatMap(
    ({ job, candidates }) =>
      candidates.map((candidate) => ({
        ...candidate,
        job_id: job.id,
        job_title: job.title,
      }))
  );

  // Keep each student only once.
  // If the student matches multiple jobs,
  // keep their highest match.
  const candidateMap = new Map();

  for (const candidate of allCandidates) {
    const existing = candidateMap.get(candidate.id);

    if (
      !existing ||
      Number(candidate.skill_match || 0) >
        Number(existing.skill_match || 0)
    ) {
      candidateMap.set(candidate.id, candidate);
    }
  }

  const uniqueCandidates = Array.from(
    candidateMap.values()
  ).sort(
    (a, b) =>
      Number(b.skill_match || 0) -
      Number(a.skill_match || 0)
  );

  console.log(
    "ALL RECOMMENDED CANDIDATES:",
    uniqueCandidates
  );

  setCandidates(uniqueCandidates);
} catch (err) {
  console.error("Candidate matching error:", err);
  setCandidates([]);
}
    })
    .catch((err) => {
      console.error("Jobs error:", err);
      setJobs([]);
      setCandidates([]);
    });
}, [user?.id]);

 const matchData = [
  {
    name: "Strong",
    value: candidates.filter(
      (c) => Number(c.skill_match || 0) >= 80
    ).length,
  },
  {
    name: "Good",
    value: candidates.filter(
      (c) =>
        Number(c.skill_match || 0) >= 60 &&
        Number(c.skill_match || 0) < 80
    ).length,
  },
  {
    name: "Possible",
    value: candidates.filter(
      (c) => Number(c.skill_match || 0) < 60
    ).length,
  },
];
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
        <Pie
          data={matchData}
          dataKey="value"
          nameKey="name"
          outerRadius={65}
          innerRadius={40}
          onClick={(entry) => {
            setSelectedMatchType(entry.name);
          }}
          style={{ cursor: "pointer" }}
        >
          {matchData.map((entry, i) => (
            <Cell
              key={entry.name}
              fill={COLORS[i]}
            />
          ))}
        </Pie>

        <Tooltip />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* Selected category */}
  {selectedMatchType && (
    <div className="mt-3 pt-3 border-t border-slate-100">

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-slate-700">
          {selectedMatchType} Candidates
        </span>

        <button
          type="button"
          onClick={() => setSelectedMatchType(null)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Clear
        </button>
      </div>

      {candidates.filter((candidate) =>
        candidate.fit_category?.startsWith(selectedMatchType)
      ).length > 0 ? (
        <div className="space-y-2">

          {candidates
            .filter((candidate) =>
              candidate.fit_category?.startsWith(selectedMatchType)
            )
            .slice(0, 5)
            .map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-2 rounded-md bg-slate-50"
              >
                <div>
                  <div className="text-xs font-medium text-slate-700">
                    {candidate.name}
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {candidate.domain_role || "Candidate"}
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-700">
                  {candidate.skill_match ?? 0}%
                </div>
              </div>
            ))}

        </div>
      ) : (
        <div className="text-xs text-slate-400 text-center py-2">
          No {selectedMatchType.toLowerCase()} candidates found.
        </div>
      )}

    </div>
  )}
</Card>
        <Card title="Skills Insights">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.skillsInsights || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                     <XAxis
  dataKey="skill"
  interval={0}
  height={55}
  tickMargin={8}
  tick={({ x, y, payload }) => {
    const words = payload.value.split(" ");

    return (
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        fontSize={10}
        fill="#64748b"
      >
        {words.length > 1 ? (
          <>
            <tspan x={x} dy="0">
              {words[0]}
            </tspan>
            <tspan x={x} dy="12">
              {words.slice(1).join(" ")}
            </tspan>
          </>
        ) : (
          <tspan x={x} dy="0">
            {payload.value}
          </tspan>
        )}
      </text>
    );
  }}
/>
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
  content={({ active, payload }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const skill = payload[0].payload;

    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-md p-3 text-xs">
        <div className="font-semibold text-slate-800 mb-2">
          {skill.skill}
        </div>

        <div className="space-y-1 text-slate-600">
          <div>
            Average Level:{" "}
            <span className="font-medium text-slate-800">
              {skill.averageLevel ?? 0}
            </span>
          </div>

          <div>
            Required Level:{" "}
            <span className="font-medium text-slate-800">
              {skill.requiredLevel ?? 0}
            </span>
          </div>

          <div>
            Candidates Assessed:{" "}
            <span className="font-medium text-slate-800">
              {skill.assessedCandidates ?? 0}
            </span>
          </div>

          <div>
            Qualified Candidates:{" "}
            <span className="font-medium text-green-700">
              {skill.qualifiedCandidates ?? 0}
            </span>
          </div>

          <div>
            Average Match:{" "}
            <span className="font-medium text-brand-blue-600">
              {skill.value ?? 0}%
            </span>
          </div>
        </div>
      </div>
    );
  }}
/>


                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
   <Card
  title="Recommended Candidates"
  className="lg:col-span-2"
>
  <div className="space-y-3">

  {candidates.slice(0, 6).map((c) => (
    <div
      key={c.id}
      className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
    >

      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-sm">
          {(c.name || "?")[0].toUpperCase()}
        </div>

        {/* Candidate information */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-800">
            {c.name}
          </div>

          <div className="text-xs text-slate-500">
            {c.job_title || c.domain_role || "Candidate"}
          </div>
        </div>

        {/* Match */}
        <div className="text-right">
          <div className="text-lg font-bold text-slate-800">
            {c.skill_match ?? 0}%
          </div>

          <span
            className={`text-xs px-2 py-1 rounded-full ${
              c.skill_match >= 80
                ? "bg-brand-green-100 text-brand-green-700"
                : c.skill_match >= 60
                ? "bg-brand-orange-100 text-brand-orange-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {c.fit_category ||
              (c.skill_match >= 80
                ? "Strong Fit"
                : c.skill_match >= 60
                ? "Good Fit"
                : "Possible Fit")}
          </span>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-3 text-xs space-y-1">

        {c.matched_skills?.length > 0 && (
          <div>
            <span className="font-medium text-green-700">
              Matched:
            </span>{" "}
            <span className="text-slate-600">
              {c.matched_skills.join(", ")}
            </span>
          </div>
        )}

        {c.partial_skills?.length > 0 && (
          <div>
            <span className="font-medium text-orange-600">
              Developing:
            </span>{" "}
            <span className="text-slate-600">
              {c.partial_skills
                .map(
                  (s) =>
                    `${s.skill} (${s.student_level}/${s.required_level})`
                )
                .join(", ")}
            </span>
          </div>
        )}

        {c.missing_skills?.length > 0 && (
          <div>
            <span className="font-medium text-slate-500">
              Missing:
            </span>{" "}
            <span className="text-slate-600">
              {c.missing_skills.join(", ")}
            </span>
          </div>
        )}

      </div>
      

     {/* Candidate Actions */}
{/* Candidate Actions */}
<div className="mt-3 pt-3 border-t border-slate-100">

  {/* Action row */}
  <div className="flex justify-between items-center">

    <button
      type="button"
      onClick={() =>
        setExpandedCandidateId(
          expandedCandidateId === c.id ? null : c.id
        )
      }
      className="text-xs font-medium text-slate-600 hover:text-brand-blue-600"
    >
      {expandedCandidateId === c.id
        ? "Hide Match Details ↑"
        : "Why recommended? ↓"}
    </button>

    <Link
      to="/app/candidates"
      state={{ candidate: c }}
      className="text-xs font-medium text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
    >
      Review Candidate →
    </Link>

  </div>

  {/* Expanded Match Details */}
  {expandedCandidateId === c.id && (
    <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100 w-full">

      <div className="text-xs font-semibold text-slate-700 mb-3">
        Why this candidate is recommended
      </div>

      {/* Overall Match */}
      <div className="mb-3">

        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-slate-600">
            Overall Skill Match
          </span>

          <span className="font-semibold text-slate-800">
            {c.skill_match ?? 0}% — {c.fit_category || "Candidate"}
          </span>
        </div>

        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-blue-500 rounded-full"
            style={{
              width: `${Math.min(c.skill_match ?? 0, 100)}%`,
            }}
          />
        </div>

      </div>

      {/* Matched Skills */}
      <div className="mb-2">

        <div className="text-xs font-medium text-green-700">
          ✓ Matched Skills
        </div>

        <div className="text-xs text-slate-600 mt-1">
          {c.matched_skills?.length
            ? c.matched_skills.join(", ")
            : "No fully matched skills"}
        </div>

      </div>

      {/* Developing Skills */}
      <div className="mb-2">

        <div className="text-xs font-medium text-orange-600">
          ⚠ Developing Skills
        </div>

        <div className="text-xs text-slate-600 mt-1">
          {c.partial_skills?.length
            ? c.partial_skills
                .map(
                  (s) =>
                    `${s.skill} (${s.student_level}/${s.required_level})`
                )
                .join(", ")
            : "No developing skills"}
        </div>

      </div>

      {/* Missing Skills */}
      <div className="mb-3">

        <div className="text-xs font-medium text-slate-600">
          Missing Skills
        </div>

        <div className="text-xs text-slate-600 mt-1">
          {c.missing_skills?.length
            ? c.missing_skills.join(", ")
            : "No missing skills"}
        </div>

      </div>

      {/* Recommendation */}
      <div className="pt-2 border-t border-slate-200">

        <div className="text-xs text-slate-600">

          <span className="font-medium text-slate-800">
            Recommendation:
          </span>{" "}

          {c.skill_match >= 80
            ? "Strong skill alignment with the job requirements."
            : c.skill_match >= 60
            ? "Good skill alignment, but some skills may need further review."
            : "Partial skill alignment. Review the candidate's skill gaps before proceeding."}

        </div>

      </div>

    </div>
  )}

</div>
   {candidates.length === 0 && (
    <div className="text-center text-sm text-slate-400 py-8">
      No eligible candidates available.
    </div>
  )}
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
