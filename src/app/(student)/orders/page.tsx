'use client';

import { Receipt } from 'lucide-react';
import { OrdersBrowser } from '@/components/orders/orders-browser';

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-pop">
            <Receipt className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Orders & Payments</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Your purchase history, order details and invoices.
            </p>
          </div>
        </div>
      </div>

      <OrdersBrowser />
    </div>
  );
}
