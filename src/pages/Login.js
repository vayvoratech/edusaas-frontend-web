import React from "react";
import { SignIn } from "@clerk/react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

export default function Login() {
  const params = new URLSearchParams(window.location.search);
  const errorType = params.get("error");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* =========================================================
          GLOBAL RADIANT BACKGROUND
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-[-5rem] h-[34rem] w-[34rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* =========================================================
            BRANDING PANEL
        ========================================================== */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-blue-700 via-brand-blue-500 to-indigo-900 text-white lg:flex lg:flex-col lg:justify-between">
          {/* Decorative radiant circles */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-32 h-[32rem] w-[32rem] rounded-full bg-violet-500/25 blur-3xl" />

          <div className="pointer-events-none absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-blue-300/10 blur-3xl" />

          {/* Subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          {/* =====================================================
              BRAND
          ====================================================== */}
          <div className="relative z-10 p-8 xl:p-12">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 shadow-lg backdrop-blur-xl">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-white/30 to-white/10 text-xl font-black shadow-inner">
                E
              </div>

              <div>
                <div className="font-black tracking-tight text-lg">
                  EduSaaS
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  Career Intelligence
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              CENTER CONTENT
          ====================================================== */}
          <div className="relative z-10 px-8 pb-8 xl:px-12 xl:pb-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white/90 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Your career journey starts here
            </div>

            <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-tight xl:text-5xl">
              Close the skill gap.
              <br />
              <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
                Unlock your career.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/75 xl:text-lg">
              Personalized assessments, AI-driven learning paths, and direct
              connections to employers — all in one powerful platform.
            </p>

            {/* Feature cards */}
            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
              <div className="group rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.12]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                  <Brain className="h-5 w-5" />
                </div>

                <p className="text-sm font-bold">
                  AI-Powered Learning
                </p>

                <p className="mt-1 text-xs leading-5 text-white/55">
                  Personalized paths based on your skills.
                </p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.12]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200">
                  <Target className="h-5 w-5" />
                </div>

                <p className="text-sm font-bold">
                  Skill Assessments
                </p>

                <p className="mt-1 text-xs leading-5 text-white/55">
                  Understand where you are and what to improve.
                </p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.12]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                  <Users className="h-5 w-5" />
                </div>

                <p className="text-sm font-bold">
                  Employer Connections
                </p>

                <p className="mt-1 text-xs leading-5 text-white/55">
                  Discover opportunities aligned with your profile.
                </p>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.12]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-200">
                  <Zap className="h-5 w-5" />
                </div>

                <p className="text-sm font-bold">
                  Career Progress
                </p>

                <p className="mt-1 text-xs leading-5 text-white/55">
                  Build measurable progress toward your goals.
                </p>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Personalized experience
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                Secure authentication
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-violet-300" />
                Career focused
              </div>
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ====================================================== */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 px-8 py-5 xl:px-12">
            <span className="text-xs text-white/50">
              © 2026 EduSkill Platform
            </span>

            <div className="flex items-center gap-1.5 text-xs text-white/45">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure access
            </div>
          </div>
        </div>

        {/* =========================================================
            LOGIN PANEL
        ========================================================== */}
        <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-8 sm:px-8 lg:px-10 xl:px-16">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-blue-500/25">
              E
            </div>

            <div>
              <div className="font-black text-lg text-slate-900 dark:text-white">
                EduSaaS
              </div>

              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Career Intelligence
              </div>
            </div>
          </div>

          <div className="w-full max-w-md">
            {/* =====================================================
                HEADER
            ====================================================== */}
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-xl shadow-blue-500/20">
                <ArrowRight className="h-5 w-5" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Sign in to continue your learning and career journey.
              </p>
            </div>

            {/* =====================================================
                ERROR: SUSPENDED
            ====================================================== */}
            {errorType === "suspended" && (
              <div className="mb-5 overflow-hidden rounded-2xl border border-red-200/80 bg-red-50/90 shadow-sm dark:border-red-500/20 dark:bg-red-500/10">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-red-800 dark:text-red-300">
                      Account Suspended
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300/80">
                      Your account has been suspended by an administrator.
                      Please contact the administrator for assistance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================
                ERROR: DELETED
            ====================================================== */}
            {errorType === "deleted" && (
              <div className="mb-5 overflow-hidden rounded-2xl border border-red-200/80 bg-red-50/90 shadow-sm dark:border-red-500/20 dark:bg-red-500/10">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-red-800 dark:text-red-300">
                      Account Deleted
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300/80">
                      This account has been deleted by an administrator and
                      cannot be used.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =====================================================
                CLERK AUTH CONTAINER
            ====================================================== */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:p-5 dark:border-white/10 dark:bg-slate-900/80">
              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative">
                <SignIn
                  fallbackRedirectUrl="/onboarding"
                  signUpUrl="/signup"
                />
              </div>
            </div>

            {/* Security note */}
            <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400 dark:text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                Your account information is protected with secure
                authentication.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}