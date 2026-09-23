import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getAssessmentReports,
  getAssessmentReport,
  updateAssessmentReport,
} from '../services/api';

const statusStyles = {
  pending: 'bg-red-50 text-red-700',
  'under review': 'bg-orange-50 text-orange-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-slate-100 text-slate-600',
};

const formatStatus = (status) => {
  const value = String(status || 'Pending')
    .replace(/_/g, ' ')
    .toLowerCase();

  return value.replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatAssessmentType = (type) => {
  if (!type) return 'Assessment';

  const value = String(type).toUpperCase();

  const labels = {
    INITIAL: 'Initial Assessment',
    CODING: 'Initial Coding Assessment',
    FINAL: 'Final Assessment',
    MINI_PROJECT: 'Mini Project',
  };

  return labels[value] || String(type).replace(/_/g, ' ');
};

export default function AssessmentReviews() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedReport, setSelectedReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [adminNotes, setAdminNotes] = useState('');
  const [savingDecision, setSavingDecision] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getAssessmentReports(statusFilter);

      const data = Array.isArray(response)
        ? response
        : response?.reports ||
          response?.data ||
          [];

      setReports(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to load assessment reports'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
  loadReports();
}, [loadReports]);

  const pendingCount = useMemo(
    () =>
      reports.filter((report) => {
        const status = String(report?.status ?? 'Pending')
          .toLowerCase()
          .replace(/_/g, ' ');

        return [
          'pending',
          'under review',
          'reviewing',
        ].includes(status);
      }).length,
    [reports]
  );

  const openReview = async (report) => {
    try {
      setDetailLoading(true);
      setError('');

      const response = await getAssessmentReport(report.id);

      const detail = response?.report || response?.data || response;

      setSelectedReport(detail);
      setAdminNotes(detail?.admin_notes && detail.admin_notes !== 'null' ? detail.admin_notes : '');
    } catch (err) {

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to load assessment report details'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeReview = () => {
    if (savingDecision) return;

    setSelectedReport(null);
    setAdminNotes('');
  };

  const handleDecision = async (status) => {
    if (!selectedReport?.id) return;

    try {
      setSavingDecision(true);
      setError('');

      await updateAssessmentReport(selectedReport.id, {
        status,
        admin_notes: adminNotes.trim() || null,
      });

      setSelectedReport(null);
      setAdminNotes('');

      await loadReports();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to update assessment report'
      );
    } finally {
      setSavingDecision(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue-600">
            Admin Review
          </div>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Assessment Reviews
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review student reports submitted after assessment termination.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate('/app/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-xs font-medium text-slate-500">
            Reports
          </div>

          <div className="mt-2 text-3xl font-bold text-slate-900">
            {reports.length}
          </div>
        </Card>

        <Card>
          <div className="text-xs font-medium text-slate-500">
            Awaiting Review
          </div>

          <div className="mt-2 text-3xl font-bold text-red-600">
            {pendingCount}
          </div>
        </Card>

        <Card>
          <div className="text-xs font-medium text-slate-500">
            Current Filter
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue-400"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </Card>
      </div>

      <Card title="Assessment Termination Reports">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Loading assessment reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No assessment reports found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">Student</th>
                  <th className="px-3 py-3">Assessment</th>
                  <th className="px-3 py-3">Reason</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => {
                  const status = String(
                    report?.status ?? 'Pending'
                  )
                    .toLowerCase()
                    .replace(/_/g, ' ');

                  const assessmentType =
                    report?.assessment_type ||
                    report?.quizSession?.assessment_type ||
                    report?.quiz_session?.assessment_type;

                  const canReview = [
                    'pending',
                    'under review',
                    'reviewing',
                  ].includes(status);

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-3 py-4">
                        <div className="font-medium text-slate-800">
                          {report.student_name ||
                            report.user_name ||
                            report.student?.name ||
                            'Student'}
                        </div>

                        <div className="text-xs text-slate-400">
                          {report.student_email ||
                            report.user_email ||
                            report.student?.email ||
                            '—'}
                        </div>
                      </td>

                      <td className="px-3 py-4 font-medium text-slate-700">
                        {formatAssessmentType(assessmentType)}
                      </td>

                      <td className="max-w-xs px-3 py-4 text-slate-600">
                        <div className="truncate">
                          {report.reason || 'No reason provided'}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[status] ||
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {formatStatus(status)}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-right">
                        <Button
                          variant="outline"
                          onClick={() => openReview(report)}
                        >
                          {canReview ? 'Review' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={closeReview}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue-600">
                    Assessment Termination Review
                  </div>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Review Student Report
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeReview}
                  disabled={savingDecision}
                  className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Student
                  </div>

                  <div className="mt-1 font-semibold text-slate-900">
                    {selectedReport.student_name ||
                      selectedReport.user_name ||
                      selectedReport.student?.name ||
                      'Student'}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    {selectedReport.student_email ||
                      selectedReport.user_email ||
                      selectedReport.student?.email ||
                      '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Assessment
                  </div>

                  <div className="mt-1 font-semibold text-slate-900">
                    {formatAssessmentType(
                      selectedReport.assessment_type ||
                        selectedReport.quizSession?.assessment_type ||
                        selectedReport.quiz_session?.assessment_type
                    )}
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Session ID: {selectedReport.quiz_session_id || '—'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Termination Reason
                </div>

                <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                  {selectedReport.reason || 'No reason provided.'}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Student Evidence / Explanation
                </div>

                <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                  {selectedReport.evidence ? (
                    selectedReport.evidence
                  ) : (
                    <span className="text-slate-400">
                      No additional evidence was provided by the student.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Admin Notes
                </label>

                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about your review or decision..."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-blue-400 focus:ring-2 focus:ring-brand-blue-100"
                  disabled={savingDecision}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Current Status
                </div>

                <div className="mt-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusStyles[
                        String(selectedReport.status || 'Pending')
                          .toLowerCase()
                          .replace(/_/g, ' ')
                      ] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {formatStatus(selectedReport.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={closeReview}
                disabled={savingDecision}
              >
                Cancel
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDecision('Under Review')}
                disabled={savingDecision}
              >
                Under Review
              </Button>

              <Button
                variant="primary"
                onClick={() => handleDecision('Approved')}
                disabled={savingDecision}
              >
                Approve
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDecision('Rejected')}
                disabled={savingDecision}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-[1px]">
          <div className="rounded-xl bg-white px-6 py-4 text-sm font-medium text-slate-700 shadow-xl">
            Loading report details...
          </div>
        </div>
      )}
    </div>
  );
}
