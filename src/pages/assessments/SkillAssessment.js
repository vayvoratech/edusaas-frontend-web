import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getAssessmentOverview } from '../../services/api';

export default function SkillAssessment() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await getAssessmentOverview();
        setOverview(data);
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Assessments
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Track your assessment progress and complete the required evaluations.
        </p>
      </div>

      {/* Initial Assessment */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Initial Assessment
              </h3>

              <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                Assessment
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              Evaluate your current skills through the initial assessment
              to determine your readiness level and identify skill gaps.
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div>
                <span className="text-slate-400">Status</span>
                <p
                  className={`font-medium ${
                    overview.initialAssessment.status === 'Completed'
                      ? 'text-green-600'
                      : overview.initialAssessment.status === 'Paused' ||
                        overview.initialAssessment.status === 'In Progress'
                        ? 'text-amber-600'
                        : 'text-slate-600'
                  }`}
                >
                  {overview.initialAssessment.status}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Questions</span>
                <p className="font-medium text-slate-700">
                  {overview.initialAssessment.questionsAnswered}/
                  {overview.initialAssessment.totalQuestions}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Readiness Score</span>
                <p className="font-medium text-slate-700">
                  {overview.initialAssessment.readinessScore ?? '—'}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Purpose</span>
                <p className="font-medium text-slate-700">
                  Skill & Readiness Analysis
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {overview.initialAssessment.status === 'Completed' ? (
              <span className="text-sm font-medium text-green-600">
                Completed
              </span>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/app/initial-assessment')}
              >
                {overview.initialAssessment.status === 'Paused' ||
                overview.initialAssessment.status === 'In Progress'
                  ? 'Resume Assessment'
                  : 'Start Assessment'}
              </Button>
            )}
          </div>

        </div>
      </Card>

      {/* Learning Prerequisites */}
      <Card>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Learning Progress
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Complete the required learning activities before proceeding
            through the final certification process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Enrolled Courses
              </span>

              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                Pending
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Your enrolled courses will be tracked here.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Recommended Courses
              </span>

              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Final Assessment
              </h3>

              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-blue-100 text-brand-blue-700 font-medium">
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
        <div className="mt-6 rounded-xl border border-slate-200 p-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-slate-900">
                  Final Quiz
                </h4>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    overview.finalAssessment.finalQuiz.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
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
        <div className="mt-4 rounded-xl border border-slate-200 p-5">

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
                project for AI evaluation and plagiarism checking.
              </p>

              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                <span>• Submission: ZIP</span>
                <span>• Evaluation: AI</span>
                <span>• Plagiarism Check</span>
              </div>
            </div>

            <Button
              variant="outline"
              disabled
            >
              Not Available
            </Button>

          </div>

        </div>
      </Card>

    </div>
  );
}