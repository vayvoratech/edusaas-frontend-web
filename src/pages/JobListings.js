import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getDomainRoles,
} from "../services/api";

import { useAuth } from "../context/AuthContext";
import AppDialog from "../components/ui/AppDialog";

const SALARY_OPTIONS = [
  "₹0 – ₹3 LPA",
  "₹3 – ₹5 LPA",
  "₹5 – ₹7 LPA",
  "₹8 – ₹10 LPA",
  "₹5,000 – ₹10,000 / month",
  "₹10,000 – ₹15,000 / month",
  "₹15,000 – ₹25,000 / month",
  "₹25,000 – ₹40,000 / month",
  "₹40,000+ / month",
  "Unpaid / No Compensation",
];

/* =========================================================
   ICON SYSTEM
========================================================= */

const Icon = ({
  children,
  size = 18,
  strokeWidth = 1.9,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const BriefcaseIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="7" width="18" height="13" rx="3" />
    <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
    <path d="M3 12h18" />
    <path d="M10 12v2h4v-2" />
  </Icon>
);

const SearchIcon = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </Icon>
);

const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);

const MapPinIcon = (props) => (
  <Icon {...props}>
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);

const CalendarIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </Icon>
);

const VideoIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="6" width="12" height="12" rx="3" />
    <path d="m15 10 5-3v10l-5-3" />
  </Icon>
);

const EyeIcon = (props) => (
  <Icon {...props}>
    <path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.5" />
  </Icon>
);

const EditIcon = (props) => (
  <Icon {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
  </Icon>
);

const ArchiveIcon = (props) => (
  <Icon {...props}>
    <path d="M4 7h16v13H4z" />
    <path d="M3 4h18v3H3z" />
    <path d="M9 11h6" />
  </Icon>
);

const CloseIcon = (props) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

const FilterIcon = (props) => (
  <Icon {...props}>
    <path d="M4 6h16" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </Icon>
);

const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="m5 12 4 4L19 6" />
  </Icon>
);

const GraduationIcon = (props) => (
  <Icon {...props}>
    <path d="m3 9 9-5 9 5-9 5-9-5Z" />
    <path d="M7 11.5v5c2.8 2.2 7.2 2.2 10 0v-5" />
    <path d="M21 9v6" />
  </Icon>
);

const SparkleIcon = (props) => (
  <Icon {...props}>
    <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5Z" />
    <path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6Z" />
  </Icon>
);

/* =========================================================
   COMPONENT
========================================================= */

const JobListings = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [domainRoles, setDomainRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState(null);

  const [dialog, setDialog] = useState({
    open: false,
    type: "error",
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
    destructive: false,
    onConfirm: null,
  });

  const closeDialog = () => {
    setDialog((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const showDialog = (options) => {
    setDialog({
      open: true,
      type: "error",
      title: "Something went wrong",
      message: "",
      confirmText: "OK",
      cancelText: "Cancel",
      showCancel: false,
      destructive: false,
      onConfirm: closeDialog,
      ...options,
    });
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employmentFilter, setEmploymentFilter] =
    useState("all");
  const [locationFilter, setLocationFilter] =
    useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const load = async () => {
    try {
      const params =
        user?.role === "employer"
          ? { employer_id: user.id }
          : {};

      setJobs(await getJobs(params));
      setDomainRoles(await getDomainRoles());
    } catch (err) {
      setError(
        err.response?.data?.error || err.message
      );
    }
  };

  const normalizeDeadline = (value) => {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const date = new Date(`${value}T23:59:59`);

      return Number.isNaN(date.getTime())
        ? null
        : date.toISOString();
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString();
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const mapJobToEditing = (job) => ({
    ...job,
    required_skills_csv: (
      job.required_skills || []
    ).join(", "),
    preferred_skills_csv: (
      job.preferred_skills || []
    ).join(", "),
    eligible_branches_csv: (
      job.eligible_branches || []
    ).join(", "),
    application_deadline: job.application_deadline
      ? new Date(job.application_deadline)
          .toISOString()
          .split("T")[0]
      : "",
    require_video: Boolean(job.require_video),
    video_max_duration:
      job.video_max_duration || 60,
    video_prompt: job.video_prompt || "",
  });

  const openCreate = () => {
    setSelectedJob(null);

    setEditing({
      title: "",
      description: "",
      responsibilities: "",
      required_skills_csv: "",
      preferred_skills_csv: "",
      qualification: "bachelors",
      eligible_branches_csv: "",
      employment_type: "full-time",
      work_mode: "onsite",
      location: "",
      salary: "",
      application_deadline: "",
      require_video: false,
      video_max_duration: 60,
      video_prompt: "",
      status: "open",
    });
  };

  const openEdit = (job) => {
    setSelectedJob(null);
    setEditing(mapJobToEditing(job));
  };

  const onSave = async (e) => {
    e.preventDefault();

    const data = {
      title: editing.title,
      description: editing.description,
      responsibilities:
        editing.responsibilities || null,

      required_skills: (
        editing.required_skills_csv || ""
      )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),

      preferred_skills: (
        editing.preferred_skills_csv || ""
      )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),

      qualification:
        editing.qualification || null,

      eligible_branches: (
        editing.eligible_branches_csv || ""
      )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),

      employment_type:
        editing.employment_type || null,

      work_mode:
        editing.work_mode || null,

      location:
        editing.location || null,

      salary:
        editing.salary || null,

      application_deadline:
        normalizeDeadline(
          editing.application_deadline
        ),

      require_video:
        Boolean(editing.require_video),

      video_max_duration:
        editing.require_video
          ? Number(
              editing.video_max_duration || 60
            )
          : null,

      video_prompt:
        editing.require_video
          ? editing.video_prompt?.trim() ||
            null
          : null,

      status:
        editing.status || "open",
    };

    try {
      if (editing.id) {
        await updateJob(editing.id, data);
      } else {
        await createJob(data);
      }

      setEditing(null);
      await load();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message
      );
    }
  };

  const onDelete = (job) => {
    showDialog({
      type: "confirm",
      title: "Archive this opportunity?",
      message: `Are you sure you want to delete "${job.title}"? This action cannot be undone.`,
      confirmText: "Archive",
      cancelText: "Cancel",
      showCancel: true,
      destructive: true,

      onConfirm: async () => {
        closeDialog();

        try {
          await deleteJob(job.id);
          await load();
        } catch (err) {
          showDialog({
            type: "error",
            title: "Archive Failed",
            message:
              err.response?.data?.error ||
              err.message ||
              "Failed to delete the job.",
          });
        }
      },
    });
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatValue = (value) => {
    if (!value) return "Not specified";

    return String(value)
      .replace(/[-_]/g, " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (search.trim()) {
      const query =
        search.toLowerCase();

      result = result.filter((job) => {
        const searchableText = [
          job.title,
          job.description,
          job.location,
          job.salary,
          ...(job.required_skills || []),
          ...(job.preferred_skills || []),
          ...(job.eligible_branches || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          query
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (job) =>
          String(job.status).toLowerCase() ===
          statusFilter
      );
    }

    if (employmentFilter !== "all") {
      result = result.filter(
        (job) =>
          String(
            job.employment_type
          ).toLowerCase() ===
          employmentFilter
      );
    }

    if (locationFilter !== "all") {
      result = result.filter(
        (job) =>
          String(
            job.location || ""
          ).toLowerCase() ===
          locationFilter.toLowerCase()
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        );
      }

      if (sortBy === "title") {
        return String(
          a.title || ""
        ).localeCompare(
          String(b.title || "")
        );
      }

      if (sortBy === "deadline") {
        return (
          new Date(
            a.application_deadline ||
              "9999-12-31"
          ) -
          new Date(
            b.application_deadline ||
              "9999-12-31"
          )
        );
      }

      return 0;
    });

    return result;
  }, [
    jobs,
    search,
    statusFilter,
    employmentFilter,
    locationFilter,
    sortBy,
  ]);

  const locationOptions = useMemo(() => {
    return Array.from(
      new Set(
        jobs
          .map((job) => job.location)
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [jobs]);

  const openJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          String(
            job.status || ""
          ).toLowerCase() === "open"
      ).length,
    [jobs]
  );

  const closedJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          String(
            job.status || ""
          ).toLowerCase() === "closed"
      ).length,
    [jobs]
  );

  const videoJobs = useMemo(
    () =>
      jobs.filter(
        (job) => job.require_video
      ).length,
    [jobs]
  );

  const activeFilterCount = [
    search,
    statusFilter !== "all"
      ? statusFilter
      : "",
    employmentFilter !== "all"
      ? employmentFilter
      : "",
    locationFilter !== "all"
      ? locationFilter
      : "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setEmploymentFilter("all");
    setLocationFilter("all");
    setSortBy("newest");
  };

  const deadlinePassed = (date) => {
    if (!date) return false;

    const deadline = new Date(date);

    if (Number.isNaN(deadline.getTime())) {
      return false;
    }

    return deadline < new Date();
  };

  const getStatusClass = (status) => {
    return String(
      status || ""
    ).toLowerCase() === "open"
      ? "status-open"
      : "status-closed";
  };

  return (
    <>
      <style>{`

        /* =====================================================
           GLOBAL
        ===================================================== */

        .jl-page {
          --ink: #17221d;
          --muted: #69736d;
          --paper: #fbfaf6;
          --white: #ffffff;

          --emerald: #0f8f70;
          --emerald-dark: #075c49;
          --cyan: #17a7b7;
          --violet: #7456d8;
          --pink: #e65f93;
          --orange: #f07b4d;

          min-height: 100%;
          padding: 28px;

          color: var(--ink);

          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(23,167,183,0.12),
              transparent 28%
            ),
            radial-gradient(
              circle at 100% 0%,
              rgba(116,86,216,0.10),
              transparent 30%
            ),
            radial-gradient(
              circle at 100% 100%,
              rgba(240,123,77,0.09),
              transparent 30%
            ),
            #f8f7f2;

          overflow-x: hidden;
        }

        .jl-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .jl-hero {
          position: relative;
          overflow: hidden;

          min-height: 330px;

          padding: 34px;
          margin-bottom: 25px;

          border-radius: 34px;

          background:
            linear-gradient(
              120deg,
              #063f36 0%,
              #087c68 28%,
              #12a5a2 52%,
              #6d55d7 78%,
              #b85a9e 100%
            );

          color: white;

          box-shadow:
            0 30px 70px
              rgba(20,58,51,0.20),
            inset 0 1px 0
              rgba(255,255,255,0.25);

          isolation: isolate;
        }

        .jl-hero::before {
          content: "";

          position: absolute;

          width: 500px;
          height: 500px;

          right: -180px;
          top: -280px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(255,255,255,0.34),
              rgba(255,255,255,0.02) 60%,
              transparent 72%
            );

          pointer-events: none;

          transition:
            transform 0.8s ease;
        }

        .jl-hero:hover::before {
          transform:
            scale(1.15)
            translate(-20px, 20px);
        }

        .jl-hero::after {
          content: "";

          position: absolute;

          width: 450px;
          height: 180px;

          left: 32%;
          bottom: -100px;

          border-radius: 50%;

          background:
            rgba(255,255,255,0.13);

          filter: blur(28px);

          transform: rotate(-10deg);

          pointer-events: none;
        }

        .jl-hero-grid {
          position: relative;
          z-index: 2;

          display: grid;

          grid-template-columns:
            minmax(0, 1.4fr)
            minmax(360px, 0.9fr);

          gap: 30px;
        }

        .jl-hero-copy {
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          min-height: 255px;
        }

        .jl-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          width: fit-content;

          padding: 8px 13px;

          border: 1px solid
            rgba(255,255,255,0.25);

          border-radius: 999px;

          background:
            rgba(255,255,255,0.10);

          backdrop-filter: blur(12px);

          font-size: 11px;
          font-weight: 850;

          letter-spacing: 0.14em;
          text-transform: uppercase;

          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .jl-eyebrow:hover {
          transform: translateY(-2px);
          background:
            rgba(255,255,255,0.17);
        }

        .jl-hero-title {
          margin: 20px 0 10px;

          max-width: 800px;

          font-size:
            clamp(38px, 5vw, 70px);

          line-height: 0.96;

          font-weight: 900;

          letter-spacing: -0.055em;
        }

        .jl-hero-title span {
          background:
            linear-gradient(
              90deg,
              #ffffff,
              #d7fff1 35%,
              #fff0ba 70%,
              #ffd9eb
            );

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;
        }

        .jl-hero-description {
          max-width: 670px;

          margin: 0;

          color:
            rgba(255,255,255,0.80);

          font-size: 15px;
          line-height: 1.7;
        }

        /* =====================================================
           HERO BUTTONS
        ===================================================== */

        .jl-hero-actions {
          display: flex;
          flex-wrap: wrap;

          gap: 12px;

          margin-top: 24px;
        }

        .jl-primary-button,
        .jl-ghost-button {
          position: relative;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 9px;

          min-height: 48px;

          padding:
            0 20px;

          border-radius: 15px;

          font-size: 13px;
          font-weight: 850;

          cursor: pointer;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .jl-primary-button {
          overflow: hidden;

          border: 0;

          background: white;

          color: #075c49;

          box-shadow:
            0 12px 25px
              rgba(0,0,0,0.14);
        }

        .jl-primary-button::before {
          content: "";

          position: absolute;

          top: 0;
          left: -120%;

          width: 70%;
          height: 100%;

          background:
            linear-gradient(
              100deg,
              transparent,
              rgba(255,255,255,0.8),
              transparent
            );

          transform: skewX(-20deg);

          transition:
            left 0.55s ease;
        }

        .jl-primary-button:hover::before {
          left: 140%;
        }

        .jl-primary-button:hover {
          transform:
            translateY(-3px)
            scale(1.015);

          box-shadow:
            0 18px 35px
              rgba(0,0,0,0.20);
        }

        .jl-primary-button:active {
          transform:
            translateY(0)
            scale(0.98);
        }

        .jl-primary-button svg {
          transition:
            transform 0.25s ease;
        }

        .jl-primary-button:hover svg {
          transform: rotate(90deg);
        }

        .jl-ghost-button {
          border:
            1px solid
            rgba(255,255,255,0.28);

          background:
            rgba(255,255,255,0.08);

          color: white;

          backdrop-filter: blur(12px);
        }

        .jl-ghost-button:hover {
          transform: translateY(-3px);

          background:
            rgba(255,255,255,0.16);

          border-color:
            rgba(255,255,255,0.42);

          box-shadow:
            0 15px 30px
              rgba(0,0,0,0.12);
        }

        /* =====================================================
           STATS
        ===================================================== */

        .jl-hero-stats {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 12px;

          padding: 16px;

          border:
            1px solid
            rgba(255,255,255,0.20);

          border-radius: 24px;

          background:
            rgba(7,45,40,0.23);

          backdrop-filter: blur(18px);
        }

        .jl-stat {
          min-height: 108px;

          padding: 17px;

          border:
            1px solid
            rgba(255,255,255,0.12);

          border-radius: 18px;

          background:
            rgba(255,255,255,0.08);

          transition:
            transform 0.25s ease,
            background 0.25s ease,
            border-color 0.25s ease;
        }

        .jl-stat:hover {
          transform:
            translateY(-5px)
            scale(1.015);

          background:
            rgba(255,255,255,0.14);

          border-color:
            rgba(255,255,255,0.25);
        }

        .jl-stat:nth-child(2) {
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.12),
              rgba(24,188,182,0.20)
            );
        }

        .jl-stat:nth-child(3) {
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.12),
              rgba(116,86,216,0.22)
            );
        }

        .jl-stat:nth-child(4) {
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.12),
              rgba(240,123,77,0.20)
            );
        }

        .jl-stat-label {
          color:
            rgba(255,255,255,0.68);

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .jl-stat-value {
          margin-top: 8px;

          font-size: 32px;
          line-height: 1;

          font-weight: 900;

          letter-spacing: -0.04em;
        }

        .jl-stat-caption {
          margin-top: 7px;

          color:
            rgba(255,255,255,0.58);

          font-size: 11px;
        }

        /* =====================================================
           FILTER BAR
        ===================================================== */

        .jl-command {
          position: relative;
          z-index: 5;

          display: grid;

          grid-template-columns:
            minmax(240px,1.7fr)
            repeat(3,minmax(150px,0.75fr))
            minmax(145px,0.7fr);

          gap: 10px;

          padding: 12px;

          margin-bottom: 24px;

          border:
            1px solid
            rgba(20,35,30,0.08);

          border-radius: 22px;

          background:
            rgba(255,255,255,0.88);

          box-shadow:
            0 15px 45px
              rgba(28,43,37,0.08),
            inset 0 1px 0 white;

          backdrop-filter: blur(18px);

          transition:
            box-shadow 0.3s ease,
            transform 0.3s ease;
        }

        .jl-command:hover {
          box-shadow:
            0 20px 55px
              rgba(28,43,37,0.11),
            inset 0 1px 0 white;
        }

        .jl-search {
          position: relative;
        }

        .jl-search svg {
          position: absolute;

          left: 15px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #82908a;

          pointer-events: none;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .jl-search:focus-within svg {
          color: #0f8f70;

          transform:
            translateY(-50%)
            scale(1.1);
        }

        .jl-search input,
        .jl-select {
          width: 100%;
          height: 46px;

          border:
            1px solid #e3e6df;

          border-radius: 14px;

          background: #fbfcfa;

          color: var(--ink);

          outline: none;

          font-size: 13px;
          font-weight: 650;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .jl-search input {
          padding:
            0 15px 0 45px;
        }

        .jl-select {
          padding:
            0 34px 0 13px;

          cursor: pointer;
        }

        .jl-search input:hover,
        .jl-select:hover {
          border-color:
            #b9cec6;

          background: white;

          transform:
            translateY(-1px);
        }

        .jl-search input:focus,
        .jl-select:focus {
          border-color:
            #2aa98c;

          box-shadow:
            0 0 0 4px
            rgba(42,169,140,0.10);

          background: white;
        }

        /* =====================================================
           SECTION HEADING
        ===================================================== */

        .jl-content-heading {
          display: flex;

          align-items: flex-end;
          justify-content: space-between;

          gap: 20px;

          margin:
            10px 2px 15px;
        }

        .jl-content-heading h2 {
          margin: 0;

          font-size: 25px;
          line-height: 1;

          font-weight: 900;

          letter-spacing: -0.035em;
        }

        .jl-content-heading h2 span {
          background:
            linear-gradient(
              100deg,
              #0b765d,
              #13a59d,
              #7456d8,
              #e65f93
            );

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;
        }

        .jl-content-heading p {
          margin: 7px 0 0;

          color: #78827c;

          font-size: 13px;
        }

        .jl-clear {
          border: 0;

          background: transparent;

          color: #8a4c3c;

          font-size: 12px;
          font-weight: 800;

          cursor: pointer;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .jl-clear:hover {
          color: #c05a45;

          transform:
            translateY(-2px);
        }

        /* =====================================================
           JOB LIST
        ===================================================== */

        .jl-jobs {
          display: flex;
          flex-direction: column;

          gap: 16px;
        }

        .jl-job-card {
          position: relative;
          overflow: hidden;

          border:
            1px solid #e5e7df;

          border-radius: 25px;

          background:
            rgba(255,255,255,0.96);

          box-shadow:
            0 13px 40px
            rgba(28,42,36,0.065);

          transition:
            transform 0.3s cubic-bezier(.2,.8,.2,1),
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .jl-job-card::before {
          content: "";

          position: absolute;

          left: 0;
          top: 0;
          bottom: 0;

          width: 5px;

          background:
            linear-gradient(
              180deg,
              #0f8f70,
              #18a8b4,
              #7456d8,
              #e65f93
            );

          transform:
            scaleY(0.45);

          transform-origin:
            center;

          transition:
            transform 0.35s ease;
        }

        .jl-job-card:hover {
          transform:
            translateY(-6px);

          border-color:
            rgba(19,165,157,0.30);

          box-shadow:
            0 26px 65px
            rgba(28,42,36,0.13);
        }

        .jl-job-card:hover::before {
          transform:
            scaleY(1);
        }

        .jl-job-card::after {
          content: "";

          position: absolute;

          width: 220px;
          height: 220px;

          right: -130px;
          top: -130px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(23,167,183,0.10),
              transparent 68%
            );

          opacity: 0;

          transition:
            opacity 0.35s ease,
            transform 0.35s ease;

          pointer-events: none;
        }

        .jl-job-card:hover::after {
          opacity: 1;

          transform:
            scale(1.25);
        }

        .jl-job-inner {
          position: relative;
          z-index: 2;

          display: grid;

          grid-template-columns:
            minmax(0,1.25fr)
            minmax(300px,0.75fr);
        }

        .jl-job-main {
          padding:
            25px 27px 25px 30px;

          border-right:
            1px solid #eceee8;
        }

        .jl-job-side {
          padding: 25px;

          background:
            linear-gradient(
              145deg,
              #fbfcfa 0%,
              #f4faf7 52%,
              #f7f4ff 100%
            );

          transition:
            background 0.3s ease;
        }

        .jl-job-card:hover .jl-job-side {
          background:
            linear-gradient(
              145deg,
              #f8fcfa,
              #edf9f4 52%,
              #f3efff
            );
        }

        /* =====================================================
           JOB HEADER
        ===================================================== */

        .jl-job-top {
          display: flex;

          justify-content: space-between;
          align-items: flex-start;

          gap: 18px;
        }

        .jl-job-title-row {
          display: flex;

          gap: 14px;

          min-width: 0;
        }

        .jl-job-avatar {
          flex: 0 0 auto;

          width: 50px;
          height: 50px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 17px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #0f8f70,
              #16a8b2 52%,
              #7456d8
            );

          box-shadow:
            0 10px 25px
            rgba(15,143,112,0.20);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .jl-job-card:hover
        .jl-job-avatar {
          transform:
            rotate(-4deg)
            scale(1.08);

          box-shadow:
            0 15px 32px
            rgba(15,143,112,0.27);
        }

        .jl-job-title {
          margin: 0;

          color: #18251f;

          font-size: 21px;
          line-height: 1.15;

          font-weight: 900;

          letter-spacing: -0.03em;

          transition:
            color 0.25s ease;
        }

        .jl-job-card:hover
        .jl-job-title {
          color: #08745a;
        }

        .jl-job-posted {
          margin-top: 6px;

          color: #8a938d;

          font-size: 11px;
          font-weight: 650;
        }

        .jl-badges {
          display: flex;

          flex-wrap: wrap;

          justify-content: flex-end;

          gap: 7px;
        }

        .jl-pill {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 6px;

          min-height: 28px;

          padding:
            0 10px;

          border-radius: 999px;

          white-space: nowrap;

          font-size: 10px;
          font-weight: 850;
        }

        .status-open {
          color: #087458;

          background: #dcf7ed;

          border:
            1px solid #b9ead9;
        }

        .status-closed {
          color: #8b4941;

          background: #fde8e2;

          border:
            1px solid #f4c8bd;
        }

        .video-pill {
          color: #6044bd;

          background: #eeeaff;

          border:
            1px solid #d8cff9;
        }

        /* =====================================================
           DESCRIPTION / META
        ===================================================== */

        .jl-description {
          margin: 20px 0 0;

          max-width: 850px;

          color: #626d67;

          font-size: 13px;
          line-height: 1.7;
        }

        .jl-meta-grid {
          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 9px;

          margin-top: 22px;
        }

        .jl-meta-box {
          min-height: 72px;

          padding: 12px;

          border:
            1px solid #e9ece6;

          border-radius: 15px;

          background: #fafbf9;

          transition:
            transform 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease;
        }

        .jl-meta-box:hover {
          transform:
            translateY(-3px);

          border-color:
            #c8ddd5;

          box-shadow:
            0 8px 20px
            rgba(20,60,50,0.07);

          background: white;
        }

        .jl-meta-label {
          display: flex;

          align-items: center;

          gap: 5px;

          color: #8b958f;

          font-size: 9px;

          font-weight: 850;

          text-transform: uppercase;

          letter-spacing: 0.07em;
        }

        .jl-meta-value {
          margin-top: 7px;

          color: #25322c;

          font-size: 12px;

          font-weight: 800;

          line-height: 1.35;

          word-break: break-word;
        }

        /* =====================================================
           TAGS
        ===================================================== */

        .jl-section {
          margin-top: 20px;
        }

        .jl-section-title {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 9px;

          color: #33413a;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 0.04em;

          text-transform: uppercase;
        }

        .jl-tags {
          display: flex;

          flex-wrap: wrap;

          gap: 7px;
        }

        .jl-tag {
          padding:
            6px 9px;

          border-radius: 9px;

          background: #eef8f4;

          color: #126e59;

          border:
            1px solid #d6eee5;

          font-size: 10px;

          font-weight: 750;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .jl-tag:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 5px 12px
            rgba(15,143,112,0.10);
        }

        .jl-tag.secondary {
          color: #654eaf;

          background: #f1edff;

          border-color: #e2dafb;
        }

        .jl-tag.branch {
          color: #8c5a22;

          background: #fff4dc;

          border-color: #f6dfad;
        }

        .jl-more {
          align-self: center;

          color: #89918c;

          font-size: 10px;

          font-weight: 750;
        }

        /* =====================================================
           SIDE PANEL
        ===================================================== */

        .jl-side-title {
          margin: 0;

          color: #34423a;

          font-size: 11px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 0.08em;
        }

        .jl-deadline-card {
          margin-top: 13px;

          padding: 15px;

          border-radius: 18px;

          background: white;

          border:
            1px solid #e7ebe5;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .jl-deadline-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 12px 25px
            rgba(25,55,45,0.08);
        }

        .jl-deadline-row {
          display: flex;

          align-items: center;

          gap: 11px;
        }

        .jl-deadline-icon {
          width: 38px;
          height: 38px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex: 0 0 auto;

          border-radius: 12px;

          background: #e8f7f2;

          color: #0d7e64;

          transition:
            transform 0.25s ease;
        }

        .jl-deadline-card:hover
        .jl-deadline-icon {
          transform:
            rotate(-6deg)
            scale(1.08);
        }

        .jl-deadline-icon.danger {
          background: #ffebe5;
          color: #b65542;
        }

        .jl-deadline-label {
          color: #89938c;

          font-size: 10px;

          font-weight: 750;
        }

        .jl-deadline-value {
          margin-top: 2px;

          color: #26332d;

          font-size: 13px;

          font-weight: 900;
        }

        /* =====================================================
           ACTION BUTTONS
        ===================================================== */

        .jl-actions {
          display: grid;

          grid-template-columns:
            minmax(0,1fr)
            minmax(0,1fr);

          gap: 8px;

          margin-top: 17px;
        }

        .jl-action {
          position: relative;

          min-width: 0;

          min-height: 42px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          padding:
            0 11px;

          border-radius: 12px;

          cursor: pointer;

          font-size: 11px;

          font-weight: 850;

          white-space: nowrap;

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            background 0.22s ease,
            border-color 0.22s ease;
        }

        .jl-action svg {
          flex: 0 0 auto;

          transition:
            transform 0.22s ease;
        }

        .jl-action:hover svg {
          transform:
            translateX(1px)
            scale(1.08);
        }

        .jl-action.primary {
          overflow: hidden;

          color: white;

          border: 0;

          background:
            linear-gradient(
              100deg,
              #08745a,
              #13a49a,
              #3e8ed7
            );

          box-shadow:
            0 8px 18px
            rgba(15,143,112,0.18);
        }

        .jl-action.primary::before {
          content: "";

          position: absolute;

          top: 0;
          left: -110%;

          width: 70%;
          height: 100%;

          background:
            linear-gradient(
              100deg,
              transparent,
              rgba(255,255,255,0.35),
              transparent
            );

          transform:
            skewX(-20deg);

          transition:
            left 0.45s ease;
        }

        .jl-action.primary:hover::before {
          left: 140%;
        }

        .jl-action.primary:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 14px 27px
            rgba(15,143,112,0.25);
        }

        .jl-action.secondary {
          color: #4c5952;

          border:
            1px solid #dde3dc;

          background: white;
        }

        .jl-action.secondary:hover {
          transform:
            translateY(-3px);

          color: #08745a;

          border-color:
            #aaccc0;

          background: #f7fbf9;

          box-shadow:
            0 10px 22px
            rgba(20,60,50,0.08);
        }

        .jl-action.danger {
          grid-column: 1 / -1;

          color: #a24f42;

          border:
            1px solid #f0d5ce;

          background: #fff9f7;
        }

        .jl-action.danger:hover {
          transform:
            translateY(-2px);

          color: #b74432;

          border-color:
            #e7b7ad;

          background: #fff3ef;

          box-shadow:
            0 9px 20px
            rgba(170,75,55,0.08);
        }

        /* =====================================================
           ERROR / EMPTY
        ===================================================== */

        .jl-error {
          margin-bottom: 16px;

          padding: 14px 16px;

          border-radius: 15px;

          background: #fff1ed;

          color: #a54d3e;

          border:
            1px solid #f3cec4;

          font-size: 13px;

          font-weight: 700;
        }

        .jl-empty {
          padding: 70px 25px;

          text-align: center;

          border:
            1px dashed #d5ddd7;

          border-radius: 26px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.9),
              rgba(237,249,244,0.75),
              rgba(244,240,255,0.75)
            );
        }

        .jl-empty-icon {
          width: 70px;
          height: 70px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin:
            0 auto 16px;

          border-radius: 23px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #0f8f70,
              #18a7b3,
              #7456d8
            );

          box-shadow:
            0 15px 30px
            rgba(15,143,112,0.18);

          animation:
            jlFloat 3s ease-in-out infinite;
        }

        @keyframes jlFloat {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        .jl-empty h3 {
          margin: 0;

          color: #26352e;

          font-size: 20px;

          font-weight: 900;
        }

        .jl-empty p {
          max-width: 480px;

          margin:
            8px auto 0;

          color: #7b8580;

          font-size: 13px;

          line-height: 1.6;
        }

        /* =====================================================
           MODALS
        ===================================================== */

        .jl-overlay {
          position: fixed;

          inset: 0;

          z-index: 999;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 22px;

          background:
            rgba(16,28,23,0.48);

          backdrop-filter:
            blur(12px);
        }

        .jl-modal {
          width:
            min(940px,100%);

          max-height:
            calc(100vh - 44px);

          overflow: auto;

          border-radius: 28px;

          border:
            1px solid
            rgba(255,255,255,0.7);

          background:
            #fcfcf9;

          box-shadow:
            0 40px 100px
            rgba(10,27,20,0.28);

          animation:
            jlModalIn
            0.22s ease;
        }

        @keyframes jlModalIn {
          from {
            opacity: 0;
            transform:
              translateY(15px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        .jl-modal-header {
          position: sticky;

          top: 0;

          z-index: 3;

          display: flex;

          align-items: flex-start;
          justify-content: space-between;

          gap: 18px;

          padding:
            24px 27px;

          border-bottom:
            1px solid #e8ebe5;

          background:
            rgba(252,252,249,0.94);

          backdrop-filter:
            blur(18px);
        }

        .jl-modal-kicker {
          margin-bottom: 5px;

          color: #0d876b;

          font-size: 10px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 0.12em;
        }

        .jl-modal-header h2 {
          margin: 0;

          color: #1c2923;

          font-size: 24px;

          line-height: 1.1;

          font-weight: 900;

          letter-spacing: -0.035em;
        }

        .jl-modal-close {
          width: 40px;
          height: 40px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex: 0 0 auto;

          border:
            1px solid #e2e6df;

          border-radius: 12px;

          background: white;

          color: #66726b;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .jl-modal-close:hover {
          transform:
            rotate(90deg);

          color: #b35445;

          border-color:
            #efcbc3;

          background:
            #fff8f6;
        }

        .jl-modal-body {
          padding: 27px;
        }

        .jl-detail-grid {
          display: grid;

          grid-template-columns:
            repeat(2,minmax(0,1fr));

          gap: 18px;
        }

        .jl-detail-block {
          padding: 18px;

          border:
            1px solid #e5e9e3;

          border-radius: 18px;

          background: white;

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            border-color 0.22s ease;
        }

        .jl-detail-block:hover {
          transform:
            translateY(-2px);

          border-color:
            #d1dfd8;

          box-shadow:
            0 9px 22px
            rgba(25,55,45,0.06);
        }

        .jl-detail-block.full {
          grid-column: 1 / -1;
        }

        .jl-detail-block h3 {
          margin:
            0 0 10px;

          color: #314038;

          font-size: 11px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 0.07em;
        }

        .jl-detail-block p {
          margin: 0;

          color: #626e67;

          font-size: 13px;

          line-height: 1.75;

          white-space: pre-wrap;
        }

        .jl-info-list {
          display: grid;

          grid-template-columns:
            repeat(2,minmax(0,1fr));

          gap: 10px;
        }

        .jl-info-item {
          padding: 11px 12px;

          border-radius: 12px;

          background: #f7f9f6;
        }

        .jl-info-item span {
          display: block;

          color: #8b948e;

          font-size: 9px;

          font-weight: 850;

          text-transform: uppercase;
        }

        .jl-info-item strong {
          display: block;

          margin-top: 4px;

          color: #26332c;

          font-size: 12px;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .jl-form {
          padding: 26px;
        }

        .jl-form-grid {
          display: grid;

          grid-template-columns:
            repeat(2,minmax(0,1fr));

          gap: 16px;
        }

        .jl-form-field {
          display: flex;

          flex-direction: column;

          gap: 7px;

          min-width: 0;
        }

        .jl-form-field.full {
          grid-column: 1 / -1;
        }

        .jl-form-field label {
          color: #39473f;

          font-size: 11px;

          font-weight: 900;
        }

        .jl-form-field label span {
          color: #b55b48;
        }

        .jl-input,
        .jl-textarea,
        .jl-form-select {
          width: 100%;

          border:
            1px solid #dfe5de;

          border-radius: 13px;

          background: white;

          color: #26342d;

          outline: none;

          font-size: 13px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .jl-input,
        .jl-form-select {
          height: 44px;

          padding:
            0 13px;
        }

        .jl-textarea {
          min-height: 105px;

          padding:
            12px 13px;

          resize: vertical;

          line-height: 1.55;
        }

        .jl-input:hover,
        .jl-form-select:hover,
        .jl-textarea:hover {
          border-color:
            #b9cec6;
        }

        .jl-input:focus,
        .jl-textarea:focus,
        .jl-form-select:focus {
          border-color:
            #19a48e;

          box-shadow:
            0 0 0 4px
            rgba(25,164,142,0.10);
        }

        .jl-video-box {
          padding: 17px;

          border:
            1px solid #ddd6f6;

          border-radius: 17px;

          background:
            linear-gradient(
              135deg,
              #f6f3ff,
              #f0fbfa
            );

          transition:
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .jl-video-box:hover {
          border-color:
            #c9bee9;

          box-shadow:
            0 12px 25px
            rgba(93,72,160,0.08);
        }

        .jl-video-check {
          display: flex;

          align-items: flex-start;

          gap: 11px;

          cursor: pointer;
        }

        .jl-video-check input {
          width: 18px;
          height: 18px;

          margin-top: 2px;

          accent-color:
            #0f8f70;
        }

        .jl-video-title {
          color: #3f3569;

          font-size: 13px;

          font-weight: 900;
        }

        .jl-video-subtitle {
          margin-top: 3px;

          color: #7d7890;

          font-size: 11px;

          line-height: 1.5;
        }

        /* =====================================================
           FORM BUTTONS
        ===================================================== */

        .jl-form-actions {
          display: flex;

          justify-content: flex-end;

          align-items: center;

          gap: 10px;

          margin-top: 23px;

          padding-top: 19px;

          border-top:
            1px solid #e9ece7;
        }

        .jl-form-cancel,
        .jl-form-submit {
          min-height: 44px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          padding:
            0 18px;

          border-radius: 12px;

          font-size: 12px;

          font-weight: 850;

          white-space: nowrap;

          cursor: pointer;

          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            background 0.22s ease,
            border-color 0.22s ease;
        }

        .jl-form-cancel {
          border:
            1px solid #dfe4de;

          background: white;

          color: #56625b;
        }

        .jl-form-cancel:hover {
          transform:
            translateY(-2px);

          border-color:
            #b9c9c1;

          background:
            #f8faf8;

          box-shadow:
            0 8px 18px
            rgba(25,55,45,0.07);
        }

        .jl-form-submit {
          border: 0;

          color: white;

          background:
            linear-gradient(
              100deg,
              #08745a,
              #12a29a,
              #6954d5
            );

          box-shadow:
            0 10px 23px
            rgba(15,143,112,0.20);
        }

        .jl-form-submit:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 16px 30px
            rgba(15,143,112,0.27);
        }

        .jl-form-submit:active,
        .jl-form-cancel:active,
        .jl-action:active {
          transform:
            translateY(0)
            scale(0.98);
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1150px) {

          .jl-hero-grid {
            grid-template-columns: 1fr;
          }

          .jl-hero-copy {
            min-height: auto;
          }

          .jl-command {
            grid-template-columns:
              repeat(2,1fr);
          }

          .jl-search {
            grid-column: 1 / -1;
          }

          .jl-job-inner {
            grid-template-columns: 1fr;
          }

          .jl-job-main {
            border-right: 0;

            border-bottom:
              1px solid #eceee8;
          }

        }

        @media (max-width: 760px) {

          .jl-page {
            padding: 15px;
          }

          .jl-hero {
            padding: 23px;

            border-radius: 25px;
          }

          .jl-hero-title {
            font-size: 43px;
          }

          .jl-hero-stats {
            grid-template-columns:
              1fr 1fr;
          }

          .jl-command {
            grid-template-columns:
              1fr;
          }

          .jl-search {
            grid-column: auto;
          }

          .jl-content-heading {
            align-items: flex-start;

            flex-direction: column;
          }

          .jl-meta-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .jl-job-top {
            flex-direction: column;
          }

          .jl-badges {
            justify-content:
              flex-start;
          }

          .jl-detail-grid,
          .jl-form-grid {
            grid-template-columns:
              1fr;
          }

          .jl-detail-block.full,
          .jl-form-field.full {
            grid-column: auto;
          }

          .jl-info-list {
            grid-template-columns:
              1fr;
          }

        }

        @media (max-width: 520px) {

          .jl-hero-actions {
            flex-direction: column;
          }

          .jl-primary-button,
          .jl-ghost-button {
            width: 100%;
          }

          .jl-hero-stats {
            grid-template-columns:
              1fr;
          }

          .jl-meta-grid {
            grid-template-columns:
              1fr;
          }

          .jl-job-main,
          .jl-job-side {
            padding: 20px;
          }

          .jl-job-title {
            font-size: 18px;
          }

          .jl-actions {
            grid-template-columns:
              1fr;
          }

          .jl-action.danger {
            grid-column: auto;
          }

          .jl-modal-body,
          .jl-form {
            padding: 19px;
          }

          .jl-form-actions {
            flex-direction: column-reverse;

            align-items: stretch;
          }

          .jl-form-cancel,
          .jl-form-submit {
            width: 100%;

            min-height: 46px;
          }

        }

        @media (max-width: 380px) {

          .jl-page {
            padding: 10px;
          }

          .jl-hero {
            padding: 18px;
          }

          .jl-hero-title {
            font-size: 36px;
          }

          .jl-job-main,
          .jl-job-side {
            padding: 17px;
          }

          .jl-pill {
            max-width: 100%;
          }

        }

      `}</style>

      <div className="jl-page">
        <div className="jl-container">

          {/* ===================================================
              HERO
          =================================================== */}

          <section className="jl-hero">

            <div className="jl-hero-grid">

              <div className="jl-hero-copy">

                <div>

                  <div className="jl-eyebrow">
                    <SparkleIcon size={14} />
                    Talent marketplace
                  </div>

                  <h1 className="jl-hero-title">
                    Build your next
                    <br />
                    <span>
                      great opportunity.
                    </span>
                  </h1>

                  <p className="jl-hero-description">
                    Create, organize and manage
                    job opportunities from one
                    focused workspace. Find the
                    right candidates with
                    structured roles, skills,
                    qualifications and application
                    requirements.
                  </p>

                </div>

                <div className="jl-hero-actions">

                  <button
                    type="button"
                    className="jl-primary-button"
                    onClick={openCreate}
                  >
                    <PlusIcon size={17} />
                    <span>
                      Post a new job
                    </span>
                  </button>

                  <button
                    type="button"
                    className="jl-ghost-button"
                    onClick={() =>
                      document
                        .getElementById(
                          "job-results"
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                        })
                    }
                  >
                    <BriefcaseIcon size={16} />
                    <span>
                      Explore listings
                    </span>
                  </button>

                </div>

              </div>

              <div className="jl-hero-stats">

                <div className="jl-stat">
                  <div className="jl-stat-label">
                    Total roles
                  </div>

                  <div className="jl-stat-value">
                    {jobs.length}
                  </div>

                  <div className="jl-stat-caption">
                    Opportunities created
                  </div>
                </div>

                <div className="jl-stat">
                  <div className="jl-stat-label">
                    Open now
                  </div>

                  <div className="jl-stat-value">
                    {openJobs}
                  </div>

                  <div className="jl-stat-caption">
                    Accepting applications
                  </div>
                </div>

                <div className="jl-stat">
                  <div className="jl-stat-label">
                    Closed
                  </div>

                  <div className="jl-stat-value">
                    {closedJobs}
                  </div>

                  <div className="jl-stat-caption">
                    No longer active
                  </div>
                </div>

                <div className="jl-stat">
                  <div className="jl-stat-label">
                    Video roles
                  </div>

                  <div className="jl-stat-value">
                    {videoJobs}
                  </div>

                  <div className="jl-stat-caption">
                    Candidate recordings
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* ===================================================
              FILTERS
          =================================================== */}

          <section className="jl-command">

            <div className="jl-search">
              <SearchIcon size={17} />

              <input
                type="text"
                placeholder="Search roles, skills, locations..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              className="jl-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All status
              </option>

              <option value="open">
                Open
              </option>

              <option value="closed">
                Closed
              </option>
            </select>

            <select
              className="jl-select"
              value={employmentFilter}
              onChange={(e) =>
                setEmploymentFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All employment
              </option>

              <option value="full-time">
                Full-time
              </option>

              <option value="internship">
                Internship
              </option>

              <option value="part-time">
                Part-time
              </option>
            </select>

            <select
              className="jl-select"
              value={locationFilter}
              onChange={(e) =>
                setLocationFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All locations
              </option>

              {locationOptions.map(
                (location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                )
              )}
            </select>

            <select
              className="jl-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="newest">
                Newest first
              </option>

              <option value="oldest">
                Oldest first
              </option>

              <option value="deadline">
                Deadline
              </option>

              <option value="title">
                Title A–Z
              </option>
            </select>

          </section>

          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (
            <div className="jl-error">
              {error}
            </div>
          )}

          {/* ===================================================
              RESULTS HEADER
          =================================================== */}

          <div
            id="job-results"
            className="jl-content-heading"
          >

            <div>
              <h2>
                Your{" "}
                <span>
                  opportunities
                </span>
              </h2>

              <p>
                Showing{" "}
                <strong>
                  {filteredJobs.length}
                </strong>{" "}
                of {jobs.length} job listings

                {activeFilterCount > 0
                  ? ` · ${activeFilterCount} filter${
                      activeFilterCount >
                      1
                        ? "s"
                        : ""
                    } active`
                  : ""}
              </p>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="jl-clear"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            )}

          </div>

          {/* ===================================================
              JOBS
          =================================================== */}

          <div className="jl-jobs">

            {filteredJobs.length === 0 ? (
              <div className="jl-empty">

                <div className="jl-empty-icon">
                  <FilterIcon size={28} />
                </div>

                <h3>
                  No opportunities found
                </h3>

                <p>
                  Try changing your search
                  or filters, or create a
                  new job opportunity to get
                  started.
                </p>

                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent:
                      "center",
                    gap: 9,
                    flexWrap: "wrap",
                  }}
                >

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      className="jl-form-cancel"
                      onClick={clearFilters}
                    >
                      Reset filters
                    </button>
                  )}

                  <button
                    type="button"
                    className="jl-form-submit"
                    onClick={openCreate}
                  >
                    <PlusIcon size={15} />
                    Create job
                  </button>

                </div>
              </div>
            ) : (
              filteredJobs.map((job) => {

                const requiredSkills =
                  job.required_skills || [];

                const preferredSkills =
                  job.preferred_skills || [];

                const branches =
                  job.eligible_branches || [];

                const visibleRequired =
                  requiredSkills.slice(0, 4);

                const visiblePreferred =
                  preferredSkills.slice(0, 3);

                const visibleBranches =
                  branches.slice(0, 3);

                const remainingRequired =
                  Math.max(
                    0,
                    requiredSkills.length -
                      visibleRequired.length
                  );

                const remainingPreferred =
                  Math.max(
                    0,
                    preferredSkills.length -
                      visiblePreferred.length
                  );

                const remainingBranches =
                  Math.max(
                    0,
                    branches.length -
                      visibleBranches.length
                  );

                const passed =
                  deadlinePassed(
                    job.application_deadline
                  );

                return (
                  <Card
                    key={job.id}
                    className="jl-job-card"
                  >

                    <div className="jl-job-inner">

                      {/* MAIN */}
                      <div className="jl-job-main">

                        <div className="jl-job-top">

                          <div className="jl-job-title-row">

                            <div className="jl-job-avatar">
                              <BriefcaseIcon
                                size={23}
                              />
                            </div>

                            <div>

                              <h3 className="jl-job-title">
                                {job.title ||
                                  "Untitled Position"}
                              </h3>

                              <div className="jl-job-posted">
                                Posted{" "}
                                {formatDate(
                                  job.created_at
                                )}
                              </div>

                            </div>

                          </div>

                          <div className="jl-badges">

                            <span
                              className={`jl-pill ${getStatusClass(
                                job.status
                              )}`}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius:
                                    "50%",
                                  background:
                                    "currentColor",
                                }}
                              />

                              {formatValue(
                                job.status ||
                                  "open"
                              )}
                            </span>

                            {job.require_video && (
                              <span className="jl-pill video-pill">
                                <VideoIcon
                                  size={12}
                                />
                                <span>
                                  Video required
                                </span>
                              </span>
                            )}

                          </div>

                        </div>

                        <p className="jl-description">
                          {job.description ||
                            "No description provided for this opportunity."}
                        </p>

                        <div className="jl-meta-grid">

                          <div className="jl-meta-box">
                            <div className="jl-meta-label">
                              <BriefcaseIcon
                                size={11}
                              />
                              Employment
                            </div>

                            <div className="jl-meta-value">
                              {formatValue(
                                job.employment_type
                              )}
                            </div>
                          </div>

                          <div className="jl-meta-box">
                            <div className="jl-meta-label">
                              Work mode
                            </div>

                            <div className="jl-meta-value">
                              {formatValue(
                                job.work_mode
                              )}
                            </div>
                          </div>

                          <div className="jl-meta-box">
                            <div className="jl-meta-label">
                              <MapPinIcon
                                size={11}
                              />
                              Location
                            </div>

                            <div className="jl-meta-value">
                              {job.location ||
                                "Not specified"}
                            </div>
                          </div>

                          <div className="jl-meta-box">
                            <div className="jl-meta-label">
                              Salary
                            </div>

                            <div className="jl-meta-value">
                              {job.salary ||
                                "Not specified"}
                            </div>
                          </div>

                        </div>

                        <div className="jl-section">

                          <div className="jl-section-title">
                            <GraduationIcon
                              size={13}
                            />
                            Qualification
                          </div>

                          <div className="jl-tags">

                            <span className="jl-tag">
                              {formatValue(
                                job.qualification
                              )}
                            </span>

                            {visibleBranches.map(
                              (branch) => (
                                <span
                                  key={branch}
                                  className="jl-tag branch"
                                >
                                  {branch}
                                </span>
                              )
                            )}

                            {remainingBranches >
                              0 && (
                              <span className="jl-more">
                                +
                                {
                                  remainingBranches
                                }{" "}
                                more
                              </span>
                            )}

                          </div>

                        </div>

                        <div className="jl-section">

                          <div className="jl-section-title">
                            <CheckIcon
                              size={13}
                            />
                            Required skills
                          </div>

                          <div className="jl-tags">

                            {visibleRequired.map(
                              (skill) => (
                                <span
                                  key={skill}
                                  className="jl-tag"
                                >
                                  {skill}
                                </span>
                              )
                            )}

                            {remainingRequired >
                              0 && (
                              <span className="jl-more">
                                +
                                {
                                  remainingRequired
                                }{" "}
                                more
                              </span>
                            )}

                            {requiredSkills.length ===
                              0 && (
                              <span className="jl-more">
                                No skills specified
                              </span>
                            )}

                          </div>

                        </div>

                        {preferredSkills.length >
                          0 && (
                          <div className="jl-section">

                            <div className="jl-section-title">
                              Better to have
                            </div>

                            <div className="jl-tags">

                              {visiblePreferred.map(
                                (skill) => (
                                  <span
                                    key={skill}
                                    className="jl-tag secondary"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}

                              {remainingPreferred >
                                0 && (
                                <span className="jl-more">
                                  +
                                  {
                                    remainingPreferred
                                  }{" "}
                                  more
                                </span>
                              )}

                            </div>

                          </div>
                        )}

                      </div>

                      {/* SIDE */}
                      <div className="jl-job-side">

                        <h4 className="jl-side-title">
                          Application overview
                        </h4>

                        <div className="jl-deadline-card">

                          <div className="jl-deadline-row">

                            <div
                              className={`jl-deadline-icon ${
                                passed
                                  ? "danger"
                                  : ""
                              }`}
                            >
                              <CalendarIcon
                                size={18}
                              />
                            </div>

                            <div>

                              <div className="jl-deadline-label">
                                Application deadline
                              </div>

                              <div className="jl-deadline-value">
                                {formatDate(
                                  job.application_deadline
                                )}
                              </div>

                            </div>

                          </div>

                          {passed &&
                            job.application_deadline && (
                              <div
                                style={{
                                  marginTop: 10,
                                  color:
                                    "#b65542",
                                  fontSize: 10,
                                  fontWeight: 800,
                                }}
                              >
                                This deadline
                                has passed.
                              </div>
                            )}

                        </div>

                        {job.require_video && (
                          <div className="jl-deadline-card">

                            <div className="jl-deadline-row">

                              <div
                                className="jl-deadline-icon"
                                style={{
                                  background:
                                    "#eeeaff",
                                  color:
                                    "#6044bd",
                                }}
                              >
                                <VideoIcon
                                  size={18}
                                />
                              </div>

                              <div>

                                <div className="jl-deadline-label">
                                  Candidate video
                                </div>

                                <div className="jl-deadline-value">
                                  Max{" "}
                                  {job.video_max_duration ||
                                    60}{" "}
                                  seconds
                                </div>

                              </div>

                            </div>

                          </div>
                        )}

                        <div className="jl-actions">

                          <button
                            type="button"
                            className="jl-action primary"
                            onClick={() =>
                              setSelectedJob(
                                job
                              )
                            }
                          >
                            <EyeIcon size={15} />
                            <span>
                              View details
                            </span>
                          </button>

                          <button
                            type="button"
                            className="jl-action secondary"
                            onClick={() =>
                              openEdit(job)
                            }
                          >
                            <EditIcon size={15} />
                            <span>
                              Edit
                            </span>
                          </button>

                          <button
                            type="button"
                            className="jl-action danger"
                            onClick={() =>
                              onDelete(job)
                            }
                          >
                            <ArchiveIcon
                              size={14}
                            />
                            <span>
                              Archive opportunity
                            </span>
                          </button>

                        </div>

                      </div>

                    </div>

                  </Card>
                );
              })
            )}

          </div>
        </div>
      </div>

      {/* =====================================================
          APP DIALOG
      ===================================================== */}

      <AppDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        showCancel={dialog.showCancel}
        destructive={dialog.destructive}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
        onClose={closeDialog}
      />

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedJob && (
        <div
          className="jl-overlay"
          onClick={() =>
            setSelectedJob(null)
          }
        >
          <div
            className="jl-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="jl-modal-header">

              <div>

                <div className="jl-modal-kicker">
                  Opportunity details
                </div>

                <h2>
                  {selectedJob.title}
                </h2>

                <div
                  style={{
                    marginTop: 6,
                    color: "#8a938d",
                    fontSize: 11,
                  }}
                >
                  Posted{" "}
                  {formatDate(
                    selectedJob.created_at
                  )}
                </div>

              </div>

              <button
                type="button"
                className="jl-modal-close"
                onClick={() =>
                  setSelectedJob(null)
                }
              >
                <CloseIcon size={18} />
              </button>

            </div>

            <div className="jl-modal-body">

              <div className="jl-detail-grid">

                <div className="jl-detail-block full">

                  <h3>
                    About the role
                  </h3>

                  <p>
                    {selectedJob.description ||
                      "No description provided."}
                  </p>

                </div>

                <div className="jl-detail-block full">

                  <h3>
                    Roles & responsibilities
                  </h3>

                  <p>
                    {selectedJob.responsibilities ||
                      "Not specified."}
                  </p>

                </div>

                <div className="jl-detail-block">

                  <h3>
                    Required skills
                  </h3>

                  <div className="jl-tags">

                    {(
                      selectedJob.required_skills ||
                      []
                    ).map((skill) => (
                      <span
                        key={skill}
                        className="jl-tag"
                      >
                        {skill}
                      </span>
                    ))}

                    {(!selectedJob.required_skills ||
                      selectedJob.required_skills
                        .length === 0) && (
                      <span className="jl-more">
                        Not specified
                      </span>
                    )}

                  </div>

                </div>

                <div className="jl-detail-block">

                  <h3>
                    Better-to-have skills
                  </h3>

                  <div className="jl-tags">

                    {(
                      selectedJob.preferred_skills ||
                      []
                    ).map((skill) => (
                      <span
                        key={skill}
                        className="jl-tag secondary"
                      >
                        {skill}
                      </span>
                    ))}

                    {(!selectedJob.preferred_skills ||
                      selectedJob.preferred_skills
                        .length === 0) && (
                      <span className="jl-more">
                        Not specified
                      </span>
                    )}

                  </div>

                </div>

                <div className="jl-detail-block">

                  <h3>
                    Qualification
                  </h3>

                  <p>
                    {formatValue(
                      selectedJob.qualification
                    )}
                  </p>

                </div>

                <div className="jl-detail-block">

                  <h3>
                    Eligible branches /
                    degrees
                  </h3>

                  <div className="jl-tags">

                    {(
                      selectedJob.eligible_branches ||
                      []
                    ).map((branch) => (
                      <span
                        key={branch}
                        className="jl-tag branch"
                      >
                        {branch}
                      </span>
                    ))}

                    {(!selectedJob.eligible_branches ||
                      selectedJob.eligible_branches
                        .length === 0) && (
                      <span className="jl-more">
                        Not specified
                      </span>
                    )}

                  </div>

                </div>

                <div className="jl-detail-block full">

                  <h3>
                    Job information
                  </h3>

                  <div className="jl-info-list">

                    <div className="jl-info-item">
                      <span>
                        Employment
                      </span>

                      <strong>
                        {formatValue(
                          selectedJob.employment_type
                        )}
                      </strong>
                    </div>

                    <div className="jl-info-item">
                      <span>
                        Work mode
                      </span>

                      <strong>
                        {formatValue(
                          selectedJob.work_mode
                        )}
                      </strong>
                    </div>

                    <div className="jl-info-item">
                      <span>
                        Location
                      </span>

                      <strong>
                        {selectedJob.location ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div className="jl-info-item">
                      <span>
                        Salary
                      </span>

                      <strong>
                        {selectedJob.salary ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div className="jl-info-item">
                      <span>
                        Status
                      </span>

                      <strong>
                        {formatValue(
                          selectedJob.status
                        )}
                      </strong>
                    </div>

                    <div className="jl-info-item">
                      <span>
                        Deadline
                      </span>

                      <strong>
                        {formatDate(
                          selectedJob.application_deadline
                        )}
                      </strong>
                    </div>

                  </div>

                </div>

                {selectedJob.require_video && (
                  <div className="jl-detail-block full">

                    <h3>
                      Candidate video
                      requirement
                    </h3>

                    <p>
                      Maximum duration:{" "}
                      <strong>
                        {selectedJob.video_max_duration ||
                          60}{" "}
                        seconds
                      </strong>

                      {"\n\n"}

                      {selectedJob.video_prompt ||
                        "No additional prompt provided."}
                    </p>

                  </div>
                )}

              </div>

              <div className="jl-form-actions">

                <button
                  type="button"
                  className="jl-form-cancel"
                  onClick={() =>
                    setSelectedJob(null)
                  }
                >
                  Close
                </button>

                <button
                  type="button"
                  className="jl-form-submit"
                  onClick={() =>
                    openEdit(
                      selectedJob
                    )
                  }
                >
                  <EditIcon size={14} />
                  <span>
                    Edit job
                  </span>
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {editing && (
        <div
          className="jl-overlay"
          onClick={() =>
            setEditing(null)
          }
        >
          <div
            className="jl-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="jl-modal-header">

              <div>

                <div className="jl-modal-kicker">
                  {editing.id
                    ? "Manage opportunity"
                    : "Create opportunity"}
                </div>

                <h2>
                  {editing.id
                    ? "Edit job"
                    : "Post a new job"}
                </h2>

              </div>

              <button
                type="button"
                className="jl-modal-close"
                onClick={() =>
                  setEditing(null)
                }
              >
                <CloseIcon size={18} />
              </button>

            </div>

            <form
              className="jl-form"
              onSubmit={onSave}
            >

              <div className="jl-form-grid">

                {/* JOB ROLE */}

                <div className="jl-form-field full">

                  <label>
                    Job role{" "}
                    <span>*</span>
                  </label>

                  <select
                    className="jl-form-select"
                    value={
                      editing.title || ""
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        title:
                          e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select a job role
                    </option>

                    {editing.title &&
                      !domainRoles.some(
                        (role) =>
                          role.domain_name ===
                          editing.title
                      ) && (
                        <option
                          value={
                            editing.title
                          }
                        >
                          {editing.title}
                        </option>
                      )}

                    {domainRoles.map(
                      (role) => (
                        <option
                          key={
                            role.domain_role_id ||
                            role.domain_name
                          }
                          value={
                            role.domain_name
                          }
                        >
                          {role.domain_name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* DESCRIPTION */}

                <div className="jl-form-field full">

                  <label>
                    About the role{" "}
                    <span>*</span>
                  </label>

                  <textarea
                    className="jl-textarea"
                    value={
                      editing.description ||
                      ""
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        description:
                          e.target.value,
                      })
                    }
                    placeholder="Describe the opportunity, team and what makes this role important..."
                    required
                  />

                </div>

                {/* RESPONSIBILITIES */}

                <div className="jl-form-field full">

                  <label>
                    Roles &
                    responsibilities{" "}
                    <span>*</span>
                  </label>

                  <textarea
                    className="jl-textarea"
                    value={
                      editing.responsibilities ||
                      ""
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        responsibilities:
                          e.target.value,
                      })
                    }
                    placeholder="Describe the key responsibilities..."
                    required
                  />

                </div>

                {/* REQUIRED SKILLS */}

                <div className="jl-form-field">

                  <label>
                    Required skills{" "}
                    <span>*</span>
                  </label>

                  <input
                    className="jl-input"
                    value={
                      editing.required_skills_csv ||
                      ""
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        required_skills_csv:
                          e.target.value,
                      })
                    }
                    placeholder="Python, React, SQL"
                    required
                  />

                </div>

                {/* PREFERRED SKILLS */}

                <div className="jl-form-field">

                  <label>
                    Better-to-have
                    skills
                  </label>

                  <input
                    className="jl-input"
                    value={
                      editing.preferred_skills_csv ||
                      ""
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        preferred_skills_csv:
                          e.target.value,
                      })
                    }
                    placeholder="AWS, Docker, Git"
                  />

                </div>

                {/* QUALIFICATION */}

                <div className="jl-form-field">

                  <label>
                    Qualification{" "}
                    <span>*</span>
                  </label>

                  <select
                    className="jl-form-select"
                    value={
                      editing.qualification ||
                      "bachelors"
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        qualification:
                          e.target.value,
                      })
                    }
                    required
                  >
                    <option value="bachelors">
                      Bachelor's
                    </option>

                    <option value="masters">
                      Master's
                    </option>

                    <option value="diploma">
                      Diploma
                    </option>

                    <option value="any">
                      Any qualification
                    </option>
                  </select>

                </div>

                {/* BRANCHES */}

                <div className="jl-form-field">

                  <label>
                    Eligible
                    branches /
                    degrees
                  </label>

                  <input
                    className="jl-input"
                    value={
                      editing.eligible_branches_csv ||
                      ""
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        eligible_branches_csv:
                          e.target.value,
                      })
                    }
                    placeholder="CSE, IT, ECE"
                  />

                </div>

                {/* EMPLOYMENT */}

                <div className="jl-form-field">

                  <label>
                    Employment type{" "}
                    <span>*</span>
                  </label>

                  <select
                    className="jl-form-select"
                    value={
                      editing.employment_type ||
                      "full-time"
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        employment_type:
                          e.target.value,
                      })
                    }
                    required
                  >
                    <option value="full-time">
                      Full-time
                    </option>

                    <option value="internship">
                      Internship
                    </option>

                    <option value="part-time">
                      Part-time
                    </option>
                  </select>

                </div>

                {/* WORK MODE */}

                <div className="jl-form-field">

                  <label>
                    Work mode{" "}
                    <span>*</span>
                  </label>

                  <select
                    className="jl-form-select"
                    value={
                      editing.work_mode ||
                      "onsite"
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        work_mode:
                          e.target.value,
                      })
                    }
                    required
                  >
                    <option value="onsite">
                      On-site
                    </option>

                    <option value="remote">
                      Remote
                    </option>

                    <option value="hybrid">
                      Hybrid
                    </option>
                  </select>

                </div>

                {/* LOCATION */}

                <div className="jl-form-field">

                  <label>
                    Location
                  </label>

                  <input
                    className="jl-input"
                    value={
                      editing.location || ""
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        location:
                          e.target.value,
                      })
                    }
                    placeholder="Visakhapatnam"
                  />

                </div>

                {/* SALARY */}

                <div className="jl-form-field">

                  <label>
                    Salary
                  </label>

                  <select
                    className="jl-form-select"
                    value={
                      editing.salary || ""
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        salary:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select salary range
                    </option>

                    {editing.salary &&
                      !SALARY_OPTIONS.includes(
                        editing.salary
                      ) && (
                        <option
                          value={
                            editing.salary
                          }
                        >
                          {editing.salary}
                        </option>
                      )}

                    {SALARY_OPTIONS.map(
                      (salary) => (
                        <option
                          key={salary}
                          value={salary}
                        >
                          {salary}
                        </option>
                      )
                    )}
                  </select>

                </div>

                {/* DEADLINE */}

                <div className="jl-form-field">

                  <label>
                    Application
                    deadline
                  </label>

                  <input
                    type="date"
                    className="jl-input"
                    value={
                      editing.application_deadline ||
                      ""
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        application_deadline:
                          e.target.value,
                      })
                    }
                  />

                </div>

                {/* VIDEO */}

                <div className="jl-form-field full">

                  <div className="jl-video-box">

                    <label className="jl-video-check">

                      <input
                        type="checkbox"
                        checked={Boolean(
                          editing.require_video
                        )}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            require_video:
                              e.target.checked,
                          })
                        }
                      />

                      <div>

                        <div className="jl-video-title">
                          Require candidate
                          video
                        </div>

                        <div className="jl-video-subtitle">
                          Ask candidates to
                          submit a short
                          recorded response
                          during the
                          application.
                        </div>

                      </div>

                    </label>

                    {editing.require_video && (
                      <div
                        style={{
                          marginTop: 17,
                          display: "grid",
                          gridTemplateColumns:
                            "160px 1fr",
                          gap: 12,
                        }}
                      >

                        <div className="jl-form-field">

                          <label>
                            Max duration
                          </label>

                          <select
                            className="jl-form-select"
                            value={
                              editing.video_max_duration ||
                              60
                            }
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                video_max_duration:
                                  Number(
                                    e.target
                                      .value
                                  ),
                              })
                            }
                          >
                            <option value={30}>
                              30 seconds
                            </option>

                            <option value={60}>
                              60 seconds
                            </option>

                            <option value={90}>
                              90 seconds
                            </option>

                            <option value={120}>
                              120 seconds
                            </option>
                          </select>

                        </div>

                        <div className="jl-form-field">

                          <label>
                            Video prompt
                          </label>

                          <input
                            className="jl-input"
                            value={
                              editing.video_prompt ||
                              ""
                            }
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                video_prompt:
                                  e.target.value,
                              })
                            }
                            placeholder="Tell us why you are a good fit..."
                          />

                        </div>

                      </div>
                    )}

                  </div>

                </div>

                {/* STATUS */}

                <div className="jl-form-field">

                  <label>
                    Listing status
                  </label>

                  <select
                    className="jl-form-select"
                    value={
                      editing.status ||
                      "open"
                    }
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        status:
                          e.target.value,
                      })
                    }
                  >
                    <option value="open">
                      Open
                    </option>

                    <option value="closed">
                      Closed
                    </option>
                  </select>

                </div>

              </div>

              <div className="jl-form-actions">

                <button
                  type="button"
                  className="jl-form-cancel"
                  onClick={() =>
                    setEditing(null)
                  }
                >
                  <span>
                    Cancel
                  </span>
                </button>

                <button
                  type="submit"
                  className="jl-form-submit"
                >
                  <CheckIcon size={15} />

                  <span>
                    {editing.id
                      ? "Save changes"
                      : "Post job"}
                  </span>
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default JobListings;