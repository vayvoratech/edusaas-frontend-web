import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, StatPill } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Gauge } from '../components/ui/Gauge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getJobs, getNotifications, fetchGapReport } from '../services/api';
import {
  recentScores,
  missingSkills,
  recommendations,
  learningPath,
  jobOpportunities,
  skillGapTrend,
} from '../mocks/data';

const courseIcons = {
  aws: '☁️',
  devops: '⚙️',
  k8s: '🐳',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [liveJobs, setLiveJobs] = useState(null);
  const [liveGap, setLiveGap] = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [jobs, notifs] = await Promise.all([getJobs(), getNotifications().catch(() => [])]);
        if (cancelled) return;
        setLiveJobs(jobs);
        setNotifCount(notifs.filter((n) => !n.read_status).length);
      } catch (e) {
        // backend unreachable — keep mocks
      }
      if (user?.id) {
        try {
          const gap = await fetchGapReport(user.id);
          if (!cancelled) setLiveGap(gap);
        } catch (e) { /* ignore */ }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const readiness = liveGap?.readiness_score ?? user?.readiness ?? 0;
  const topGaps = liveGap?.missing_skills?.length ? liveGap.missing_skills : missingSkills;
  const jobsToShow = liveJobs?.length
    ? liveJobs.slice(0, 3).map((j) => ({ role: j.title, count: 1, action: 'View / Apply' }))
    : jobOpportunities;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-brand-blue-500 via-brand-blue-600 to-brand-blue-700 text-white border-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/70">
              Welcome back
            </div>
            <h2 className="text-2xl font-bold">{user?.firstName || user?.name}, you&apos;re {readiness}% ready 🚀{notifCount > 0 ? ` · ${notifCount} new` : ''}</h2>
            <div className="text-sm text-white/80 mt-1">
              You&apos;ve completed {user?.coursesCompleted} courses. Target role:{' '}
              <span className="font-semibold">{user?.careerGoal}</span>.
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={readiness} size={88} />
            <Link to="/app/learning-paths">
              <Button variant="accent">Continue Learning →</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Your Progress" action={<StatPill value="On track" tone="green" />}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Courses Completed</span>
                <span className="font-semibold">{user?.coursesCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Skills Readiness</span>
                <span className="font-bold text-brand-green-600">{readiness}%</span>
              </div>
            </div>
            <Link to="/app/learning-paths">
              <Button className="w-full">Continue Learning</Button>
            </Link>
          </div>
        </Card>

        <Card
          title="Skill Assessment"
          action={
            <Link to="/app/assessments">
              <Button variant="success" size="sm">Take Assessment</Button>
            </Link>
          }
        >
          <div className="text-xs text-slate-500 mb-2">Recent Scores</div>
          <div className="space-y-2">
            {recentScores.map((s) => (
              <div key={s.subject} className="flex items-center gap-3">
                <div className="w-20 text-sm text-slate-700">{s.subject}</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-blue-500"
                    style={{ width: `${s.score}%` }}
                  />
                </div>
                <div className="w-10 text-right text-xs font-semibold">{s.score}%</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Gap Analysis" className="sm:col-span-2 lg:col-span-1">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Gauge value={readiness} size={140} label="Readiness" />
            <div className="flex-1 text-xs w-full">
              <div className="font-semibold text-slate-700 mb-1">Top Gaps</div>
              <ul className="space-y-1">
                {topGaps.map((s) => (
                  <li key={s} className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange-500" />
                    {s}
                  </li>
                ))}
              </ul>
              <Link
                to="/app/gap-report"
                className="inline-block mt-2 text-brand-blue-600 hover:underline font-medium"
              >
                View Full Report →
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Continue Learning" className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {learningPath.steps.map((step) => (
              <div
                key={step.title}
                className="p-4 rounded-xl border border-slate-200 hover:border-brand-blue-300 hover:shadow-sm transition"
              >
                <div className="text-2xl mb-2">{courseIcons[step.icon]}</div>
                <div className="font-semibold text-sm text-slate-800">{step.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{step.provider} · {step.duration}</div>
                <div className="mt-3">
                  {step.status === 'enrolled' ? (
                    <Button size="sm" className="w-full">Continue</Button>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full">Start Course</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Job Opportunities">
          <div className="space-y-3">
            {jobsToShow.map((j) => (
              <div
                key={j.role}
                className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                <div className="font-semibold text-sm text-slate-800">{j.role}</div>
                <div className="text-xs text-slate-500 mb-2">{j.count} positions</div>
                <Button size="sm" variant="outline" className="w-full">
                  {j.action}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Achievements">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Python Basics', desc: 'Python Basics', icon: '🐍', tone: 'bg-brand-blue-50 text-brand-blue-700' },
            { name: 'Project Completed', desc: 'Deer Consequmen!', icon: '🏆', tone: 'bg-brand-orange-100 text-brand-orange-700' },
            { name: 'Excel Certified', desc: 'Power user', icon: '📊', tone: 'bg-brand-green-100 text-brand-green-700' },
            { name: 'SQL Pro', desc: 'Top 10% scorer', icon: '🗄️', tone: 'bg-slate-100 text-slate-700' },
            { name: '5-Day Streak', desc: 'Consistent learner', icon: '🔥', tone: 'bg-brand-orange-50 text-brand-orange-700' },
          ].map((b) => (
            <div
              key={b.name}
              className={`p-3 rounded-xl border border-slate-200 flex items-start gap-3 hover:shadow-sm transition ${b.tone}`}
            >
              <div className="text-2xl leading-none">{b.icon}</div>
              <div>
                <div className="font-semibold text-sm">{b.name}</div>
                <div className="text-[11px] opacity-75 leading-snug">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Skill Trend" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={skillGapTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="python" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="aws" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" dataKey="devops" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recommendations">
          <ul className="space-y-3">
            {recommendations.map((r) => (
              <li key={r.title} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg grid place-items-center text-sm font-bold ${
                    r.kind === 'Take'
                      ? 'bg-brand-blue-100 text-brand-blue-700'
                      : r.kind === 'Learn'
                      ? 'bg-brand-green-100 text-brand-green-600'
                      : 'bg-brand-orange-100 text-brand-orange-600'
                  }`}
                >
                  {r.kind[0]}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {r.kind}
                  </div>
                  <div className="text-sm font-medium text-slate-800">{r.title}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
