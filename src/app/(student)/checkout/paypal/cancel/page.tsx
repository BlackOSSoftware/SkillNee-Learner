'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PayPalCancelPage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
        <XCircle className="mx-auto size-12 text-warning" aria-hidden />
        <h2 className="mt-4 text-2xl font-semibold text-ink">PayPal payment cancelled</h2>
        <p className="mt-2 text-sm text-ink-muted">
          You cancelled the PayPal approval. If an order was created it remains pending — you can retry payment
          from checkout or your orders page.
        </p>
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
