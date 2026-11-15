import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  AuthSession,
  ForgotPasswordInput,
  ForgotPasswordResult,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  User,
} from '@/types/auth';

/**
 * Auth API service — all backend auth calls live here, never in components.
 * The backend sets HttpOnly cookies; response tokens are ignored by design.
 */

export async function register(input: RegisterInput): Promise<AuthSession> {
  const res = await apiClient.post<ApiEnvelope<AuthSession>>('/auth/register', input);
  return res.data.data;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const res = await apiClient.post<ApiEnvelope<AuthSession>>('/auth/login', input);
  return res.data.data;
}

export async function logout(): Promise<void> {
  // Cookie supplies the refresh token for revocation; body stays empty.
  await apiClient.post<ApiEnvelope<{ message: string }>>('/auth/logout', {});
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get<ApiEnvelope<{ user: User }>>('/auth/me');
  return res.data.data.user;
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResult> {
  const res = await apiClient.post<ApiEnvelope<ForgotPasswordResult>>('/auth/forgot-password', input);
  return res.data.data;
}

export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  const res = await apiClient.post<ApiEnvelope<{ message: string }>>('/auth/reset-password', input);
  return res.data.data;
}
