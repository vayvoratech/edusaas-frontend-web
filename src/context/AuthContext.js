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

  const [dbUser, setDbUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('edu_user')) || null;
    } catch (_) {
      return null;
    }
  });
  const backendUser = dbUser;
  const setBackendUser = setDbUser;

  // Listen for local updates to edu_user (e.g. name edits, avatar changes)
  React.useEffect(() => {
    const handleUserUpdate = (e) => {
      try {
        const stored = e?.detail || JSON.parse(localStorage.getItem('edu_user') || 'null');
        if (stored) setDbUser(stored);
      } catch (_) {}
    };

    window.addEventListener('edu_user_updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('edu_user_updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  // Background sync: Fetch latest user profile from PostgreSQL if signed in with token
  React.useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const token = localStorage.getItem('edu_token');
      if (token) {
        (async () => {
          try {
            const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
            const res = await fetch(`${apiBase}/api/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              if (data && data.name) {
                const current = JSON.parse(localStorage.getItem('edu_user') || '{}');
                const updated = {
                  ...current,
                  id: data.id,
                  name: data.name,
                  username: data.username,
                  email: data.email,
                  role: data.role,
                  avatar_url: data.avatar_url || data.profile?.preferences?.avatar_url || current.avatar_url || null,
                };
                localStorage.setItem('edu_user', JSON.stringify(updated));
                setDbUser(updated);
              }
            }
          } catch (e) {
            console.debug('Background user profile sync check:', e);
          }
        })();
      }
    }
  }, [isLoaded, isSignedIn, user]);

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
                localStorage.setItem('edu_user', JSON.stringify(data.user));
                setDbUser(data.user);
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

  const updateAuthUser = React.useCallback((patch) => {
    try {
      const current = JSON.parse(localStorage.getItem('edu_user') || '{}');
      const updated = { ...current, ...patch };
      localStorage.setItem('edu_user', JSON.stringify(updated));
      setDbUser(updated);
      window.dispatchEvent(new CustomEvent('edu_user_updated', { detail: updated }));
    } catch (e) {
      console.error('Failed to update local auth user:', e);
    }
  }, []);

  const mergedUser = useMemo(() => {
    if (!user && !dbUser) return null;
    const base = user || {};
    const db = dbUser || {};

    const name =
      db.name ||
      base.fullName ||
      (base.firstName ? `${base.firstName} ${base.lastName || ''}`.trim() : '') ||
      db.username ||
      base.username ||
      'User';

    const firstName = name.split(' ')[0] || 'User';

    const avatar =
      db.avatar_url ||
      db.preferences?.avatar_url ||
      db.avatar ||
      base.imageUrl ||
      null;

    const effectiveRole = (
      db.role ||
      (base.unsafeMetadata?.role ? apiToRole(base.unsafeMetadata.role) : 'student')
    ).toLowerCase();

    return {
      ...base,
      ...db,
      id: db.id || base.id,
      name,
      firstName,
      displayName: name,
      avatar,
      avatar_url: avatar,
      role: effectiveRole,
      clerkUser: user,
    };
  }, [user, dbUser]);

  const role = mergedUser?.role || 'student';

  const value = useMemo(
    () => ({
      user: mergedUser || backendUser || user,
      backendUser: dbUser,
      role,
      updateAuthUser,
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
        setDbUser(null);
        signOut({ redirectUrl: '/login' });
      },
    }),
    [mergedUser, backendUser, user, role, updateAuthUser, isSignedIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
