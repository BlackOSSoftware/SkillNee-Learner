'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NAV_GROUPS, type NavGroup, type NavItem } from '@/lib/nav';
import { cn } from '@/lib/cn';

/** One soft accent per nav section — same visual language as the admin console. */
const GROUP_TONE: Record<NavGroup['label'], { dot: string; tile: string; tileActive: string; icon: string; iconActive: string }> = {
  Overview: {
    dot: 'bg-sky-400',
    tile: 'bg-sky-500/10 group-hover:bg-sky-500/15 dark:bg-sky-400/10 dark:group-hover:bg-sky-400/20',
    tileActive: 'bg-sky-500/15 ring-sky-500/20 dark:bg-sky-400/25 dark:ring-sky-300/30',
    icon: 'text-sky-500 dark:text-sky-300',
    iconActive: 'text-sky-600 dark:text-sky-100',
  },
  'My Learning': {
    dot: 'bg-teal-400',
    tile: 'bg-teal-500/10 group-hover:bg-teal-500/15 dark:bg-teal-400/10 dark:group-hover:bg-teal-400/20',
    tileActive: 'bg-teal-500/15 ring-teal-500/20 dark:bg-teal-400/25 dark:ring-teal-300/30',
    icon: 'text-teal-500 dark:text-teal-300',
    iconActive: 'text-teal-600 dark:text-teal-100',
  },
  Account: {
    dot: 'bg-violet-400',
    tile: 'bg-violet-500/10 group-hover:bg-violet-500/15 dark:bg-violet-400/10 dark:group-hover:bg-violet-400/20',
    tileActive: 'bg-violet-500/15 ring-violet-500/20 dark:bg-violet-400/25 dark:ring-violet-300/30',
    icon: 'text-violet-500 dark:text-violet-300',
    iconActive: 'text-violet-600 dark:text-violet-100',
  },
};

function NavLink({
  item,
  tone,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  tone: (typeof GROUP_TONE)[NavGroup['label']];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg py-1.5 text-[13px] transition-colors duration-200',
        collapsed ? 'justify-center px-2' : 'pl-2 pr-2.5',
        active
          ? 'bg-sidebar-active font-semibold text-sky-600 dark:text-sky-300'
          : 'font-medium text-sidebar-ink-muted hover:bg-sidebar-hover hover:text-sidebar-ink'
      )}
    >
      {/* Active indicator bar */}
      {!collapsed && (
        <span
          className={cn(
            'absolute inset-y-2 -left-3 w-[3px] rounded-r-full bg-linear-to-b from-cyan-400 to-sky-500 transition-opacity duration-200',
            active ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden
        />
      )}
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md transition-all duration-200',
          active ? cn('ring-1 ring-inset', tone.tileActive) : cn(tone.tile, 'motion-safe:group-hover:scale-105')
        )}
      >
        <Icon
          className={cn('size-[15px] transition-colors duration-200', active ? tone.iconActive : cn(tone.icon, 'opacity-90 group-hover:opacity-100'))}
          aria-hidden
        />
      </span>
      {!collapsed && <span className="flex-1 truncate transition-transform duration-200 motion-safe:group-hover:translate-x-0.5">{item.label}</span>}
      {collapsed && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 shadow-pop transition-opacity duration-150 group-hover:opacity-100"
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}

export function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-6 pt-4" aria-label="Student navigation">
      {NAV_GROUPS.map((group) => {
        const tone = GROUP_TONE[group.label];
        return (
          <div key={group.label} className="mb-5 last:mb-0">
            {!collapsed ? (
              <p className="flex items-center gap-2 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-ink-subtle">
                <span className={cn('size-1.5 rounded-full opacity-80', tone.dot)} aria-hidden />
                {group.label}
              </p>
            ) : (
              <div className="mx-3 mb-2 border-t border-sidebar-line" aria-hidden />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} tone={tone} collapsed={collapsed} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function SidebarFooter({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-sidebar-line p-3">
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-ink-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-ink',
          collapsed && 'justify-center px-2'
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4.5 shrink-0" aria-hidden />
        ) : (
          <>
            <PanelLeftClose className="size-4.5 shrink-0" aria-hidden />
            <span>Collapse</span>
          </>
        )}
      </button>
    </div>
  );
}
