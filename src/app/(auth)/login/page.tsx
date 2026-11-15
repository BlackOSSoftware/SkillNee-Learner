'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthHeading, AuthLink, AuthLinks, FormAlert, GuestGuard } from '@/components/auth/auth-helpers';
import { FormField, PasswordField } from '@/components/auth/form-field';
import { useLogin, useLogout } from '@/hooks/auth/use-auth';

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [roleError, setRoleError] = useState<Error | null>(null);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Password is required';
    return errors;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setRoleError(null);
    try {
      const session = await loginMutation.mutateAsync({ email: email.trim().toLowerCase(), password });
      // Student portal only — staff accounts are signed straight back out.
      if (session.user.role?.slug !== 'student') {
        setPassword('');
        await logoutMutation.mutateAsync().catch(() => undefined);
        setRoleError(new Error('Invalid email or password.'));
        return;
      }
      router.replace('/dashboard');
    } catch {
      // API error rendered via FormAlert below
    }
  }

  return (
    <GuestGuard>
      <AuthHeading title="Welcome back" subtitle="Sign in to continue your learning journey." />

      <FormAlert error={roleError ?? loginMutation.error} className="mb-5" />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          placeholder="you@example.com"
        />
        <PasswordField
          label="Password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <AuthLink href="/forgot-password">Forgot password?</AuthLink>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <AuthLinks>
        New to SkillBee? <AuthLink href="/register">Create an account</AuthLink>
      </AuthLinks>
    </GuestGuard>
  );
}
