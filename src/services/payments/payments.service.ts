import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  AvailableGateways,
  PayPalCaptureResult,
  PayPalOrderResult,
  PaymentResult,
  RazorpayOrderResult,
  RazorpayVerifyInput,
  RazorpayVerifyResult,
} from '@/types/commerce';

/** Payment gateway APIs. Verification/capture is always backend-authoritative. */

export async function getAvailableGateways(orderId: string): Promise<AvailableGateways> {
  const res = await apiClient.get<ApiEnvelope<AvailableGateways>>(
    `/payments/available/${encodeURIComponent(orderId)}`
  );
  return res.data.data;
}

export async function createRazorpayOrder(orderId: string): Promise<RazorpayOrderResult> {
  const res = await apiClient.post<ApiEnvelope<RazorpayOrderResult>>('/payments/razorpay/create-order', {
    orderId,
  });
  return res.data.data;
}

export async function verifyRazorpayPayment(input: RazorpayVerifyInput): Promise<RazorpayVerifyResult> {
  const res = await apiClient.post<ApiEnvelope<RazorpayVerifyResult>>('/payments/razorpay/verify', input);
  return res.data.data;
}

export async function createPayPalOrder(orderId: string): Promise<PayPalOrderResult> {
  const res = await apiClient.post<ApiEnvelope<PayPalOrderResult>>('/payments/paypal/create-order', {
    orderId,
  });
  return res.data.data;
}

export async function capturePayPalOrder(orderId: string, paypalOrderId?: string): Promise<PayPalCaptureResult> {
  const res = await apiClient.post<ApiEnvelope<PayPalCaptureResult>>('/payments/paypal/capture-order', {
    orderId,
    paypalOrderId,
  });
  return res.data.data;
}

export type { PaymentResult };
