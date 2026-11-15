'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarPlus,
  CreditCard,
  Infinity as InfinityIcon,
  Lock,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Zap,
} from 'lucide-react';
import { CouponSection, type AppliedCoupon } from '@/components/commerce/coupon-section';
import { CourseCardView } from '@/components/courses/course-card';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import { useCart, useClearCart, useRemoveCartItem } from '@/hooks/cart/use-cart';
import { useFeaturedCourses } from '@/hooks/courses/use-courses';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { normalizeApiError } from '@/lib/api-error';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { CartItem } from '@/types/commerce';

function formatAddedAt(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ItemCard({
  item,
  index,
  onRemove,
  removing,
}: {
  item: CartItem;
  index: number;
  onRemove: () => void;
  removing: boolean;
}) {
  const added = formatAddedAt(item.addedAt);
  return (
    <li
      className={cn(
        'animate-card-enter group flex gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-pop',
        `animate-card-enter-${Math.min(index + 1, 4)}`
      )}
    >
      <Link
        href={`/courses/${item.slug}`}
        className="relative block h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-28 sm:w-44"
      >
        {item.thumbnail?.secureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail.secureUrl}
            alt={item.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-ink-subtle">
            <BookOpen className="size-6 opacity-40" aria-hidden />
          </span>
        )}
        <span className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" aria-hidden />
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <PlayCircle className="size-3" aria-hidden />
          Preview
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/courses/${item.slug}`}
              className="block truncate text-[15px] font-semibold text-ink transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  item.pricingType === 'free'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {item.pricingType === 'free' ? 'Free' : 'Paid'}
              </span>
              {item.pricingType && item.pricingType !== 'free' && item.pricingType !== 'paid' ? (
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted ring-1 ring-line">
                  {item.pricingType}
                </span>
              ) : null}
              {added ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-ink-subtle">
                  <CalendarPlus className="size-3" aria-hidden />
                  Added {added}
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            aria-label={`Remove ${item.title} from cart`}
            className="rounded-lg p-2 text-ink-subtle transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex items-center gap-4 text-[11px] text-ink-subtle">
            <span className="inline-flex items-center gap-1">
              <Zap className="size-3 text-amber-500" aria-hidden />
              Instant access
            </span>
            <span className="inline-flex items-center gap-1">
              <InfinityIcon className="size-3 text-primary" aria-hidden />
              Lifetime access
            </span>
          </div>
          <p className="text-lg font-bold tracking-tight text-ink">
            {item.pricingType === 'free' ? (
              <span className="text-emerald-600 dark:text-emerald-400">Free</span>
            ) : (
              formatMoney(item.finalPrice, item.currency)
            )}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function CartPage() {
  const { status } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const cartQuery = useCart(status === 'authenticated');
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const cart = cartQuery.data;
  const items = useMemo(() => cart?.items ?? [], [cart?.items]);
  const courseIds = useMemo(() => items.map((i) => i.courseId), [items]);
  const cartEmpty = items.length === 0;
  const featuredQuery = useFeaturedCourses(status === 'authenticated');

  const subtotal = items.reduce((sum, i) => sum + (i.finalPrice || 0), 0);
  const currency = items[0]?.currency || 'INR';
  const discount = appliedCoupon?.validation.discountAmount ?? 0;
  const payable = appliedCoupon ? appliedCoupon.validation.finalPayableAmount : subtotal;
  const suggestions = featuredQuery.data ?? [];

  const handleRemove = (courseId: string, title: string) => {
    removeItem.mutate(courseId, {
      onSuccess: () => toast.success('Removed from cart', title),
      onError: (e) => toast.error('Could not remove item', normalizeApiError(e).message),
    });
  };

  const handleClear = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => {
        setConfirmClear(false);
        setAppliedCoupon(null);
        toast.success('Cart cleared');
      },
      onError: (e) => toast.error('Could not clear cart', normalizeApiError(e).message),
    });
  };

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<ShoppingCart className="size-6" aria-hidden />}
          title="Sign in to view your cart"
          description="Your shopping cart is tied to your student account."
          action={
            <Link
              href="/login?next=/cart"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-page-enter">
      {/* Header */}
      <div className="animate-card-enter mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingCart className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">Shopping Cart</h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                {items.length} item{items.length === 1 ? '' : 's'} · secure checkout
              </p>
            </div>
          </div>
        </div>
        {items.length > 0 ? (
          confirmClear ? (
            <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2">
              <span className="text-sm text-ink-muted">Clear all?</span>
              <button
                type="button"
                onClick={handleClear}
                disabled={clearCart.isPending}
                className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {clearCart.isPending ? 'Clearing…' : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-2"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-danger/40 hover:text-danger"
            >
              <Trash2 className="size-4" aria-hidden />
              Clear cart
            </button>
          )
        ) : null}
      </div>

      {cartQuery.isPending ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : cartQuery.isError ? (
        <ErrorState
          title="Could not load your cart"
          description="Please try again in a moment."
          onRetry={() => cartQuery.refetch()}
          retrying={cartQuery.isFetching}
        />
      ) : items.length === 0 ? (
        <div className="animate-card-enter">
          <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            <div className="bg-linear-to-br from-primary/10 via-surface to-surface px-6 py-12 text-center sm:px-12">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingCart className="size-8" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-ink">Your cart is empty</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
                Looks like you haven&apos;t added any courses yet. Explore the catalog and find something
                you&apos;ll love learning.
              </p>
              <Link
                href="/courses"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                Browse courses
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          {suggestions.length > 0 ? (
            <section className="mt-10">
              <h3 className="mb-4 text-lg font-semibold text-ink">You might like</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {suggestions.slice(0, 4).map((course, i) => (
                  <div key={course.id} className={`animate-card-enter animate-card-enter-${Math.min(i + 1, 4)}`}>
                    <CourseCardView course={course} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_370px]">
          {/* Items + details */}
          <div className="min-w-0 space-y-6">
            <ul className="space-y-4">
              {items.map((item, i) => (
                <ItemCard
                  key={item.courseId}
                  item={item}
                  index={i}
                  removing={removeItem.isPending}
                  onRemove={() => handleRemove(item.courseId, item.title)}
                />
              ))}
            </ul>

            {/* Course details strip */}
            <section className="animate-card-enter animate-card-enter-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
                <BadgeCheck className="size-4 text-primary" aria-hidden />
                What&apos;s included
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Zap, title: 'Instant access', desc: 'Start learning right after checkout' },
                  { icon: InfinityIcon, title: 'Lifetime access', desc: 'Learn at your own pace, forever' },
                  { icon: ShieldCheck, title: 'Secure payment', desc: 'Encrypted checkout via trusted gateways' },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex gap-3 rounded-xl bg-surface-2/60 p-3.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{f.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-ink-muted">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="animate-card-enter animate-card-enter-3 space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h3 className="text-base font-semibold text-ink">Order summary</h3>

              <CouponSection courseIds={courseIds} onChange={setAppliedCoupon} />

              <dl className="space-y-2.5 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Subtotal ({items.length} item{items.length === 1 ? '' : 's'})</dt>
                  <dd className="font-medium text-ink">{formatMoney(subtotal, currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Discount</dt>
                  <dd className={cn('font-medium', discount > 0 ? 'text-success' : 'text-ink-subtle')}>
                    {discount > 0 ? `-${formatMoney(discount, currency)}` : formatMoney(0, currency)}
                  </dd>
                </div>
                {appliedCoupon ? (
                  <>
                    <div className="flex justify-between text-success">
                      <dt>Coupon ({appliedCoupon.code})</dt>
                      <dd>-{formatMoney(discount, currency)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold">
                      <dt className="text-ink">Total</dt>
                      <dd className="text-ink">{formatMoney(payable, currency)}</dd>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold">
                    <dt className="text-ink">Total</dt>
                    <dd className="text-ink">{formatMoney(subtotal, currency)}</dd>
                  </div>
                )}
              </dl>
              <p className="text-[11px] leading-relaxed text-ink-subtle">
                Final prices, taxes and discounts are calculated by the server at checkout.
              </p>

              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-fg shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
              >
                <Lock className="size-4" aria-hidden />
                Proceed to checkout
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>

              <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-ink-subtle">
                <span className="inline-flex items-center gap-1">
                  <CreditCard className="size-3.5" aria-hidden />
                  Secure
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Encrypted
                </span>
              </div>

              <Link
                href="/courses"
                className="block text-center text-sm font-medium text-primary transition-colors hover:underline"
              >
                Continue shopping →
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Recommended courses — fills the page when the cart has few items */}
      {!cartEmpty && suggestions.length > 0 ? (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Complete your learning path</h3>
            <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
              Browse all courses →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suggestions
              .filter((c) => !courseIds.includes(c.id))
              .slice(0, 4)
              .map((course, i) => (
                <div key={course.id} className={`animate-card-enter animate-card-enter-${Math.min(i + 1, 4)}`}>
                  <CourseCardView course={course} />
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
