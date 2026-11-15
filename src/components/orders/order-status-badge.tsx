'use client';

import { cn } from '@/lib/cn';
import { orderStatusLabel, paymentStatusLabel } from './order-display';

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  refunded: 'bg-violet-50 text-violet-700 border-violet-200',
  partially_refunded: 'bg-violet-50 text-violet-700 border-violet-200',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  authorized: 'bg-blue-50 text-blue-700 border-blue-200',
  captured: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  partially_refunded: 'bg-violet-50 text-violet-700 border-violet-200',
  refunded: 'bg-violet-50 text-violet-700 border-violet-200',
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        ORDER_STATUS_STYLES[status] ?? 'bg-surface-2 text-ink-muted border-line'
      )}
    >
      {orderStatusLabel(status)}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        PAYMENT_STATUS_STYLES[status] ?? 'bg-surface-2 text-ink-muted border-line'
      )}
    >
      {paymentStatusLabel(status)}
    </span>
  );
}
