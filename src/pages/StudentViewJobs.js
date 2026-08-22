import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getJobById,
  getUserProfile,
  applyJob,
} from "../services/api";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [error, setError] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [additionalInformation, setAdditionalInformation] = useState("");

  useEffect(() => {
    const loadJobAndProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const user = JSON.parse(localStorage.getItem("edu_user"));

        if (!user?.id) {
          throw new Error("Unable to identify the logged-in student.");
        }

        const [jobData, profileData] = await Promise.all([
          getJobById(id),
          getUserProfile(user.id),
        ]);

        setJob(jobData);
        setProfile(profileData);
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

    loadJobAndProfile();
  }, [id]);

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setResume(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, DOC, or DOCX resume.");
      event.target.value = "";
      setResume(null);
      return;
    }

    setError("");
    setResume(file);
  };

  

  const handleApply = async () => {
  try {
    setApplying(true);
    setApplicationMessage("");
    setError("");

    const profileResume = profile?.profile?.resume;

    if (!resume && !profileResume) {
      setError("Please upload a resume before applying.");
      return;
    }

    const applicationData = {
      profile: {
        name: profile?.name || "",
        email: profile?.email || "",
        institution: profile?.profile?.institution || "",
        company: profile?.profile?.company || "",
        career_goal: profile?.profile?.career_goal || "",
      },

      resume: resume
        ? {
            file_name: resume.name,
            file_type: resume.type,
          }
        : {
            file_name: profileResume.file_name,
            stored_name: profileResume.stored_name,
            file_type: profileResume.file_type,
            file_size: profileResume.file_size,
            url: profileResume.url,
          },

      cover_letter: coverLetter.trim(),

      additional_information:
        additionalInformation.trim(),
    };

    console.log("APPLICATION DATA:", applicationData);

    await applyJob(id, {
      application_data: applicationData,
    });

    setApplicationMessage(
      "Application submitted successfully!"
    );

    setResume(null);
    setCoverLetter("");
    setAdditionalInformation("");

  } catch (err) {
    setError(
      err.response?.data?.error ||
      err.message ||
      "Failed to apply for this job."
    );
  } finally {
    setApplying(false);
  }
};
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

      {/* Application Form */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-5">

        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Apply for this Job
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Your profile information will be included
            automatically with your application.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {applicationMessage && (
          <div className="mb-5 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
            {applicationMessage}
          </div>
        )}

        {/* Candidate Information */}
        <div className="space-y-4">

          <div>
            <h3 className="font-semibold text-slate-800 mb-3">
              Candidate Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>

                <input
                  value={profile?.name || ""}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>

                <input
                  value={profile?.email || ""}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Institution
                </label>

                <input
                  value={
                    profile?.profile?.institution || ""
                  }
                  readOnly
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company
                </label>

                <input
                  value={
                    profile?.profile?.company || ""
                  }
                  readOnly
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                />
              </div>

            </div>
          </div>

          {/* Career Goal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Career Goal
            </label>

            <textarea
              value={
                profile?.profile?.career_goal || ""
              }
              readOnly
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 resize-none"
            />
          </div>

          {/* Resume */}
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Resume
    <span className="text-red-500 ml-1">*</span>
  </label>

  {profile?.profile?.resume && !resume ? (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
          <span>📄</span>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">
            {profile.profile.resume.file_name}
          </p>

          <p className="text-xs text-slate-400">
            Using your profile resume
          </p>
        </div>
      </div>

      <label className="shrink-0 cursor-pointer">
        <span className="inline-flex px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-100">
          Replace
        </span>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeChange}
          className="hidden"
        />
      </label>
    </div>
  ) : (
    <>
      <label className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors">
        <span className="text-lg">📄</span>

        <div>
          <p className="text-sm font-medium text-slate-700">
            {resume ? resume.name : "Upload Resume"}
          </p>

          <p className="text-xs text-slate-400">
            PDF, DOC or DOCX · Max 5 MB
          </p>
        </div>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeChange}
          className="hidden"
        />
      </label>

      {resume && (
        <p className="mt-2 text-xs text-green-600">
          ✓ New resume selected: {resume.name}
        </p>
      )}

      {profile?.profile?.resume && resume && (
        <p className="mt-1 text-xs text-slate-400">
          This resume will be used instead of your profile resume for this application.
        </p>
      )}
    </>
  )}
</div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cover Letter
            </label>

            <textarea
              value={coverLetter}
              onChange={(e) =>
                setCoverLetter(e.target.value)
              }
              rows={6}
              placeholder="Tell the employer why you are a good fit for this position..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            />
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Additional Information
            </label>

            <textarea
              value={additionalInformation}
              onChange={(e) =>
                setAdditionalInformation(e.target.value)
              }
              rows={4}
              placeholder="Anything else you would like the employer to know..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            />
          </div>
 

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">

            <button
              type="button"
              onClick={handleApply}
              disabled={applying}
              className="w-full sm:w-auto px-7 py-3 rounded-lg bg-brand-blue-600 text-white font-semibold hover:bg-brand-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying
                ? "Submitting Application..."
                : "Submit Application"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}