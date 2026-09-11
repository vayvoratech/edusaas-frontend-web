import React, { useEffect, useState } from 'react';
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

export default function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [domainRoles, setDomainRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [user?.id]);

   {/*updated job posting fileds */}
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
    application_deadline: editing.application_deadline || null,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Job Listings</h2>
          <p className="text-sm text-slate-500">Create, manage, and archive postings.</p>
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
                    responsibilities:"",
                    require_video: false,
                    video_max_duration: 60,
                    video_prompt: "",
    })
  }
>
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
                  onClick={() =>
     setEditing({
    ...j,

    required_skills_csv: (j.required_skills || []).join(", "),

    preferred_skills_csv: (
      j.preferred_skills || []
    ).join(", "),

    eligible_branches_csv: (
      j.eligible_branches || []
    ).join(", "),
  })
}
                >
                   Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(j)}> Archive</Button>
              </div>
            </Card>
          ))
        )}
      </div>

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
            <h3 className="font-semibold text-lg mb-4">{editing.id ? 'Edit job' : 'Post a job'}</h3>
                      {/* Job Role */}
<div className="mb-3">
  <label className="text-xs text-slate-500">
    Job Role <span className="text-red-500">*</span>
  </label>

  <select
    value={editing.title || ""}
    onChange={(e) =>
      setEditing({ ...editing, title: e.target.value })
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
    Roles & Responsibilities <span className="text-red-500">*</span>
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

{/* Good-to-Have Skills */}
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

{/* Employment Type */}
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

  <input
    value={editing.salary || ""}
    onChange={(e) =>
      setEditing({
        ...editing,
        salary: e.target.value,
      })
    }
    placeholder="₹4–6 LPA / ₹20,000 per month"
    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
  />
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

 {/* video recording */}
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
<div className="mb-5">
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
