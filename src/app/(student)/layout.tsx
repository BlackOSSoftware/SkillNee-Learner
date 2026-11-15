'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { StudentDashboardShell } from '@/components/layout/student-dashboard-shell';
import { NotificationToastProvider } from '@/components/notifications/notification-toast-provider';
import { useAuth } from '@/providers/auth-provider';

/** Protects student routes: requires an authenticated student session. */
export default function StudentLayout({ children }: { children: ReactNode }) {
  const { user, status, logout } = useAuth();
  const router = useRouter();

  const isStudent = user?.role?.slug === 'student';

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  // Non-student accounts (admin/instructor) must not use the student portal.
  useEffect(() => {
    if (status === 'authenticated' && user && !isStudent) {
      void logout().then(() => router.replace('/login'));
    }
  }, [status, user, isStudent, logout, router]);

  if (status !== 'authenticated' || (user && !isStudent)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas" role="status" aria-label="Loading">
        <div className="size-9 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    );
  }

  return (
    <NotificationToastProvider>
      <StudentDashboardShell>{children}</StudentDashboardShell>
    </NotificationToastProvider>
  );
}
