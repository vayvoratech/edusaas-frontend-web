import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getJobById,
  getMyJobApplications,
} from "../services/api";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  GraduationCap,
  MapPin,
  PlayCircle,
  Send,
  Sparkles,
  Target,
  Users,
  Video,
  WalletCards,
  XCircle,
  Zap,
} from "lucide-react";

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

    return values[qualification] || qualification || "–";
  };

  const formatDate = (date) => {
    if (!date) return "–";

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
      <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Radiant background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-2xl shadow-blue-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25">
              <BriefcaseBusiness className="h-8 w-8 animate-pulse" />
            </div>

            <div className="mx-auto h-2.5 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400" />
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Loading job details...
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Please wait while we prepare the opportunity for you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-red-400/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-2xl items-center justify-center p-6">
          <div className="w-full rounded-3xl border border-red-200/70 bg-white/85 p-8 shadow-2xl shadow-red-900/10 backdrop-blur-xl dark:border-red-500/20 dark:bg-slate-900/85">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <CircleAlert className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                Unable to load this job
              </h2>

              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 px-5 py-4 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>

              <button
                onClick={() => navigate(-1)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 px-8 py-10 text-center shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <BriefcaseBusiness className="mx-auto h-12 w-12 text-slate-400" />

            <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">
              Job not found.
            </p>

            <button
              onClick={() => navigate(-1)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* =========================================================
          RADIANT BACKGROUND
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-20 h-[32rem] w-[32rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* =========================================================
            BACK
        ========================================================== */}
        <button
          onClick={() => navigate("/app/dashboard")}
          className="group inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/75 px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-x-0.5 hover:border-blue-200 hover:bg-white hover:text-blue-700 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </button>

        {/* =========================================================
            JOB HERO
        ========================================================== */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80">
          {/* Hero glow */}
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Career Opportunity
                </div>

                <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                  {job.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                      job.status === "open"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {job.status === "open" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}

                    {job.status === "open"
                      ? "Open"
                      : job.status}
                  </span>

                  {job.employment_type && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                      <BriefcaseBusiness className="h-3.5 w-3.5" />
                      {job.employment_type}
                    </span>
                  )}

                  {job.work_mode && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                      <Users className="h-3.5 w-3.5" />
                      {job.work_mode}
                    </span>
                  )}
                </div>
              </div>

              {job.location && (
                <div className="shrink-0 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20">
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Location
                      </p>
                      <p className="mt-0.5 max-w-[220px] text-sm font-bold text-slate-700 dark:text-slate-200">
                        {job.location}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick overview */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: GraduationCap,
                  label: "Qualification",
                  value: formatQualification(job.qualification),
                  gradient: "from-blue-500 to-indigo-600",
                },
                {
                  icon: WalletCards,
                  label: "Compensation",
                  value: job.salary || "Not specified",
                  gradient: "from-emerald-500 to-teal-600",
                },
                {
                  icon: MapPin,
                  label: "Work Location",
                  value: job.location || "–",
                  gradient: "from-violet-500 to-purple-600",
                },
                {
                  icon: CalendarClock,
                  label: "Deadline",
                  value: formatDate(job.application_deadline),
                  gradient: isDeadlinePassed
                    ? "from-red-500 to-rose-600"
                    : "from-amber-500 to-orange-600",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="group rounded-2xl border border-slate-200/80 bg-white/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.label}
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            ABOUT THE ROLE
        ========================================================== */}
        {job.description && (
          <section className="group rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 sm:p-8 dark:border-white/10 dark:bg-slate-900/80">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                <Target className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Opportunity Overview
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    About the Role
                  </h2>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="whitespace-pre-line text-[15px] leading-8 text-slate-600 dark:text-slate-300">
                    {job.description}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            RESPONSIBILITIES
        ========================================================== */}
        {job.responsibilities && (
          <section className="group rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/10 sm:p-8 dark:border-white/10 dark:bg-slate-900/80">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
                <Zap className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  What You'll Do
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  Roles & Responsibilities
                </h2>

                <div className="mt-5 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-blue-50/50 p-5 dark:border-violet-500/20 dark:from-violet-500/10 dark:to-blue-500/5">
                  <p className="whitespace-pre-line text-[15px] leading-8 text-slate-600 dark:text-slate-300">
                    {job.responsibilities}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            SKILLS
        ========================================================== */}
        {(job.required_skills?.length > 0 ||
          job.preferred_skills?.length > 0) && (
          <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-slate-900/80">
            <div className="mb-7 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Candidate Profile
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  Skills & Requirements
                </h2>
              </div>
            </div>

            {job.required_skills?.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    Required Skills
                  </h3>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    {job.required_skills.length} skills
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {job.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="group/skill inline-flex items-center gap-2 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50 to-indigo-50 px-3.5 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-blue-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 dark:text-blue-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 transition-transform group-hover/skill:scale-110" />
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
                    ? "mt-7 border-t border-slate-200 pt-7 dark:border-slate-700"
                    : ""
                }
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    Better-to-Have Skills
                  </h3>

                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    Optional
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {job.preferred_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-3.5 py-2 text-sm font-semibold text-amber-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-300"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* =========================================================
            ELIGIBILITY & JOB INFORMATION
        ========================================================== */}
        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-slate-900/80">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Candidate Eligibility
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                Eligibility & Job Details
              </h2>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                label: "Qualification",
                value: formatQualification(job.qualification),
                icon: GraduationCap,
                gradient: "from-blue-500 to-indigo-600",
              },
              {
                label: "Eligible Branches / Degrees",
                value: Array.isArray(job.eligible_branches)
                  ? job.eligible_branches.join(", ")
                  : job.eligible_branches || "–",
                icon: Target,
                gradient: "from-violet-500 to-purple-600",
              },
              {
                label: "Employment Type",
                value: job.employment_type || "–",
                icon: BriefcaseBusiness,
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                label: "Work Mode",
                value: job.work_mode || "–",
                icon: Users,
                gradient: "from-indigo-500 to-violet-600",
              },
              {
                label: "Location",
                value: job.location || "–",
                icon: MapPin,
                gradient: "from-emerald-500 to-teal-600",
              },
              {
                label: "Salary / Compensation",
                value: job.salary || "Not specified",
                icon: WalletCards,
                gradient: "from-amber-500 to-orange-600",
              },
              {
                label: "Application Deadline",
                value: formatDate(job.application_deadline),
                icon: CalendarClock,
                gradient: isDeadlinePassed
                  ? "from-red-500 to-rose-600"
                  : "from-pink-500 to-rose-600",
                wide: true,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`group rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg dark:border-slate-700 dark:from-slate-800/80 dark:to-slate-800/40 ${
                    item.wide ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-md`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.label}
                      </p>

                      <p
                        className={`mt-1 break-words font-bold ${
                          item.label === "Application Deadline" &&
                          isDeadlinePassed
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            VIDEO REQUIREMENT
        ========================================================== */}
        {job.require_video && (
          <section className="relative overflow-hidden rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 shadow-xl shadow-blue-900/5 backdrop-blur-xl sm:p-8 dark:border-blue-500/20 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-violet-500/10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                <Video className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Application Requirement
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  Application Video
                </h2>

                <div className="mt-5 rounded-2xl border border-blue-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-blue-500/20 dark:bg-slate-900/40">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <PlayCircle className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-bold text-blue-800 dark:text-blue-300">
                        Video introduction required
                      </p>

                      {job.video_max_duration && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                          <Clock3 className="h-3.5 w-3.5" />
                          Maximum duration:{" "}
                          {job.video_max_duration} seconds
                        </div>
                      )}
                    </div>
                  </div>

                  {job.video_prompt && (
                    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Employer's Prompt
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-blue-900 dark:text-blue-200">
                        {job.video_prompt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            APPLY SECTION
        ========================================================== */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/85">
          <div className="pointer-events-none absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            {alreadyApplied ? (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      Already Applied
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      You have already submitted an application for this job.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/app/job-applications")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  View Application
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : isDeadlinePassed ? (
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <Clock3 className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    Application Closed
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    The application deadline has passed.
                  </p>
                </div>
              </div>
            ) : job.status !== "open" ? (
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <XCircle className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    Applications are currently closed.
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Please check back later for updates.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25">
                    <Send className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      Interested in this opportunity?
                    </p>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Please review all requirements above before submitting
                      your application.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/app/jobs/${id}/apply`)
                  }
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-7 py-3.5 font-bold text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/30 sm:w-auto"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative flex items-center gap-2">
                    Apply Now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Bottom decorative line */}
        <div className="flex items-center justify-center gap-2 pb-3 pt-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-300 dark:to-blue-700" />
          <Sparkles className="h-4 w-4 text-blue-400" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-violet-300 dark:to-violet-700" />
        </div>
      </div>
    </div>
  );
}