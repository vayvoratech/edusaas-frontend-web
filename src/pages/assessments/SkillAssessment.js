import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Code2,
  FileCode2,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Play,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Upload,
  XCircle,
  Zap,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import {
  getAssessmentOverview,
  getMyAssessmentReports,
} from '../../services/api';
import MiniProject from './MiniProject';
import AppDialog from '../../components/ui/AppDialog';

export default function SkillAssessment() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setTerminationReport] = useState(null);
  const [activeView, setActiveView] = useState('overview');

  const [dialog, setDialog] = useState({
    open: false,
    type: 'warning',
    title: '',
    message: '',
    confirmText: 'Continue Coding Assessment',
    cancelText: 'Cancel',
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

        const reports = await getMyAssessmentReports();

        const codingSessionId =
          data?.codingAssessment?.sessionId;

        const codingReport =
          Array.isArray(reports)
            ? reports.find(
                (report) =>
                  Number(report.quiz_session_id) ===
                    Number(codingSessionId) &&
                  String(report.assessment_stage || "").toUpperCase() ===
                    "INITIAL_CODING"
              ) || null
            : null;

        setTerminationReport(codingReport);

        const codingAssessmentCompleted =
          data?.codingAssessment?.status === 'Completed';

        if (
          initialQuizCompleted &&
          !codingAssessmentCompleted &&
          data?.codingAssessment?.status !== 'Terminated'
        ) {
          setDialog({
            open: true,
            type: 'warning',
            title: 'Complete Your Assessment',
            message:
              'Please complete the Coding Assessment to view your complete progress, readiness score, and skill-gap results.',
            confirmText: 'Continue Coding Assessment',
            cancelText: 'Later',
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

  /* -------------------------------------------------------------------------- */
  /* Loading                                                                     */
  /* -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="relative min-h-[70vh] overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-500/20" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/25">
                  <Brain className="h-8 w-8 animate-pulse" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Loading your assessment journey
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Preparing your latest skill evaluation progress...
              </p>

              <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* Error                                                                       */
  /* -------------------------------------------------------------------------- */

  if (error) {
    return (
      <div className="relative min-h-[70vh] overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-red-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-red-100 bg-white/90 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-red-900/30 dark:bg-slate-900/90">
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20">
                <XCircle className="h-8 w-8" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Unable to load assessment progress
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-red-600 dark:text-red-400">
                {error}
              </p>

              <Button
                variant="outline"
                className="mt-6"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* Mini Project                                                                */
  /* -------------------------------------------------------------------------- */

  if (activeView === 'mini-project') {
    return (
      <MiniProject onBack={() => setActiveView('overview')} />
    );
  }

  /* -------------------------------------------------------------------------- */
  /* Safe overview references                                                    */
  /* -------------------------------------------------------------------------- */

  const initialAssessment = overview?.initialAssessment || {};
  const codingAssessment = overview?.codingAssessment || {};
  const finalAssessment = overview?.finalAssessment || {};
  const finalQuiz = finalAssessment?.finalQuiz || {};
  const miniProject = finalAssessment?.miniProject || {};

  const initialQuizCompleted =
    initialAssessment.questionsAnswered >=
      initialAssessment.totalQuestions &&
    initialAssessment.totalQuestions > 0;

  const codingCompleted =
    codingAssessment?.status === 'Completed';



  const finalQuizCompleted =
    finalQuiz?.status === 'Completed';

  const overallInitialStatus =
    initialAssessment.status || 'Not Started';

  const readinessScore =
    initialAssessment.readinessScore != null
      ? initialAssessment.readinessScore
      : 'Pending';

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                     */
  /* -------------------------------------------------------------------------- */

  const getStatusClasses = (status) => {
    if (status === 'Completed') {
      return {
        wrapper:
          'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5',
        badge:
          'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
        icon:
          'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/25',
        accent: 'text-emerald-600 dark:text-emerald-400',
      };
    }

    if (
      status === 'In Progress' ||
      status === 'Ready' ||
      status === 'Paused'
    ) {
      return {
        wrapper:
          'border-blue-200/80 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/5',
        badge:
          'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300',
        icon:
          'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25',
        accent: 'text-blue-600 dark:text-blue-400',
      };
    }

    return {
      wrapper:
        'border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/40',
      badge:
        'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
      icon:
        'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-slate-400/20',
      accent: 'text-slate-600 dark:text-slate-300',
    };
  };

  const finalQuizStyles = getStatusClasses(finalQuiz.status);
  const miniProjectStyles = getStatusClasses(miniProject.status);

  /* -------------------------------------------------------------------------- */
  /* Main UI                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      {/* ---------------------------------------------------------------------- */}
      {/* Ambient background                                                       */}
      {/* ---------------------------------------------------------------------- */}

      <div className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10rem] top-24 h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-6">
        {/* ==================================================================== */}
        {/* Header                                                               */}
        {/* ==================================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 dark:border-slate-700/60 dark:bg-slate-900/75">
          {/* Header glow */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-5rem] left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 opacity-30 blur-md" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                  <GraduationCap className="h-7 w-7" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Skill Evaluation
                  </span>

                  {initialQuizCompleted && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Quiz Completed
                    </span>
                  )}
                </div>

                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  Assessments
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px] dark:text-slate-400">
                  Complete your assessments, strengthen your skill gaps, and
                  progress toward certification.
                </p>
              </div>
            </div>

            {/* Journey badge */}
            <div className="hidden lg:block">
              <div className="group rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                    <Target className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                      Your Journey
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                      Skill ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Readiness ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Certification
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Journey progress */}
          <div className="relative mt-8">
            <div className="absolute left-7 right-7 top-5 hidden h-px bg-gradient-to-r from-emerald-300 via-blue-300 to-slate-200 sm:block dark:from-emerald-500/30 dark:via-blue-500/30 dark:to-slate-700" />

            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
              <JourneyStep
                number="01"
                title="Initial Assessment"
                description="Knowledge & skills"
                completed={initialQuizCompleted}
                active={!initialQuizCompleted}
                icon={Brain}
              />

              <JourneyStep
                number="02"
                title="Coding Assessment"
                description="Practical evaluation"
                completed={codingCompleted}
                active={initialQuizCompleted && !codingCompleted}
                icon={Code2}
              />

              <JourneyStep
                number="03"
                title="Certification"
                description="Final evaluation"
                completed={finalQuizCompleted}
                active={codingCompleted && !finalQuizCompleted}
                icon={Award}
              />
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* Initial Assessment                                                   */}
        {/* ==================================================================== */}

        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80">
          {/* Gradient top line */}
          <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600" />

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-md" />

                  <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                    <Brain className="h-6 w-6" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Initial Assessment
                    </h2>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                      <Zap className="h-3.5 w-3.5" />
                      Skill Assessment
                    </span>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Complete both stages to evaluate your current skills,
                    readiness, and skill gaps.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() =>
                  navigate('/app/initial-assessment', {
                    state: { phase: 'coding' },
                  })
                }
                className="group inline-flex items-center justify-center gap-2"
              >
                Continue Coding Assessment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Stages */}
            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Stage 1 */}
              <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-green-50/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-emerald-500/20 dark:from-emerald-500/5 dark:via-slate-900 dark:to-green-500/5">
                <div className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-emerald-400/10 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
                        <Check className="h-4 w-4" />
                      </div>

                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                        Stage 1
                      </span>
                    </div>

                    <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Completed
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    Initial Quiz
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Knowledge and skill assessment
                  </p>

                  <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-100 bg-white/80 px-4 py-3.5 shadow-sm dark:border-emerald-500/10 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Questions
                      </span>
                    </div>

                    <span className="font-bold text-slate-900 dark:text-white">
                      {initialAssessment.questionsAnswered || 0} /{' '}
                      {initialAssessment.totalQuestions || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 2 */}
              <div
                className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                  codingCompleted
                    ? 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-green-50/60 hover:shadow-emerald-500/5 dark:border-emerald-500/20 dark:from-emerald-500/5 dark:via-slate-900 dark:to-green-500/5'
                    : 'border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 hover:shadow-blue-500/5 dark:border-blue-500/20 dark:from-blue-500/5 dark:via-slate-900 dark:to-indigo-500/5'
                }`}
              >
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-blue-400/10 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm ${
                          codingCompleted
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        }`}
                      >
                        {codingCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Code2 className="h-4 w-4" />
                        )}
                      </div>

                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                        Stage 2
                      </span>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${
                        codingCompleted
                          ? 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300'
                      }`}
                    >
                      {codingCompleted ? 'Completed' : 'Ready'}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    Coding Assessment
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Practical coding evaluation
                  </p>

                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-white/80 px-4 py-3.5 shadow-sm dark:border-blue-500/10 dark:bg-slate-900/50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <Play className="h-4 w-4" />
                    </div>

                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {codingCompleted
                        ? 'Coding assessment completed successfully.'
                        : 'Your coding assessment is ready to continue.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard
                label="Overall Status"
                value={overallInitialStatus}
                icon={Circle}
                variant={
                  overallInitialStatus === 'Completed'
                    ? 'success'
                    : 'warning'
                }
              />

              <MetricCard
                label="Questions"
                value={`${initialAssessment.questionsAnswered || 0}/${initialAssessment.totalQuestions || 0}`}
                icon={FileCode2}
                variant="neutral"
              />

              <MetricCard
                label="Readiness"
                value={readinessScore}
                icon={Target}
                variant="orange"
              />

              <MetricCard
                label="Purpose"
                value="Skill & Readiness"
                icon={Layers3}
                variant="neutral"
              />
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* Learning Progress                                                    */}
        {/* ==================================================================== */}

        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-7 dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-md" />

              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/20">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Learning Progress
                </h3>

                <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                  <Sparkles className="h-3 w-3" />
                  Learning Path
                </span>
              </div>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Complete the required learning activities before proceeding
                through the final certification process.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Enrolled */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/70 to-blue-50/30 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-blue-500/5">
              <div className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-blue-400/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Enrolled Courses
                    </span>
                  </div>

                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Pending
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Your enrolled courses will be tracked here.
                </p>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-50" />
                </div>
              </div>
            </div>

            {/* Recommended */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/70 to-violet-50/30 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-violet-500/5">
              <div className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-violet-400/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Recommended Courses
                    </span>
                  </div>

                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Pending
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Recommended learning activities will be tracked here.
                </p>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* Final Assessment                                                     */}
        {/* ==================================================================== */}

        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-violet-600" />

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-md" />

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 text-white shadow-lg shadow-orange-500/20">
                    <Trophy className="h-6 w-6" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Final Assessment
                    </h3>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
                      <Award className="h-3.5 w-3.5" />
                      Certification
                    </span>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Complete the final proctored quiz and mini project to
                    complete the certification assessment.
                  </p>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Final Quiz                                                        */}
            {/* ---------------------------------------------------------------- */}

            <div
              className={`group relative mt-7 overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl ${finalQuizStyles.wrapper}`}
            >
              <div className="absolute right-[-2rem] top-[-3rem] h-32 w-32 rounded-full bg-blue-400/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                      <GraduationCap className="h-5 w-5" />
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Final Quiz
                    </h4>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${finalQuizStyles.badge}`}
                    >
                      {finalQuiz.status || 'Not Started'}
                    </span>
                  </div>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Proctored final quiz covering the skills evaluated during
                    your learning journey.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <InfoPill>
                      Difficulty: 2ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ4
                    </InfoPill>

                    <InfoPill>
                      <LockKeyhole className="h-3 w-3" />
                      Proctored
                    </InfoPill>

                    <InfoPill>
                      Questions:{' '}
                      {finalQuiz.questionsAnswered || 0}/
                      {finalQuiz.totalQuestions || 0}
                    </InfoPill>

                    <InfoPill>
                      <Award className="h-3 w-3" />
                      Final Certification
                    </InfoPill>
                  </div>
                </div>

                <div className="shrink-0">
                  {finalQuiz.status === 'Completed' ? (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                      Completed
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() =>
                        navigate('/app/final-assessment')
                      }
                      className="group inline-flex items-center gap-2"
                    >
                      {finalQuiz.status === 'Paused' ||
                      finalQuiz.status === 'In Progress'
                        ? 'Resume Final Quiz'
                        : 'Start Final Quiz'}

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Mini Project                                                      */}
            {/* ---------------------------------------------------------------- */}

            <div
              className={`group relative mt-4 overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl ${miniProjectStyles.wrapper}`}
            >
              <div className="absolute right-[-2rem] top-[-3rem] h-32 w-32 rounded-full bg-orange-400/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-md shadow-orange-500/20">
                      <Rocket className="h-5 w-5" />
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Mini Project
                    </h4>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${miniProjectStyles.badge}`}
                    >
                      {miniProject.status || 'Not Available'}
                    </span>
                  </div>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Complete the assigned problem statement and submit your
                    project as part of the final certification process.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <InfoPill>
                      <Upload className="h-3 w-3" />
                      Submission: ZIP
                    </InfoPill>

                    <InfoPill>
                      One submission
                    </InfoPill>

                    <InfoPill>
                      <Award className="h-3 w-3" />
                      Final Certification
                    </InfoPill>
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setActiveView('mini-project')}
                    className="group inline-flex items-center gap-2"
                  >
                    Start Mini Project
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom certification message */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50 p-4 dark:border-indigo-500/20 dark:from-indigo-500/5 dark:via-blue-500/5 dark:to-violet-500/5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                  <Sparkles className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Complete your certification journey
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Finish the required assessment stages and learning
                    activities to progress through the certification process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* Dialog                                                                */}
        {/* ==================================================================== */}

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

            navigate('/app/initial-assessment', {
              state: {
                phase: 'coding',
              },
            });
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================================ */
/* Reusable UI pieces                                                           */
/* ============================================================================ */

function JourneyStep({
  number,
  title,
  description,
  completed,
  active,
  icon: Icon,
}) {
  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/60">
      <div className="relative shrink-0">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md ${
            completed
              ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/20'
              : active
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20'
                : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-400/10'
          }`}
        >
          {completed ? (
            <Check className="h-5 w-5" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>

        {active && (
          <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-blue-500 dark:border-slate-900" />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {number}
          </span>

          <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
            {title}
          </p>
        </div>

        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  variant = 'neutral',
}) {
  const styles = {
    success: {
      wrapper:
        'border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-500/20 dark:from-emerald-500/5 dark:to-slate-900',
      icon:
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
      value: 'text-emerald-700 dark:text-emerald-300',
    },
    warning: {
      wrapper:
        'border-amber-200/70 bg-gradient-to-br from-amber-50 to-white dark:border-amber-500/20 dark:from-amber-500/5 dark:to-slate-900',
      icon:
        'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
      value: 'text-amber-700 dark:text-amber-300',
    },
    orange: {
      wrapper:
        'border-orange-200/70 bg-gradient-to-br from-orange-50 to-white dark:border-orange-500/20 dark:from-orange-500/5 dark:to-slate-900',
      icon:
        'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300',
      value: 'text-orange-700 dark:text-orange-300',
    },
    neutral: {
      wrapper:
        'border-slate-200/80 bg-gradient-to-br from-slate-50 to-white dark:border-slate-700 dark:from-slate-800/60 dark:to-slate-900',
      icon:
        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      value: 'text-slate-800 dark:text-slate-100',
    },
  };

  const current = styles[variant] || styles.neutral;

  return (
    <div
      className={`group rounded-2xl border p-3.5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${current.wrapper}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${current.icon}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <span className="truncate text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>

      <p
        className={`mt-3 truncate text-sm font-bold ${current.value}`}
        title={String(value)}
      >
        {value}
      </p>
    </div>
  );
}

function InfoPill({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/70 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
      {children}
    </span>
  );
}