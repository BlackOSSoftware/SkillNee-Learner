'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthHeading, AuthLink, AuthLinks, FormAlert, GuestGuard } from '@/components/auth/auth-helpers';
import { FormField, PasswordField } from '@/components/auth/form-field';
import { useRegister } from '@/hooks/auth/use-auth';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()-]+$/;

// Mirrors backend passwordSchema: 8-128 chars, upper, lower, number.
function passwordError(pw: string): string | undefined {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (pw.length > 128) return 'Password must be at most 128 characters';
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter';
  if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter';
  if (!/[0-9]/.test(pw)) return 'Password must include a number';
  return undefined;
}

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address';
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim()))
      errors.phone = 'Enter a valid phone number';
    errors.password = passwordError(form.password);
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await registerMutation.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      router.replace('/dashboard');
    } catch {
      // API error rendered via FormAlert below
    }
  }

  return (
    <GuestGuard>
      <AuthHeading title="Create your account" subtitle="Start learning with SkillBee today." />

      <FormAlert error={registerMutation.error} className="mb-5" />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={fieldErrors.firstName}
          />
          <FormField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            required
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={fieldErrors.lastName}
          />
        </div>

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={fieldErrors.email}
          placeholder="you@example.com"
        />

        <FormField
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          error={fieldErrors.phone}
          hint="Optional"
        />

        <PasswordField
          label="Password"
          name="password"
          required
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          error={fieldErrors.password}
          hint="At least 8 characters with upper, lower case and a number"
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          required
          value={form.confirmPassword}
          onChange={(e) => set('confirmPassword', e.target.value)}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {registerMutation.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <AuthLinks>
        Already have an account? <AuthLink href="/login">Sign in</AuthLink>
      </AuthLinks>
    </GuestGuard>
  );
}
