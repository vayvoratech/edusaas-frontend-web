import React, { useCallback, useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  BookOpen,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileQuestion,
  GraduationCap,
  Layers3,
  MessageSquare,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  Video,
  X,
  ArrowLeft,
  ArrowRight,
  Archive,
  ClipboardList,
  LayoutDashboard,
} from 'lucide-react';

import { Button } from '../components/ui/Button';

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  getLessonsForCourse,
  deleteLesson,
  getCourseRatings,
  resolveAssetUrl,
} from '../services/api';

import { useAuth } from '../context/AuthContext';
import AppDialog from '../components/ui/AppDialog';

function ReviewerAvatar({
  name,
  avatarUrl,
  size = 'w-8 h-8',
  textClass = 'text-xs',
}) {
  const [imgError, setImgError] = useState(false);

  const initials =
    (name || '?')
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'S';

  const resolved =
    !imgError && avatarUrl ? resolveAssetUrl(avatarUrl) : null;

  if (resolved) {
    return (
      <img
        src={resolved}
        alt=""
        onError={() => setImgError(true)}
        className={`${size} rounded-full object-cover border border-white/70 shrink-0 shadow-md`}
      />
    );
  }

  const bgColors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-teal-100 text-teal-700 border-teal-200',
  ];

  const charSum = (name || 'S')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const colorClass = bgColors[charSum % bgColors.length];

  return (
    <div
      className={`${size} rounded-full ${colorClass} border flex items-center justify-center font-bold tracking-wider shrink-0 select-none shadow-sm ${textClass}`}
      title={name}
    >
      {initials}
    </div>
  );
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b'];
const STATUSES = ['', 'active', 'draft', 'archived'];

const statusStyles = {
  active: {
    wrapper:
      'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  draft: {
    wrapper:
      'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock3,
  },
  archived: {
    wrapper:
      'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: Archive,
  },
};

function StatusBadge({ status }) {
  const config =
    statusStyles[status] || statusStyles.archived;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${config.wrapper}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot}`}
      />
      <Icon className="w-3 h-3" />
      {status || 'unknown'}
    </span>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  gradient,
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl p-5 shadow-[0_12px_40px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.11)]`}
    >
      <div
        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-slate-400">
            {label}
          </p>

          <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </div>

          {description && (
            <p className="mt-1.5 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white grid place-items-center shadow-lg`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function ManageCourses() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('Last Updated');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  const [dialog, setDialog] = useState({
    open: false,
    type: 'error',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    destructive: false,
    onConfirm: null,
  });

  const closeDialog = () => {
    setDialog((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const showDialog = (options) => {
    setDialog({
      open: true,
      type: 'error',
      title: 'Something went wrong',
      message: '',
      confirmText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      destructive: false,
      onConfirm: closeDialog,
      ...options,
    });
  };

  const [step, setStep] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const [feedbackCourse, setFeedbackCourse] = useState(null);

  const [feedbackData, setFeedbackData] = useState({
    average_rating: 0,
    total_reviews: 0,
    reviews: [],
    distribution: {},
  });

  const [loadingFeedback, setLoadingFeedback] =
    useState(false);

  const onOpenFeedback = async (course) => {
    setFeedbackCourse(course);
    setLoadingFeedback(true);

    try {
      const data = await getCourseRatings(course.id);
      setFeedbackData(data);
    } catch (err) {
      console.error(
        'Failed to load course reviews:',
        err
      );

      setFeedbackData({
        average_rating: 0,
        total_reviews: 0,
        reviews: [],
        distribution: {},
      });
    } finally {
      setLoadingFeedback(false);
    }
  };

  const load = useCallback(async () => {
    try {
      setError(null);

      const filters =
        user?.role === 'educator'
          ? { educator_id: user.id }
          : {};

      if (status) {
        filters.status = status;
      }

      setCourses(await getCourses(filters));
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message
      );
    }
  }, [status, user?.role, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = {
    active: courses.filter(
      (c) => c.status === 'active'
    ).length,

    draft: courses.filter(
      (c) => c.status === 'draft'
    ).length,

    archived: courses.filter(
      (c) => c.status === 'archived'
    ).length,
  };

  const pieData = [
    {
      name: 'Active',
      value: summary.active,
    },
    {
      name: 'Draft',
      value: summary.draft,
    },
    {
      name: 'Archived',
      value: summary.archived,
    },
  ];

  const totalCourses = courses.length;

  const onSave = async (e) => {
    e.preventDefault();

    console.log({
      title: editing.title,
      category: editing.category,
      difficulty: editing.difficulty,
      status: editing.status,
      description: editing.description,
      lessons,
    });

    try {
      let course;

      const formData = new FormData();

      if (editing.title) {
        formData.append(
          'title',
          editing.title
        );
      }

      if (editing.category) {
        formData.append(
          'category',
          editing.category
        );
      }

      if (editing.difficulty) {
        formData.append(
          'difficulty',
          editing.difficulty
        );
      }

      if (editing.status) {
        formData.append(
          'status',
          editing.status
        );
      }

      if (editing.description) {
        formData.append(
          'description',
          editing.description
        );
      }

      if (thumbnailFile) {
        formData.append(
          'thumbnail',
          thumbnailFile
        );
      }

      if (editing.id) {
        course = await updateCourse(
          editing.id,
          formData
        );
      } else {
        course = await createCourse(formData);
      }

      if (lessons.length > 0) {
        for (
          let i = 0;
          i < lessons.length;
          i++
        ) {
          const l = lessons[i];

          if (
            !l.quiz ||
            l.quiz.length < 5 ||
            l.quiz.length > 20
          ) {
            throw new Error(
              `Lesson ${i + 1} must have between 5 and 20 quiz questions.`
            );
          }

          for (
            let j = 0;
            j < l.quiz.length;
            j++
          ) {
            const q = l.quiz[j];

            if (
              !q.question ||
              !q.options ||
              q.options.length !== 4 ||
              q.correct_option === undefined
            ) {
              throw new Error(
                `Question ${j + 1} in Lesson ${i + 1} is incomplete.`
              );
            }
          }
        }

        await Promise.all(
          lessons.map((lesson, index) => {
            const lessonPayload = {
              title: lesson.title,
              video_url: lesson.video_url,
              duration: Number(
                lesson.duration
              ),
              order_index: index + 1,
              quiz: lesson.quiz,
            };

            if (lesson.id) {
              return updateLesson(
                lesson.id,
                lessonPayload
              );
            }

            return createLesson(
              course.id,
              lessonPayload
            );
          })
        );
      }

      setEditing(null);
      setCreating(false);
      setStep(1);
      setLessons([]);
      setThumbnailFile(null);

      load();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message
      );
    }
  };

  const confirmDeleteCourse = async (c) => {
    try {
      await deleteCourse(c.id);

      setCourses((prev) =>
        prev.filter(
          (x) => x.id !== c.id
        )
      );
    } catch (err) {
      showDialog({
        type: 'error',
        title: 'Delete Failed',
        message:
          err.response?.data?.error ||
          err.message ||
          'Failed to delete the course.',
      });
    }
  };

  const onDelete = (c) => {
    showDialog({
      type: 'confirm',
      title: 'Delete Course?',
      message: `Are you sure you want to delete "${c.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      destructive: true,
      onConfirm: () => {
        closeDialog();
        confirmDeleteCourse(c);
      },
    });
  };

  const sorted = [...courses].sort(
    (a, b) => {
      if (sort === 'Title') {
        return a.title.localeCompare(
          b.title
        );
      }

      return (
        new Date(b.created_at) -
        new Date(a.created_at)
      );
    }
  );

  const openCreate = () => {
    setError(null);

    setEditing({
      status: 'active',
      difficulty: 'beginner',
    });

    setCreating(true);
    setStep(1);
    setLessons([]);
    setThumbnailFile(null);
  };

  const closeCourseEditor = () => {
    setEditing(null);
    setCreating(false);
    setStep(1);
    setLessons([]);
    setThumbnailFile(null);
  };

  return (
    <>
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

      <div className="relative space-y-6 pb-8">
        {/* Ambient page lighting */}
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-96 -left-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        {/* =========================================================
            EDUCATOR COURSES HERO
        ========================================================== */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 sm:p-8 lg:p-9 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl" />

          <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">
                  Educator Workspace
                </span>
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight">
                Educator Courses
              </h1>

              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-blue-100/80">
                Build engaging learning experiences,
                organize your curriculum, monitor course
                quality, and understand learner feedback
                from one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                  Create Course
                </button>

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-md">
                  <BookOpen className="h-4 w-4 text-cyan-300" />
                  {totalCourses} total course
                  {totalCourses === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-blue-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Active
                  </span>
                </div>
                <div className="mt-2 text-3xl font-black">
                  {summary.active}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-amber-200">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Drafts
                  </span>
                </div>
                <div className="mt-2 text-3xl font-black">
                  {summary.draft}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SUMMARY METRICS
        ========================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Courses"
            value={totalCourses}
            description="Courses in your workspace"
            icon={BookOpen}
            gradient="from-blue-600 to-cyan-500"
          />

          <StatCard
            label="Active Courses"
            value={summary.active}
            description="Currently available to learners"
            icon={GraduationCap}
            gradient="from-emerald-500 to-teal-500"
          />

          <StatCard
            label="Draft Courses"
            value={summary.draft}
            description="Courses still being prepared"
            icon={ClipboardList}
            gradient="from-amber-500 to-orange-500"
          />

          <StatCard
            label="Archived"
            value={summary.archived}
            description="Courses moved out of active use"
            icon={Archive}
            gradient="from-slate-600 to-slate-800"
          />
        </div>

        {/* =========================================================
            FILTER TOOLBAR
        ========================================================== */}
        <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white grid place-items-center shadow-lg">
                <LayoutDashboard className="w-5 h-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Course Portfolio
                </h2>
                <p className="text-xs text-slate-500">
                  Manage and organize your learning content
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="appearance-none w-full sm:w-44 rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                >
                  {STATUSES.map((s) => (
                    <option
                      key={s || 'all'}
                      value={s}
                    >
                      {s
                        ? `Status: ${s}`
                        : 'Status: All'}
                    </option>
                  ))}
                </select>

                <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value)
                  }
                  className="appearance-none w-full sm:w-44 rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option>Last Updated</option>
                  <option>Title</option>
                </select>

                <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
              </div>

              <Button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Create Course
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 grid place-items-center shrink-0">
                <CircleAlert className="w-5 h-5" />
              </div>

              <div>
                <p className="font-bold text-red-800 text-sm">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            MAIN CONTENT
        ========================================================== */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Courses */}
          <section className="xl:col-span-2 overflow-hidden rounded-[24px] border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_16px_50px_rgba(15,23,42,0.07)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-violet-50/50 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-slate-900">
                      Your Courses
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {sorted.length} course
                    {sorted.length === 1 ? '' : 's'} shown
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                  <Users className="w-4 h-4" />
                  Educator View
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Course
                    </th>

                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Category
                    </th>

                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Status
                    </th>

                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Difficulty
                    </th>

                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Feedback
                    </th>

                    <th className="text-right px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sorted.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-16 text-center"
                      >
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-blue-500 grid place-items-center">
                          <BookOpen className="w-7 h-7" />
                        </div>

                        <p className="mt-4 font-bold text-slate-700">
                          No courses found
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Create your first course to start building your learning portfolio.
                        </p>

                        <button
                          type="button"
                          onClick={openCreate}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
                        >
                          <Plus className="w-4 h-4" />
                          Create Course
                        </button>
                      </td>
                    </tr>
                  ) : (
                    sorted.map((c) => (
                      <tr
                        key={c.id}
                        className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-violet-50/30 transition-all duration-200"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-[230px]">
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 text-white grid place-items-center shadow-md shrink-0">
                              {c.thumbnail_url ? (
                                <img
                                  src={resolveAssetUrl(
                                    c.thumbnail_url
                                  )}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BookOpen className="w-5 h-5" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate max-w-[250px]">
                                {c.title}
                              </div>

                              <div className="mt-0.5 text-[11px] text-slate-400">
                                Course ID #{c.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-slate-600 font-medium">
                            {c.category || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={c.status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                            {c.difficulty ||
                              'beginner'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {c.rating ? (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenFeedback(c)
                              }
                              className="group/rating inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 transition hover:-translate-y-0.5 hover:shadow-md"
                              title="Click to view student reviews and comments"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />

                              <span>
                                {c.rating.toFixed(
                                  1
                                )}
                              </span>

                              <span className="text-amber-700/60 font-normal">
                                (
                                {
                                  c.rating_count
                                }{' '}
                                review
                                {c.rating_count ===
                                1
                                  ? ''
                                  : 's'}
                                )
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenFeedback(c)
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-600 transition"
                              title="No reviews yet. Click to inspect."
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              No reviews yet
                            </button>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenFeedback(c)
                              }
                              className="w-9 h-9 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 grid place-items-center hover:bg-amber-100 transition"
                              title="View Student Feedback & Reviews"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 grid place-items-center hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition"
                              onClick={async () => {
                                setError(null);
                                setEditing({
                                  ...c,
                                });
                                setStep(1);

                                try {
                                  const lessonData =
                                    await getLessonsForCourse(
                                      c.id
                                    );

                                  const mappedLessons =
                                    lessonData.map(
                                      (l) => ({
                                        ...l,
                                        quiz:
                                          l.quizzes &&
                                          l.quizzes.length >
                                            0
                                            ? l
                                                .quizzes[0]
                                                .questions
                                            : [],
                                      })
                                    );

                                  setLessons(
                                    mappedLessons
                                  );
                                } catch (err) {
                                  console.error(
                                    err
                                  );
                                  setLessons([]);
                                }
                              }}
                              title="Edit Course"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              className="w-9 h-9 rounded-xl border border-red-200 bg-red-50 text-red-600 grid place-items-center hover:bg-red-100 transition"
                              onClick={() =>
                                onDelete(c)
                              }
                              title="Delete Course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* =====================================================
              COURSE SUMMARY
          ====================================================== */}
          <section className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/80 backdrop-blur-xl p-5 shadow-[0_16px_50px_rgba(15,23,42,0.07)]">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center shadow-lg">
                <BarChart3 className="w-5 h-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Course Overview
                </h2>
                <p className="text-xs text-slate-500">
                  Portfolio distribution
                </p>
              </div>
            </div>

            <div className="relative h-52 mt-3">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={82}
                    innerRadius={52}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map(
                      (_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i]}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      boxShadow:
                        '0 10px 30px rgba(15,23,42,.10)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-3xl font-black text-slate-900">
                    {totalCourses}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Total
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 mt-2">
              <div className="flex items-center justify-between rounded-xl bg-blue-50/70 border border-blue-100 px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Active
                </div>

                <span className="font-black text-blue-700">
                  {summary.active}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-100 px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Draft
                </div>

                <span className="font-black text-emerald-700">
                  {summary.draft}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-amber-50/70 border border-amber-100 px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Archived
                </div>

                <span className="font-black text-amber-700">
                  {summary.archived}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-4 text-white overflow-hidden relative">
              <div className="absolute -right-8 -bottom-10 w-24 h-24 rounded-full bg-cyan-400/20 blur-2xl" />

              <div className="relative flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-300 shrink-0" />

                <div>
                  <p className="text-xs font-bold">
                    Educator workspace
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-blue-100/70">
                    Keep your active courses
                    updated and use learner
                    feedback to improve your
                    curriculum.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================
            CREATE / EDIT COURSE MODAL
        ========================================================== */}
        {(creating || editing) && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm grid place-items-center z-50 p-3 sm:p-5">
            <div className="bg-white rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.35)] w-full max-w-5xl max-h-[94vh] overflow-hidden flex flex-col">
              {/* ===================================================
                  STEP 1
              ==================================================== */}
              {step === 1 && (
                <div className="flex flex-col h-full min-h-0">
                  <div className="relative overflow-hidden px-5 sm:px-8 py-5 sm:py-6 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 text-white">
                    <div className="absolute -right-12 -top-20 w-56 h-56 rounded-full bg-cyan-400/15 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-48 h-32 rounded-full bg-violet-500/20 blur-3xl" />

                    <div className="relative flex items-center justify-between gap-5">
                      <div>
                        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-blue-200">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Educator Course Builder
                        </div>

                        <h2 className="mt-2 text-xl sm:text-2xl font-black">
                          {editing?.id
                            ? 'Edit Course'
                            : 'Create Course'}
                        </h2>

                        <p className="mt-1 text-xs sm:text-sm text-blue-100/70">
                          Set up your course details
                          before building the curriculum.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={closeCourseEditor}
                        className="w-9 h-9 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 grid place-items-center transition shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative mt-6 flex items-center max-w-md">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-white text-blue-700 grid place-items-center font-black shadow-lg">
                          1
                        </div>

                        <span className="text-xs font-bold text-white">
                          Course Details
                        </span>
                      </div>

                      <div className="flex-1 h-px bg-white/20 mx-4" />

                      <div className="flex items-center gap-2 opacity-50">
                        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 grid place-items-center font-bold">
                          2
                        </div>

                        <span className="hidden sm:inline text-xs font-semibold">
                          Curriculum
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-7 bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30">
                    <div className="rounded-[24px] border border-white bg-white/90 backdrop-blur-xl shadow-sm p-5 sm:p-7">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 grid place-items-center">
                          <FileQuestion className="w-5 h-5" />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">
                            Course Information
                          </h3>

                          <p className="text-xs text-slate-500">
                            Give learners a clear understanding of what this course offers.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Course Title
                          </label>

                          <input
                            value={
                              editing.title || ''
                            }
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                title: e.target.value,
                              })
                            }
                            required
                            placeholder="Enter course title"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Category
                          </label>

                          <input
                            value={
                              editing.category ||
                              ''
                            }
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                category:
                                  e.target.value,
                              })
                            }
                            placeholder="Example: Web Development"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Difficulty
                          </label>

                          <div className="relative">
                            <select
                              value={
                                editing.difficulty ||
                                'beginner'
                              }
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  difficulty:
                                    e.target.value,
                                })
                              }
                              className="appearance-none w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            >
                              <option value="beginner">
                                Beginner
                              </option>
                              <option value="intermediate">
                                Intermediate
                              </option>
                              <option value="advanced">
                                Advanced
                              </option>
                            </select>

                            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Status
                          </label>

                          <div className="relative">
                            <select
                              value={
                                editing.status ||
                                'active'
                              }
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  status:
                                    e.target.value,
                                })
                              }
                              className="appearance-none w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            >
                              <option value="active">
                                Active
                              </option>
                              <option value="draft">
                                Draft
                              </option>
                              <option value="archived">
                                Archived
                              </option>
                            </select>

                            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Course Description
                        </label>

                        <textarea
                          rows={6}
                          value={
                            editing.description ||
                            ''
                          }
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              description:
                                e.target.value,
                            })
                          }
                          placeholder="Describe what students will learn in this course..."
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none resize-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      <div className="mt-5 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 grid place-items-center shrink-0">
                            <Upload className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Course Thumbnail
                            </label>

                            <p className="text-xs text-slate-500">
                              Optional image used to visually represent your course.
                            </p>

                            {thumbnailFile && (
                              <p className="mt-1.5 text-xs font-semibold text-blue-600 truncate">
                                Selected: {thumbnailFile.name}
                              </p>
                            )}

                            {editing.id &&
                              !thumbnailFile &&
                              editing.thumbnail_url && (
                                <p className="mt-1.5 text-xs font-semibold text-emerald-600">
                                  Current thumbnail will be kept.
                                </p>
                              )}
                          </div>

                          <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50 transition">
                            <Upload className="w-4 h-4" />
                            Upload Image

                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setThumbnailFile(
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-white px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeCourseEditor}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={() =>
                        setStep(2)
                      }
                      disabled={
                        !editing?.title?.trim()
                      }
                      className="inline-flex items-center gap-2"
                    >
                      Continue to Curriculum
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ===================================================
                  STEP 2
              ==================================================== */}
              {step === 2 && (
                <form
                  onSubmit={onSave}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <div className="relative overflow-hidden px-5 sm:px-7 py-5 bg-gradient-to-br from-slate-950 via-violet-950 to-blue-950 text-white">
                    <div className="absolute -right-10 -top-16 w-52 h-52 rounded-full bg-cyan-400/15 blur-3xl" />

                    <div className="relative flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Layers3 className="w-5 h-5 text-cyan-300" />
                          <h3 className="text-xl font-black">
                            Curriculum Builder
                          </h3>
                        </div>

                        <p className="mt-1 text-xs sm:text-sm text-blue-100/70">
                          Organize lessons, videos, and mandatory quizzes.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={closeCourseEditor}
                        className="w-9 h-9 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 grid place-items-center transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative mt-5 flex items-center max-w-md">
                      <div className="flex items-center gap-2 opacity-70">
                        <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 grid place-items-center font-bold">
                          1
                        </div>
                        <span className="text-xs font-semibold">
                          Course Details
                        </span>
                      </div>

                      <div className="flex-1 h-px bg-white/20 mx-3" />

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white text-violet-700 grid place-items-center font-black">
                          2
                        </div>
                        <span className="text-xs font-bold">
                          Curriculum
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 bg-white px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {lessons.length} lesson
                        {lessons.length === 1
                          ? ''
                          : 's'} added
                      </p>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Every lesson requires 5ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“20 quiz questions before saving.
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() =>
                        setLessons([
                          ...lessons,
                          {
                            title: '',
                            video_url: '',
                            duration: '',
                            quiz: [],
                          },
                        ])
                      }
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Lesson
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-7 bg-gradient-to-br from-slate-50 via-violet-50/20 to-blue-50/30">
                    {lessons.length === 0 ? (
                      <div className="h-full min-h-[320px] grid place-items-center">
                        <div className="max-w-md w-full rounded-[28px] border-2 border-dashed border-slate-200 bg-white/80 p-10 text-center">
                          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600 grid place-items-center">
                            <Video className="w-8 h-8" />
                          </div>

                          <h3 className="mt-5 text-lg font-black text-slate-800">
                            No Lessons Yet
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Start building your curriculum by adding your first lesson.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              setLessons([
                                ...lessons,
                                {
                                  title: '',
                                  video_url:
                                    '',
                                  duration:
                                    '',
                                  quiz: [],
                                },
                              ])
                            }
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
                          >
                            <Plus className="w-4 h-4" />
                            Add First Lesson
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {lessons.map(
                          (
                            lesson,
                            index
                          ) => (
                            <div
                              key={index}
                              className="overflow-hidden rounded-[24px] border border-white bg-white/90 shadow-[0_12px_35px_rgba(15,23,42,0.06)]"
                            >
                              {/* Lesson header */}
                              <div className="bg-gradient-to-r from-white via-blue-50/50 to-violet-50/50 border-b border-slate-100 px-5 sm:px-6 py-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white grid place-items-center font-black shadow-md">
                                      {index +
                                        1}
                                    </div>

                                    <div>
                                      <p className="font-black text-slate-800">
                                        Lesson{' '}
                                        {index +
                                          1}
                                      </p>

                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {lesson.title ||
                                          'Untitled Lesson'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] font-bold text-violet-700">
                                      <FileQuestion className="w-3.5 h-3.5" />
                                      {lesson.quiz?.length ||
                                        0}
                                      /20 Questions
                                    </span>

                                    <Button
                                      variant="outline"
                                      type="button"
                                      onClick={() => {
                                        document
                                          .getElementById(
                                            `lesson-${index}`
                                          )
                                          ?.scrollIntoView(
                                            {
                                              behavior:
                                                'smooth',
                                              block:
                                                'center',
                                            }
                                          );
                                      }}
                                    >
                                      <Pencil className="w-3.5 h-3.5 mr-1" />
                                      Edit
                                    </Button>

                                    <Button
                                      variant="outline"
                                      type="button"
                                      onClick={() => {
                                        showDialog({
                                          type: 'confirm',
                                          title: 'Delete Lesson?',
                                          message: `Are you sure you want to delete "${lesson.title || 'this lesson'}"? This action cannot be undone.`,
                                          confirmText:
                                            'Delete',
                                          cancelText:
                                            'Cancel',
                                          showCancel:
                                            true,
                                          destructive:
                                            true,
                                          onConfirm:
                                            async () => {
                                              closeDialog();

                                              if (
                                                lesson.id
                                              ) {
                                                try {
                                                  await deleteLesson(
                                                    lesson.id
                                                  );
                                                } catch (
                                                  err
                                                ) {
                                                  showDialog(
                                                    {
                                                      type: 'error',
                                                      title: 'Delete Failed',
                                                      message:
                                                        err
                                                          .response
                                                          ?.data
                                                          ?.error ||
                                                        err.message ||
                                                        'Failed to delete the lesson.',
                                                    }
                                                  );

                                                  return;
                                                }
                                              }

                                              const updated =
                                                [
                                                  ...lessons,
                                                ];

                                              updated.splice(
                                                index,
                                                1
                                              );

                                              setLessons(
                                                updated
                                              );
                                            },
                                        });
                                      }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div
                                id={`lesson-${index}`}
                                className="p-5 sm:p-6"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                                      Lesson Title
                                    </label>

                                    <input
                                      value={
                                        lesson.title
                                      }
                                      onChange={(
                                        e
                                      ) => {
                                        const updated =
                                          [
                                            ...lessons,
                                          ];

                                        updated[
                                          index
                                        ].title =
                                          e.target.value;

                                        setLessons(
                                          updated
                                        );
                                      }}
                                      placeholder="Lesson Title"
                                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                                      Video URL
                                    </label>

                                    <div className="relative">
                                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                                      <input
                                        value={
                                          lesson.video_url
                                        }
                                        onChange={(
                                          e
                                        ) => {
                                          const updated =
                                            [
                                              ...lessons,
                                            ];

                                          updated[
                                            index
                                          ].video_url =
                                            e.target.value;

                                          setLessons(
                                            updated
                                          );
                                        }}
                                        placeholder="https://..."
                                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                                      Duration
                                    </label>

                                    <div className="relative">
                                      <Clock3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                                      <input
                                        type="number"
                                        value={
                                          lesson.duration
                                        }
                                        onChange={(
                                          e
                                        ) => {
                                          const updated =
                                            [
                                              ...lessons,
                                            ];

                                          updated[
                                            index
                                          ].duration =
                                            e.target.value;

                                          setLessons(
                                            updated
                                          );
                                        }}
                                        placeholder="Minutes"
                                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Quiz builder */}
                                <div className="mt-7 border-t border-slate-100 pt-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 grid place-items-center">
                                          <FileQuestion className="w-4 h-4" />
                                        </div>

                                        <h4 className="font-black text-slate-800">
                                          Mandatory Quiz
                                        </h4>

                                        <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
                                          {lesson.quiz?.length ||
                                            0}
                                          /20
                                        </span>
                                      </div>

                                      <p className="mt-1 text-xs text-slate-500">
                                        Add between 5 and 20 questions.
                                      </p>
                                    </div>

                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="inline-flex items-center justify-center gap-1.5"
                                      onClick={() => {
                                        const updated =
                                          [
                                            ...lessons,
                                          ];

                                        if (
                                          !updated[
                                            index
                                          ].quiz
                                        ) {
                                          updated[
                                            index
                                          ].quiz =
                                            [];
                                        }

                                        if (
                                          updated[
                                            index
                                          ].quiz
                                            .length >=
                                          20
                                        ) {
                                          showDialog({
                                            type: 'warning',
                                            title: 'Question Limit Reached',
                                            message:
                                              'A lesson can have a maximum of 20 quiz questions.',
                                            confirmText:
                                              'OK',
                                          });

                                          return;
                                        }

                                        updated[
                                          index
                                        ].quiz.push(
                                          {
                                            question:
                                              '',
                                            options: [
                                              '',
                                              '',
                                              '',
                                              '',
                                            ],
                                            correct_option: 0,
                                          }
                                        );

                                        setLessons(
                                          updated
                                        );
                                      }}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      Add Question
                                    </Button>
                                  </div>

                                  {lesson.quiz &&
                                    lesson.quiz.length <
                                      5 && (
                                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600">
                                        <CircleAlert className="w-4 h-4 shrink-0" />
                                        Minimum 5 questions required before this course can be saved.
                                      </div>
                                    )}

                                  <div className="mt-5 space-y-4">
                                    {(
                                      lesson.quiz ||
                                      []
                                    ).map(
                                      (
                                        q,
                                        qIndex
                                      ) => (
                                        <div
                                          key={
                                            qIndex
                                          }
                                          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                                        >
                                          <div className="flex items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-2">
                                              <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 grid place-items-center text-[11px] font-black text-slate-600">
                                                {qIndex +
                                                  1}
                                              </span>

                                              <span className="text-sm font-bold text-slate-700">
                                                Question{' '}
                                                {qIndex +
                                                  1}
                                              </span>
                                            </div>

                                            <button
                                              type="button"
                                              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition"
                                              onClick={() => {
                                                const updated =
                                                  [
                                                    ...lessons,
                                                  ];

                                                updated[
                                                  index
                                                ].quiz.splice(
                                                  qIndex,
                                                  1
                                                );

                                                setLessons(
                                                  updated
                                                );
                                              }}
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                              Remove
                                            </button>
                                          </div>

                                          <input
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                                            placeholder="Enter question text..."
                                            value={
                                              q.question
                                            }
                                            onChange={(
                                              e
                                            ) => {
                                              const updated =
                                                [
                                                  ...lessons,
                                                ];

                                              updated[
                                                index
                                              ].quiz[
                                                qIndex
                                              ].question =
                                                e.target.value;

                                              setLessons(
                                                updated
                                              );
                                            }}
                                          />

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                            {[
                                              0,
                                              1,
                                              2,
                                              3,
                                            ].map(
                                              (
                                                optIndex
                                              ) => {
                                                const letters =
                                                  [
                                                    'A',
                                                    'B',
                                                    'C',
                                                    'D',
                                                  ];

                                                const isCorrect =
                                                  q.correct_option ===
                                                  optIndex;

                                                return (
                                                  <div
                                                    key={
                                                      optIndex
                                                    }
                                                    className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                                                      isCorrect
                                                        ? 'border-emerald-300 bg-emerald-50/70'
                                                        : 'border-slate-200 bg-white'
                                                    }`}
                                                  >
                                                    <input
                                                      type="radio"
                                                      name={`correct_${index}_${qIndex}`}
                                                      checked={
                                                        isCorrect
                                                      }
                                                      onChange={() => {
                                                        const updated =
                                                          [
                                                            ...lessons,
                                                          ];

                                                        updated[
                                                          index
                                                        ].quiz[
                                                          qIndex
                                                        ].correct_option =
                                                          optIndex;

                                                        setLessons(
                                                          updated
                                                        );
                                                      }}
                                                      className="accent-emerald-600 shrink-0"
                                                    />

                                                    <span
                                                      className={`w-7 h-7 rounded-lg grid place-items-center text-[11px] font-black shrink-0 ${
                                                        isCorrect
                                                          ? 'bg-emerald-500 text-white'
                                                          : 'bg-slate-100 text-slate-500'
                                                      }`}
                                                    >
                                                      {
                                                        letters[
                                                          optIndex
                                                        ]
                                                      }
                                                    </span>

                                                    <input
                                                      className="w-full bg-transparent border-0 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                                                      placeholder={`Option ${letters[optIndex]}`}
                                                      value={
                                                        q
                                                          .options[
                                                          optIndex
                                                        ]
                                                      }
                                                      onChange={(
                                                        e
                                                      ) => {
                                                        const updated =
                                                          [
                                                            ...lessons,
                                                          ];

                                                        updated[
                                                          index
                                                        ].quiz[
                                                          qIndex
                                                        ].options[
                                                          optIndex
                                                        ] =
                                                          e.target.value;

                                                        setLessons(
                                                          updated
                                                        );
                                                      }}
                                                    />
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 bg-white px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setStep(1)
                      }
                      className="inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>

                    <Button
                      type="submit"
                      className="inline-flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editing?.id
                        ? 'Save Course'
                        : 'Create Course'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            FEEDBACK & REVIEWS MODAL
        ========================================================== */}
        {feedbackCourse && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.35)] w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
              <div className="relative overflow-hidden p-6 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
                <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-white/15 blur-3xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-black text-amber-50">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Student Reviews & Feedback
                    </div>

                    <h2 className="mt-2 text-xl font-black leading-tight">
                      {feedbackCourse.title}
                    </h2>

                    <div className="flex items-center gap-2 mt-2 text-xs text-white/75">
                      <span className="capitalize">
                        {feedbackCourse.category ||
                          'General'}
                      </span>

                      <span>ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢</span>

                      <span className="capitalize">
                        {feedbackCourse.difficulty ||
                          'Beginner'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFeedbackCourse(null)
                    }
                    className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 grid place-items-center transition shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-gradient-to-br from-white to-amber-50/20">
                {loadingFeedback ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 grid place-items-center animate-pulse">
                      <MessageSquare className="w-6 h-6" />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-600">
                      Loading student reviews...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-[22px] border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex flex-col items-center justify-center shadow-lg">
                          <span className="text-2xl leading-none font-black">
                            {feedbackData.average_rating
                              ? feedbackData.average_rating.toFixed(
                                  1
                                )
                              : 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}
                          </span>

                          <span className="text-[8px] uppercase font-bold mt-0.5">
                            out of 5
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map(
                              (star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <=
                                    Math.round(
                                      feedbackData.average_rating ||
                                        0
                                    )
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-amber-300'
                                  }`}
                                />
                              )
                            )}
                          </div>

                          <div className="text-xs font-semibold text-slate-600 mt-1">
                            {
                              feedbackData.total_reviews
                            }{' '}
                            student rating
                            {feedbackData.total_reviews ===
                            1
                              ? ''
                              : 's'}
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        {[5, 4, 3, 2, 1].map(
                          (s) => {
                            const count =
                              feedbackData
                                .distribution?.[
                                s
                              ] || 0;

                            const pct =
                              feedbackData.total_reviews >
                              0
                                ? Math.round(
                                    (count /
                                      feedbackData.total_reviews) *
                                      100
                                  )
                                : 0;

                            return (
                              <div
                                key={s}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="w-6 text-slate-500 font-bold">
                                  {s}ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦
                                </span>

                                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-amber-100">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                                    style={{
                                      width: `${pct}%`,
                                    }}
                                  />
                                </div>

                                <span className="w-8 text-right text-slate-400 font-mono text-[11px]">
                                  {count}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">
                            Student Comments & Ratings
                          </h3>

                          <p className="text-xs text-slate-400 mt-0.5">
                            {feedbackData.reviews?.length ||
                              0}{' '}
                            review
                            {feedbackData.reviews?.length ===
                            1
                              ? ''
                              : 's'}
                          </p>
                        </div>

                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 grid place-items-center">
                          <Star className="w-4 h-4 fill-amber-400" />
                        </div>
                      </div>

                      {feedbackData.reviews &&
                      feedbackData.reviews.length >
                        0 ? (
                        <div className="space-y-3">
                          {feedbackData.reviews.map(
                            (rev) => (
                              <div
                                key={rev.id}
                                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-amber-100 transition"
                              >
                                <div className="flex items-center justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-2.5">
                                    <ReviewerAvatar
                                      name={
                                        rev.user_name
                                      }
                                      avatarUrl={
                                        rev.avatar_url
                                      }
                                      size="w-8 h-8"
                                      textClass="text-[11px]"
                                    />

                                    <div>
                                      <div className="text-xs font-bold text-slate-800">
                                        {
                                          rev.user_name
                                        }
                                      </div>

                                      <div className="text-[10px] text-slate-400 mt-0.5">
                                        {rev.created_at
                                          ? new Date(
                                              rev.created_at
                                            ).toLocaleDateString(
                                              undefined,
                                              {
                                                year: 'numeric',
                                                month:
                                                  'short',
                                                day: 'numeric',
                                              }
                                            )
                                          : ''}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-0.5">
                                    {[
                                      1,
                                      2,
                                      3,
                                      4,
                                      5,
                                    ].map(
                                      (st) => (
                                        <Star
                                          key={st}
                                          className={`w-3.5 h-3.5 ${
                                            st <=
                                            rev.rating
                                              ? 'fill-amber-400 text-amber-400'
                                              : 'text-slate-200'
                                          }`}
                                        />
                                      )
                                    )}
                                  </div>
                                </div>

                                {rev.review ? (
                                  <p className="text-xs text-slate-700 leading-6 rounded-xl bg-slate-50 p-3">
                                    ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ{rev.review}ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â
                                  </p>
                                ) : (
                                  <p className="text-xs text-slate-400 italic rounded-xl bg-slate-50 p-3">
                                    Rated{' '}
                                    {
                                      rev.rating
                                    }{' '}
                                    stars with no written comments.
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
                          <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 text-amber-500 grid place-items-center">
                            <MessageSquare className="w-7 h-7" />
                          </div>

                          <p className="mt-4 text-sm font-black text-slate-700">
                            No ratings yet
                          </p>

                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-5">
                            When enrolled students
                            complete and rate this
                            course, their feedback
                            will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFeedbackCourse(null)
                  }
                  className="inline-flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}