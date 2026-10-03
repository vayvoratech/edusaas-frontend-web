import React, { useEffect, useMemo, useState } from "react";
import {
  getMyJobApplications,
  getApplicationVideoUrl,
  getMyInterview,
} from "../services/api";

import AppDialog from "../components/ui/AppDialog";

/* =========================================================
   Professional SVG Icons
========================================================= */

const BriefcaseIcon = ({ size = 20, strokeWidth = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="7"
      width="18"
      height="13"
      rx="2.5"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
    <path
      d="M8 7V5.5C8 4.67 8.67 4 9.5 4h5c.83 0 1.5.67 1.5 1.5V7"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path
      d="M3 11h18M10 11v1.5h4V11"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = ({ size = 19 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="10.8"
      cy="10.8"
      r="6.8"
      stroke="currentColor"
      strokeWidth="1.9"
    />
    <path
      d="m16 16 4.2 4.2"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </svg>
);

const FileIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M7 3.75h7l4 4V20a1.25 1.25 0 0 1-1.25 1.25h-9.5A1.25 1.25 0 0 1 6 20V5A1.25 1.25 0 0 1 7.25 3.75Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M14 3.75V8h4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M9 12h6M9 15.5h6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const VideoIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="5"
      width="13"
      height="14"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="m16 10 4.1-2.35A.6.6 0 0 1 21 8.17v7.66a.6.6 0 0 1-.9.52L16 14v-4Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="m8.5 9 4 3-4 3V9Z"
      fill="currentColor"
    />
  </svg>
);

const CalendarIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="3.5"
      y="5"
      width="17"
      height="15.5"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M8 13h2M14 13h2M8 16.5h2M14 16.5h2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ClockIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="8.5"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M12 7.5v5l3.2 2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = ({ size = 16, strokeWidth = 2.4 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="m5 12.5 4.2 4.2L19 7"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M5 12h13M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExternalLinkIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M14 5h5v5M19 5l-8 8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const XIcon = ({ size = 19 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="m6 6 12 12M18 6 6 18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </svg>
);

const SparkleIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="m12 3 1.25 5.05L18 10l-4.75 1.95L12 17l-1.25-5.05L6 10l4.75-1.95L12 3Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="m19 15 .55 2.15L21.5 18l-1.95.85L19 21l-.55-2.15L16.5 18l1.95-.85L19 15ZM5 4l.4 1.6L7 6l-1.6.4L5 8l-.4-1.6L3 6l1.6-.4L5 4Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const BriefcaseSmallIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="4"
      y="7"
      width="16"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M4 11h16M10 11v1.5h4V11"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AlertIcon = ({ size = 19 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10.3 4.8 3.4 17a2 2 0 0 0 1.75 3h13.7a2 2 0 0 0 1.75-3L13.7 4.8a2 2 0 0 0-3.4 0Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M12 9v4M12 16.5v.1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const PlayCircleIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="8.7"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="m10 8.8 5 3.2-5 3.2V8.8Z"
      fill="currentColor"
    />
  </svg>
);

const UserCheckIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M3.5 20a6 6 0 0 1 12 0"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="m16 15.5 2 2 3.5-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshIcon = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M20 11a8 8 0 0 0-14.7-4L3 10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 5.5V10h4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 13a8 8 0 0 0 14.7 4L21 14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 18.5V14h-4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function StudentJobApplications() {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingInterview, setLoadingInterview] = useState(false);

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
    setDialog((prev) => ({ ...prev, open: false }));
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

  /* ---------------------------------------------------------
     Load applications
  --------------------------------------------------------- */

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyJobApplications();

        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "Failed to load job applications:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.error ||
            "Failed to load your job applications."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  /* ---------------------------------------------------------
     Load interviews for applications
  --------------------------------------------------------- */

  useEffect(() => {
    if (!applications.length) {
      setInterviews({});
      return;
    }

    const loadInterviews = async () => {
      try {
        setLoadingInterviews(true);

        // sort applications based on timestamp
        const sortedApplications = [...applications].sort(
          (a, b) =>
            new Date(b.applied_at || b.created_at) -
            new Date(a.applied_at || a.created_at)
        );

        const results = await Promise.all(
          sortedApplications.map(async (application) => {
            if (!application?.job_id) {
              return null;
            }

            try {
              const interview = await getMyInterview(
                application.job_id
              );

              return {
                applicationId: application.id,
                interview,
              };
            } catch (err) {
              // 404 means there is no interview for this application.
              if (err.response?.status !== 404) {
                console.warn(
                  "Could not load interview:",
                  application.id,
                  err.response?.data || err.message
                );
              }

              return null;
            }
          })
        );

        const interviewMap = {};

        results.forEach((result) => {
          if (result?.applicationId && result?.interview) {
            interviewMap[result.applicationId] = result.interview;
          }
        });

        setInterviews(interviewMap);
      } finally {
        setLoadingInterviews(false);
      }
    };

    loadInterviews();
  }, [applications]);

  /* ---------------------------------------------------------
     Helpers
  --------------------------------------------------------- */

  const normalizeStatus = (status) => {
    return String(status || "submitted")
      .trim()
      .toLowerCase();
  };

  const getStatusLabel = (status) => {
    switch (normalizeStatus(status)) {
      case "shortlisted":
        return "Shortlisted";

      case "rejected":
        return "Rejected";

      case "submitted":
      default:
        return "Submitted";
    }
  };

  const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
      case "shortlisted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "submitted":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusDot = (status) => {
    switch (normalizeStatus(status)) {
      case "shortlisted":
        return "bg-emerald-500";

      case "rejected":
        return "bg-red-500";

      default:
        return "bg-blue-500";
    }
  };

  const formatDate = (date, includeTime = false) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(includeTime
        ? {
            hour: "numeric",
            minute: "2-digit",
          }
        : {}),
    });
  };

  const getInterview = (application) => {
    const interview =
      application?.interview ||
      interviews[application?.id] ||
      null;

    if (!interview) {
      return null;
    }

    return interview.interview
      ? {
          ...interview.interview,
          application_id: interview.application_id,
          job_id: interview.job_id,
          job_title: interview.job_title,
        }
      : interview;
  };

  const hasResume = (application) => {
    return Boolean(
      application?.application_data?.resume
    );
  };

  const hasVideo = (application) => {
    return Boolean(
      application?.application_data?.video?.key
    );
  };

  const getInterviewLabel = (application) => {
    const interview = getInterview(application);

    if (!interview) {
      return "No interview scheduled";
    }

    return interview.interview_type
      ? String(interview.interview_type)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "Interview scheduled";
  };

  /* ---------------------------------------------------------
     Statistics
  --------------------------------------------------------- */

  const statistics = useMemo(() => {
    const total = applications.length;

    const submitted = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "submitted"
    ).length;

    const shortlisted = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "shortlisted"
    ).length;

    const rejected = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "rejected"
    ).length;

    const interviewCount = applications.filter(
      (application) =>
        Boolean(
          application?.interview ||
            interviews[application?.id]
        )
    ).length;

    return {
      total,
      submitted,
      shortlisted,
      rejected,
      interviewCount,
    };
  }, [applications, interviews]);

  /* ---------------------------------------------------------
     Filtering
  --------------------------------------------------------- */

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const status = normalizeStatus(application.status);

      const title = String(
        application.job?.title || ""
      ).toLowerCase();

      const company = String(
        application.job?.company || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        company.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  /* ---------------------------------------------------------
     Video
  --------------------------------------------------------- */

  const handleViewVideo = async (application) => {
    if (!application?.job_id || !application?.id) {
      return;
    }

    try {
      setLoadingVideo(true);

      const result = await getApplicationVideoUrl(
        application.job_id,
        application.id
      );

      if (result?.url) {
        window.open(
          result.url,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (err) {
      console.error(
        "Failed to open application video:",
        err.response?.data || err.message
      );

      showDialog({
        type: "error",
        title: "Video Unavailable",
        message:
          err.response?.data?.error ||
          "Failed to open the application video.",
        confirmText: "OK",
      });
    } finally {
      setLoadingVideo(false);
    }
  };

  /* ---------------------------------------------------------
     Interview
  --------------------------------------------------------- */

  const handleViewInterview = async (application) => {
    if (!application?.job_id) {
      return;
    }

    try {
      setLoadingInterview(true);

      let interview = getInterview(application);

      if (interview) {
        setSelectedInterview(
          interview.interview
            ? {
                ...interview.interview,
                application_id: interview.application_id,
                job_id: interview.job_id,
                job_title: interview.job_title,
              }
            : interview
        );
      }
    } catch (err) {
      console.error(
        "Failed to load interview:",
        err.response?.data || err.message
      );

      showDialog({
        type: "error",
        title: "Interview Unavailable",
        message:
          err.response?.data?.error ||
          "Failed to load interview details.",
        confirmText: "OK",
      });
    } finally {
      setLoadingInterview(false);
    }
  };

  /* ---------------------------------------------------------
     Resume URL
  --------------------------------------------------------- */

  const getResumeUrl = (application) => {
    const url =
      application?.application_data?.resume?.url;

    if (!url) {
      return null;
    }

    if (url.startsWith("http")) {
      return url;
    }

    return `http://localhost:5000${url}`;
  };

  /* ---------------------------------------------------------
     Progress timeline
  --------------------------------------------------------- */

  const ApplicationProgress = ({ application }) => {
    const interview = getInterview(application);
    const status = normalizeStatus(application.status);

    const isShortlisted =
      status === "shortlisted" ||
      status === "selected" ||
      !!interview;

    const isInterviewScheduled = !!interview;

    const Step = ({
      completed,
      active,
      number,
      label,
    }) => (
      <div className="application-step flex shrink-0 items-center gap-2">
        <div
          className={`step-circle flex h-8 w-8 items-center justify-center rounded-full ${
            completed
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200"
              : active
              ? "border-2 border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm"
              : "border-2 border-slate-200 bg-white text-slate-400"
          }`}
        >
          {completed ? (
            <CheckIcon size={15} strokeWidth={2.8} />
          ) : (
            number
          )}
        </div>

        <span
          className={`font-semibold ${
            completed
              ? "text-emerald-600"
              : active
              ? "text-indigo-600"
              : "text-slate-400"
          }`}
        >
          {label}
        </span>
      </div>
    );

    if (status === "rejected") {
      return (
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <Step
            completed
            number="1"
            label="Submitted"
          />

          <div className="h-px min-w-[30px] flex-1 bg-gradient-to-r from-emerald-300 to-red-200" />

          <Step
            completed
            number="2"
            label="Rejected"
          />
        </div>
      );
    }

    return (
      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Step
          completed
          number="1"
          label="Submitted"
        />

        <div className="h-px min-w-[25px] flex-1 bg-gradient-to-r from-emerald-300 to-indigo-200" />

        <Step
          completed={isShortlisted}
          active={!isShortlisted}
          number="2"
          label="Under Review"
        />

        <div className="h-px min-w-[25px] flex-1 bg-gradient-to-r from-indigo-200 to-violet-200" />

        <Step
          completed={isShortlisted}
          active={isShortlisted && !isInterviewScheduled}
          number="3"
          label="Shortlisted"
        />

        <div className="h-px min-w-[25px] flex-1 bg-gradient-to-r from-violet-200 to-indigo-200" />

        <Step
          completed={isInterviewScheduled}
          active={isShortlisted && !isInterviewScheduled}
          number="4"
          label={
            isInterviewScheduled
              ? "Interview Scheduled"
              : "Interview"
          }
        />
      </div>
    );
  };

  /* ---------------------------------------------------------
     Loading
  --------------------------------------------------------- */

  if (loading) {
    return (
      <>
        <style>{`
          .student-app-loading {
            background:
              radial-gradient(circle at 10% 10%, rgba(99,102,241,.12), transparent 28%),
              radial-gradient(circle at 90% 15%, rgba(139,92,246,.10), transparent 28%),
              linear-gradient(135deg,#f8fafc 0%,#eef2ff 48%,#f8fafc 100%);
          }
        `}</style>

        <div className="student-app-loading min-h-full p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="animate-pulse">
              <div className="h-9 w-64 rounded-xl bg-white/80 shadow-sm" />

              <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/70" />

              <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-28 rounded-2xl border border-white/80 bg-white/80 shadow-sm"
                  />
                ))}
              </div>

              <div className="mt-6 h-16 rounded-2xl border border-white/80 bg-white/80 shadow-sm" />

              <div className="mt-5 space-y-4">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-64 rounded-3xl border border-white/80 bg-white/80 shadow-sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ---------------------------------------------------------
     Error
  --------------------------------------------------------- */

  if (error) {
    return (
      <>
        <style>{`
          .student-app-error {
            background:
              radial-gradient(circle at 10% 10%, rgba(99,102,241,.10), transparent 30%),
              linear-gradient(135deg,#f8fafc,#eef2ff,#f8fafc);
          }
        `}</style>

        <div className="student-app-error min-h-full p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                <BriefcaseIcon size={21} />
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Job Applications
                </h1>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Track your applications and stay updated on your hiring progress.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-lg shadow-red-100/50">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <AlertIcon />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Unable to load applications
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ---------------------------------------------------------
     Main UI
  --------------------------------------------------------- */

  return (
    <>
      <style>{`
        .student-job-applications-page {
          min-height: 100%;
          background:
            radial-gradient(circle at 0% 0%, rgba(99,102,241,.12), transparent 25%),
            radial-gradient(circle at 100% 0%, rgba(168,85,247,.10), transparent 25%),
            radial-gradient(circle at 50% 100%, rgba(59,130,246,.07), transparent 30%),
            linear-gradient(135deg,#f8fafc 0%,#f1f5ff 48%,#faf7ff 100%);
        }

        .premium-header {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.9);
          background:
            linear-gradient(135deg,rgba(255,255,255,.96),rgba(248,250,255,.94));
          box-shadow:
            0 20px 50px rgba(30,41,59,.08),
            0 4px 12px rgba(99,102,241,.05);
        }

        .premium-header::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -80px;
          top: -110px;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            rgba(99,102,241,.17),
            rgba(139,92,246,.08)
          );
          filter: blur(3px);
        }

        .premium-header::after {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          left: -90px;
          bottom: -100px;
          border-radius: 999px;
          background: rgba(59,130,246,.08);
        }

        .gradient-title {
          background: linear-gradient(
            90deg,
            #172554 0%,
            #3730a3 48%,
            #6d28d9 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }

        .premium-stat {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.92);
          background: rgba(255,255,255,.86);
          box-shadow:
            0 14px 35px rgba(30,41,59,.06),
            inset 0 1px 0 rgba(255,255,255,.8);
          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .premium-stat:hover {
          transform: translateY(-3px);
          box-shadow:
            0 20px 42px rgba(30,41,59,.10),
            0 8px 18px rgba(99,102,241,.06);
        }

        .premium-stat::after {
          content: "";
          position: absolute;
          width: 90px;
          height: 90px;
          right: -35px;
          top: -35px;
          border-radius: 999px;
          background: var(--stat-glow);
          filter: blur(2px);
        }

        .application-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(226,232,240,.9);
          background: rgba(255,255,255,.94);
          box-shadow:
            0 12px 35px rgba(15,23,42,.055),
            0 2px 8px rgba(99,102,241,.035);
          transition:
            transform .28s ease,
            box-shadow .28s ease,
            border-color .28s ease;
        }

        .application-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(
            90deg,
            #2563eb,
            #4f46e5,
            #7c3aed,
            #8b5cf6
          );
          opacity: .85;
        }

        .application-card:hover {
          transform: translateY(-3px);
          border-color: rgba(129,140,248,.35);
          box-shadow:
            0 24px 55px rgba(15,23,42,.09),
            0 8px 24px rgba(79,70,229,.08);
        }

        .application-icon {
          background: linear-gradient(
            135deg,
            #eef2ff,
            #e0e7ff 55%,
            #ede9fe
          );
          color: #4338ca;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.9),
            0 8px 18px rgba(79,70,229,.10);
        }

        .detail-card {
          border: 1px solid #e8edf5;
          background: linear-gradient(
            145deg,
            rgba(248,250,252,.96),
            rgba(241,245,249,.75)
          );
          transition:
            transform .2s ease,
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .detail-card:hover {
          transform: translateY(-2px);
          border-color: #d8def0;
          box-shadow: 0 10px 24px rgba(15,23,42,.055);
        }

        .action-button {
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            background .2s ease,
            border-color .2s ease;
        }

        .action-button:hover {
          transform: translateY(-1px);
        }

        .primary-action {
          background: linear-gradient(
            135deg,
            #2563eb,
            #4f46e5 55%,
            #7c3aed
          );
          box-shadow: 0 8px 18px rgba(79,70,229,.22);
        }

        .primary-action:hover {
          box-shadow: 0 12px 24px rgba(79,70,229,.28);
        }

        .filter-active {
          background: linear-gradient(
            135deg,
            #2563eb,
            #4f46e5,
            #7c3aed
          );
          box-shadow:
            0 7px 16px rgba(79,70,229,.20),
            inset 0 1px 0 rgba(255,255,255,.18);
        }

        .filter-button {
          transition:
            transform .2s ease,
            background .2s ease,
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .filter-button:hover {
          transform: translateY(-1px);
        }

        .modal-backdrop {
          backdrop-filter: blur(9px);
          -webkit-backdrop-filter: blur(9px);
          background: rgba(15,23,42,.56);
        }

        .premium-modal {
          border: 1px solid rgba(255,255,255,.9);
          background: rgba(255,255,255,.98);
          box-shadow:
            0 35px 90px rgba(15,23,42,.24),
            0 10px 30px rgba(79,70,229,.10);
        }

        .modal-gradient-header {
          background:
            radial-gradient(circle at 100% 0%, rgba(129,140,248,.17), transparent 32%),
            linear-gradient(135deg,#ffffff,#f8faff);
        }

        .status-pill {
          box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
        }

        .progress-shell {
          border: 1px solid #edf0f7;
          background: linear-gradient(
            135deg,
            rgba(248,250,252,.8),
            rgba(245,247,255,.72)
          );
        }

        .empty-card {
          background:
            radial-gradient(circle at 50% 0%, rgba(99,102,241,.11), transparent 34%),
            linear-gradient(145deg,#ffffff,#f8faff);
          box-shadow:
            0 22px 60px rgba(30,41,59,.08);
        }

        .empty-icon {
          background: linear-gradient(
            135deg,
            #eef2ff,
            #e0e7ff,
            #ede9fe
          );
          color: #4f46e5;
          box-shadow:
            0 15px 30px rgba(79,70,229,.13),
            inset 0 1px 0 rgba(255,255,255,.9);
        }

        .close-button {
          transition:
            transform .2s ease,
            background .2s ease,
            color .2s ease;
        }

        .close-button:hover {
          transform: rotate(4deg);
        }

        @media (prefers-reduced-motion: reduce) {
          .premium-stat,
          .application-card,
          .detail-card,
          .action-button,
          .filter-button,
          .close-button {
            transition: none !important;
          }
        }

        @media (max-width: 640px) {
          .application-step span {
            white-space: nowrap;
          }

          .progress-shell {
            overflow-x: auto;
          }
        }
      `}</style>

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
      />

      <div className="student-job-applications-page min-h-full px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-7xl">

          {/* =====================================================
              Header
          ===================================================== */}

          <div className="premium-header rounded-3xl px-4 py-4 sm:px-6 sm:py-5">
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                  <BriefcaseIcon size={23} />
                </div>

                <div className="min-w-0">
                  <h1 className="gradient-title text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
                    Job Applications
                  </h1>

                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                    Track your applications and stay updated on your hiring progress.
                  </p>
                </div>
              </div>

              <div className="flex w-fit items-center gap-3 rounded-2xl border border-indigo-100/80 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BriefcaseSmallIcon size={17} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Total
                  </p>

                  <p className="mt-0.5 text-xl font-extrabold leading-none text-slate-900">
                    {statistics.total}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              Statistics
          ===================================================== */}

          {applications.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">

              <div
                className="premium-stat rounded-2xl p-4"
                style={{ "--stat-glow": "rgba(59,130,246,.10)" }}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Submitted
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      {statistics.submitted}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileIcon size={18} />
                  </div>
                </div>

                <p className="relative z-10 mt-2 text-[11px] font-medium text-slate-500">
                  Applications under review
                </p>
              </div>

              <div
                className="premium-stat rounded-2xl p-4"
                style={{ "--stat-glow": "rgba(16,185,129,.11)" }}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Shortlisted
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      {statistics.shortlisted}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <UserCheckIcon size={18} />
                  </div>
                </div>

                <p className="relative z-10 mt-2 text-[11px] font-medium text-slate-500">
                  Applications progressed
                </p>
              </div>

              <div
                className="premium-stat rounded-2xl p-4"
                style={{ "--stat-glow": "rgba(239,68,68,.09)" }}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Rejected
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      {statistics.rejected}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <XIcon size={17} />
                  </div>
                </div>

                <p className="relative z-10 mt-2 text-[11px] font-medium text-slate-500">
                  Applications not progressed
                </p>
              </div>

              <div
                className="premium-stat rounded-2xl p-4"
                style={{ "--stat-glow": "rgba(124,58,237,.10)" }}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Interviews
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                      {statistics.interviewCount}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <CalendarIcon size={18} />
                  </div>
                </div>

                <p className="relative z-10 mt-2 text-[11px] font-medium text-slate-500">
                  Interview opportunities
                </p>
              </div>

            </div>
          )}

          {/* =====================================================
              Search / Filter
          ===================================================== */}

          <div className="mt-4 rounded-2xl border border-white/90 bg-white/90 p-2.5 shadow-lg shadow-slate-200/40 backdrop-blur">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">

              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500">
                  <SearchIcon size={18} />
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by job title or company..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100/70"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">

                {[
                  ["all", "All"],
                  ["submitted", "Submitted"],
                  ["shortlisted", "Shortlisted"],
                  ["rejected", "Rejected"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`filter-button rounded-xl px-3 py-2 text-xs font-bold ${
                      statusFilter === value
                        ? "filter-active text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}

              </div>
            </div>
          </div>

          {/* =====================================================
              Result count
          ===================================================== */}

          {applications.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-xs font-semibold text-slate-500">
                <span className="font-extrabold text-indigo-600">
                  {filteredApplications.length}
                </span>{" "}
                {filteredApplications.length === 1
                  ? "application"
                  : "applications"}{" "}
                found
              </p>

              {loadingInterviews && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-500">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                  Updating interview details...
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              Empty state
          ===================================================== */}

          {applications.length === 0 ? (
            <div className="empty-card mt-5 rounded-3xl border border-white/90 p-9 text-center sm:p-12">

              <div className="empty-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                <BriefcaseIcon size={30} />
              </div>

              <div className="mx-auto mt-5 flex w-fit items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-600">
                <SparkleIcon size={13} />
                Your career journey
              </div>

              <h2 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                No applications yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Jobs you apply for will appear here. Once you submit an
                application, you can track its progress from this page.
              </p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="empty-card mt-5 rounded-3xl border border-white/90 p-8 text-center sm:p-10">

              <div className="empty-icon mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                <SearchIcon size={25} />
              </div>

              <h2 className="mt-4 text-lg font-extrabold text-slate-900">
                No matching applications
              </h2>

              <p className="mt-1.5 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="action-button primary-action mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white"
              >
                <RefreshIcon size={15} />
                Clear Filters
              </button>
            </div>
          ) : (

            /* =====================================================
               Applications
            ===================================================== */

            <div className="mt-4 space-y-4">

              {filteredApplications.map((application) => {
                const interview = getInterview(application);
                const resumeAvailable = hasResume(application);
                const videoAvailable = hasVideo(application);

                return (
                  <div
                    key={application.id}
                    className="application-card rounded-3xl"
                  >

                    {/* =================================================
                        Card Header
                    ================================================= */}

                    <div className="border-b border-slate-100/90 p-4 sm:p-5">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex min-w-0 items-start gap-3">

                          <div className="application-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                            <BriefcaseIcon size={21} />
                          </div>

                          <div className="min-w-0">
                            <h2 className="text-base font-extrabold leading-tight text-slate-900 sm:text-lg">
                              {application.job?.title ||
                                "Job Opportunity"}
                            </h2>

                            {application.job?.company && (
                              <p className="mt-1 text-sm font-semibold text-indigo-600">
                                {application.job.company}
                              </p>
                            )}

                            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                              <ClockIcon size={13} />
                              <span>
                                Applied{" "}
                                {formatDate(
                                  application.applied_at
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`status-pill inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold ${getStatusStyle(
                            application.status
                          )}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${getStatusDot(
                              application.status
                            )}`}
                          />

                          {getStatusLabel(application.status)}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="progress-shell mt-4 rounded-2xl px-3 py-3 sm:px-4">
                        <ApplicationProgress
                          application={application}
                        />
                      </div>
                    </div>

                    {/* =================================================
                        Details
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">

                      {/* Resume */}

                      <div className="detail-card rounded-2xl p-3.5">
                        <div className="flex items-center justify-between gap-2">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileIcon size={18} />
                          </div>

                          <span
                            className={`text-[10px] font-bold ${
                              resumeAvailable
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          >
                            {resumeAvailable
                              ? "✓ Submitted"
                              : "Not available"}
                          </span>
                        </div>

                        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Resume
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-slate-700">
                          {resumeAvailable
                            ? application.application_data
                                ?.resume?.file_name ||
                              "Resume submitted"
                            : "Not submitted"}
                        </p>
                      </div>

                      {/* Video */}

                      <div className="detail-card rounded-2xl p-3.5">
                        <div className="flex items-center justify-between gap-2">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <VideoIcon size={18} />
                          </div>

                          <span
                            className={`text-[10px] font-bold ${
                              videoAvailable
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          >
                            {videoAvailable
                              ? "✓ Submitted"
                              : "Not available"}
                          </span>
                        </div>

                        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Video Introduction
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {videoAvailable
                            ? "Self-introduction submitted"
                            : "No video submitted"}
                        </p>
                      </div>

                      {/* Interview */}

                      <div className="detail-card rounded-2xl p-3.5">
                        <div className="flex items-center justify-between gap-2">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CalendarIcon size={18} />
                          </div>

                          <span
                            className={`text-[10px] font-bold ${
                              interview
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                          >
                            {interview
                              ? "Scheduled"
                              : "Pending"}
                          </span>
                        </div>

                        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Interview
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {getInterviewLabel(application)}
                        </p>

                        {interview?.scheduled_at && (
                          <p className="mt-1 text-[11px] font-medium text-slate-400">
                            {formatDate(
                              interview.scheduled_at,
                              true
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* =================================================
                        Actions
                    ================================================= */}

                    <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/30 px-4 py-3 sm:px-5">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedApplication(application)
                        }
                        className="action-button inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700"
                      >
                        <FileIcon size={15} />
                        View Application
                      </button>

                      {videoAvailable && (
                        <button
                          type="button"
                          onClick={() =>
                            handleViewVideo(application)
                          }
                          disabled={loadingVideo}
                          className="action-button inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <PlayCircleIcon size={16} />
                          {loadingVideo
                            ? "Opening..."
                            : "Watch Video"}
                        </button>
                      )}

                      {interview && (
                        <button
                          type="button"
                          onClick={() =>
                            handleViewInterview(application)
                          }
                          disabled={loadingInterview}
                          className="action-button inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CalendarIcon size={16} />
                          {loadingInterview
                            ? "Loading..."
                            : "View Interview"}
                        </button>
                      )}

                      {interview?.meeting_link && (
                        <a
                          href={interview.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-button primary-action inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-white"
                        >
                          Join Interview
                          <ArrowRightIcon size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================
              Application Details Modal
          ========================================================= */}

          {selectedApplication && (
            <div
              className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-3 py-5 sm:px-4 sm:py-6"
              onClick={() =>
                setSelectedApplication(null)
              }
            >
              <div
                className="premium-modal max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                {/* Modal Header */}

                <div className="modal-gradient-header sticky top-0 z-10 border-b border-slate-200/80 px-5 py-5 sm:px-6">

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-start gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                        <BriefcaseIcon size={21} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-600">
                          Application
                        </p>

                        <h2 className="mt-1 truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                          {selectedApplication.job?.title ||
                            "Job Opportunity"}
                        </h2>

                        {selectedApplication.job?.company && (
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {selectedApplication.job.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedApplication(null)
                      }
                      className="close-button flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <XIcon size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:space-y-5 sm:p-6">

                  {/* Status */}

                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/70 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-400">
                          Current Status
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          Your application status
                        </p>
                      </div>

                      <span
                        className={`status-pill inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${getStatusStyle(
                          selectedApplication.status
                        )}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${getStatusDot(
                            selectedApplication.status
                          )}`}
                        />

                        {getStatusLabel(
                          selectedApplication.status
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Application Info */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <div className="detail-card rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <CalendarIcon size={16} />
                        </div>

                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                          Applied On
                        </p>
                      </div>

                      <p className="mt-3 text-sm font-bold text-slate-700">
                        {formatDate(
                          selectedApplication.applied_at,
                          true
                        )}
                      </p>
                    </div>

                    <div className="detail-card rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                          <FileIcon size={16} />
                        </div>

                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                          Application ID
                        </p>
                      </div>

                      <p className="mt-3 truncate text-sm font-bold text-slate-700">
                        {selectedApplication.id}
                      </p>
                    </div>
                  </div>

                  {/* Resume */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FileIcon size={18} />
                        </div>

                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                            Submitted Resume
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {selectedApplication
                              .application_data?.resume
                              ?.file_name ||
                              "No resume attached"}
                          </p>
                        </div>
                      </div>

                      {getResumeUrl(
                        selectedApplication
                      ) && (
                        <a
                          href={getResumeUrl(
                            selectedApplication
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-button inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          Open Resume
                          <ExternalLinkIcon size={15} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Video */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <VideoIcon size={18} />
                        </div>

                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                            Video Introduction
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {hasVideo(
                              selectedApplication
                            )
                              ? "Your video introduction was submitted."
                              : "No video introduction available."}
                          </p>
                        </div>
                      </div>

                      {hasVideo(
                        selectedApplication
                      ) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleViewVideo(
                              selectedApplication
                            )
                          }
                          disabled={loadingVideo}
                          className="action-button primary-action inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                        >
                          <PlayCircleIcon size={16} />
                          {loadingVideo
                            ? "Opening..."
                            : "Watch Video"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Interview */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CalendarIcon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                          Interview
                        </p>

                        {getInterview(
                          selectedApplication
                        ) ? (
                          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                              <p className="text-sm font-extrabold text-slate-800">
                                {getInterviewLabel(
                                  selectedApplication
                                )}
                              </p>

                              {getInterview(
                                selectedApplication
                              )?.scheduled_at && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                  <ClockIcon size={14} />

                                  {formatDate(
                                    getInterview(
                                      selectedApplication
                                    ).scheduled_at,
                                    true
                                  )}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleViewInterview(
                                  selectedApplication
                                )
                              }
                              disabled={loadingInterview}
                              className="action-button inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <CalendarIcon size={15} />
                              View Details
                            </button>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm font-medium text-slate-500">
                            No interview has been scheduled yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Close */}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedApplication(null)
                    }
                    className="action-button w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              Interview Details Modal
          ========================================================= */}

          {selectedInterview && (
            <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center px-3 py-5 sm:px-4 sm:py-6">

              <div className="premium-modal max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl">

                {/* Header */}

                <div className="modal-gradient-header border-b border-slate-200/80 px-5 py-5 sm:px-6">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
                        <CalendarIcon size={21} />
                      </div>

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-600">
                          Interview
                        </p>

                        <h2 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
                          Interview Details
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedInterview(null)
                      }
                      className="close-button flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <XIcon size={18} />
                    </button>
                  </div>
                </div>

                {/* Details */}

                <div className="space-y-4 p-5 sm:space-y-5 sm:p-6">

                  {/* Status */}

                  <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5">
                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckIcon size={19} />
                      </div>

                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-emerald-600">
                          Status
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-emerald-800">
                          {selectedInterview.status
                            ? String(
                                selectedInterview.status
                              )
                                .replace(/_/g, " ")
                                .replace(
                                  /\b\w/g,
                                  (char) =>
                                    char.toUpperCase()
                                )
                            : "Scheduled"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}

                  {selectedInterview.scheduled_at && (
                    <div className="detail-card rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <CalendarIcon size={17} />
                        </div>

                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                            Date & Time
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {formatDate(
                              selectedInterview.scheduled_at,
                              true
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Duration */}

                  {selectedInterview.duration && (
                    <div className="detail-card rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <ClockIcon size={17} />
                        </div>

                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                            Duration
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {selectedInterview.duration}{" "}
                            minutes
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interview Type */}

                  {selectedInterview.interview_type && (
                    <div className="detail-card rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <UserCheckIcon size={17} />
                        </div>

                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                            Interview Type
                          </p>

                          <p className="mt-1 text-sm font-bold capitalize text-slate-700">
                            {String(
                              selectedInterview.interview_type
                            ).replace(
                              /_/g,
                              " "
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meeting Link */}

                  {selectedInterview.meeting_link && (
                    <a
                      href={
                        selectedInterview.meeting_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-action flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold text-white"
                    >
                      Join Interview
                      <ExternalLinkIcon size={16} />
                    </a>
                  )}

                  {/* Notes */}

                  {selectedInterview.notes && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                          <FileIcon size={15} />
                        </div>

                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                          Notes
                        </p>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-700">
                        {selectedInterview.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}

                <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedInterview(null)
                    }
                    className="action-button w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}