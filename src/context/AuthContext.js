import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { loginUser, registerUser, tokenStore, userStore } from '../services/api';

const AuthContext = createContext(null);

const apiToRole = (r) => {
  if (!r) return 'Student';
  return r.charAt(0).toUpperCase() + r.slice(1);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userStore.get());
  const [role, setRole] = useState(() => apiToRole(userStore.get()?.role));
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const stored = userStore.get();
    if (stored && !user) {
      setUser(stored);
      setRole(apiToRole(stored.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      authError,
      isAuthenticated: !!user,
      // Real API login. Returns true on success, false on failure.
      login: async ({ email, password }) => {
        setAuthError(null);
        try {
          const { token, user: apiUser } = await loginUser({ email, password });
          tokenStore.set(token);
          userStore.set(apiUser);
          setUser(apiUser);
          setRole(apiToRole(apiUser.role));
          return true;
        } catch (err) {
          setAuthError(err.response?.data?.error || err.message || 'Login failed');
          return false;
        }
      },
      register: async (data) => {
        setAuthError(null);
        try {
          const { token, user: apiUser } = await registerUser(data);
          tokenStore.set(token);
          userStore.set(apiUser);
          setUser(apiUser);
          setRole(apiToRole(apiUser.role));
          return true;
        } catch (err) {
          setAuthError(err.response?.data?.error || err.message || 'Register failed');
          return false;
        }
      },
      logout: () => {
        tokenStore.clear();
        userStore.clear?.();
        localStorage.removeItem('edu_user');
        setUser(null);
        setRole('Student');
      },
    }),
    [user, role, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
