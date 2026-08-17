// This component renders the signup page, allowing new users to register by providing their details and choosing a role.
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { getDomainRoles } from '../services/api';

// Constants
const roles = [
  { id: 'student', label: 'Student', emoji: '🎓', desc: 'Access AI-driven learning paths, earn badges.' },
  { id: 'educator', label: 'Educator', emoji: '👩‍🏫', desc: 'Create courses, track students and skill gaps.' },
  { id: 'employer', label: 'Employer', emoji: '🏢', desc: 'Post candidate jobs to reach and upskill students.' },
  // Admin signup is intentionally hidden — admins are provisioned, not self-registered.
  { id: 'admin', label: 'Admin', emoji: '⚙️', desc: 'Manage users, courses, and platform settings.' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordCriteria = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'At least one number', test: (p) => /\d/.test(p) },
  { label: 'At least one special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// Sub-components for better organization
const BrandingPanel = () => (
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
);

const PasswordStrengthIndicator = ({ password }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 px-1">
    {passwordCriteria.map((criterion, index) => (
      <div key={index} className={`flex items-center text-xs transition-colors ${criterion.test(password) ? 'text-green-600' : 'text-slate-500'}`}>
        {criterion.test(password) ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 flex-shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 flex-shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
          </svg>
        )}
        <span>{criterion.label}</span>
      </div>
    ))}
  </div>
);

const RoleSelector = ({ selectedRole, onSelectRole }) => (
  <div className="grid grid-cols-2 gap-2">
    {roles.map((r) => (
      <button
        key={r.id}
        type="button"
        onClick={() => onSelectRole(r.id)}
        className={`text-left p-3 rounded-lg border-2 transition ${
          selectedRole === r.id
            ? 'border-brand-blue-500 bg-brand-blue-50'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{r.emoji}</span>
          <span className="font-semibold text-sm text-slate-800">
            {r.label}
          </span>
        </div>

        <div className="text-[11px] text-slate-500 leading-snug">
          {r.desc}
        </div>
      </button>
    ))}
  </div>
);

export default function Signup() {
  const { register, authError } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('student');
  const [domainRoles, setDomainRoles] = useState([]);
  const [domainRoleId, setDomainRoleId] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState(false);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [touched, setTouched] = useState({});


  useEffect(() => {
    loadDomainRoles();
  }, []);

  const loadDomainRoles = async () => {
    setLoadingRoles(true);
    setRolesError(false);
    try { 
      const data = await getDomainRoles();
      if (data && data.length > 0) {
        setDomainRoles(data);
        setDomainRoleId(data[0].domain_role_id);
      } else {
        setDomainRoles([]);
        setRolesError(true);
      }
    } catch (err) {
      console.error(err);
      setRolesError(true);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Derived state and event handlers
  const isPasswordValid = passwordCriteria.every(criterion => criterion.test(password));
  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setClientError(null);
    if (!name.trim()) return setClientError('Full name is required');
    if (!EMAIL_REGEX.test(email)) return setClientError('Enter valid mailID');

    if (!isPasswordValid) {
      return setClientError('Password does not meet all the requirements.');
    }

    if (password !== confirm) return setClientError('Passwords do not match');

    if (role === "student" && !domainRoleId) {
      return setClientError("Please select a career goal.");
    }

    setSubmitting(true);
    const ok = await register({
              name: name.trim(),
              email: email.trim(),
              password,
              role,
              domain_role_id:
                  role === "student"
                      ? domainRoleId
                      : undefined
             });
    setSubmitting(false);
    if (ok) navigate('/app/dashboard');
  };

  const errorMsg = clientError || authError;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <BrandingPanel />

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

      {/* Full Name Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Full Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm transition-colors"
        />
        {touched.name && !name.trim() && <p className="text-xs text-red-600 mt-1">Full name is required</p>}
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Email <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm transition-colors"
        />
        {touched.email && !email.trim() && <p className="text-xs text-red-600 mt-1">Email is required</p>}
        {touched.email && email.trim() && !EMAIL_REGEX.test(email) && <p className="text-xs text-red-600 mt-1">Enter valid mailID</p>}
      </div>

      {/* Password Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Password <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => { setIsPasswordFocused(false); handleBlur('password'); }}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm transition-colors"
        />
        {touched.password && !password.trim() && <p className="text-xs text-red-600 mt-1">Password is required</p>}
      </div>

      {/* Password Criteria Wrapper */}
      {(isPasswordFocused || password.length > 0) && (
        <div className="mb-4">
          <PasswordStrengthIndicator password={password} />
        </div>
      )}

      {/* Confirm Password Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Confirm Password <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => handleBlur('confirm')}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm transition-colors"
        />
        {touched.confirm && !confirm.trim() && <p className="text-xs text-red-600 mt-1">Please confirm your password</p>}
      </div>

      {/* Role Selection section unchanged for structure continuity */}
      <div className="mb-6">
        <div className="text-sm font-medium text-slate-700 mb-2">Sign up as</div>
        <RoleSelector selectedRole={role} onSelectRole={setRole} />
      </div>

      {role === 'student' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            What is your career goal? <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            value={domainRoleId}
            onChange={(e) => setDomainRoleId(e.target.value)}
            disabled={loadingRoles}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            {loadingRoles ? (
              <option value="">Loading career goals...</option>
            ) : rolesError || domainRoles.length === 0 ? (
              <option value="">No career goals found — please contact support</option>
            ) : (
              <>
                <option value="">-- Select a career goal --</option>
                {domainRoles.map((domain) => (
                  <option
                    key={domain.domain_role_id}
                    value={domain.domain_role_id}
                  >
                    {domain.domain_name}
                  </option>
                ))}
              </>
            )}
          </select>
          {rolesError && (
            <button
              type="button"
              onClick={loadDomainRoles}
              className="text-[11px] text-brand-blue-600 hover:underline mt-1"
            >
              ↻ Retry loading career goals
            </button>
          )}
          {!rolesError && <p className="text-[11px] text-slate-500 mt-1">This helps us recommend the right courses for you.</p>}
        </div>
      )}

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
