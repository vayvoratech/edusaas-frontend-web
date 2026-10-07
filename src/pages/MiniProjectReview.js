import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getMyMiniProjects } from "../services/api";

export default function MiniProjectReview() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyMiniProjects();

        const selectedProject = Array.isArray(data)
          ? data.find((item) => item.id === projectId)
          : null;

        if (!selectedProject) {
          throw new Error("Mini project not found.");
        }

        setProject(selectedProject);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load mini project."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <div className="py-10 text-center text-sm text-slate-500">
            Loading submission details...
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Button
          variant="outline"
          onClick={() => navigate("/app/educator-assessments")}
        >
          ← Back
        </Button>

        <Card>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const submissions = project?.submissions || [];


  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {project.title}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {project.domainRole?.domain_name || "Domain not specified"}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate("/app/educator-assessments")}
        >
          ← Back
        </Button>
      </div>

      {/* Project information */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">
          Project Details
        </h3>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs text-slate-500">
              Problem Statement
            </p>
            <p className="text-sm text-slate-700 mt-1">
              {project.problem_statement || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Instructions
            </p>
            <p className="text-sm text-slate-700 mt-1">
              {project.instructions || "Not provided"}
            </p>
          </div>
        </div>
      </Card>

      {/* Submissions */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Student Submissions
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Review submitted projects and their analysis results.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {submissions.length} submission
            {submissions.length === 1 ? "" : "s"}
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-500">
              No students have submitted this mini project yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {submissions.map((submission) => {
              const analysis = submission.analysis;
              const plagiarism = analysis?.plagiarism_check;

              return (
                <div
                  key={submission.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  {/* Submission header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-4">
  <div>
    <h3 className="text-lg font-semibold text-slate-900">
      {submission.student?.name || "Unknown Student"}
    </h3>

    <p className="text-sm text-slate-500 mt-1">
      {submission.student?.email || "No email available"}
    </p>
  </div>

  <span className="text-xs font-medium rounded-full bg-slate-100 px-3 py-1 text-slate-600">
    Attempt {submission.attempt_number}
  </span>
</div>


                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        submission.status === "SUBMITTED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  {/* Repository */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                    <div>
                      <p className="text-xs text-slate-500">
                        Repository
                      </p>

                      <a
                        href={submission.repository_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {submission.repository_url}
                      </a>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Branch
                      </p>

                      <p className="text-sm text-slate-700 mt-1">
                        {submission.branch || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Commit
                      </p>

                      <p className="text-sm text-slate-700 mt-1 break-all">
                        {submission.commit_sha || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Submitted At
                      </p>

                      <p className="text-sm text-slate-700 mt-1">
                        {submission.submitted_at
                          ? new Date(
                              submission.submitted_at
                            ).toLocaleString()
                          : "—"}
                      </p>
                    </div>

                  </div>

                  {/* Analysis */}
                  <div className="mt-6 pt-5 border-t border-slate-200">
                    <h4 className="font-semibold text-slate-900">
                      Analysis
                    </h4>

                    {!analysis ? (
                      <p className="text-sm text-slate-500 mt-3">
                        Analysis has not started yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">

                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">
                            Analysis Status
                          </p>

                          <p className="font-semibold text-slate-900 mt-1">
                            {analysis.status || "—"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">
                            Mini Project Readiness
                          </p>

                          <p className="text-2xl font-bold text-blue-600 mt-1">
                            {analysis.readiness_score ?? "—"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">
                            Static Analysis
                          </p>

                          <p className="font-semibold text-slate-900 mt-1">
                            {analysis.static_analysis_status || "—"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">
                            Plagiarism Analysis
                          </p>

                          <p className="font-semibold text-slate-900 mt-1">
                            {analysis.plagiarism_status || "—"}
                          </p>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Plagiarism */}
                  {plagiarism && (
                    <div className="mt-6 pt-5 border-t border-slate-200">
                      <h4 className="font-semibold text-slate-900">
                        Plagiarism Analysis
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">

                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">
                            Status
                          </p>

                          <p className="font-semibold text-slate-900 mt-1">
                            {plagiarism.status || "—"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">
                            Highest Similarity
                          </p>

                          <p className="text-2xl font-bold text-slate-900 mt-1">
                            {plagiarism.highest_similarity ?? 0}%
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-500">
                            Comparisons
                          </p>

                          <p className="text-2xl font-bold text-slate-900 mt-1">
                            {plagiarism.comparison_count ?? 0}
                          </p>
                        </div>

                      </div>

                      {/* Matches */}
                      <div className="mt-5">
                        <p className="text-sm font-medium text-slate-700">
                          Matches
                        </p>

                        {plagiarism.matches?.length ? (
                          <div className="mt-3 space-y-3">
                          {plagiarism.matches.map((match) => {
  const matchedStudent = match.matched_student;

  const riskLevel = match.risk_level?.toUpperCase();

  const riskClass =
    riskLevel === "HIGH"
      ? "bg-red-100 text-red-700"
      : riskLevel === "MEDIUM"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <div
      key={match.id}
      className="rounded-xl border border-slate-200 p-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

        {/* Matched student */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {matchedStudent?.name || "Unknown Student"}
          </p>

          {matchedStudent?.email && (
            <p className="text-xs text-slate-500 mt-1">
              {matchedStudent.email}
            </p>
          )}

          <p className="text-xs text-slate-500 mt-2">
            Matched Submission
          </p>

          <p className="text-xs text-slate-400 mt-1 break-all">
            {match.matched_submission_id}
          </p>
        </div>

        {/* Similarity + risk */}
        <div className="flex items-center gap-3 shrink-0">

          <span className="text-lg font-bold text-slate-900">
            {match.similarity ?? 0}%
          </span>

          {riskLevel && (
            <span
              className={`text-xs font-medium rounded-full px-2.5 py-1 ${riskClass}`}
            >
              {riskLevel}
            </span>
          )}

        </div>
      </div>

      {/* Match information */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Similarity detected between this submission and the
          matched student's submission.
        </p>
      </div>
    </div>
  );
})}
                          </div>

                        ) : (
                           <p className="text-sm text-slate-500 mt-2">
    {plagiarism.comparison_count === 0
      ? "No comparison submissions were available for plagiarism analysis."
      : "No matching submissions were detected."}
  </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
