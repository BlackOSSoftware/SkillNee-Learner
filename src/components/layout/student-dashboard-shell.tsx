'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StudentSidebar } from './student-sidebar';
import { StudentTopbar } from './student-topbar';
import { cn } from '@/lib/cn';

const COLLAPSED_KEY = 'skillbee-student-sidebar-collapsed';
const EXPANDED_WIDTH = 'lg:pl-64';
const COLLAPSED_WIDTH = 'lg:pl-20';

/**
 * Student dashboard shell: fixed sidebar (collapsible on desktop,
 * slide-in drawer on mobile) + sticky topbar + scrollable content.
 */
export function StudentDashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore persisted preference after mount (avoids hydration mismatch).
  // localStorage is an external system — read it inside a callback, not sync in the effect body.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1');
      } catch {
        // storage unavailable — keep default
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Close mobile drawer on Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-line transition-[width] duration-300 ease-in-out lg:block',
          'shadow-[1px_0_24px_-12px_rgb(45_49_66/0.12)] dark:shadow-[1px_0_24px_-12px_rgb(0_0_0/0.5)]',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <StudentSidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-[drawer-in_200ms_ease-out] border-r border-sidebar-line bg-sidebar shadow-pop">
            <StudentSidebar mobile collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content column */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out',
          collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
        )}
      >
        <StudentTopbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
