import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom'
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gauge } from '../components/ui/Gauge';
import { SkillBar } from '../components/ui/SkillBar';
import { useAuth } from '../context/AuthContext';
import { fetchGapReport, aimlAnalyzeSkillGap } from '../services/api';

export default function GapReport() {
  const navigate = useNavigate()
  const { user } = useAuth();
  const [live, setLive] = useState(null);
  

  useEffect(() => {
    let currentUserId = user?.id;
    try {
      const stored = JSON.parse(localStorage.getItem("edu_user") || "{}");
      if (stored?.id) currentUserId = stored.id;
    } catch (e) {}

    if (!currentUserId) return;
    fetchGapReport(currentUserId)
      .then((data) => {
        setLive(data);
      })
      .catch((err) => {
        console.error("Failed to fetch gap report:", err);
      });
  }, [user?.id]);

  const readiness = live?.readiness_score ?? 0;

  const needs = (live?.missing_skills ?? []).map((name) => ({
    name,
  }));

  const breakdown = live?.recommendations?.skill_gap ?? [];
  const strengths = breakdown.filter((skill) => skill.status === "Ready")


  const hasGapReport = live && breakdown.length > 0
  if (!hasGapReport) {
    return (

      <div className="space-y-6">

        <div>
          <h2 className="text-3xl font-bold">
            Gap Analysis Report
          </h2>

          <p className="text-slate-500 mt-2">
            Complete your assessment to unlock your personalized gap report.
          </p>
        </div>

        <Card>

          <div className="flex flex-col items-center justify-center py-20">

            <div className="text-7xl">
              📊
            </div>

            <h3 className="text-2xl font-bold mt-6">
              No Gap Report Available
            </h3>

            <p className="text-slate-500 text-center max-w-lg mt-4">

              We don't have enough information to analyze your skills yet.

              Complete the initial assessment to generate your personalized report.

            </p>

            <Button
              className="mt-8"
              onClick={() => navigate("/app/assessments/initial")}
            >
              Take Assessment
            </Button>

          </div>

        </Card>

        {/* Live AI Skill Gap Simulator */}
        <AISkillGapSimulator user={user} />

      </div>

    );
  }

  
  const getReadinessCategory = (score) => {
    if (score >= 80)
      return {
        label: "Excellent",
        color: "text-green-600",
        message: "You are job-ready for most role requirements.",
      };

    if (score >= 60)
      return {
        label: "Good",
        color: "text-lime-600",
        message: "You are close to meeting the required skill level.",
      };

    if (score >= 40)
      return {
        label: "Average",
        color: "text-orange-500",
        message: "Several important skills still require improvement.",
      };

    return {
      label: "Needs Improvement",
      color: "text-red-500",
      message: "Your current skills are below the expected level for this role.",
    };
  };

  const readinessInfo = getReadinessCategory(readiness);

  const getStatusBadge = (gap) => {

    if (gap === 0) {
      return {
        label: "Ready",
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-300",
      };
    }

    if (gap === 1) {
      return {
        label: "Close",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300",
      };
    }

    return {
      label: "Needs Improvement",
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-300",
    };
  };

  let domainRole = "Target Role";
  try {
    const stored = JSON.parse(localStorage.getItem("edu_user") || "{}");
    if (stored?.domain_role_name) domainRole = stored.domain_role_name;
  } catch (e) {}
  if (user?.domain_role) domainRole = user.domain_role;
  const skillsRemaining = needs.length;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div>  
          <h2 className="text-2xl font-bold text-slate-900">Gap Analysis Report</h2>
          <p className="text-sm text-slate-500">
            Your skills vs. the requirements for {domainRole} roles.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Compare with Industry</Button>
          <Button variant="primary">Download Report</Button>
          <Button variant="accent">Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

        <Card title="Readiness Overview">
          <div className="flex flex-col items-center">

            <Gauge
              value={readiness}
              size={200}
              label="Overall Readiness"
            />

            <h3 className={`mt-4 text-lg font-semibold ${readinessInfo.color}`} >
              {readinessInfo.label}
            </h3>

            <p className="mt-2 text-center text-sm text-slate-500 px-4">
              {readinessInfo.message}
            </p>

          </div>
        </Card>

        <Card title="Strengths"
          className="border-l-4 border-l-brand-green-500"
        >

          <p className="text-sm text-slate-500 mb-3">
            {strengths.length} skill{strengths.length !== 1 ? "s" : ""} currently meet the required competency level.
          </p>

          {
            strengths.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                No strengths identified yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {strengths.map((s) => (
                  <li
                    key={`${s.skill_id ?? s.skill_name ?? s.name}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-brand-green-500">
                      ✓
                    </span>

                    <span className="text-slate-800">
                      {s.skill_name ?? s.name}
                    </span>
                  </li>
                ))}
              </ul>
            )
          }
        </Card>

        <Card title="Needs Improvement"
          className="border-l-4 border-l-brand-orange-500"
        >

          <p className="text-sm text-slate-500 mb-3">
            {needs.length} skill{needs.length !== 1 ? "s" : ""} require attention before you are fully prepared.
          </p>

          <ul className="space-y-2">

            {needs.map((s, index) => (

              <li
                key={`${s.name}-${index}`}
                className="flex items-center gap-2 text-sm"
              >

                <span className="text-brand-orange-500">
                  ⚠
                </span>

                <span className="text-slate-800">
                  {s.name}
                </span>

              </li>

            ))}

          </ul>

        </Card>
      </div>

      
      <Card
        title="Skill Gap Analysis"
        action={
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Low (0–40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Moderate (41–70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>High (71–100%)</span>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {breakdown.map((b) => {
            const percentage = Math.min( 100, Math.max(0, Number(b.student_level/b.required_level)*100))
            const color = `hsl(${percentage * 1.2}, 80%, 45%)`;
            return (
              <SkillBar
                key={b.skill_id}
                name={b.skill_name}
                value={percentage.toFixed(2)}
                color={color}
              />
            );

          })}
        </div>
      </Card>

      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <span>Detailed Skill Breakdown</span>
            <span className="text-sm font-normal text-slate-500 inline-block ms-5" >
              {breakdown.length} Skills Analyzed
            </span>
          </div>
        }
       >
        {breakdown.length === 0 ? (

          <div className="py-8 text-center text-slate-500">
            No skill breakdown available.
          </div>

        ) : (

          <>

            {/* Table Header */}

            <div className="grid grid-cols-12 gap-4 border-b border-slate-200 pb-3 mb-4 text-sm font-semibold text-slate-600">

              <div className="col-span-3">
                Skill
              </div>

              <div className="col-span-3">
                Progress
              </div>

              <div className="col-span-1 text-center">
                Yours
              </div>

              <div className="col-span-2 text-center">
                Required
              </div>

              <div className="col-span-1 text-center">
                Gap
              </div>

              <div className="col-span-2 text-center">
                Status
              </div>

            </div>

            {/* Skill Rows */}

            <div className="space-y-4">

              {breakdown.map((skill) => {

                const percentage = Math.round(
                  (skill.student_level / skill.required_level) * 100
                );

                const badge = getStatusBadge(skill.gap);

                const progressColor =
                  `hsl(${percentage * 1.2},80%,45%)`;

                return (

                  <div
                    key={skill.skill_id}
                    className="grid grid-cols-12 gap-4 items-center border-b border-slate-100 pb-4 last:border-none"
                  >

                    {/* Skill */}

                    <div className="col-span-3">

                      <div className="font-semibold text-slate-800">

                        {skill.skill_name}

                      </div>

                    </div>

                    {/* Progress */}

                    <div className="col-span-3">

                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">

                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: progressColor,
                          }}
                        />

                      </div>

                      <div
                        className="text-xs font-medium mt-1"
                        style={{ color: progressColor }}
                      >
                        {percentage}%
                      </div>

                    </div>

                    {/* Student Level */}

                    <div className="col-span-1 text-center font-semibold text-slate-700">

                      {skill.student_level}

                    </div>

                    {/* Required Level */}

                    <div className="col-span-2 text-center font-semibold text-slate-700">

                      {skill.required_level}

                    </div>

                    {/* Gap */}

                    <div className="col-span-1 text-center">

                      <span
                        className={
                          skill.gap === 0
                            ? "text-green-600 font-bold"
                            : "text-red-500 font-bold"
                        }
                      >
                        {skill.gap === 0 ? "0" : `-${skill.gap}`}
                      </span>

                    </div>

                    {/* Status */}

                    <div className="col-span-2 flex justify-center">

                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-semibold
                          ${badge.bg}
                          ${badge.text}
                          ${badge.border}`}
                      >
                        {badge.label}
                      </span>

                    </div>

                  </div>

                );

              })}

            </div>

          </>

        )}

      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Priority Areas" className="h-full">
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-2">
              Skills with the highest gap between your current level and role requirements:
            </p>
            {[...breakdown]
              .sort((a, b) => b.gap - a.gap)
              .slice(0, 4)
              .map((item) => (
                <div
                  key={item.skill_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div>
                    <span className="font-semibold text-sm text-slate-800">
                      {item.skill_name}
                    </span>
                    <p className="text-xs text-slate-500">
                      Level {item.student_level} / Required {item.required_level}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    Gap: -{item.gap}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        <Card title="AI Recommendations" className="h-full">
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-2">
              Targeted recommendations generated from your skill gap analysis:
            </p>
            {(live?.recommendations?.suggestions || []).slice(0, 4).map((s, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100"
              >
                <span className="text-lg">💡</span>
                <div>
                  <span className="font-semibold text-sm text-slate-900">
                    {s.skill}
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {s.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Career Readiness Summary">

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

          <div className="rounded-xl bg-slate-50 p-5 border">

            <p className="text-sm text-slate-500">
              Current Readiness
            </p>

            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {readiness}%
            </h2>

          </div>

          <div className="rounded-xl bg-slate-50 p-5 border">

            <p className="text-sm text-slate-500">
              Target Role
            </p>

            <h2 className="text-lg font-semibold mt-2">
              {domainRole}
            </h2>

          </div>

          <div className="rounded-xl bg-slate-50 p-5 border">

            <p className="text-sm text-slate-500">
              Skills Remaining
            </p>

            <h2 className="text-3xl font-bold text-red-500 mt-2">
              {skillsRemaining}
            </h2>

          </div>

          <div className="rounded-xl bg-slate-50 p-5 border">

            <p className="text-sm text-slate-500">
              Estimated Time
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-2">
              ~{Math.max(2, skillsRemaining * 3)} Weeks
            </h2>

          </div>

          <div className="rounded-xl bg-slate-50 p-5 border">

            <p className="text-sm text-slate-500">
              Next Best Action
            </p>

            <h2 className="text-sm font-semibold text-slate-800 mt-2 truncate">
              Focus on {needs[0]?.name || "Core Skills"}
            </h2>

          </div>
          
        </div>

      </Card>

      {/* Interactive AI Skill Gap Simulator */}
      <AISkillGapSimulator user={user} />

    </div>
  );
}

// ─── AI Skill Gap Simulator Component ────────────────────────────────────────
const PRESET_CAREER_ROLES = {
  'Full Stack Developer': ['React', 'Node.js', 'SQL', 'TypeScript', 'Git', 'REST APIs'],
  'AI / ML Engineer': ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Analysis', 'Docker'],
  'Cloud & DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Python'],
  'Data Scientist': ['Python', 'Statistics', 'SQL', 'Pandas', 'Data Visualization', 'Machine Learning'],
};

const COMMON_STUDENT_SKILLS = [
  'Python', 'JavaScript', 'React', 'SQL', 'Git', 'HTML/CSS',
  'Node.js', 'Docker', 'Linux', 'Data Analysis',
];

function AISkillGapSimulator() {
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [mySkills, setMySkills] = useState(['Python', 'JavaScript', 'SQL', 'Git']);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleSkill = (skill) => {
    if (mySkills.includes(skill)) {
      setMySkills(mySkills.filter((s) => s !== skill));
    } else {
      setMySkills([...mySkills, skill]);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    const required = PRESET_CAREER_ROLES[selectedRole] || [];
    try {
      const res = await aimlAnalyzeSkillGap({
        student_skills: mySkills,
        required_skills: required,
      });
      const result = res?.data?.result || res?.result || res?.data || res;
      setAnalysis(result);
    } catch (err) {
      console.warn('Skill gap API offline, using fallback computation', err);
      // Fallback computation
      const matched = required.filter((r) => mySkills.map((s) => s.toLowerCase()).includes(r.toLowerCase()));
      const missing = required.filter((r) => !mySkills.map((s) => s.toLowerCase()).includes(r.toLowerCase()));
      const readiness = Math.round((matched.length / required.length) * 100);
      setAnalysis({
        readiness_score: readiness,
        missing_skills: missing,
        matched_skills: matched,
        report: required.map((r) => ({
          skill_name: r,
          status: mySkills.map((s) => s.toLowerCase()).includes(r.toLowerCase()) ? 'Ready' : 'Needs Improvement',
          gap: mySkills.map((s) => s.toLowerCase()).includes(r.toLowerCase()) ? 0 : 2,
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border border-slate-200 shadow-sm rounded-2xl bg-white mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🧩</span> AI Career Skill Gap Simulator
          </h3>
          <p className="text-xs text-slate-500">
            Powered by the AIML Skill Gap Engine: test your skill proficiency against target industry career tracks.
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full w-fit">
          Live AI Engine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Target Career Role:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PRESET_CAREER_ROLES).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setSelectedRole(role); setAnalysis(null); }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                    selectedRole === role
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Your Acquired Skills:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_STUDENT_SKILLS.map((skill) => {
                const isSelected = mySkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading || mySkills.length === 0}
            className="w-full text-xs font-bold py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md rounded-xl"
          >
            {loading ? '⏳ Analyzing Skill Gap Matrix…' : `🚀 Analyze Gap for ${selectedRole}`}
          </Button>

          {error && <p className="text-xs text-rose-600">⚠️ {error}</p>}
        </div>

        <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
          {analysis ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Analysis Results</span>
                <span className="text-xs font-extrabold text-indigo-600">
                  {selectedRole}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
                <div className="text-xs text-slate-500">Career Readiness Score</div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  {Math.round(analysis.readiness_score || 75)}%
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(analysis.readiness_score || 75)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5">Missing Competencies:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.missing_skills || []).length > 0 ? (
                    (analysis.missing_skills || []).map((s, i) => (
                      <span key={i} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        ⚠️ {typeof s === 'string' ? s : s.skill_name || 'Skill'}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold">✓ All required skills met!</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                AI Guidance: Add course modules for missing competencies to achieve 100% role readiness.
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <span className="text-3xl mb-2">🎯</span>
              <p className="text-xs font-bold text-slate-700">No Simulation Computed</p>
              <p className="text-[11px] mt-1 max-w-xs text-slate-500">
                Choose a target role, select your acquired skills, and click Analyze to generate the gap breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
