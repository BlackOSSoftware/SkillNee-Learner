'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Search, ShoppingCart, Sun } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-logo';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { useCart } from '@/hooks/cart/use-cart';
import { findNavItem } from '@/lib/nav';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { StudentProfileMenu } from './student-profile-menu';

export function StudentTopbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { status } = useAuth();
  const cartQuery = useCart(status === 'authenticated');
  const cartCount = cartQuery.data?.itemCount ?? 0;
  const current = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation menu"
        className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <Link
        href="/dashboard"
        aria-label="SkillBee home"
        className="flex shrink-0 items-center rounded-lg p-1 lg:hidden"
      >
        <BrandMark size={30} />
      </Link>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-ink">
          {current?.label ?? 'Dashboard'}
        </h1>
      </div>

      {/* Search — catalog search ships with the Courses module; disabled placeholder */}
      <button
        type="button"
        disabled
        title="Search is coming with the Courses module"
        className="hidden items-center gap-2 rounded-lg border border-line bg-field px-3 py-1.5 text-sm text-ink-subtle md:flex md:w-56 lg:w-64"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-line bg-surface px-1.5 text-[10px] font-medium text-ink-subtle">
          soon
        </kbd>
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        {theme === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
      </button>

      <Link
        href="/cart"
        aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Cart'}
        className="relative rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <ShoppingCart className="size-4.5" aria-hidden />
        {cartCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-fg">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        ) : null}
      </Link>

      <NotificationDropdown />

      <div className="h-6 w-px bg-line" aria-hidden />

      <StudentProfileMenu />
    </header>
  );
}
