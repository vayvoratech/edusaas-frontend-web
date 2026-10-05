
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  getMyMiniProjects,
  publishMiniProject,
} from "../services/api";

export default function EducatorAssessments() {
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="relative min-h-full overflow-hidden bg-[#f5f7fa] px-4 py-6 sm:px-6 lg:px-8">
        {/* Background atmosphere */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-100px] top-20 h-96 w-96 rounded-full bg-sky-200/25 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-140px] left-1/3 h-80 w-80 rounded-full bg-rose-200/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_25px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-slate-900 via-amber-500 to-sky-500">
              <div className="h-full w-1/3 animate-pulse bg-white/50" />
            </div>

            <div className="flex min-h-[270px] flex-col items-center justify-center px-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-2xl bg-amber-300/20" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-slate-900 to-slate-700 text-2xl text-white shadow-[0_12px_30px_rgba(15,23,42,0.20)]">
                  �‹
                </div>
              </div>

              <h3 className="text-xl font-black tracking-tight text-slate-900">
                Loading Assessments
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Preparing your assessment workspace...
              </p>

              <div className="mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#f5f7fa] px-4 py-6 pb-12 sm:px-6 lg:px-8">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-44 -top-44 h-[500px] w-[500px] rounded-full bg-amber-200/20 blur-3xl" />

        <div className="absolute right-[-180px] top-[-40px] h-[520px] w-[520px] rounded-full bg-sky-200/20 blur-3xl" />

        <div className="absolute bottom-[-200px] left-[20%] h-[500px] w-[500px] rounded-full bg-rose-200/15 blur-3xl" />

        <div className="absolute bottom-[5%] right-[12%] h-[280px] w-[280px] rounded-full bg-yellow-100/20 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(71,85,105,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(71,85,105,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "linear-gradient(to bottom, black 0%, transparent 82%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 82%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          {/* Decorative top band */}
          <div className="h-1.5 w-full bg-gradient-to-r from-slate-950 via-amber-500 to-sky-500" />

          {/* Decorative shapes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-amber-100/70 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[18%] bottom-[-100px] h-64 w-64 rounded-full bg-sky-100/60 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[40%] top-[-70px] h-40 w-40 rounded-full bg-rose-100/50 blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-7 p-6 sm:p-8 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.12)]" />

                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
                  Educator Workspace
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.7rem]">
                Assessments
                <span className="mx-2 font-light text-slate-300">
                  /
                </span>
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-amber-600 bg-clip-text text-transparent">
                  Mini Projects
                </span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                Create practical projects, publish assessments, and keep
                learner submissions organized in one workspace.
              </p>

              {/* Quick stats */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-xs text-white">
                    #
                  </span>

                  <span className="text-xs font-bold text-slate-600">
                    {projects.length}{" "}
                    {projects.length === 1
                      ? "Project"
                      : "Projects"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-xs font-black text-white">
                    âœ“
                  </span>

                  <span className="text-xs font-bold text-emerald-700">
                    {publishedCount} Published
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-xs font-black text-white">
                    âœŽ
                  </span>

                  <span className="text-xs font-bold text-amber-700">
                    {draftCount} Draft
                    {draftCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>

            {/* Create button */}
            <div className="shrink-0">
              <Button
                onClick={() =>
                  navigate("/app/educator-assessments/create")
                }
                className="!min-h-[50px] !rounded-2xl !border-0 !bg-slate-950 !px-5 !font-extrabold !text-white !shadow-[0_12px_30px_rgba(15,23,42,0.20)] transition-all duration-300 hover:!-translate-y-1 hover:!bg-slate-800 hover:!shadow-[0_18px_40px_rgba(15,23,42,0.25)]"
              >
                <span className="mr-2 text-lg text-amber-400">
                  ï¼‹
                </span>
                Create Mini Project
              </Button>
            </div>
          </div>
        </section>

        {/* =========================================================
            ERROR
        ========================================================= */}
        {error && (
          <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg font-black text-red-600">
                !
              </div>

              <div className="min-w-0">
                <p className="text-sm font-extrabold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 break-words text-sm leading-5 text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SUMMARY CARDS
        ========================================================= */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total */}
          <Card className="group !overflow-hidden !rounded-[1.6rem] !border-0 !bg-transparent !p-0 !shadow-none">
            <div className="relative min-h-[185px] overflow-hidden rounded-[1.6rem] border border-slate-200/90 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.11)]">
              {/* Accent */}
              <div className="absolute left-0 top-0 h-full w-1 bg-slate-900" />

              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-slate-100 blur-2xl transition-transform duration-500 group-hover:scale-125" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-2xl text-white shadow-[0_10px_25px_rgba(15,23,42,0.20)] transition-all duration-500 group-hover:rotate-2 group-hover:scale-110">
                    �‹
                  </div>

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Overview
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Total Mini Projects
                  </p>

                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-slate-950">
                      {projects.length}
                    </span>

                    <span className="mb-1 text-xs font-bold text-slate-400">
                      created
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Published */}
          <Card className="group !overflow-hidden !rounded-[1.6rem] !border-0 !bg-transparent !p-0 !shadow-none">
            <div className="relative min-h-[185px] overflow-hidden rounded-[1.6rem] border border-emerald-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(16,185,129,0.12)]">
              <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />

              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-50 blur-2xl transition-transform duration-500 group-hover:scale-125" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-2xl text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all duration-500 group-hover:-rotate-2 group-hover:scale-110">
                    �€
                  </div>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    Live
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Published
                  </p>

                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-emerald-600">
                      {publishedCount}
                    </span>

                    <span className="mb-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Submissions */}
          <Card className="group !overflow-hidden !rounded-[1.6rem] !border-0 !bg-transparent !p-0 !shadow-none">
            <div className="relative min-h-[185px] overflow-hidden rounded-[1.6rem] border border-sky-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(14,165,233,0.12)]">
              <div className="absolute left-0 top-0 h-full w-1 bg-sky-500" />

              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sky-50 blur-2xl transition-transform duration-500 group-hover:scale-125" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-2xl text-white shadow-[0_10px_25px_rgba(14,165,233,0.25)] transition-all duration-500 group-hover:rotate-2 group-hover:scale-110">
                    📤
                  </div>

                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700">
                    Learners
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Submissions
                  </p>

                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight text-sky-600">
                      {submissionCount}
                    </span>

                    <span className="mb-1 text-xs font-bold text-slate-400">
                      received
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* =========================================================
            PROJECTS
        ========================================================= */}
        <Card className="!overflow-hidden !rounded-[1.8rem] !border !border-slate-200/90 !bg-white !shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          {/* Section header */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-amber-50/40 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-lg text-white shadow-[0_8px_20px_rgba(15,23,42,0.16)]">
                  â—†
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900">
                    Mini Projects
                  </h3>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Manage and publish your practical learner assessments.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  {draftCount} Draft
                  {draftCount === 1 ? "" : "s"}
                </span>

                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  {publishedCount} Published
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* =====================================================
                EMPTY STATE
            ===================================================== */}
            {projects.length === 0 ? (
              <div className="relative overflow-hidden rounded-[1.6rem] border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 via-white to-amber-50/50 px-6 py-16 text-center">
                <div
                  aria-hidden="true"
                  className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-amber-100/60 blur-3xl"
                />

                <div
                  aria-hidden="true"
                  className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-sky-100/60 blur-3xl"
                />

                <div className="relative">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white text-4xl shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
                    🧩
                  </div>

                  <h4 className="mt-5 text-lg font-black text-slate-900">
                    No mini projects yet
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Create your first mini project and give learners a
                    practical opportunity to apply their skills.
                  </p>

                  <Button
                    className="mt-6 !rounded-xl !border-0 !bg-slate-950 !font-extrabold !text-white !shadow-lg transition-all hover:!-translate-y-0.5 hover:!bg-slate-800"
                    onClick={() =>
                      navigate("/app/educator-assessments/create")
                    }
                  >
                    <span className="mr-2 text-amber-400">
                      ï¼‹
                    </span>
                    Create Mini Project
                  </Button>
                </div>
              </div>
            ) : (
              /* =====================================================
                  PROJECT LIST
              ===================================================== */
              <div className="space-y-4">
                {projects.map((project) => {
                  const isPublished =
                    project.status === "PUBLISHED";

                  const isDraft =
                    project.status === "DRAFT";

                  const submissionTotal =
                    project.submissions?.length || 0;

                  return (
                    <div
                      key={project.id}
                      className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_7px_25px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)]"
                    >
                      {/* Status accent */}
                      <div
                        className={`absolute left-0 top-0 h-full w-1 ${
                          isPublished
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />

                      {/* Subtle hover background */}
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full blur-3xl opacity-0 transition-all duration-500 group-hover:translate-x-4 group-hover:translate-y-0 group-hover:opacity-100 ${
                          isPublished
                            ? "bg-emerald-100"
                            : "bg-amber-100"
                        }`}
                      />

                      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        {/* Project information */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg text-white shadow-sm transition-all duration-300 group-hover:scale-105 ${
                                isPublished
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            >
                              {isPublished ? "�€" : "📝"}
                            </div>

                            <h4 className="min-w-0 break-words text-base font-black tracking-tight text-slate-900 sm:text-lg">
                              {project.title}
                            </h4>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                                isPublished
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border border-amber-200 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>

                          {/* Domain */}
                          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-black text-slate-700 shadow-sm">
                              â—ˆ
                            </span>

                            <span className="text-sm font-bold text-slate-600">
                              {project.domainRole?.domain_name ||
                                "Domain not specified"}
                            </span>
                          </div>

                          {/* Problem statement */}
                          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 line-clamp-2">
                            {project.problem_statement}
                          </p>

                          {/* Metadata */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">
                              <span>📤</span>

                              {submissionTotal}{" "}
                              {submissionTotal === 1
                                ? "Submission"
                                : "Submissions"}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
                              <span>â°</span>

                              {project.due_at
                                ? new Date(
                                    project.due_at
                                  ).toLocaleString()
                                : "No deadline"}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-2 lg:pt-1">
                          {isDraft && (
                            <Button
                              variant="outline"
                              disabled={
                                publishingId === project.id
                              }
                              onClick={() =>
                                handlePublish(project)
                              }
                              className="!min-h-[42px] !rounded-xl !border-emerald-200 !bg-emerald-50 !font-extrabold !text-emerald-700 transition-all hover:!border-emerald-300 hover:!bg-emerald-100 hover:!text-emerald-800 hover:!shadow-md"
                            >
                              {publishingId === project.id ? (
                                <>
                                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />

                                  Publishing...
                                </>
                              ) : (
                                <>
                                  <span className="mr-2">
                                    �€
                                  </span>

                                  Publish
                                </>
                              )}
                            </Button>
                          )}

                          {isPublished && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                navigate(
                                  "/app/educator-assessments/create"
                                );
                              }}
                              className="!min-h-[42px] !rounded-xl !border-slate-200 !bg-slate-50 !font-extrabold !text-slate-700 transition-all hover:!border-slate-300 hover:!bg-slate-100 hover:!text-slate-900 hover:!shadow-md"
                            >
                              <span className="mr-2">
                                👁
                              </span>

                              View
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Bottom project status */}
                      <div className="relative mt-5 border-t border-slate-100 pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                            Assessment Status
                          </span>

                          <span
                            className={`text-xs font-bold ${
                              isPublished
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            {isPublished
                              ? "Available to learners"
                              : "Ready to be published"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* =========================================================
            FOOTER INSIGHT
        ========================================================= */}
        {projects.length > 0 && (
          <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-800 bg-slate-950 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.15)]">
            {/* Decorative lights */}
            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-lg text-amber-300">
                  âœ¦
                </div>

                <div>
                  <p className="text-sm font-extrabold text-white">
                    Assessment workspace
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Keep projects organized, publish them when ready,
                    and monitor learner submissions.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black text-amber-300">
                  {draftCount} DRAFT
                </span>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black text-emerald-300">
                  {publishedCount} LIVE
                </span>

                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-[10px] font-black text-sky-300">
                  {submissionCount} SUBMISSIONS
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

