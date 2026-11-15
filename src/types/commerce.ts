/** Commerce types — cart, checkout, orders, coupons, payments. Mirrors backend schemas. */

export interface CartItem {
  courseId: string;
  title: string;
  slug: string;
  thumbnail?: { secureUrl?: string; publicId?: string } | null;
  addedAt?: string;
  finalPrice: number;
  finalPricePaise: number;
  currency: string;
  pricingType?: string;
}

export interface Cart {
  studentId: string;
  items: CartItem[];
  itemCount: number;
}

export interface CartEnvelope {
  cart: Cart;
}

export interface BillingDetails {
  fullName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  gstin?: string;
}

export interface CheckoutInput {
  useCart?: boolean;
  clearCart?: boolean;
  courseIds?: string[];
  couponCode?: string;
  billing?: BillingDetails;
}

export interface OrderItem {
  courseId: string;
  courseName: string;
  courseSlug?: string;
  courseThumbnail?: { secureUrl?: string } | null;
  regularPrice?: number | null;
  salePrice?: number | null;
  finalPrice: number;
  finalPricePaise: number;
  currency: string;
  discountPaise: number;
  taxPaise: number;
  itemTotalPaise: number;
}

export interface CouponSnapshot {
  couponId?: string;
  code?: string;
  discountType?: string;
  discountValue?: number;
  originalSubtotalPaise?: number;
  originalSubtotal?: number;
  eligibleSubtotalPaise?: number;
  discountPaise?: number;
  discountAmount?: number;
  finalAmountPaise?: number;
  finalAmount?: number;
  currency?: string;
  maximumDiscountAmount?: number | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber?: string | null;
  studentId: string;
  items: OrderItem[];
  billing: BillingDetails;
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  totalAmount: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  paymentGateway: string;
  paymentCurrency?: string | null;
  paymentAmountMinor?: number | null;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  couponSnapshot?: CouponSnapshot | null;
  fulfillmentStatus?: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
}

export interface CheckoutResult {
  order: Order;
  requiresPayment: boolean;
  message?: string;
}

export interface CouponValidation {
  valid: boolean;
  currency: string;
  originalSubtotal: number;
  originalSubtotalPaise: number;
  discountAmount: number;
  discountAmountPaise: number;
  finalPayableAmount: number;
  finalPayableAmountPaise: number;
  coupon: {
    code: string;
    discountType: string;
    discountValue: number;
    currency?: string;
  };
}

export interface ValidateCouponInput {
  couponCode: string;
  courseIds: string[];
}

export interface PaymentGatewayInfo {
  provider: 'razorpay' | 'paypal' | string;
  currency: string;
  mode?: string;
  reason?: string;
}

export interface AvailableGateways {
  billingCountry: string;
  gateways: PaymentGatewayInfo[];
  defaultGateway: string | null;
}

export interface RazorpayOrderResult {
  provider: 'razorpay';
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  amountMinor: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  name: string;
  email: string;
  contact: string;
  callbackUrl?: string;
}

export interface RazorpayVerifyInput {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyResult {
  verified: boolean;
  success: boolean;
  order: Order;
  payment?: unknown;
}

export interface PayPalOrderResult {
  provider: 'paypal';
  paypalOrderId: string;
  approveUrl: string;
  amountMinor: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  fxSnapshot?: { fromCurrency: string; toCurrency: string; rate: string } | null;
}

export interface PayPalCaptureResult {
  success: boolean;
  pending?: boolean;
  alreadyCompleted?: boolean;
  order: Order;
}

export interface PaymentResult {
  order: Order;
  success: boolean;
  pending?: boolean;
  verified?: boolean;
  alreadyCompleted?: boolean;
}
