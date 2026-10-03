import React, { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getStudentDashboard,
  getSkillGapAnalysis,
  getMyEnrollments,
  getCourses,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  downloadCsv,
  todayStamp,
  printStyleHtml,
} from '../utils/exports';

/* =========================================================
   COLORS
========================================================= */

const COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
];

/* =========================================================
   ICONS
========================================================= */

const Icon = ({
  name,
  size = 18,
  strokeWidth = 1.8,
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'insights':
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h17" />
          <path d="M8 16v-5" />
          <path d="M12 16V7" />
          <path d="M16 16v-8" />
          <path d="M20 16V4" />
        </svg>
      );

    case 'download':
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );

    case 'document':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h6" />
        </svg>
      );

    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 16v-4" />
          <path d="M12 16V8" />
          <path d="M16 16v-6" />
        </svg>
      );

    case 'activity':
      return (
        <svg {...common}>
          <path d="M3 12h4l2.2-7 4.2 14L16 12h5" />
        </svg>
      );

    case 'spark':
      return (
        <svg {...common}>
          <path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6Z" />
          <path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7Z" />
        </svg>
      );

    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};

/* =========================================================
   HELPERS
========================================================= */

const asArray = (value) =>
  Array.isArray(value) ? value : [];

const unwrapData = (value) => {
  if (value == null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (
    'data' in value &&
    value.data !== undefined &&
    value.data !== null
  ) {
    return unwrapData(value.data);
  }

  if (
    'result' in value &&
    value.result !== undefined &&
    value.result !== null
  ) {
    return unwrapData(value.result);
  }

  return value;
};

const parseMetric = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return NaN;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : NaN;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(
      /[%\s]/g,
      ''
    );

    const parsed = Number(cleaned);

    return Number.isFinite(parsed)
      ? parsed
      : NaN;
  }

  if (typeof value === 'object') {
    return parseMetric(
      value.value ??
        value.score ??
        value.percent ??
        value.percentage ??
        value.amount
    );
  }

  return NaN;
};

/* =========================================================
   SKILL GAP DATA
========================================================= */

export const extractSkillGapData = (
  payload
) => {
  const unwrapped = unwrapData(payload);

  const report = Array.isArray(unwrapped)
    ? { skills: unwrapped }
    : unwrapped;

  if (
    !report ||
    typeof report !== 'object'
  ) {
    return [];
  }

  const skillLists = [
    report.skillGapAnalysis,
    report.skill_gap_analysis,
    report.skill_gap,
    report.skillGap,
    report.skills,
    report.gapAnalysis,

    report.recommendations?.skill_gap,
    report.recommendations?.skillGap,
    report.recommendations?.skills,
    report.recommendations?.gapAnalysis,

    report.analysis?.skillGapAnalysis,
    report.analysis?.skill_gap_analysis,
    report.analysis?.skills,
    report.analysis?.skill_gap,
    report.analysis?.skillGap,

    report.data?.skillGapAnalysis,
    report.data?.skill_gap_analysis,
    report.data?.skills,
    report.data?.skill_gap,
    report.data?.skillGap,
    report.data?.gapAnalysis,

    report.domainSkills,
    report.domain_skills,
    report.domainSkillGap,
    report.domain_skill_gap,

    report.skillGaps,
    report.skill_gaps,
  ].filter(Array.isArray);

  const list = skillLists.find(
    (candidate) =>
      candidate.length > 0
  );

  if (list) {
    return list
      .map((item) => {
        const skill =
          item?.skillName ??
          item?.skill_name ??
          item?.name ??
          item?.skill ??
          item?.title ??
          item?.domainSkill ??
          item?.domain_skill ??
          item?.domain;

        const explicitGap =
          parseMetric(
            item?.gapPercentage ??
              item?.gap_percentage ??
              item?.gap_percent ??
              item?.gap ??
              item?.value ??
              item?.skillGap ??
              item?.skill_gap
          );

        const studentLevel =
          parseMetric(
            item?.student_level ??
              item?.studentLevel ??
              item?.current_level ??
              item?.currentLevel ??
              item?.skillLevel ??
              item?.skill_level ??
              item?.current ??
              item?.currentScore
          );

        const requiredLevel =
          parseMetric(
            item?.required_level ??
              item?.requiredLevel ??
              item?.target_level ??
              item?.targetLevel ??
              item?.target ??
              item?.requiredScore
          );

        const inferredGap =
          Number.isFinite(studentLevel) &&
          Number.isFinite(requiredLevel) &&
          requiredLevel > 0
            ? ((requiredLevel -
                studentLevel) /
                requiredLevel) *
              100
            : NaN;

        const gapPercentage =
          Number.isFinite(explicitGap)
            ? explicitGap
            : Number.isFinite(
                inferredGap
              )
            ? inferredGap
            : NaN;

        if (!skill) {
          return null;
        }

        return {
          skill,
          gapPercentage:
            Number.isFinite(
              gapPercentage
            )
              ? Math.max(
                  0,
                  Math.min(
                    100,
                    Number(
                      gapPercentage.toFixed(
                        2
                      )
                    )
                  )
                )
              : null,

          skillLevel:
            Number.isFinite(
              studentLevel
            )
              ? studentLevel
              : null,

          requiredLevel:
            Number.isFinite(
              requiredLevel
            )
              ? requiredLevel
              : null,
        };
      })
      .filter(
        (item) =>
          item &&
          Number.isFinite(
            item.gapPercentage
          )
      );
  }

  const missingSkills = asArray(
    report.missing_skills ??
      report.missingSkills ??
      report.required_skills ??
      report.requiredSkills ??
      report.gaps ??
      report.top_missing_skills
  );

  return missingSkills
    .map((skill) => ({
      skill:
        typeof skill === 'string'
          ? skill
          : skill?.name ??
            skill?.skill ??
            skill?.skillName,

      gapPercentage: 100,
    }))
    .filter(
      (item) => item.skill
    );
};

/* =========================================================
   CODING ASSESSMENT
========================================================= */

export const extractOverallCodingAssessment = (
  payload
) => {
  const unwrapped = unwrapData(payload);

  const report = Array.isArray(
    unwrapped
  )
    ? null
    : unwrapped;

  if (
    !report ||
    typeof report !== 'object'
  ) {
    return null;
  }

  const value = Number(
    report?.codingAssessment
      ?.percentage
  );

  return Number.isFinite(value)
    ? Math.max(
        0,
        Math.min(
          100,
          Number(
            value.toFixed(2)
          )
        )
      )
    : null;
};

/* =========================================================
   DOMAIN ROLE
========================================================= */

export const extractDomainRoleName = (
  payload
) => {
  const report = unwrapData(payload);

  if (
    !report ||
    typeof report !== 'object'
  ) {
    return '';
  }

  const name =
    report?.domainRole?.name ??
    report?.domain_role?.name ??
    report?.domainRole ??
    report?.domain;

  return typeof name === 'string'
    ? name.trim()
    : '';
};

/* =========================================================
   DIFFICULTY
========================================================= */

const normalizeDifficultyName = (
  value
) => {
  const normalized = String(
    value ?? ''
  )
    .trim()
    .toLowerCase();

  if (
    [
      'beginner',
      'basic',
      'novice',
    ].includes(normalized)
  ) {
    return 'Beginner';
  }

  if (
    [
      'intermediate',
      'medium',
      'moderate',
    ].includes(normalized)
  ) {
    return 'Intermediate';
  }

  if (
    [
      'advanced',
      'expert',
      'pro',
    ].includes(normalized)
  ) {
    return 'Advanced';
  }

  return null;
};

/* =========================================================
   COURSE PROFICIENCY
========================================================= */

export const extractCourseProficiency = (
  payload
) => {
  const counts = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
  };

  const source =
    unwrapData(payload) || {};

  if (
    !source ||
    typeof source !== 'object'
  ) {
    return [
      {
        name: 'Beginner',
        value: 0,
      },
      {
        name: 'Intermediate',
        value: 0,
      },
      {
        name: 'Advanced',
        value: 0,
      },
    ];
  }

  const courses = asArray(
    source.courses ??
      source.courseList ??
      source.data?.courses ??
      source.data?.courseList ??
      source.items ??
      []
  );

  const enrollments = asArray(
    source.enrollments ??
      source.data?.enrollments ??
      source.items ??
      []
  );

  const completedCourseIds =
    new Set(
      enrollments
        .filter((enrollment) => {
          const completion =
            Number(
              enrollment?.completion_percentage ??
                enrollment?.completionPercentage ??
                enrollment?.progress ??
                enrollment?.percentComplete ??
                enrollment?.completion ??
                0
            );

          return completion >= 100;
        })
        .map((enrollment) =>
          String(
            enrollment?.course_id ??
              enrollment?.courseId ??
              enrollment?.course?.id ??
              enrollment?.id ??
              ''
          )
        )
        .filter(Boolean)
    );

  courses.forEach((course) => {
    const courseId = String(
      course?.id ??
        course?.course_id ??
        course?.courseId ??
        course?.course?.id ??
        ''
    );

    if (
      !courseId ||
      !completedCourseIds.has(
        courseId
      )
    ) {
      return;
    }

    const difficulty =
      normalizeDifficultyName(
        course?.difficulty ??
          course?.level ??
          course?.skillLevel
      );

    if (!difficulty) {
      return;
    }

    counts[difficulty] += 1;
  });

  return [
    {
      name: 'Beginner',
      value: counts.Beginner,
    },
    {
      name: 'Intermediate',
      value: counts.Intermediate,
    },
    {
      name: 'Advanced',
      value: counts.Advanced,
    },
  ];
};

/* =========================================================
   TOOLTIP
========================================================= */

const InsightTooltip = ({
  active,
  payload,
}) => {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-white/80
        bg-white/95
        px-4
        py-3
        shadow-[0_18px_50px_rgba(15,23,42,0.16)]
        backdrop-blur-xl
      "
    >
      {payload.map(
        (entry, index) => (
          <div
            key={`${entry.dataKey}-${index}`}
            className="flex items-center gap-2"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background:
                  entry.color ||
                  '#6366f1',
              }}
            />

            <span className="text-[12px] font-medium text-slate-500">
              {entry.name}
            </span>

            <span className="ml-1 text-[13px] font-bold text-slate-800">
              {entry.value}%
            </span>
          </div>
        )
      )}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentInsights() {
  const { user } = useAuth();

  const [dash, setDash] =
    useState(null);

  const [gap, setGap] =
    useState(null);

  const [gapLoaded, setGapLoaded] =
    useState(false);

  const [gapLoading, setGapLoading] =
    useState(true);

  const [skillGapError, setSkillGapError] =
    useState('');

  const [enrollments, setEnrollments] =
    useState([]);

  const [courses, setCourses] =
    useState([]);

  const printRef =
    useRef(null);

  /* =======================================================
     API LOGIC — PRESERVED
  ======================================================= */

  useEffect(() => {
    const userId =
      user?.userId ??
      user?.id ??
      user?._id ??
      user?.user_id ??
      user?.uid;

    const safeUserId =
      typeof userId === 'string'
        ? userId.trim()
        : userId;

    let cancelled = false;

    setGapLoading(true);
    setGapLoaded(false);
    setGap(null);
    setSkillGapError('');

    getStudentDashboard()
      .then(
        (data) =>
          !cancelled &&
          setDash(
            unwrapData(data)
          )
      )
      .catch(() => {});

    const finishGap = () => {
      if (!cancelled) {
        setGapLoading(false);
      }
    };

    const gapPromise =
      !safeUserId ||
      safeUserId === 'undefined' ||
      safeUserId === 'null'
        ? Promise.reject(
            Object.assign(
              new Error(
                'missing-user-id'
              ),
              {
                handled: true,
              }
            )
          )
        : getSkillGapAnalysis(
            safeUserId
          ).then((data) => {
            if (cancelled) return;

            setGap(
              unwrapData(data)
            );

            setGapLoaded(true);
          });

    gapPromise
      .catch((error) => {
        if (cancelled) return;

        setGap(null);

        if (error?.handled) {
          setSkillGapError(
            'Your profile could not be identified for skill-gap analysis.'
          );
          return;
        }

        const status =
          error.response?.status;

        setSkillGapError(
          status === 409
            ? 'Complete both the initial quiz and coding assessment to view your skill-gap analysis.'
            : status === 400 ||
              status === 404 ||
              status === 500
            ? 'A skill-gap analysis is not available yet. Complete the required assessments to unlock it.'
            : 'Skill-gap analysis could not be loaded. Please try again.'
        );
      })
      .finally(finishGap);

    getMyEnrollments()
      .then(
        (data) =>
          !cancelled &&
          setEnrollments(
            asArray(
              unwrapData(data)
            )
          )
      )
      .catch(
        () =>
          !cancelled &&
          setEnrollments([])
      );

    getCourses()
      .then(
        (data) =>
          !cancelled &&
          setCourses(
            asArray(
              unwrapData(data)
            )
          )
      )
      .catch(
        () =>
          !cancelled &&
          setCourses([])
      );

    return () => {
      cancelled = true;
    };
  }, [
    user?.id,
    user?._id,
    user?.userId,
    user?.user_id,
    user?.uid,
  ]);

  /* =======================================================
     DATA
  ======================================================= */

  const normalizedEnrollments =
    asArray(enrollments);

  const normalizedCourses =
    asArray(courses);

  const learnerProf =
    extractCourseProficiency({
      courses:
        normalizedCourses,
      enrollments:
        normalizedEnrollments,
    });

  const gapData =
    extractSkillGapData(gap);

  const fallbackGapData =
    gapData.length > 0
      ? gapData
      : extractSkillGapData(dash);

  const skillGapData =
    gapLoaded || gapLoading
      ? gapData
      : fallbackGapData;

  const domainRoleName =
    extractDomainRoleName(gap) ||
    (skillGapData === gapData
      ? ''
      : extractDomainRoleName(
          dash
        ));

  const overallCodingAssessment =
    extractOverallCodingAssessment(
      gap
    ) ??
    extractOverallCodingAssessment(
      dash
    );

  const showSkillGapLoading =
    gapLoading &&
    skillGapData.length === 0;

  const showSkillGapEmpty =
    !gapLoading &&
    !skillGapError &&
    skillGapData.length === 0;

  const recentActivity =
    asArray(
      dash?.recentActivity ??
        dash?.recent_activity ??
        dash?.activity ??
        dash?.activities ??
        dash?.data?.recentActivity ??
        dash?.data?.recent_activity ??
        []
    );

  const skillGapChartData = [
    ...skillGapData.map((item) => ({
      skill: item.skill,
      gapPercentage:
        Number.isFinite(
          item.gapPercentage
        )
          ? item.gapPercentage
          : 0,
      codingAssessment: null,
    })),

    ...(overallCodingAssessment !==
    null
      ? [
          {
            skill:
              'Coding Assessment',
            gapPercentage: null,
            codingAssessment:
              overallCodingAssessment,
          },
        ]
      : []),
  ];

  /* =======================================================
     EXPORT
  ======================================================= */

  const onExportCsv = () => {
    const rows = [
      [
        'EduSaaS — Student Insights Export',
      ],
      [
        'Generated',
        new Date().toLocaleString(),
      ],
      [
        'User',
        user?.name || '—',
        user?.email || '',
      ],
      [],
      [
        'Section: Skill Gap Analysis',
      ],
      [
        'Domain Role',
        domainRoleName || '—',
      ],
      ['Skill', 'Gap %'],
      ...skillGapData.map((r) => [
        r.skill,
        r.gapPercentage ?? 0,
      ]),
      [
        'Coding Assessment (Overall)',
        overallCodingAssessment ??
          '—',
      ],
      [],
      [
        'Section: Learner Proficiency',
      ],
      [
        'Level',
        'Courses Completed',
      ],
      ...learnerProf.map((r) => [
        r.name,
        r.value,
      ]),
      [],
      [
        'Section: Recent Activity',
      ],
      ['Title', 'When'],
      ...recentActivity.map((r) => [
        r.title ??
          r.name ??
          'Activity',
        r.when ??
          r.date ??
          r.created_at ??
          '',
      ]),
    ];

    downloadCsv(
      `insights_${todayStamp()}.csv`,
      rows
    );
  };

  const onExportPdf = () =>
    window.print();

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      id="print-area"
      ref={printRef}
      className="
        relative
        min-h-full
        space-y-6
        overflow-hidden
        pb-10
      "
    >
      <style>
        {printStyleHtml}
      </style>

      {/* =================================================
          BACKGROUND GLOW
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          -top-28
          h-80
          w-80
          rounded-full
          bg-gradient-to-br
          from-blue-500/20
          via-indigo-500/10
          to-transparent
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-130px]
          top-0
          h-96
          w-96
          rounded-full
          bg-gradient-to-br
          from-violet-500/20
          via-fuchsia-400/10
          to-transparent
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-[-180px]
          left-[30%]
          h-96
          w-96
          rounded-full
          bg-gradient-to-br
          from-cyan-400/10
          via-blue-500/10
          to-transparent
          blur-3xl
        "
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          group
          relative
          rounded-[30px]
          p-[1px]
          transition-all
          duration-500
          hover:-translate-y-1
          hover:shadow-[0_25px_70px_rgba(79,70,229,0.15)]
        "
      >
        <div
          className="
            absolute
            inset-0
            rounded-[30px]
            bg-gradient-to-r
            from-blue-500/40
            via-indigo-500/30
            to-violet-500/40
            opacity-70
            transition
            duration-500
            group-hover:opacity-100
          "
        />

        <div
          className="
            relative
            overflow-hidden
            rounded-[29px]
            border
            border-white/80
            bg-white/85
            px-5
            py-6
            shadow-[0_15px_45px_rgba(15,23,42,0.06)]
            backdrop-blur-2xl
            sm:px-7
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              right-[-50px]
              top-[-70px]
              h-52
              w-52
              rounded-full
              bg-gradient-to-br
              from-blue-400/20
              to-violet-500/20
              blur-3xl
              transition
              duration-700
              group-hover:scale-125
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-blue-600
                    via-indigo-600
                    to-violet-600
                    text-white
                    shadow-lg
                    shadow-indigo-500/25
                    transition-all
                    duration-300
                    group-hover:scale-110
                    group-hover:rotate-3
                  "
                >
                  <Icon
                    name="insights"
                    size={18}
                  />
                </span>

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-indigo-500
                  "
                >
                  Performance Center
                </span>
              </div>

              <h2
                className="
                  text-[30px]
                  font-black
                  tracking-[-0.055em]
                  text-transparent
                  transition-all
                  duration-300
                  group-hover:tracking-[-0.045em]
                  sm:text-[36px]
                "
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #0f172a 0%, #2563eb 35%, #6366f1 68%, #a855f7 100%)',
                  WebkitBackgroundClip:
                    'text',
                  WebkitTextFillColor:
                    'transparent',
                  backgroundClip:
                    'text',
                }}
              >
                Insights
              </h2>

              <p
                className="
                  mt-1.5
                  max-w-xl
                  text-[13px]
                  font-medium
                  leading-6
                  tracking-[0.01em]
                  text-slate-500
                "
              >
                Understand your performance,
                discover skill gaps, and track
                your learning journey.
              </p>
            </div>

            <div
              className="
                no-print
                flex
                flex-wrap
                gap-2.5
              "
            >
              <Button
                variant="outline"
                onClick={onExportPdf}
              >
                <span className="mr-2 transition-transform duration-300 hover:scale-110">
                  <Icon
                    name="document"
                    size={16}
                  />
                </span>
                Export PDF
              </Button>

              <Button
                onClick={onExportCsv}
              >
                <span className="mr-2">
                  <Icon
                    name="download"
                    size={16}
                  />
                </span>
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          CHART GRID
      ================================================= */}

      <div
        className="
          relative
          grid
          grid-cols-1
          gap-6
          lg:grid-cols-2
        "
      >
        {/* =================================================
            SKILL GAP
        ================================================= */}

        <div
          className="
            group
            relative
            rounded-[28px]
            p-[1px]
            transition-all
            duration-500
            hover:-translate-y-1.5
            hover:shadow-[0_25px_70px_rgba(59,130,246,0.13)]
          "
        >
          <div
            className="
              absolute
              inset-0
              rounded-[28px]
              bg-gradient-to-br
              from-blue-500/35
              via-indigo-500/25
              to-violet-500/40
              opacity-60
              blur-[1px]
              transition-all
              duration-500
              group-hover:opacity-100
              group-hover:blur-0
            "
          />

          <div
            className="
              relative
              h-full
              overflow-hidden
              rounded-[27px]
              bg-white/90
              p-1
              backdrop-blur-xl
            "
          >
            <Card
              title={
                domainRoleName
                  ? `Skill Gap Analysis — ${domainRoleName}`
                  : 'Skill Gap Analysis'
              }
            >
              <div
                className="
                  group/intro
                  relative
                  mb-5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-blue-100/80
                  bg-gradient-to-r
                  from-blue-50
                  via-indigo-50
                  to-violet-50
                  px-4
                  py-3.5
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >
                <div
                  className="
                    absolute
                    right-[-20px]
                    top-[-30px]
                    h-20
                    w-20
                    rounded-full
                    bg-gradient-to-br
                    from-blue-400/25
                    to-violet-500/25
                    blur-xl
                    transition
                    duration-500
                    group-hover/intro:scale-150
                  "
                />

                <div className="relative flex items-center gap-3">
                  <span
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-blue-500
                      to-indigo-600
                      text-white
                      shadow-md
                      shadow-blue-500/20
                      transition-all
                      duration-300
                      group-hover/intro:scale-110
                      group-hover/intro:rotate-3
                    "
                  >
                    <Icon
                      name="chart"
                      size={18}
                    />
                  </span>

                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-indigo-500
                      "
                    >
                      Skill performance
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[13px]
                        font-medium
                        leading-5
                        text-slate-600
                      "
                    >
                      Identify areas that need
                      more attention.
                    </p>
                  </div>
                </div>
              </div>

              {skillGapError && (
                <div
                  className="
                    mb-4
                    rounded-2xl
                    border
                    border-amber-200
                    bg-gradient-to-r
                    from-amber-50
                    to-orange-50
                    px-4
                    py-3
                  "
                >
                  <p
                    className="
                      text-[12px]
                      font-medium
                      leading-5
                      text-amber-700
                    "
                  >
                    {skillGapError}
                  </p>
                </div>
              )}

              {showSkillGapLoading && (
                <p
                  className="
                    mb-3
                    text-[12px]
                    font-medium
                    text-slate-400
                  "
                  data-testid="skill-gap-loading"
                >
                  Loading skill-gap analysis…
                </p>
              )}

              <div
                className="
                  relative
                  h-56
                  rounded-2xl
                  transition-all
                  duration-300
                  group-hover:bg-gradient-to-br
                  group-hover:from-blue-50/20
                  group-hover:to-violet-50/20
                "
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      skillGapChartData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="4 5"
                      stroke="#e2e8f0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="skill"
                      tick={{
                        fontSize: 10,
                        fill: '#64748b',
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: '#64748b',
                        fontWeight: 600,
                      }}
                      tickFormatter={(value) =>
                        `${value}%`
                      }
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      content={
                        <InsightTooltip />
                      }
                      cursor={{
                        fill: 'rgba(99,102,241,0.05)',
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />

                    <Bar
                      dataKey="gapPercentage"
                      fill="url(#skillGradient)"
                      radius={[
                        8,
                        8,
                        3,
                        3,
                      ]}
                      barSize={30}
                      name="Gap Percentage"
                    />

                    <Bar
                      dataKey="codingAssessment"
                      fill="url(#codingGradient)"
                      radius={[
                        8,
                        8,
                        3,
                        3,
                      ]}
                      barSize={30}
                      name="Coding Assessment %"
                    />

                    <defs>
                      <linearGradient
                        id="skillGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                        />
                        <stop
                          offset="50%"
                          stopColor="#6366f1"
                        />
                        <stop
                          offset="100%"
                          stopColor="#a855f7"
                        />
                      </linearGradient>

                      <linearGradient
                        id="codingGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                        />
                        <stop
                          offset="50%"
                          stopColor="#14b8a6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#06b6d4"
                        />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {showSkillGapEmpty && (
                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-dashed
                    border-indigo-200
                    bg-gradient-to-r
                    from-indigo-50/60
                    to-violet-50/60
                    px-4
                    py-3
                    transition-all
                    duration-300
                    hover:border-indigo-300
                    hover:shadow-sm
                  "
                  data-testid="skill-gap-empty"
                >
                  <p
                    className="
                      text-[12px]
                      font-medium
                      text-slate-500
                    "
                  >
                    No skill-gap data is
                    available yet.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* =================================================
            LEARNER PROFICIENCY
        ================================================= */}

        <div
          className="
            group
            relative
            rounded-[28px]
            p-[1px]
            transition-all
            duration-500
            hover:-translate-y-1.5
            hover:shadow-[0_25px_70px_rgba(16,185,129,0.12)]
          "
        >
          <div
            className="
              absolute
              inset-0
              rounded-[28px]
              bg-gradient-to-br
              from-emerald-400/35
              via-cyan-400/25
              to-blue-500/35
              opacity-60
              transition-all
              duration-500
              group-hover:opacity-100
            "
          />

          <div
            className="
              relative
              h-full
              overflow-hidden
              rounded-[27px]
              bg-white/90
              p-1
              backdrop-blur-xl
            "
          >
            <Card title="Learner Proficiency">
              <div
                className="
                  group/intro
                  relative
                  mb-5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-emerald-100/80
                  bg-gradient-to-r
                  from-emerald-50
                  via-cyan-50
                  to-blue-50
                  px-4
                  py-3.5
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >
                <div
                  className="
                    absolute
                    right-[-20px]
                    top-[-30px]
                    h-20
                    w-20
                    rounded-full
                    bg-gradient-to-br
                    from-emerald-400/25
                    to-cyan-500/25
                    blur-xl
                    transition
                    duration-500
                    group-hover/intro:scale-150
                  "
                />

                <div className="relative flex items-center gap-3">
                  <span
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-gradient-to-br
                      from-emerald-500
                      to-cyan-600
                      text-white
                      shadow-md
                      shadow-emerald-500/20
                      transition-all
                      duration-300
                      group-hover/intro:scale-110
                      group-hover/intro:rotate-3
                    "
                  >
                    <Icon
                      name="activity"
                      size={18}
                    />
                  </span>

                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-emerald-600
                      "
                    >
                      Course completion
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[13px]
                        font-medium
                        leading-5
                        text-slate-600
                      "
                    >
                      Completed courses grouped
                      by learning level.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  h-56
                  rounded-2xl
                  transition-all
                  duration-300
                  group-hover:bg-gradient-to-br
                  group-hover:from-emerald-50/20
                  group-hover:to-cyan-50/20
                "
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={learnerProf}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={78}
                      innerRadius={47}
                      paddingAngle={4}
                      cornerRadius={7}
                    >
                      {learnerProf.map(
                        (_, i) => (
                          <Cell
                            key={i}
                            fill={
                              COLORS[
                                i %
                                  COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      content={
                        <InsightTooltip />
                      }
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* =================================================
          RECENT ACTIVITY
      ================================================= */}

      <div
        className="
          group
          relative
          rounded-[28px]
          p-[1px]
          transition-all
          duration-500
          hover:-translate-y-1
          hover:shadow-[0_25px_70px_rgba(99,102,241,0.12)]
        "
      >
        <div
          className="
            absolute
            inset-0
            rounded-[28px]
            bg-gradient-to-r
            from-violet-400/35
            via-indigo-500/25
            to-blue-500/35
            opacity-70
            transition
            duration-500
            group-hover:opacity-100
          "
        />

        <div
          className="
            relative
            overflow-hidden
            rounded-[27px]
            bg-white/90
            backdrop-blur-xl
          "
        >
          <Card title="Recent Activity">
            <div
              className="
                group/intro
                relative
                mb-4
                overflow-hidden
                rounded-2xl
                border
                border-violet-100/80
                bg-gradient-to-r
                from-violet-50
                via-indigo-50
                to-blue-50
                px-4
                py-3.5
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div
                className="
                  absolute
                  right-[-30px]
                  top-[-40px]
                  h-24
                  w-24
                  rounded-full
                  bg-gradient-to-br
                  from-violet-400/25
                  to-blue-500/25
                  blur-xl
                  transition
                  duration-500
                  group-hover/intro:scale-150
                "
              />

              <div className="relative flex items-center gap-3">
                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-violet-500
                    to-indigo-600
                    text-white
                    shadow-md
                    shadow-violet-500/20
                    transition-all
                    duration-300
                    group-hover/intro:scale-110
                    group-hover/intro:rotate-3
                  "
                >
                  <Icon
                    name="activity"
                    size={18}
                  />
                </span>

                <div>
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-violet-600
                    "
                  >
                    Learning timeline
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[13px]
                      font-medium
                      leading-5
                      text-slate-600
                    "
                  >
                    Your latest learning activity
                    and progress updates.
                  </p>
                </div>
              </div>
            </div>

            <ul
              className="
                divide-y
                divide-slate-100
              "
            >
              {recentActivity.map(
                (a) => (
                  <li
                    key={
                      a.id ??
                      `${a.title ?? 'activity'}-${
                        a.when ??
                        a.date ??
                        a.created_at ??
                        Math.random()
                      }`
                    }
                    className="
                      group/item
                      relative
                      flex
                      items-center
                      justify-between
                      gap-4
                      overflow-hidden
                      rounded-xl
                      py-3.5
                      transition-all
                      duration-300
                      hover:-translate-x-1
                      hover:bg-gradient-to-r
                      hover:from-violet-50/70
                      hover:via-indigo-50/50
                      hover:to-blue-50/60
                      hover:px-3
                    "
                  >
                    <div
                      className="
                        absolute
                        left-0
                        top-0
                        h-full
                        w-1
                        origin-left
                        scale-y-0
                        rounded-full
                        bg-gradient-to-b
                        from-violet-500
                        to-blue-500
                        transition-transform
                        duration-300
                        group-hover/item:scale-y-100
                      "
                    />

                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-emerald-400
                          to-teal-600
                          text-white
                          shadow-md
                          shadow-emerald-500/15
                          transition-all
                          duration-300
                          group-hover/item:scale-110
                          group-hover/item:rotate-3
                        "
                      >
                        <Icon
                          name="check"
                          size={15}
                          strokeWidth={2}
                        />
                      </span>

                      <span
                        className="
                          truncate
                          text-[13px]
                          font-semibold
                          tracking-[-0.005em]
                          text-slate-700
                          transition-colors
                          duration-300
                          group-hover/item:text-indigo-700
                        "
                      >
                        {a.title ??
                          a.name ??
                          'Activity'}
                      </span>
                    </div>

                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-gradient-to-r
                        from-slate-50
                        to-indigo-50
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        tracking-[0.02em]
                        text-slate-500
                        ring-1
                        ring-slate-100
                        transition-all
                        duration-300
                        group-hover/item:from-indigo-100
                        group-hover/item:to-violet-100
                        group-hover/item:text-indigo-600
                      "
                    >
                      {a.when ??
                        a.date ??
                        a.created_at ??
                        ''}
                    </span>
                  </li>
                )
              )}
            </ul>

            {recentActivity.length ===
              0 && (
              <div
                className="
                  group/empty
                  rounded-2xl
                  border
                  border-dashed
                  border-violet-200
                  bg-gradient-to-br
                  from-violet-50/70
                  via-white
                  to-blue-50/70
                  px-5
                  py-9
                  text-center
                  transition-all
                  duration-300
                  hover:border-violet-300
                  hover:shadow-lg
                "
              >
                <span
                  className="
                    mx-auto
                    mb-3
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-violet-500
                    to-indigo-600
                    text-white
                    shadow-lg
                    shadow-violet-500/20
                    transition-all
                    duration-300
                    group-hover/empty:scale-110
                    group-hover/empty:rotate-6
                  "
                >
                  <Icon
                    name="spark"
                    size={20}
                  />
                </span>

                <p
                  className="
                    text-[14px]
                    font-bold
                    tracking-[-0.01em]
                    text-slate-700
                  "
                >
                  No recent activity
                </p>

                <p
                  className="
                    mx-auto
                    mt-1
                    max-w-sm
                    text-[12px]
                    font-medium
                    leading-5
                    text-slate-400
                  "
                >
                  Your recent learning activities
                  will appear here as you continue
                  using EduSaaS.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}