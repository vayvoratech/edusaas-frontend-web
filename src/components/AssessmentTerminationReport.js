

import { useState } from "react";
import { submitAssessmentReport } from "../services/api";

const AssessmentTerminationReport = ({
  sessionId,
  assessmentType,
  assessmentStage,
  onCancel,
  onSubmitted,
}) => {
  const [reportReason, setReportReason] = useState("");
  const [reportEvidence, setReportEvidence] = useState("");
  const [reportEvidenceFile, setReportEvidenceFile] = useState(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sessionId) {
      setReportError("Assessment session not found.");
      return;
    }

    if (!reportReason.trim()) {
      setReportError("Please provide a reason for reporting the termination.");
      return;
    }

    try {
      setReportSubmitting(true);
      setReportError("");

      const formData = new FormData();

      formData.append("quiz_session_id", sessionId);
      formData.append("assessment_type", assessmentType);
      formData.append("assessment_stage", assessmentStage);
      formData.append("reason", reportReason.trim());

      if (reportEvidence.trim()) {
        formData.append(
          "additional_evidence",
          reportEvidence.trim()
        );
      }

      if (reportEvidenceFile) {
        formData.append("evidence", reportEvidenceFile);
      }

      const response = await submitAssessmentReport(formData);

onSubmitted?.(response?.report || null);
    } catch (err) {
      console.error(
        "Assessment report submission failed:",
        err.response?.data || err.message
      );

      setReportError(
        err.response?.data?.error ||
          "Failed to submit the assessment report."
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 text-left"
    >
      <h2 className="text-lg font-semibold text-gray-900">
        Report Assessment Termination
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Explain why you believe the termination was incorrect.
      </p>

      <div className="mt-5">
        <label className="block text-sm font-medium text-gray-700">
          Reason <span className="text-red-500">*</span>
        </label>

        <textarea
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          rows={4}
          placeholder="Explain why you are reporting the termination..."
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={reportSubmitting}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Additional Evidence / Explanation
        </label>

        <textarea
          value={reportEvidence}
          onChange={(e) => setReportEvidence(e.target.value)}
          rows={4}
          placeholder="Provide any additional information that may help the administrator review your report..."
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={reportSubmitting}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Supporting Evidence
        </label>

        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(e) =>
            setReportEvidenceFile(e.target.files?.[0] || null)
          }
          className="mt-2 block w-full text-sm text-gray-700"
          disabled={reportSubmitting}
        />

        <p className="mt-1 text-xs text-gray-500">
          Upload PNG, JPG, JPEG, or PDF. Maximum size: 10 MB.
        </p>
      </div>

      {reportError && (
        <p className="mt-3 text-sm text-red-600">
          {reportError}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={reportSubmitting}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={reportSubmitting}
          className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
        >
          {reportSubmitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  );
};

export default AssessmentTerminationReport;