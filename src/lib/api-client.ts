import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { env } from './env';
import type { ApiEnvelope } from '@/types/api';

const baseConfig: AxiosRequestConfig = {
  baseURL: env.apiBaseUrl,
  // HttpOnly auth cookies are the session mechanism — never store tokens in JS.
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    // Cookie-session app: backend keeps accessToken/refreshToken cookies for this scope.
    'X-App-Scope': 'student',
  },
};

/**
 * Centralized Axios instance for all backend API calls.
 * Auth is cookie-based (HttpOnly); a single-flight refresh interceptor
 * renews the session on 401 before giving up.
 */
export const apiClient = axios.create(baseConfig);

/** Separate instance so refresh calls never recurse through the 401 interceptor. */
const refreshClient = axios.create(baseConfig);

const AUTH_PATHS_WITHOUT_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
];

let refreshPromise: Promise<void> | null = null;

/** Single-flight refresh: concurrent 401s share one refresh request. */
export function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    // Empty body — the HttpOnly refreshToken cookie is sent automatically.
    refreshPromise = refreshClient
      .post<ApiEnvelope<unknown>>('/auth/refresh', {})
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

type SessionEvent = 'unauthorized' | 'authenticated';
const sessionListeners = new Set<(event: SessionEvent) => void>();

/** AuthProvider subscribes to session transitions (expiry / re-login). */
export function onSessionEvent(listener: (event: SessionEvent) => void): () => void {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

/** Called after a successful login/register to re-arm the session state. */
export function notifySessionEstablished() {
  emitSessionEvent('authenticated');
}

function emitSessionEvent(event: SessionEvent) {
  sessionListeners.forEach((l) => l(event));
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url || '';
    const skipRefresh = AUTH_PATHS_WITHOUT_REFRESH.some((p) => url.startsWith(p));

    if (status === 401 && original && !original._retried && !skipRefresh) {
      original._retried = true;
      try {
        await refreshSession();
        return apiClient(original);
      } catch {
        // Refresh failed — session is gone; notify auth state and reject.
        emitSessionEvent('unauthorized');
      }
    }
    return Promise.reject(error);
  }
);
