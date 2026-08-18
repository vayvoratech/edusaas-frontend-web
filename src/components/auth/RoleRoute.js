import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// A simple loading spinner component to improve user experience
function CenteredSpinner() {
    return <div className="grid place-items-center h-screen w-screen">Loading...</div>;
}

export default function RoleRoute({ allowedRoles }) {
    const { user, role, loading } = useAuth();

    // If we have a user and their role is allowed, render the page.
    // This is the most important, positive case.
    if (user && role && (!allowedRoles || allowedRoles.includes(role))) {
        return <Outlet />;
    }

    // If the initial authentication check is still running, show a loading spinner.
    // This prevents a redirect while we're still figuring out who the user is.
    if (loading) {
        return <CenteredSpinner />;
    }

    // If loading is finished and we still don't have an authorized user, THEN we redirect.
    return <Navigate to="/login" replace />;
}