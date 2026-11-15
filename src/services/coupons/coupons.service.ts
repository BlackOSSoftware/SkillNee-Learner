import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type { CouponValidation, ValidateCouponInput } from '@/types/commerce';

/** Coupon validation API — backend is the authoritative discount calculator. */

export async function validateCoupon(input: ValidateCouponInput): Promise<CouponValidation> {
  const res = await apiClient.post<ApiEnvelope<CouponValidation>>('/coupons/validate', input);
  return res.data.data;
}
