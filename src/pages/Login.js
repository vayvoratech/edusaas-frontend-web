import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function Login() {
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login({ email, password });
    setSubmitting(false);
    if (ok) navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-blue-700 via-brand-blue-500 to-brand-blue-900 text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-green-500/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white/15 grid place-items-center font-bold text-xl">
              E
            </div>
            <span className="font-bold text-lg">EduSaaS</span>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Close the skill gap.<br />Unlock your career.
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            Personalized assessments, AI-driven learning paths, and direct connections to employers — all in one platform.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              ['68%', 'avg. readiness'],
              ['1,250', 'active learners'],
              ['450+', 'courses'],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold">{n}</div>
                <div className="text-xs text-white/70">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/60">
          © 2026 EduSaaS Platform
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-8">
            Sign in to continue your learning journey.
          </p>

          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm"
            />
          </div>

          {authError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {authError}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in →'}
          </Button>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-blue-600 hover:underline">
              Sign up →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
