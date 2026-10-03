import React from 'react';
import { SignUp, useUser } from '@clerk/react';
import { Navigate } from 'react-router-dom';
import {
  Award,
  Brain,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';

export default function Signup() {
  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* ================================================================ */}
      {/* Ambient Background                                               */}
      {/* ================================================================ */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[34rem] w-[34rem] rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* ================================================================ */}
        {/* Branding Panel                                                   */}
        {/* ================================================================ */}

        <div className="relative hidden overflow-hidden lg:flex">
          {/* Main gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#071A4D] via-[#123B9A] to-[#4C1D95]" />

          {/* Radiant overlays */}
          <div className="absolute -right-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl" />

          {/* Decorative circles */}
          <div className="absolute -right-24 top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-10 top-38 h-40 w-40 rounded-full border border-white/10" />
          <div className="absolute bottom-16 left-[-5rem] h-48 w-48 rounded-full border border-white/10" />

          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />

          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-10 xl:p-14">
            {/* ========================================================== */}
            {/* Logo                                                        */}
            {/* ========================================================== */}

            <div>
              <div className="inline-flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-cyan-300/30 blur-md" />

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div>
                  <div className="text-xl font-black tracking-tight text-white">
                    EduSaaS
                  </div>

                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    Learn â€¢ Build â€¢ Grow
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================== */}
            {/* Main Message                                                */}
            {/* ========================================================== */}

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/90 shadow-lg backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Your career journey starts here
              </div>

              <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-white xl:text-6xl">
                Close the
                <span className="block bg-gradient-to-r from-cyan-200 via-blue-200 to-violet-200 bg-clip-text text-transparent">
                  skill gap.
                </span>

                <span className="block">Unlock your career.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/70 xl:text-lg">
                Personalized assessments, AI-driven learning paths, practical
                projects, and direct connections to employers â€” all in one
                platform.
              </p>

              {/* Feature cards */}
              <div className="mt-9 grid max-w-lg grid-cols-2 gap-3">
                <FeatureCard
                  icon={Brain}
                  title="AI Learning"
                  text="Personalized paths"
                />

                <FeatureCard
                  icon={Target}
                  title="Skill Assessment"
                  text="Know your strengths"
                />

                <FeatureCard
                  icon={Award}
                  title="Certification"
                  text="Showcase your skills"
                />

                <FeatureCard
                  icon={Users}
                  title="Career Network"
                  text="Connect with employers"
                />
              </div>
            </div>

            {/* ========================================================== */}
            {/* Bottom                                                       */}
            {/* ========================================================== */}

            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <div className="text-xs text-white/45">
                Â© 2026 EduSkill Platform
              </div>

              <div className="flex items-center gap-2 text-xs text-white/45">
                <Zap className="h-3.5 w-3.5" />
                Built for career growth
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Mobile Branding                                                  */}
        {/* ================================================================ */}

        <div className="relative overflow-hidden bg-gradient-to-br from-[#071A4D] via-[#123B9A] to-[#4C1D95] px-6 py-8 lg:hidden">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <div className="text-lg font-black text-white">
                  EduSaaS
                </div>

                <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Learn â€¢ Build â€¢ Grow
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Start your journey
              </div>

              <h1 className="mt-4 text-3xl font-black leading-tight text-white">
                Close the skill gap.
                <span className="block bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-transparent">
                  Unlock your career.
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
                Learn, assess your skills, build projects, and move toward your
                career goals.
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Signup Area                                                       */}
        {/* ================================================================ */}

        <div className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10 xl:px-16">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl" />

          <div className="relative w-full max-w-[460px]">
            {/* Welcome header */}
            <div className="mb-7 text-center lg:text-left">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/20 lg:hidden">
                <GraduationCap className="h-6 w-6" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join EduSaaS and start building the skills for your next
                opportunity.
              </p>
            </div>

            {/* Clerk container */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10 blur-xl" />

              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-1 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                <div className="rounded-[1.35rem] bg-white px-2 py-2 sm:px-4">
                  <SignUp
                    fallbackRedirectUrl="/onboarding"
                    signInUrl="/login"
                  />
                </div>
              </div>
            </div>

            {/* Security / trust strip */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                Secure account creation powered by Clerk
              </span>
            </div>

            {/* Mobile footer */}
            <div className="mt-8 text-center text-[11px] text-slate-400 lg:hidden">
              Â© 2026 EduSkill Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Feature Card                                                               */
/* ========================================================================== */

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.11]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-white">
            {title}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-white/45">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}