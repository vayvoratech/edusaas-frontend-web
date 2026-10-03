import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCourses,
  getMyEnrollments,
  enrollCourse,
  getUserProfile,
  fetchGapReport,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Programming',
  'Data Science',
  'Web Dev',
  'Soft Skills',
  'AI & ML',
  'Management',
];

const DIFFICULTIES = [
  'All',
  'beginner',
  'intermediate',
  'advanced',
];

/* =========================================================
   SVG ICON SYSTEM
========================================================= */

const SvgIcon = ({
  children,
  size = 24,
  strokeWidth = 2,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const IconSearch = ({ size = 20 }) => (
  <SvgIcon size={size}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </SvgIcon>
);

const IconSparkles = ({ size = 24 }) => (
  <SvgIcon size={size}>
    <path d="m12 3-1.3 4.1L7 8.5l3.7 1.4L12 14l1.3-4.1L17 8.5l-3.7-1.4L12 3Z" />
    <path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7L19 14Z" />
    <path d="m5 14-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7L5 14Z" />
  </SvgIcon>
);

const IconBook = ({ size = 24 }) => (
  <SvgIcon size={size}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
    <path d="M4 5.5V21" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
  </SvgIcon>
);

const IconCode = ({ size = 28 }) => (
  <SvgIcon size={size} strokeWidth={2.2}>
    <path d="m8 9-4 3 4 3" />
    <path d="m16 9 4 3-4 3" />
    <path d="m14 5-4 14" />
  </SvgIcon>
);

const IconChart = ({ size = 28 }) => (
  <SvgIcon size={size} strokeWidth={2.2}>
    <path d="M4 19V5" />
    <path d="M4 19h17" />
    <path d="m7 15 4-5 3 3 5-7" />
    <circle cx="7" cy="15" r="1" />
    <circle cx="11" cy="10" r="1" />
    <circle cx="14" cy="13" r="1" />
    <circle cx="19" cy="6" r="1" />
  </SvgIcon>
);

const IconGlobe = ({ size = 28 }) => (
  <SvgIcon size={size} strokeWidth={2.1}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c3 3.2 4.5 6.2 4.5 9s-1.5 5.8-4.5 9c-3-3.2-4.5-6.2-4.5-9S9 6.2 12 3Z" />
  </SvgIcon>
);

const IconBrain = ({ size = 28 }) => (
  <SvgIcon size={size} strokeWidth={2.1}>
    <path d="M9 4.5a3 3 0 0 0-5 2.2 3.2 3.2 0 0 0 .5 1.7A3.4 3.4 0 0 0 5 15a3 3 0 0 0 4 4.2" />
    <path d="M15 4.5a3 3 0 0 1 5 2.2 3.2 3.2 0 0 1-.5 1.7A3.4 3.4 0 0 1 19 15a3 3 0 0 1-4 4.2" />
    <path d="M9 4.5v15" />
    <path d="M15 4.5v15" />
    <path d="M6 9h3" />
    <path d="M15 9h3" />
    <path d="M7 14h2" />
    <path d="M15 14h2" />
    <path d="M12 8v8" />
  </SvgIcon>
);

const IconMessage = ({ size = 28 }) => (
  <SvgIcon size={size} strokeWidth={2.1}>
    <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.7-.8L4 20l1.5-3.6A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
    <path d="M8 11h.01" />
    <path d="M12 11h.01" />
    <path d="M16 11h.01" />
  </SvgIcon>
);

const IconBriefcase = ({ size = 28 }) => (
  <SvgIcon size={size} strokeWidth={2.1}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
    <path d="M10 12v2h4v-2" />
  </SvgIcon>
);

const IconDocument = ({ size = 28 }) => (
  <SvgIcon size={size} strokeWidth={2.1}>
    <path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path d="M14 3v5h5" />
    <path d="M8 12h8" />
    <path d="M8 16h6" />
  </SvgIcon>
);

const IconCheck = ({ size = 18 }) => (
  <SvgIcon size={size} strokeWidth={2.5}>
    <path d="m5 12 4 4L19 6" />
  </SvgIcon>
);

const IconArrowRight = ({ size = 18 }) => (
  <SvgIcon size={size} strokeWidth={2.5}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </SvgIcon>
);

const IconExternal = ({ size = 17 }) => (
  <SvgIcon size={size} strokeWidth={2.2}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
  </SvgIcon>
);

const IconStar = ({ size = 16 }) => (
  <SvgIcon size={size} strokeWidth={2}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
  </SvgIcon>
);

const IconAlert = ({ size = 20 }) => (
  <SvgIcon size={size} strokeWidth={2.2}>
    <path d="M12 4 3 20h18L12 4Z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </SvgIcon>
);

const IconPlay = ({ size = 18 }) => (
  <SvgIcon size={size} strokeWidth={2.2}>
    <path d="m9 6 8 6-8 6V6Z" />
  </SvgIcon>
);

/* =========================================================
   COURSE ICON
========================================================= */

const CourseIcon = ({
  title = '',
  category = '',
  size = 32,
}) => {
  const text = `${title} ${category}`.toLowerCase();

  if (
    text.includes('programming') ||
    text.includes('python') ||
    text.includes('java') ||
    text.includes('code') ||
    text.includes('sql')
  ) {
    return <IconCode size={size} />;
  }

  if (
    text.includes('data') ||
    text.includes('analytics') ||
    text.includes('statistics')
  ) {
    return <IconChart size={size} />;
  }

  if (
    text.includes('web') ||
    text.includes('react') ||
    text.includes('frontend') ||
    text.includes('backend') ||
    text.includes('full stack') ||
    text.includes('javascript')
  ) {
    return <IconGlobe size={size} />;
  }

  if (
    text.includes('machine') ||
    text.includes('artificial') ||
    text.includes('ai') ||
    text.includes('ml') ||
    text.includes('deep learning')
  ) {
    return <IconBrain size={size} />;
  }

  if (
    text.includes('soft') ||
    text.includes('communication') ||
    text.includes('english') ||
    text.includes('interview')
  ) {
    return <IconMessage size={size} />;
  }

  if (
    text.includes('management') ||
    text.includes('leadership') ||
    text.includes('business')
  ) {
    return <IconBriefcase size={size} />;
  }

  return <IconDocument size={size} />;
};

/* =========================================================
   CATEGORY COLORS
========================================================= */

const getCategoryAccent = (category = '') => {
  const value = category.toLowerCase();

  if (value.includes('programming')) {
    return {
      color: '#2563eb',
      soft: '#eff6ff',
      border: '#bfdbfe',
      mid: '#60a5fa',
      deep: '#1d4ed8',
      gradient:
        'linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)',
    };
  }

  if (value.includes('data')) {
    return {
      color: '#7c3aed',
      soft: '#f5f3ff',
      border: '#ddd6fe',
      mid: '#a78bfa',
      deep: '#6d28d9',
      gradient:
        'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 45%, #ffffff 100%)',
    };
  }

  if (value.includes('web')) {
    return {
      color: '#0891b2',
      soft: '#ecfeff',
      border: '#a5f3fc',
      mid: '#22d3ee',
      deep: '#0e7490',
      gradient:
        'linear-gradient(135deg, #cffafe 0%, #ecfeff 45%, #ffffff 100%)',
    };
  }

  if (value.includes('ai') || value.includes('ml')) {
    return {
      color: '#db2777',
      soft: '#fdf2f8',
      border: '#fbcfe8',
      mid: '#f472b6',
      deep: '#be185d',
      gradient:
        'linear-gradient(135deg, #fce7f3 0%, #fdf2f8 45%, #ffffff 100%)',
    };
  }

  if (value.includes('soft')) {
    return {
      color: '#ea580c',
      soft: '#fff7ed',
      border: '#fed7aa',
      mid: '#fb923c',
      deep: '#c2410c',
      gradient:
        'linear-gradient(135deg, #ffedd5 0%, #fff7ed 45%, #ffffff 100%)',
    };
  }

  if (value.includes('management')) {
    return {
      color: '#059669',
      soft: '#ecfdf5',
      border: '#a7f3d0',
      mid: '#34d399',
      deep: '#047857',
      gradient:
        'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 45%, #ffffff 100%)',
    };
  }

  return {
    color: '#475569',
    soft: '#f8fafc',
    border: '#cbd5e1',
    mid: '#94a3b8',
    deep: '#334155',
    gradient:
      'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 45%, #ffffff 100%)',
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrollmentsMap, setEnrollmentsMap] = useState(new Map());
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [userDomain, setUserDomain] = useState(null);
  const [missingSkills, setMissingSkills] = useState([]);

  const { user } = useAuth();

  const load = useCallback(async () => {
    setError(null);

    try {
      const filters = {};

      if (activeCategory !== 'All') {
        filters.category = activeCategory;
      }

      if (activeDifficulty !== 'All') {
        filters.difficulty = activeDifficulty;
      }

      const [
        courseData,
        enrollmentData,
        profileData,
        gapData,
      ] = await Promise.all([
        getCourses({
          status: 'active',
          ...filters,
        }),
        getMyEnrollments().catch(() => []),
        getUserProfile().catch(() => null),
        fetchGapReport(user?.id).catch(() => null),
      ]);

      const sortedCourses = Array.isArray(courseData)
        ? [...courseData].sort((a, b) => {
            const dateA = new Date(
              a?.created_at || 0
            ).getTime();

            const dateB = new Date(
              b?.created_at || 0
            ).getTime();

            return dateB - dateA;
          })
        : [];

      setCourses(sortedCourses);

      const map = new Map();

      if (Array.isArray(enrollmentData)) {
        enrollmentData.forEach((item) => {
          if (
            item?.course_id !== undefined &&
            item?.course_id !== null
          ) {
            map.set(item.course_id, item);
          }
        });
      }

      setEnrollmentsMap(map);

      const skills =
        gapData?.missing_skills ||
        gapData?.missingSkills ||
        gapData?.skills_gap ||
        [];

      setMissingSkills(
        Array.isArray(skills)
          ? skills
              .map((item) =>
                typeof item === 'string'
                  ? item.toLowerCase()
                  : String(
                      item?.name || ''
                    ).toLowerCase()
              )
              .filter(Boolean)
          : []
      );

      const domain =
        profileData?.domain ||
        profileData?.career_domain ||
        profileData?.target_domain ||
        user?.domain ||
        null;

      setUserDomain(domain);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load courses right now.'
      );
    }
  }, [
    activeCategory,
    activeDifficulty,
    user,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const onEnroll = async (id) => {
    setBusyId(id);

    try {
      await enrollCourse(id);
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Unable to enroll in this course.'
      );
    } finally {
      setBusyId(null);
    }
  };

  const isRecommended = (course) => {
    if (!course) return false;

    const role = String(
      user?.role || ''
    ).toLowerCase();

    if (
      role === 'admin' ||
      role === 'employer'
    ) {
      return false;
    }

    const provider = String(
      course.provider || ''
    ).toLowerCase();

    const category = String(
      course.category || ''
    ).toLowerCase();

    const title = String(
      course.title || ''
    ).toLowerCase();

    if (missingSkills.length > 0) {
      return missingSkills.some(
        (skill) =>
          category.includes(skill) ||
          title.includes(skill) ||
          provider.includes(skill)
      );
    }

    if (userDomain) {
      const domain = String(
        userDomain
      ).toLowerCase();

      return (
        provider === domain ||
        provider.includes(domain) ||
        category.includes(domain) ||
        title.includes(domain)
      );
    }

    return false;
  };

  const normalizedSearch =
    searchQuery.trim().toLowerCase();

  /* =========================================================
     SEARCH NOW CHECKS ALL COURSE INFORMATION
  ========================================================= */

  const filteredCourses =
    courses.filter((course) => {
      if (!normalizedSearch) {
        return true;
      }

      const courseTags = Array.isArray(
        course?.tags
      )
        ? course.tags
        : [];

      const searchableText = [
        course?.title,
        course?.category,
        course?.provider,
        course?.description,
        course?.difficulty,
        course?.level,
        ...courseTags,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    });

  const recommendedCourses =
    filteredCourses.filter(
      isRecommended
    );

  const otherCourses =
    filteredCourses.filter(
      (course) =>
        !isRecommended(course)
    );

  /* =========================================================
     COURSE CARD
  ========================================================= */

  const renderCourseCard = (
    course,
    isRec = false
  ) => {
    const enrollment =
      enrollmentsMap.get(course.id);

    const enrolled =
      Boolean(enrollment) ||
      Boolean(course.is_enrolled) ||
      Boolean(course.enrolled);

    const completed =
      Boolean(
        enrollment?.completed
      ) ||
      Boolean(
        enrollment?.is_completed
      ) ||
      Boolean(course.completed);

    const rawCategory =
      String(
        course.category ||
          'Course'
      );

    const tags = rawCategory
      .split(',')
      .map((item) =>
        item.trim()
      )
      .filter(Boolean)
      .slice(0, 3);

    const accent =
      getCategoryAccent(
        rawCategory
      );

    const thumbnail =
      course.thumbnail_url &&
      (String(
        course.thumbnail_url
      ).startsWith('http')
        ? course.thumbnail_url
        : `http://localhost:5000${course.thumbnail_url}`);

    const difficulty =
      String(
        course.difficulty ||
          'beginner'
      ).toLowerCase();

    return (
      <article
        key={course.id}
        className="premium-course-card"
        style={{
          '--course-accent':
            accent.color,
          '--course-soft':
            accent.soft,
          '--course-border':
            accent.border,
          '--course-mid':
            accent.mid,
          '--course-deep':
            accent.deep,
          '--course-gradient':
            accent.gradient,
        }}
      >
        <div className="course-card-aura" />

        <div className="course-card-shine" />

        <div className="course-visual">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={
                course.title ||
                'Course'
              }
              className="course-thumbnail"
            />
          ) : (
            <div className="course-visual-placeholder">
              <div className="visual-grid" />

              <div className="visual-orb visual-orb-one" />

              <div className="visual-orb visual-orb-two" />

              <div className="visual-orb visual-orb-three" />
            </div>
          )}

          <div className="visual-overlay" />

          <div className="course-category-pill">
            <span className="category-dot" />

            {tags[0] ||
              'Course'}
          </div>

          {isRec && (
            <div className="recommended-pill">
              <span className="recommended-icon">
                <IconSparkles size={14} />
              </span>

              Recommended
            </div>
          )}

          <div className="course-icon-orbit">
            <div className="icon-ring ring-one" />

            <div className="icon-ring ring-two" />

            <div className="icon-spark spark-one" />

            <div className="icon-spark spark-two" />

            <div className="icon-spark spark-three" />

            <div className="course-icon-glow" />

            <div className="course-icon-tile">
              <div className="course-icon-core">
                <CourseIcon
                  title={
                    course.title
                  }
                  category={
                    course.category
                  }
                  size={34}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="course-card-body">
          <div className="course-provider-row">
            <span className="provider-label">
              {course.provider ||
                'Vayvora Learning'}
            </span>

            <span className="provider-live">
              <span />
              Learning
            </span>
          </div>

          <h3 className="course-title">
            {course.title}
          </h3>

          <div className="title-accent-line">
            <span />
          </div>

          <div className="course-meta">
            <span className="meta-item">
              <span className="meta-icon">
                <IconBook size={14} />
              </span>

              Course
            </span>

            <span className="meta-divider" />

            <span
              className={`difficulty difficulty-${difficulty}`}
            >
              {difficulty}
            </span>

            {course.rating !==
              undefined &&
              course.rating !==
                null &&
              course.rating !==
                '' && (
                <>
                  <span className="meta-divider" />

                  <span className="rating-pill">
                    <IconStar size={13} />

                    {course.rating}
                  </span>
                </>
              )}
          </div>

          <p className="course-description">
            {course.description ||
              'Build practical skills through structured learning, projects, and career-focused content.'}
          </p>

          {tags.length > 0 && (
            <div className="course-tags">
              {tags.map(
                (
                  tag,
                  index
                ) => (
                  <span
                    className="course-tag"
                    key={`${tag}-${index}`}
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          )}

          <div className="course-action-row">
            {course.external_url ? (
              <a
                href={
                  course.external_url
                }
                target="_blank"
                rel="noreferrer"
                className="course-primary-button"
              >
                <span className="button-icon">
                  <IconExternal size={17} />
                </span>

                <span>
                  Open Course
                </span>

                <span className="button-arrow">
                  <IconArrowRight size={16} />
                </span>
              </a>
            ) : enrolled ? (
              <Link
                to={`/app/learning/${course.id}`}
                className={`course-primary-button ${
                  completed
                    ? 'course-completed-button'
                    : ''
                }`}
              >
                <span className="button-icon">
                  {completed ? (
                    <IconCheck size={17} />
                  ) : (
                    <IconPlay size={17} />
                  )}
                </span>

                <span>
                  {completed
                    ? 'Completed'
                    : 'Continue Learning'}
                </span>

                <span className="button-arrow">
                  <IconArrowRight size={16} />
                </span>
              </Link>
            ) : (
              <button
                type="button"
                className="course-primary-button"
                onClick={() =>
                  onEnroll(
                    course.id
                  )
                }
                disabled={
                  busyId ===
                  course.id
                }
              >
                <span className="button-icon">
                  {busyId ===
                  course.id ? (
                    <span className="button-spinner" />
                  ) : (
                    <IconBook size={17} />
                  )}
                </span>

                <span>
                  {busyId ===
                  course.id
                    ? 'Enrolling...'
                    : 'Enroll Now'}
                </span>

                <span className="button-arrow">
                  <IconArrowRight size={16} />
                </span>
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="courses-page">
      <style>{`
        .courses-page {
          --text-main: #0f172a;
          --text-soft: #64748b;
          --text-muted: #94a3b8;

          min-height: 100%;
          padding: 28px;

          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(59,130,246,.08),
              transparent 28%
            ),
            radial-gradient(
              circle at 100% 15%,
              rgba(168,85,247,.07),
              transparent 25%
            ),
            #f8fafc;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          color: var(--text-main);

          font-feature-settings:
            "cv02",
            "cv03",
            "cv04",
            "cv11";
        }

        /* =====================================================
           HERO
        ===================================================== */

        .courses-hero {
          position: relative;
          overflow: hidden;

          min-height: 250px;
          border-radius: 32px;
          padding: 42px;

          display: flex;
          align-items: center;

          background:
            linear-gradient(
              120deg,
              rgba(15,23,42,.97),
              rgba(30,41,59,.94)
            );

          box-shadow:
            0 25px 70px
              rgba(15,23,42,.15),
            inset 0 1px 0
              rgba(255,255,255,.1);

          margin-bottom: 30px;
        }

        .courses-hero::before {
          content: "";

          position: absolute;
          inset: 0;

          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(59,130,246,.38),
              transparent 30%
            ),
            radial-gradient(
              circle at 55% 100%,
              rgba(168,85,247,.28),
              transparent 34%
            );

          pointer-events: none;
        }

        .courses-hero::after {
          content: "";

          position: absolute;

          width: 300px;
          height: 300px;

          right: -100px;
          top: -120px;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.12);

          box-shadow:
            0 0 0 30px
              rgba(255,255,255,.025),
            0 0 0 60px
              rgba(255,255,255,.02);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 720px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 8px 13px;

          border-radius: 999px;

          color: #dbeafe;

          background:
            rgba(59,130,246,.13);

          border:
            1px solid
            rgba(147,197,253,.22);

          font-size: 10px;
          font-weight: 900;

          letter-spacing: .14em;
          text-transform: uppercase;

          margin-bottom: 15px;
        }

        .hero-eyebrow span {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #60a5fa;

          box-shadow:
            0 0 14px
            #60a5fa;
        }

        .hero-title {
          margin: 0;

          color: #fff;

          font-size:
            clamp(32px, 4vw, 50px);

          line-height: 1.02;

          font-weight: 950;

          letter-spacing: -.055em;
        }

        .hero-title span {
          background:
            linear-gradient(
              90deg,
              #93c5fd,
              #c4b5fd,
              #f0abfc
            );

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;
        }

        .hero-description {
          margin: 16px 0 0;

          color: #cbd5e1;

          max-width: 620px;

          font-size: 14px;
          line-height: 1.8;
          font-weight: 500;
        }

        /* =====================================================
           SEARCH + FILTERS
        ===================================================== */

        .course-controls {
          display: flex;
          flex-direction: column;

          gap: 16px;

          margin-bottom: 34px;
        }

        .course-search {
          position: relative;
          width: 100%;
        }

        .course-search svg {
          position: absolute;

          left: 20px;
          top: 50%;

          width: 21px;
          height: 21px;

          transform:
            translateY(-50%);

          color: #64748b;

          pointer-events: none;

          z-index: 2;

          transition:
            color .25s ease,
            transform .25s ease;
        }

        .course-search:focus-within svg {
          color: #2563eb;

          transform:
            translateY(-50%)
            scale(1.08);
        }

        .course-search input {
          width: 100%;

          height: 60px;

          padding:
            0 22px 0 56px;

          border:
            1px solid #dbe3ee;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #f8fafc
            );

          color: #0f172a;

          outline: none;

          font-family: inherit;

          font-size: 15px;

          font-weight: 650;

          letter-spacing: -.01em;

          box-shadow:
            0 8px 25px
              rgba(15,23,42,.05),
            inset 0 1px 0
              rgba(255,255,255,.9);

          transition:
            border-color .25s ease,
            box-shadow .25s ease,
            transform .25s ease;
        }

        .course-search input::placeholder {
          color: #94a3b8;

          font-size: 14px;

          font-weight: 550;
        }

        .course-search input:hover {
          border-color: #bfdbfe;

          box-shadow:
            0 10px 28px
              rgba(37,99,235,.07);
        }

        .course-search input:focus {
          border-color: #60a5fa;

          transform:
            translateY(-1px);

          box-shadow:
            0 0 0 4px
              rgba(59,130,246,.10),
            0 15px 35px
              rgba(15,23,42,.08);
        }

        .course-filter-panel {
          width: 100%;

          padding: 16px;

          border:
            1px solid #e2e8f0;

          border-radius: 20px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.98),
              rgba(248,250,252,.96)
            );

          box-shadow:
            0 10px 30px
              rgba(15,23,42,.045);
        }

        .filter-row {
          display: flex;
          align-items: center;

          gap: 18px;
        }

        .filter-row + .filter-row {
          margin-top: 13px;

          padding-top: 13px;

          border-top:
            1px solid #f1f5f9;
        }

        .filter-label {
          flex:
            0 0 76px;

          color: #94a3b8;

          font-size: 10px;

          font-weight: 950;

          letter-spacing: .15em;

          text-transform: uppercase;
        }

        .filter-buttons {
          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 8px;
        }

        .modern-filter {
          position: relative;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          min-height: 42px;

          padding:
            0 16px;

          border:
            1px solid #e2e8f0;

          border-radius: 12px;

          background: #fff;

          color: #475569;

          font-family: inherit;

          font-size: 13px;

          line-height: 1;

          font-weight: 800;

          letter-spacing: -.01em;

          cursor: pointer;

          white-space: nowrap;

          transition:
            transform .22s ease,
            background .22s ease,
            border-color .22s ease,
            color .22s ease,
            box-shadow .22s ease;
        }

        .modern-filter svg {
          flex: 0 0 auto;

          width: 16px;
          height: 16px;

          transition:
            transform .22s ease;
        }

        .modern-filter:hover {
          transform:
            translateY(-2px);

          color: #0f172a;

          border-color: #cbd5e1;

          background: #f8fafc;

          box-shadow:
            0 7px 18px
              rgba(15,23,42,.08);
        }

        .modern-filter:hover svg {
          transform:
            scale(1.12)
            rotate(-3deg);
        }

        .modern-filter.active {
          color: #fff;

          border-color: #2563eb;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          box-shadow:
            0 9px 22px
              rgba(37,99,235,.25),
            inset 0 1px 0
              rgba(255,255,255,.22);
        }

        .modern-filter.active svg {
          filter:
            drop-shadow(
              0 0 5px
              rgba(255,255,255,.65)
            );
        }

        .modern-filter.active::after {
          content: "";

          position: absolute;

          inset: -2px;

          border-radius: 14px;

          border:
            1px solid
            rgba(96,165,250,.18);

          pointer-events: none;
        }

        .level-filter.active {
          background:
            linear-gradient(
              135deg,
              #0f172a,
              #334155
            );

          border-color: #0f172a;

          box-shadow:
            0 9px 22px
              rgba(15,23,42,.2);
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .course-error {
          display: flex;

          align-items: center;

          gap: 12px;

          padding: 14px 17px;

          border-radius: 16px;

          color: #991b1b;

          background: #fef2f2;

          border:
            1px solid #fecaca;

          margin-bottom: 24px;

          font-size: 13px;

          font-weight: 700;
        }

        .course-error-icon {
          display: grid;

          place-items: center;

          width: 32px;
          height: 32px;

          flex:
            0 0 32px;

          border-radius: 10px;

          color: #dc2626;

          background: #fff;
        }

        /* =====================================================
           SECTION HEADER
        ===================================================== */

        .courses-section {
          margin-top: 30px;
        }

        .courses-section-header {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 18px;
        }

        .section-heading-wrap {
          min-width: 0;
        }

        .catalog-heading-row {
          display: flex;

          align-items: center;

          gap: 14px;
        }

        .catalog-heading-icon {
          position: relative;

          width: 48px;
          height: 48px;

          flex:
            0 0 48px;

          display: grid;

          place-items: center;

          border-radius: 15px;

          color: #fff;

          background:
            radial-gradient(
              circle at 30% 20%,
              #93c5fd,
              #2563eb 48%,
              #1d4ed8 100%
            );

          box-shadow:
            0 10px 22px
              rgba(37,99,235,.22),
            0 0 28px
              rgba(59,130,246,.15);

          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .catalog-heading-icon::before {
          content: "";

          position: absolute;

          inset: -4px;

          border-radius: 18px;

          border:
            1px solid
            rgba(59,130,246,.15);

          pointer-events: none;
        }

        .catalog-heading-row:hover
          .catalog-heading-icon {
          transform:
            translateY(-3px)
            rotate(-4deg)
            scale(1.04);

          box-shadow:
            0 14px 30px
              rgba(37,99,235,.28),
            0 0 35px
              rgba(59,130,246,.22);
        }

        .section-kicker {
          margin: 0 0 6px;

          color: #64748b;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: .18em;

          text-transform: uppercase;
        }

        .section-heading {
          margin: 0;

          font-size: 28px;

          line-height: 1.1;

          font-weight: 950;

          letter-spacing: -.045em;

          color: #0f172a;
        }

        .section-subtitle {
          margin: 7px 0 0;

          color: #64748b;

          font-size: 13px;

          line-height: 1.6;

          font-weight: 550;
        }

        .section-count {
          flex: 0 0 auto;

          padding:
            9px 13px;

          border-radius: 999px;

          background: #fff;

          border:
            1px solid #e2e8f0;

          color: #475569;

          font-size: 11px;

          font-weight: 900;

          box-shadow:
            0 5px 16px
              rgba(15,23,42,.04);
        }

        /* =====================================================
           COURSE GRID
        ===================================================== */

        .course-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 24px;
        }

        /* =====================================================
           PREMIUM COURSE CARD
        ===================================================== */

        .premium-course-card {
          --card-radius: 30px;

          position: relative;

          min-width: 0;

          overflow: visible;

          border-radius:
            var(--card-radius);

          background:
            rgba(255,255,255,.96);

          border:
            1px solid
            rgba(226,232,240,.95);

          box-shadow:
            0 10px 28px
              rgba(15,23,42,.055),
            0 2px 5px
              rgba(15,23,42,.035);

          isolation: isolate;

          transition:
            transform .42s
              cubic-bezier(.2,.8,.2,1),
            box-shadow .42s ease,
            border-color .3s ease;
        }

        .premium-course-card:hover {
          transform:
            translateY(-12px)
            scale(1.012);

          border-color:
            var(--course-border);

          box-shadow:
            0 28px 65px
              rgba(15,23,42,.13),
            0 8px 25px
              var(--course-soft);
        }

        .course-card-aura {
          position: absolute;

          z-index: -2;

          inset: 12px;

          border-radius: 28px;

          background:
            radial-gradient(
              circle at 50% 0%,
              var(--course-soft),
              transparent 65%
            );

          filter: blur(20px);

          opacity: .6;

          transition: .4s ease;
        }

        .premium-course-card:hover
          .course-card-aura {
          opacity: 1;

          transform:
            scale(1.05);
        }

        .course-card-shine {
          position: absolute;

          z-index: 10;

          top: 0;
          left: -120%;

          width: 65%;
          height: 100%;

          pointer-events: none;

          background:
            linear-gradient(
              100deg,
              transparent,
              rgba(255,255,255,.42),
              transparent
            );

          transform:
            skewX(-20deg);

          transition:
            left .8s ease;
        }

        .premium-course-card:hover
          .course-card-shine {
          left: 140%;
        }

        /* =====================================================
           VISUAL
        ===================================================== */

        .course-visual {
          position: relative;

          height: 194px;

          overflow: hidden;

          border-radius:
            30px 30px 0 0;

          background:
            var(--course-gradient);
        }

        .course-thumbnail {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          transition:
            transform .65s
              cubic-bezier(.2,.8,.2,1),
            filter .4s ease;
        }

        .premium-course-card:hover
          .course-thumbnail {
          transform:
            scale(1.09);

          filter:
            saturate(1.08)
            contrast(1.03);
        }

        .course-visual-placeholder {
          position: absolute;

          inset: 0;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(255,255,255,.95),
              transparent 20%
            ),
            radial-gradient(
              circle at 80% 75%,
              var(--course-border),
              transparent 35%
            ),
            var(--course-gradient);
        }

        .visual-grid {
          position: absolute;

          inset: 0;

          opacity: .35;

          background-image:
            linear-gradient(
              rgba(255,255,255,.8) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.8) 1px,
              transparent 1px
            );

          background-size:
            28px 28px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent
            );
        }

        .visual-orb {
          position: absolute;

          border-radius: 50%;

          filter: blur(1px);

          transition:
            .6s
            cubic-bezier(.2,.8,.2,1);
        }

        .visual-orb-one {
          width: 120px;
          height: 120px;

          right: -25px;
          top: -40px;

          background:
            radial-gradient(
              circle at 35% 35%,
              rgba(255,255,255,.9),
              var(--course-mid),
              var(--course-deep)
            );

          opacity: .55;
        }

        .visual-orb-two {
          width: 85px;
          height: 85px;

          left: -25px;
          bottom: -30px;

          background:
            radial-gradient(
              circle at 35% 35%,
              rgba(255,255,255,.8),
              var(--course-mid),
              var(--course-deep)
            );

          opacity: .45;
        }

        .visual-orb-three {
          width: 28px;
          height: 28px;

          right: 25%;
          bottom: 22px;

          background:
            rgba(255,255,255,.7);

          box-shadow:
            0 0 30px
              var(--course-mid),
            0 0 60px
              var(--course-mid);
        }

        .premium-course-card:hover
          .visual-orb-one {
          transform:
            translate(-8px, 8px)
            scale(1.15);
        }

        .premium-course-card:hover
          .visual-orb-two {
          transform:
            translate(12px, -8px)
            scale(1.15);
        }

        .visual-overlay {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              180deg,
              rgba(15,23,42,.04),
              rgba(15,23,42,.06) 40%,
              rgba(15,23,42,.2)
            );

          pointer-events: none;
        }

        /* =====================================================
           BADGES
        ===================================================== */

        .course-category-pill,
        .recommended-pill {
          position: absolute;

          top: 16px;

          z-index: 5;

          display: inline-flex;

          align-items: center;

          gap: 7px;

          height: 30px;

          padding:
            0 11px;

          border-radius: 999px;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: .05em;

          text-transform: uppercase;

          backdrop-filter:
            blur(14px);

          -webkit-backdrop-filter:
            blur(14px);

          transition:
            .25s ease;
        }

        .course-category-pill {
          left: 16px;

          color: #fff;

          background:
            rgba(15,23,42,.64);

          border:
            1px solid
            rgba(255,255,255,.2);

          box-shadow:
            0 7px 20px
              rgba(15,23,42,.12);
        }

        .category-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background:
            var(--course-mid);

          box-shadow:
            0 0 0 3px
              rgba(255,255,255,.12),
            0 0 12px
              var(--course-mid);
        }

        .recommended-pill {
          right: 16px;

          color: #fff;

          background:
            linear-gradient(
              135deg,
              rgba(124,58,237,.92),
              rgba(219,39,119,.92)
            );

          border:
            1px solid
            rgba(255,255,255,.28);

          box-shadow:
            0 8px 24px
              rgba(124,58,237,.3);
        }

        .recommended-icon {
          display: grid;
          place-items: center;
        }

        .premium-course-card:hover
          .course-category-pill,
        .premium-course-card:hover
          .recommended-pill {
          transform:
            translateY(-2px);
        }

        /* =====================================================
           RADIAL ICON
        ===================================================== */

        .course-icon-orbit {
          position: absolute;

          z-index: 7;

          left: 28px;
          bottom: -36px;

          width: 82px;
          height: 82px;

          display: grid;
          place-items: center;
        }

        .course-icon-glow {
          position: absolute;

          inset: 7px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              var(--course-mid),
              transparent 70%
            );

          opacity: .48;

          filter: blur(10px);

          transition:
            .45s ease;
        }

        .icon-ring {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;
        }

        .ring-one {
          inset: 1px;

          padding: 2px;

          background:
            conic-gradient(
              from 0deg,
              transparent 0deg,
              var(--course-accent) 75deg,
              rgba(255,255,255,.95) 145deg,
              var(--course-mid) 220deg,
              transparent 310deg
            );

          -webkit-mask:
            linear-gradient(#000 0 0)
              content-box,
            linear-gradient(#000 0 0);

          -webkit-mask-composite:
            xor;

          mask-composite:
            exclude;

          animation:
            courseRingRotate
            5s linear infinite;
        }

        .ring-two {
          inset: 7px;

          border:
            1px dashed
            var(--course-border);

          opacity: .9;

          animation:
            courseRingRotateReverse
            7s linear infinite;
        }

        .course-icon-tile {
          position: relative;

          width: 68px;
          height: 68px;

          padding: 4px;

          border-radius: 22px;

          background:
            radial-gradient(
              circle at 30% 20%,
              rgba(255,255,255,.98),
              rgba(255,255,255,.7) 35%,
              var(--course-soft) 70%,
              var(--course-border)
            );

          border:
            1px solid
            rgba(255,255,255,.95);

          box-shadow:
            0 14px 30px
              rgba(15,23,42,.16),
            0 0 0 5px
              rgba(255,255,255,.55),
            0 0 35px
              var(--course-border);

          transition:
            transform .5s
              cubic-bezier(.2,.8,.2,1),
            box-shadow .4s ease;
        }

        .course-icon-core {
          width: 100%;
          height: 100%;

          display: grid;

          place-items: center;

          border-radius: 18px;

          color: #fff;

          background:
            radial-gradient(
              circle at 30% 20%,
              rgba(255,255,255,.75),
              var(--course-accent) 45%,
              var(--course-deep) 100%
            );

          box-shadow:
            inset 0 1px 0
              rgba(255,255,255,.65),
            inset 0 -7px 18px
              rgba(15,23,42,.14);

          filter:
            drop-shadow(
              0 7px 12px
              var(--course-border)
            );

          transition:
            .4s ease;
        }

        .premium-course-card:hover
          .course-icon-tile {
          transform:
            translateY(-9px)
            rotate(-5deg)
            scale(1.08);

          box-shadow:
            0 20px 40px
              rgba(15,23,42,.18),
            0 0 0 6px
              rgba(255,255,255,.68),
            0 0 48px
              var(--course-mid);
        }

        .premium-course-card:hover
          .course-icon-core {
          transform:
            rotate(8deg)
            scale(1.05);

          filter:
            drop-shadow(
              0 8px 15px
              var(--course-mid)
            );
        }

        .icon-spark {
          position: absolute;

          z-index: 10;

          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #fff;

          box-shadow:
            0 0 10px
              var(--course-mid),
            0 0 18px
              var(--course-accent);

          transition:
            .4s ease;
        }

        .spark-one {
          top: 4px;
          right: 8px;
        }

        .spark-two {
          right: -2px;
          bottom: 24px;

          width: 4px;
          height: 4px;
        }

        .spark-three {
          left: 4px;
          bottom: 9px;

          width: 5px;
          height: 5px;
        }

        .premium-course-card:hover
          .spark-one {
          transform:
            translate(4px, -4px)
            scale(1.3);
        }

        .premium-course-card:hover
          .spark-two {
          transform:
            translate(4px, 3px)
            scale(1.5);
        }

        .premium-course-card:hover
          .spark-three {
          transform:
            translate(-3px, 4px)
            scale(1.4);
        }

        @keyframes courseRingRotate {
          to {
            transform:
              rotate(360deg);
          }
        }

        @keyframes courseRingRotateReverse {
          to {
            transform:
              rotate(-360deg);
          }
        }

        /* =====================================================
           BODY
        ===================================================== */

        .course-card-body {
          position: relative;

          padding:
            54px 23px 23px;

          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,.98),
              rgba(255,255,255,1)
            );

          border-radius:
            0 0 30px 30px;
        }

        .course-provider-row {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;

          margin-bottom: 9px;
        }

        .provider-label {
          min-width: 0;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #64748b;

          font-size: 9px;

          line-height: 1;

          font-weight: 900;

          letter-spacing: .13em;

          text-transform: uppercase;
        }

        .provider-live {
          flex: 0 0 auto;

          display: inline-flex;

          align-items: center;

          gap: 5px;

          color: #94a3b8;

          font-size: 8px;

          font-weight: 850;

          text-transform: uppercase;

          letter-spacing: .08em;
        }

        .provider-live span {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 9px
              rgba(34,197,94,.8);
        }

        .course-title {
          margin: 0;

          color: #0f172a;

          font-size: 21px;

          line-height: 1.18;

          font-weight: 950;

          letter-spacing: -.045em;

          display: -webkit-box;

          -webkit-line-clamp: 2;

          -webkit-box-orient: vertical;

          overflow: hidden;

          transition:
            color .3s ease,
            transform .3s ease;
        }

        .premium-course-card:hover
          .course-title {
          color:
            var(--course-deep);

          transform:
            translateX(2px);
        }

        .title-accent-line {
          width: 100%;

          height: 3px;

          margin:
            12px 0 13px;

          border-radius: 999px;

          overflow: hidden;

          background:
            #f1f5f9;
        }

        .title-accent-line span {
          display: block;

          width: 42px;

          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              var(--course-accent),
              var(--course-mid),
              transparent
            );

          transition:
            width .4s ease;
        }

        .premium-course-card:hover
          .title-accent-line span {
          width: 90px;
        }

        .course-meta {
          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 8px;

          margin-bottom: 13px;
        }

        .meta-item {
          display: inline-flex;

          align-items: center;

          gap: 5px;

          color: #64748b;

          font-size: 10px;

          font-weight: 750;
        }

        .meta-icon {
          display: grid;

          place-items: center;

          color:
            var(--course-accent);
        }

        .meta-divider {
          width: 3px;
          height: 3px;

          border-radius: 50%;

          background:
            #cbd5e1;
        }

        .difficulty {
          padding:
            5px 8px;

          border-radius: 999px;

          font-size: 8px;

          line-height: 1;

          font-weight: 900;

          letter-spacing: .05em;

          text-transform: uppercase;
        }

        .difficulty-beginner {
          color: #047857;
          background: #ecfdf5;
        }

        .difficulty-intermediate {
          color: #b45309;
          background: #fffbeb;
        }

        .difficulty-advanced {
          color: #b91c1c;
          background: #fef2f2;
        }

        .rating-pill {
          display: inline-flex;

          align-items: center;

          gap: 4px;

          color: #a16207;

          font-size: 10px;

          font-weight: 850;
        }

        .rating-pill svg {
          fill: #facc15;

          color: #eab308;
        }

        .course-description {
          margin: 0;

          min-height: 67px;

          color: #64748b;

          font-size: 13px;

          line-height: 1.75;

          font-weight: 520;

          display: -webkit-box;

          -webkit-line-clamp: 3;

          -webkit-box-orient: vertical;

          overflow: hidden;
        }

        .course-tags {
          display: flex;

          flex-wrap: wrap;

          gap: 6px;

          min-height: 27px;

          margin-top: 14px;
        }

        .course-tag {
          display: inline-flex;

          align-items: center;

          min-height: 25px;

          padding:
            0 9px;

          border-radius: 8px;

          color:
            var(--course-deep);

          background:
            var(--course-soft);

          border:
            1px solid
            var(--course-border);

          font-size: 9px;

          line-height: 1;

          font-weight: 850;

          transition:
            .25s ease;
        }

        .course-tag:hover {
          transform:
            translateY(-2px);

          background: #fff;

          box-shadow:
            0 5px 14px
              var(--course-border);
        }

        /* =====================================================
           COURSE BUTTONS
        ===================================================== */

        .course-action-row {
          margin-top: 18px;
        }

        .course-primary-button {
          position: relative;

          width: 100%;

          min-height: 47px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          overflow: hidden;

          border: 0;

          border-radius: 15px;

          padding:
            0 14px;

          color: #fff;

          background:
            linear-gradient(
              135deg,
              var(--course-accent),
              var(--course-deep)
            );

          box-shadow:
            0 9px 20px
              var(--course-border),
            inset 0 1px 0
              rgba(255,255,255,.3);

          text-decoration: none;

          cursor: pointer;

          font-size: 12px;

          font-weight: 900;

          letter-spacing: -.01em;

          transition:
            transform .3s ease,
            box-shadow .3s ease,
            filter .3s ease;
        }

        .course-primary-button::before {
          content: "";

          position: absolute;

          top: 0;
          left: -100%;

          width: 65%;
          height: 100%;

          transform:
            skewX(-20deg);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.25),
              transparent
            );

          transition:
            left .6s ease;
        }

        .course-primary-button:hover::before {
          left: 140%;
        }

        .course-primary-button:hover {
          transform:
            translateY(-3px);

          filter:
            saturate(1.08);

          box-shadow:
            0 14px 30px
              var(--course-border),
            0 0 25px
              var(--course-soft);
        }

        .course-primary-button:active {
          transform:
            translateY(-1px);
        }

        .course-primary-button:disabled {
          opacity: .7;

          cursor: wait;

          transform: none;
        }

        .button-icon {
          position: relative;

          z-index: 2;

          display: grid;

          place-items: center;

          width: 27px;
          height: 27px;

          border-radius: 9px;

          background:
            rgba(255,255,255,.16);

          border:
            1px solid
            rgba(255,255,255,.18);
        }

        .course-primary-button >
          span:not(.button-icon):not(.button-arrow) {
          position: relative;

          z-index: 2;
        }

        .button-arrow {
          position: relative;

          z-index: 2;

          display: grid;

          place-items: center;

          margin-left: auto;

          width: 26px;
          height: 26px;

          border-radius: 8px;

          background:
            rgba(255,255,255,.12);

          transition:
            transform .25s ease;
        }

        .course-primary-button:hover
          .button-arrow {
          transform:
            translateX(3px);
        }

        .course-completed-button {
          background:
            linear-gradient(
              135deg,
              #059669,
              #047857
            );
        }

        .button-spinner {
          width: 13px;
          height: 13px;

          border-radius: 50%;

          border:
            2px solid
            rgba(255,255,255,.35);

          border-top-color:
            #fff;

          animation:
            buttonSpin
            .7s linear infinite;
        }

        @keyframes buttonSpin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .courses-empty {
          display: grid;

          place-items: center;

          min-height: 280px;

          padding: 35px;

          text-align: center;

          border:
            1px dashed #cbd5e1;

          border-radius: 26px;

          background:
            radial-gradient(
              circle at 50% 0%,
              #f1f5f9,
              #fff 65%
            );
        }

        .empty-icon {
          display: grid;

          place-items: center;

          width: 65px;
          height: 65px;

          border-radius: 20px;

          color: #64748b;

          background: #f8fafc;

          border:
            1px solid #e2e8f0;

          box-shadow:
            0 15px 30px
              rgba(15,23,42,.06);

          margin:
            0 auto 15px;
        }

        .empty-title {
          margin: 0;

          color: #0f172a;

          font-size: 18px;

          font-weight: 900;

          letter-spacing: -.025em;
        }

        .empty-text {
          max-width: 420px;

          margin: 7px auto 0;

          color: #64748b;

          font-size: 12px;

          line-height: 1.7;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1180px) {
          .course-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (max-width: 760px) {
          .courses-page {
            padding: 16px;
          }

          .courses-hero {
            min-height: 220px;

            padding:
              30px 24px;

            border-radius: 25px;
          }

          .hero-title {
            font-size: 34px;
          }

          .hero-description {
            font-size: 13px;
          }

          .filter-row {
            display: block;
          }

          .filter-label {
            display: block;

            margin-bottom: 9px;
          }

          .filter-buttons {
            flex-wrap: nowrap;

            overflow-x: auto;

            padding-bottom: 4px;

            scrollbar-width: thin;
          }

          .modern-filter {
            flex:
              0 0 auto;

            min-height: 43px;

            font-size: 13px;
          }

          .course-grid {
            grid-template-columns: 1fr;

            gap: 20px;
          }

          .courses-section-header {
            align-items:
              flex-start;
          }

          .section-heading {
            font-size: 24px;
          }

          .section-count {
            display: none;
          }

          .catalog-heading-row {
            align-items:
              flex-start;
          }
        }

        @media (max-width: 480px) {
          .courses-page {
            padding: 12px;
          }

          .courses-hero {
            padding:
              26px 20px;

            border-radius: 22px;
          }

          .hero-title {
            font-size: 30px;
          }

          .course-search input {
            height: 56px;

            font-size: 14px;
          }

          .course-visual {
            height: 180px;
          }

          .course-card-body {
            padding-left: 18px;

            padding-right: 18px;
          }

          .course-title {
            font-size: 20px;
          }

          .course-icon-orbit {
            left: 21px;
          }

          .catalog-heading-icon {
            width: 44px;
            height: 44px;

            flex-basis: 44px;
          }

          .section-heading {
            font-size: 22px;
          }

          .section-subtitle {
            font-size: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .premium-course-card,
          .course-thumbnail,
          .course-icon-tile,
          .course-icon-core,
          .course-card-shine,
          .icon-ring,
          .course-primary-button,
          .visual-orb,
          .course-tag {
            transition:
              none !important;

            animation:
              none !important;
          }
        }
      `}</style>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="courses-hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span />
            Learning Hub
          </div>

          <h1 className="hero-title">
            Learn. Build.
            <br />
            <span>
              Grow Your Career.
            </span>
          </h1>

          <p className="hero-description">
            Explore practical courses
            designed to help you develop
            industry-ready skills,
            strengthen your knowledge,
            and move closer to your
            career goals.
          </p>
        </div>
      </section>

      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}

      <div className="course-controls">
        <div className="course-search">
          <IconSearch size={21} />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search by course name, skill, category, provider..."
            aria-label="Search courses"
          />
        </div>

        <div className="course-filter-panel">
          <div className="filter-row">
            <span className="filter-label">
              Category
            </span>

            <div className="filter-buttons">
              {CATEGORIES.map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    className={`modern-filter ${
                      activeCategory ===
                      category
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                  >
                    {category ===
                      'All' && (
                      <IconSparkles
                        size={16}
                      />
                    )}

                    {category ===
                      'Programming' && (
                      <IconCode
                        size={16}
                      />
                    )}

                    {category ===
                      'Data Science' && (
                      <IconChart
                        size={16}
                      />
                    )}

                    {category ===
                      'Web Dev' && (
                      <IconGlobe
                        size={16}
                      />
                    )}

                    {category ===
                      'Soft Skills' && (
                      <IconMessage
                        size={16}
                      />
                    )}

                    {category ===
                      'AI & ML' && (
                      <IconBrain
                        size={16}
                      />
                    )}

                    {category ===
                      'Management' && (
                      <IconBriefcase
                        size={16}
                      />
                    )}

                    <span>
                      {category}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">
              Level
            </span>

            <div className="filter-buttons">
              {DIFFICULTIES.map(
                (difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    className={`modern-filter level-filter ${
                      activeDifficulty ===
                      difficulty
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setActiveDifficulty(
                        difficulty
                      )
                    }
                  >
                    {difficulty ===
                    'All' ? (
                      <IconSparkles
                        size={16}
                      />
                    ) : (
                      <IconBook
                        size={16}
                      />
                    )}

                    <span>
                      {difficulty ===
                      'All'
                        ? 'All Levels'
                        : difficulty
                            .charAt(
                              0
                            )
                            .toUpperCase() +
                          difficulty.slice(
                            1
                          )}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="course-error">
          <div className="course-error-icon">
            <IconAlert size={18} />
          </div>

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          RECOMMENDED
      ===================================================== */}

      {recommendedCourses.length >
        0 && (
        <section className="courses-section">
          <div className="courses-section-header">
            <div className="section-heading-wrap">
              <p className="section-kicker">
                Personalized for you
              </p>

              <h2 className="section-heading">
                Recommended for You
              </h2>

              <p className="section-subtitle">
                Courses selected around
                your skills, interests,
                and learning goals.
              </p>
            </div>

            <span className="section-count">
              {
                recommendedCourses.length
              }{' '}
              {recommendedCourses.length ===
              1
                ? 'course'
                : 'courses'}
            </span>
          </div>

          <div className="course-grid">
            {recommendedCourses.map(
              (course) =>
                renderCourseCard(
                  course,
                  true
                )
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          EXPLORE CATALOG
      ===================================================== */}

      <section className="courses-section">
        <div className="courses-section-header">
          <div className="section-heading-wrap">
            <div className="catalog-heading-row">
              <div className="catalog-heading-icon">
                <IconBook size={22} />
              </div>

              <div>
                <p className="section-kicker">
                  Explore & Learn
                </p>

                <h2 className="section-heading">
                  Explore Catalog
                </h2>

                <p className="section-subtitle">
                  Discover courses and
                  build skills for your
                  next opportunity.
                </p>
              </div>
            </div>
          </div>

          <span className="section-count">
            {filteredCourses.length}{' '}
            {filteredCourses.length ===
            1
              ? 'course'
              : 'courses'}
          </span>
        </div>

        {otherCourses.length >
        0 ? (
          <div className="course-grid">
            {otherCourses.map(
              (course) =>
                renderCourseCard(
                  course,
                  false
                )
            )}
          </div>
        ) : recommendedCourses.length ===
          0 ? (
          <div className="courses-empty">
            <div>
              <div className="empty-icon">
                <IconBook size={27} />
              </div>

              <h3 className="empty-title">
                No courses found
              </h3>

              <p className="empty-text">
                Try changing your
                search term, category,
                or difficulty filter
                to discover more
                courses.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}