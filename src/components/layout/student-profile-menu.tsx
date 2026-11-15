'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ClipboardList, LogOut, Receipt, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/cn';

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function StudentProfileMenu() {
  const { user, logout, isLoggingOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`.trim();

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.replace('/login');
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2"
      >
        <span className="relative">
          {user.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profileImage}
              alt=""
              className="size-9 rounded-full object-cover ring-2 ring-line"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/70 text-xs font-bold text-primary-fg shadow-sm ring-2 ring-line">
              {initials(user.firstName, user.lastName)}
            </span>
          )}
          <ChevronDown
            className={cn(
              'absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-surface p-0.5 text-ink-subtle ring-1 ring-line transition-transform',
              open && 'rotate-180'
            )}
            aria-hidden
          />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface shadow-pop animate-[dialog-in_160ms_ease-out]"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
            <p className="truncate text-xs text-ink-subtle">{user.email}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <User className="size-4" aria-hidden />
              My Profile
            </Link>
            <Link
              href="/orders"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Receipt className="size-4" aria-hidden />
              My Orders
            </Link>
            <Link
              href="/cart"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <ShoppingCart className="size-4" aria-hidden />
              Cart
            </Link>
            <Link
              href="/assignments"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <ClipboardList className="size-4" aria-hidden />
              Assignments
            </Link>
            <div className="my-1.5 border-t border-line" aria-hidden />
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
            >
              <LogOut className="size-4" aria-hidden />
              {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
