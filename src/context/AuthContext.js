import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  useUser,
  useAuth as useClerkAuth,
  useReverification,
} from '@clerk/react';

const AuthContext = createContext(null);

const apiToRole = (r) => {
  if (!r) return 'student';
  return r.toLowerCase();
};

export function AuthProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useClerkAuth();

  const [dbUser, setDbUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('edu_user')) || null;
    } catch (_) {
      return null;
    }
  });

  const backendUser = dbUser;
  const setBackendUser = setDbUser;

  /*
   * ---------------------------------------------------------
   * Clerk password change with reverification
   * ---------------------------------------------------------
   */
  const updatePasswordWithReverification = useReverification(
    async ({ currentPassword, newPassword }) => {
      if (!user) {
        throw new Error('You must be signed in to change your password.');
      }

      return user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      });
    }
  );

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }) => {
      if (!user) {
        throw new Error('You must be signed in to change your password.');
      }

      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required.');
      }

      return updatePasswordWithReverification({
        currentPassword,
        newPassword,
      });
    },
    [user, updatePasswordWithReverification]
  );

  // Listen for local updates to edu_user
  useEffect(() => {
    const handleUserUpdate = (e) => {
      try {
        const stored =
          e?.detail ||
          JSON.parse(localStorage.getItem('edu_user') || 'null');

        if (stored) {
          setDbUser(stored);
        }
      } catch (_) {}
    };

    window.addEventListener('edu_user_updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);

    return () => {
      window.removeEventListener('edu_user_updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  // Background sync: Fetch latest user profile from PostgreSQL
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const token = localStorage.getItem('edu_token');

      if (token) {
        (async () => {
          try {
            const apiBase =
              process.env.REACT_APP_API_BASE || 'http://localhost:5000';

            const res = await fetch(`${apiBase}/api/users/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (res.ok) {
              const data = await res.json();

              if (data && data.name) {
                const current = JSON.parse(
                  localStorage.getItem('edu_user') || '{}'
                );

                const updated = {
                  ...current,
                  id: data.id,
                  clerk_id:
                    data.clerk_id ||
                    current.clerk_id ||
                    user.id,
                  name: data.name,
                  username: data.username,
                  email: data.email,
                  role: data.role,
                  avatar_url:
                    data.avatar_url ||
                    data.profile?.preferences?.avatar_url ||
                    current.avatar_url ||
                    null,
                };

                localStorage.setItem(
                  'edu_user',
                  JSON.stringify(updated)
                );

                setDbUser(updated);
              }
            }
          } catch (e) {
            console.debug(
              'Background user profile sync check:',
              e
            );
          }
        })();
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const [isSyncing, setIsSyncing] = useState(() => {
    return !localStorage.getItem('edu_token');
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setIsSyncing(false);
      return;
    }

    const token = localStorage.getItem('edu_token');

    const storedUser = (() => {
      try {
        return JSON.parse(
          localStorage.getItem('edu_user')
        );
      } catch {
        return null;
      }
    })();

    // Check whether existing token belongs to current Clerk user
    const isMatchingClerk =
      storedUser &&
      (
        storedUser.clerk_id === user.id ||
        (
          storedUser.email &&
          user.primaryEmailAddress?.emailAddress &&
          storedUser.email.toLowerCase() ===
            user.primaryEmailAddress.emailAddress.toLowerCase()
        )
      );

    if (token && isMatchingClerk) {
      setIsSyncing(false);
      return;
    }

    let isMounted = true;

    setIsSyncing(true);

    (async () => {
      try {
        const clerkToken = await getToken();

        if (!clerkToken) {
          if (isMounted) {
            setIsSyncing(false);
          }
          return;
        }

        const apiBase =
          process.env.REACT_APP_API_BASE ||
          'http://localhost:5000';

        const res = await fetch(
          `${apiBase}/api/users/sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${clerkToken}`,
            },
            body: JSON.stringify({
              role:
                user.unsafeMetadata?.role ||
                'student',

              domainRoleId:
                user.unsafeMetadata?.domain_role_id ||
                null,

              clerkId: user.id,

              primaryEmailAddress:
                user.primaryEmailAddress?.emailAddress ||
                user.emailAddresses?.[0]?.emailAddress,

              emailAddresses: user.emailAddresses,

              firstName: user.firstName,

              lastName: user.lastName,

              unsafeMetadata:
                user.unsafeMetadata,
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();

          if (data.accessToken) {
            localStorage.setItem(
              'edu_token',
              data.accessToken
            );

            if (data.refreshToken) {
              localStorage.setItem(
                'edu_refresh',
                data.refreshToken
              );
            }

            if (data.user) {
              const fullUser = {
                ...data.user,
                clerk_id: user.id,
              };

              localStorage.setItem(
                'edu_user',
                JSON.stringify(fullUser)
              );

              if (isMounted) {
                setDbUser(fullUser);
              }
            }

            window.dispatchEvent(
              new CustomEvent(
                'edu_token_ready',
                {
                  detail: data.accessToken,
                }
              )
            );
          }
        } else if (res.status === 403) {
          const data = await res.json().catch(() => ({}));

          console.warn(
            '[AUTH] Backend rejected login:',
            data.error
          );

          localStorage.removeItem('edu_token');
          localStorage.removeItem('edu_refresh');
          localStorage.removeItem('edu_user');

          if (isMounted) {
            setDbUser(null);
          }

          const errorType =
            data.error?.toLowerCase().includes('suspended')
              ? 'suspended'
              : 'deleted';

          await signOut({
            redirectUrl: `/login?error=${errorType}`,
          });
        }
      } catch (err) {
        console.error(
          'Auto-sync failed:',
          err
        );
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    isLoaded,
    isSignedIn,
    user,
    getToken,
    signOut,
  ]);

  const updateAuthUser = useCallback(
    (patch) => {
      try {
        const current = JSON.parse(
          localStorage.getItem('edu_user') || '{}'
        );

        const updated = {
          ...current,
          ...patch,
        };

        localStorage.setItem(
          'edu_user',
          JSON.stringify(updated)
        );

        setDbUser(updated);

        window.dispatchEvent(
          new CustomEvent(
            'edu_user_updated',
            {
              detail: updated,
            }
          )
        );
      } catch (e) {
        console.error(
          'Failed to update local auth user:',
          e
        );
      }
    },
    []
  );

  const mergedUser = useMemo(() => {
    if (!user && !dbUser) {
      return null;
    }

    const base = user || {};
    const db = dbUser || {};

    const name =
      db.name ||
      base.fullName ||
      (
        base.firstName
          ? `${base.firstName} ${
              base.lastName || ''
            }`.trim()
          : ''
      ) ||
      db.username ||
      base.username ||
      'User';

    const firstName =
      name.split(' ')[0] || 'User';

    const avatar =
      db.avatar_url ||
      db.preferences?.avatar_url ||
      db.avatar ||
      base.imageUrl ||
      null;

    const effectiveRole = (
      db.role ||
      (
        base.unsafeMetadata?.role
          ? apiToRole(
              base.unsafeMetadata.role
            )
          : 'student'
      )
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

  const role =
    mergedUser?.role || 'student';

  const value = useMemo(
    () => ({
      user:
        mergedUser ||
        backendUser ||
        user,

      backendUser: dbUser,

      role,

      updateAuthUser,

      changePassword,

      authError: null,

      isLoaded,

      loading:
        !isLoaded ||
        (
          isSignedIn &&
          isSyncing &&
          !dbUser &&
          !localStorage.getItem(
            'edu_token'
          )
        ),

      isAuthenticated:
        Boolean(
          isSignedIn ||
          (isLoaded && dbUser)
        ),

      login: async () => false,

      register: async () => false,

      logout: () => {
        localStorage.removeItem(
          'edu_token'
        );

        localStorage.removeItem(
          'edu_refresh'
        );

        localStorage.removeItem(
          'edu_user'
        );

        setDbUser(null);
        setIsSyncing(false);

        signOut({
          redirectUrl: '/login',
        });
      },
    }),
    [
      mergedUser,
      backendUser,
      user,
      role,
      updateAuthUser,
      changePassword,
      isLoaded,
      isSignedIn,
      isSyncing,
      dbUser,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}