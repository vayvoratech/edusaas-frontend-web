// This component renders the login page, handling user authentication, input validation, and a forgot password modal.
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { forgotPassword, verifyOtp, resetPassword } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState(null);
  const [touched, setTouched] = useState({});
  const [forgotStep, setForgotStep] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setForgotError("Please enter the OTP.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError("");
      setForgotMessage("");

      const res = await verifyOtp({
        email,
        otp,
      });

      setForgotMessage(res.message);
      setForgotStep("password");

    } catch (err) {
      setForgotError(
        err.response?.data?.error || "OTP verification failed."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setForgotError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setForgotError("Password must be at least 8 characters.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError("");
      setForgotMessage("");

      const res = await resetPassword({
        email,
        newPassword,
      });

      setForgotMessage(res.message);

      // Reset modal state
      setTimeout(() => {
        setForgotStep(null);
        setOtp("");
        setNewPassword("");
        setForgotError("");
        setForgotMessage("");
        setPassword("");
      }, 1500);

    } catch (err) {
      setForgotError(
        err.response?.data?.error || "Password reset failed."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setForgotError("Please enter your email.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError("");
      setForgotMessage("");

      const res = await forgotPassword(email);

      setForgotMessage(res.message);
      setForgotStep("otp");

    } catch (err) {
      setForgotError(
        err.response?.data?.error || "Failed to send OTP."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setClientError(null);

    if (!email.trim()) {
      return setClientError("Email is required.");
    }
    if (!EMAIL_REGEX.test(email)) {
      return setClientError("Please enter a valid email address.");
    }
    if (!password) {
      return setClientError("Password is required.");
    }

    setSubmitting(true);
    const ok = await login({ email, password });
    setSubmitting(false);
    if (ok) navigate('/app/dashboard');
  };

  const errorMsg = clientError || authError;

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

          <div className="mb-5 h-20">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
              autoComplete='username'
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm"
            />
            {touched.email && !email.trim() && <p className="text-xs text-red-600 mt-1">Email is required.</p>}
            {touched.email && email.trim() && !EMAIL_REGEX.test(email) && <p className="text-xs text-red-600 mt-1">Enter valid mailID</p>}
          </div>

          <div className="mb-5">
            <div className="relative">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='current-password'
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-5 flex items-center px-3 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errorMsg}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in →'}
          </Button>
          
          <div className="mt-6 text-center text-xs text-slate-500">
            <button
              type="button"
              onClick={() => {
                setForgotStep("email");
                setForgotError("");
                setForgotMessage("");
              }}
              className="font-semibold text-brand-blue-600 hover:underline mr-2"
            >
              Forgot Password?
            </button>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-blue-600 hover:underline">
              Sign up →
            </Link>
          </div>
        </form>
      </div>
      {forgotStep && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">
                Forgot Password
              </h2>

              <button
                type="button"
                onClick={() => {
                  setForgotStep(null);
                  setForgotError("");
                  setForgotMessage("");
                  setOtp("");
                  setNewPassword("");
                }}
                className="text-slate-400 hover:text-slate-700 text-2xl"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              Reset your account password.
            </p>

            {forgotStep === "email" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none"
                  />
                </div>

                {forgotError && (
                  <div className="mb-3 text-sm text-red-600">
                    {forgotError}
                  </div>
                )}

                {forgotMessage && (
                  <div className="mb-3 text-sm text-green-600">
                    {forgotMessage}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </>
            )}

            {forgotStep === "otp" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Enter OTP
                  </label>

                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 text-center tracking-[0.5em] text-lg rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none"
                  />
                </div>

                {forgotError && (
                  <div className="mb-3 text-sm text-red-600">
                    {forgotError}
                  </div>
                )}

                {forgotMessage && (
                  <div className="mb-3 text-sm text-green-600">
                    {forgotMessage}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </>
            )}

            {/* Password Step */}
            {forgotStep === "password" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100 outline-none"
                  />
                </div>

                {forgotError && (
                  <div className="mb-3 text-sm text-red-600">
                    {forgotError}
                  </div>
                )}

                {forgotMessage && (
                  <div className="mb-3 text-sm text-green-600">
                    {forgotMessage}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Updating Password..." : "Reset Password"}
                </Button>
              </>
            )}



          </div>
        </div>
      )}
    </div>
  );
}
