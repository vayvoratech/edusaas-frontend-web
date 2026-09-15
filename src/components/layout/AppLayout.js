import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAuth } from '../../context/AuthContext';

export function AppLayout() {
  const { isAuthenticated, loading, isLoaded } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Loading EduSaaS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

    const isInitialAssessment =
      location.pathname === "/app/initial-assessment";

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {!isInitialAssessment && (
        <Sidebar
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {!isInitialAssessment && (
          <TopNav onOpenNav={() => setMobileNavOpen(true)} />
        )}

        <main
          className={
            isInitialAssessment
              ? "flex-1 w-full min-h-screen"
              : "flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto animate-fade-in"
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
