import React, { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom"
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  getMyMiniProjects,
  publishMiniProject,
} from "../services/api";

export default function EducatorAssessments() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getMyMiniProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to load mini projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handlePublish = async (project) => {
    try {
      setPublishingId(project.id);
      setError(null);

      await publishMiniProject(
        project.id,
        project.due_at || null
      );

      await loadProjects();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to publish mini project."
      );
    } finally {
      setPublishingId(null);
    }
  };

  const publishedCount = projects.filter(
    (project) => project.status === "PUBLISHED"
  ).length;

  const draftCount = projects.filter(
    (project) => project.status === "DRAFT"
  ).length;

  const submissionCount = projects.reduce(
    (total, project) =>
      total + (project.submissions?.length || 0),
    0
  );

  const publishedProjects = projects.filter(
  (project) => project.status === "PUBLISHED"
);

const submittedProjects = publishedProjects.filter(
  (project) => (project.submissions?.length || 0) > 0
);


  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <div className="py-10 text-center text-sm text-slate-500">
            Loading mini projects...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Assessments
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Create and manage mini projects for learners.
          </p>
        </div>

        <Button
          onClick={() => navigate("/app/educator-assessments/create")}
        >
          + Create Mini Project
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Card>
          <p className="text-xs text-slate-500">
            Total Mini Projects
          </p>

          <p className="text-3xl font-bold text-slate-900 mt-1">
            {projects.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-slate-500">
            Published
          </p>

          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {publishedCount}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-slate-500">
            Submissions
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-1">
            {submissionCount}
          </p>
        </Card>

      </div>

      {/* Submissions to Review */}
<Card>
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">
        Submitted Projects
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        Review student submissions and their analysis results.
      </p>
    </div>

    <span className="text-sm text-slate-500">
      {submittedProjects.length} project
      {submittedProjects.length === 1 ? "" : "s"}
    </span>
  </div>

  {submittedProjects.length === 0 ? (
    <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <p className="text-sm font-medium text-slate-700">
        No student submissions yet
      </p>

      <p className="text-sm text-slate-500 mt-1">
        Submitted projects will appear here when students complete their work.
      </p>
    </div>
  ) : (
    <div className="mt-5 space-y-4">
      {submittedProjects.map((project) => {
        const submissions = project.submissions || [];

        const latestSubmission = submissions[0];

        const latestAnalysis = latestSubmission?.analysis;

        return (
          <div
            key={project.id}
            className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

              {/* Project information */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    {project.title}
                  </h4>

                  <span className="text-xs font-medium rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700">
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  {project.domainRole?.domain_name ||
                    "Domain not specified"}
                </p>

                <p className="text-sm text-slate-600 mt-3">
                  {submissions.length} student submission
                  {submissions.length === 1 ? "" : "s"}
                </p>

                {latestSubmission?.student && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500">
                      Latest Submission
                    </p>

                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {latestSubmission.student.name ||
                        "Unknown Student"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {latestSubmission.student.email ||
                        "No email available"}
                    </p>
                  </div>
                )}
              </div>

              {/* Analysis summary */}
              <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Analysis
                  </p>

                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {latestAnalysis?.status || "Pending"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Readiness
                  </p>

                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    {latestAnalysis?.readiness_score ?? "—"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Plagiarism
                  </p>

                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {latestAnalysis?.plagiarism_status || "Pending"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Submissions
                  </p>

                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {submissions.length}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                <Button
                  onClick={() =>
                    navigate(
                      `/app/educator-assessments/${project.id}`
                    )
                  }
                >
                  Review
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )}
</Card>

      {/* Projects */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Published Projects
           </h3>

           <p className="text-sm text-slate-500 mt-1">
              Projects currently published and available to learners.
           </p>
          </div>

          <span className="text-xs text-slate-500">
                 {publishedProjects.length} project
                 {publishedProjects.length === 1 ? "" : "s"}
           </span>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-300 rounded-xl">
            <h4 className="font-semibold text-slate-900">
              No mini projects yet
            </h4>

            <p className="text-sm text-slate-500 mt-1">
              Create your first mini project for learners.
            </p>

            <Button
              className="mt-4"
              onClick={() =>
                navigate("/app/educator-assessments/create")
              }
            >
              Create Mini Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {publishedProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {project.title}
                      </h4>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          project.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      {project.domainRole?.domain_name ||
                        "Domain not specified"}
                    </p>

                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                      {project.problem_statement}
                    </p>

                   <div className="flex flex-wrap items-center gap-3 mt-4">

  <span className="text-sm text-slate-600">
    {project.submissions?.length || 0} submission
    {(project.submissions?.length || 0) === 1 ? "" : "s"}
  </span>

  {(project.submissions?.length || 0) > 0 ? (
    <span className="text-xs font-medium rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">
      Student work received
    </span>
  ) : (
    <span className="text-xs font-medium rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">
      Awaiting submissions
    </span>
  )}

  <span className="text-xs text-slate-500">
    Due:{" "}
    {project.due_at
      ? new Date(project.due_at).toLocaleString()
      : "No deadline"}
  </span>

</div>
                  </div>

                  <div className="flex gap-2 shrink-0">

                    {project.status === "DRAFT" && (
                      <Button
                        variant="outline"
                        disabled={
                          publishingId === project.id
                        }
                        onClick={() =>
                          handlePublish(project)
                        }
                      >
                        {publishingId === project.id
                          ? "Publishing..."
                          : "Publish"}
                      </Button>
                    )}

                   {project.status === "PUBLISHED" && (
               <Button
              variant="outline"
             onClick={() => {
             navigate(`/app/educator-assessments/${project.id}`);
             }}
            >
               View
             </Button>
              )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
{draftCount > 0 && (
  <Card>
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Drafts
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          Projects that are not yet published to learners.
        </p>
      </div>

      <span className="text-xs text-slate-500">
        {draftCount} draft{draftCount === 1 ? "" : "s"}
      </span>
    </div>

    <div className="space-y-4">
      {projects
        .filter((project) => project.status === "DRAFT")
        .map((project) => (
          <div
            key={project.id}
            className="rounded-xl border border-slate-200 p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-slate-900">
                    {project.title}
                  </h4>

                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                    DRAFT
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  {project.domainRole?.domain_name ||
                    "Domain not specified"}
                </p>

                <p className="text-sm text-slate-600 mt-3">
                  {project.problem_statement}
                </p>
              </div>

              <Button
                variant="outline"
                disabled={publishingId === project.id}
                onClick={() => handlePublish(project)}
              >
                {publishingId === project.id
                  ? "Publishing..."
                  : "Publish"}
              </Button>

            </div>
          </div>
        ))}
    </div>
  </Card>
)}

    </div>
  );
}
