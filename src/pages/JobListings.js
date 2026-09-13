import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getDomainRoles
} from '../services/api';

import { useAuth } from '../context/AuthContext';

// salary range
const SALARY_OPTIONS = [
  "₹0 – ₹3 LPA",
  "₹3 – ₹5 LPA",
  "₹5 – ₹7 LPA",
  "₹8 – ₹10 LPA",
  "₹5,000 – ₹10,000 / month",
  "₹10,000 – ₹15,000 / month",
  "₹15,000 – ₹25,000 / month",
  "₹25,000 – ₹40,000 / month",
  "₹40,000+ / month",
  "Unpaid / No Compensation",
];

export default function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [domainRoles, setDomainRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState(null);

  //SORTING AND FILTERING
  const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [employmentFilter, setEmploymentFilter] = useState("all");
const [locationFilter, setLocationFilter] = useState("all");
const [sortBy, setSortBy] = useState("newest");

  const load = async () => {
  try {
    const params = user?.role === 'employer'
      ? { employer_id: user.id }
      : {};

    setJobs(await getJobs(params));
    setDomainRoles(await getDomainRoles());
  } catch (err) {
    setError(err.response?.data?.error || err.message);
  }
};

const normalizeDeadline = (value) => {
  if (!value) return null;

  // HTML date input value: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T23:59:59`);

    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString();
  }

  // Existing database value / ISO datetime
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
};


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [user?.id]);

   //updated job posting fileds
 const onSave = async (e) => {
  e.preventDefault();

  const data = {
    title: editing.title,
    description: editing.description,
     responsibilities: editing.responsibilities || null,

    required_skills: (editing.required_skills_csv || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),

    preferred_skills: (editing.preferred_skills_csv || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),

    qualification: editing.qualification || null,

    eligible_branches: (editing.eligible_branches_csv || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),

    employment_type: editing.employment_type || null,
    work_mode: editing.work_mode || null,
    location: editing.location || null,
    salary: editing.salary || null,

   application_deadline: normalizeDeadline(
  editing.application_deadline
),


    require_video: Boolean(editing.require_video),

    video_max_duration: editing.require_video
   ? Number(editing.video_max_duration || 60)
    : null,
   video_prompt: editing.require_video
   ? editing.video_prompt?.trim() || null
   : null,

    status: editing.status || "open",
  };

  try {
    if (editing.id) {
      await updateJob(editing.id, data);
    } else {
      await createJob(data);
    }

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

  const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatValue = (value) => {
  if (!value) return "Not specified";

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


const filteredJobs = useMemo(() => {
  let result = [...jobs];

  // Search
  if (search.trim()) {
    const query = search.toLowerCase();

    result = result.filter((job) => {
      const searchableText = [
        job.title,
        job.description,
        job.location,
        job.salary,
        ...(job.required_skills || []),
        ...(job.preferred_skills || []),
        ...(job.eligible_branches || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }

  // Status
  if (statusFilter !== "all") {
    result = result.filter(
      (job) => String(job.status).toLowerCase() === statusFilter
    );
  }

  // Employment type
  if (employmentFilter !== "all") {
    result = result.filter(
      (job) =>
        String(job.employment_type).toLowerCase() ===
        employmentFilter
    );
  }

  // Location
  if (locationFilter !== "all") {
    result = result.filter(
      (job) =>
        String(job.location || "").toLowerCase() ===
        locationFilter.toLowerCase()
    );
  }

  // Sorting
  result.sort((a, b) => {
    if (sortBy === "newest") {
      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    }

    if (sortBy === "oldest") {
      return (
        new Date(a.created_at || 0) -
        new Date(b.created_at || 0)
      );
    }

    if (sortBy === "title") {
      return String(a.title || "").localeCompare(
        String(b.title || "")
      );
    }

    if (sortBy === "deadline") {
      return (
        new Date(a.application_deadline || "9999-12-31") -
        new Date(b.application_deadline || "9999-12-31")
      );
    }

    return 0;
  });

  return result;
}, [
  jobs,
  search,
  statusFilter,
  employmentFilter,
  locationFilter,
  sortBy,
]);

const locationOptions = useMemo(() => {
  return Array.from(
    new Set(
      jobs
        .map((job) => job.location)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}, [jobs]);


return (
  <div className="space-y-6">
    <div>
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Job Listings
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Create, manage, and archive postings.
          </p>
        </div>

        <Button
          onClick={() =>
            setEditing({
              status: "open",
              required_skills_csv: "",
              preferred_skills_csv: "",
              eligible_branches_csv: "",
              qualification: "",
              employment_type: "",
              work_mode: "",
              location: "",
              salary: "",
              application_deadline: "",
              responsibilities: "",
              description: "",
              title: "",
              require_video: false,
              video_max_duration: 60,
              video_prompt: "",
            })
          }
        >
          + Post a Job
        </Button>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs, skills, location..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          {/* Employment */}
          <select
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Employment Types</option>
            <option value="full-time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="part-time">Part-time</option>
          </select>

          {/* Location */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Locations</option>

            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline">Deadline</option>
            <option value="title">Job Title</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Result count */}
      <div className="flex items-center justify-between mt-5 mb-3">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredJobs.length}
          </span>{" "}
          {filteredJobs.length === 1 ? "job" : "jobs"}
        </p>

        {(search ||
          statusFilter !== "all" ||
          employmentFilter !== "all" ||
          locationFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setEmploymentFilter("all");
              setLocationFilter("all");
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>

    {/* ==================== JOB LISTINGS ==================== */}

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      {filteredJobs.length === 0 ? (
        <Card className="xl:col-span-2">
          <div className="py-10 text-center">
            <div className="text-3xl mb-3">📋</div>

            <h3 className="font-semibold text-slate-900">
              {jobs.length === 0
                ? "No job listings yet"
                : "No jobs found"}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {jobs.length === 0
                ? 'Create your first job posting by clicking "Post a Job".'
                : "Try adjusting your search or filters."}
            </p>
          </div>
        </Card>
      ) : (
        filteredJobs.map((j) => {
          const requiredSkills = j.required_skills || [];
          const preferredSkills = j.preferred_skills || [];
          const branches = j.eligible_branches || [];

          const visibleSkills = requiredSkills.slice(0, 4);
          const visiblePreferredSkills =
            preferredSkills.slice(0, 3);
          const visibleBranches = branches.slice(0, 3);

          const remainingSkills =
            requiredSkills.length - visibleSkills.length;

          const remainingPreferredSkills =
            preferredSkills.length -
            visiblePreferredSkills.length;

          const remainingBranches =
            branches.length - visibleBranches.length;

          const deadlinePassed =
            j.application_deadline &&
            new Date(j.application_deadline) < new Date();

          return (
            <Card
              key={j.id}
              className="w-full flex flex-col p-0 overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              {/* ================= CARD BODY ================= */}
              <div className="px-4 py-2">

                {/* HEADER */}
                <div className="flex items-center justify-between gap-3 h-[36px]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">
                        {j.title}
                      </h3>

                      <span
                        className={`inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          j.status === "open"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            j.status === "open"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />

                        {formatValue(j.status)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Posted {formatDate(j.created_at)}
                    </p>
                  </div>

                  {/* Always reserve the same header space */}
                  <div className="shrink-0 w-[92px] flex justify-end">
                    {j.require_video && (
                      <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium whitespace-nowrap">
                        Video Required
                      </span>
                    )}
                  </div>
                </div>

                {/* BASIC INFORMATION */}
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <div className="h-[46px] rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 flex flex-col justify-center">
                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wide">
                      Employment
                    </p>

                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {formatValue(j.employment_type)}
                    </p>
                  </div>

                  <div className="h-[46px] rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 flex flex-col justify-center">
                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wide">
                      Work Mode
                    </p>

                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {formatValue(j.work_mode)}
                    </p>
                  </div>

                  <div className="h-[46px] rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 flex flex-col justify-center">
                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wide">
                      Location
                    </p>

                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {j.location || "Not specified"}
                    </p>
                  </div>

                  <div className="h-[46px] rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 flex flex-col justify-center">
                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wide">
                      Salary
                    </p>

                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {j.salary || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* QUALIFICATION + BRANCHES */}
                <div className="grid grid-cols-2 gap-4 mt-1.5">
                  <div className="min-w-0 h-[36px]">
                    <p className="text-xs font-medium text-slate-500">
                      Qualification
                    </p>

                    <p className="text-sm text-slate-800 mt-0.5 truncate">
                      {formatValue(j.qualification)}
                    </p>
                  </div>

                  <div className="min-w-0 h-[36px]">
                    <p className="text-xs font-medium text-slate-500 truncate">
                      Eligible Branches / Degrees
                    </p>

                    <div className="flex flex-nowrap gap-1 mt-0.5 overflow-hidden">
                      {visibleBranches.length > 0 ? (
                        <>
                          {visibleBranches.map((branch) => (
                            <span
                              key={branch}
                              className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]"
                            >
                              {branch}
                            </span>
                          ))}

                          {remainingBranches > 0 && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                              +{remainingBranches}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SKILLS */}
                <div className="grid grid-cols-2 gap-4 mt-1.5">

                  {/* REQUIRED */}
                  <div className="min-w-0 h-[42px]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-500 truncate">
                        Required Skills
                      </p>

                      {requiredSkills.length > 0 && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {requiredSkills.length} skills
                        </span>
                      )}
                    </div>

                    <div className="flex flex-nowrap gap-1 mt-1 overflow-hidden">
                      {visibleSkills.length > 0 ? (
                        <>
                          {visibleSkills.map((skill) => (
                            <span
                              key={skill}
                              title={skill}
                              className="shrink-0 max-w-[105px] truncate px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}

                          {remainingSkills > 0 && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                              +{remainingSkills}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BETTER TO HAVE */}
                  <div className="min-w-0 h-[48px]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-500 truncate">
                        Better-to-Have Skills
                      </p>

                      {preferredSkills.length > 0 && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {preferredSkills.length} skills
                        </span>
                      )}
                    </div>

                    <div className="flex flex-nowrap gap-1 mt-1 overflow-hidden">
                      {visiblePreferredSkills.length > 0 ? (
                        <>
                          {visiblePreferredSkills.map((skill) => (
                            <span
                              key={skill}
                              title={skill}
                              className="shrink-0 max-w-[105px] truncate px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}

                          {remainingPreferredSkills > 0 && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                              +{remainingPreferredSkills}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* VIDEO SLOT
                    Same height on every card */}
                <div className="h-[14px] mt-0.5 flex items-center">
                  {j.require_video && (
                    <div className="flex items-center gap-2 text-[10px] text-purple-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />

                      <span className="font-medium">
                        Candidate video required
                      </span>

                      <span className="text-purple-400">
                        · {j.video_max_duration || 60}s maximum
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ================= FOOTER ================= */}
              <div className="border-t border-slate-100 px-4 py-1.5">
                <div className="flex items-center justify-between gap-3">

                  {/* DEADLINE */}
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-slate-500">
                      Application Deadline
                    </p>

                    <p
                      className={`text-sm font-semibold mt-0.5 ${
                        deadlinePassed
                          ? "text-red-600"
                          : "text-slate-900"
                      }`}
                    >
                      {formatDate(j.application_deadline)}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedJob(j)}
                      className="text-xs px-3 py-1"
                    >
                      View Job
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditing({
                          ...j,

                          application_deadline:
                            j.application_deadline
                              ? new Date(j.application_deadline)
                                  .toISOString()
                                  .slice(0, 10)
                              : "",

                          required_skills_csv: (
                            j.required_skills || []
                          ).join(", "),

                          preferred_skills_csv: (
                            j.preferred_skills || []
                          ).join(", "),

                          eligible_branches_csv: (
                            j.eligible_branches || []
                          ).join(", "),
                        })
                      }
                      className="text-xs px-3 py-1"
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(j)}
                      className="text-xs px-3 py-1"
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>

    {/* ================= JOB DETAILS MODAL ================= */}

    {selectedJob && (
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedJob(null)}
      >
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {selectedJob.title}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Posted {formatDate(selectedJob.created_at)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedJob(null)}
              className="text-slate-400 hover:text-slate-600 text-xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* About */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                About the Role
              </h4>

              <p className="text-sm text-slate-600 whitespace-pre-line leading-6">
                {selectedJob.description || "Not specified"}
              </p>
            </div>

            {/* Responsibilities */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Roles & Responsibilities
              </h4>

              <p className="text-sm text-slate-600 whitespace-pre-line leading-6">
                {selectedJob.responsibilities || "Not specified"}
              </p>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  Required Skills
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  {(selectedJob.required_skills || []).length > 0 ? (
                    selectedJob.required_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">
                      Not specified
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  Better-to-Have Skills
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  {(selectedJob.preferred_skills || []).length > 0 ? (
                    selectedJob.preferred_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">
                      Not specified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">
                  Qualification
                </h4>

                <p className="text-sm text-slate-600">
                  {formatValue(selectedJob.qualification)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">
                  Eligible Branches / Degrees
                </h4>

                <p className="text-sm text-slate-600">
                  {(selectedJob.eligible_branches || []).length > 0
                    ? selectedJob.eligible_branches.join(", ")
                    : "Not specified"}
                </p>
              </div>
            </div>

            {/* Job Information */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Job Information
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] uppercase text-slate-500">
                    Employment
                  </p>

                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {formatValue(selectedJob.employment_type)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] uppercase text-slate-500">
                    Work Mode
                  </p>

                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {formatValue(selectedJob.work_mode)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] uppercase text-slate-500">
                    Location
                  </p>

                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {selectedJob.location || "Not specified"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] uppercase text-slate-500">
                    Salary
                  </p>

                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {selectedJob.salary || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">
                Application Deadline
              </h4>

              <p className="text-sm text-slate-600">
                {formatDate(selectedJob.application_deadline)}
              </p>
            </div>

            {/* Video */}
            {selectedJob.require_video && (
              <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
                <h4 className="text-sm font-semibold text-purple-900">
                  Candidate Video Requirement
                </h4>

                <p className="text-sm text-purple-700 mt-1">
                  Maximum duration:{" "}
                  {selectedJob.video_max_duration || 60} seconds
                </p>

                {selectedJob.video_prompt && (
                  <p className="text-sm text-purple-700 mt-1.5">
                    Prompt: {selectedJob.video_prompt}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedJob(null)}
            >
              Close
            </Button>

            <Button
              type="button"
              onClick={() => {
                const job = selectedJob;

                setSelectedJob(null);

                setEditing({
                  ...job,

                  application_deadline:
                    job.application_deadline
                      ? new Date(job.application_deadline)
                          .toISOString()
                          .slice(0, 10)
                      : "",

                  required_skills_csv: (
                    job.required_skills || []
                  ).join(", "),

                  preferred_skills_csv: (
                    job.preferred_skills || []
                  ).join(", "),

                  eligible_branches_csv: (
                    job.eligible_branches || []
                  ).join(", "),
                });
              }}
            >
              Edit Job
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* ================= EDIT / POST MODAL ================= */}

    {editing && (
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-fade-in overflow-y-auto"
        onClick={() => setEditing(null)}
      >
        <form
          onSubmit={onSave}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        >
          <h3 className="font-semibold text-lg mb-4">
            {editing.id ? "Edit job" : "Post a job"}
          </h3>

          {/* Job Role */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Job Role <span className="text-red-500">*</span>
            </label>

            <select
              value={editing.title || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  title: e.target.value,
                })
              }
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            >
              <option value="">Select a job role</option>

              {domainRoles.map((role) => (
                <option
                  key={role.domain_role_id}
                  value={role.domain_name}
                >
                  {role.domain_name}
                </option>
              ))}
            </select>
          </div>

          {/* About the Role */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              About the Role <span className="text-red-500">*</span>
            </label>

            <textarea
              rows={4}
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  description: e.target.value,
                })
              }
              placeholder="Describe the role and what the student will work on..."
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            />
          </div>

          {/* Roles & Responsibilities */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Roles & Responsibilities{" "}
              <span className="text-red-500">*</span>
            </label>

            <textarea
              rows={5}
              value={editing.responsibilities || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  responsibilities: e.target.value,
                })
              }
              placeholder="Describe the key responsibilities and day-to-day activities..."
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            />

            <p className="text-[11px] text-slate-400 mt-1">
              Mention the main responsibilities the student will handle.
            </p>
          </div>

          {/* Required Skills */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Required Skills <span className="text-red-500">*</span>
            </label>

            <input
              value={editing.required_skills_csv || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  required_skills_csv: e.target.value,
                })
              }
              placeholder="Python, SQL, React"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            />

            <p className="text-[11px] text-slate-400 mt-1">
              Skills that are important for this role.
            </p>
          </div>

          {/* Better-to-Have */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Better-to-Have
            </label>

            <input
              value={editing.preferred_skills_csv || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  preferred_skills_csv: e.target.value,
                })
              }
              placeholder="Git, Docker, AWS"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            />

            <p className="text-[11px] text-slate-400 mt-1">
              Additional skills that would be an advantage.
            </p>
          </div>

          {/* Qualification */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Qualification <span className="text-red-500">*</span>
            </label>

            <select
              value={editing.qualification || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  qualification: e.target.value,
                })
              }
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            >
              <option value="">Select qualification</option>
              <option value="bachelors">Bachelor's Degree</option>
              <option value="masters">Master's Degree</option>
              <option value="diploma">Diploma</option>
              <option value="any">Any Qualification</option>
            </select>
          </div>

          {/* Eligible Branches */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Eligible Branches / Degrees
            </label>

            <input
              value={editing.eligible_branches_csv || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  eligible_branches_csv: e.target.value,
                })
              }
              placeholder="CSE, IT, AI/ML, Data Science"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            />
          </div>

          {/* Employment */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Employment Type <span className="text-red-500">*</span>
            </label>

            <select
              value={editing.employment_type || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  employment_type: e.target.value,
                })
              }
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            >
              <option value="">Select employment type</option>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="part-time">Part-time</option>
            </select>
          </div>

          {/* Work Mode */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Work Mode <span className="text-red-500">*</span>
            </label>

            <select
              value={editing.work_mode || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  work_mode: e.target.value,
                })
              }
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            >
              <option value="">Select work mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
          </div>

          {/* Location */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Location
            </label>

            <input
              value={editing.location || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  location: e.target.value,
                })
              }
              placeholder="Hyderabad"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            />
          </div>

          {/* Salary */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Salary / Compensation
            </label>

            <select
              value={editing.salary || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  salary: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 bg-white"
            >
              <option value="">
                Select salary / compensation
              </option>

              {editing.salary &&
                !SALARY_OPTIONS.includes(editing.salary) && (
                  <option value={editing.salary}>
                    {editing.salary} (existing)
                  </option>
                )}

              {SALARY_OPTIONS.map((salary) => (
                <option key={salary} value={salary}>
                  {salary}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-slate-400 mt-1">
              Select the salary range or stipend applicable to this role.
            </p>
          </div>

          {/* Application Deadline */}
          <div className="mb-3">
            <label className="text-xs text-slate-500">
              Application Deadline
            </label>

            <input
              type="date"
              value={editing.application_deadline || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  application_deadline: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            />
          </div>

          {/* Video Recording */}
          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={Boolean(editing.require_video)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    require_video: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />

              <div>
                <label className="text-sm font-medium text-slate-800">
                  Require candidate video introduction
                </label>

                <p className="text-xs text-slate-500 mt-1">
                  Candidates will be asked to submit a short
                  self-introduction video with their application.
                </p>
              </div>
            </div>

            {editing.require_video && (
              <div className="mt-4 space-y-4 pl-7">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Maximum video duration
                  </label>

                  <select
                    value={editing.video_max_duration || 60}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        video_max_duration: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                    <option value={90}>90 seconds</option>
                    <option value={120}>2 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Video prompt
                  </label>

                  <textarea
                    value={editing.video_prompt || ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        video_prompt: e.target.value,
                      })
                    }
                    placeholder="Example: Introduce yourself and explain why you're a good fit for this role."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
                  />

                  <p className="text-xs text-slate-500 mt-1">
                    This prompt will be shown to candidates when they apply.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="mb-5 mt-5">
            <label className="text-xs text-slate-500">
              Status
            </label>

            <select
              value={editing.status || "open"}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  status: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>

            <Button type="submit">
              {editing.id ? "Save" : "Post"}
            </Button>
          </div>
        </form>
      </div>
    )}
  </div>
);
}
