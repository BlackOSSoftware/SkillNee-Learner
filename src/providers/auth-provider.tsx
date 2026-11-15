'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onSessionEvent } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useLogout, useMe } from '@/hooks/auth/use-auth';
import type { User } from '@/types/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Auth pages where useMe should not fire (avoids 401/refresh race on first login). */
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p));
  const meQuery = useMe(!isAuthPage);
  const logoutMutation = useLogout();
  const [sessionExpired, setSessionExpired] = useState(false);
  const expiredRef = useRef(false);

  // Session transitions are event-driven:
  // - 'unauthorized' (refresh failed) → drop auth state once; the ref guard
  //   prevents a removeQueries → refetch → 401 → refresh loop.
  // - 'authenticated' (login/register succeeded) → re-arm auth state.
  useEffect(
    () =>
      onSessionEvent((event) => {
        if (event === 'unauthorized' && !expiredRef.current) {
          expiredRef.current = true;
          setSessionExpired(true);
          queryClient.removeQueries({ queryKey: queryKeys.auth.me });
        } else if (event === 'authenticated') {
          expiredRef.current = false;
          setSessionExpired(false);
        }
      }),
    [queryClient]
  );

  const value = useMemo<AuthContextValue>(() => {
    const user = sessionExpired ? null : (meQuery.data ?? null);
    // When useMe is disabled (auth pages), don't block on 'loading' —
    // GuestGuard needs 'unauthenticated' to render the login form.
    const status: AuthStatus = sessionExpired
      ? 'unauthenticated'
      : isAuthPage
        ? (user ? 'authenticated' : 'unauthenticated')
        : meQuery.isPending
          ? 'loading'
          : user
            ? 'authenticated'
            : 'unauthenticated';

    return {
      user,
      status,
      isLoggingOut: logoutMutation.isPending,
      logout: async () => {
        try {
          await logoutMutation.mutateAsync();
        } finally {
          expiredRef.current = false;
          setSessionExpired(false);
          queryClient.clear();
        }
      },
    };
  }, [meQuery.data, meQuery.isPending, sessionExpired, logoutMutation, queryClient, isAuthPage]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
