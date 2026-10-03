import React, { useEffect, useState } from 'react';
import {
  Mail,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Sparkles,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Headphones,
  ExternalLink,
  LifeBuoy,
  CircleHelp,
  Briefcase,
  BookOpen,
  Settings,
  User,
  ClipboardCheck,
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
    shortLabel: 'Assessment',
    description: 'Report an unexpected assessment termination.',
    icon: ClipboardCheck,
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    value: 'assessment',
    label: 'Assessment Issue',
    shortLabel: 'Assessment Issue',
    description: 'Problems with quizzes or assessments.',
    icon: FileText,
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    value: 'course',
    label: 'Course / Learning Issue',
    shortLabel: 'Learning',
    description: 'Get help with courses and learning.',
    icon: BookOpen,
    accent: 'from-orange-400 to-rose-500',
  },
  {
    value: 'job',
    label: 'Job / Application Issue',
    shortLabel: 'Jobs',
    description: 'Issues related to jobs or applications.',
    icon: Briefcase,
    accent: 'from-blue-500 to-indigo-500',
  },
  {
    value: 'technical',
    label: 'Technical Problem',
    shortLabel: 'Technical',
    description: "Something isn't working correctly.",
    icon: Settings,
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    value: 'account',
    label: 'Profile Issue',
    shortLabel: 'Profile',
    description: 'Help with your profile or account.',
    icon: User,
    accent: 'from-pink-500 to-rose-500',
  },
  {
    value: 'other',
    label: 'Other',
    shortLabel: 'Other',
    description: 'Something else? Tell us about it.',
    icon: CircleHelp,
    accent: 'from-slate-500 to-slate-700',
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
    <div className="min-h-screen overflow-hidden bg-[#f7f7fb]">

      {/* =========================================================
          DECORATIVE BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-[430px] w-[430px] rounded-full bg-indigo-300/20 blur-[110px]" />

        <div className="absolute right-[-120px] top-[-80px] h-[400px] w-[400px] rounded-full bg-orange-300/20 blur-[110px]" />

        <div className="absolute bottom-[-180px] left-[40%] h-[420px] w-[420px] rounded-full bg-pink-300/10 blur-[120px]" />

      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =========================================================
            TOP NAV
        ========================================================== */}

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="group flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-1 hover:rotate-3 hover:scale-110 hover:shadow-xl hover:shadow-indigo-300">
              <LifeBuoy
                size={19}
                className="text-white transition-transform duration-300 group-hover:rotate-12"
              />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                EduSaaS
              </p>

              <p className="text-xs font-bold text-slate-600">
                Help Center
              </p>
            </div>

          </div>

          <div className="group flex cursor-default items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md">

            <span className="h-2 w-2 rounded-full bg-emerald-500 transition-all duration-300 group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.7)]" />

            <span className="text-xs font-bold text-slate-700 transition-colors duration-300 group-hover:text-emerald-700">
              Support available
            </span>

          </div>

        </div>

        {/* =========================================================
            HERO
        ========================================================== */}

        <div className="group relative mb-7 overflow-hidden rounded-[30px] bg-[#17152b] shadow-2xl transition-all duration-500 hover:shadow-[0_25px_70px_rgba(79,70,229,0.22)]">

          <div className="absolute right-[-100px] top-[-150px] h-[400px] w-[400px] rounded-full bg-indigo-500/30 blur-[80px] transition-transform duration-700 group-hover:scale-125" />

          <div className="absolute bottom-[-170px] left-[35%] h-[360px] w-[360px] rounded-full bg-orange-400/20 blur-[90px] transition-transform duration-700 group-hover:scale-125" />

          <div className="absolute right-[25%] top-[20%] h-32 w-32 rounded-full bg-fuchsia-500/10 blur-3xl transition-all duration-700 group-hover:scale-150" />

          <div className="relative grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-12">

            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.12] hover:text-white">
                <Sparkles
                  size={12}
                  className="transition-transform duration-300 hover:rotate-12"
                />
                Personal Support Workspace
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">

                How can we

                <span className="block bg-gradient-to-r from-indigo-300 via-fuchsia-200 to-orange-200 bg-clip-text text-transparent transition-all duration-500 group-hover:from-orange-200 group-hover:via-fuchsia-200 group-hover:to-indigo-300">
                  help you today?
                </span>

              </h1>

              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-200 transition-colors duration-300 group-hover:text-white sm:text-base">
                Choose what you're having trouble with and
                we'll guide you to the right support option.
                For assessment termination issues, you can
                submit a report directly to Admin.
              </p>

            </div>

            {/* Hero visual */}

            <div className="hidden lg:block">

              <div className="relative h-40 w-40 transition-transform duration-700 group-hover:rotate-3 group-hover:scale-105">

                <div className="absolute inset-0 rotate-6 rounded-[38px] bg-gradient-to-br from-orange-400 to-rose-500 opacity-90 shadow-2xl transition-transform duration-700 group-hover:rotate-12" />

                <div className="absolute inset-3 rounded-[32px] bg-[#17152b] shadow-inner" />

                <div className="absolute inset-0 flex items-center justify-center">

                  <MessageCircle
                    size={48}
                    strokeWidth={1.5}
                    className="text-white transition-transform duration-500 group-hover:scale-110"
                  />

                </div>

                <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-12 group-hover:shadow-2xl">

                  <Sparkles
                    size={18}
                    className="text-orange-500"
                  />

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* =========================================================
            CATEGORY NAVIGATION
        ========================================================== */}

        <div className="mb-7">

          <div className="mb-4 flex items-end justify-between">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                Step 01
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900">
                What do you need help with?
              </h2>
            </div>

            <p className="hidden text-xs font-semibold text-slate-600 sm:block">
              Select one category
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">

            {categories.map((item) => {

              const Icon = item.icon;
              const active = category === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    handleCategoryChange(item.value)
                  }
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                    active
                      ? 'border-indigo-300 bg-white shadow-xl shadow-indigo-100 -translate-y-1'
                      : 'border-slate-200 bg-white shadow-sm hover:-translate-y-2 hover:border-indigo-200 hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/60 hover:shadow-xl hover:shadow-indigo-100/60'
                  }`}
                >

                  {/* Hover glow */}

                  <div
                    className={`pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${item.accent} opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-30`}
                  />

                  {active && (
                    <div
                      className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}
                    />
                  )}

                  <div
                    className={`relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg`}
                  >
                    <Icon
                      size={18}
                      className="text-white transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <p
                    className={`relative text-[13px] font-black leading-5 transition-colors duration-300 ${
                      active
                        ? 'text-slate-950'
                        : 'text-slate-800 group-hover:text-indigo-700'
                    }`}
                  >
                    {item.shortLabel}
                  </p>

                  <p className="relative mt-1.5 hidden text-[11px] font-medium leading-4 text-slate-600 transition-colors duration-300 group-hover:text-slate-800 xl:block">
                    {item.description}
                  </p>

                  {active && (
                    <div className="absolute right-3 top-3">
                      <CheckCircle2
                        size={15}
                        className="text-indigo-600 transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  )}

                  {/* Bottom hover line */}

                  <div
                    className={`absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-gradient-to-r ${item.accent} transition-all duration-300 group-hover:w-3/4`}
                  />

                </button>
              );
            })}

          </div>
        </div>

        {/* =========================================================
            WORKSPACE
        ========================================================== */}

        <div className="grid gap-6 lg:grid-cols-[0.32fr_0.68fr]">

          {/* =======================================================
              LEFT SUMMARY PANEL
          ======================================================== */}

          <div className="group rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/70 sm:p-6">

            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Step 02
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Support details
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              Your selected support category is shown below.
            </p>

            {/* Selected category */}

            <div className="group/category mt-6 cursor-default rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5 transition-all duration-400 hover:-translate-y-1 hover:from-indigo-100 hover:to-violet-100 hover:shadow-lg hover:shadow-indigo-100">

              <div className="flex items-center gap-3">

                {selectedCategory ? (
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${selectedCategory.accent} shadow-sm transition-all duration-300 group-hover/category:scale-110 group-hover/category:rotate-3 group-hover/category:shadow-lg`}
                  >
                    {React.createElement(
                      selectedCategory.icon,
                      {
                        size: 20,
                        className:
                          'text-white transition-transform duration-300 group-hover/category:scale-110',
                      }
                    )}
                  </div>
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 transition-all duration-300 group-hover/category:bg-indigo-200">
                    <CircleHelp
                      size={20}
                      className="text-slate-600 transition-colors duration-300 group-hover/category:text-indigo-700"
                    />
                  </div>
                )}

                <div className="min-w-0">

                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    Selected issue
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-950 transition-colors duration-300 group-hover/category:text-indigo-800">
                    {selectedCategory?.label ||
                      'No category selected'}
                  </p>

                </div>

              </div>

            </div>

            {/* Help information */}

            <div className="mt-5 space-y-3">

              <div className="group/info flex cursor-default gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/50">

                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-indigo-600 transition-transform duration-300 group-hover/info:scale-110 group-hover/info:rotate-6"
                />

                <div>

                  <p className="text-xs font-black text-slate-800 transition-colors duration-300 group-hover/info:text-indigo-800">
                    Secure support
                  </p>

                  <p className="mt-1 text-[12px] font-medium leading-5 text-slate-600">
                    Your submitted information is handled
                    securely.
                  </p>

                </div>

              </div>

              <div className="group/info flex cursor-default gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-white hover:shadow-lg hover:shadow-orange-100/50">

                <Headphones
                  size={17}
                  className="mt-0.5 shrink-0 text-orange-600 transition-transform duration-300 group-hover/info:scale-110 group-hover/info:-rotate-6"
                />

                <div>

                  <p className="text-xs font-black text-slate-800 transition-colors duration-300 group-hover/info:text-orange-800">
                    Need general help?
                  </p>

                  <p className="mt-1 text-[12px] font-medium leading-5 text-slate-600">
                    Contact the support team for non-assessment
                    issues.
                  </p>

                </div>

              </div>

            </div>

            {/* Contact Support */}

            <div className="group/contact relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 p-5 text-white shadow-lg shadow-orange-100 transition-all duration-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-200">

              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform duration-500 group-hover/contact:scale-150" />

              <div className="absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-white/10 transition-transform duration-500 group-hover/contact:scale-150" />

              <div className="relative">

                <Mail
                  size={22}
                  className="mb-3 transition-transform duration-300 group-hover/contact:scale-110 group-hover/contact:-rotate-6"
                />

                <p className="text-sm font-black">
                  Prefer email?
                </p>

                <p className="mt-1 text-xs font-medium leading-5 text-white/90">
                  Send your issue directly to our support team.
                </p>

                <div className="relative">

                  <button
                    type="button"
                    onClick={contactSupportButton}
                    className="group/button mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-rose-600 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-xl active:translate-y-0"
                  >
                    Contact Support

                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover/button:translate-x-1.5"
                    />
                  </button>

                  {supportMessage && (
                    <div className="absolute left-0 top-full z-30 mt-3 w-max max-w-[250px] rounded-xl border border-orange-200 bg-white px-4 py-3 text-xs font-bold text-orange-700 shadow-2xl">
                      Email support is currently unavailable.
                      We'll be back soon.
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* =======================================================
              RIGHT MAIN FORM
          ======================================================== */}

          <div className="group/form overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/70">

            {/* Workspace header */}

            <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-orange-50 px-5 py-5 transition-all duration-500 group-hover/form:from-indigo-100/70 group-hover/form:to-orange-100/60 sm:px-7">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-black text-white shadow-sm transition-all duration-300 group-hover/form:scale-110 group-hover/form:shadow-md">
                      02
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">
                      Support Workspace
                    </span>

                  </div>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    {selectedCategory?.label ||
                      'Select an issue'}
                  </h2>

                </div>

                <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:block">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-emerald-500 transition-transform duration-300 hover:scale-150" />

                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                      Ready
                    </span>

                  </div>

                </div>

              </div>

            </div>

            <div className="p-5 sm:p-7">

              {/* =================================================
                  FALLBACK SELECT
              ================================================== */}

              {!category && (
                <div className="group/empty rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-all duration-400 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-lg hover:shadow-indigo-100/40">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 transition-all duration-400 group-hover/empty:scale-110 group-hover/empty:rotate-3 group-hover/empty:bg-indigo-200">

                    <CircleHelp
                      size={26}
                      className="text-indigo-600 transition-transform duration-400 group-hover/empty:scale-110"
                    />

                  </div>

                  <h3 className="mt-4 font-black text-slate-950">
                    Choose a support category
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                    Select one of the categories above to see
                    the appropriate support options.
                  </p>

                </div>
              )}

              {/* =================================================
                  ASSESSMENT TERMINATION
              ================================================== */}

              {category === 'assessment_termination' && (
                <div>

                  {/* Alert header */}

                  <div className="group/alert rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 transition-all duration-400 hover:-translate-y-1 hover:border-amber-300 hover:from-amber-100 hover:to-orange-100 hover:shadow-lg hover:shadow-amber-100">

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm transition-all duration-300 group-hover/alert:scale-110 group-hover/alert:rotate-3 group-hover/alert:shadow-lg">

                        <AlertTriangle
                          size={21}
                          className="text-white transition-transform duration-300 group-hover/alert:scale-110"
                        />

                      </div>

                      <div>

                        <h3 className="font-black text-slate-950">
                          Assessment Termination
                        </h3>

                        <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
                          Tell Admin what happened so your
                          assessment session can be reviewed.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* No session ID */}

                  {!sessionId && (
                    <div className="group/warning mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 hover:shadow-md">

                      <AlertTriangle
                        size={18}
                        className="mt-0.5 shrink-0 text-amber-600 transition-transform duration-300 group-hover/warning:scale-110"
                      />

                      <p className="text-sm font-medium leading-6 text-amber-900">
                        Please open Help & Support from the
                        terminated assessment so we can link
                        your report to the correct assessment
                        session.
                      </p>

                    </div>
                  )}

                  {/* Existing report */}

                  {sessionId && currentReport && (
                    <div className="group/report mt-5 rounded-2xl border border-indigo-100 bg-slate-50 p-5 transition-all duration-400 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/50 sm:p-6">

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 transition-all duration-300 group-hover/report:scale-110 group-hover/report:rotate-3 group-hover/report:bg-indigo-200">

                            <FileText
                              size={18}
                              className="text-indigo-600"
                            />

                          </div>

                          <h4 className="font-black text-slate-950">
                            Your Report
                          </h4>

                        </div>

                        <span className="w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800 transition-all duration-300 group-hover/report:bg-indigo-200">
                          {currentReport.status}
                        </span>

                      </div>

                      <div className="group/reason mt-5 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">

                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                          Reason
                        </p>

                        <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                          {currentReport.reason}
                        </p>

                      </div>

                      {currentReport.admin_notes && (
                        <div className="group/admin mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-100 hover:shadow-md">

                          <div className="flex items-center gap-2">

                            <MessageCircle
                              size={15}
                              className="text-indigo-600 transition-transform duration-300 group-hover/admin:scale-110"
                            />

                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">
                              Admin Response
                            </p>

                          </div>

                          <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                            {currentReport.admin_notes}
                          </p>

                        </div>
                      )}

                      {currentReport.status === 'Approved' && (
                        <div className="group/approved mt-4 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md">

                          <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0 text-emerald-600 transition-transform duration-300 group-hover/approved:scale-110 group-hover/approved:rotate-6"
                          />

                          <p className="text-sm font-bold leading-6 text-emerald-900">
                            Your report has been approved. You
                            can now restart the assessment.
                          </p>

                        </div>
                      )}

                      {currentReport.status === 'Rejected' && (
                        <div className="group/rejected mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md">

                          <AlertTriangle
                            size={18}
                            className="mt-0.5 shrink-0 text-red-600 transition-transform duration-300 group-hover/rejected:scale-110"
                          />

                          <p className="text-sm font-bold leading-6 text-red-900">
                            Your report was rejected. Please
                            contact support if you need further
                            assistance.
                          </p>

                        </div>
                      )}

                    </div>
                  )}

                  {/* =================================================
                      NEW REPORT FORM
                  ================================================== */}

                  {sessionId &&
                    !currentReport &&
                    !reportSubmitted && (
                      <form
                        onSubmit={handleSubmitAssessmentReport}
                        className="mt-6"
                      >

                        <div className="mb-6">

                          <h4 className="text-lg font-black text-slate-950">
                            Report to Admin
                          </h4>

                          <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                            Explain what happened during the
                            assessment. Admin will review your
                            report before the assessment can be
                            restarted.
                          </p>

                        </div>

                        {/* Assessment details */}

                        {assessmentType && (
                          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                            <div className="group/detail rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/50">

                              <div className="flex items-center gap-2">

                                <Clock3
                                  size={15}
                                  className="text-indigo-600 transition-transform duration-300 group-hover/detail:scale-110"
                                />

                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                  Assessment
                                </p>

                              </div>

                              <p className="mt-2 text-sm font-black text-slate-900 transition-colors duration-300 group-hover/detail:text-indigo-700">
                                {assessmentType}
                              </p>

                            </div>

                            <div className="group/detail rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-white hover:shadow-lg hover:shadow-orange-100/50">

                              <div className="flex items-center gap-2">

                                <ShieldCheck
                                  size={15}
                                  className="text-orange-600 transition-transform duration-300 group-hover/detail:scale-110"
                                />

                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                  Stage
                                </p>

                              </div>

                              <p className="mt-2 text-sm font-black text-slate-900 transition-colors duration-300 group-hover/detail:text-orange-700">
                                {assessmentStage}
                              </p>

                            </div>

                          </div>
                        )}

                        {/* Reason */}

                        <label className="block text-sm font-black text-slate-900">
                          Reason for termination
                        </label>

                        <textarea
                          value={reportReason}
                          onChange={(e) =>
                            setReportReason(e.target.value)
                          }
                          rows={4}
                          placeholder="Explain what happened..."
                          disabled={reportSubmitting}
                          className="mt-2.5 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-medium leading-6 text-slate-800 placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-indigo-300 hover:bg-white hover:shadow-md focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        />

                        {/* Additional information */}

                        <label className="mt-5 block text-sm font-black text-slate-900">
                          Additional Information
                        </label>

                        <textarea
                          value={reportEvidence}
                          onChange={(e) =>
                            setReportEvidence(e.target.value)
                          }
                          rows={4}
                          placeholder="Add any additional information that may help Admin review the issue..."
                          disabled={reportSubmitting}
                          className="mt-2.5 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-medium leading-6 text-slate-800 placeholder:text-slate-500 outline-none transition-all duration-300 hover:border-orange-300 hover:bg-white hover:shadow-md focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                        />

                        {/* Evidence */}

                        <label className="mt-5 block text-sm font-black text-slate-900">
                          Supporting Evidence
                        </label>

                        <div className="group/upload mt-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md">

                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.pdf"
                            onChange={(e) =>
                              setReportEvidenceFile(
                                e.target.files?.[0] || null
                              )
                            }
                            disabled={reportSubmitting}
                            className="block w-full cursor-pointer rounded-lg px-2 py-2 text-sm font-medium text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:text-sm file:font-black file:text-indigo-700 file:transition-all hover:file:bg-indigo-200 hover:file:shadow-sm"
                          />

                        </div>

                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <ShieldCheck
                            size={12}
                            className="transition-transform duration-300 hover:scale-110"
                          />
                          Upload PNG, JPG, JPEG, or PDF.
                          Maximum size: 10 MB.
                        </p>

                        {/* Error */}

                        {reportError && (
                          <div className="group/error mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md">

                            <AlertTriangle
                              size={18}
                              className="mt-0.5 shrink-0 text-red-600 transition-transform duration-300 group-hover/error:scale-110"
                            />

                            <p className="text-sm font-medium leading-6 text-red-800">
                              {reportError}
                            </p>

                          </div>
                        )}

                        {/* Submit */}

                        <div className="mt-6">

                          <button
                            type="submit"
                            disabled={reportSubmitting}
                            className="group/submit inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-1 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 hover:shadow-xl hover:shadow-indigo-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                          >

                            {reportSubmitting
                              ? 'Submitting...'
                              : 'Report to Admin'}

                            {!reportSubmitting && (
                              <ArrowRight
                                size={16}
                                className="transition-transform duration-300 group-hover/submit:translate-x-1.5"
                              />
                            )}

                          </button>

                        </div>

                      </form>
                    )}

                  {/* =================================================
                      SUCCESS
                  ================================================== */}

                  {reportSubmitted && !currentReport && (
                    <div className="group/success mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 transition-all duration-400 hover:-translate-y-1 hover:border-emerald-300 hover:from-emerald-100 hover:to-teal-100 hover:shadow-lg hover:shadow-emerald-100 sm:p-6">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 shadow-sm transition-all duration-300 group-hover/success:scale-110 group-hover/success:rotate-3 group-hover/success:shadow-lg">

                          <CheckCircle2
                            size={22}
                            className="text-white transition-transform duration-300 group-hover/success:scale-110"
                          />

                        </div>

                        <div>

                          <h4 className="font-black text-emerald-950">
                            Report Submitted
                          </h4>

                          <p className="mt-1 text-sm font-medium leading-6 text-emerald-800">
                            Your assessment termination report
                            has been submitted to Admin. You
                            cannot restart the assessment until
                            the report is approved.
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* Go assessments */}

                  {category === 'assessment_termination' && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/app/assessments')
                      }
                      className="group/assessment mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-lg hover:shadow-indigo-100 active:translate-y-0"
                    >
                      Go to Assessments

                      <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover/assessment:translate-x-1.5"
                      />
                    </button>
                  )}

                </div>
              )}

              {/* =================================================
                  OTHER CATEGORIES
              ================================================== */}

              {category &&
                category !== 'assessment_termination' && (
                  <div>

                    <div className="group/general rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-orange-50 p-6 transition-all duration-400 hover:-translate-y-1 hover:border-indigo-200 hover:from-indigo-100 hover:via-white hover:to-orange-100 hover:shadow-xl hover:shadow-indigo-100/50">

                      <div className="flex items-start gap-4">

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${selectedCategory?.accent} shadow-sm transition-all duration-300 group-hover/general:scale-110 group-hover/general:rotate-3 group-hover/general:shadow-lg`}
                        >
                          {selectedCategory &&
                            React.createElement(
                              selectedCategory.icon,
                              {
                                size: 21,
                                className:
                                  'text-white transition-transform duration-300 group-hover/general:scale-110',
                              }
                            )}
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-xl font-black text-slate-950 transition-colors duration-300 group-hover/general:text-indigo-800">
                              {selectedCategory?.label}
                            </h3>

                            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-indigo-700 transition-all duration-300 group-hover/general:bg-indigo-200">
                              Support
                            </span>

                          </div>

                          <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-700">
                            Please contact our support team and
                            include the relevant details about your
                            issue so we can assist you effectively.
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">

                      <div className="group/email rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all duration-400 hover:-translate-y-2 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/60">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 transition-all duration-300 group-hover/email:scale-110 group-hover/email:rotate-3 group-hover/email:bg-indigo-200 group-hover/email:shadow-md">

                          <Mail
                            size={18}
                            className="text-indigo-600 transition-transform duration-300 group-hover/email:scale-110"
                          />

                        </div>

                        <h4 className="mt-4 text-sm font-black text-slate-900 transition-colors duration-300 group-hover/email:text-indigo-700">
                          Email Support
                        </h4>

                        <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                          Explain your issue and our support
                          team can assist you.
                        </p>

                        <button
                          type="button"
                          onClick={contactSupport}
                          className="group/emailButton mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-100 transition-all duration-300 hover:-translate-y-1 hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg active:translate-y-0"
                        >
                          Contact Support

                          <ExternalLink
                            size={13}
                            className="transition-transform duration-300 group-hover/emailButton:translate-x-0.5 group-hover/emailButton:-translate-y-0.5"
                          />

                        </button>

                      </div>

                      <div className="group/details rounded-2xl border border-orange-100 bg-orange-50/60 p-5 transition-all duration-400 hover:-translate-y-2 hover:border-orange-200 hover:bg-orange-50 hover:shadow-xl hover:shadow-orange-100/60">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 transition-all duration-300 group-hover/details:scale-110 group-hover/details:-rotate-3 group-hover/details:bg-orange-200 group-hover/details:shadow-md">

                          <Headphones
                            size={18}
                            className="text-orange-600 transition-transform duration-300 group-hover/details:scale-110"
                          />

                        </div>

                        <h4 className="mt-4 text-sm font-black text-slate-900 transition-colors duration-300 group-hover/details:text-orange-700">
                          Include Details
                        </h4>

                        <p className="mt-1 text-xs font-medium leading-5 text-slate-700">
                          Adding useful context can make it easier
                          to understand your issue.
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-xs font-black text-orange-700">

                          <ShieldCheck
                            size={14}
                            className="transition-transform duration-300 group-hover/details:scale-110"
                          />

                          Secure support request

                        </div>

                      </div>

                    </div>

                  </div>
                )}

            </div>
          </div>
        </div>

        {/* =========================================================
            FOOTER
        ========================================================== */}

        <div className="group/footer mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-400 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg hover:shadow-slate-200/60 sm:flex-row">

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 transition-colors duration-300 group-hover/footer:text-slate-800">

            <ShieldCheck
              size={14}
              className="text-emerald-600 transition-transform duration-300 group-hover/footer:scale-110"
            />

            Your submitted information is securely handled.

          </div>

          <div className="text-xs font-black text-slate-600 transition-colors duration-300 group-hover/footer:text-indigo-700">
            EduSaaS Help Center
          </div>

        </div>

      </div>
    </div>
  );
}