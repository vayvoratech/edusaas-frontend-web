import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkillBar } from '../components/ui/SkillBar';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, fetchGapReport } from '../services/api';
import {
  skills,
  learningHistory,
  missingSkills,
  recommendations,
  gapReport,
} from '../mocks/data';

const recIcons = { Take: '🎯', Learn: '📘', Project: '🚀' };

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [live, setLive] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    getUserProfile(user.id).then(setProfile).catch(() => {});
    fetchGapReport(user.id).then(setLive).catch(() => {});
  }, [user?.id]);

  const readiness = live?.readiness_score ?? gapReport.readiness;
  const gaps = live?.missing_skills?.length ? live.missing_skills : missingSkills;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Education SaaS Profile Board</h2>
        <p className="text-sm text-slate-500">
          A complete picture of who you are, what you&apos;ve learned, and what&apos;s next.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <div className="text-center">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-28 h-28 rounded-full mx-auto object-cover ring-4 ring-brand-blue-100"
            />
            <h3 className="mt-3 font-bold text-lg text-slate-900">{profile?.name || user?.name}</h3>
            <div className="text-xs px-2 py-0.5 rounded-full bg-brand-blue-100 text-brand-blue-700 inline-block mt-1">
              {profile?.role || user?.role}
            </div>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <div>
              <div className="text-xs text-slate-500">Institution</div>
              <div className="font-medium text-slate-800">{user?.institution}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Location</div>
              <div className="font-medium text-slate-800">📍 {user?.location}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Career Goal</div>
              <div className="font-medium text-slate-800">{user?.careerGoal}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Email</div>
              <div className="font-medium text-slate-800 break-all">{profile?.email || user?.email}</div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-5">
            Edit Profile
          </Button>
        </Card>

        <Card title="Skill Inventory" className="lg:col-span-2">
          <div className="space-y-4 mb-6">
            {skills.map((s) => (
              <SkillBar key={s.name} {...s} />
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-semibold text-sm text-slate-700 mb-3">Learning History</h4>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Completed</div>
                <ul className="space-y-1.5">
                  {learningHistory.completed.map((c) => (
                    <li key={c.title} className="flex items-center gap-2">
                      <span className="text-brand-green-500">✓</span>
                      <span>{c.title}</span>
                      <span className="text-xs text-slate-400">({c.provider})</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">In Progress</div>
                <ul className="space-y-2">
                  {learningHistory.inProgress.map((c) => (
                    <li key={c.title}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>{c.title}</span>
                        <span className="font-semibold">{c.percent}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-blue-500"
                          style={{ width: `${c.percent}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Gap Analysis">
          <div className="mb-3 text-sm text-slate-600">
            Target Role: <span className="font-semibold text-slate-800">{user?.careerGoal}</span>
          </div>
          <div className="mb-4 text-sm">
            Gap Score:{' '}
            <span className="text-brand-orange-600 font-bold">{readiness}% Readiness</span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Missing Skills</div>
            <ul className="space-y-1.5 text-sm">
              {gaps.map((s) => (
                <li key={s} className="flex items-center gap-2 text-slate-700">
                  <span className="text-brand-orange-500">⚠</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Recommendations">
          <ul className="space-y-3">
            {recommendations.map((r) => (
              <li key={r.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-orange-100 grid place-items-center text-lg">
                  {recIcons[r.kind]}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {r.kind}
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{r.title}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
