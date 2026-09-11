import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getJobById,
  getMyJobApplications,
} from "../services/api";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
  const loadJob = async () => {
    try {
      setLoading(true);
      setError("");

      const jobData = await getJobById(id);

      setJob(jobData);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to load job details."
      );
    } finally {
      setLoading(false);
    }
  };

  loadJob();
}, [id]);


useEffect(() => {
  const checkApplication = async () => {
    try {
      const applications = await getMyJobApplications();

      const applied = applications?.some(
        (application) =>
          String(application.job_id || application.job?.id) === String(id)
      );

      setAlreadyApplied(applied);
    } catch (err) {
      console.error("Failed to check application status:", err);
    }
  };

  checkApplication();
}, [id]);


  if (loading) {
    return (
      <div className="p-6 text-slate-600">
        Loading job...
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg bg-red-50 text-red-600">
          {error}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-lg border"
        >
          Back
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 text-slate-600">
        Job not found.
      </div>
    );
  }
  return (
    <div>
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* Back */}
      <button
      onClick={() => navigate("/app/dashboard")}
         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
             text-sm font-medium text-slate-600
             bg-white border border-slate-200
             hover:bg-slate-50 hover:text-slate-900
             transition-all duration-200 shadow-sm"
>
  <span className="text-base"></span>
         Back to Dashboard
      </button>

      {/* Job Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

        <h1 className="text-2xl font-bold text-slate-900">
          {job.title}
        </h1>

        <div className="mt-2 text-sm text-slate-500">
          Status:{" "}
          <span className="font-medium">
            {job.status}
          </span>
        </div>

        {job.description && (
          <div className="mt-6">
            <h2 className="font-semibold text-lg">
              Description
            </h2>

            <p className="mt-2 text-slate-600 whitespace-pre-line">
              {job.description}
            </p>
          </div>
        )}

        {job.requirements && (
          <div className="mt-6">
            <h2 className="font-semibold text-lg">
              Requirements
            </h2>

            <p className="mt-2 text-slate-600 whitespace-pre-line">
              {job.requirements}
            </p>
          </div>
       )}

        {Array.isArray(job.required_skills) &&
          job.required_skills.length > 0 && (
            <div className="mt-6">

              <h2 className="font-semibold text-lg">
                Required Skills
              </h2>

              <div className="flex flex-wrap gap-2 mt-3">
                {job.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

            </div>
          )}
      </div>

      {/* Apply Now */}
{!alreadyApplied && (
  <div className="mt-6 pt-5 border-t border-slate-200 flex justify-end">
    <button
      type="button"
      onClick={() => navigate(`/app/jobs/${id}/apply`)}
      className="w-full sm:w-auto px-7 py-3 rounded-lg bg-brand-blue-600 text-white font-semibold hover:bg-brand-blue-700 transition-colors"
    >
      Apply Now
    </button>
  </div>
)}
       </div>
          </div>
  );
}
