import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import {
  getEmployerDashboard,
  getJobs,
  getEligibleStudents,
  getJobApplications,
  getApplicationVideoUrl,
  updateApplicationStatus,
  scheduleInterview,
  getInterview,
  updateInterview,
  cancelInterview,
  sendApplicantEmail,
  getDomainRoles
} from "../services/api";
import { useAuth } from '../context/AuthContext';

const COLORS = ['#2563eb', '#10b981', '#f59e0b'];

const formatDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number) =>
    String(number).padStart(2, "0");

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}`
  );
};


export default function EmployerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [candidates, setCandidates] = useState([]);
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);
  const [videoCandidate, setVideoCandidate] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(false);

  const [selectedMatchType, setSelectedMatchType] = useState(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("all");
  const [candidateSort, setCandidateSort] =useState("match");
  const [matchScoreFilter, setMatchScoreFilter] = useState("all");
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [interviewCandidate, setInterviewCandidate] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
  scheduled_at: "",
  duration: 30,
  interview_type: "online",
  meeting_link: "",
  notes: "",
});
const [schedulingInterview, setSchedulingInterview] = useState(false);
const [showCancelModal, setShowCancelModal] = useState(false);
const [cancelCandidate, setCancelCandidate] = useState(null);
const [emailCandidate, setEmailCandidate] = useState(null);
const [emailForm, setEmailForm] = useState({
  subject: "",
  message: "",
});
const [sendingEmail, setSendingEmail] = useState(false);
const [domainRoleFilter, setDomainRoleFilter] = useState("all");
const [domainRoles, setDomainRoles] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(10);
const [pipelinePage, setPipelinePage] = useState(1);
const [pipelineItemsPerPage] = useState(10);



useEffect(() => {
  getEmployerDashboard()
    .then(setData)
    .catch((err) =>
      console.error("Dashboard error:", err)
    );

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
              // Get eligible candidates for this job
              const response =
                await getEligibleStudents(job.id);

              // Get applications for this job
              // If this fails, candidates still appear.
              let applications = [];

              try {
                applications =
                  await getJobApplications(job.id);
                  console.log(
  "APPLICATIONS FOR JOB:",
  job.id,
  applications
);

console.log("JOB ID REQUESTED:", job.id);
console.log("APPLICATIONS RETURNED:", applications);
              } catch (error) {
                console.warn(
                  "Applications could not be loaded for job:",
                  job.id,
                  error.response?.data || error.message
                );
              }

              // Map applications by student ID
              const applicationByStudent = new Map(
                applications.map((application) => [
                  `${application.student_id}-${job.id}`,
                  application,
                ])
              );

              return {
                job,

                candidates: (
                  response.eligible_students || []
                ).map((candidate) => {
                  const application =
                    applicationByStudent.get(`${candidate.id}-${job.id}`);
                    console.log("CANDIDATE APPLICATION:", candidate.name, {
  candidate_id: candidate.id,
  application_id: application?.id,
  application_status: application?.status,
});

                  return {
                    ...candidate,

                    // Existing candidate data
                    job_id: job.id,
                    job_title: job.title,

                //Application data

                    application_id:

                   application?.id || null,

                   application_status:
                   application?.status || null,

                  has_video:
                  Boolean(application?.application_data?.video?.key),
                  };
                }),
              };
            } catch (error) {
              console.warn(
                "Eligible candidates could not be loaded for job:",
                job.id,
                error.response?.data || error.message
              );

              // One failed job should not remove
              // candidates from other jobs.
              return {
                job,
                candidates: [],
              };
            }
          })
        );

// Load existing interviews for shortlisted candidates
const responsesWithInterviews = await Promise.all(
  responses.map(async ({ job, candidates }) => {
    const candidatesWithInterviews = await Promise.all(
      candidates.map(async (candidate) => {

        if (!candidate.application_id) {
          return candidate;
           }

        try {
          const interview = await getInterview(
            candidate.job_id,
            candidate.application_id
          );

          return {
            ...candidate,
            interview,
          };
        } catch (error) {
          // 404 simply means no interview exists yet
          if (error.response?.status !== 404) {
            console.warn(
              "Could not load interview:",
              candidate.application_id,
              error.response?.data || error.message
            );
          }

          return candidate;
        }
      })
    );

    return {
      job,
      candidates: candidatesWithInterviews,
    };
  })
);


        // Combine candidates from all jobs
        const allCandidates = responsesWithInterviews.flatMap(
          ({ candidates }) => candidates
        );

        // Keep each student only once.
        // If the student matches multiple jobs,
        // keep their highest match.
        const candidateMap = new Map();

        for (const candidate of allCandidates) {
  const existing = candidateMap.get(candidate.id);

  if (!existing) {
    candidateMap.set(candidate.id, candidate);
    continue;
  }

  // Prefer the candidate record that has an application.
  if (
    candidate.application_id &&
    !existing.application_id
  ) {
    candidateMap.set(candidate.id, candidate);
    continue;
  }

  // If both have applications or both don't,
  // keep the one with the higher skill match.
  if (
    Boolean(candidate.application_id) ===
      Boolean(existing.application_id) &&
    Number(candidate.skill_match || 0) >
      Number(existing.skill_match || 0)
  ) {
    candidateMap.set(candidate.id, candidate);
  }
}

        // Sort candidates by highest skill match
        const uniqueCandidates = Array.from(
          candidateMap.values()
        ).sort(
          (a, b) =>
            Number(b.skill_match || 0) -
            Number(a.skill_match || 0)
        );

        console.table(
  uniqueCandidates.map((c) => ({
    name: c.name,
    candidate_id: c.id,
    job_id: c.job_id,
    application_id: c.application_id,
    application_status: c.application_status,
    skill_match: c.skill_match,
  }))
);

        setCandidates(uniqueCandidates);
      } catch (err) {
        console.error(
          "Candidate matching error:",
          err
        );

        setCandidates([]);
      }
    })
    .catch((err) => {
      console.error("Jobs error:", err);

      setJobs([]);
      setCandidates([]);
    });

  // Load all available domain roles
getDomainRoles()
    .then((data) => {
      setDomainRoles(
        Array.isArray(data) ? data : []
      );
    })
    .catch((err) => {
      console.error(
        "Domain roles error:",
        err
      );
      setDomainRoles([]);
    });
  }, [user?.id]
);

const handleApplicationStatus = async (candidate, status) => {
  try {
    const targetId =
      candidate.application_id || candidate.id;

    setUpdatingApplicationId(targetId);

    const updated = await updateApplicationStatus(
      candidate.job_id,
      targetId,
      status
    );

    setCandidates((current) =>
      current.map((item) =>
        item.id === candidate.id &&
        item.job_id === candidate.job_id
          ? {
              ...item,
              application_id: updated.id,
              application_status: updated.status,
            }
          : item
      )
    );
  } catch (err) {
    console.error(
      "Application status update failed:",
      err.response?.data || err.message
    );

    alert(
      err.response?.data?.error ||
        "Failed to update candidate status."
    );
  } finally {
    setUpdatingApplicationId(null);
  }
};

// shows the candidates videos
const handleViewApplicationVideo = async (candidate) => {
  if (!candidate?.application_id) {
    return;
  }

  try {
    setLoadingVideo(true);
    setVideoCandidate(candidate);
    setVideoUrl("");

    const result = await getApplicationVideoUrl(
      candidate.job_id,
      candidate.application_id
    );

    setVideoUrl(result.url);
  } catch (err) {
    console.error(
      "Failed to load application video:",
      err.response?.data || err.message
    );

    setVideoCandidate(null);

    alert(
      err.response?.data?.error ||
        "Failed to load the candidate video."
    );
  } finally {
    setLoadingVideo(false);
  }
};

//Interview
const handleScheduleInterview = async (e) => {
  e.preventDefault();

  if (!interviewCandidate?.application_id) {
    return;
  }

  try {
    setSchedulingInterview(true);

    let interview;

    if (
      interviewCandidate.interview &&
      interviewCandidate.interview.status !== "cancelled"
    ) {
      // Edit existing interview
      interview = await updateInterview(
        interviewCandidate.job_id,
        interviewCandidate.application_id,
        interviewForm
      );
    } else {
      // Create new interview
      interview = await scheduleInterview(
        interviewCandidate.job_id,
        interviewCandidate.application_id,
        interviewForm
      );
    }

    setCandidates((current) =>
      current.map((item) =>
        item.id === interviewCandidate.id &&
        item.job_id === interviewCandidate.job_id
          ? {
              ...item,
              interview,
            }
          : item
      )
    );

    setInterviewCandidate(null);

    setInterviewForm({
      scheduled_at: "",
      duration: 30,
      interview_type: "online",
      meeting_link: "",
      notes: "",
    });

  } catch (err) {
    console.error(
      "Interview save failed:",
      err.response?.data || err.message
    );

    alert(
  err.response?.data?.error ||
  err.response?.data?.message ||
  err.message ||
  "Failed to cancel interview."
);

  } finally {
    setSchedulingInterview(false);
  }
}

//send Invitation mails
const handleSendApplicantEmail = async (e) => {
  e.preventDefault();

  if (!emailCandidate?.application_id) {
    return;
  }

  try {
    setSendingEmail(true);

    await sendApplicantEmail(
      emailCandidate.job_id,
      emailCandidate.application_id,
      emailForm
    );

    alert("Email sent successfully.");

    setEmailCandidate(null);
    setEmailForm({
      subject: "",
      message: "",
    });
  } catch (err) {
    console.error(
      "Email sending failed:",
      err.response?.data || err.message
    );

    alert(
      err.response?.data?.error ||
      "Failed to send email."
    );
  } finally {
    setSendingEmail(false);
  }
};

// cancel the interview

const handleCancelInterview = async (candidate) => {
  if (!candidate?.application_id || !candidate?.interview) {
    return;
  }

  try {
    setSchedulingInterview(true);

    const cancelledInterview = await cancelInterview(
      candidate.job_id,
      candidate.application_id
    );

    setCandidates((current) =>
      current.map((item) =>
        item.id === candidate.id &&
        item.job_id === candidate.job_id
          ? {
              ...item,
              interview: cancelledInterview,
            }
          : item
      )
    );

    setShowCancelModal(false);
    setCancelCandidate(null);
  } catch (err) {
    console.error(
      "Interview cancellation failed:",
      err.response?.data || err.message
    );

    alert(
      err.response?.data?.error ||
        "Failed to cancel interview."
    );
  } finally {
    setSchedulingInterview(false);
  }
};

const handleBulkApplicationStatus = async (status) => {
  const selectedCandidates = candidates.filter((candidate) =>
    selectedCandidateIds.includes(candidate.id)
  );

  if (!selectedCandidates.length) {
    return;
  }

  try {
    for (const candidate of selectedCandidates) {
      const targetId =
        candidate.application_id || candidate.id;

      const updated = await updateApplicationStatus(
        candidate.job_id,
        targetId,
        status
      );

      setCandidates((current) =>
        current.map((item) =>
          item.id === candidate.id &&
          item.job_id === candidate.job_id
            ? {
                ...item,
                application_id: updated.id,
                application_status: updated.status,
              }
            : item
        )
      );
    }

    setSelectedCandidateIds([]);
  } catch (err) {
    console.error(
      "Bulk application status update failed:",
      err.response?.data || err.message
    );

    alert(
      err.response?.data?.error ||
        "Failed to update candidate status."
    );
  }
};

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


// filter candidates

const filteredCandidates = candidates
  .filter((candidate) => {

    // Recommended Candidates should only show
      // Domain Role Filter
          if (
  domainRoleFilter !== "all" &&
  candidate.domain_role !== domainRoleFilter
) {
  return false;
}

  // Application Status Filter
    if (applicationStatusFilter !== "all") {
      if (
        candidate.application_status?.toLowerCase() !==
        applicationStatusFilter.toLowerCase()
      ) {
        return false;
      }
    }


       // Match Score Filter
    const score = Number(candidate.skill_match || 0);

    if (matchScoreFilter === "80+") {
      return score >= 80;
    }

    if (matchScoreFilter === "60+") {
      return score >= 60;
    }

    if (matchScoreFilter === "below60") {
      return score < 60;
    }

    return true;
  })
  .sort((a, b) => {
    if (candidateSort === "match") {
      return (
        Number(b.skill_match || 0) -
        Number(a.skill_match || 0)
      );
    }

    if (candidateSort === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }

    if (candidateSort === "status") {
      return (
        (a.application_status || "submitted").localeCompare(
          b.application_status || "submitted"
        )
      );
    }

    return 0;
  });


  const totalPages = Math.ceil(
  filteredCandidates.length / itemsPerPage
);

const paginatedCandidates = filteredCandidates.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

const pipelineCandidates = candidates.filter(
  (c) =>
    c.application_status === "shortlisted" ||
    (c.interview && c.interview.status !== "cancelled")
);

const pipelineTotalPages = Math.ceil(
  pipelineCandidates.length / pipelineItemsPerPage
);

const paginatedPipelineCandidates = pipelineCandidates.slice(
  (pipelinePage - 1) * pipelineItemsPerPage,
  pipelinePage * pipelineItemsPerPage
);




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

      <div className="space-y-6">
 <Card
  title="Recommended Candidates"
  className="w-full"
>
  {/* Candidate Filters + Sorting */}
  <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

    {/* Status Filters */}
    <div className="flex flex-wrap items-center gap-2">

      {[
        {
          value: "all",
          label: "All",
          count: candidates.length,
        },
        {
          value: "submitted",
          label: "Submitted",
          count: candidates.filter(
            (c) => c.application_status === "submitted"
          ).length,
        },
        {
          value: "shortlisted",
          label: "Shortlisted",
          count: candidates.filter(
            (c) => c.application_status === "shortlisted"
          ).length,
        },
        {
          value: "rejected",
          label: "Rejected",
          count: candidates.filter(
            (c) => c.application_status === "rejected"
          ).length,
        },
      ].map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() =>
            setApplicationStatusFilter(filter.value)
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition ${
            applicationStatusFilter === filter.value
              ? "bg-brand-blue-600 text-white border-brand-blue-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span>{filter.label}</span>

          <span
            className={`min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] ${
              applicationStatusFilter === filter.value
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {filter.count}
          </span>
        </button>
      ))}

    </div>

    {/* Sort */}
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">
        Sort:
      </span>

      <select
        value={candidateSort}
        onChange={(e) =>
          setCandidateSort(e.target.value)
        }
        className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-600 outline-none focus:ring-1 focus:ring-brand-blue-500"
      >
        <option value="match">
          Best Match
        </option>

        <option value="name">
          Candidate Name
        </option>

        <option value="status">
          Application Status
        </option>
      </select>
    </div>

  </div>

{/* Domain Role Filter */}
<div className="flex items-center gap-2 mb-4">
  <span className="text-xs text-slate-500">
    Domain Role:
  </span>

  <select
    value={domainRoleFilter}
    onChange={(e) =>
      setDomainRoleFilter(e.target.value)
    }
    className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-600 outline-none focus:ring-1 focus:ring-brand-blue-500"
  >
    <option value="all">All Roles</option>

    {domainRoles.map((role) => (
      <option key={role.domain_role_id} value={role.domain_id}>
        {role.domain_name}
      </option>
    ))}
  </select>
</div>


  {/* Match Score Filter */}
  <div className="flex flex-wrap items-center gap-4 mb-4">
    <span className="text-xs text-slate-500">
      Match:
    </span>

    {[
      { value: "all", label: "All" },
      { value: "80+", label: "80%+" },
      { value: "60+", label: "60%+" },
      { value: "below60", label: "Below 60%" },
    ].map((filter) => (
      <button
        key={filter.value}
        type="button"
        onClick={() =>
          setMatchScoreFilter(filter.value)
        }
        className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition ${
          matchScoreFilter === filter.value
            ? "bg-brand-blue-600 text-white border-brand-blue-600"
            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
        }`}
      >
        {filter.label}
      </button>
    ))}
  </div>

  {/* Candidate List */}
  <div className="space-y-3">

    {/* Empty State */}
    {filteredCandidates.length === 0 && (
      <div className="text-center text-sm text-slate-400 py-8">
        {applicationStatusFilter === "all"
          ? "No eligible candidates available."
          : `No ${applicationStatusFilter} candidates found.`}
      </div>
    )}

{/* Bulk Candidate Actions */}
<div className="mb-5 flex flex-wrap items-center justify-between gap-3">

  <label className="flex items-center gap-2 text-xs text-slate-600">
    <input
      type="checkbox"
      checked={
        paginatedCandidates.length > 0 &&
        paginatedCandidates.every((candidate) =>
          selectedCandidateIds.includes(candidate.id)
        )
      }
      onChange={(e) => {
        if (e.target.checked) {
          setSelectedCandidateIds(
            paginatedCandidates.map(
              (candidate) => candidate.id
            )
          );
        } else {
          setSelectedCandidateIds([]);
        }
      }}
      className="w-4 h-4 rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
    />

    Select All
  </label>

  {selectedCandidateIds.length > 0 && (
    <div className="flex items-center gap-2">

      <span className="text-xs text-slate-500">
        {selectedCandidateIds.length} selected
      </span>

      <button
        type="button"
        onClick={() =>
          handleBulkApplicationStatus("shortlisted")
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100"
      >
        Shortlist Selected
      </button>

      <button
        type="button"
        onClick={() =>
          handleBulkApplicationStatus("rejected")
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100"
      >
        Reject Selected
      </button>

    </div>
  )}

</div>


    {/* Candidates */}
    {paginatedCandidates.map((c) => (
      <div
        key={`${c.id}-${c.job_id || "candidate"}`}
        className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
      >

{/* Candidate Header */}
<div className="flex items-center gap-3">

  {/* Select Candidate */}
  <input
    type="checkbox"
    checked={selectedCandidateIds.includes(c.id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedCandidateIds((current) => [
          ...current,
          c.id,
        ]);
      } else {
        setSelectedCandidateIds((current) =>
          current.filter((id) => id !== c.id)
        );
      }
    }}
    className="w-4 h-4 rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-500"
  />

  {/* Avatar */}
  <div className="w-10 h-10 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-sm">
    {(c.name || "?")[0].toUpperCase()}
  </div>

  {/* Candidate Name */}
  <div>
    <div className="font-semibold text-sm text-slate-800">
      {c.name || "Unknown Candidate"}
    </div>

    <div className="text-xs text-slate-500">
      {c.job_title || "Candidate"}
    </div>
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
        <div className="mt-3 pt-3 border-t border-slate-100">

          {/* Action Row */}
          <div className="flex justify-between items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setExpandedCandidateId(
                  expandedCandidateId === c.id
                    ? null
                    : c.id
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
              Review Candidate
            </Link>

          </div>

          {/* Application Decision */}

            <div className="mt-3 pt-3 border-t border-slate-100">

              <div className="flex items-center justify-between gap-3">

                {c.application_id && (
  <div className="text-xs text-slate-600">

    Application Status:{" "}

    <span
      className={`font-semibold ${
        c.application_status === "shortlisted"
          ? "text-green-700"
          : c.application_status === "rejected"
          ? "text-red-600"
          : "text-slate-700"
      }`}
    >
      {c.application_status
        ? c.application_status.charAt(0).toUpperCase() +
          c.application_status.slice(1)
        : "Submitted"}
    </span>

  </div>
)}

  {/* Application Actions */}

<div className="flex gap-2">


  {c.application_id && c.has_video && (
  <button
    type="button"
    onClick={() => handleViewApplicationVideo(c)}
    disabled={loadingVideo}
    className="px-3 py-1.5 text-xs font-medium rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50"
  >
    🎥 View Video
  </button>
)}

  {/* Submitted */}
  {(!c.application_status ||
    c.application_status === "submitted") && (
    <>


      <button
        type="button"
        disabled={
          updatingApplicationId === c.application_id
        }

       onClick={() => {
  const confirmed = window.confirm(
    `Are you sure you want to reject ${c.name}?`
  );

  if (confirmed) {
    handleApplicationStatus(c, "rejected");
  }
}} className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        {updatingApplicationId === c.application_id &&
        c.application_status === "submitted"
          ? "Updating..."
          : "Reject"}
      </button>
    </>
  )}

  {/* Shortlisted */}
  {c.application_status === "shortlisted" && (
    <>
      <button
        type="button"
        disabled={
          updatingApplicationId === c.application_id
        }
        onClick={() =>
          handleApplicationStatus(c, "submitted")
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
      >
        {updatingApplicationId === c.application_id
          ? "Updating..."
          : "Move to Submitted"}
      </button>

      <button
        type="button"
        disabled={
          updatingApplicationId === c.application_id
        }
        onClick={() =>
          handleApplicationStatus(c, "rejected")
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        Reject
      </button>
    </>
  )}

  {/* Rejected */}
  {c.application_status === "rejected" && (
    <>
      <button
        type="button"
        disabled={
          updatingApplicationId === c.application_id
        }
        onClick={() =>
          handleApplicationStatus(c, "shortlisted")
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
      >
        Shortlist
      </button>

      <button
        type="button"
        disabled={
          updatingApplicationId === c.application_id
        }
        onClick={() =>
          handleApplicationStatus(c, "submitted")
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
      >
        Move to Submitted
      </button>
    </>
  )}

</div>
      </div>



              {c.application_status === "shortlisted" && (


  <div className="flex gap-2">


    <button
      type="button"
      onClick={() => {
        setInterviewCandidate(c);


  if (
    c.interview &&
    c.interview.status !== "cancelled"
  ) {
    setInterviewForm({
      scheduled_at: formatDateTimeLocal(
        c.interview.scheduled_at
      ),
      duration: Number(
        c.interview.duration || 30
      ),
      interview_type:
        c.interview.interview_type || "online",
      meeting_link:
        c.interview.meeting_link || "",
      notes:
        c.interview.notes || "",
    });
  } else {
          setInterviewForm({
            scheduled_at: "",
            duration: 30,
            interview_type: "online",
            meeting_link: "",
            notes: "",
          });
        }
      }}
      className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
    >


      {c.interview &&
      c.interview.status !== "cancelled"
        ? "View / Edit Interview"
        : "Schedule Interview"}
    </button>

   {c.interview &&
  c.interview.status !== "cancelled" && (
    <button
      type="button"
      disabled={schedulingInterview}
      onClick={() => {
        setCancelCandidate(c);
        setShowCancelModal(true);
      }}
      className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      Cancel Interview
    </button>
  )}

  {c.interview &&
  c.interview.status !== "cancelled" && (
    <button
      type="button"
      disabled={
        updatingApplicationId === c.application_id
      }
      onClick={() =>
        handleApplicationStatus(c, "selected")
      }
      className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
    >
      {updatingApplicationId === c.application_id
        ? "Updating..."
        : "Select Candidate"}
    </button>
  )}
  </div>
)}

  {/* //cancel trigger */}

{c.interview?.status === "cancelled" && (
  <div className="mt-2 text-[11px] text-red-500">
    Interview has been cancelled.
  </div>
)}

  {/* Send Email */}
<button
  type="button"
  disabled={!c.application_id}
  onClick={() => {
    setEmailCandidate(c);
    setEmailForm({
      subject: "",
      message: "",
    });
  }}
  className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
>
  Send Email
</button>
              {/* Status Explanation */}
              {c.application_status ===
                "shortlisted" && (
                <div className="mt-2 text-[11px] text-green-600">
                  Candidate is shortlisted for
                  further review.
                </div>
              )}

              {c.application_status ===
                "rejected" && (
                <div className="mt-2 text-[11px] text-red-500">
                  Candidate was rejected for this
                  application.
                </div>
              )}

              {c.application_status ===
                 "selected" && (
                <div className="mt-2 text-[11px] text-green-600">
                 ✓ Candidate has been selected for this position.
                </div>
                   )}

              {c.application_status ===
                "submitted" && (
                <div className="mt-2 text-[11px] text-orange-600">
                  Application is awaiting employer
                  review.
                </div>
              )}

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
                    {c.skill_match ?? 0}% —{" "}
                    {c.fit_category ||
                      "Candidate"}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        Number(c.skill_match || 0),
                        100
                      )}%`,
                    }}
                  />
                </div>

              </div>

              {/* Skill Summary */}
              <div className="grid grid-cols-3 gap-2 mb-3">

                <div className="rounded-md bg-green-50 border border-green-100 p-2">
                  <div className="text-[10px] text-green-600">
                    Matched
                  </div>

                  <div className="text-sm font-semibold text-green-700">
                    {c.matched_skills?.length || 0}
                  </div>
                </div>

                <div className="rounded-md bg-orange-50 border border-orange-100 p-2">
                  <div className="text-[10px] text-orange-600">
                    Developing
                  </div>

                  <div className="text-sm font-semibold text-orange-700">
                    {c.partial_skills?.length || 0}
                  </div>
                </div>

                <div className="rounded-md bg-slate-50 border border-slate-200 p-2">
                  <div className="text-[10px] text-slate-500">
                    Missing
                  </div>

                  <div className="text-sm font-semibold text-slate-700">
                    {c.missing_skills?.length || 0}
                  </div>
                </div>

              </div>

              {/* Matched Skills */}
              <div className="mb-2">

                <div className="text-xs font-medium text-green-700">
                  Matched Skills
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
                   Developing Skills
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

                  {Number(c.skill_match || 0) >=
                  80
                    ? "Strong skill alignment with the job requirements."
                    : Number(
                        c.skill_match || 0
                      ) >= 60
                    ? "Good skill alignment, but some skills may need further review."
                    : "Partial skill alignment. Review the candidate's skill gaps before proceeding."}

                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    ))}

  {/*pagination*/}
    {totalPages > 1 && (
  <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
    <span className="text-xs text-slate-500">
      Page {currentPage} of {totalPages}
    </span>

    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() =>
          setCurrentPage((page) => page - 1)
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() =>
          setCurrentPage((page) => page + 1)
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
)}
  </div>
</Card>


{interviewCandidate && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
  <h2 className="text-base font-semibold text-slate-800">
  {interviewCandidate?.interview &&
  interviewCandidate.interview.status !== "cancelled"
    ? "Edit Interview"
    : "Schedule Interview"}
</h2>
</h2>
          <p className="mt-1 text-xs text-slate-500">
            {interviewCandidate.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInterviewCandidate(null)}
          className="text-slate-400 hover:text-slate-600"
        >

        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleScheduleInterview}
        className="space-y-4 p-5"
      >

        {/* Date & Time */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Interview Date & Time
          </label>

          <input
            type="datetime-local"
            required
            value={interviewForm.scheduled_at}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) =>
              setInterviewForm((current) => ({
                ...current,
                scheduled_at: e.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Duration
          </label>

          <select
            value={interviewForm.duration}
            onChange={(e) =>
              setInterviewForm((current) => ({
                ...current,
                duration: Number(e.target.value),
              }))
            }
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>90 minutes</option>
          </select>
        </div>

        {/* Interview Type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Interview Type
          </label>

          <select
            value={interviewForm.interview_type}
            onChange={(e) =>
              setInterviewForm((current) => ({
                ...current,
                interview_type: e.target.value,
                meeting_link:
                  e.target.value === "online"
                    ? current.meeting_link
                    : "",
              }))
            }
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="online">Online</option>
            <option value="in-person">In-person</option>
          </select>
        </div>

        {/* Meeting Link */}
        {interviewForm.interview_type === "online" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Meeting Link
            </label>

            <input
              type="url"
              required
              placeholder="https://meet.google.com/..."
              value={interviewForm.meeting_link}
              onChange={(e) =>
                setInterviewForm((current) => ({
                  ...current,
                  meeting_link: e.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Notes
          </label>

          <textarea
            rows={3}
            placeholder="Optional interview notes..."
            value={interviewForm.notes}
            onChange={(e) =>
              setInterviewForm((current) => ({
                ...current,
                notes: e.target.value,
              }))
            }
            className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">

          <button
            type="button"
            onClick={() => setInterviewCandidate(null)}
            disabled={schedulingInterview}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={schedulingInterview}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {schedulingInterview
  ? "Saving..."
  : interviewCandidate?.interview
    ? "Reschedule Interview"
    : "Schedule Interview"}
          </button>

        </div>

      </form>
    </div>
  </div>
)}

{showCancelModal && cancelCandidate && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">

      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold text-slate-800">
          Cancel Interview
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Are you sure you want to cancel this interview?
        </p>
      </div>

      <div className="p-5">

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <div>
            <span className="font-medium">
              Candidate:
            </span>{" "}
            {cancelCandidate.name}
          </div>

          {cancelCandidate.interview?.scheduled_at && (
            <div className="mt-1">
              <span className="font-medium">
                Scheduled:
              </span>{" "}
              {new Date(
                cancelCandidate.interview.scheduled_at
              ).toLocaleString()}
            </div>
          )}

          <div className="mt-1">
            <span className="font-medium">
              Duration:
            </span>{" "}
            {cancelCandidate.interview?.duration || 30} minutes
          </div>

          <div className="mt-1">
            <span className="font-medium">
              Type:
            </span>{" "}
            {cancelCandidate.interview?.interview_type ===
            "in-person"
              ? "In-person"
              : "Online"}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">

          <button
            type="button"
            disabled={schedulingInterview}
            onClick={() => {
              setShowCancelModal(false);
              setCancelCandidate(null);
            }}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Keep Interview
          </button>

          <button
            type="button"
            disabled={schedulingInterview}
            onClick={() =>
              handleCancelInterview(cancelCandidate)
            }
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {schedulingInterview
              ? "Cancelling..."
              : "Cancel Interview"}
          </button>

        </div>
      </div>
    </div>
  </div>
)}
<Card title="Hiring Pipeline" className="w-full">
  <div className="space-y-3">

    {paginatedPipelineCandidates.map((c) => {
        const interviewScheduled =
          c.interview &&
          c.interview.status !== "cancelled";

        return (
          <div
            key={`pipeline-${c.id}`}
            className="p-4 rounded-xl border border-slate-200 bg-white"
          >

            {/* Candidate Header */}
            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-sm">
                  {(c.name || "?")[0].toUpperCase()}
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {c.name || "Unknown Candidate"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {c.job_title || "Candidate"}
                  </div>
                </div>

              </div>

            </div>


            {/* Pipeline */}
            <div className="mt-5 overflow-x-auto">

              <div className="min-w-[650px] flex items-center">

                {/* Shortlisted */}
                <div className="flex items-center flex-1">

                  <div className="flex flex-col items-center min-w-[90px]">

                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 grid place-items-center text-xs font-bold">
                      ✓
                    </div>

                    <span className="mt-2 text-[11px] font-medium text-green-700">
                      Shortlisted
                    </span>

                  </div>

                  <div className="h-px bg-green-300 flex-1" />

                </div>


                {/* Interview Scheduled */}
                <div className="flex items-center flex-1">

                  <div className="flex flex-col items-center min-w-[120px]">

                    <div
                      className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${
                        interviewScheduled
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {interviewScheduled ? "✓" : "2"}
                    </div>

                    <span
                      className={`mt-2 text-[11px] font-medium ${
                        interviewScheduled
                          ? "text-blue-700"
                          : "text-slate-400"
                      }`}
                    >
                      Interview Scheduled
                    </span>

                  </div>

                  <div
                    className={`h-px flex-1 ${
                      interviewScheduled
                        ? "bg-blue-300"
                        : "bg-slate-200"
                    }`}
                  />

                </div>


                {/* Interview Completed */}
                <div className="flex flex-col items-center min-w-[120px]">

                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 grid place-items-center text-xs font-bold">
                    3
                  </div>

                  <span className="mt-2 text-[11px] font-medium text-slate-400 whitespace-nowrap">
                    Interview Completed
                  </span>

                </div>

              </div>

            </div>


            {/* Current Stage */}
            <div className="mt-4 flex items-center justify-between gap-3">

              <div>

                <div className="text-[11px] text-slate-400">
                  Current Stage
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  {interviewScheduled
                    ? "Interview Scheduled"
                    : "Shortlisted"}
                </div>

                {interviewScheduled &&
                  c.interview?.scheduled_at && (
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(
                        c.interview.scheduled_at
                      ).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  )}

              </div>


              {/* Actions */}
              <div className="flex flex-wrap gap-2">

                <Link
                  to="/app/candidates"
                  state={{ candidate: c }}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100"
                >
                  View Profile
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setInterviewCandidate(c);

                    if (
                      c.interview &&
                      c.interview.status !== "cancelled"
                    ) {
                      setInterviewForm({
                        scheduled_at:
                          formatDateTimeLocal(
                            c.interview.scheduled_at
                          ),
                        duration: Number(
                          c.interview.duration || 30
                        ),
                        interview_type:
                          c.interview.interview_type ||
                          "online",
                        meeting_link:
                          c.interview.meeting_link || "",
                        notes:
                          c.interview.notes || "",
                      });
                    } else {
                      setInterviewForm({
                        scheduled_at: "",
                        duration: 30,
                        interview_type: "online",
                        meeting_link: "",
                        notes: "",
                      });
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {interviewScheduled
                    ? "View / Edit Interview"
                    : "Schedule Interview"}
                </button>

                {interviewScheduled && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelCandidate(c);
                      setShowCancelModal(true);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Cancel Interview
                  </button>
                )}

                <button
                  type="button"
                  disabled={!c.application_id}
                  onClick={() => {
                    setEmailCandidate(c);
                    setEmailForm({
                      subject: "",
                      message: "",
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                >
                  Send Email
                </button>

              </div>

            </div>

          </div>
        );
      })}


{pipelineTotalPages > 1 && (
  <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
    <span className="text-xs text-slate-500">
      Page {pipelinePage} of {pipelineTotalPages}
    </span>

    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pipelinePage === 1}
        onClick={() =>
          setPipelinePage((page) => page - 1)
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <button
        type="button"
        disabled={pipelinePage === pipelineTotalPages}
        onClick={() =>
          setPipelinePage((page) => page + 1)
        }
        className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
)}

    {/* Empty State */}
    {candidates.filter(
      (c) =>
        c.application_status === "shortlisted" ||
        (c.interview &&
          c.interview.status !== "cancelled")
    ).length === 0 && (
      <div className="text-center py-10">

        <div className="text-sm font-medium text-slate-600">
          No candidates in the hiring pipeline
        </div>

        <div className="text-xs text-slate-400 mt-1">
          Shortlist a recommended candidate to start the hiring process.
        </div>

      </div>
    )}

  </div>
</Card>
      </div>


         {/*video window */}

      {videoCandidate && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Video Introduction
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {videoCandidate.name || "Candidate"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setVideoCandidate(null);
            setVideoUrl("");
          }}
          className="text-slate-400 hover:text-slate-600 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Video */}
      <div className="p-5">
        {loadingVideo ? (
          <div className="flex items-center justify-center h-64 text-sm text-slate-500">
            Loading video...
          </div>
        ) : videoUrl ? (
          <video
            controls
            autoPlay
            className="w-full max-h-[70vh] rounded-lg bg-black"
            src={videoUrl}
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="flex items-center justify-center h-64 text-sm text-slate-500">
            Video could not be loaded.
          </div>
        )}
      </div>

    </div>
  </div>
)}

{emailCandidate && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Send Email
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            To: {emailCandidate.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEmailCandidate(null)}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={handleSendApplicantEmail}
        className="space-y-4 p-5"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Subject
          </label>

          <input
            type="text"
            value={emailForm.subject}
            onChange={(e) =>
              setEmailForm((current) => ({
                ...current,
                subject: e.target.value,
              }))
            }
            placeholder="Enter email subject"
            required
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Message
          </label>

          <textarea
            rows={7}
            value={emailForm.message}
            onChange={(e) =>
              setEmailForm((current) => ({
                ...current,
                message: e.target.value,
              }))
            }
            placeholder="Write your message..."
            required
            className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setEmailCandidate(null)}
            disabled={sendingEmail}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={sendingEmail}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {sendingEmail ? "Sending..." : "Send Email"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}
