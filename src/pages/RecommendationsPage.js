// import React, { useEffect, useState } from 'react';
// import { Card } from '../components/ui/Card';
// import { Button } from '../components/ui/Button';
// import { getMyRecommendations, enrollCourse, getMyEnrollments } from '../services/api';

// const iconFor = (c) => {
//   const t = (c?.title || '').toLowerCase();
//   if (t.includes('python')) return '🐍';
//   if (t.includes('data')) return '📊';
//   if (t.includes('soft')) return '💬';
//   if (t.includes('machine')) return '🤖';
//   return '📘';
// };

// export default function RecommendationsPage() {
//   const [recs, setRecs] = useState([]);
//   const [enrolledIds, setEnrolledIds] = useState(new Set());
//   const [busyId, setBusyId] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         const [r, e] = await Promise.all([
//           getMyRecommendations(),
//           getMyEnrollments().catch(() => []),
//         ]);
//         setRecs(r);
//         setEnrolledIds(new Set(e.map((x) => x.course_id)));
//       } catch (err) {
//         setError(err.response?.data?.error || err.message);
//       }
//     })();
//   }, []);

//   const onEnroll = async (courseId) => {
//     setBusyId(courseId);
//     try {
//       await enrollCourse(courseId);
//       setEnrolledIds((prev) => new Set(prev).add(courseId));
//     } catch (err) {
//       setError(err.response?.data?.error || err.message);
//     } finally {
//       setBusyId(null);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold text-slate-900">Course Recommendations</h2>
//         <p className="text-sm text-slate-500">Picked for you based on your progress and goals.</p>
//       </div>

//       {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//         {recs.map((r) => {
//           const enrolled = enrolledIds.has(r.course_id);
//           const c = r.course;
//           if (!c) return null;
//           return (
//             <Card key={r.id}>
//               <div className="flex items-start gap-3">
//                 <div className="text-4xl">{iconFor(c)}</div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-bold text-slate-900">{c.title}</h3>
//                   <div className="text-[11px] uppercase text-slate-400 mt-0.5">
//                     Difficulty: {c.difficulty || 'beginner'}
//                   </div>
//                   {r.reason && (
//                     <p className="text-sm text-slate-600 mt-2">{r.reason}</p>
//                   )}
//                 </div>
//               </div>
//               <div className="flex gap-2 mt-4">
//                 {enrolled ? (
//                   <Button variant="success" className="flex-1" disabled>✓ Enrolled</Button>
//                 ) : (
//                   <Button
//                     className="flex-1"
//                     onClick={() => onEnroll(c.id)}
//                     disabled={busyId === c.id}
//                   >
//                     {busyId === c.id ? 'Enrolling…' : 'Enroll Now →'}
//                   </Button>
//                 )}
//                 <Button variant="outline">Preview</Button>
//               </div>
//             </Card>
//           );
//         })}
//       </div>

//       {recs.length === 0 && (
//         <Card>
//           <p className="text-sm text-slate-500 text-center py-6">
//             No recommendations yet. Take more assessments to unlock personalized picks.
//           </p>
//         </Card>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import {
  getMyRecommendations,
  enrollCourse,
  getMyEnrollments,
  fetchGapReport,
} from "../services/api";

const iconFor = (title) => {
  const t = (title || "").toLowerCase();
  if (t.includes("python")) return "🐍";
  if (t.includes("sql")) return "🗄️";
  if (t.includes("machine")) return "🤖";
  if (t.includes("deep")) return "🧠";
  if (t.includes("git")) return "🌿";
  if (t.includes("preprocess") || t.includes("data")) return "📊";
  if (t.includes("stat")) return "📈";
  return "📘";
};

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recs, setRecs] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [learningPathway, setLearningPathway] = useState([]);
  const [gapData, setGapData] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        let currentUserId = user?.id;
        try {
          const stored = JSON.parse(localStorage.getItem("edu_user") || "{}");
          if (stored?.id) currentUserId = stored.id;
        } catch (e) {}

        const [r, e, gap] = await Promise.all([
          getMyRecommendations(),
          getMyEnrollments().catch(() => []),
          currentUserId
            ? fetchGapReport(currentUserId).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (gap) {
          setGapData(gap);
        }

        const list = Array.isArray(r) ? r : [];
        const aiItem = list.find(
          (x) => x.type === "ai_suggestions" || x.source === "ai"
        );
        if (aiItem) {
          setAiRecs(aiItem.suggestions || []);
          if (
            Array.isArray(aiItem.learning_pathway) &&
            aiItem.learning_pathway.length > 0
          ) {
            setLearningPathway(aiItem.learning_pathway);
          }
        }
        setRecs(list.filter((x) => x.type !== "ai_suggestions"));
        setEnrolledIds(new Set(e.map((x) => x.course_id)));
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    })();
  }, [user?.id]);

  const onEnroll = async (courseId) => {
    setBusyId(courseId);
    try {
      await enrollCourse(courseId);
      setEnrolledIds((prev) => {
        const next = new Set(prev);
        next.add(courseId);
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBusyId(null);
    }
  };

  // --- Dynamic Derivations from Live Assessment Gap Data ---
  const skillGapList = gapData?.recommendations?.skill_gap || [];
  const hasAssessment = Boolean(gapData && skillGapList.length > 0);

  // Target Domain / Career Path
  let userDomainName = "AI Engineer";
  try {
    const stored = JSON.parse(localStorage.getItem("edu_user") || "{}");
    if (stored?.domain_role_name) userDomainName = stored.domain_role_name;
  } catch (e) {}

  if (!hasAssessment) {
    return (
      <div className="space-y-8">
        {/* HERO */}
        <Card className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 text-white overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                🚀 {userDomainName} Career Path
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mt-4">
                Personalized AI Learning Recommendations
              </h1>
              <p className="mt-3 text-blue-100 max-w-2xl text-sm sm:text-base leading-relaxed">
                Your initial assessment has been reset. Complete the Initial Skill Assessment to generate your personalized AI skill profile, readiness score, learning roadmap, and course recommendations.
              </p>
              <div className="mt-6">
                <Link
                  to="/app/assessments/initial"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-blue-700 font-bold hover:bg-blue-50 transition shadow-md text-sm"
                >
                  <span>Start Initial Assessment</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center shrink-0">
              <div className="w-40 h-40 rounded-full border-8 border-white/20 flex flex-col justify-center items-center bg-white/10 backdrop-blur shadow-inner">
                <span className="text-4xl font-bold">--</span>
                <span className="text-xs text-blue-100 mt-1">Not Assessed</span>
              </div>
            </div>
          </div>
        </Card>

        {/* EMPTY SKILL PROFILE & ROADMAP */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">📊 Skill Profile</h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                Pending Assessment
              </span>
            </div>
            <div className="py-10 text-center flex flex-col items-center">
              <div className="text-5xl mb-3">📈</div>
              <h3 className="font-semibold text-slate-800 text-base">No Skill Scores Available</h3>
              <p className="text-slate-500 text-xs max-w-sm mt-2">
                Your individual skill levels and scores will be evaluated and visualized here once you complete the Initial Assessment.
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">🛣 Learning Roadmap</h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                Pending Assessment
              </span>
            </div>
            <div className="py-10 text-center flex flex-col items-center">
              <div className="text-5xl mb-3">🗺️</div>
              <h3 className="font-semibold text-slate-800 text-base">Roadmap Locked</h3>
              <p className="text-slate-500 text-xs max-w-sm mt-2">
                Our AI generates a custom, step-by-step roadmap targeted directly at your detected skill gaps after testing.
              </p>
            </div>
          </Card>
        </div>

        {/* EMPTY COURSES SECTION */}
        <Card>
          <div className="py-12 text-center flex flex-col items-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-slate-900">
              Personalized Recommendations Awaiting Assessment
            </h3>
            <p className="text-slate-500 max-w-md mt-2 text-sm">
              We analyze your assessment performance to suggest the best courses to bridge your skill gaps for {userDomainName}.
            </p>
            <Link
              to="/app/assessments/initial"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition text-sm"
            >
              Take Initial Assessment
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Live readiness score
  const readinessScore = Math.round(gapData.readiness_score ?? 0);

  // Live skills with percentage and distinct palette colors
  const colorPalette = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-teal-500",
  ];

  const dynamicSkills = skillGapList.map((item, idx) => {
    const maxLevel = item.required_level || 4;
    const pct = Math.min(
      100,
      Math.round(((item.student_level || 0) / maxLevel) * 100)
    );
    return {
      name: item.skill_name,
      score: pct,
      studentLevel: item.student_level,
      requiredLevel: item.required_level,
      status: item.status,
      color: colorPalette[idx % colorPalette.length],
    };
  });

  // Strengths and Improvements
  const readySkills = dynamicSkills.filter(
    (s) => s.status === "Ready" || s.score >= 60
  );
  const sortedByScore = [...dynamicSkills].sort((a, b) => b.score - a.score);

  // Top 2 relative strengths
  const strengthsList =
    readySkills.length > 0 ? readySkills.slice(0, 2) : sortedByScore.slice(0, 2);

  // Bottom 2 improvement areas
  const needSkills = dynamicSkills.filter(
    (s) => s.status === "Needs Improvement" || s.score < 60
  );
  const sortedAscending = [...dynamicSkills].sort((a, b) => a.score - b.score);
  const improvementsList =
    needSkills.length > 0 ? needSkills.slice(0, 2) : sortedAscending.slice(0, 2);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <Card className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 text-white overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="pl-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
              🚀 {userDomainName} Career Path
            </div>
            <h1 className="text-4xl font-bold mt-5">
              Personalized AI Learning Recommendations
            </h1>
            <p className="mt-4 text-blue-100 max-w-2xl">
              Based on your Initial Skill Assessment, our AI recommends the
              next concepts, technologies and projects to accelerate your
              journey towards becoming an {userDomainName}.
            </p>
            <div className="flex gap-3 mt-8 flex-wrap">
              {strengthsList.map((s) => (
                <span
                  key={`str-${s.name}`}
                  className="bg-green-500/30 border border-green-300/30 px-4 py-2 rounded-full text-sm font-medium"
                >
                  💪 Strong : {s.name} ({s.score}%)
                </span>
              ))}
              {improvementsList.map((s) => (
                <span
                  key={`imp-${s.name}`}
                  className="bg-red-500/30 border border-red-300/30 px-4 py-2 rounded-full text-sm font-medium"
                >
                  🔥 Improve : {s.name} ({s.score}%)
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center items-center">
            <div className="w-44 h-44 rounded-full border-8 border-white/20 flex flex-col justify-center items-center bg-white/10 backdrop-blur shadow-inner">
              <span className="text-5xl font-bold">{readinessScore}%</span>
              <span className="text-sm text-blue-100">Readiness</span>
            </div>
          </div>
        </div>
      </Card>

      {/* SKILL PROFILE */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">📊 Skill Profile</h2>
          {gapData ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
              ✓ Live Assessment Data
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
              Initial Profile
            </span>
          )}
        </div>
        <div className="space-y-5">
          {dynamicSkills.map((skill) => (
            <div key={skill.name}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">{skill.name}</span>
                <span className="font-semibold text-slate-900">{skill.score}%</span>
              </div>
              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`${skill.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${skill.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ROADMAP */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            🛣 Recommended Learning Roadmap
          </h2>
          {learningPathway.length > 0 ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
              🤖 Dynamic AI Pathway
            </span>
          ) : gapData?.missing_skills?.length > 0 ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
              🎯 Skill Gap Pathway
            </span>
          ) : null}
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {(learningPathway.length > 0
            ? learningPathway.map((item) =>
                typeof item === "string"
                  ? item
                  : item.course_name || item.title || item.step || JSON.stringify(item)
              )
            : gapData?.missing_skills?.length > 0
            ? gapData.missing_skills.map((s) => `${s} Mastery`)
            : []
          ).map((step, index, arr) => (
            <div key={step + index} className="relative">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center h-full flex flex-col justify-center items-center">
                <div className="text-3xl font-bold text-blue-600">
                  {index + 1}
                </div>
                <div className="font-semibold mt-3 text-sm text-slate-800">
                  {step}
                </div>
              </div>
              {index !== arr.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 text-2xl text-blue-300">
                  ➜
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* COURSE SECTION */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold">📚 Recommended Courses</h2>
            <p className="text-gray-500">
              Prioritized according to your assessment.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 rounded-lg p-4 mb-4">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {recs.map((r) => {
            const course = r.course;
            if (!course) return null;
            const enrolled = enrolledIds.has(course.id);

            return (
              <Card
                key={course.id}
                className="hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="text-5xl">{iconFor(course.title)}</div>

                    <div>
                      <h3 className="font-bold text-xl">{course.title}</h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                          {course.difficulty || "Beginner"}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                          ⭐ AI Recommended
                        </span>
                        <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs">
                          🎯 High Priority
                        </span>
                      </div>

                      <p className="text-gray-600 mt-4">
                        {r.reason ||
                          "Recommended based on your AI Engineer assessment and current skill profile."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="rounded-lg bg-gray-100 p-3 text-center">
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-bold">
                      {course.duration_hours
                        ? `${course.duration_hours}h`
                        : (course.difficulty || "").toLowerCase() === "advanced"
                        ? "12 Hours"
                        : "6 Hours"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3 text-center">
                    <div className="text-xs text-gray-500">Category</div>
                    <div className="font-bold truncate text-xs sm:text-sm px-1">
                      {course.category || "AI / Tech"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3 text-center">
                    <div className="text-xs text-gray-500">Rating</div>
                    <div className="font-bold">⭐ {course.rating || "4.8"}</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  {enrolled ? (
                    <Button variant="success" disabled className="flex-1">
                      ✓ Enrolled
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => onEnroll(course.id)}
                      disabled={busyId === course.id}
                    >
                      {busyId === course.id ? "Enrolling..." : "Enroll Now →"}
                    </Button>
                  )}
                  <Button variant="outline">Preview</Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* AI MODEL SUGGESTIONS */}
        {aiRecs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🤖</span> AI Personalized Course Suggestions
              <span className="text-xs font-normal text-gray-500">
                (Generated via hybrid collaborative filtering & content vectors)
              </span>
            </h3>
            <div className="grid lg:grid-cols-2 gap-6">
              {aiRecs.map((aiCourse, idx) => (
                <Card
                  key={aiCourse.course_id || idx}
                  className="hover:shadow-xl transition-all duration-300 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="text-5xl">{iconFor(aiCourse.course_name || "")}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xl">{aiCourse.course_name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            Confidence: {Math.round((aiCourse.confidence_score || 0.85) * 100)}%
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            {aiCourse.difficulty || "Beginner"}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                            {aiCourse.category || "AI / Data Science"}
                          </span>
                          {aiCourse.prerequisite_completed && (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                              ✓ Prerequisites Met
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-4 text-sm">
                          {aiCourse.recommendation_reason ||
                            "Recommended by AI collaborative filtering model."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {recs.length === 0 && aiRecs.length === 0 && (
          <Card>
            <div className="py-12 text-center">
              <div className="text-6xl">🤖</div>
              <h3 className="text-xl font-bold mt-4">
                Generating AI Recommendations...
              </h3>
              <p className="text-gray-500 mt-3">
                Complete more learning activities to unlock highly
                personalized recommendations.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
