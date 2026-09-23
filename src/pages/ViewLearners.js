
import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
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

  /* =========================
     PROFILE STATE
  ========================= */
  const [profileLearner, setProfileLearner] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState(null);

  /* =========================
     FEEDBACK STATE
  ========================= */
  const [feedbackLearner, setFeedbackLearner] = useState(null);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  /* =========================
     ASSIGN COURSE STATE
  ========================= */
  const [assignTo, setAssignTo] = useState(null);
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assignDue, setAssignDue] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignDone, setAssignDone] = useState(false);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    let mounted = true;

    const loadLearners = async () => {
      try {
        const data = await getStudentCandidates();

        if (mounted) {
          setLearners(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.error ||
              err.response?.data?.message ||
              err.message ||
              'Unable to load learners.'
          );
        }
      }
    };

    const loadCourses = async () => {
      try {
        const data = await getCourses({ status: 'active' });

        if (!mounted) return;

        const courseData = Array.isArray(data) ? data : [];

        setCourses(courseData);

        if (courseData.length > 0) {
          setAssignCourseId(courseData[0].id);
        }
      } catch (err) {
        if (mounted) {
          setCourses([]);
        }
      }
    };

    loadLearners();
    loadCourses();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================
     VIEW PROFILE
  ========================= */
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
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
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

  /* =========================
     FEEDBACK
  ========================= */
  const openFeedback = async (learner) => {
    setFeedbackLearner(learner);
    setFeedbackItems([]);
    setFeedbackError(null);
    setFeedbackBusy(true);

    try {
      const data = await getEducatorCourseFeedback();

      let items = [];

      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data?.data)) {
        items = data.data;
      } else if (Array.isArray(data?.reviews)) {
        items = data.reviews;
      }

      setFeedbackItems(items);
    } catch (err) {
      setFeedbackError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
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

  /* =========================
     ASSIGN COURSE
  ========================= */
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

  const closeAssign = () => {
    if (assignBusy) return;

    setAssignTo(null);
    setAssignError(null);
    setAssignDone(false);
  };

  const submitAssign = async (e) => {
    e.preventDefault();

    if (!assignTo) {
      setAssignError('Select a learner first.');
      return;
    }

    if (!assignCourseId) {
      setAssignError('Pick a course first.');
      return;
    }

    setAssignBusy(true);
    setAssignError(null);

    try {
      await assignCourse(assignCourseId, {
        userId: assignTo.id,
        due_date: assignDue || null,
        note: assignNote || null,
      });

      setAssignDone(true);
    } catch (err) {
      setAssignError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Unable to assign the course.'
      );
    } finally {
      setAssignBusy(false);
    }
  };

  /* =========================
     FILTER DATA
  ========================= */
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
        courses[index % Math.max(1, courses.length)]?.title ||
        '—',
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
      if (progressFilter === '0-50%') {
        return learner.progress <= 50;
      }

      if (progressFilter === '50-100%') {
        return learner.progress > 50;
      }

      return true;
    });

  /* =========================
     EXPORT
  ========================= */
  const exportLearners = () => {
    if (decorated.length === 0) return;

    const rows = [
      [
        'Name',
        'Email',
        'Course',
        'Progress %',
        'Score',
        'Engagement',
      ],
      ...decorated.map((learner) => [
        learner.name,
        learner.email,
        learner.course,
        learner.progress,
        learner.score,
        learner.engagement,
      ]),
    ];

    downloadCsv(
      `learners_${todayStamp()}.csv`,
      rows
    );
  };

  /* =========================
     PROFILE HELPERS
  ========================= */
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

  const profileName = profileData
    ? getProfileValue(
        profileData.name,
        profileData.full_name,
        profileData.user?.name,
        profileLearner?.name
      )
    : profileLearner?.name;

  const profileEmail = profileData
    ? getProfileValue(
        profileData.email,
        profileData.user?.email,
        profileLearner?.email
      )
    : profileLearner?.email;

  const profileRole = profileData
    ? getProfileValue(
        profileData.role,
        profileData.user?.role
      )
    : 'Student';

  const profilePhone = profileData
    ? getProfileValue(
        profileData.phone,
        profileData.mobile,
        profileData.phone_number,
        profileData.user?.phone
      )
    : 'Not provided';

  const profileLocation = profileData
    ? getProfileValue(
        profileData.location,
        profileData.city,
        profileData.address
      )
    : 'Not provided';

  const profileBio = profileData
    ? getProfileValue(
        profileData.bio,
        profileData.about,
        profileData.description
      )
    : 'Not provided';

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Learners
          </h2>

          <p className="text-sm text-slate-500">
            Track learner progress, send feedback, export reports.
          </p>
        </div>

        <Button
          variant="outline"
          disabled={decorated.length === 0}
          onClick={exportLearners}
        >
          Export List
        </Button>
      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* =========================
          FILTERS
      ========================= */}
      <Card>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3">

          <div>
            <label className="text-xs text-slate-500">
              Course
            </label>

            <select
              value={courseFilter}
              onChange={(e) =>
                setCourseFilter(e.target.value)
              }
              className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 min-w-[160px]"
            >
              <option>All Courses</option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.title}
                >
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500">
              Progress
            </label>

            <select
              value={progressFilter}
              onChange={(e) =>
                setProgressFilter(e.target.value)
              }
              className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1 min-w-[160px]"
            >
              <option>All</option>
              <option>0-50%</option>
              <option>50-100%</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-slate-500">
              Search learner
            </label>

            <input
              type="search"
              value={q}
              onChange={(e) =>
                setQ(e.target.value)
              }
              placeholder="Search learner…"
              className="block w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
            />
          </div>

          <Button type="button">
            Apply Filter
          </Button>
        </div>
      </Card>

      {/* =========================
          LEARNERS TABLE
      ========================= */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">
                  Name
                </th>

                <th className="text-left px-5 py-3 font-medium">
                  Course
                </th>

                <th className="text-left px-5 py-3 font-medium">
                  Progress
                </th>

                <th className="text-left px-5 py-3 font-medium">
                  Score
                </th>

                <th className="text-left px-5 py-3 font-medium">
                  Engagement
                </th>

                <th className="text-right px-5 py-3 font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {decorated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-400"
                  >
                    No learners.
                  </td>
                </tr>
              ) : (
                decorated.map((learner) => (
                  <tr
                    key={learner.id}
                    className="hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-semibold text-xs">
                          {initials(learner.name)}
                        </div>

                        <div>
                          <div className="font-semibold text-slate-800">
                            {learner.name}
                          </div>

                          <div className="text-xs text-slate-500">
                            {learner.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-slate-700">
                      {learner.course}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              learner.progress > 70
                                ? 'bg-brand-green-500'
                                : learner.progress > 40
                                ? 'bg-brand-orange-500'
                                : 'bg-red-500'
                            }`}
                            style={{
                              width: `${learner.progress}%`,
                            }}
                          />
                        </div>

                        <span className="text-xs">
                          {learner.progress}%
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3 font-medium">
                      {learner.score}
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          learner.engagement === 'High'
                            ? 'bg-brand-green-100 text-brand-green-700'
                            : learner.engagement === 'Medium'
                            ? 'bg-brand-orange-100 text-brand-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {learner.engagement}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex flex-wrap gap-1 justify-end">

                        {/* VIEW PROFILE */}
                        <button
                          type="button"
                          onClick={() =>
                            openProfile(learner)
                          }
                          className="text-xs px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50"
                        >
                          View Profile
                        </button>

                        {/* ASSIGN COURSE */}
                        <button
                          type="button"
                          onClick={() =>
                            openAssign(learner)
                          }
                          className="text-xs px-2.5 py-1 rounded bg-brand-blue-600 text-white hover:bg-brand-blue-700 shadow-sm"
                        >
                          + Assign course
                        </button>

                        {/* FEEDBACK */}
                        <button
                          type="button"
                          onClick={() =>
                            openFeedback(learner)
                          }
                          className="text-xs px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50"
                        >
                          Feedback
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}
      {profileLearner && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeProfile}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PROFILE HEADER */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Learner Profile
                </h3>

                <p className="text-sm text-slate-500">
                  {profileLearner.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeProfile}
                disabled={profileBusy}
                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">

              {/* PROFILE AVATAR */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-blue-100 text-brand-blue-700 grid place-items-center font-bold text-lg">
                  {initials(profileName)}
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-900">
                    {profileName}
                  </h4>

                  <p className="text-sm text-slate-500">
                    {profileEmail}
                  </p>
                </div>
              </div>

              {/* LOADING */}
              {profileBusy && (
                <div className="py-10 text-center">
                  <div className="text-sm text-slate-500">
                    Loading learner profile...
                  </div>
                </div>
              )}

              {/* ERROR */}
              {!profileBusy && profileError && (
                <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
                  {profileError}
                </div>
              )}

              {/* PROFILE DATA */}
              {!profileBusy && !profileError && (
                <div className="space-y-4">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="p-4 rounded-xl bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">
                        Email
                      </div>

                      <div className="text-sm font-medium text-slate-800 break-words">
                        {profileEmail}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">
                        Role
                      </div>

                      <div className="text-sm font-medium text-slate-800">
                        {profileRole}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">
                        Phone
                      </div>

                      <div className="text-sm font-medium text-slate-800">
                        {profilePhone}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">
                        Location
                      </div>

                      <div className="text-sm font-medium text-slate-800">
                        {profileLocation}
                      </div>
                    </div>

                  </div>

                  <div className="p-4 rounded-xl bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">
                      About
                    </div>

                    <div className="text-sm text-slate-700">
                      {profileBio}
                    </div>
                  </div>

                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeProfile}
                  disabled={profileBusy}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FEEDBACK MODAL
      ===================================================== */}
      {feedbackLearner && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeFeedback}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* FEEDBACK HEADER */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Feedback
                </h3>

                <p className="text-sm text-slate-500">
                  Learner: {feedbackLearner.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFeedback}
                disabled={feedbackBusy}
                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">

              {/* LOADING */}
              {feedbackBusy && (
                <div className="py-10 text-center">
                  <div className="text-sm text-slate-500">
                    Loading feedback...
                  </div>
                </div>
              )}

              {/* ERROR */}
              {!feedbackBusy && feedbackError && (
                <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
                  {feedbackError}
                </div>
              )}

              {/* NO FEEDBACK */}
              {!feedbackBusy &&
                !feedbackError &&
                feedbackItems.length === 0 && (
                  <div className="py-10 text-center">
                    <div className="text-3xl mb-3">
                      💬
                    </div>

                    <h4 className="font-semibold text-slate-800">
                      No feedback available
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      There is no course feedback available to display.
                    </p>
                  </div>
                )}

              {/* FEEDBACK LIST */}
              {!feedbackBusy &&
                !feedbackError &&
                feedbackItems.length > 0 && (
                  <div className="space-y-3">
                    {feedbackItems.map((item, index) => (
                      <div
                        key={
                          item.id ||
                          item.rating_id ||
                          index
                        }
                        className="border border-slate-200 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-slate-800">
                              {item.course?.title ||
                                item.course_title ||
                                item.courseName ||
                                'Course feedback'}
                            </div>

                            <div className="text-xs text-slate-500 mt-1">
                              {item.user?.name ||
                                item.student?.name ||
                                item.learner?.name ||
                                ''}
                            </div>
                          </div>

                          {(item.rating !== undefined ||
                            item.score !== undefined) && (
                            <div className="text-sm font-semibold text-brand-orange-600">
                              ★{' '}
                              {item.rating ??
                                item.score}
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-slate-600 mt-3">
                          {item.comment ||
                            item.review ||
                            item.feedback ||
                            item.message ||
                            'No written feedback.'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeFeedback}
                  disabled={feedbackBusy}
                >
                  Close
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ASSIGN COURSE MODAL
      ===================================================== */}
      {assignTo && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (!assignBusy) {
              closeAssign();
            }
          }}
        >
          <form
            onSubmit={submitAssign}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">
                  Assign course
                </h3>

                <p className="text-sm text-slate-500">
                  Assign a course to {assignTo.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAssign}
                disabled={assignBusy}
                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 text-xl"
              >
                ×
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="p-3 mb-4 rounded-lg bg-amber-50 text-amber-700 text-sm">
                You have no active courses. Create one first.
              </div>
            ) : (
              <div className="mb-4">
                <label className="text-xs text-slate-500">
                  Course
                </label>

                <select
                  value={assignCourseId}
                  onChange={(e) =>
                    setAssignCourseId(e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
                >
                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.title}
                      {course.difficulty
                        ? ` · ${course.difficulty}`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="text-xs text-slate-500">
                Due date (optional)
              </label>

              <input
                type="date"
                value={assignDue}
                onChange={(e) =>
                  setAssignDue(e.target.value)
                }
                className="block w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>

            <div className="mb-5">
              <label className="text-xs text-slate-500">
                Note (optional)
              </label>

              <textarea
                rows={3}
                value={assignNote}
                onChange={(e) =>
                  setAssignNote(e.target.value)
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm mt-1"
              />
            </div>

            {assignError && (
              <div className="p-3 mb-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {assignError}
              </div>
            )}

            {assignDone && (
              <div className="p-3 mb-3 rounded-lg bg-brand-green-50 text-brand-green-700 text-sm">
                ✓ Course assigned successfully to{' '}
                {assignTo.name}.
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeAssign}
                disabled={assignBusy}
              >
                {assignDone ? 'Close' : 'Cancel'}
              </Button>

              {!assignDone && (
                <Button
                  type="submit"
                  disabled={
                    assignBusy ||
                    courses.length === 0
                  }
                >
                  {assignBusy
                    ? 'Assigning…'
                    : 'Assign'}
                </Button>
              )}
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

