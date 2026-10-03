import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

import {
  getCurrentMiniProject,
  getMiniProjectSubmissions,
  submitMiniProject,
} from "../../services/api";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  FileCode2,
  FolderGit2,
  GitBranch,
  Info,
  Layers3,
  Lock,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  UploadCloud,
  XCircle,
} from "lucide-react";

/*
 * GitHub icon
 *
 * Your installed lucide-react version does not export "Github".
 * So we keep GitBranch from lucide-react and use this local
 * GitHub SVG icon instead.
 */
const Github = ({
  size = 20,
  strokeWidth = 2,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.466-1.11-1.466-.908-.621.069-.609.069-.609 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.91.832.091-.647.349-1.087.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.682-.103-.252-.446-1.268.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 7.305c.85.004 1.705.115 2.505.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.379.202 2.395.1 2.647.64.698 1.028 1.591 1.028 2.682 0 3.842-2.338 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.337-.012 2.415-.012 2.744 0 .267.18.578.688.48A10.001 10.001 0 0 0 22 12C22 6.477 17.523 2 12 2Z"
    />
    <path
      d="M8.5 18.5c-.1.1-.2.2-.3.3"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      opacity="0"
    />
  </svg>
);

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
          const submissions =
            await getMiniProjectSubmissions(
              project.id
            );

          if (
            Array.isArray(submissions) &&
            submissions.length > 0
          ) {
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

      const submittedData =
        result?.data || result;

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

  /* =========================================================
     LOADING
  ========================================================= */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl" />

          <Card>
            <div className="relative flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div
                  className="
                    h-16
                    w-16
                    rounded-2xl
                    bg-gradient-to-br
                    from-blue-500
                    via-indigo-500
                    to-violet-600
                    grid
                    place-items-center
                    shadow-[0_12px_35px_rgba(79,70,229,0.25)]
                  "
                >
                  <FolderGit2
                    size={27}
                    className="text-white"
                  />
                </div>

                <span
                  className="
                    absolute
                    -right-1
                    -bottom-1
                    w-5
                    h-5
                    rounded-full
                    border-2
                    border-white
                    dark:border-slate-900
                    border-t-transparent
                    animate-spin
                    bg-transparent
                  "
                />
              </div>

              <p className="mt-5 text-sm font-bold text-slate-700 dark:text-slate-200">
                Loading mini project...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Preparing your assignment
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */
  if (error && !assignment) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <Card>
            <div className="relative overflow-hidden py-12 px-6 text-center">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-red-500/10 blur-3xl" />

              <div
                className="
                  relative
                  mx-auto
                  w-16
                  h-16
                  rounded-2xl
                  bg-gradient-to-br
                  from-red-500/15
                  to-rose-500/15
                  text-red-500
                  grid
                  place-items-center
                  border
                  border-red-200/60
                  dark:border-red-500/20
                "
              >
                <TriangleAlert size={27} />
              </div>

              <h3 className="relative mt-5 text-lg font-extrabold text-slate-900 dark:text-white">
                Unable to load project
              </h3>

              <p className="relative mt-2 text-sm leading-6 text-red-600 dark:text-red-400">
                {error}
              </p>

              <Button
                variant="outline"
                className="mt-6"
                onClick={onBack}
              >
                <ArrowLeft size={15} />
                Back to Assessments
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* =========================================================
     NO PROJECT
  ========================================================= */
  if (!assignment) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <Card>
            <div className="relative overflow-hidden py-12 px-6 text-center">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl" />

              <div
                className="
                  relative
                  mx-auto
                  w-16
                  h-16
                  rounded-2xl
                  bg-gradient-to-br
                  from-blue-500/10
                  to-violet-500/10
                  text-blue-600
                  dark:text-blue-400
                  grid
                  place-items-center
                  border
                  border-blue-200/60
                  dark:border-blue-500/20
                "
              >
                <FolderGit2 size={27} />
              </div>

              <h3 className="relative mt-5 text-xl font-extrabold text-slate-900 dark:text-white">
                No Mini Project Available
              </h3>

              <p className="relative mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your educator has not assigned a mini project yet.
              </p>

              <Button
                variant="outline"
                className="mt-6"
                onClick={onBack}
              >
                <ArrowLeft size={15} />
                Back to Assessments
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-7 pb-10">

      {/* =====================================================
          PAGE BACKGROUND GLOW
      ===================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="
            absolute
            top-20
            left-[10%]
            w-72
            h-72
            rounded-full
            bg-blue-500/[0.05]
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            top-[35%]
            right-[5%]
            w-80
            h-80
            rounded-full
            bg-violet-500/[0.05]
            blur-[110px]
          "
        />

        <div
          className="
            absolute
            bottom-10
            left-[40%]
            w-64
            h-64
            rounded-full
            bg-cyan-500/[0.04]
            blur-[100px]
          "
        />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="
              group
              mb-4
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-2.5
              py-1.5
              text-sm
              font-semibold
              text-slate-500
              dark:text-slate-400
              hover:text-blue-600
              dark:hover:text-blue-400
              hover:bg-blue-500/[0.06]
              transition-all
            "
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-0.5 transition-transform"
            />

            Back to Assessments
          </button>

          <div className="flex items-center gap-3.5">
            <div
              className="
                relative
                w-12
                h-12
                rounded-2xl
                p-[1.5px]
                bg-gradient-to-br
                from-blue-500
                via-indigo-500
                to-violet-600
                shadow-[0_9px_28px_rgba(79,70,229,0.20)]
              "
            >
              <div
                className="
                  w-full
                  h-full
                  rounded-[14px]
                  bg-white
                  dark:bg-slate-950
                  text-blue-600
                  dark:text-blue-400
                  grid
                  place-items-center
                "
              >
                <FolderGit2 size={21} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="
                    text-2xl
                    font-extrabold
                    tracking-tight
                    text-slate-900
                    dark:text-white
                  "
                >
                  Mini Project
                </h2>

                <span
                  className="
                    hidden
                    sm:inline-flex
                    items-center
                    gap-1
                    rounded-full
                    bg-gradient-to-r
                    from-blue-500/10
                    to-violet-500/10
                    px-2.5
                    py-1
                    text-[9px]
                    font-extrabold
                    uppercase
                    tracking-wider
                    text-blue-600
                    dark:text-blue-400
                    border
                    border-blue-500/10
                  "
                >
                  <Sparkles size={10} />
                  Practical
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Build, package, and submit your assigned project.
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div
          className={`
            relative
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-2xl
            px-4
            py-2.5
            text-xs
            font-bold
            border
            shadow-sm
            ${
              submission
                ? `
                  bg-gradient-to-r
                  from-emerald-500/10
                  to-teal-500/10
                  text-emerald-700
                  dark:text-emerald-400
                  border-emerald-200/70
                  dark:border-emerald-500/20
                `
                : `
                  bg-gradient-to-r
                  from-blue-500/10
                  to-violet-500/10
                  text-blue-700
                  dark:text-blue-400
                  border-blue-200/70
                  dark:border-blue-500/20
                `
            }
          `}
        >
          <span
            className={`
              relative
              w-2
              h-2
              rounded-full
              ${
                submission
                  ? "bg-emerald-500"
                  : "bg-blue-500"
              }
            `}
          >
            {!submission && (
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-60" />
            )}
          </span>

          {submission
            ? "Submitted"
            : "Ready to submit"}
        </div>
      </div>

      {/* =====================================================
          PROJECT HERO
      ===================================================== */}
      <Card>
        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/20
            dark:border-white/10
            shadow-[0_20px_60px_rgba(30,64,175,0.12)]
          "
        >
          {/* Hero Background */}
          <div
            className="
              relative
              overflow-hidden
              bg-gradient-to-br
              from-blue-600
              via-indigo-600
              to-violet-700
              px-6
              py-8
              sm:px-8
              sm:py-9
            "
          >
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-28 left-[25%] w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="absolute top-10 right-[30%] w-20 h-20 rounded-full bg-white/5 blur-xl" />

            {/* Grid pattern */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                opacity-[0.06]
              "
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize:
                  "28px 28px",
              }}
            />

            <div className="relative flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2">
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-white/10
                      border
                      border-white/15
                      px-3
                      py-1.5
                      text-[10px]
                      font-extrabold
                      uppercase
                      tracking-[0.14em]
                      text-blue-100
                      backdrop-blur-md
                    "
                  >
                    <Target size={11} />
                    Assigned Mini Project
                  </span>
                </div>

                <h3
                  className="
                    mt-4
                    text-2xl
                    font-extrabold
                    leading-tight
                    tracking-tight
                    text-white
                    sm:text-3xl
                  "
                >
                  {assignment.title}
                </h3>

                {assignment.domainRole?.domain_name && (
                  <div
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-white/10
                      border
                      border-white/15
                      px-3.5
                      py-2
                      text-xs
                      font-semibold
                      text-white
                      backdrop-blur-md
                    "
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />

                    {assignment.domainRole.domain_name}
                  </div>
                )}
              </div>

              {/* Deadline */}
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/15
                  bg-white/10
                  px-5
                  py-4
                  backdrop-blur-xl
                  md:min-w-[225px]
                  shadow-[0_12px_30px_rgba(15,23,42,0.12)]
                "
              >
                <div className="flex items-center gap-2 text-blue-100">
                  <Clock3 size={14} />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
                    Submission deadline
                  </p>
                </div>

                <p className="mt-2 text-sm font-bold text-white">
                  {formatDeadline(
                    assignment.due_at
                  )}
                </p>

                <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-300 to-white/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div
            className="
              grid
              gap-0
              bg-white
              dark:bg-slate-950
              sm:grid-cols-3
            "
          >
            <div className="group px-5 py-5 sm:border-r border-slate-100 dark:border-slate-800 hover:bg-blue-500/[0.025] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center">
                  <Layers3 size={14} />
                </div>

                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Project type
                </p>
              </div>

              <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                Practical assessment
              </p>
            </div>

            <div className="group px-5 py-5 sm:border-r border-slate-100 dark:border-slate-800 hover:bg-cyan-500/[0.025] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 grid place-items-center">
                  <Github size={15} />
                </div>

                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Submission format
                </p>
              </div>

              <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                GitHub Repository
              </p>
            </div>

            <div className="group px-5 py-5 hover:bg-violet-500/[0.025] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 grid place-items-center">
                  <ShieldCheck size={15} />
                </div>

                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Submission limit
                </p>
              </div>

              <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                1 attempt
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* =====================================================
          PROBLEM + REQUIREMENTS
      ===================================================== */}
      <div className="grid gap-6 lg:grid-cols-[1.55fr_0.9fr]">

        {/* Problem */}
        <Card>
          <div>
            <div className="flex items-start gap-3">
              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-gradient-to-br
                  from-blue-500/10
                  to-indigo-500/10
                  text-blue-600
                  dark:text-blue-400
                  grid
                  place-items-center
                  shrink-0
                "
              >
                <FileCode2 size={18} />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white">
                  Problem Statement
                </h3>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  What you are expected to build
                </p>
              </div>
            </div>

            <div
              className="
                mt-5
                relative
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                dark:border-slate-800
                bg-gradient-to-br
                from-slate-50
                via-white
                to-blue-50/40
                dark:from-slate-900
                dark:via-slate-950
                dark:to-blue-950/20
                px-5
                py-5
              "
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-violet-500" />

              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                {assignment.problem_statement}
              </p>
            </div>
          </div>

          {assignment.instructions && (
            <div className="mt-7 border-t border-slate-100 dark:border-slate-800 pt-7">
              <div className="flex items-start gap-3">
                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-gradient-to-br
                    from-violet-500/10
                    to-fuchsia-500/10
                    text-violet-600
                    dark:text-violet-400
                    grid
                    place-items-center
                    shrink-0
                  "
                >
                  <BookOpen size={18} />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white">
                    Instructions
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Important details from your educator
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-violet-200/60
                  dark:border-violet-500/15
                  bg-gradient-to-br
                  from-violet-50/70
                  to-fuchsia-50/30
                  dark:from-violet-950/20
                  dark:to-fuchsia-950/10
                  px-5
                  py-5
                "
              >
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {assignment.instructions}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Requirements */}
        <Card>
          <div className="flex items-start gap-3">
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-gradient-to-br
                from-emerald-500/10
                to-teal-500/10
                text-emerald-600
                dark:text-emerald-400
                grid
                place-items-center
                shrink-0
              "
            >
              <ShieldCheck size={18} />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                Submission Requirements
              </h3>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Complete these before submitting
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-500/[0.025] transition-all">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0">
                  <Github size={15} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    GitHub repository
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Submit the GitHub repository containing your complete project.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-violet-200 dark:hover:border-violet-500/30 hover:bg-violet-500/[0.025] transition-all">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 grid place-items-center shrink-0">
                  <GitBranch size={15} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Final branch
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Select the branch containing your final project submission.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:bg-emerald-500/[0.025] transition-all">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                  <Check size={15} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    One submission
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Review your repository carefully before submitting.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-orange-200/70
                dark:border-orange-500/20
                bg-gradient-to-br
                from-orange-50
                to-amber-50/60
                dark:from-orange-950/20
                dark:to-amber-950/10
                p-4
              "
            >
              <div className="flex gap-3">
                <div
                  className="
                    w-8
                    h-8
                    rounded-xl
                    bg-orange-500/10
                    text-orange-600
                    dark:text-orange-400
                    grid
                    place-items-center
                    shrink-0
                  "
                >
                  <TriangleAlert size={15} />
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-600 dark:text-orange-400">
                    Before you submit
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Make sure your GitHub repository contains the complete final project
                    and that the selected branch is ready for evaluation. You cannot
                    submit another attempt afterward.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* =====================================================
          SUBMISSION
      ===================================================== */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`
                w-10
                h-10
                rounded-xl
                grid
                place-items-center
                ${
                  submission
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }
              `}
            >
              {submission ? (
                <CheckCircle2 size={19} />
              ) : (
                <UploadCloud size={19} />
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white">
                Project Submission
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {submission
                  ? "Your project has been received."
                  : "Submit the GitHub repository for your final project."}
              </p>
            </div>
          </div>

          {!submission && (
            <span
              className="
                inline-flex
                w-fit
                items-center
                gap-1.5
                rounded-full
                bg-slate-100
                dark:bg-slate-900
                px-3
                py-1.5
                text-[10px]
                font-extrabold
                uppercase
                tracking-wider
                text-slate-500
                dark:text-slate-400
              "
            >
              <Github size={11} />
              GitHub Repository
            </span>
          )}
        </div>

        {/* ===================================================
            SUBMITTED STATE
        =================================================== */}
        {submission ? (
          <div
            className="
              relative
              mt-6
              overflow-hidden
              rounded-2xl
              border
              border-emerald-200/70
              dark:border-emerald-500/20
              bg-gradient-to-br
              from-emerald-50
              via-teal-50/60
              to-cyan-50/40
              dark:from-emerald-950/20
              dark:via-teal-950/10
              dark:to-cyan-950/10
            "
          >
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="
                    relative
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-emerald-500
                    to-teal-600
                    text-white
                    shadow-[0_8px_22px_rgba(16,185,129,0.24)]
                  "
                >
                  <Check
                    size={22}
                    strokeWidth={2.5}
                  />

                  <span className="absolute inset-0 rounded-2xl bg-white/10" />
                </div>

                <div>
                  <p className="font-extrabold text-emerald-900 dark:text-emerald-300">
                    Project Submitted
                  </p>

                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    Your mini project has been successfully submitted for evaluation.
                  </p>
                </div>
              </div>

              <span
                className="
                  w-fit
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-white/80
                  dark:bg-slate-950/50
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-emerald-700
                  dark:text-emerald-400
                  border
                  border-emerald-200
                  dark:border-emerald-500/20
                "
              >
                <CheckCircle2 size={12} />
                Submission received
              </span>
            </div>

            <div
              className="
                relative
                border-t
                border-emerald-200/70
                dark:border-emerald-500/20
                bg-white/60
                dark:bg-slate-950/20
                px-5
                py-5
              "
            >
              {submission.submitted_at && (
                <div className="flex items-center gap-2">
                  <Clock3
                    size={13}
                    className="text-slate-400"
                  />

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Submitted on{" "}
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {new Date(
                        submission.submitted_at
                      ).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}

              <div className="mt-2 flex items-center gap-2">
                <Lock
                  size={12}
                  className="text-slate-400"
                />

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No further submissions are allowed for this project.
                </p>
              </div>

              {submission.repository_url && (
                <div className="mt-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                    Repository
                  </p>

                  <a
                    href={
                      submission.repository_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group
                      mt-2
                      flex
                      items-center
                      gap-2
                      break-all
                      text-sm
                      font-semibold
                      text-blue-600
                      dark:text-blue-400
                      hover:text-violet-600
                      dark:hover:text-violet-400
                      transition-colors
                    "
                  >
                    <Github
                      size={15}
                      className="shrink-0"
                    />

                    <span className="break-all">
                      {submission.repository_url}
                    </span>

                    <ExternalLink
                      size={13}
                      className="
                        shrink-0
                        opacity-50
                        group-hover:opacity-100
                      "
                    />
                  </a>
                </div>
              )}

              {submission.branch && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 px-3 py-2">
                  <GitBranch
                    size={13}
                    className="text-violet-500"
                  />

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Branch:
                  </p>

                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {submission.branch}
                  </span>
                </div>
              )}

              {submission.commit_sha && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 px-3 py-2 ml-0 sm:ml-2">
                  <Code2
                    size={13}
                    className="text-cyan-500"
                  />

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Commit:
                  </p>

                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {submission.commit_sha.substring(
                      0,
                      12
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                FORM
            ================================================= */}
            <div className="mt-6 space-y-5">

              {/* Repository URL */}
              <div>
                <label
                  htmlFor="repository-url"
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-extrabold
                    text-slate-800
                    dark:text-slate-100
                  "
                >
                  <Github
                    size={15}
                    className="text-slate-500"
                  />

                  GitHub Repository URL
                </label>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter the URL of the GitHub repository containing your final project.
                </p>

                <div
                  className="
                    mt-3
                    relative
                    p-[1px]
                    rounded-2xl
                    bg-gradient-to-r
                    from-blue-500/20
                    via-violet-500/20
                    to-cyan-500/20
                    focus-within:from-blue-500/60
                    focus-within:via-violet-500/50
                    focus-within:to-cyan-500/60
                    transition-all
                  "
                >
                  <div className="relative">
                    <Github
                      size={17}
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        pointer-events-none
                      "
                    />

                    <input
                      id="repository-url"
                      type="url"
                      value={repositoryUrl}
                      onChange={(event) => {
                        setRepositoryUrl(
                          event.target.value
                        );
                        setError(null);
                        setSuccess(null);
                      }}
                      placeholder="https://github.com/username/project"
                      disabled={submitting}
                      className="
                        block
                        w-full
                        rounded-[15px]
                        bg-white
                        dark:bg-slate-950
                        pl-10
                        pr-4
                        py-3.5
                        text-sm
                        text-slate-900
                        dark:text-slate-100
                        placeholder-slate-400
                        dark:placeholder-slate-600
                        outline-none
                        disabled:bg-slate-100
                        dark:disabled:bg-slate-900
                      "
                    />
                  </div>
                </div>
              </div>

              {/* Branch */}
              <div>
                <label
                  htmlFor="repository-branch"
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-extrabold
                    text-slate-800
                    dark:text-slate-100
                  "
                >
                  <GitBranch
                    size={15}
                    className="text-violet-500"
                  />

                  Branch
                </label>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter the branch containing your final project. Defaults to main.
                </p>

                <div
                  className="
                    mt-3
                    relative
                    p-[1px]
                    rounded-2xl
                    bg-gradient-to-r
                    from-violet-500/20
                    via-fuchsia-500/20
                    to-blue-500/20
                    focus-within:from-violet-500/60
                    focus-within:via-fuchsia-500/50
                    focus-within:to-blue-500/60
                    transition-all
                  "
                >
                  <div className="relative">
                    <GitBranch
                      size={17}
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-violet-400
                        pointer-events-none
                      "
                    />

                    <input
                      id="repository-branch"
                      type="text"
                      value={branch}
                      onChange={(event) => {
                        setBranch(
                          event.target.value
                        );
                        setError(null);
                        setSuccess(null);
                      }}
                      placeholder="main"
                      disabled={submitting}
                      className="
                        block
                        w-full
                        rounded-[15px]
                        bg-white
                        dark:bg-slate-950
                        pl-10
                        pr-4
                        py-3.5
                        text-sm
                        text-slate-900
                        dark:text-slate-100
                        placeholder-slate-400
                        dark:placeholder-slate-600
                        outline-none
                        disabled:bg-slate-100
                        dark:disabled:bg-slate-900
                      "
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="
                  relative
                  mt-5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-red-200/70
                  dark:border-red-500/20
                  bg-gradient-to-r
                  from-red-50
                  to-rose-50
                  dark:from-red-950/20
                  dark:to-rose-950/10
                  p-4
                "
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 grid place-items-center shrink-0">
                    <XCircle size={16} />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Submission error
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Footer */}
            <div
              className="
                mt-6
                flex
                flex-col-reverse
                gap-4
                border-t
                border-slate-100
                dark:border-slate-800
                pt-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-start gap-2 max-w-xl">
                <Info
                  size={14}
                  className="
                    mt-0.5
                    shrink-0
                    text-slate-400
                  "
                />

                <p className="text-xs leading-5 text-slate-400 dark:text-slate-500">
                  Verify your repository and branch before submitting.
                  Only one submission is permitted.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={
                  !repositoryUrl.trim() ||
                  submitting
                }
                className="
                  group
                  relative
                  w-full
                  sm:w-auto
                  overflow-hidden
                "
              >
                <span
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-white/0
                    via-white/15
                    to-white/0
                    -translate-x-full
                    group-hover:translate-x-full
                    transition-transform
                    duration-700
                  "
                />

                <span className="relative flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <span
                        className="
                          w-4
                          h-4
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                          animate-spin
                        "
                      />

                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={15} />

                      Submit Project

                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </>
                  )}
                </span>
              </Button>
            </div>
          </>
        )}

        {/* Success */}
        {success && (
          <div
            className="
              mt-5
              relative
              overflow-hidden
              rounded-2xl
              border
              border-emerald-200/70
              dark:border-emerald-500/20
              bg-gradient-to-r
              from-emerald-50
              to-teal-50
              dark:from-emerald-950/20
              dark:to-teal-950/10
              p-4
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-emerald-500
                  text-white
                  grid
                  place-items-center
                  shadow-[0_6px_18px_rgba(16,185,129,0.22)]
                "
              >
                <Check size={17} />
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Success
                </p>

                <p className="mt-0.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}