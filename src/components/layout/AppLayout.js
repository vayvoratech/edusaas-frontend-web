import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAuth } from '../../context/AuthContext';

export function AppLayout() {
  const { isAuthenticated, loading, isLoaded } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
  document.documentElement.classList.remove('dark');
}, []);

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Loading EduSaaS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isInitialAssessment =
    location.pathname === "/app/initial-assessment";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {!isInitialAssessment && (
        <Sidebar
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        
        {!isInitialAssessment && (
          <TopNav onOpenNav={() => setMobileNavOpen(true)} />
        )}

        <main
          className={
            isInitialAssessment
              ? "flex-1 w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
              : "flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto animate-fade-in bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
          }
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
}