import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

import {
  createMiniProject,
  publishMiniProject,
  getDomainRoles,
} from "../services/api";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  FileText,
  Layers3,
  Loader2,
  PenLine,
  Rocket,
  Save,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";

export default function CreateMiniProject() {
  const navigate = useNavigate();

  const [domainRoles, setDomainRoles] = useState([]);
  const [domainRoleId, setDomainRoleId] = useState("");

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] =
    useState("");
  const [instructions, setInstructions] = useState("");
  const [dueAt, setDueAt] = useState("");

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDomainRoles = async () => {
      try {
        const data = await getDomainRoles();

        const roles = Array.isArray(data)
          ? data
          : data?.data || [];

        setDomainRoles(roles);

        if (roles.length > 0) {
          setDomainRoleId(
            roles[0].domain_role_id
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load domain roles."
        );
      }
    };

    loadDomainRoles();
  }, []);

  const validate = () => {
    if (!domainRoleId) {
      return "Please select a domain role.";
    }

    if (!title.trim()) {
      return "Project title is required.";
    }

    if (!problemStatement.trim()) {
      return "Problem statement is required.";
    }

    if (dueAt) {
      const parsed = new Date(dueAt);

      if (Number.isNaN(parsed.getTime())) {
        return "Please enter a valid deadline.";
      }
    }

    return null;
  };

  const buildPayload = () => ({
    domain_role_id: domainRoleId,
    title: title.trim(),
    problem_statement: problemStatement.trim(),
    instructions: instructions.trim() || null,
    due_at: dueAt
      ? new Date(dueAt).toISOString()
      : null,
  });

  const handleSaveDraft = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await createMiniProject(buildPayload());

      navigate("/app/educator-assessments");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to create mini project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setPublishing(true);
      setError(null);

      const assignment =
        await createMiniProject(
          buildPayload()
        );

      await publishMiniProject(
        assignment.id,
        dueAt
          ? new Date(dueAt).toISOString()
          : null
      );

      navigate("/app/educator-assessments");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to publish mini project."
      );
    } finally {
      setPublishing(false);
    }
  };

  const isBusy = saving || publishing;

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-7 pb-12">

      {/* =========================================================
          BACKGROUND LIGHTING
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-500/[0.07] blur-[120px]" />
        <div className="absolute right-[-120px] top-[22%] h-[420px] w-[420px] rounded-full bg-violet-500/[0.07] blur-[130px]" />
        <div className="absolute bottom-[-120px] left-[28%] h-96 w-96 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
        <div className="absolute left-[48%] top-[55%] h-64 w-64 rounded-full bg-fuchsia-500/[0.04] blur-[100px]" />
      </div>

      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/75 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-950/70 sm:p-6 lg:p-7">

        {/* Header glow */}
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-500/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-[30%] h-64 w-64 rounded-full bg-violet-500/[0.06] blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            {/* Back */}
            <button
              type="button"
              onClick={() =>
                navigate("/app/educator-assessments")
              }
              className="
                group
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-transparent
                px-2.5
                py-1.5
                text-sm
                font-bold
                text-slate-500
                transition-all
                hover:border-blue-200/70
                hover:bg-blue-50
                hover:text-blue-600
                dark:text-slate-400
                dark:hover:border-blue-500/20
                dark:hover:bg-blue-500/10
                dark:hover:text-blue-400
              "
            >
              <ArrowLeft
                size={15}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />

              Back to Assessments
            </button>

            <div className="flex items-start gap-4">

              {/* Icon */}
              <div
                className="
                  relative
                  h-14
                  w-14
                  shrink-0
                  rounded-[18px]
                  bg-gradient-to-br
                  from-blue-500
                  via-indigo-500
                  to-violet-600
                  p-[1.5px]
                  shadow-[0_12px_32px_rgba(79,70,229,0.24)]
                "
              >
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    rounded-[16px]
                    bg-white
                    text-blue-600
                    dark:bg-slate-950
                    dark:text-blue-400
                  "
                >
                  <Rocket size={23} />
                </div>

                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-white dark:ring-slate-950" />
              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2.5">

                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    Create Mini Project
                  </h2>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-blue-500/10
                      bg-gradient-to-r
                      from-blue-500/10
                      to-violet-500/10
                      px-2.5
                      py-1
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      text-blue-600
                      dark:border-blue-400/10
                      dark:text-blue-400
                    "
                  >
                    <Sparkles size={10} />
                    Project Builder
                  </span>

                </div>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Create a structured, role-specific project
                  that gives learners a practical opportunity
                  to demonstrate their skills.
                </p>

              </div>
            </div>
          </div>

          {/* Assessment badge */}
          <div
            className="
              inline-flex
              w-fit
              shrink-0
              items-center
              gap-2.5
              rounded-2xl
              border
              border-violet-200/70
              bg-gradient-to-r
              from-violet-50
              to-blue-50
              px-4
              py-3
              text-xs
              font-extrabold
              text-violet-700
              shadow-sm
              dark:border-violet-500/20
              dark:from-violet-950/30
              dark:to-blue-950/30
              dark:text-violet-300
            "
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Target size={15} />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-violet-500/70 dark:text-violet-400/70">
                Assessment Type
              </p>
              <p className="mt-0.5">
                Learner Assessment
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================
          ERROR
      ========================================================= */}
      {error && (
        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-red-200/80
            bg-gradient-to-r
            from-red-50
            via-white
            to-orange-50
            p-4
            shadow-[0_10px_35px_rgba(239,68,68,0.07)]
            dark:border-red-500/20
            dark:from-red-950/30
            dark:via-slate-950
            dark:to-orange-950/20
          "
        >
          <div className="absolute -right-10 -top-16 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative flex items-start gap-3">

            <div
              className="
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-xl
                bg-red-500/10
                text-red-500
                dark:text-red-400
              "
            >
              <TriangleAlert size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-red-600 dark:text-red-400">
                Action Required
              </p>

              <p className="mt-1 text-sm font-medium leading-6 text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          MAIN FORM CARD
      ========================================================= */}
      <Card>

        <div className="space-y-8">

          {/* =====================================================
              INTRO
          ===================================================== */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[22px]
              border
              border-blue-200/60
              bg-gradient-to-br
              from-blue-50
              via-white
              to-violet-50
              px-5
              py-5
              shadow-sm
              dark:border-blue-500/15
              dark:from-blue-950/25
              dark:via-slate-950
              dark:to-violet-950/20
              sm:px-6
            "
          >
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-24 left-[30%] h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex items-start gap-4">

              <div
                className="
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-blue-500
                  to-indigo-600
                  text-white
                  shadow-[0_8px_24px_rgba(79,70,229,0.22)]
                "
              >
                <FileText size={19} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Project Details
                  </h3>

                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                    Setup
                  </span>
                </div>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Define the project scope, learner requirements,
                  instructions, and optional submission deadline.
                </p>
              </div>

            </div>
          </div>

          {/* =====================================================
              DOMAIN ROLE
          ===================================================== */}
          <div>

            <label
              htmlFor="domain-role"
              className="
                flex
                items-center
                gap-2
                text-sm
                font-black
                text-slate-800
                dark:text-slate-100
              "
            >
              <Layers3
                size={16}
                className="text-blue-500"
              />

              Domain Role

              <span className="text-red-500">*</span>
            </label>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Select the role this project is designed for.
            </p>

            <div
              className="
                relative
                mt-3
                rounded-2xl
                bg-gradient-to-r
                from-blue-500/25
                via-indigo-500/25
                to-violet-500/25
                p-[1px]
                transition-all
                duration-300
                focus-within:from-blue-500/70
                focus-within:via-indigo-500/60
                focus-within:to-violet-500/70
              "
            >
              <div className="relative">

                <Layers3
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    z-10
                    -translate-y-1/2
                    text-blue-500
                  "
                />

                <select
                  id="domain-role"
                  value={domainRoleId}
                  onChange={(e) =>
                    setDomainRoleId(
                      e.target.value
                    )
                  }
                  disabled={isBusy}
                  className="
                    block
                    w-full
                    appearance-none
                    rounded-[15px]
                    border-0
                    bg-white
                    py-3.5
                    pl-11
                    pr-11
                    text-sm
                    font-semibold
                    text-slate-900
                    outline-none
                    transition
                    dark:bg-slate-950
                    dark:text-slate-100
                    disabled:cursor-not-allowed
                    disabled:bg-slate-100
                    dark:disabled:bg-slate-900
                  "
                >
                  <option value="">
                    Select domain role
                  </option>

                  {domainRoles.map((role) => (
                    <option
                      key={role.domain_role_id}
                      value={role.domain_role_id}
                    >
                      {role.domain_name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

              </div>
            </div>
          </div>

          {/* =====================================================
              PROJECT TITLE
          ===================================================== */}
          <div>

            <label
              htmlFor="project-title"
              className="
                flex
                items-center
                gap-2
                text-sm
                font-black
                text-slate-800
                dark:text-slate-100
              "
            >
              <PenLine
                size={16}
                className="text-violet-500"
              />

              Project Title

              <span className="text-red-500">*</span>
            </label>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Give the learner a clear and descriptive project name.
            </p>

            <div
              className="
                mt-3
                rounded-2xl
                bg-gradient-to-r
                from-violet-500/25
                via-fuchsia-500/20
                to-blue-500/25
                p-[1px]
                transition-all
                duration-300
                focus-within:from-violet-500/70
                focus-within:via-fuchsia-500/60
                focus-within:to-blue-500/70
              "
            >
              <input
                id="project-title"
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Build a Task Management Application"
                maxLength={255}
                disabled={isBusy}
                className="
                  block
                  w-full
                  rounded-[15px]
                  border-0
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  dark:bg-slate-950
                  dark:text-slate-100
                  dark:placeholder:text-slate-600
                "
              />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400">
                Clear titles help learners understand the task.
              </span>

              <span
                className={`text-[10px] font-bold ${
                  title.length >= 240
                    ? "text-orange-500"
                    : "text-slate-400"
                }`}
              >
                {title.length}/255
              </span>
            </div>
          </div>

          {/* =====================================================
              PROBLEM STATEMENT
          ===================================================== */}
          <div>

            <label
              htmlFor="problem-statement"
              className="
                flex
                items-center
                gap-2
                text-sm
                font-black
                text-slate-800
                dark:text-slate-100
              "
            >
              <BookOpen
                size={16}
                className="text-cyan-500"
              />

              Problem Statement

              <span className="text-red-500">*</span>
            </label>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Describe the problem the learner needs to solve.
            </p>

            <div
              className="
                mt-3
                rounded-2xl
                bg-gradient-to-br
                from-cyan-500/25
                via-blue-500/20
                to-violet-500/25
                p-[1px]
                transition-all
                duration-300
                focus-within:from-cyan-500/70
                focus-within:via-blue-500/60
                focus-within:to-violet-500/70
              "
            >
              <textarea
                id="problem-statement"
                value={problemStatement}
                onChange={(e) =>
                  setProblemStatement(
                    e.target.value
                  )
                }
                rows={7}
                placeholder="Describe the problem the learner needs to solve..."
                disabled={isBusy}
                className="
                  block
                  w-full
                  resize-y
                  rounded-[15px]
                  border-0
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  font-medium
                  leading-6
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  dark:bg-slate-950
                  dark:text-slate-100
                  dark:placeholder:text-slate-600
                "
              />
            </div>
          </div>

          {/* =====================================================
              INSTRUCTIONS
          ===================================================== */}
          <div>

            <label
              htmlFor="project-instructions"
              className="
                flex
                items-center
                gap-2
                text-sm
                font-black
                text-slate-800
                dark:text-slate-100
              "
            >
              <FileText
                size={16}
                className="text-violet-500"
              />

              Instructions

              <span
                className="
                  rounded-full
                  border
                  border-slate-200
                  bg-slate-50
                  px-2
                  py-0.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-500
                "
              >
                Optional
              </span>
            </label>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Add technical requirements, expected features,
              submission guidance, etc.
            </p>

            <div
              className="
                mt-3
                rounded-2xl
                bg-gradient-to-br
                from-violet-500/25
                via-fuchsia-500/20
                to-blue-500/25
                p-[1px]
                transition-all
                duration-300
                focus-within:from-violet-500/70
                focus-within:via-fuchsia-500/60
                focus-within:to-blue-500/70
              "
            >
              <textarea
                id="project-instructions"
                value={instructions}
                onChange={(e) =>
                  setInstructions(
                    e.target.value
                  )
                }
                rows={6}
                placeholder="Add technical requirements, expected features, submission guidance, etc."
                disabled={isBusy}
                className="
                  block
                  w-full
                  resize-y
                  rounded-[15px]
                  border-0
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  font-medium
                  leading-6
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  dark:bg-slate-950
                  dark:text-slate-100
                  dark:placeholder:text-slate-600
                "
              />
            </div>
          </div>

          {/* =====================================================
              DEADLINE
          ===================================================== */}
          <div>

            <label
              htmlFor="submission-deadline"
              className="
                flex
                items-center
                gap-2
                text-sm
                font-black
                text-slate-800
                dark:text-slate-100
              "
            >
              <CalendarClock
                size={16}
                className="text-orange-500"
              />

              Submission Deadline

              <span
                className="
                  rounded-full
                  border
                  border-slate-200
                  bg-slate-50
                  px-2
                  py-0.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-500
                "
              >
                Optional
              </span>
            </label>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Set a deadline if learners need to submit within
              a specific period.
            </p>

            <div
              className="
                mt-3
                w-full
                rounded-2xl
                bg-gradient-to-r
                from-orange-500/25
                via-amber-500/20
                to-yellow-500/25
                p-[1px]
                transition-all
                duration-300
                focus-within:from-orange-500/70
                focus-within:via-amber-500/60
                focus-within:to-yellow-500/70
                sm:w-fit
              "
            >
              <input
                id="submission-deadline"
                type="datetime-local"
                value={dueAt}
                onChange={(e) =>
                  setDueAt(
                    e.target.value
                  )
                }
                disabled={isBusy}
                className="
                  block
                  w-full
                  rounded-[15px]
                  border-0
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  text-slate-900
                  outline-none
                  dark:bg-slate-950
                  dark:text-slate-100
                  sm:w-[290px]
                "
              />
            </div>

            <div
              className="
                mt-2.5
                flex
                items-center
                gap-1.5
              "
            >
              <CalendarClock
                size={12}
                className="text-slate-400"
              />

              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Leave empty if you do not want to set a deadline.
              </p>
            </div>
          </div>

          {/* =====================================================
              ACTIONS
          ===================================================== */}
          <div
            className="
              relative
              flex
              flex-col-reverse
              gap-5
              border-t
              border-slate-100
              pt-7
              dark:border-slate-800
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            {/* Helper */}
            <div className="flex max-w-lg items-start gap-3">

              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={15} />
              </div>

              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                Save your project as a draft to continue editing
                later, or publish it immediately for learners.
              </p>

            </div>

            {/* Buttons */}
            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">

              {/* Save Draft */}
              <Button
                variant="outline"
                disabled={isBusy}
                onClick={handleSaveDraft}
                className="
                  w-full
                  sm:w-auto
                "
              >
                <span className="flex items-center justify-center gap-2">

                  {saving ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Draft
                    </>
                  )}

                </span>
              </Button>

              {/* Publish */}
              <Button
                disabled={isBusy}
                onClick={handlePublish}
                className="
                  w-full
                  shadow-[0_10px_28px_rgba(79,70,229,0.18)]
                  sm:w-auto
                "
              >
                <span className="flex items-center justify-center gap-2">

                  {publishing ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Rocket size={15} />
                      Publish
                      <ArrowRight size={14} />
                    </>
                  )}

                </span>
              </Button>

            </div>
          </div>

        </div>
      </Card>

      {/* =========================================================
          BOTTOM INFORMATION CARDS
      ========================================================= */}
      <div className="grid gap-4 sm:grid-cols-3">

        {/* Role specific */}
        <div
          className="
            group
            relative
            overflow-hidden
            rounded-[22px]
            border
            border-blue-200/70
            bg-gradient-to-br
            from-blue-50
            via-white
            to-cyan-50
            p-5
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-[0_14px_35px_rgba(59,130,246,0.10)]
            dark:border-blue-500/15
            dark:from-blue-950/25
            dark:via-slate-950
            dark:to-cyan-950/15
          "
        >
          <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Target size={16} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-500/70">
                  Principle 01
                </p>

                <span className="text-xs font-black text-blue-700 dark:text-blue-400">
                  Role Specific
                </span>
              </div>

            </div>

            <p className="mt-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              Assign projects according to the learner&apos;s
              selected domain role.
            </p>

          </div>
        </div>

        {/* Clear requirements */}
        <div
          className="
            group
            relative
            overflow-hidden
            rounded-[22px]
            border
            border-violet-200/70
            bg-gradient-to-br
            from-violet-50
            via-white
            to-fuchsia-50
            p-5
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-[0_14px_35px_rgba(139,92,246,0.10)]
            dark:border-violet-500/15
            dark:from-violet-950/25
            dark:via-slate-950
            dark:to-fuchsia-950/15
          "
        >
          <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <BookOpen size={16} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-violet-500/70">
                  Principle 02
                </p>

                <span className="text-xs font-black text-violet-700 dark:text-violet-400">
                  Clear Requirements
                </span>
              </div>

            </div>

            <p className="mt-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              Give learners enough detail to understand what
              they need to build.
            </p>

          </div>
        </div>

        {/* Ready for evaluation */}
        <div
          className="
            group
            relative
            overflow-hidden
            rounded-[22px]
            border
            border-emerald-200/70
            bg-gradient-to-br
            from-emerald-50
            via-white
            to-cyan-50
            p-5
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-[0_14px_35px_rgba(16,185,129,0.10)]
            dark:border-emerald-500/15
            dark:from-emerald-950/25
            dark:via-slate-950
            dark:to-cyan-950/15
          "
        >
          <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

          <div className="relative">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70">
                  Principle 03
                </p>

                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                  Ready for Evaluation
                </span>
              </div>

            </div>

            <p className="mt-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              Published projects become available for learners
              to complete and submit.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
}