'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { AuthHeading, AuthLink, AuthLinks, FormAlert, GuestGuard } from '@/components/auth/auth-helpers';
import { PasswordField } from '@/components/auth/form-field';
import { useResetPassword } from '@/hooks/auth/use-auth';

interface FieldErrors {
  password?: string;
  confirmPassword?: string;
}

function passwordError(pw: string): string | undefined {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (pw.length > 128) return 'Password must be at most 128 characters';
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter';
  if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter';
  if (!/[0-9]/.test(pw)) return 'Password must include a number';
  return undefined;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetMutation = useResetPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errors: FieldErrors = {};
    errors.password = passwordError(password);
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !token) return;

    try {
      await resetMutation.mutateAsync({ token, password });
      setDone(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch {
      // API error rendered via FormAlert (invalid/expired token → 400)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          This reset link is missing its token. Request a new reset link.
        </div>
        <AuthLinks>
          <AuthLink href="/forgot-password">Request a new link</AuthLink>
        </AuthLinks>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Password updated successfully. Redirecting you to sign in…
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthHeading title="Choose a new password" subtitle="Your new password must be different from before." />

      <FormAlert error={resetMutation.error} className="mb-5" />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <PasswordField
          label="New password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="At least 8 characters with upper, lower case and a number"
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={resetMutation.isPending}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetMutation.isPending ? 'Updating…' : 'Update password'}
        </button>
      </form>

      <AuthLinks>
        <AuthLink href="/login">Back to sign in</AuthLink>
      </AuthLinks>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestGuard>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center py-24" role="status" aria-label="Loading">
            <div className="size-8 animate-spin rounded-full border-2 border-line border-t-primary" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </GuestGuard>
  );
}
