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
            String(
              application.job_id || application.job?.id
            ) === String(id)
        );

        setAlreadyApplied(applied);
      } catch (err) {
        console.error(
          "Failed to check application status:",
          err
        );
      }
    };

    checkApplication();
  }, [id]);

  const formatQualification = (qualification) => {
    const values = {
      bachelors: "Bachelor's Degree",
      masters: "Master's Degree",
      diploma: "Diploma",
      any: "Any Qualification",
    };

    return values[qualification] || qualification || "—";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isDeadlinePassed =
    job?.application_deadline &&
    new Date(job.application_deadline) < new Date();


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
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6 pb-10">

        {/* Back */}
        <button
          onClick={() => navigate("/app/dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
            text-sm font-medium text-slate-600
            bg-white border border-slate-200
            hover:bg-slate-50 hover:text-slate-900
            transition-all duration-200 shadow-sm"
        >
          Back to Dashboard
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === "open"
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {job.status === "open"
                    ? "Open"
                    : job.status}
                </span>

                {job.employment_type && (
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {job.employment_type}
                  </span>
                )}

                {job.work_mode && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    {job.work_mode}
                  </span>
                )}
              </div>
            </div>

            {job.location && (
              <div className="text-sm text-slate-500">
                📍 {job.location}
              </div>
            )}
          </div>
        </div>

        {/* About the Role */}
        {job.description && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              About the Role
            </h2>

            <p className="mt-3 text-slate-600 leading-7 whitespace-pre-line">
              {job.description}
            </p>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Roles & Responsibilities
            </h2>

            <p className="mt-3 text-slate-600 leading-7 whitespace-pre-line">
              {job.responsibilities}
            </p>
          </div>
        )}

        {/* Skills */}
        {(job.required_skills?.length > 0 ||
          job.preferred_skills?.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

            {job.required_skills?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Required Skills
                </h2>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.preferred_skills?.length > 0 && (
              <div
                className={
                  job.required_skills?.length > 0
                    ? "mt-6 pt-6 border-t border-slate-200"
                    : ""
                }
              >
                <h2 className="text-xl font-semibold text-slate-900">
                  Better-to-Have Skills
                </h2>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.preferred_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Eligibility & Job Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Eligibility & Job Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Qualification
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatQualification(job.qualification)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Eligible Branches / Degrees
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {Array.isArray(job.eligible_branches)
                  ? job.eligible_branches.join(", ")
                  : job.eligible_branches || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Employment Type
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {job.employment_type || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Work Mode
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {job.work_mode || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Location
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {job.location || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Salary / Compensation
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {job.salary || "Not specified"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Application Deadline
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {formatDate(job.application_deadline)}
              </p>
            </div>

          </div>
        </div>

        {/* Video Requirement */}
        {job.require_video && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Application Video
            </h2>

            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4">
              <p className="font-medium text-blue-800">
                🎥 Video introduction required
              </p>

              {job.video_max_duration && (
                <p className="mt-1 text-sm text-blue-700">
                  Maximum duration: {job.video_max_duration} seconds
                </p>
              )}

              {job.video_prompt && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Employer's Prompt
                  </p>

                  <p className="mt-1 text-sm text-blue-800 whitespace-pre-line">
                    {job.video_prompt}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apply Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

          {alreadyApplied ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-green-700">
                  ✓ Already Applied
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  You have already submitted an application for this job.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/app/job-applications")
                }
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View Application
              </button>
            </div>
          ) : isDeadlinePassed ? (
            <div>
              <p className="font-semibold text-red-600">
                Application Closed
              </p>
              <p className="text-sm text-slate-500 mt-1">
                The application deadline has passed.
              </p>
            </div>
          ) : job.status !== "open" ? (
            <div>
              <p className="font-semibold text-slate-700">
                Applications are currently closed.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">
                  Do you Interested in this opportunity?
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Please Review all requirements above before applying.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(`/app/jobs/${id}/apply`)
                }
                className="w-full sm:w-auto px-7 py-3 rounded-lg bg-brand-blue-600 text-white font-semibold hover:bg-brand-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}