import React, { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getStudentDashboard, getSkillGapAnalysis, getMyEnrollments, getCourses } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { downloadCsv, todayStamp, printStyleHtml } from '../utils/exports';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

const asArray = (value) => Array.isArray(value) ? value : [];
const unwrapData = (value) => {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value;
  if ('data' in value && value.data !== undefined && value.data !== null) return unwrapData(value.data);
  if ('result' in value && value.result !== undefined && value.result !== null) return unwrapData(value.result);
  return value;
};

const parseMetric = (value) => {
  if (value === null || value === undefined || value === '') return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[%\s]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  if (typeof value === 'object') {
    return parseMetric(value.value ?? value.score ?? value.percent ?? value.percentage ?? value.amount);
  }
  return NaN;
};

export const extractSkillGapData = (payload) => {
  const unwrapped = unwrapData(payload);
  const report = Array.isArray(unwrapped) ? { skills: unwrapped } : unwrapped;
  if (!report || typeof report !== 'object') return [];

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

  const list = skillLists.find((candidate) => candidate.length > 0);

  if (list) {
    return list
      .map((item) => {
        const skill = item?.skillName ?? item?.skill_name ?? item?.name ?? item?.skill ?? item?.title ?? item?.domainSkill ?? item?.domain_skill ?? item?.domain;
        const explicitGap = parseMetric(
          item?.gapPercentage ?? item?.gap_percentage ?? item?.gap_percent ?? item?.gap ?? item?.value ?? item?.skillGap ?? item?.skill_gap
        );
        const studentLevel = parseMetric(
          item?.student_level ?? item?.studentLevel ?? item?.current_level ?? item?.currentLevel ?? item?.skillLevel ?? item?.skill_level ?? item?.current ?? item?.currentScore
        );
        const requiredLevel = parseMetric(
          item?.required_level ?? item?.requiredLevel ?? item?.target_level ?? item?.targetLevel ?? item?.target ?? item?.requiredScore
        );
        const inferredGap = Number.isFinite(studentLevel) && Number.isFinite(requiredLevel) && requiredLevel > 0
          ? ((requiredLevel - studentLevel) / requiredLevel) * 100
          : NaN;
        const gapPercentage = Number.isFinite(explicitGap)
          ? explicitGap
          : Number.isFinite(inferredGap)
            ? inferredGap
            : NaN;

        if (!skill) return null;

        return {
          skill,
          gapPercentage: Number.isFinite(gapPercentage)
            ? Math.max(0, Math.min(100, Number(gapPercentage.toFixed(2))))
            : null,
          skillLevel: Number.isFinite(studentLevel) ? studentLevel : null,
          requiredLevel: Number.isFinite(requiredLevel) ? requiredLevel : null,
        };
      })
      .filter((item) => item && Number.isFinite(item.gapPercentage));
  }

  const missingSkills = asArray(report.missing_skills ?? report.missingSkills ?? report.required_skills ?? report.requiredSkills ?? report.gaps ?? report.top_missing_skills);
  return missingSkills
    .map((skill) => ({
      skill: typeof skill === 'string' ? skill : skill?.name ?? skill?.skill ?? skill?.skillName,
      gapPercentage: 100,
    }))
    .filter((item) => item.skill);
};

export const extractOverallCodingAssessment = (payload) => {
  const unwrapped = unwrapData(payload);
  const report = Array.isArray(unwrapped) ? null : unwrapped;
  if (!report || typeof report !== 'object') return null;

  const value = Number(report?.codingAssessment?.percentage);

  return Number.isFinite(value)
    ? Math.max(0, Math.min(100, Number(value.toFixed(2))))
    : null;
};

export const extractDomainRoleName = (payload) => {
  const report = unwrapData(payload);
  if (!report || typeof report !== 'object') return '';
  const name = report?.domainRole?.name ?? report?.domain_role?.name ?? report?.domainRole ?? report?.domain;
  return typeof name === 'string' ? name.trim() : '';
};
const normalizeDifficultyName = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase();

  if (['beginner', 'basic', 'novice'].includes(normalized)) return 'Beginner';
  if (['intermediate', 'medium', 'moderate'].includes(normalized)) return 'Intermediate';
  if (['advanced', 'expert', 'pro'].includes(normalized)) return 'Advanced';

  return null;
};

export const extractCourseProficiency = (payload) => {
  const counts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
  const source = unwrapData(payload) || {};

  if (!source || typeof source !== 'object') {
    return [
      { name: 'Beginner', value: 0 },
      { name: 'Intermediate', value: 0 },
      { name: 'Advanced', value: 0 },
    ];
  }

  const courses = asArray(source.courses ?? source.courseList ?? source.data?.courses ?? source.data?.courseList ?? source.items ?? []);
  const enrollments = asArray(source.enrollments ?? source.data?.enrollments ?? source.items ?? []);

  const completedCourseIds = new Set(
    enrollments
      .filter((enrollment) => {
        const completion = Number(
          enrollment?.completion_percentage ??
          enrollment?.completionPercentage ??
          enrollment?.progress ??
          enrollment?.percentComplete ??
          enrollment?.completion ??
          0
        );
        return completion >= 100;
      })
      .map((enrollment) => String(enrollment?.course_id ?? enrollment?.courseId ?? enrollment?.course?.id ?? enrollment?.id ?? ''))
      .filter(Boolean)
  );

  courses.forEach((course) => {
    const courseId = String(course?.id ?? course?.course_id ?? course?.courseId ?? course?.course?.id ?? '');
    if (!courseId || !completedCourseIds.has(courseId)) return;

    const difficulty = normalizeDifficultyName(course?.difficulty ?? course?.level ?? course?.skillLevel);
    if (!difficulty) return;
    counts[difficulty] += 1;
  });

  return [
    { name: 'Beginner', value: counts.Beginner },
    { name: 'Intermediate', value: counts.Intermediate },
    { name: 'Advanced', value: counts.Advanced },
  ];
};

export default function StudentInsights() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);
  const [gap, setGap] = useState(null);
  const [gapLoaded, setGapLoaded] = useState(false);
  const [gapLoading, setGapLoading] = useState(true);
  const [skillGapError, setSkillGapError] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const printRef = useRef(null);

  useEffect(() => {
    const userId = user?.userId ?? user?.id ?? user?._id ?? user?.user_id ?? user?.uid;
    const safeUserId = typeof userId === 'string' ? userId.trim() : userId;
    let cancelled = false;

    setGapLoading(true);
    setGapLoaded(false);
    setGap(null);
    setSkillGapError('');

    getStudentDashboard()
      .then((data) => !cancelled && setDash(unwrapData(data)))
      .catch(() => {});

    const finishGap = () => {
      if (!cancelled) setGapLoading(false);
    };

    const gapPromise =
      !safeUserId || safeUserId === 'undefined' || safeUserId === 'null'
        ? Promise.reject(Object.assign(new Error('missing-user-id'), { handled: true }))
        : getSkillGapAnalysis(safeUserId)
            .then((data) => {
              if (cancelled) return;
              setGap(unwrapData(data));
              setGapLoaded(true);
            });

    gapPromise
      .catch((error) => {
        if (cancelled) return;
        setGap(null);
        if (error?.handled) {
          setSkillGapError('Your profile could not be identified for skill-gap analysis.');
          return;
        }
        const status = error.response?.status;
        setSkillGapError(
          status === 409
            ? 'Complete both the initial quiz and coding assessment to view your skill-gap analysis.'
            : status === 400 || status === 404 || status === 500
              ? 'A skill-gap analysis is not available yet. Complete the required assessments to unlock it.'
              : 'Skill-gap analysis could not be loaded. Please try again.'
        );
      })
      .finally(finishGap);

    getMyEnrollments()
      .then((data) => !cancelled && setEnrollments(asArray(unwrapData(data))))
      .catch(() => !cancelled && setEnrollments([]));

    getCourses()
      .then((data) => !cancelled && setCourses(asArray(unwrapData(data))))
      .catch(() => !cancelled && setCourses([]));

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?._id, user?.userId, user?.user_id, user?.uid]);

const normalizedEnrollments = asArray(enrollments);
const normalizedCourses = asArray(courses);
const learnerProf = extractCourseProficiency({
  courses: normalizedCourses,
  enrollments: normalizedEnrollments,
});

const gapData = extractSkillGapData(gap);
const fallbackGapData = gapData.length > 0 ? gapData : extractSkillGapData(dash);
const skillGapData = gapLoaded || gapLoading ? gapData : fallbackGapData;
const domainRoleName =
  extractDomainRoleName(gap) ||
  (skillGapData === gapData ? '' : extractDomainRoleName(dash));
const overallCodingAssessment =
  extractOverallCodingAssessment(gap) ?? extractOverallCodingAssessment(dash);
const showSkillGapLoading = gapLoading && skillGapData.length === 0;
const showSkillGapEmpty = !gapLoading && !skillGapError && skillGapData.length === 0;
const recentActivity = asArray(
  dash?.recentActivity ??
  dash?.recent_activity ??
  dash?.activity ??
  dash?.activities ??
  dash?.data?.recentActivity ??
  dash?.data?.recent_activity ??
  []
);

// Each skill gets only its gap bar; the overall coding assessment is its own separate bar.
const skillGapChartData = [
  ...skillGapData.map((item) => ({
    skill: item.skill,
    gapPercentage: Number.isFinite(item.gapPercentage) ? item.gapPercentage : 0,
    codingAssessment: null,
  })),
  ...(overallCodingAssessment !== null
    ? [{ skill: 'Coding Assessment', gapPercentage: null, codingAssessment: overallCodingAssessment }]
    : []),
];
  const onExportCsv = () => {
    const rows = [
      ['EduSaaS — Student Insights Export'],
      ['Generated', new Date().toLocaleString()],
      ['User', user?.name || '—', user?.email || ''],
      [],
      ['Section: Skill Gap Analysis'],
      ['Domain Role', domainRoleName || '—'],
      ['Skill', 'Gap %'],
      ...skillGapData.map((r) => [r.skill, r.gapPercentage ?? 0]),
      ['Coding Assessment (Overall)', overallCodingAssessment ?? '—'],
      [],
      ['Section: Learner Proficiency'],
      ['Level', 'Courses Completed'],
      ...learnerProf.map((r) => [r.name, r.value]),
      [],
      ['Section: Recent Activity'],
      ['Title', 'When'],
      ...recentActivity.map((r) => [r.title ?? r.name ?? 'Activity', r.when ?? r.date ?? r.created_at ?? '']),
    ];
    downloadCsv(`insights_${todayStamp()}.csv`, rows);
  };

  const onExportPdf = () => window.print();

  return (
    <div className="space-y-6" id="print-area" ref={printRef}>
      <style>{printStyleHtml}</style>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Insights</h2>
          <p className="text-sm text-slate-500">Your performance, skill gaps, and course proficiency.</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={onExportPdf}>📄 Export PDF</Button>
          <Button onClick={onExportCsv}>⬇ Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title={domainRoleName ? `Skill Gap Analysis — ${domainRoleName}` : 'Skill Gap Analysis'}>
          {skillGapError && <p className="mb-3 text-sm text-amber-700">{skillGapError}</p>}
          {showSkillGapLoading && (
            <p className="mb-3 text-sm text-slate-500" data-testid="skill-gap-loading">Loading skill-gap analysis…</p>
          )}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGapChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="gapPercentage" fill="#2563eb" radius={[6, 6, 0, 0]} name="Gap Percentage" />
                <Bar dataKey="codingAssessment" fill="#10b981" radius={[6, 6, 0, 0]} name="Coding Assessment %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {showSkillGapEmpty && (
            <p className="mt-3 text-sm text-slate-500" data-testid="skill-gap-empty">No skill-gap data is available yet.</p>
          )}
        </Card>

        <Card title="Learner Proficiency">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={learnerProf} dataKey="value" nameKey="name" outerRadius={75} innerRadius={45}>
                  {learnerProf.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Recent Activity">
        <ul className="divide-y divide-slate-100">
          {recentActivity.map((a) => (
            <li key={a.id ?? `${a.title ?? 'activity'}-${a.when ?? a.date ?? a.created_at ?? Math.random()}`} className="py-2.5 flex justify-between text-sm">
              <span className="text-slate-800">✓ {a.title ?? a.name ?? 'Activity'}</span>
              <span className="text-xs text-slate-500">{a.when ?? a.date ?? a.created_at ?? ''}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
