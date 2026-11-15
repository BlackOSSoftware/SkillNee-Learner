import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  AuthSession,
  ForgotPasswordInput,
  ForgotPasswordResult,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
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

/**
 * PUT /auth/me — always multipart so name fields and the optional photo share
 * one request. The shared apiClient defaults to JSON; clearing Content-Type
 * lets the browser set the multipart boundary (same pattern as submissions).
 */
export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  const form = new FormData();
  if (input.firstName !== undefined) form.append('firstName', input.firstName);
  if (input.lastName !== undefined) form.append('lastName', input.lastName);
  if (input.photo) form.append('profileImage', input.photo);
  if (input.removePhoto) form.append('removeProfileImage', 'true');
  const res = await apiClient.put<ApiEnvelope<{ user: User }>>('/auth/me', form, {
    headers: { 'Content-Type': undefined },
  });
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
