import type {
  PaymentProvider,
  CreateCustomerData,
  CreatePaymentData,
  PaymentIntentResult,
  CaptureResult,
  RefundResult,
  SetupIntentResult,
  PaymentMethodInfo,
  WebhookResult,
} from '../../types/payment-provider.js';
import type { Money } from '@course/core';

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  webhookId: string;
  sandbox?: boolean;
}

/**
 * PayPal payment provider using PayPal REST API v2.
 */
export class PayPalProvider implements PaymentProvider {
  readonly id = 'paypal';
  readonly name = 'PayPal';
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private config: PayPalConfig) {
    this.baseUrl = config.sandbox
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new Error('Failed to get PayPal access token');
    const data = await res.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`PayPal API error: ${JSON.stringify(err)}`);
    }
    return res.json();
  }

  async createCustomer(_data: CreateCustomerData): Promise<string> {
    // PayPal doesn't have explicit customer creation like Stripe.
    // The payer is identified by email during payment.
    return `paypal_${crypto.randomUUID()}`;
  }

  async createSetupIntent(_customerId: string): Promise<SetupIntentResult> {
    // PayPal uses vault tokens instead of setup intents
    return { id: `paypal_setup_${crypto.randomUUID()}`, clientSecret: '' };
  }

  async listPaymentMethods(_customerId: string): Promise<PaymentMethodInfo[]> {
    // PayPal vault API would be used here
    return [];
  }

  async createPaymentIntent(data: CreatePaymentData): Promise<PaymentIntentResult> {
    const dollars = (data.amount / 100).toFixed(2);

    const order = await this.request<{
      id: string;
      status: string;
      links: Array<{ rel: string; href: string }>;
    }>('/v2/checkout/orders', {
      method: 'POST',
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: data.currency.toUpperCase(),
              value: dollars,
            },
            reference_id: data.orderId,
          },
        ],
        application_context: {
          return_url: data.returnUrl,
          cancel_url: data.cancelUrl,
        },
      }),
    });

    const approvalUrl = order.links.find((l) => l.rel === 'approve')?.href;

    return {
      id: order.id,
      clientSecret: null,
      status: 'requires_payment',
      approvalUrl,
    };
  }

  async capturePayment(orderId: string): Promise<CaptureResult> {
    const result = await this.request<{
      id: string;
      status: string;
      purchase_units: Array<{
        payments: { captures: Array<{ amount: { value: string } }> };
      }>;
    }>(`/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
    });

    const capturedAmount = result.purchase_units[0]?.payments?.captures[0]?.amount?.value;
    const amount = capturedAmount ? Math.round(parseFloat(capturedAmount) * 100) : 0;

    return {
      id: result.id,
      status: result.status === 'COMPLETED' ? 'succeeded' : 'failed',
      amount,
    };
  }

  async refundPayment(captureId: string, amount?: Money): Promise<RefundResult> {
    const body: Record<string, unknown> = {};
    if (amount) {
      body.amount = {
        value: (amount / 100).toFixed(2),
        currency_code: 'USD',
      };
    }

    const result = await this.request<{ id: string; status: string }>(`/v2/payments/captures/${captureId}/refund`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      id: result.id,
      status: result.status === 'COMPLETED' ? 'succeeded' : 'pending',
      amount: amount ?? 0,
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Synchronous basic validation — real verification is async via verifyWebhookAsync.
    if (!signature || signature.trim().length === 0) return false;
    try {
      JSON.parse(payload);
    } catch {
      return false;
    }
    return true;
  }

  async verifyWebhookAsync(
    payload: string,
    headers: {
      transmissionId: string;
      transmissionTime: string;
      certUrl: string;
      authAlgo: string;
      transmissionSig: string;
    },
  ): Promise<boolean> {
    try {
      // Validate cert_url against PayPal domains to prevent SSRF
      const ALLOWED_CERT_ORIGINS = ['https://api.paypal.com', 'https://api-m.paypal.com', 'https://api-m.sandbox.paypal.com'];
      try {
        const origin = new URL(headers.certUrl).origin;
        if (!ALLOWED_CERT_ORIGINS.includes(origin)) return false;
      } catch { return false; }

      const body = JSON.parse(payload);
      const result = await this.request<{ verification_status: string }>(
        '/v1/notifications/verify-webhook-signature',
        {
          method: 'POST',
          body: JSON.stringify({
            auth_algo: headers.authAlgo,
            cert_url: headers.certUrl,
            transmission_id: headers.transmissionId,
            transmission_sig: headers.transmissionSig,
            transmission_time: headers.transmissionTime,
            webhook_id: this.config.webhookId,
            webhook_event: body,
          }),
        },
      );
      return result.verification_status === 'SUCCESS';
    } catch {
      return false;
    }
  }

  async handleWebhook(
    event: { event_type: string; resource: Record<string, unknown> },
    webhookPayload?: string,
    webhookHeaders?: {
      transmissionId: string;
      transmissionTime: string;
      certUrl: string;
      authAlgo: string;
      transmissionSig: string;
    },
  ): Promise<WebhookResult> {
    // Verify webhook signature asynchronously if headers are provided
    if (webhookPayload && webhookHeaders) {
      const verified = await this.verifyWebhookAsync(webhookPayload, webhookHeaders);
      if (!verified) {
        return { eventType: event.event_type, handled: false, data: { error: 'Invalid webhook signature' } };
      }
    }
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        return { eventType: event.event_type, handled: true, data: { captureId: event.resource.id } };
      case 'PAYMENT.CAPTURE.REFUNDED':
        return { eventType: event.event_type, handled: true, data: { captureId: event.resource.id } };
      default:
        return { eventType: event.event_type, handled: false };
    }
  }
}
