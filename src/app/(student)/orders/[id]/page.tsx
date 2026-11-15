'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CreditCard,
  Download,
  Hash,
  MapPin,
  Package,
  Receipt,
  Tag,
  User,
} from 'lucide-react';
import { useOrder, useDownloadInvoice } from '@/hooks/orders/use-orders';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/order-status-badge';
import {
  formatOrderDate,
  formatOrderDateTime,
  gatewayLabel,
  invoiceFileName,
} from '@/components/orders/order-display';
import { formatMoney, formatMinor } from '@/lib/money';
import { cn } from '@/lib/cn';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const detail = useOrder(id);
  const download = useDownloadInvoice();
  const [error, setError] = useState<string | null>(null);

  if (detail.isPending) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="Order not found"
          description="This order is unavailable or does not belong to your account."
          onRetry={() => detail.refetch()}
          retrying={detail.isFetching}
        />
      </div>
    );
  }

  const o = detail.data;
  const currency = o.currency || 'INR';
  const billing = o.billing || {};
  const hasBilling = Object.values(billing).some((v) => v && String(v).trim());

  const handleDownload = async () => {
    setError(null);
    try {
      await download.mutateAsync({ id: o.id, fallbackName: invoiceFileName(o) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invoice download failed.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to orders
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-primary/10 via-surface to-surface p-6 shadow-card sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-pop">
                <Receipt className="size-7" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                  Order
                </p>
                <h2 className="font-mono text-xl font-bold tracking-wide text-ink">{o.orderNumber}</h2>
                {o.invoiceNumber ? (
                  <p className="mt-0.5 font-mono text-xs text-ink-subtle">Invoice: {o.invoiceNumber}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <OrderStatusBadge status={o.orderStatus} />
              <PaymentStatusBadge status={o.paymentStatus} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line/60 pt-5 sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Order date</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-ink">
                <Calendar className="size-3.5 text-ink-subtle" aria-hidden />
                {formatOrderDateTime(o.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Items</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-ink">
                <Package className="size-3.5 text-ink-subtle" aria-hidden />
                {o.items?.length ?? 0} item{o.items?.length === 1 ? '' : 's'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Payment method</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-ink">
                <CreditCard className="size-3.5 text-ink-subtle" aria-hidden />
                {gatewayLabel(o.paymentGateway)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Total</p>
              <p className="mt-1 text-lg font-bold text-ink">{formatMoney(o.totalAmount, currency)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Items + summary */}
        <div className="space-y-4 lg:col-span-2">
          {/* Items */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
            <h3 className="text-sm font-semibold text-ink">Items</h3>
            <ul className="mt-4 space-y-4">
              {(o.items ?? []).map((item) => (
                <li key={item.courseId} className="flex gap-4">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    {item.courseThumbnail?.secureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.courseThumbnail.secureUrl}
                        alt={item.courseName}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-ink-subtle">
                        <BookOpen className="size-5 opacity-40" aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{item.courseName}</p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      Qty 1 · {item.currency}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                      {item.regularPrice != null && item.salePrice != null && item.salePrice < item.regularPrice ? (
                        <span>
                          <span className="line-through">{formatMoney(item.regularPrice, item.currency)}</span>
                          <span className="ml-1.5 font-semibold text-ink">{formatMoney(item.salePrice, item.currency)}</span>
                        </span>
                      ) : (
                        <span>{formatMoney(item.finalPrice, item.currency)}</span>
                      )}
                      {item.discountPaise > 0 ? (
                        <span className="text-success">-{formatMinor(item.discountPaise, item.currency)}</span>
                      ) : null}
                      {item.taxPaise > 0 ? (
                        <span>Tax {formatMinor(item.taxPaise, item.currency)}</span>
                      ) : null}
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-ink">
                    {formatMinor(item.itemTotalPaise, item.currency)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Billing */}
          {hasBilling ? (
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MapPin className="size-4 text-ink-subtle" aria-hidden />
                Billing information
              </h3>
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {billing.fullName ? (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Name</dt>
                    <dd className="mt-0.5 text-sm text-ink">{billing.fullName}</dd>
                  </div>
                ) : null}
                {billing.email ? (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Email</dt>
                    <dd className="mt-0.5 text-sm text-ink">{billing.email}</dd>
                  </div>
                ) : null}
                {billing.phone ? (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Phone</dt>
                    <dd className="mt-0.5 text-sm text-ink">{billing.phone}</dd>
                  </div>
                ) : null}
                {billing.gstin ? (
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">GSTIN</dt>
                    <dd className="mt-0.5 font-mono text-sm text-ink">{billing.gstin}</dd>
                  </div>
                ) : null}
                {(billing.addressLine1 || billing.city || billing.state || billing.postalCode || billing.country) ? (
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Address</dt>
                    <dd className="mt-0.5 text-sm text-ink">
                      {[billing.addressLine1, billing.addressLine2, billing.city, billing.state, billing.postalCode, billing.country]
                        .filter(Boolean)
                        .join(', ')}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}
        </div>

        {/* Summary sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h3 className="text-sm font-semibold text-ink">Order summary</h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="font-medium text-ink">{formatMinor(o.subtotalPaise, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Discount</dt>
                <dd className={cn('font-medium', o.discountPaise > 0 ? 'text-success' : 'text-ink-subtle')}>
                  {o.discountPaise > 0 ? `-${formatMinor(o.discountPaise, currency)}` : formatMinor(0, currency)}
                </dd>
              </div>
              {o.taxPaise > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Tax</dt>
                  <dd className="font-medium text-ink">{formatMinor(o.taxPaise, currency)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold">
                <dt className="text-ink">Total</dt>
                <dd className="text-ink">{formatMoney(o.totalAmount, currency)}</dd>
              </div>
            </dl>

            {o.couponSnapshot?.code ? (
              <div className="mt-4 rounded-xl bg-success/5 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                  <Tag className="size-3.5" aria-hidden />
                  Coupon applied: {o.couponSnapshot.code}
                </p>
                {o.couponSnapshot.discountAmount != null ? (
                  <p className="mt-1 text-xs text-ink-muted">
                    Saved {formatMoney(o.couponSnapshot.discountAmount, o.couponSnapshot.currency || currency)}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 space-y-2 border-t border-line pt-4 text-xs text-ink-muted">
              <p className="flex items-center gap-1.5">
                <Hash className="size-3.5" aria-hidden />
                Order: {o.orderNumber}
              </p>
              {o.invoiceNumber ? (
                <p className="flex items-center gap-1.5">
                  <Receipt className="size-3.5" aria-hidden />
                  Invoice: {o.invoiceNumber}
                </p>
              ) : null}
              {o.gatewayPaymentId ? (
                <p className="flex items-center gap-1.5">
                  <CreditCard className="size-3.5" aria-hidden />
                  Payment ref: {o.gatewayPaymentId}
                </p>
              ) : null}
              {o.gatewayOrderId ? (
                <p className="flex items-center gap-1.5">
                  <CreditCard className="size-3.5" aria-hidden />
                  Gateway order: {o.gatewayOrderId}
                </p>
              ) : null}
              {o.completedAt ? (
                <p className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" aria-hidden />
                  Completed: {formatOrderDate(o.completedAt)}
                </p>
              ) : null}
              {o.cancelledAt ? (
                <p className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" aria-hidden />
                  Cancelled: {formatOrderDate(o.cancelledAt)}
                </p>
              ) : null}
            </div>

            {error ? <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p> : null}

            <button
              type="button"
              onClick={handleDownload}
              disabled={download.isPending}
              className={cn(
                'mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover hover:shadow-pop disabled:opacity-60'
              )}
            >
              <Download className="size-4" aria-hidden />
              {download.isPending ? 'Downloading…' : 'Download invoice PDF'}
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <User className="size-4 text-ink-subtle" aria-hidden />
              Need help?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              If you have questions about this order or need a refund, please contact support with your order number.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
