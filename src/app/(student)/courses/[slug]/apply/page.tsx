'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { FormField } from '@/components/auth/form-field';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { useCourseDetail } from '@/hooks/courses/use-courses';
import { useSubmitLiveApplication } from '@/hooks/liveApplications/use-live-applications';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { normalizeApiError } from '@/lib/api-error';
import {
  LIVE_COURSE_INTERESTS,
  LIVE_COURSE_REFERRAL_SOURCES,
  type LiveCourseApplication,
} from '@/types/liveApplications';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s\-()]{6,19}$/;

interface FormState {
  name: string;
  email: string;
  whatsappNumber: string;
  currentCompany: string;
  currentCity: string;
  courseInterested: string;
  referralSource: string;
  comment: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  whatsappNumber: '',
  currentCompany: '',
  currentCity: '',
  courseInterested: '',
  referralSource: '',
  comment: '',
};

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.whatsappNumber.trim()) errors.whatsappNumber = 'WhatsApp number is required';
  else if (!PHONE_RE.test(form.whatsappNumber.trim()))
    errors.whatsappNumber = 'Enter a valid number with country code (e.g. +91 98765 43210)';
  if (!form.currentCompany.trim()) errors.currentCompany = 'Current company is required';
  if (!form.currentCity.trim()) errors.currentCity = 'Current city is required';
  if (!form.courseInterested) errors.courseInterested = 'Please select a course';
  if (!form.referralSource) errors.referralSource = 'Please select an option';
  return errors;
}

const selectClass =
  'h-11 w-full rounded-lg border border-field-border bg-field px-3.5 text-sm text-ink transition-colors hover:border-field-border-hover focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function LiveCourseApplyPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const courseQuery = useCourseDetail(slug);
  const course = courseQuery.data;
  const { user } = useAuth();
  const toast = useToast();
  const submitMutation = useSubmitLiveApplication();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState<LiveCourseApplication | null>(null);

  // Prefill name/email from the authenticated profile (user can still edit).
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || [user.firstName, user.lastName].filter(Boolean).join(' '),
      email: prev.email || user.email || '',
      whatsappNumber: prev.whatsappNumber || user.phone || '',
    }));
  }, [user]);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!course) return;
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const application = await submitMutation.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        whatsappNumber: form.whatsappNumber.trim(),
        currentCompany: form.currentCompany.trim(),
        currentCity: form.currentCity.trim(),
        courseInterested: form.courseInterested,
        liveCourse: course.id,
        referralSource: form.referralSource,
        comment: form.comment.trim(),
      });
      setSubmitted(application);
      toast.success('Application submitted', `Reference: ${application.applicationReference}`);
    } catch (error) {
      const normalized = normalizeApiError(error);
      toast.error('Submission failed', normalized.message);
    }
  }

  if (courseQuery.isPending) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-4 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (courseQuery.isError || !course) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState
          title="Course not found"
          description="This live session course may have been removed or is no longer published."
          onRetry={() => courseQuery.refetch()}
          retrying={courseQuery.isFetching}
        />
        <p className="mt-4 text-center">
          <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
            ← Back to all courses
          </Link>
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold text-ink">Application submitted</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Thank you, {submitted.name}. Our team will review your application and contact you
            shortly.
          </p>
          <div className="mx-auto mt-6 max-w-xs rounded-xl border border-line bg-surface-2 p-4">
            <p className="text-xs uppercase tracking-wide text-ink-subtle">Application reference</p>
            <p className="mt-1 font-mono text-lg font-semibold text-ink">
              {submitted.applicationReference}
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/courses"
              className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              Browse courses
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-6 text-sm text-ink-muted" aria-label="Breadcrumb">
        <Link href="/courses" className="hover:text-primary">Courses</Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <Link href={`/courses/${course.slug}`} className="hover:text-primary">{course.title}</Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">Apply</span>
      </nav>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <h2 className="text-xl font-semibold text-ink">How to Apply</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Please fill in your details for <span className="font-medium text-ink">{course.title}</span>.
        </p>

        {course.liveSession ? (
          <dl className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface-2 p-4 text-sm sm:grid-cols-2">
            {course.liveSession.batchName ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-subtle">Batch</dt>
                <dd className="mt-0.5 font-medium text-ink">{course.liveSession.batchName}</dd>
              </div>
            ) : null}
            {course.liveSession.sessionMode ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-subtle">Mode</dt>
                <dd className="mt-0.5 font-medium text-ink">{course.liveSession.sessionMode}</dd>
              </div>
            ) : null}
            {course.liveSession.startDate || course.liveSession.endDate ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-subtle">Schedule</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {course.liveSession.startDate
                    ? new Date(course.liveSession.startDate).toLocaleDateString()
                    : '—'}
                  {' → '}
                  {course.liveSession.endDate
                    ? new Date(course.liveSession.endDate).toLocaleDateString()
                    : '—'}
                </dd>
              </div>
            ) : null}
            {course.liveSession.sessionSchedule ? (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-ink-subtle">Sessions</dt>
                <dd className="mt-0.5 font-medium text-ink">{course.liveSession.sessionSchedule}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
          <FormField
            label="Name"
            name="name"
            required
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
            error={fieldErrors.name}
            autoComplete="name"
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email')(e.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <FormField
            label="WhatsApp Number"
            name="whatsappNumber"
            type="tel"
            required
            value={form.whatsappNumber}
            onChange={(e) => set('whatsappNumber')(e.target.value)}
            error={fieldErrors.whatsappNumber}
            autoComplete="tel"
            placeholder="+91 98765 43210"
            hint="Include country code"
          />
          <FormField
            label="Current Company"
            name="currentCompany"
            required
            value={form.currentCompany}
            onChange={(e) => set('currentCompany')(e.target.value)}
            error={fieldErrors.currentCompany}
            autoComplete="organization"
          />
          <FormField
            label="Current City"
            name="currentCity"
            required
            value={form.currentCity}
            onChange={(e) => set('currentCity')(e.target.value)}
            error={fieldErrors.currentCity}
            autoComplete="address-level2"
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="courseInterested" className="text-sm font-medium text-ink">
              Course Interested<span className="ml-0.5 text-danger">*</span>
            </label>
            <select
              id="courseInterested"
              name="courseInterested"
              required
              value={form.courseInterested}
              onChange={(e) => set('courseInterested')(e.target.value)}
              className={selectClass}
            >
              <option value="">Select a course…</option>
              {LIVE_COURSE_INTERESTS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {fieldErrors.courseInterested ? (
              <p role="alert" className="text-xs font-medium text-danger">
                {fieldErrors.courseInterested}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="referralSource" className="text-sm font-medium text-ink">
              How did you hear about us?<span className="ml-0.5 text-danger">*</span>
            </label>
            <select
              id="referralSource"
              name="referralSource"
              required
              value={form.referralSource}
              onChange={(e) => set('referralSource')(e.target.value)}
              className={selectClass}
            >
              <option value="">Select an option…</option>
              {LIVE_COURSE_REFERRAL_SOURCES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {fieldErrors.referralSource ? (
              <p role="alert" className="text-xs font-medium text-danger">
                {fieldErrors.referralSource}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="comment" className="text-sm font-medium text-ink">
              Comment (if any)
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              value={form.comment}
              onChange={(e) => set('comment')(e.target.value)}
              className="w-full rounded-lg border border-field-border bg-field px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-subtle hover:border-field-border-hover focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Anything else we should know?"
            />
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            {submitMutation.isPending ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
