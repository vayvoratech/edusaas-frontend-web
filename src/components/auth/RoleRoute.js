// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// // A simple loading spinner component to improve user experience
// function CenteredSpinner() {
//     return <div className="grid place-items-center h-screen w-screen">Loading...</div>;
// }

// export default function RoleRoute({ allowedRoles }) {
//     const { user, role, loading } = useAuth();

//     // If we have a user and their role is allowed, render the page.
//     // This is the most important, positive case.
//     const normalizedRole = role?.toLowerCase();
//     const normalizedAllowed = allowedRoles?.map(r => r.toLowerCase());
//     if (user && normalizedRole && (!normalizedAllowed || normalizedAllowed.includes(normalizedRole))) {
//         return <Outlet />;
//     }

//     // If the initial authentication check is still running, show a loading spinner.
//     // This prevents a redirect while we're still figuring out who the user is.
//     if (loading) {
//         return <CenteredSpinner />;
//     }

//     // If loading is finished and we still don't have an authorized user, THEN we redirect.
//     return <Navigate to="/login" replace />;
// }

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function CenteredSpinner() {
  return (
    <div className="grid place-items-center h-screen w-screen">
      Loading...
    </div>
  );
}

export default function RoleRoute({ allowedRoles }) {
  const { user, role, loading } = useAuth();

  // Authentication is still being restored.
  if (loading) {
    return <CenteredSpinner />;
  }

  // Authentication is finished but there is no user.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = role?.toLowerCase();
  const normalizedAllowed =
    allowedRoles?.map((r) => r.toLowerCase());

  // Authenticated user with an allowed role.
  if (
    normalizedRole &&
    (!normalizedAllowed ||
      normalizedAllowed.includes(normalizedRole))
  ) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
}