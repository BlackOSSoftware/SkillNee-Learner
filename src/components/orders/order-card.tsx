'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, Calendar, Download, Eye, Package, Receipt } from 'lucide-react';
import type { Order } from '@/types/commerce';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/cn';
import { useDownloadInvoice } from '@/hooks/orders/use-orders';
import { OrderStatusBadge, PaymentStatusBadge } from './order-status-badge';
import { formatOrderDate, invoiceFileName, itemCount } from './order-display';

export function OrderCard({ order }: { order: Order }) {
  const download = useDownloadInvoice();
  const [error, setError] = useState<string | null>(null);
  const count = itemCount(order);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await download.mutateAsync({ id: order.id, fallbackName: invoiceFileName(order) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invoice download failed.');
    }
  };

  const firstItem = order.items?.[0];
  const extraItems = count > 1 ? count - 1 : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-pop">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-line/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Receipt className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-sm font-bold tracking-wide text-ink">{order.orderNumber}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-subtle">
              <Calendar className="size-3" aria-hidden />
              {formatOrderDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Items preview */}
      <div className="flex-1 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
            {firstItem?.courseThumbnail?.secureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstItem.courseThumbnail.secureUrl}
                alt={firstItem.courseName}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-ink-subtle">
                <BookOpen className="size-4 opacity-40" aria-hidden />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
              {firstItem?.courseName ?? 'Order items'}
            </p>
            {extraItems > 0 ? (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
                <Package className="size-3" aria-hidden />
                +{extraItems} more item{extraItems === 1 ? '' : 's'}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-ink-subtle">
              {count} item{count === 1 ? '' : 's'} · {order.currency}
            </p>
          </div>
        </div>

        {/* Pricing summary */}
        <div className="mt-4 space-y-1.5 border-t border-line/60 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-muted">Subtotal</span>
            <span className="text-ink">{formatMoney(order.subtotalPaise / 100, order.currency)}</span>
          </div>
          {order.discountPaise > 0 ? (
            <div className="flex justify-between">
              <span className="text-ink-muted">Discount</span>
              <span className="text-success">-{formatMoney(order.discountPaise / 100, order.currency)}</span>
            </div>
          ) : null}
          {order.taxPaise > 0 ? (
            <div className="flex justify-between">
              <span className="text-ink-muted">Tax</span>
              <span className="text-ink">{formatMoney(order.taxPaise / 100, order.currency)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-line/60 pt-2 text-base font-bold">
            <span className="text-ink">Total</span>
            <span className="text-ink">{formatMoney(order.totalAmount, order.currency)}</span>
          </div>
        </div>

        {order.couponSnapshot?.code ? (
          <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
            Coupon: {order.couponSnapshot.code}
          </p>
        ) : null}

        {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-line/60 px-5 py-3.5">
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          <Eye className="size-4" aria-hidden />
          Details
        </Link>
        <button
          type="button"
          onClick={handleDownload}
          disabled={download.isPending}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all',
            'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover hover:shadow-pop disabled:opacity-60'
          )}
        >
          <Download className="size-4" aria-hidden />
          {download.isPending ? 'Downloading…' : 'Invoice'}
        </button>
      </div>
    </div>
  );
}
