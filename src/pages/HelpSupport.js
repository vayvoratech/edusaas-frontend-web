import React, { useEffect, useState } from 'react';
import {
  Mail,
  MessageCircle,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  submitAssessmentReport,
  getMyAssessmentReports,
} from '../services/api';

const SUPPORT_EMAIL = 'support@vayvoratech.com';

const categories = [
  {
    value: 'assessment_termination',
    label: 'Assessment Termination',
  },
  {
    value: 'assessment',
    label: 'Assessment Issue',
  },
  {
    value: 'course',
    label: 'Course / Learning Issue',
  },
  {
    value: 'job',
    label: 'Job / Application Issue',
  },
  {
    value: 'technical',
    label: 'Technical Problem',
  },
  {
    value: 'account',
    label: 'Profile Issue',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

export default function HelpSupport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /*
   * These values are passed from the terminated assessment screen.
   *
   * Example:
   * /app/help-support
   *   ?category=assessment_termination
   *   &sessionId=123
   *   &assessmentType=INITIAL
   */
  const urlCategory = searchParams.get('category') || '';
 const sessionId = searchParams.get('sessionId') || '';

const assessmentType =
  searchParams.get('assessmentType') || '';

const assessmentStage =
  searchParams.get('assessmentStage') ||
  (
    assessmentType.toUpperCase() === 'CODING'
      ? 'INITIAL_CODING'
      : assessmentType.toUpperCase() === 'INITIAL'
        ? 'INITIAL_QUIZ'
        : 'FINAL_QUIZ'
  );

  const [category, setCategory] = useState(urlCategory);

  const [reportReason, setReportReason] = useState('');
  const [reportEvidence, setReportEvidence] = useState('');
  const [reportEvidenceFile, setReportEvidenceFile] =
    useState(null);

  const [reportSubmitting, setReportSubmitting] =
    useState(false);

  const [reportSubmitted, setReportSubmitted] =
    useState(false);

  const [reportError, setReportError] = useState('');

  const [myReports, setMyReports] = useState([]);
  const [, setReportsLoading] =
    useState(false);

    const [supportMessage, setSupportMessage] = useState(false);

    const contactSupportButton = () => {
  setSupportMessage(true);

  setTimeout(() => {
    setSupportMessage(false);
  }, 2000);
};

  const selectedCategory = categories.find(
    (item) => item.value === category
  );

  /*
   * Load student's existing assessment reports.
   */
  useEffect(() => {
    const loadMyReports = async () => {
      try {
        setReportsLoading(true);

        const reports = await getMyAssessmentReports();

        setMyReports(
          Array.isArray(reports) ? reports : []
        );
      } catch (err) {
        console.error(
          'Failed to load assessment reports:',
          err.response?.data || err.message
        );
      } finally {
        setReportsLoading(false);
      }
    };

    loadMyReports();
  }, []);

  /*
   * If Help & Support was opened from the terminated
   * assessment, automatically select Assessment Termination.
   */
  useEffect(() => {
    if (urlCategory) {
      setCategory(urlCategory);
    }
  }, [urlCategory]);

  /*
   * Find report belonging to this exact terminated session.
   */
  
    const currentReport = sessionId
  ? myReports.find(
      (report) =>
        String(report.quiz_session_id) ===
          String(sessionId) &&
        String(report.assessment_stage || '').toUpperCase() ===
          String(assessmentStage).toUpperCase()
    )
  : null;

  /*
   * Submit assessment termination report.
   */
  const handleSubmitAssessmentReport = async (e) => {
    e.preventDefault();

    setReportError('');

    if (!sessionId) {
      setReportError(
        'Assessment session was not found. Please open Help & Support from the terminated assessment screen.'
      );
      return;
    }

    if (!reportReason.trim()) {
      setReportError(
        'Please provide a reason for reporting the termination.'
      );
      return;
    }

    try {
      setReportSubmitting(true);

      const formData = new FormData();

      formData.append(
        'quiz_session_id',
        sessionId
      );

      /*
       * Use the actual assessment type passed by the
       * assessment page.
       */
     if (assessmentType) {
  formData.append(
    'assessment_type',
    assessmentType.toUpperCase()
  );
}

formData.append(
  'assessment_stage',
  assessmentStage
);

formData.append(
  'reason',
  reportReason.trim()
);

      if (reportEvidence.trim()) {
        formData.append(
          'additional_evidence',
          reportEvidence.trim()
        );
      }

      if (reportEvidenceFile) {
        formData.append(
          'evidence',
          reportEvidenceFile
        );
      }

      const response =
        await submitAssessmentReport(formData);

      /*
       * Add returned report to local state so the
       * status appears immediately.
       */
      if (response?.report) {
        setMyReports((previous) => [
          response.report,
          ...previous,
        ]);
      }

      setReportSubmitted(true);
      setReportReason('');
      setReportEvidence('');
      setReportEvidenceFile(null);
    } catch (err) {
      console.error(
        'Assessment report submission failed:',
        err.response?.data || err.message
      );

      setReportError(
        err.response?.data?.error ||
          'Failed to submit the assessment report.'
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  const contactSupport = () => {
    const categoryName =
      selectedCategory?.label || 'General Support';

    const subject = `EduSaaS - ${categoryName}`;

    const body = `Hello Support Team,

I need help with my EduSaaS account.

Issue Category: ${categoryName}

Please assist me with this issue.

Thank you.`;

    window.location.href =
      `mailto:${SUPPORT_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  };

  const handleCategoryChange = (value) => {
    setCategory(value);

    /*
     * Clear report-specific state when changing category.
     */
    if (value !== 'assessment_termination') {
      setReportError('');
      setReportSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <MessageCircle size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Help & Support
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Report an issue or contact our support team for assistance.
            </p>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">
              <Mail
                size={20}
                className="mt-1 shrink-0 text-blue-600"
              />

              <div>
                <h2 className="font-semibold text-slate-900">
                  Contact Support
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  For general questions or issues, contact our support team.
                </p>

              </div>
            </div>
<div className="relative">
  <button
    type="button"
    onClick={contactSupportButton}
    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
  >
    <Mail size={16} />
    Contact Support
    <ArrowRight size={15} />
  </button>

  {supportMessage && (
    <div className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 shadow-sm">
      Email support is currently unavailable. We'll be back soon.
    </div>
  )}
</div>

          </div>
        </div>

        {/* Report an Issue */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Report an Issue
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the category that best describes your issue.
            </p>
          </div>

          <div className="p-5">

            {/* Category Dropdown */}
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Issue Category
            </label>

            <div className="relative">
              <select
                value={category}
                onChange={(e) =>
                  handleCategoryChange(e.target.value)
                }
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select an issue category
                </option>

                {categories.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-3.5 text-slate-400"
              />
            </div>

            {/* Assessment Termination */}
           {category === 'assessment_termination' && (
  <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div>
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
      <span className="text-sm font-semibold text-red-600">!</span>
    </div>

    <div>
      <h3 className="font-semibold text-slate-900">
        Assessment Termination
      </h3>

      <p className="mt-0.5 text-sm text-slate-500">
        Tell Admin what happened so your assessment session can be reviewed.
      </p>
    </div>
  </div>
</div>

                {/* No session ID */}
                {!sessionId && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      Please open Help & Support from the terminated
                      assessment so we can link your report to the
                      correct assessment session.
                    </p>
                  </div>
                )}

                {/* Existing report */}
                {sessionId && currentReport && (
                  <div className="mt-5 rounded-xl border border-blue-200 bg-white p-5">

                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-semibold text-slate-900">
                        Your Report
                      </h4>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {currentReport.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Reason
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {currentReport.reason}
                      </p>
                    </div>

                    {currentReport.admin_notes && (
                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Admin Response
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-700">
                          {currentReport.admin_notes}
                        </p>
                      </div>
                    )}

                    {currentReport.status === 'Approved' && (
                      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-700">
                          Your report has been approved. You can now
                          restart the assessment.
                        </p>
                      </div>
                    )}

                    {currentReport.status === 'Rejected' && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-700">
                          Your report was rejected. Please contact
                          support if you need further assistance.
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* New report form */}
                {sessionId &&
                  !currentReport &&
                  !reportSubmitted && (
                   <form
  onSubmit={handleSubmitAssessmentReport}
  className="mt-6 border-t border-slate-200 pt-6"
>

                      <h4 className="font-semibold text-slate-900">
                        Report to Admin
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Explain what happened during the assessment.
                        Admin will review your report before the
                        assessment can be restarted.
                      </p>

                      {/* Assessment type */}
                    {assessmentType && (
  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      Assessment
    </p>

    <p className="mt-1 text-sm font-semibold text-slate-700">
      {assessmentType}
    </p>
    </div>
   
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      Stage
    </p>

    <p className="mt-1 text-sm font-semibold text-slate-800">
      {assessmentStage}
    </p>
  </div>
  </div>
)}

                      {/* Reason */}
                      <label className="mt-5 block text-sm font-medium text-slate-700">
                        Reason for termination
                      </label>

                      <textarea
                        value={reportReason}
                        onChange={(e) =>
                          setReportReason(e.target.value)
                        }
                        rows={3}
                        placeholder="Explain what happened..."
                        disabled={reportSubmitting}
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      {/* Additional evidence */}
                      <label className="mt-4 block text-sm font-medium text-slate-700">
                        Additional Information
                      </label>

                      <textarea
                        value={reportEvidence}
                        onChange={(e) =>
                          setReportEvidence(e.target.value)
                        }
                        rows={3}
                        placeholder="Add any additional information that may help Admin review the issue..."
                        disabled={reportSubmitting}
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      {/* Evidence file */}
                      <label className="mt-4 block text-sm font-medium text-slate-700">
                        Supporting Evidence
                      </label>

                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) =>
                          setReportEvidenceFile(
                            e.target.files?.[0] || null
                          )
                        }
                        disabled={reportSubmitting}
                        className="mt-2 block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:border-slate-400"
                        />

                      <p className="mt-1 text-xs text-slate-500">
                        Upload PNG, JPG, JPEG, or PDF. Maximum size: 10 MB.
                      </p>

                      {/* Error */}
                      {reportError && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-sm text-red-700">
                            {reportError}
                          </p>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={reportSubmitting}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reportSubmitting
                          ? 'Submitting...'
                          : 'Report to Admin'}

                        {!reportSubmitting && (
                          <ArrowRight size={15} />
                        )}
                      </button>

                    </form>
                  )}

                {/* Submitted successfully */}
                {reportSubmitted && !currentReport && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">
                    <h4 className="font-semibold text-green-800">
                      Report Submitted
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-green-700">
                      Your assessment termination report has been
                      submitted to Admin. You cannot restart the
                      assessment until the report is approved.
                    </p>
                  </div>
                )}

                {/* Go to assessments */}
                <button
                  type="button"
                  onClick={() =>
                    navigate('/app/assessments')
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Go to Assessments
                  <ArrowRight size={15} />
                </button>

              </div>
            )}

            {/* Other Categories */}
            {category &&
              category !== 'assessment_termination' && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">

                  <h3 className="font-semibold text-slate-900">
                    {selectedCategory?.label}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Please contact our support team and include
                    the relevant details about your issue.
                  </p>

                  <button
                    type="button"
                    onClick={contactSupport}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Mail size={16} />
                    Contact Support
                    <ArrowRight size={15} />
                  </button>

                </div>
              )}

          </div>
        </div>

      </div>
    </div>
  );
}