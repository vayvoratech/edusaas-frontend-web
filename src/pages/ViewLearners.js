import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';

import {
  getStudentCandidates,
  getCourses,
  assignCourse,
  getUserProfile,
  getEducatorCourseFeedback,
} from '../services/api';

import { downloadCsv, todayStamp } from '../utils/exports';

const initials = (name) =>
  (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function ViewLearners() {
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [progressFilter, setProgressFilter] = useState('All');
  const [q, setQ] = useState('');
  const [error, setError] = useState(null);

  // profile
  const [profileLearner, setProfileLearner] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // feedback
  const [feedbackLearner, setFeedbackLearner] = useState(null);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  // assign
  const [assignTo, setAssignTo] = useState(null);
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assignDue, setAssignDue] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignDone, setAssignDone] = useState(false);

  useEffect(() => {
    const loadLearners = async () => {
      try {
        setError(null);

        const data = await getStudentCandidates();
        setLearners(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err?.message ||
            'Unable to load learners. Please try again.'
        );
      }
    };

    loadLearners();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses({ status: 'active' });
        const courseData = Array.isArray(data) ? data : [];

        setCourses(courseData);

        if (courseData.length > 0) {
          setAssignCourseId(courseData[0].id);
        }
      } catch (err) {
        setError(
          err?.message ||
            'Unable to load courses. Please try again.'
        );
      }
    };

    loadCourses();
  }, []);

  const openProfile = async (learner) => {
    setProfileLearner(learner);
    setProfileData(null);
    setProfileError(null);
    setProfileBusy(true);

    try {
      const data = await getUserProfile(learner.id);
      setProfileData(data?.data || data);
    } catch (err) {
      setProfileError(
        err?.message ||
          'Unable to load learner profile.'
      );
    } finally {
      setProfileBusy(false);
    }
  };

  const closeProfile = () => {
    if (profileBusy) return;

    setProfileLearner(null);
    setProfileData(null);
    setProfileError(null);
  };

  const openFeedback = async (learner) => {
    setFeedbackLearner(learner);
    setFeedbackItems([]);
    setFeedbackError(null);
    setFeedbackBusy(true);

    try {
      const data = await getEducatorCourseFeedback();

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.reviews)
        ? data.reviews
        : [];

      setFeedbackItems(items);
    } catch (err) {
      setFeedbackError(
        err?.message ||
          'Unable to load feedback.'
      );
    } finally {
      setFeedbackBusy(false);
    }
  };

  const closeFeedback = () => {
    if (feedbackBusy) return;

    setFeedbackLearner(null);
    setFeedbackItems([]);
    setFeedbackError(null);
  };

  const openAssign = (learner) => {
    setAssignTo(learner);
    setAssignDue('');
    setAssignNote(
      `Hi ${
        learner.name?.split(' ')[0] || 'there'
      }, this course will help you advance.`
    );
    setAssignError(null);
    setAssignDone(false);

    if (!assignCourseId && courses.length > 0) {
      setAssignCourseId(courses[0].id);
    }
  };

  const submitAssign = async (e) => {
    e.preventDefault();

    if (!assignTo) {
      setAssignError('Please select a learner.');
      return;
    }

    if (!assignCourseId) {
      setAssignError('Please select a course.');
      return;
    }

    try {
      setAssignBusy(true);
      setAssignError(null);
      setAssignDone(false);

      await assignCourse(assignCourseId, {
        userId: assignTo.id,
        due_date: assignDue || null,
        note: assignNote || null,
      });

      setAssignDone(true);
    } catch (err) {
      setAssignError(
        err?.message ||
          'Unable to assign the course.'
      );
    } finally {
      setAssignBusy(false);
    }
  };

  const searchText = q.trim().toLowerCase();

  const decorated = learners
    .filter((user) => {
      if (!searchText) return true;

      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();

      return (
        name.includes(searchText) ||
        email.includes(searchText)
      );
    })
    .map((user, index) => ({
      ...user,
      course:
        courses[index % Math.max(1, courses.length)]
          ?.title || '—',
      progress: 40 + ((index * 17) % 55),
      score: 60 + ((index * 7) % 35),
      engagement: [
        'High',
        'Medium',
        'Low',
        'High',
        'Medium',
      ][index % 5],
    }))
    .filter((learner) => {
      if (courseFilter === 'All Courses') {
        return true;
      }

      return learner.course === courseFilter;
    })
    .filter((learner) => {
      if (progressFilter === 'All') {
        return true;
      }

      if (progressFilter === 'High') {
        return learner.progress >= 75;
      }

      if (progressFilter === 'Medium') {
        return (
          learner.progress >= 50 &&
          learner.progress < 75
        );
      }

      if (progressFilter === 'Low') {
        return learner.progress < 50;
      }

      return true;
    });

  const exportLearners = () => {
    const rows = decorated.map((learner) => ({
      Name: learner.name || '',
      Email: learner.email || '',
      Course: learner.course || '',
      'Progress %': learner.progress,
      Score: learner.score,
      Engagement: learner.engagement,
    }));

    downloadCsv(
      `learners_${todayStamp()}.csv`,
      rows
    );
  };

  const getProfileValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        return value;
      }
    }

    return 'Not provided';
  };

  const profileName = getProfileValue(
    profileData?.name,
    profileData?.full_name,
    profileLearner?.name
  );

  const profileEmail = getProfileValue(
    profileData?.email,
    profileLearner?.email
  );

  const profileRole = getProfileValue(
    profileData?.role,
    profileData?.user_type,
    profileData?.userType,
    profileLearner?.role
  );

  const profilePhone = getProfileValue(
    profileData?.phone,
    profileData?.phone_number,
    profileData?.mobile
  );

  const profileLocation = getProfileValue(
    profileData?.location,
    profileData?.city,
    profileData?.address
  );

  const profileBio = getProfileValue(
    profileData?.bio,
    profileData?.about,
    profileData?.description
  );

  const averageProgress =
    decorated.length > 0
      ? Math.round(
          decorated.reduce(
            (sum, learner) =>
              sum + Number(learner.progress || 0),
            0
          ) / decorated.length
        )
      : 0;

  const highEngagementCount = decorated.filter(
    (learner) => learner.engagement === 'High'
  ).length;

  return (
    <div className="min-h-full bg-[#f7f6f3] px-1 pb-10">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <section className="relative isolate overflow-hidden border-b border-slate-200/70 bg-gradient-to-br from-[#eef4ff] via-[#f5f1ff] to-[#fff4ec] px-5 py-10 sm:px-8 lg:px-10">

        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="pointer-events-none absolute right-[-100px] top-[-130px] h-[430px] w-[430px] rounded-full bg-violet-400/20 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[-180px] left-[38%] h-[420px] w-[420px] rounded-full bg-orange-300/20 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[-160px] right-[20%] h-[320px] w-[320px] rounded-full bg-pink-300/15 blur-3xl" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
            maskImage:
              'linear-gradient(to bottom, black, transparent 85%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black, transparent 85%)',
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

        <div className="relative mx-auto max-w-[1500px]">

          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/45 p-6 shadow-[0_25px_80px_-35px_rgba(79,70,229,0.35)] backdrop-blur-xl sm:p-8 lg:p-9">

            <div className="pointer-events-none absolute right-[-70px] top-[-90px] h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/15 to-fuchsia-400/15 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

              <div className="max-w-3xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/70 px-3.5 py-2 shadow-sm backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                  </span>

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-indigo-700 sm:text-xs">
                    EDUCATOR / PEOPLE
                  </p>
                </div>

                <h1 className="text-4xl font-black leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl xl:text-[4.4rem]">
                  Your{' '}
                  <span className="relative inline-block bg-gradient-to-r from-indigo-600 via-violet-600 to-orange-500 bg-clip-text text-transparent">
                    learners.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Understand learner progress, engagement,
                  performance, and course activity from one
                  focused workspace.
                </p>

                <div className="mt-7 flex items-center gap-2">
                  <span className="h-1.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                  <span className="h-1.5 w-5 rounded-full bg-orange-400" />
                  <span className="h-1.5 w-2 rounded-full bg-pink-400" />
                </div>

              </div>

              <Button
                onClick={exportLearners}
                className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl border border-white/30 bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_-14px_rgba(15,23,42,0.7)] transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-[0_18px_40px_-14px_rgba(79,70,229,0.55)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-lg leading-none transition-transform duration-300 group-hover:-translate-y-0.5">
                  ↓
                </span>

                Export learners

                <span className="text-white/40 transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </Button>

            </div>

            <div className="relative mt-9 grid grid-cols-1 gap-3 border-t border-slate-200/70 pt-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="group rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-2xl font-black tracking-tight text-slate-950">
                      {learners.length}
                    </span>

                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                      learners
                    </span>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg shadow-inner">
                    👥
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-2xl font-black tracking-tight text-slate-950">
                      {courses.length}
                    </span>

                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                      active courses
                    </span>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg shadow-inner">
                    📚
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-2xl font-black tracking-tight text-slate-950">
                      {averageProgress}%
                    </span>

                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                      avg. progress
                    </span>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg shadow-inner">
                    ↗
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-2xl font-black tracking-tight text-slate-950">
                      {highEngagementCount}
                    </span>

                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                      highly engaged
                    </span>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg shadow-inner">
                    ✦
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <span className="font-bold">!</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* FILTER TOOLBAR */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

            <div className="relative flex-1">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                value={q}
                onChange={(e) =>
                  setQ(e.target.value)
                }
                placeholder="Search learners by name or email..."
                className="h-12 w-full rounded-xl border-0 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-orange-200"
              />

            </div>

            <select
              value={courseFilter}
              onChange={(e) =>
                setCourseFilter(e.target.value)
              }
              className="h-12 rounded-xl border-0 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-orange-200 xl:w-52"
            >
              <option value="All Courses">
                All Courses
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.title}
                >
                  {course.title}
                </option>
              ))}
            </select>

            <select
              value={progressFilter}
              onChange={(e) =>
                setProgressFilter(e.target.value)
              }
              className="h-12 rounded-xl border-0 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-orange-200 xl:w-48"
            >
              <option value="All">
                All Progress
              </option>

              <option value="High">
                High — 75%+
              </option>

              <option value="Medium">
                Medium — 50–74%
              </option>

              <option value="Low">
                Low — below 50%
              </option>
            </select>

            <Button
              type="button"
              className="h-12 rounded-xl bg-orange-500 px-6 text-sm font-bold text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-md"
            >
              Apply Filter
            </Button>

          </div>
        </div>

        {/* RESULT HEADER */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              LEARNER DIRECTORY
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              All learners
            </h2>
          </div>

          <p className="text-sm font-medium text-slate-500">
            {decorated.length} result
            {decorated.length === 1 ? '' : 's'}
          </p>

        </div>

        {/* LEARNER CARDS */}
        {decorated.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
              ◌
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-950">
              No learners found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try changing your search or filter settings
              to find the learners you are looking for.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">

            {decorated.map((learner, index) => (
              <article
                key={learner.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl sm:p-6"
              >

                <div
                  className={`absolute left-0 top-0 h-full w-1 ${
                    index % 3 === 0
                      ? 'bg-orange-500'
                      : index % 3 === 1
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                  }`}
                />

                <div className="flex flex-col gap-6 xl:flex-row xl:items-center">

                  {/* IDENTITY */}
                  <div className="flex min-w-0 items-center gap-4 xl:w-[32%]">

                    <div className="relative shrink-0">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-md">
                        {initials(learner.name)}
                      </div>

                      <span
                        className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                          learner.engagement === 'High'
                            ? 'bg-emerald-500'
                            : learner.engagement === 'Medium'
                            ? 'bg-amber-400'
                            : 'bg-slate-300'
                        }`}
                      />

                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate text-lg font-black text-slate-950">
                        {learner.name ||
                          'Unnamed Learner'}
                      </h3>

                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {learner.email ||
                          'No email'}
                      </p>

                    </div>

                  </div>

                  {/* COURSE */}
                  <div className="xl:w-[20%]">

                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      COURSE
                    </p>

                    <p className="truncate text-sm font-bold text-slate-800">
                      {learner.course}
                    </p>

                  </div>

                  {/* PROGRESS */}
                  <div className="xl:flex-1">

                    <div className="mb-2 flex items-center justify-between">

                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        PROGRESS
                      </p>

                      <span className="text-sm font-black text-slate-900">
                        {learner.progress}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 via-rose-500 to-orange-500 transition-all duration-700"
                        style={{
                          width: `${learner.progress}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* SCORE */}
                  <div className="xl:w-[90px]">

                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      SCORE
                    </p>

                    <p className="text-xl font-black text-slate-950">
                      {learner.score}
                    </p>

                  </div>

                  {/* ENGAGEMENT */}
                  <div className="xl:w-[115px]">

                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      ENGAGEMENT
                    </p>

                    {learner.engagement === 'High' && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        High
                      </span>
                    )}

                    {learner.engagement === 'Medium' && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Medium
                      </span>
                    )}

                    {learner.engagement === 'Low' && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Low
                      </span>
                    )}

                  </div>

                  {/* ACTIONS */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2 xl:w-[275px] xl:justify-end">

                    {/* Profile uses native button to avoid shared Button styling conflict */}
                    <button
                      type="button"
                      onClick={() =>
                        openProfile(learner)
                      }
                      className="inline-flex min-w-[84px] items-center justify-center whitespace-nowrap rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-extrabold text-indigo-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    >
                      Profile
                    </button>

                    {/* Feedback uses native button to avoid shared Button styling conflict */}
                    <button
                      type="button"
                      onClick={() =>
                        openFeedback(learner)
                      }
                      className="inline-flex min-w-[84px] items-center justify-center whitespace-nowrap rounded-xl border-2 border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-extrabold text-rose-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-100"
                    >
                      Feedback
                    </button>

                    <Button
                      type="button"
                      onClick={() =>
                        openAssign(learner)
                      }
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md"
                    >
                      Assign Course
                    </Button>

                  </div>

                </div>
              </article>
            ))}

          </div>
        )}

      </main>

      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}
      {profileLearner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-[#fbfaf8] shadow-2xl">

            <div className="border-b border-slate-200 bg-white px-6 py-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                    LEARNER PROFILE
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    {profileLearner.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeProfile}
                  disabled={profileBusy}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  ×
                </button>

              </div>

            </div>

            <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">

              {profileBusy && (
                <div className="flex flex-col items-center justify-center py-14">

                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />

                  <p className="mt-4 text-sm font-medium text-slate-500">
                    Loading learner profile...
                  </p>

                </div>
              )}

              {profileError && !profileBusy && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {profileError}
                </div>
              )}

              {profileData && !profileBusy && (
                <div className="space-y-5">

                  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white">
                      {initials(profileName)}
                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate text-xl font-black text-slate-950">
                        {profileName}
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {profileEmail}
                      </p>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        ROLE
                      </p>

                      <p className="mt-2 font-bold text-slate-800">
                        {profileRole}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        PHONE
                      </p>

                      <p className="mt-2 font-bold text-slate-800">
                        {profilePhone}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        LOCATION
                      </p>

                      <p className="mt-2 font-bold text-slate-800">
                        {profileLocation}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        ABOUT
                      </p>

                      <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">
                        {profileBio}
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FEEDBACK MODAL
      ===================================================== */}
      {feedbackLearner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-[#fbfaf8] shadow-2xl">

            <div className="border-b border-slate-200 bg-white px-6 py-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-500">
                    FEEDBACK
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    {feedbackLearner.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeFeedback}
                  disabled={feedbackBusy}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  ×
                </button>

              </div>

            </div>

            <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">

              {feedbackBusy && (
                <div className="flex flex-col items-center justify-center py-14">

                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />

                  <p className="mt-4 text-sm font-medium text-slate-500">
                    Loading feedback...
                  </p>

                </div>
              )}

              {feedbackError && !feedbackBusy && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {feedbackError}
                </div>
              )}

              {!feedbackBusy &&
                !feedbackError &&
                feedbackItems.length === 0 && (
                  <div className="py-14 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
                      💬
                    </div>

                    <h3 className="mt-4 font-black text-slate-950">
                      No feedback available
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      There is no feedback to display right now.
                    </p>

                  </div>
                )}

              {!feedbackBusy &&
                !feedbackError &&
                feedbackItems.length > 0 && (
                  <div className="space-y-4">

                    {feedbackItems.map((item, index) => (
                      <div
                        key={
                          item.id ||
                          item._id ||
                          index
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-rose-200"
                      >

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                          <div>

                            <p className="font-black text-slate-950">
                              {item.course_title ||
                                item.courseTitle ||
                                item.course?.title ||
                                'Course Feedback'}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.user_name ||
                                item.userName ||
                                feedbackLearner.name}
                            </p>

                          </div>

                          {item.rating !== undefined &&
                            item.rating !== null && (
                              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                ★ {item.rating}
                              </span>
                            )}

                        </div>

                        <p className="mt-4 leading-7 text-slate-600">
                          {item.comment ||
                            item.feedback ||
                            item.review ||
                            'No comment provided.'}
                        </p>

                      </div>
                    ))}

                  </div>
                )}

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ASSIGN COURSE MODAL
      ===================================================== */}
      {assignTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-3xl bg-[#fbfaf8] shadow-2xl">

            <div className="border-b border-slate-200 bg-white px-6 py-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                    COURSE MANAGEMENT
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Assign Course
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {assignTo.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!assignBusy) {
                      setAssignTo(null);
                      setAssignError(null);
                      setAssignDone(false);
                    }
                  }}
                  disabled={assignBusy}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  ×
                </button>

              </div>

            </div>

            <form
              onSubmit={submitAssign}
              className="max-h-[calc(90vh-130px)] overflow-y-auto p-6"
            >

              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Course
                  </label>

                  <select
                    value={assignCourseId}
                    onChange={(e) =>
                      setAssignCourseId(e.target.value)
                    }
                    disabled={assignBusy}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50"
                  >
                    <option value="">
                      Select a course
                    </option>

                    {courses.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={assignDue}
                    onChange={(e) =>
                      setAssignDue(e.target.value)
                    }
                    disabled={assignBusy}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Note
                  </label>

                  <textarea
                    value={assignNote}
                    onChange={(e) =>
                      setAssignNote(e.target.value)
                    }
                    disabled={assignBusy}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50"
                    placeholder="Add a message for the learner..."
                  />
                </div>

                {assignError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {assignError}
                  </div>
                )}

                {assignDone && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    Course assigned successfully.
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                  <Button
                    type="button"
                    onClick={() => {
                      if (!assignBusy) {
                        setAssignTo(null);
                        setAssignError(null);
                        setAssignDone(false);
                      }
                    }}
                    disabled={assignBusy}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={assignBusy}
                    className="rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {assignBusy
                      ? 'Assigning...'
                      : 'Assign Course'}
                  </Button>

                </div>

              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}