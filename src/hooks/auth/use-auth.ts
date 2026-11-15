'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifySessionEstablished } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchMe,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
} from '@/services/auth/auth.service';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '@/types/auth';

/** Current authenticated user. 401s are handled by the axios refresh interceptor. */
export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}

/** PUT /auth/me — refreshes the shared auth.me cache so every screen sees the update. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.me, session.user);
      notifySessionEstablished();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.me, session.user);
      notifySessionEstablished();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // Always clear private cached data, even if the API call fails.
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => forgotPassword(input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => resetPassword(input),
  });
}
