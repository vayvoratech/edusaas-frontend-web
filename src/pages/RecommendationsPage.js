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
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  getMyRecommendations,
  enrollCourse,
  getMyEnrollments,
} from "../services/api";

const iconFor = (title) => {
  const t = title.toLowerCase();
  if (t.includes("python")) return "🐍";
  if (t.includes("sql")) return "🗄️";
  if (t.includes("machine")) return "🤖";
  if (t.includes("deep")) return "🧠";
  if (t.includes("git")) return "🌿";
  return "📘";
};

const recommendationSummary = {
  readiness: 18,
  strengths: ["Python", "Machine Learning"],
  improvements: ["SQL", "Deep Learning"],
  roadmap: [
    "SQL Fundamentals",
    "Python Programming",
    "Machine Learning",
    "Deep Learning",
    "AI Projects",
  ],
  skills: [
    { name: "Python", score: 15, color: "bg-green-500" },
    { name: "SQL", score: 23, color: "bg-red-500" },
    { name: "Machine Learning", score: 7, color: "bg-blue-500" },
    { name: "Deep Learning", score: 41, color: "bg-yellow-500" },
    { name: "Git", score: 30, color: "bg-indigo-500" },
  ],
};

export default function RecommendationsPage() {
  const [recs, setRecs] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const [r, e] = await Promise.all([
          getMyRecommendations(),
          getMyEnrollments().catch(() => []),
        ]);
        setRecs(r);
        setEnrolledIds(new Set(e.map((x) => x.course_id)));
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    })();
  }, []);

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

  return (
    <div className="space-y-8">
      {/* HERO */}
      <Card className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 text-white overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="pl-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
              🚀 AI Engineer Career Path
            </div>
            <h1 className="text-4xl font-bold mt-5">
              Personalized AI Learning Recommendations
            </h1>
            <p className="mt-4 text-blue-100 max-w-2xl">
              Based on your Initial Skill Assessment, our AI recommends the
              next concepts, technologies and projects to accelerate your
              journey towards becoming an AI Engineer.
            </p>
            <div className="flex gap-3 mt-8 flex-wrap">
              <span className="bg-green-500/30 px-4 py-2 rounded-full">
                💪 Strong : Python
              </span>
              <span className="bg-green-500/30 px-4 py-2 rounded-full">
                🤖 Strong : Machine Learning
              </span>
              <span className="bg-red-500/30 px-4 py-2 rounded-full">
                🔥 Improve : SQL
              </span>
              <span className="bg-red-500/30 px-4 py-2 rounded-full">
                🧠 Improve : Deep Learning
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center">
            <div className="w-44 h-44 rounded-full border-8 border-white/20 flex flex-col justify-center items-center bg-white/10 backdrop-blur">
              <span className="text-5xl font-bold">
                {recommendationSummary.readiness}%
              </span>
              <span className="text-sm text-blue-100">Readiness</span>
            </div>
          </div>
        </div>
      </Card>

      {/* SKILL PROFILE */}
      <Card>
        <h2 className="text-xl font-bold mb-6">📊 Skill Profile</h2>
        <div className="space-y-5">
          {recommendationSummary.skills.map((skill) => (
            <div key={skill.name}>
              <div className="flex justify-between text-sm mb-2">
                <span>{skill.name}</span>
                <span>{skill.score}%</span>
              </div>
              <div className="h-3 rounded-full bg-gray-200">
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
        <h2 className="text-xl font-bold mb-6">🛣 Recommended Learning Roadmap</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {recommendationSummary.roadmap.map((step, index) => (
            <div key={step} className="relative">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center h-full">
                <div className="text-3xl">{index + 1}</div>
                <div className="font-semibold mt-3">{step}</div>
              </div>
              {index !== recommendationSummary.roadmap.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 text-3xl">
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
                    <div className="font-bold">8 Hours</div>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3 text-center">
                    <div className="text-xs text-gray-500">Projects</div>
                    <div className="font-bold">5</div>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3 text-center">
                    <div className="text-xs text-gray-500">Rating</div>
                    <div className="font-bold">⭐ 4.8</div>
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

        {recs.length === 0 && (
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
