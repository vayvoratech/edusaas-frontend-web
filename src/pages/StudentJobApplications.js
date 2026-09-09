import React, { useEffect, useMemo, useState } from "react";
import {
  getMyJobApplications,
  getApplicationVideoUrl,
  getMyInterview,
} from "../services/api";

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

        const results = await Promise.all(
          applications.map(async (application) => {
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
    return (
      application?.interview ||
      interviews[application?.id] ||
      null
    );
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
      return "Not scheduled";
    }

    return (
      interview.status
        ? String(interview.status)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())
        : "Scheduled"
    );
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

      alert(
        err.response?.data?.error ||
          "Failed to open the application video."
      );
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

      if (!interview) {
        interview = await getMyInterview(
          application.job_id
        );
      }

      if (interview) {
        setSelectedInterview(interview);
      }
    } catch (err) {
      console.error(
        "Failed to load interview:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.error ||
          "Failed to load interview details."
      );
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
  const isInterviewScheduled = !!interview;
  const status = normalizeStatus(application.status);

  const isRejected = status === "rejected";

  if (isRejected) {
    return (
      <div className="mt-4 flex items-center gap-2 text-xs">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
            ✓
          </div>
          <span className="font-medium text-slate-700">
            Submitted
          </span>
        </div>

        <div className="h-px flex-1 bg-slate-200" />

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white">
            ✕
          </div>
          <span className="font-medium text-red-600">
            Rejected
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-2 text-xs">
      {/* Submitted */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
          ✓
        </div>
        <span className="font-medium text-slate-700">
          Submitted
        </span>
      </div>

      <div className="h-px flex-1 bg-slate-200" />

      {/* Under Review */}
      <div className="flex shrink-0 items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            isInterviewScheduled
              ? "bg-emerald-500 text-white"
              : "border-2 border-brand-blue-400 bg-white text-brand-blue-600"
          }`}
        >
          {isInterviewScheduled ? "✓" : "2"}
        </div>

        <span
          className={`font-medium ${
            isInterviewScheduled
              ? "text-emerald-600"
              : "text-slate-700"
          }`}
        >
          Under Review
        </span>
      </div>

      <div className="h-px flex-1 bg-slate-200" />

      {/* Interview */}
      <div className="flex shrink-0 items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            isInterviewScheduled
              ? "bg-emerald-500 text-white"
              : "border-2 border-slate-300 bg-white text-slate-400"
          }`}
        >
          {isInterviewScheduled ? "✓" : "3"}
        </div>

        <span
          className={`font-medium ${
            isInterviewScheduled
              ? "text-emerald-600"
              : "text-slate-400"
          }`}
        >
          {isInterviewScheduled ? "Interview Scheduled" : "Interview"}
        </span>
      </div>
    </div>
  );
};
  /* ---------------------------------------------------------
     Loading
  --------------------------------------------------------- */

  if (loading) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-100" />

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-slate-100"
                />
              ))}
            </div>

            <div className="mt-6 h-16 rounded-2xl bg-slate-100" />

            <div className="mt-5 space-y-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-64 rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------
     Error
  --------------------------------------------------------- */

  if (error) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-slate-900">
            Job Applications
          </h1>

          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------
   Main UI
--------------------------------------------------------- */
return (
  <div className="min-h-full bg-slate-50 px-3 py-4 sm:px-5 sm:py-5">
    <div className="mx-auto max-w-7xl">

      {/* Header */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-600 text-base text-white shadow-sm">
            💼
          </div>

          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              Job Applications
            </h1>

            <p className="mt-0.5 text-xs text-slate-500">
              Track your applications and stay updated on your hiring progress.
            </p>
          </div>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Total
          </p>

          <p className="text-lg font-bold leading-none text-slate-900">
            {statistics.total}
          </p>
        </div>
      </div>

      {/* Search / Filter */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by job title or company..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-brand-blue-400 focus:bg-white focus:ring-2 focus:ring-brand-blue-100 sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1">
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
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  statusFilter === value
                    ? "bg-brand-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result count */}
      {applications.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            {filteredApplications.length}{" "}
            {filteredApplications.length === 1
              ? "application"
              : "applications"}{" "}
            found
          </p>

          {loadingInterviews && (
            <p className="text-[10px] text-slate-400">
              Updating interview details...
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {applications.length === 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
            💼
          </div>

          <h2 className="mt-3 text-base font-bold text-slate-900">
            No applications yet
          </h2>

          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
            Jobs you apply for will appear here. Once you submit an
            application, you can track its progress from this page.
          </p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="text-2xl">🔎</div>

          <h2 className="mt-2 text-sm font-semibold text-slate-900">
            No matching applications
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Try changing your search or status filter.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="mt-3 rounded-lg bg-brand-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Applications */
        <div className="mt-3 space-y-3">
          {filteredApplications.map((application) => {
            const interview = getInterview(application);
            const resumeAvailable = hasResume(application);
            const videoAvailable = hasVideo(application);

            return (
              <div
                key={application.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >

                {/* Card Header */}
                <div className="border-b border-slate-100 p-4">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex min-w-0 items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base">
                        💼
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-base font-bold leading-tight text-slate-900">
                          {application.job?.title || "Job Opportunity"}
                        </h2>

                        {application.job?.company && (
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {application.job.company}
                          </p>
                        )}

                        <p className="mt-1 text-[10px] text-slate-400">
                          Applied {formatDate(application.applied_at)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(
                        application.status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                          application.status
                        )}`}
                      />

                      {getStatusLabel(application.status)}
                    </span>
                  </div>

                  <ApplicationProgress application={application} />
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 gap-2 p-3.5 sm:grid-cols-3">

                  {/* Resume */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">📄</span>

                      <span
                        className={`text-[10px] font-semibold ${
                          resumeAvailable
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {resumeAvailable ? "✓ Submitted" : "Not available"}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                      Resume
                    </p>

                    <p className="mt-0.5 truncate text-xs font-medium text-slate-700">
                      {resumeAvailable
                        ? application.application_data?.resume?.file_name ||
                          "Resume submitted"
                        : "Not submitted"}
                    </p>
                  </div>

                  {/* Video */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">🎥</span>

                      <span
                        className={`text-[10px] font-semibold ${
                          videoAvailable
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {videoAvailable ? "✓ Submitted" : "Not available"}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                      Video Introduction
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-slate-700">
                      {videoAvailable
                        ? "Self-introduction submitted"
                        : "No video submitted"}
                    </p>
                  </div>

                  {/* Interview */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">📅</span>

                      <span
                        className={`text-[10px] font-semibold ${
                          interview
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {interview ? "Scheduled" : "Pending"}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                      Interview
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-slate-700">
                      {getInterviewLabel(application)}
                    </p>

                    {interview?.scheduled_at && (
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {formatDate(interview.scheduled_at, true)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-slate-50/60 px-3.5 py-2.5">

                  <button
                    type="button"
                    onClick={() => setSelectedApplication(application)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    View Application
                  </button>

                  {videoAvailable && (
                    <button
                      type="button"
                      onClick={() => handleViewVideo(application)}
                      disabled={loadingVideo}
                      className="rounded-md border border-brand-blue-200 bg-brand-blue-50 px-3 py-1.5 text-xs font-semibold text-brand-blue-700 transition hover:bg-brand-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingVideo ? "Opening..." : "🎥 Watch Video"}
                    </button>
                  )}

                  {interview && (
                    <button
                      type="button"
                      onClick={() => handleViewInterview(application)}
                      disabled={loadingInterview}
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingInterview
                        ? "Loading..."
                        : "📅 View Interview"}
                    </button>
                  )}

                  {interview?.meeting_link && (
                    <a
                      href={interview.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-brand-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-blue-700"
                    >
                      Join Interview →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
            {/* -------------------------------------------------------
          Application Details Modal
      ------------------------------------------------------- */}

      {selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue-600">
                    Application
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedApplication.job?.title || "Job Opportunity"}
                  </h2>

                  {selectedApplication.job?.company && (
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedApplication.job.company}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              {/* Status */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Current Status
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Your application status
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                      selectedApplication.status
                    )}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${getStatusDot(
                        selectedApplication.status
                      )}`}
                    />

                    {getStatusLabel(selectedApplication.status)}
                  </span>
                </div>
              </div>

              {/* Application Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Applied On
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatDate(
                      selectedApplication.applied_at,
                      true
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Application ID
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                    {selectedApplication.id}
                  </p>
                </div>
              </div>

              {/* Resume */}
              <div className="rounded-xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Submitted Resume
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedApplication.application_data
                        ?.resume?.file_name || "No resume attached"}
                    </p>
                  </div>

                  {getResumeUrl(selectedApplication) && (
                    <a
                      href={getResumeUrl(selectedApplication)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Open Resume →
                    </a>
                  )}
                </div>
              </div>

              {/* Video */}
              <div className="rounded-xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Video Introduction
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {hasVideo(selectedApplication)
                        ? "Your video introduction was submitted."
                        : "No video introduction available."}
                    </p>
                  </div>

                  {hasVideo(selectedApplication) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleViewVideo(selectedApplication)
                      }
                      disabled={loadingVideo}
                      className="w-fit rounded-xl bg-brand-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-700 disabled:opacity-50"
                    >
                      {loadingVideo
                        ? "Opening..."
                        : "🎥 Watch Video"}
                    </button>
                  )}
                </div>
              </div>

              {/* Interview */}
              <div className="rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Interview
                </p>

                {getInterview(selectedApplication) ? (
                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {getInterviewLabel(selectedApplication)}
                        </p>

                        {getInterview(selectedApplication)
                          ?.scheduled_at && (
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(
                              getInterview(selectedApplication)
                                .scheduled_at,
                              true
                            )}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewInterview(selectedApplication)
                        }
                        disabled={loadingInterview}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No interview has been scheduled yet.
                  </p>
                )}
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------
          Interview Modal
      ------------------------------------------------------- */}

      {selectedInterview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => setSelectedInterview(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Interview
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Interview Details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInterview(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
              {/* Status */}
              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                  Status
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-800">
                  {selectedInterview.status
                    ? String(selectedInterview.status)
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        )
                    : "Scheduled"}
                </p>
              </div>

              {/* Date */}
              {selectedInterview.scheduled_at && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Date & Time
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatDate(
                      selectedInterview.scheduled_at,
                      true
                    )}
                  </p>
                </div>
              )}

              {/* Duration */}
              {selectedInterview.duration && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Duration
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {selectedInterview.duration} minutes
                  </p>
                </div>
              )}

              {/* Interview Type */}
              {selectedInterview.interview_type && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Interview Type
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                    {String(
                      selectedInterview.interview_type
                    ).replace(/_/g, " ")}
                  </p>
                </div>
              )}

              {/* Meeting Link */}
              {selectedInterview.meeting_link && (
                <a
                  href={selectedInterview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl bg-brand-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-blue-700"
                >
                  Join Interview →
                </a>
              )}

              {/* Notes */}
              {selectedInterview.notes && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {selectedInterview.notes}
                  </p>
                </div>
              )}

              {/* Close */}
              <button
                type="button"
                onClick={() => setSelectedInterview(null)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
