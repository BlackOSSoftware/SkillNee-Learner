'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Loader2, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { useAddToCart, useCart } from '@/hooks/cart/use-cart';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';

/**
 * Add-to-cart control. Requires auth; shows "View Cart" when the course
 * is already in the cart; surfaces backend errors (e.g. ALREADY_ENROLLED,
 * DUPLICATE_CART_ITEM) via toast.
 */
export function AddToCartButton({
  courseId,
  slug,
  enrolled = false,
  className,
  variant = 'primary',
}: {
  courseId: string;
  slug?: string;
  enrolled?: boolean;
  className?: string;
  variant?: 'primary' | 'outline';
}) {
  const { user, status } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const cartQuery = useCart(Boolean(user));
  const addToCart = useAddToCart();

  const inCart = cartQuery.data?.items.some((i) => i.courseId === courseId) ?? false;

  if (enrolled) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold',
          'bg-success/10 text-success ring-1 ring-inset ring-success/25',
          className
        )}
      >
        <Check className="size-4" aria-hidden />
        Enrolled
      </span>
    );
  }

  if (inCart) {
    return (
      <Link
        href="/cart"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
          variant === 'primary'
            ? 'bg-primary text-primary-fg hover:bg-primary-hover'
            : 'border border-line bg-surface text-ink hover:bg-surface-2',
          className
        )}
      >
        <Check className="size-4" aria-hidden />
        View Cart
      </Link>
    );
  }

  const handleAdd = () => {
    if (status !== 'authenticated') {
      router.push(`/login?next=${encodeURIComponent(slug ? `/courses/${slug}` : '/courses')}`);
      return;
    }
    addToCart.mutate(courseId, {
      onSuccess: () => {
        toast.success('Added to cart', 'The course was added to your cart.');
      },
      onError: (error) => {
        const normalized = normalizeApiError(error);
        toast.error('Could not add to cart', normalized.message);
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={addToCart.isPending}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary'
          ? 'bg-primary text-primary-fg hover:bg-primary-hover'
          : 'border border-line bg-surface text-ink hover:bg-surface-2',
        className
      )}
    >
      {addToCart.isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <ShoppingCart className="size-4" aria-hidden />
      )}
      {addToCart.isPending ? 'Adding…' : 'Add to Cart'}
    </button>
  );
}
