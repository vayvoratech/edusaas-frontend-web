import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom'
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Gauge } from '../components/ui/Gauge';
import { SkillBar } from '../components/ui/SkillBar';
import { useAuth } from '../context/AuthContext';
import { fetchGapReport } from '../services/api';

export default function GapReport() {
  const navigate = useNavigate()
  const { user } = useAuth();
  const [live, setLive] = useState(null);
  

  useEffect(() => {
    if (!user?.id) return;
    fetchGapReport(user.id).then(setLive).catch(() => { /* fall back to mock */ });
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
              onClick={() => navigate("/app/initial-assessment")}
            >
              Take Assessment
            </Button>

          </div>

        </Card>

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

  const domainRole = user?.domain_role || "Target Role";
  const skillsRemaining = needs.length;


  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div>  
          <h2 className="text-2xl font-bold text-slate-900">Gap Analysis Report</h2>
          <p className="text-sm text-slate-500">
            Your skills vs. the requirements for Cloud Engineer roles.
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
          <div className="flex flex-col items-center justify-center py-12 h-full">

            {/* <div className="text-5xl mb-4"> 🎯 </div> */}

            <h3 className="text-lg font-semibold text-slate-800"> AI Priority Ranking </h3>

            <p className="mt-3 text-center text-slate-500 max-w-lg">
              Skill priority recommendation to learn
            </p>

          </div>
        </Card>

        <Card title="AI Recommendations" className="h-full">
          <div className="flex flex-col items-center justify-center py-12 h-full">

            {/* <div className="text-5xl mb-4"> 🤖 </div> */}

            <h3 className="text-lg font-semibold text-slate-800"> Personalized Learning Roadmap </h3>

            <p className="mt-3 text-center text-slate-500 max-w-lg">
              AI recommendation for learning based on skill gap
            </p>
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

            <h2 className="text-lg font-semibold text-slate-400 mt-2">
              AI generated road map
            </h2>

          </div>

          <div className="rounded-xl bg-slate-50 p-5 border">

            <p className="text-sm text-slate-500">
              Next Best Action
            </p>

            <h2 className="text-lg font-semibold text-slate-400 mt-2">
              Recommendation engine
            </h2>

          </div>
          
        </div>

      </Card>

    </div>
  );
}
