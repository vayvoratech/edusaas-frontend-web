import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Clean branded loading spinner while authentication and backend token sync complete
function CenteredSpinner() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-blue-200 border-t-brand-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">Setting up your dashboard...</p>
        </div>
    );
}

export default function RoleRoute({ allowedRoles }) {
    const { user, role, loading } = useAuth();

    // 1. If loading (Clerk or backend sync running), wait and do NOT mount dashboard yet!
    if (loading) {
        return <CenteredSpinner />;
    }

    // 2. If authenticated and role matches, render dashboard
    const normalizedRole = role?.toLowerCase();
    const normalizedAllowed = allowedRoles?.map(r => r.toLowerCase());
    if (user && normalizedRole && (!normalizedAllowed || normalizedAllowed.includes(normalizedRole))) {
        return <Outlet />;
    }

    // 3. Otherwise, redirect to login
    return <Navigate to="/login" replace />;
}