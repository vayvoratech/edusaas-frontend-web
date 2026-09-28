import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getAssessmentOverview } from '../../services/api';
import MiniProject from './MiniProject';
import AppDialog from '../../components/ui/AppDialog';

export default function SkillAssessment() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("overview");
  const [dialog, setDialog] = useState({
  open: false,
  type: "warning",
  title: "",
  message: "",
  confirmText: "Continue Coding Assessment",
  cancelText: "Cancel",
  showCancel: true,
});

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await getAssessmentOverview();
setOverview(data);

const initialQuizCompleted =
  data.initialAssessment.questionsAnswered >=
    data.initialAssessment.totalQuestions &&
  data.initialAssessment.totalQuestions > 0;

const codingCompleted =
  data.codingAssessment?.status === "Completed";

if (initialQuizCompleted && !codingCompleted) {
  setDialog({
    open: true,
    type: "warning",
    title: "Complete Your Assessment",
    message:
      "Please complete the Coding Assessment to view your complete progress, readiness score, and skill-gap results.",
    confirmText: "Continue Coding Assessment",
    cancelText: "Later",
    showCancel: true,
  });
}
      } catch (err) {
        setError(
          err.response?.data?.error ||
          err.message ||
          'Failed to load assessment progress'
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <div className="py-10 text-center text-sm text-slate-500">
            Loading assessment progress...
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <div className="py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (activeView === "mini-project") {
    return (
      <MiniProject onBack={() => setActiveView("overview")}/>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Skill Evaluation
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Assessments
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Complete your assessments, strengthen your skill gaps, and progress
            toward certification.
          </p>
        </div>

        <div className="hidden rounded-lg bg-blue-50 px-3.5 py-2 text-xs font-medium text-blue-700 sm:block">
          Your assessment journey
        </div>
      </div>

{/* Initial Assessment */}
<Card>
  {/* Header */}
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        ✓
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Initial Assessment
          </h2>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
            Skill Assessment
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Complete both stages to evaluate your current skills, readiness,
          and skill gaps.
        </p>
      </div>
    </div>

    {/* CTA */}
    <Button
      variant="primary"
      onClick={() =>
        navigate("/app/initial-assessment", {
          state: { phase: "coding" },
        })
      }
    >
      Continue Coding Assessment
    </Button>
  </div>

  {/* Stages */}
  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
    {/* Stage 1 */}
    <div className="rounded-xl border border-green-200 bg-green-50/40 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Stage 1
        </span>

        <span className="text-sm font-medium text-green-600">
          Completed
        </span>
      </div>

      <h3 className="mt-2 text-lg font-semibold text-slate-900">
        Initial Quiz
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Knowledge and skill assessment
      </p>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-white px-4 py-3">
        <span className="text-sm text-slate-500">
          Questions
        </span>

        <span className="font-semibold text-slate-900">
          50 / 50
        </span>
      </div>
    </div>

    {/* Stage 2 */}
    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Stage 2
        </span>

        <span className="text-sm font-medium text-blue-600">
          Ready
        </span>
      </div>

      <h3 className="mt-2 text-lg font-semibold text-slate-900">
        Coding Assessment
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Practical coding evaluation
      </p>

      <div className="mt-4 rounded-lg bg-white px-4 py-3">
        <span className="text-sm text-blue-600">
          Your coding assessment is ready to continue.
        </span>
      </div>
    </div>
  </div>


    {/* Assessment metrics */}
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Overall Status
        </span>

        <p
          className={`mt-1 text-sm font-semibold ${
            overview.initialAssessment.status === "Completed"
              ? "text-green-600"
              : "text-amber-600"
          }`}
        >
          {overview.initialAssessment.status}
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Questions
        </span>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {overview.initialAssessment.questionsAnswered}/
          {overview.initialAssessment.totalQuestions}
        </p>
      </div>

      <div className="rounded-lg bg-orange-50 px-3 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-orange-500">
          Readiness
        </span>

        <p className="mt-1 text-sm font-semibold text-orange-600">
         {overview.initialAssessment.readinessScore != null
  ? overview.initialAssessment.readinessScore
  : "Pending"}
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Purpose
        </span>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          Skill & Readiness
        </p>
      </div>
    </div>
    </Card>

      {/* Learning Prerequisites */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            ✦
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Learning Progress
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Complete the required learning activities before proceeding
              through the final certification process.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Enrolled Courses
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Pending
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Your enrolled courses will be tracked here.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Recommended Courses
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Pending
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Recommended learning activities will be tracked here.
            </p>
          </div>
        </div>
      </Card>

      {/* Final Assessment */}
      <Card>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Final Assessment
              </h3>

              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                Certification
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              Complete the final proctored quiz and mini project to
              complete the certification assessment.
            </p>
          </div>
        </div>

        {/* Final Quiz */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/30 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-slate-900">
                  Final Quiz
                </h4>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    overview.finalAssessment.finalQuiz.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : overview.finalAssessment.finalQuiz.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {overview.finalAssessment.finalQuiz.status}
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Proctored final quiz covering the skills evaluated during
                your learning journey.
              </p>

              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                <span>• Difficulty: 2–4</span>
                <span>• Proctored</span>
                <span>
                  • Questions:{' '}
                  {overview.finalAssessment.finalQuiz.questionsAnswered}/
                  {overview.finalAssessment.finalQuiz.totalQuestions}
                </span>
                <span>• Final Certification</span>
              </div>
            </div>

            {overview.finalAssessment.finalQuiz.status === 'Completed' ? (
              <span className="text-sm font-medium text-green-600">
                Completed
              </span>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate('/app/final-assessment')}
              >
                {overview.finalAssessment.finalQuiz.status === 'Paused' ||
                overview.finalAssessment.finalQuiz.status === 'In Progress'
                  ? 'Resume Final Quiz'
                  : 'Start Final Quiz'}
              </Button>
            )}
          </div>
        </div>

        {/* Mini Project */}
        <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/30 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-slate-900">
                  Mini Project
                </h4>

                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {overview.finalAssessment.miniProject.status}
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Complete the assigned problem statement and submit your
                project as part of the final certification process.
              </p>

              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                <span>• Submission: ZIP</span>
                <span>• One submission</span>
                <span>• Final Certification</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setActiveView("mini-project")}
            >
              Start Mini Project
            </Button>
          </div>
        </div>
      </Card>

<AppDialog
  open={dialog.open}
  type={dialog.type}
  title={dialog.title}
  message={dialog.message}
  confirmText={dialog.confirmText}
  cancelText={dialog.cancelText}
  showCancel={dialog.showCancel}
  onCancel={() =>
    setDialog((prev) => ({
      ...prev,
      open: false,
    }))
  }
  onConfirm={() => {
    setDialog((prev) => ({
      ...prev,
      open: false,
    }));

    navigate("/app/initial-assessment", {
      state: {
        phase: "coding",
      },
    });
  }}
/>

    </div>
  );
}
