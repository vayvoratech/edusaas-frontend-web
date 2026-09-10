import React, { createContext, useContext, useMemo } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/react';

const AuthContext = createContext(null);

const apiToRole = (r) => {
  if (!r) return 'student';
  return r.toLowerCase();
};

export function AuthProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useClerkAuth();
  const [backendUser, setBackendUser] = React.useState(() => {
    try {
     return JSON.parse(localStorage.getItem("edu_user")) || null;
  } catch {
     return null;
  }
});

  React.useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const token = localStorage.getItem('edu_token');
      if (!token) {
        (async () => {
          try {
            const clerkToken = await getToken();
            const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:5000'}/api/users/sync`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${clerkToken}`
              },
              body: JSON.stringify({
                clerkId: user.id,
                emailAddresses: user.emailAddresses,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                unsafeMetadata: user.unsafeMetadata
              })
            });
            const data = await res.json();
            if (data.accessToken) {
              localStorage.setItem('edu_token', data.accessToken);
              if (data.refreshToken) localStorage.setItem('edu_refresh', data.refreshToken);
             if (data.user) {
                 localStorage.setItem("edu_user", JSON.stringify(data.user));
                setBackendUser(data.user);
              }
              window.location.reload();
            }
          } catch (err) {
            console.error("Auto-sync failed:", err);
          }
        })();
      }
    }
  }, [isLoaded, isSignedIn, user, getToken]);

  const role = useMemo(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('edu_user'));
      if (storedUser && storedUser.role) {
        return storedUser.role.toLowerCase();
      }
    } catch(e) {}

    if (isLoaded && isSignedIn && user?.unsafeMetadata?.role) {
      return apiToRole(user.unsafeMetadata.role);
    }
    return 'student';
  }, [user, isLoaded, isSignedIn]);

  const value = useMemo(
    () => ({
      user: backendUser || user,
      role,
      authError: null,
      isAuthenticated: isSignedIn,
      login: async () => {
        return false; // Clerk handles login now
      },
      register: async () => {
        return false; // Clerk handles register now
      },
      logout: () => {
        localStorage.removeItem('edu_token');
        localStorage.removeItem('edu_refresh');
        localStorage.removeItem('edu_user');
        signOut({ redirectUrl: '/login' });
      },
    }),
    [backendUser, user, role, isSignedIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
