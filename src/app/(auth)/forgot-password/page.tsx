'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { AuthHeading, AuthLink, AuthLinks, FormAlert, GuestGuard } from '@/components/auth/auth-helpers';
import { FormField } from '@/components/auth/form-field';
import { useForgotPassword } from '@/hooks/auth/use-auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const forgotMutation = useForgotPassword();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  // Dev-only: backend returns resetToken outside production so the flow is testable.
  const [devResetToken, setDevResetToken] = useState<string>();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError(undefined);
    try {
      const result = await forgotMutation.mutateAsync({ email: email.trim().toLowerCase() });
      setDevResetToken(result.resetToken);
      setSubmitted(true);
    } catch {
      // API error rendered via FormAlert
    }
  }

  return (
    <GuestGuard>
      <AuthHeading
        title="Reset your password"
        subtitle="Enter your account email and we'll send you a reset link."
      />

      {submitted ? (
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            If that email exists, a reset link has been sent. Check your inbox.
          </div>
          {devResetToken ? (
            <div className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-ink-muted">
              <p className="font-medium text-ink">Dev mode — reset token:</p>
              <p className="mt-1 break-all font-mono">{devResetToken}</p>
              <Link
                href={`/reset-password?token=${encodeURIComponent(devResetToken)}`}
                className="mt-2 inline-block font-medium text-primary hover:underline"
              >
                Open reset form with this token →
              </Link>
            </div>
          ) : null}
          <AuthLinks>
            <AuthLink href="/login">Back to sign in</AuthLink>
          </AuthLinks>
        </div>
      ) : (
        <>
          <FormAlert error={forgotMutation.error} className="mb-5" />
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <FormField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={forgotMutation.isPending}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {forgotMutation.isPending ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          <AuthLinks>
            Remembered it? <AuthLink href="/login">Back to sign in</AuthLink>
          </AuthLinks>
        </>
      )}
    </GuestGuard>
  );
}
