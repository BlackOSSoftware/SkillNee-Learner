'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useUpdateProfile } from '@/hooks/auth/use-auth';
import { useAuth } from '@/providers/auth-provider';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import type { User } from '@/types/auth';
import { Skeleton } from '@/components/commerce/state-views';

const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // mirrors backend IMAGE_MAX_SIZE_MB default
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

function initials(user: User | null): string {
  if (!user) return 'S';
  const a = user.firstName?.[0] ?? '';
  const b = user.lastName?.[0] ?? user.email?.[0] ?? '';
  return (a + b).toUpperCase() || 'S';
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusTone(status: string): string {
  if (status === 'active') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  if (status === 'suspended') return 'bg-danger/10 text-danger';
  return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
}

function validatePhoto(file: File): string | null {
  if (!PHOTO_TYPES.has(file.type)) return 'Photo must be JPEG, PNG, WebP or AVIF.';
  if (file.size > MAX_PHOTO_BYTES) return 'Photo must be 10 MB or smaller.';
  return null;
}

const inputCls =
  'h-11 w-full rounded-xl border border-line bg-field px-3.5 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-muted';

function ReadOnlyField({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon?: typeof Mail;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-muted">
        {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
        {label}
        <Lock className="size-3 text-ink-subtle" aria-label="Read-only" />
      </label>
      <input value={value} disabled readOnly className={inputCls} />
      {hint ? <p className="mt-1 text-[11px] text-ink-subtle">{hint}</p> : null}
    </div>
  );
}

export function ProfilePage() {
  const { user, status } = useAuth();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Revoke the object URL when the staged photo changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-page-enter">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const startEdit = () => {
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(false);
    setFormError(null);
    setSaved(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(false);
    setFormError(null);
  };

  const pickPhoto = (file: File | undefined) => {
    if (!file) return;
    const problem = validatePhoto(file);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError(null);
    setPhotoFile(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setRemovePhoto(false);
    setSaved(false);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setRemovePhoto(true);
    setSaved(false);
  };

  const save = async () => {
    setFormError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('First name and last name are required.');
      return;
    }
    try {
      await updateProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        photo: photoFile,
        removePhoto: removePhoto && !photoFile,
      });
      setEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setRemovePhoto(false);
      setSaved(true);
    } catch (err) {
      const { message } = normalizeApiError(err);
      setFormError(message || 'Could not save your profile. Please try again.');
    }
  };

  const hasPhoto = Boolean(user.profileImage);
  const avatarSrc = editing
    ? photoPreview ?? (removePhoto ? null : user.profileImage)
    : user.profileImage;
  const roleName = user.role?.name || user.role?.slug || 'Student';

  return (
    <div className="mx-auto max-w-5xl animate-page-enter">
      {/* ===== Header ===== */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">My Profile</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your account details, photo and personal information.
          </p>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            <Pencil className="size-4" aria-hidden />
            Edit profile
          </button>
        ) : null}
      </div>

      {saved ? (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Profile updated successfully.
        </div>
      ) : null}

      {/* ===== Profile hero ===== */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="h-1.5 bg-linear-to-r from-primary/70 via-primary to-accent/60" aria-hidden />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="relative shrink-0">
            <span className="relative flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-2xl font-bold text-primary ring-4 ring-surface">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="" className="size-full object-cover" />
              ) : (
                initials(user)
              )}
            </span>
            {editing ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute -bottom-1.5 -right-1.5 flex size-8 items-center justify-center rounded-full border-2 border-surface bg-primary text-primary-fg shadow-md transition-transform hover:scale-105"
              >
                <Camera className="size-4" aria-hidden />
              </button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                pickPhoto(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold tracking-tight text-ink">
                {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
              </h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {roleName}
              </span>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', statusTone(user.status))}>
                {user.status}
              </span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <BadgeCheck className="size-3" aria-hidden />
                  Verified
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm text-ink-muted">
              <Mail className="size-3.5 shrink-0" aria-hidden />
              {user.email}
            </p>
            <p className="mt-1 text-xs text-ink-subtle">Member since {formatDate(user.createdAt)}</p>
          </div>

          {editing ? (
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <p className="text-xs text-ink-subtle">JPG, PNG, WebP or AVIF · max 10 MB</p>
              {hasPhoto || photoPreview ? (
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-danger transition-colors hover:underline"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Remove photo
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* ===== Body ===== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal information */}
        <section className="rounded-2xl border border-line bg-surface shadow-card lg:col-span-2">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">Personal information</h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                {editing ? 'Edit your name and photo, then save.' : 'Your name and contact details.'}
              </p>
            </div>
            {editing ? (
              <span className="text-xs font-medium text-primary">Editing</span>
            ) : null}
          </header>

          <div className="space-y-4 p-5">
            {editing ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-1.5 block text-xs font-medium text-ink">
                      First name <span className="text-danger">*</span>
                    </label>
                    <input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      maxLength={80}
                      autoComplete="given-name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-1.5 block text-xs font-medium text-ink">
                      Last name <span className="text-danger">*</span>
                    </label>
                    <input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      maxLength={80}
                      autoComplete="family-name"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField
                    label="Email"
                    value={user.email}
                    icon={Mail}
                    hint="Email is tied to your sign-in and cannot be changed."
                  />
                  <ReadOnlyField
                    label="Mobile number"
                    value={user.phone || 'Not added'}
                    icon={Phone}
                    hint="Contact support to update your mobile number."
                  />
                </div>
              </>
            ) : (
              <dl className="divide-y divide-line">
                {[
                  { label: 'First name', value: user.firstName },
                  { label: 'Last name', value: user.lastName },
                  { label: 'Email', value: user.email, icon: Mail },
                  { label: 'Mobile number', value: user.phone || '—', icon: Phone },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <dt className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
                      {label}
                    </dt>
                    <dd className="truncate text-sm font-medium text-ink">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            )}

            {formError ? (
              <p className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-xs font-medium text-danger" role="alert">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {formError}
              </p>
            ) : null}

            {editing ? (
              <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={updateProfile.isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
                >
                  <X className="size-4" aria-hidden />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={updateProfile.isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-fg shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-hover disabled:translate-y-0 disabled:opacity-60"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <CheckCircle2 className="size-4" aria-hidden />
                  )}
                  Save changes
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {/* Account details */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface shadow-card">
            <header className="border-b border-line px-5 py-4">
              <h3 className="text-sm font-semibold text-ink">Account</h3>
              <p className="mt-0.5 text-xs text-ink-muted">Role and verification status.</p>
            </header>
            <dl className="divide-y divide-line">
              {[
                { label: 'Role', value: roleName, icon: ShieldCheck },
                { label: 'Account status', value: user.status, icon: UserRound },
                { label: 'Email verification', value: user.emailVerified ? 'Verified' : 'Not verified', icon: BadgeCheck },
                { label: 'Phone verification', value: user.phoneVerified ? 'Verified' : 'Not verified', icon: Phone },
                { label: 'Last login', value: formatDateTime(user.lastLogin), icon: Clock },
                { label: 'Member since', value: formatDate(user.createdAt), icon: UserRound },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start justify-between gap-3 px-5 py-3">
                  <dt className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                    <Icon className="size-3.5" aria-hidden />
                    {label}
                  </dt>
                  <dd className="text-right text-xs font-medium capitalize text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-surface-2/50 p-5">
            <h3 className="text-sm font-semibold text-ink">Need help?</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
              Email and mobile number are managed by your account for security. Contact support if you need them
              changed.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
