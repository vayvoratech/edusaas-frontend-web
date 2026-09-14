import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAuth } from '../../context/AuthContext';

export function AppLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Wait for Clerk + backend authentication to finish restoring.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  // Only redirect after authentication has been fully checked.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
