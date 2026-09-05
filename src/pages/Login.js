import React from 'react';
import { SignIn } from '@clerk/react';

export default function Login() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Branding Panel */}
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
        </div>
        
        <div className="relative text-xs text-white/60">© 2026 EduSkill Platform</div>
      </div>
      
      {/* Clerk Auth Form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <SignIn fallbackRedirectUrl="/onboarding" signUpUrl="/signup" />
      </div>
    </div>
  );
}
