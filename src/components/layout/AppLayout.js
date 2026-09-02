import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAuth } from '../../context/AuthContext';

export function AppLayout() {
   const { isAuthenticated } = useAuth();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const location = useLocation();

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
