import React, { createContext, useContext, useState, useMemo } from 'react';
import { currentUser } from '../mocks/data';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('Student');

  const value = useMemo(
    () => ({
      user,
      role,
      isAuthenticated: !!user,
      login: (selectedRole) => {
        setRole(selectedRole);
        setUser({ ...currentUser, role: selectedRole });
      },
      switchRole: (newRole) => {
        setRole(newRole);
        setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
      },
      logout: () => setUser(null),
    }),
    [user, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
