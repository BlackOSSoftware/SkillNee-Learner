'use client';

import { useMutation } from '@tanstack/react-query';
import { validateCoupon } from '@/services/coupons/coupons.service';
import type { CouponValidation, ValidateCouponInput } from '@/types/commerce';

/**
 * Coupon validation is a mutation (POST), not a cached query —
 * the backend result depends on live cart contents and usage limits.
 */
export function useValidateCoupon() {
  return useMutation<CouponValidation, unknown, ValidateCouponInput>({
    mutationFn: validateCoupon,
  });
}
