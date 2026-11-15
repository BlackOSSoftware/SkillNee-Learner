'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  Receipt,
  ShieldCheck,
  Wallet,
  XCircle,
} from 'lucide-react';
import { CouponSection, type AppliedCoupon } from '@/components/commerce/coupon-section';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import { useCart } from '@/hooks/cart/use-cart';
import { useCheckout } from '@/hooks/checkout/use-checkout';
import {
  useAvailableGateways,
  useCreatePayPalOrder,
  useCreateRazorpayOrder,
  useVerifyRazorpayPayment,
} from '@/hooks/payments/use-payments';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { normalizeApiError } from '@/lib/api-error';
import { formatMoney, formatMinor } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { BillingDetails, Order } from '@/types/commerce';

type PaymentPhase =
  | { kind: 'idle' }
  | { kind: 'creating-order' }
  | { kind: 'awaiting-payment'; order: Order }
  | { kind: 'processing'; order: Order }
  | { kind: 'success'; order: Order }
  | { kind: 'failed'; order: Order | null; message: string }
  | { kind: 'pending'; order: Order }
  | { kind: 'cancelled'; order: Order };

const inputClass =
  'h-10 w-full rounded-lg border border-field-border bg-field px-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const GATEWAY_META: Record<string, { label: string; description: string; icon: typeof CreditCard }> = {
  razorpay: {
    label: 'Razorpay',
    description: 'UPI, cards, netbanking and wallets',
    icon: CreditCard,
  },
  paypal: {
    label: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: Wallet,
  },
};

/** Loads Razorpay Checkout.js on demand; resolves false when unavailable. */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    const w = window as unknown as { Razorpay?: unknown };
    if (w.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export default function CheckoutPage() {
  const { user, status } = useAuth();
  const toast = useToast();

  const cartQuery = useCart(status === 'authenticated');
  const checkout = useCheckout();

  const [billing, setBilling] = useState<BillingDetails>({});
  const [billingTouched, setBillingTouched] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [phase, setPhase] = useState<PaymentPhase>({ kind: 'idle' });
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  const createRazorpay = useCreateRazorpayOrder();
  const verifyRazorpay = useVerifyRazorpayPayment();
  const createPayPal = useCreatePayPalOrder();

  const items = useMemo(() => cartQuery.data?.items ?? [], [cartQuery.data?.items]);
  const courseIds = useMemo(() => items.map((i) => i.courseId), [items]);
  const currency = items[0]?.currency || 'INR';
  const cartSubtotal = items.reduce((s, i) => s + (i.finalPrice || 0), 0);

  const orderId = phase.kind === 'awaiting-payment' || phase.kind === 'success' || phase.kind === 'failed' || phase.kind === 'pending' || phase.kind === 'cancelled'
    ? phase.order?.id ?? null
    : null;

  const availableGateways = useAvailableGateways(orderId);

  const setBillingField = (field: keyof BillingDetails, value: string) => {
    setBillingTouched(true);
    setBilling((b) => ({ ...b, [field]: value }));
  };

  const billingPrefill: BillingDetails = useMemo(
    () => ({
      fullName: billing.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' '),
      email: billing.email || user?.email || '',
      phone: billing.phone || user?.phone || '',
      country: billing.country || 'IN',
    }),
    [billing, user]
  );

  const handlePlaceOrder = () => {
    if (items.length === 0 || checkout.isPending) return;
    setPhase({ kind: 'creating-order' });
    checkout.mutate(
      {
        useCart: true,
        clearCart: true,
        couponCode: appliedCoupon?.code,
        billing: {
          fullName: billingPrefill.fullName,
          email: billingPrefill.email,
          phone: billingPrefill.phone,
          addressLine1: billing.addressLine1,
          addressLine2: billing.addressLine2,
          city: billing.city,
          state: billing.state,
          postalCode: billing.postalCode,
          country: billingPrefill.country,
          gstin: billing.gstin,
        },
      },
      {
        onSuccess: (result) => {
          if (!result.requiresPayment) {
            setPhase({ kind: 'success', order: result.order });
            toast.success('Enrollment activated', result.message || 'Your free course is ready.');
            return;
          }
          setPhase({ kind: 'awaiting-payment', order: result.order });
        },
        onError: (error) => {
          setPhase({ kind: 'idle' });
          toast.error('Checkout failed', normalizeApiError(error).message);
        },
      }
    );
  };

  const handleRazorpay = async (order: Order) => {
    setPhase({ kind: 'processing', order });
    try {
      const rz = await createRazorpay.mutateAsync(order.id);
      const loaded = await loadRazorpayScript();
      if (!loaded || !rz.keyId) {
        setPhase({
          kind: 'failed',
          order,
          message:
            'Razorpay checkout is not available — the payment gateway is not configured yet. Your order was created and remains pending.',
        });
        return;
      }
      const RazorpayCtor = (window as unknown as { Razorpay: new (opts: Record<string, unknown>) => { open: () => void } }).Razorpay;
      const rzp = new RazorpayCtor({
        key: rz.keyId,
        order_id: rz.razorpayOrderId,
        amount: rz.amountMinor,
        currency: rz.currency,
        name: 'SkillBee',
        description: `Order ${rz.orderNumber}`,
        prefill: { name: rz.name, email: rz.email, contact: rz.contact },
        theme: { color: '#1592ca' },
        handler: async (response: RazorpayCheckoutResponse) => {
          setPhase({ kind: 'processing', order });
          try {
            const result = await verifyRazorpay.mutateAsync({
              orderId: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (result.success) {
              setPhase({ kind: 'success', order: result.order });
              toast.success('Payment successful', 'Your enrollment is now active.');
            } else if (result.order?.paymentStatus === 'failed') {
              setPhase({ kind: 'failed', order: result.order, message: 'The payment was declined by the gateway.' });
            } else {
              setPhase({ kind: 'pending', order: result.order });
            }
          } catch (e) {
            setPhase({ kind: 'failed', order, message: normalizeApiError(e).message });
          }
        },
        modal: {
          ondismiss: () => {
            setPhase({ kind: 'cancelled', order });
          },
        },
      });
      rzp.open();
      setPhase({ kind: 'awaiting-payment', order });
    } catch (e) {
      setPhase({ kind: 'failed', order, message: normalizeApiError(e).message });
    }
  };

  const handlePayPal = async (order: Order) => {
    setPhase({ kind: 'processing', order });
    try {
      const pp = await createPayPal.mutateAsync(order.id);
      if (!pp.approveUrl) {
        setPhase({ kind: 'failed', order, message: 'PayPal did not return an approval link.' });
        return;
      }
      // Persist internal order id so the return page can capture without query params.
      try {
        sessionStorage.setItem('skillbee-paypal-order', order.id);
      } catch {
        /* storage unavailable */
      }
      window.location.assign(pp.approveUrl);
    } catch (e) {
      setPhase({ kind: 'failed', order, message: normalizeApiError(e).message });
    }
  };

  const handleGatewayPay = (provider: string, order: Order) => {
    setSelectedGateway(provider);
    if (provider === 'razorpay') void handleRazorpay(order);
    else if (provider === 'paypal') void handlePayPal(order);
  };

  /* ---------- Render helpers ---------- */

  const renderOrderItems = (order: Order) => (
    <ul className="space-y-2">
      {order.items.map((item) => (
        <li key={item.courseId} className="flex items-center justify-between gap-3 text-sm">
          <span className="min-w-0 truncate text-ink">{item.courseName}</span>
          <span className="shrink-0 font-medium text-ink">{formatMoney(item.itemTotalPaise / 100, item.currency)}</span>
        </li>
      ))}
    </ul>
  );

  const renderTotals = (order: Order) => (
    <dl className="space-y-2 border-t border-line pt-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-muted">Subtotal</dt>
        <dd className="text-ink">{formatMinor(order.subtotalPaise, order.currency)}</dd>
      </div>
      {order.discountPaise > 0 ? (
        <div className="flex justify-between text-success">
          <dt>Discount{order.couponSnapshot?.code ? ` (${order.couponSnapshot.code})` : ''}</dt>
          <dd>-{formatMinor(order.discountPaise, order.currency)}</dd>
        </div>
      ) : null}
      {order.taxPaise > 0 ? (
        <div className="flex justify-between">
          <dt className="text-ink-muted">Tax</dt>
          <dd className="text-ink">{formatMinor(order.taxPaise, order.currency)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
        <dt className="text-ink">Total</dt>
        <dd className="text-ink">{formatMinor(order.totalPaise, order.currency)}</dd>
      </div>
    </dl>
  );

  /* ---------- Result screens ---------- */

  if (phase.kind === 'success') {
    const order = phase.order;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
            <BadgeCheck className="size-8" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            {order.totalPaise === 0 ? 'Enrollment activated' : 'Payment successful'}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {order.totalPaise === 0
              ? 'Your free course enrollment is complete.'
              : 'Your payment was confirmed and your enrollment is now active.'}
          </p>
          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-line bg-surface-2/60 p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Order</p>
            <p className="mt-1 font-mono text-sm font-semibold text-ink">{order.orderNumber}</p>
            {renderOrderItems(order)}
            <div className="mt-3">{renderTotals(order)}</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-surface px-2.5 py-1 font-medium text-ink-muted ring-1 ring-line">
                Status: {order.orderStatus}
              </span>
              <span className="rounded-full bg-surface px-2.5 py-1 font-medium text-ink-muted ring-1 ring-line">
                Payment: {order.paymentStatus}
              </span>
              {order.paymentGateway && order.paymentGateway !== 'none' ? (
                <span className="rounded-full bg-surface px-2.5 py-1 font-medium text-ink-muted ring-1 ring-line">
                  via {order.paymentGateway}
                </span>
              ) : null}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/my-courses"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              Start learning
            </Link>
            <Link
              href="/orders"
              className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2"
            >
              View orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase.kind === 'failed') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-danger/10 text-danger">
            <XCircle className="size-8" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Payment failed</h2>
          <p className="mt-2 text-sm text-ink-muted">{phase.message}</p>
          {phase.order ? (
            <div className="mx-auto mt-6 max-w-sm rounded-xl border border-line bg-surface-2/60 p-4 text-left">
              <p className="font-mono text-sm font-semibold text-ink">{phase.order.orderNumber}</p>
              <p className="mt-1 text-xs text-ink-muted">
                Order status: {phase.order.orderStatus} · Payment: {phase.order.paymentStatus}
              </p>
              <div className="mt-3">{renderTotals(phase.order)}</div>
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {phase.order ? (
              <button
                type="button"
                onClick={() => setPhase({ kind: 'awaiting-payment', order: phase.order! })}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
              >
                Try again
              </button>
            ) : null}
            <Link
              href="/orders"
              className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2"
            >
              View orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase.kind === 'pending') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-warning/10 text-warning">
            <Loader2 className="size-8" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Payment pending</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Your payment is being processed. We will confirm it shortly — check your orders page for updates.
          </p>
          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-line bg-surface-2/60 p-4 text-left">
            <p className="font-mono text-sm font-semibold text-ink">{phase.order.orderNumber}</p>
            <div className="mt-3">{renderTotals(phase.order)}</div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/orders"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              View orders
            </Link>
            <Link
              href="/my-courses"
              className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2"
            >
              My courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase.kind === 'cancelled') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-warning/10 text-warning">
            <XCircle className="size-8" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Payment cancelled</h2>
          <p className="mt-2 text-sm text-ink-muted">
            You cancelled the payment. Your order <span className="font-mono">{phase.order.orderNumber}</span> is still
            pending — you can retry payment anytime from your orders.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setPhase({ kind: 'awaiting-payment', order: phase.order })}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              Retry payment
            </button>
            <Link
              href="/orders"
              className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-2"
            >
              View orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Checkout form ---------- */

  const order = phase.kind === 'awaiting-payment' || phase.kind === 'processing' ? phase.order : null;
  const gateways = availableGateways.data?.gateways ?? [];
  const gatewaysLoading = availableGateways.isPending && Boolean(orderId);
  const gatewaysError = availableGateways.isError;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Checkout</h2>
        <p className="mt-1 text-sm text-ink-muted">Review your order, billing details and payment method.</p>
      </div>

      {status !== 'authenticated' ? (
        <EmptyState
          title="Sign in to checkout"
          description="Checkout requires an authenticated student account."
          action={
            <Link href="/login?next=/checkout" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
              Sign in
            </Link>
          }
        />
      ) : cartQuery.isPending ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : items.length === 0 && phase.kind === 'idle' ? (
        <EmptyState
          icon={<Receipt className="size-6" aria-hidden />}
          title="Nothing to check out"
          description="Your cart is empty. Add courses before checking out."
          action={
            <Link href="/courses" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
              Browse courses
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left: billing + payment */}
          <div className="space-y-6">
            {/* Order items (pre-checkout preview from cart) */}
            {phase.kind === 'idle' || phase.kind === 'creating-order' ? (
              <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
                  <Receipt className="size-4 text-primary" aria-hidden />
                  Order details
                </h3>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.courseId} className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-ink-subtle">
                        {item.thumbnail?.secureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumbnail.secureUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <Receipt className="size-4" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                        <p className="text-xs text-ink-subtle capitalize">{item.pricingType || 'course'}</p>
                      </div>
                      <p className="text-sm font-semibold text-ink">{formatMoney(item.finalPrice, item.currency)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Billing */}
            {phase.kind === 'idle' || phase.kind === 'creating-order' ? (
              <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <h3 className="mb-4 text-base font-semibold text-ink">Billing details</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">Full name</span>
                    <input className={inputClass} value={billingPrefill.fullName || ''} onChange={(e) => setBillingField('fullName', e.target.value)} placeholder="Your full name" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">Email</span>
                    <input className={inputClass} type="email" value={billingPrefill.email || ''} onChange={(e) => setBillingField('email', e.target.value)} placeholder="you@example.com" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">Phone</span>
                    <input className={inputClass} value={billingPrefill.phone || ''} onChange={(e) => setBillingField('phone', e.target.value)} placeholder="+91 …" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">Address line 1</span>
                    <input className={inputClass} value={billing.addressLine1 || ''} onChange={(e) => setBillingField('addressLine1', e.target.value)} placeholder="Street address" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">Address line 2</span>
                    <input className={inputClass} value={billing.addressLine2 || ''} onChange={(e) => setBillingField('addressLine2', e.target.value)} placeholder="Apartment, suite, etc. (optional)" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">City</span>
                    <input className={inputClass} value={billing.city || ''} onChange={(e) => setBillingField('city', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">State</span>
                    <input className={inputClass} value={billing.state || ''} onChange={(e) => setBillingField('state', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">Postal code</span>
                    <input className={inputClass} value={billing.postalCode || ''} onChange={(e) => setBillingField('postalCode', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">Country</span>
                    <input className={inputClass} value={billingPrefill.country || ''} onChange={(e) => setBillingField('country', e.target.value)} placeholder="IN" maxLength={2} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">GSTIN (optional)</span>
                    <input className={inputClass} value={billing.gstin || ''} onChange={(e) => setBillingField('gstin', e.target.value)} />
                  </label>
                </div>
                {!billingTouched ? (
                  <p className="mt-3 text-xs text-ink-subtle">
                    Prefilled from your profile. You can update any field before placing the order.
                  </p>
                ) : null}
              </section>
            ) : null}

            {/* Payment method */}
            {order ? (
              <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-ink">
                  <CreditCard className="size-4 text-primary" aria-hidden />
                  Payment method
                </h3>
                <p className="mb-4 text-xs text-ink-muted">
                  Order <span className="font-mono">{order.orderNumber}</span> ·{' '}
                  {formatMinor(order.totalPaise, order.currency)} due
                </p>

                {phase.kind === 'processing' ? (
                  <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 p-4">
                    <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-ink">Processing payment…</p>
                      <p className="text-xs text-ink-muted">Please do not close this page.</p>
                    </div>
                  </div>
                ) : gatewaysLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                ) : gatewaysError ? (
                  <ErrorState
                    title="Could not load payment methods"
                    description="Gateway availability could not be fetched for this order."
                    onRetry={() => availableGateways.refetch()}
                    retrying={availableGateways.isFetching}
                  />
                ) : gateways.length === 0 ? (
                  <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
                    <p className="text-sm font-semibold text-ink">No payment gateway available</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      No gateway is configured for billing country{' '}
                      <span className="font-medium">{availableGateways.data?.billingCountry ?? '—'}</span> right now.
                      Your order remains pending — please try again later or contact support.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gateways.map((gateway) => {
                      const meta = GATEWAY_META[gateway.provider] ?? {
                        label: gateway.provider,
                        description: `Pay with ${gateway.provider}`,
                        icon: Landmark,
                      };
                      const Icon = meta.icon;
                      const selected = selectedGateway === gateway.provider;
                      return (
                        <button
                          key={gateway.provider}
                          type="button"
                          onClick={() => handleGatewayPay(gateway.provider, order)}
                          disabled={createRazorpay.isPending || createPayPal.isPending}
                          className={cn(
                            'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all',
                            selected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                              : 'border-line bg-surface hover:border-primary/40 hover:bg-surface-2/50',
                            'disabled:cursor-not-allowed disabled:opacity-60'
                          )}
                        >
                          <span
                            className={cn(
                              'flex size-11 shrink-0 items-center justify-center rounded-xl',
                              selected ? 'bg-primary/15 text-primary' : 'bg-surface-2 text-ink-muted'
                            )}
                          >
                            <Icon className="size-5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-ink">{meta.label}</span>
                              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-subtle ring-1 ring-line">
                                {gateway.mode || 'test'}
                              </span>
                            </span>
                            <span className="mt-0.5 block text-xs text-ink-muted">{meta.description}</span>
                            <span className="mt-0.5 block text-[11px] text-ink-subtle">
                              Charged in {gateway.currency}
                            </span>
                          </span>
                          {(createRazorpay.isPending || createPayPal.isPending) && selected ? (
                            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                          ) : (
                            <span className="text-xs font-semibold text-primary">Pay now</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-subtle">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Payments are processed securely. SkillBee never stores your card or wallet credentials.
                </p>
              </section>
            ) : null}
          </div>

          {/* Right: summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h3 className="text-base font-semibold text-ink">Order summary</h3>

              {phase.kind === 'idle' || phase.kind === 'creating-order' ? (
                <>
                  <CouponSection courseIds={courseIds} onChange={setAppliedCoupon} />
                  <dl className="space-y-2 border-t border-line pt-4 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-muted">Subtotal</dt>
                      <dd className="font-medium text-ink">{formatMoney(cartSubtotal, currency)}</dd>
                    </div>
                    {appliedCoupon ? (
                      <div className="flex justify-between text-success">
                        <dt>Coupon ({appliedCoupon.code})</dt>
                        <dd>-{formatMoney(appliedCoupon.validation.discountAmount, currency)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-line pt-2.5 text-base font-bold">
                      <dt className="text-ink">Estimated total</dt>
                      <dd className="text-ink">
                        {formatMoney(appliedCoupon ? appliedCoupon.validation.finalPayableAmount : cartSubtotal, currency)}
                      </dd>
                    </div>
                  </dl>
                  <p className="text-[11px] leading-relaxed text-ink-subtle">
                    Taxes and the final amount are calculated by the server when you place the order.
                  </p>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={items.length === 0 || checkout.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkout.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
                    {checkout.isPending ? 'Creating order…' : 'Place order'}
                  </button>
                </>
              ) : order ? (
                <>
                  {renderOrderItems(order)}
                  <div className="border-t border-line pt-3">{renderTotals(order)}</div>
                  {order.paymentGateway && order.paymentGateway !== 'none' ? (
                    <p className="text-xs text-ink-muted">
                      Gateway:{' '}
                      <span className="font-medium capitalize">{order.paymentGateway}</span>
                    </p>
                  ) : null}
                  <Link
                    href="/orders"
                    className="block text-center text-sm font-medium text-ink-muted hover:text-ink"
                  >
                    View all orders
                  </Link>
                </>
              ) : null}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
