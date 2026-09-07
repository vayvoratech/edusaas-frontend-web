import React, { useEffect, useState } from "react";
import { getMyJobApplications } from "../services/api";

export default function StudentJobApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const data = await getMyJobApplications();
        setApplications(data || []);
      } catch (err) {
        console.error("Failed to load job applications:", err);
        setError("Failed to load your job applications.");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const getStatusStyle = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "shortlisted":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "shortlisted":
        return "Shortlisted";

      case "rejected":
        return "Rejected";

      default:
        return "Submitted";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Job Applications
        </h1>

        <p className="mt-4 text-sm text-slate-500">
          Loading your applications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Job Applications
        </h1>

        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Job Applications
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track the jobs you have applied for.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="text-4xl">💼</div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No applications yet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Jobs you apply for will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {application.job?.title || "Job Opportunity"}
                  </h2>

                  {application.job?.company && (
                    <p className="mt-1 text-sm text-slate-500">
                      {application.job.company}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-slate-400">
                    Applied on{" "}
                    {application.applied_at
                      ? new Date(
                          application.applied_at
                        ).toLocaleDateString()
                      : "Date unavailable"}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    application.status
                  )}`}
                >
                  {getStatusLabel(application.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}