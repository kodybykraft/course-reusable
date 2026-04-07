import type { Money, Currency } from '@course/core';

export interface CreateCustomerData {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentData {
  amount: Money;
  currency: Currency;
  customerId?: string;
  orderId?: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string | null;
  status: 'requires_payment' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  approvalUrl?: string; // PayPal redirect URL
}

export interface CaptureResult {
  id: string;
  status: 'succeeded' | 'failed';
  amount: Money;
  errorMessage?: string;
}

export interface RefundResult {
  id: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: Money;
  errorMessage?: string;
}

export interface SetupIntentResult {
  id: string;
  clientSecret: string;
}

export interface PaymentMethodInfo {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface WebhookResult {
  eventType: string;
  handled: boolean;
  data?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;

  // Customer management
  createCustomer(data: CreateCustomerData): Promise<string>;

  // Payment methods
  createSetupIntent(customerId: string): Promise<SetupIntentResult>;
  listPaymentMethods(customerId: string): Promise<PaymentMethodInfo[]>;

  // Payments
  createPaymentIntent(data: CreatePaymentData): Promise<PaymentIntentResult>;
  capturePayment(intentId: string): Promise<CaptureResult>;
  refundPayment(intentId: string, amount?: Money): Promise<RefundResult>;

  // Webhooks
  verifyWebhookSignature(payload: string, signature: string): boolean;
  handleWebhook(event: unknown): Promise<WebhookResult>;
}
