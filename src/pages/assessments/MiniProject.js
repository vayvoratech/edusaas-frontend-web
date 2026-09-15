import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  getCurrentMiniProject,
  getMiniProjectSubmissions,
  submitMiniProject,
} from "../../services/api";


export default function MiniProject({ onBack }) {
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [branch, setBranch] = useState("main");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);



  useEffect(() => {
    const loadMiniProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const project = await getCurrentMiniProject();
        setAssignment(project);

        try {
          const submissions = await getMiniProjectSubmissions(project.id);

          if (Array.isArray(submissions) && submissions.length > 0) {
            setSubmission(submissions[0]);
          }
        } catch (submissionError) {
          console.error(
            "Failed to load mini project submission:",
            submissionError
          );
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setAssignment(null);
        } else {
          setError(
            err.response?.data?.error ||
              err.message ||
              "Failed to load mini project."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadMiniProject();
  }, []);

  const handleSubmit = async () => {
    if (
      !assignment ||
      !repositoryUrl.trim() ||
      submitting ||
      submission
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const result = await submitMiniProject(
        assignment.id,
        repositoryUrl.trim(),
        branch.trim() || "main"
      );

      const submittedData = result?.data || result;

      setSubmission(submittedData);

      setSuccess(
        "Your GitHub repository has been submitted successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to submit mini project."
      );
    } finally {
      setSubmitting(false);
    }
  };


  const formatDeadline = (date) => {
    if (!date) return "No deadline specified";

    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading mini project...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <div className="py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <Button
              variant="outline"
              className="mt-4"
              onClick={onBack}
            >
              Back to Assessments
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <div className="py-10 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No Mini Project Available
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Your educator has not assigned a mini project yet.
            </p>

            <Button
              variant="outline"
              className="mt-5"
              onClick={onBack}
            >
              Back to Assessments
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to Assessments
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              📁
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Mini Project
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Build, package, and submit your assigned project.
              </p>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold ${
            submission
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
              : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              submission ? "bg-emerald-500" : "bg-blue-500"
            }`}
          />

          {submission ? "Submitted" : "Ready to submit"}
        </span>
      </div>

      {/* Project Hero */}
      <Card>
        <div className="overflow-hidden rounded-xl border border-slate-200">

          {/* 1. Project hero gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

              <div className="max-w-3xl">
                {/* 2. Hero label update */}
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                  Assigned Mini Project
                </p>

                <h3 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {assignment.title}
                </h3>

                {/* 3. Domain badge update */}
                {assignment.domainRole?.domain_name && (
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    {assignment.domainRole.domain_name}
                  </span>
                )}
              </div>

              {/* 4. Deadline box update */}
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 md:min-w-[210px]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Submission deadline
                </p>

                <p className="mt-1.5 text-sm font-semibold text-white">
                  {formatDeadline(assignment.due_at)}
                </p>
              </div>

            </div>
          </div>

          <div className="grid gap-0 border-t border-slate-200 sm:grid-cols-3">

            <div className="px-5 py-4 sm:border-r sm:border-slate-200">
              <p className="text-xs text-slate-500">
                Project type
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Practical assessment
              </p>
            </div>

            <div className="px-5 py-4 sm:border-r sm:border-slate-200">
              <p className="text-xs text-slate-500">
                Submission format
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                GitHub Repository
              </p>
            </div>

            <div className="px-5 py-4">
              <p className="text-xs text-slate-500">
                Submission limit
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                1 attempt
              </p>
            </div>

          </div>
        </div>
      </Card>

      {/* Problem + Requirements */}
      <div className="grid gap-6 lg:grid-cols-[1.55fr_0.9fr]">

        <Card>

          <div>
            <h3 className="font-semibold text-slate-900">
              Problem Statement
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              What you are expected to build
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 px-5 py-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {assignment.problem_statement}
              </p>
            </div>
          </div>

          {assignment.instructions && (
            <div className="mt-7 border-t border-slate-100 pt-7">

              <h3 className="font-semibold text-slate-900">
                Instructions
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Important details from your educator
              </p>

              {/* 6. Instructions box update */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {assignment.instructions}
                </p>
              </div>

            </div>
          )}

        </Card>

        {/* Requirements */}
        <Card>
          <h3 className="font-semibold text-slate-900">
            Submission Requirements
          </h3>

          <div className="mt-5 space-y-3">

            <div className="rounded-xl border border-slate-200 p-3.5">
              <p className="text-sm font-medium text-slate-800">
                GitHub repository
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Submit the GitHub repository containing your complete project.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5">
              <p className="text-sm font-medium text-slate-800">
                Final branch
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Select the branch containing your final project submission.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5">
              <p className="text-sm font-medium text-slate-800">
                One submission
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Review your repository carefully before submitting.
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                Before you submit
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                Make sure your GitHub repository contains the complete final project
                and that the selected branch is ready for evaluation. You cannot
                submit another attempt afterward.
              </p>
            </div>

          </div>
        </Card>

      </div>

      {/* Submission */}
      <Card>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Project Submission
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {submission
                ? "Your project has been received."
                : "Submit the GitHub repository for your final project."}
            </p>
          </div>

          {!submission && (
            <span className="text-xs font-medium text-slate-400">
              GitHub Repository
            </span>
          )}

        </div>

        {submission ? (
          <div className="mt-6 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50">
            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">
                    Project Submitted
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Your mini project has been successfully submitted for evaluation.
                  </p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                Submission received
              </span>
            </div>
            <div className="border-t border-emerald-200 bg-white/60 px-5 py-4">

              {submission.submitted_at && (
                <p className="text-xs text-slate-600">
                  Submitted on{" "}
                  <span className="font-semibold text-slate-800">
                    {new Date(
                      submission.submitted_at
                    ).toLocaleString()}
                  </span>
                </p>
              )}

              <p className="mt-1 text-xs text-slate-500">
                No further submissions are allowed for this project.
              </p>

              {submission.repository_url && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Repository
                  </p>

                  <a
                    href={submission.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all text-sm font-medium text-blue-600 hover:underline"
                  >
                    {submission.repository_url}
                  </a>
                </div>
              )}

              {submission.branch && (
                <p className="mt-3 text-xs text-slate-600">
                  Branch:{" "}
                  <span className="font-semibold text-slate-800">
                    {submission.branch}
                  </span>
                </p>
              )}

              {submission.commit_sha && (
                <p className="mt-2 text-xs text-slate-600">
                  Commit:{" "}
                  <span className="font-mono font-semibold text-slate-800">
                    {submission.commit_sha.substring(0, 12)}
                  </span>
                </p>
              )}

            </div>
          </div>
        ) : (
           <>
            <div className="mt-6 space-y-5">

              {/* GitHub Repository URL */}
              <div>
                <label
                  htmlFor="repository-url"
                  className="block text-sm font-semibold text-slate-800"
                >
                  GitHub Repository URL
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Enter the URL of the GitHub repository containing your final project.
                </p>

                <input
                  id="repository-url"
                  type="url"
                  value={repositoryUrl}
                  onChange={(event) => {
                    setRepositoryUrl(event.target.value);
                    setError(null);
                    setSuccess(null);
                  }}
                  placeholder="https://github.com/username/project"
                  disabled={submitting}
                  className="mt-3 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* Branch */}
              <div>
                <label
                  htmlFor="repository-branch"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Branch
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Enter the branch containing your final project. Defaults to main.
                </p>

                <input
                  id="repository-branch"
                  type="text"
                  value={branch}
                  onChange={(event) => {
                    setBranch(event.target.value);
                    setError(null);
                    setSuccess(null);
                  }}
                  placeholder="main"
                  disabled={submitting}
                  className="mt-3 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs leading-5 text-slate-400">
                Verify your repository and branch before submitting. Only one
                submission is permitted.
              </p>

              <Button
                onClick={handleSubmit}
                disabled={!repositoryUrl.trim() || submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? "Submitting..." : "Submit Project"}
              </Button>

            </div>
          </>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-800">
              {success}
            </p>
          </div>
        )}

      </Card>
    </div>
  );
}