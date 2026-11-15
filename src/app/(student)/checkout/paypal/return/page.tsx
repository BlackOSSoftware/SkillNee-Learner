'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { BadgeCheck, Loader2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/commerce/state-views';
import { useCapturePayPalOrder } from '@/hooks/payments/use-payments';
import { normalizeApiError } from '@/lib/api-error';
import { formatMinor } from '@/lib/money';
import type { Order } from '@/types/commerce';

type CaptureState =
  | { kind: 'capturing' }
  | { kind: 'success'; order: Order }
  | { kind: 'pending'; order: Order }
  | { kind: 'failed'; message: string; order: Order | null }
  | { kind: 'missing' };

function PayPalReturnInner() {
  const searchParams = useSearchParams();
  const paypalOrderId = searchParams.get('token') ?? undefined;
  const capture = useCapturePayPalOrder();
  const [state, setState] = useState<CaptureState>({ kind: 'capturing' });
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let orderId: string | null = null;
    try {
      orderId = sessionStorage.getItem('skillbee-paypal-order');
      sessionStorage.removeItem('skillbee-paypal-order');
    } catch {
      /* storage unavailable */
    }

    if (!orderId) {
      setState({ kind: 'missing' });
      return;
    }

    capture.mutate(
      { orderId, paypalOrderId },
      {
        onSuccess: (result) => {
          if (result.success || result.alreadyCompleted) {
            setState({ kind: 'success', order: result.order });
          } else if (result.pending) {
            setState({ kind: 'pending', order: result.order });
          } else {
            setState({
              kind: 'failed',
              order: result.order ?? null,
              message: 'PayPal could not complete the capture. The order remains pending.',
            });
          }
        },
        onError: (error) => {
          setState({ kind: 'failed', order: null, message: normalizeApiError(error).message });
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.kind === 'capturing') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
          <Loader2 className="mx-auto size-10 animate-spin text-primary" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold text-ink">Confirming your PayPal payment…</h2>
          <p className="mt-1 text-sm text-ink-muted">Please wait while we verify with the server.</p>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === 'missing') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
          <XCircle className="mx-auto size-10 text-warning" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold text-ink">Missing order reference</h2>
          <p className="mt-1 text-sm text-ink-muted">
            We could not find the pending order for this PayPal return. Check your orders page for the latest status.
          </p>
          <Link href="/orders" className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
            View orders
          </Link>
        </div>
      </div>
    );
  }

  if (state.kind === 'success') {
    const order = state.order;
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
          <BadgeCheck className="mx-auto size-12 text-success" aria-hidden />
          <h2 className="mt-4 text-2xl font-semibold text-ink">Payment successful</h2>
          <p className="mt-2 text-sm text-ink-muted">Your PayPal payment was confirmed and enrollment is active.</p>
          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-line bg-surface-2/60 p-4 text-left">
            <p className="font-mono text-sm font-semibold text-ink">{order.orderNumber}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {order.items.length} course{order.items.length === 1 ? '' : 's'} · {formatMinor(order.totalPaise, order.currency)}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/my-courses" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
              Start learning
            </Link>
            <Link href="/orders" className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2">
              View orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.kind === 'pending') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
          <Loader2 className="mx-auto size-10 text-warning" aria-hidden />
          <h2 className="mt-4 text-2xl font-semibold text-ink">Payment pending</h2>
          <p className="mt-2 text-sm text-ink-muted">
            PayPal approved the payment but capture is still processing. We will update your order shortly.
          </p>
          <Link href="/orders" className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
            View orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
        <XCircle className="mx-auto size-10 text-danger" aria-hidden />
        <h2 className="mt-4 text-2xl font-semibold text-ink">Payment failed</h2>
        <p className="mt-2 text-sm text-ink-muted">{state.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/checkout" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
            Back to checkout
          </Link>
          <Link href="/orders" className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2">
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PayPalReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <PayPalReturnInner />
    </Suspense>
  );
}
