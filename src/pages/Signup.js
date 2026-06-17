import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const roles = [
  { id: 'student', label: 'Student', emoji: '🎓', desc: 'Access AI-driven learning paths, earn badges.' },
  { id: 'educator', label: 'Educator', emoji: '👩‍🏫', desc: 'Create courses, track students and skill gaps.' },
  { id: 'employer', label: 'Employer', emoji: '🏢', desc: 'Post candidate jobs to reach and upskill students.' },
  // Admin signup is intentionally hidden — admins are provisioned, not self-registered.
  // { id: 'admin', label: 'Admin', emoji: '⚙️', desc: 'Manage users, courses, and platform settings.' },
];

export default function Signup() {
  const { register, authError } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('student');
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setClientError(null);
    if (!name.trim()) return setClientError('Full name is required');
    if (password.length < 6) return setClientError('Password must be at least 6 characters');
    if (password !== confirm) return setClientError('Passwords do not match');

    setSubmitting(true);
    const ok = await register({ name: name.trim(), email: email.trim(), password, role });
    setSubmitting(false);
    if (ok) navigate('/app/dashboard');
  };

  const errorMsg = clientError || authError;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-blue-700 via-brand-blue-500 to-brand-blue-900 text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-green-500/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white/15 grid place-items-center font-bold text-xl">E</div>
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

        <div className="relative text-xs text-white/60">© 2026 EduSkill Platform</div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <div className="flex justify-end text-xs text-slate-500 mb-4">
            Already have an account?{' '}
            <Link to="/login" className="ml-1 font-semibold text-brand-blue-600 hover:underline">
              Sign in →
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">Sign up for free</h1>
          <p className="text-sm text-slate-500 mb-6">Start your learning journey today.</p>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm"
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm"
            />
          </div>

          <div className="mb-6">
            <div className="text-xs font-medium text-slate-600 mb-2">Sign up as</div>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`text-left p-3 rounded-lg border-2 transition ${
                    role === r.id
                      ? 'border-brand-blue-500 bg-brand-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{r.emoji}</span>
                    <span className="font-semibold text-sm text-slate-800">{r.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errorMsg}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Signing up…' : 'Sign up'}
          </Button>

          <p className="mt-3 text-center text-[11px] text-slate-500">
            By signing up, you agree to{' '}
            <span className="text-brand-blue-600">Terms of Service</span> and{' '}
            <span className="text-brand-blue-600">Privacy Policy</span>.
          </p>
        </form>
      </div>
    </div>
  );
}
