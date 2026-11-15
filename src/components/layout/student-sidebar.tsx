'use client';

import Link from 'next/link';
import { BrandMark } from '@/components/brand/brand-logo';
import { SidebarFooter, SidebarNav } from './sidebar-nav';
import { cn } from '@/lib/cn';

export function StudentSidebar({
  collapsed,
  onToggle,
  onNavigate,
  mobile = false,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const showLabels = !collapsed || mobile;

  return (
    <div className="flex h-full flex-col bg-linear-to-b from-sidebar to-sidebar-2 text-sidebar-ink">
      {/* Brand — same header style as the admin console */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-sidebar-line',
          showLabels ? 'justify-between gap-2 px-4' : 'justify-center px-2'
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="SkillBee student dashboard"
        >
          <BrandMark size={36} priority />
          {showLabels && (
            <span className="leading-tight">
              <span className="block text-[15px] font-bold tracking-tight text-sky-500 dark:text-sky-400">
                SkillBee
              </span>
              <span className="block text-[11px] font-medium text-sidebar-ink-subtle">
                Student portal
              </span>
            </span>
          )}
        </Link>
      </div>

      <SidebarNav collapsed={!showLabels} onNavigate={onNavigate} />

      {onToggle && <SidebarFooter collapsed={!showLabels} onToggle={onToggle} />}
    </div>
  );
}
