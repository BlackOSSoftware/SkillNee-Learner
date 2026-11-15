'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Tag, X } from 'lucide-react';
import { useValidateCoupon } from '@/hooks/coupons/use-coupons';
import { normalizeApiError } from '@/lib/api-error';
import { formatMoney } from '@/lib/money';
import type { CouponValidation } from '@/types/commerce';
import { cn } from '@/lib/cn';

export interface AppliedCoupon {
  code: string;
  validation: CouponValidation;
}

/**
 * Self-contained coupon section. Validates via POST /coupons/validate with
 * the current courseIds, displays the backend-authoritative discount, and
 * automatically re-validates when the cart contents change.
 */
export function CouponSection({
  courseIds,
  onChange,
}: {
  courseIds: string[];
  onChange: (applied: AppliedCoupon | null) => void;
}) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const validateCoupon = useValidateCoupon();
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const courseKey = courseIds.slice().sort().join(',');

  // Re-validate the applied coupon whenever cart contents change.
  // State updates happen only inside async mutation callbacks.
  useEffect(() => {
    if (!applied || courseIds.length === 0) return;
    let cancelled = false;
    validateCoupon.mutate(
      { couponCode: applied.code, courseIds },
      {
        onSuccess: (validation) => {
          if (cancelled) return;
          const next = { code: applied.code, validation };
          setApplied(next);
          onChangeRef.current(next);
        },
        onError: (err) => {
          if (cancelled) return;
          setApplied(null);
          onChangeRef.current(null);
          setError(normalizeApiError(err).message);
        },
      }
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseKey]);

  const handleApply = () => {
    const trimmed = code.trim();
    if (!trimmed || courseIds.length === 0) return;
    setError(null);
    validateCoupon.mutate(
      { couponCode: trimmed, courseIds },
      {
        onSuccess: (validation) => {
          const next = { code: trimmed.toUpperCase(), validation };
          setApplied(next);
          onChangeRef.current(next);
        },
        onError: (err) => {
          setApplied(null);
          onChangeRef.current(null);
          setError(normalizeApiError(err).message);
        },
      }
    );
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    setError(null);
    onChangeRef.current(null);
  };

  if (applied) {
    const v = applied.validation;
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-success/15 text-success">
              <Tag className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                {applied.code}
                <span className="ml-2 text-xs font-medium text-success">Applied</span>
              </p>
              <p className="text-xs text-ink-muted">
                {v.coupon.discountType === 'percentage'
                  ? `${v.coupon.discountValue}% off`
                  : `${formatMoney(v.coupon.discountValue, v.coupon.currency || v.currency)} off`}
                {' · '}You save {formatMoney(v.discountAmount, v.currency)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-md p-1.5 text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Remove coupon"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="Coupon code"
          disabled={courseIds.length === 0 || validateCoupon.isPending}
          className={cn(
            'h-10 min-w-0 flex-1 rounded-lg border border-field-border bg-field px-3 text-sm text-ink',
            'placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
          aria-label="Coupon code"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || courseIds.length === 0 || validateCoupon.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {validateCoupon.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Apply
        </button>
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-danger">{error}</p> : null}
      {courseIds.length === 0 ? (
        <p className="mt-2 text-xs text-ink-subtle">Add courses to your cart to apply a coupon.</p>
      ) : null}
    </div>
  );
}
