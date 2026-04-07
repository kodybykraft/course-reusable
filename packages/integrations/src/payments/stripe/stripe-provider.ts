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

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  apiVersion?: string;
}

/**
 * Stripe payment provider.
 *
 * Uses the Stripe REST API directly (no SDK dependency) for portability.
 * In production, you may swap this with the official `stripe` npm package.
 */
export class StripeProvider implements PaymentProvider {
  readonly id = 'stripe';
  readonly name = 'Stripe';
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(private config: StripeConfig) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Stripe API error: ${err.error?.message ?? res.statusText}`);
    }
    return res.json();
  }

  private encode(params: Record<string, string | number | undefined>): string {
    return Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
  }

  async createCustomer(data: CreateCustomerData): Promise<string> {
    const result = await this.request<{ id: string }>('/customers', {
      method: 'POST',
      body: this.encode({ email: data.email, name: data.name }),
    });
    return result.id;
  }

  async createSetupIntent(customerId: string): Promise<SetupIntentResult> {
    const result = await this.request<{ id: string; client_secret: string }>('/setup_intents', {
      method: 'POST',
      body: this.encode({ customer: customerId, 'payment_method_types[]': 'card' }),
    });
    return { id: result.id, clientSecret: result.client_secret };
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethodInfo[]> {
    const result = await this.request<{
      data: Array<{
        id: string;
        type: string;
        card?: { last4: string; brand: string; exp_month: number; exp_year: number };
      }>;
    }>(`/payment_methods?customer=${customerId}&type=card`);

    return result.data.map((pm) => ({
      id: pm.id,
      type: 'card' as const,
      last4: pm.card?.last4,
      brand: pm.card?.brand,
      expiryMonth: pm.card?.exp_month,
      expiryYear: pm.card?.exp_year,
    }));
  }

  async createPaymentIntent(data: CreatePaymentData): Promise<PaymentIntentResult> {
    const params: Record<string, string | number | undefined> = {
      amount: data.amount,
      currency: data.currency.toLowerCase(),
      customer: data.customerId,
      'metadata[orderId]': data.orderId,
    };

    const result = await this.request<{
      id: string;
      client_secret: string;
      status: string;
    }>('/payment_intents', {
      method: 'POST',
      body: this.encode(params),
    });

    return {
      id: result.id,
      clientSecret: result.client_secret,
      status: this.mapStatus(result.status),
    };
  }

  async capturePayment(intentId: string): Promise<CaptureResult> {
    const result = await this.request<{ id: string; status: string; amount: number }>(
      `/payment_intents/${intentId}/capture`,
      { method: 'POST' },
    );

    return {
      id: result.id,
      status: result.status === 'succeeded' ? 'succeeded' : 'failed',
      amount: result.amount,
    };
  }

  async refundPayment(intentId: string, amount?: number): Promise<RefundResult> {
    const params: Record<string, string | number | undefined> = {
      payment_intent: intentId,
      amount,
    };

    const result = await this.request<{ id: string; status: string; amount: number }>('/refunds', {
      method: 'POST',
      body: this.encode(params),
    });

    return {
      id: result.id,
      status: result.status === 'succeeded' ? 'succeeded' : 'pending',
      amount: result.amount,
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Synchronous signature format check — real verification is async.
    // Use verifyWebhookSignatureAsync for cryptographic verification.
    if (!signature || !payload) return false;
    const parts = signature.split(',');
    const tPart = parts.find((p) => p.startsWith('t='));
    const v1Part = parts.find((p) => p.startsWith('v1='));
    return !!(tPart && v1Part);
  }

  async verifyWebhookSignatureAsync(payload: string, signature: string): Promise<boolean> {
    try {
      if (!signature || !payload) return false;

      const parts = signature.split(',');
      const tPart = parts.find((p) => p.startsWith('t='));
      const v1Part = parts.find((p) => p.startsWith('v1='));
      if (!tPart || !v1Part) return false;

      const timestamp = tPart.substring(2);
      const expectedSig = v1Part.substring(3);

      // Reject requests older than 5 minutes (replay protection)
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - parseInt(timestamp, 10)) > 300) return false;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(this.config.webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );

      const signedPayload = `${timestamp}.${payload}`;
      const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
      const computedSig = Array.from(new Uint8Array(mac))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Timing-safe comparison
      if (computedSig.length !== expectedSig.length) return false;
      let mismatch = 0;
      for (let i = 0; i < computedSig.length; i++) {
        mismatch |= computedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
      }
      return mismatch === 0;
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------------

  async createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<{
    id: string;
    status: string;
    clientSecret: string | null;
    currentPeriodStart: number;
    currentPeriodEnd: number;
  }> {
    const params: Record<string, string | number | undefined> = {
      customer: customerId,
      'items[0][price]': priceId,
      payment_behavior: 'default_incomplete',
      'payment_settings[save_default_payment_method]': 'on_subscription',
      'expand[]': 'latest_invoice.payment_intent',
    };
    if (metadata) {
      for (const [k, v] of Object.entries(metadata)) {
        params[`metadata[${k}]`] = v;
      }
    }

    const result = await this.request<{
      id: string;
      status: string;
      current_period_start: number;
      current_period_end: number;
      latest_invoice: { payment_intent: { client_secret: string } | null } | null;
    }>('/subscriptions', { method: 'POST', body: this.encode(params) });

    return {
      id: result.id,
      status: result.status,
      clientSecret: result.latest_invoice?.payment_intent?.client_secret ?? null,
      currentPeriodStart: result.current_period_start,
      currentPeriodEnd: result.current_period_end,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<{ id: string; status: string }> {
    const result = await this.request<{ id: string; status: string }>(
      `/subscriptions/${subscriptionId}`,
      { method: 'DELETE' },
    );
    return { id: result.id, status: result.status };
  }

  async createPrice(input: {
    unitAmount: number;
    currency: string;
    interval: 'month' | 'year';
    productName: string;
  }): Promise<{ id: string; productId: string }> {
    // Create product first
    const product = await this.request<{ id: string }>('/products', {
      method: 'POST',
      body: this.encode({ name: input.productName }),
    });

    const price = await this.request<{ id: string }>('/prices', {
      method: 'POST',
      body: this.encode({
        unit_amount: input.unitAmount,
        currency: input.currency.toLowerCase(),
        'recurring[interval]': input.interval,
        product: product.id,
      }),
    });

    return { id: price.id, productId: product.id };
  }

  // ---------------------------------------------------------------------------
  // Checkout Session (redirect-based)
  // ---------------------------------------------------------------------------

  async createCheckoutSession(input: {
    mode: 'payment' | 'subscription';
    lineItems: { priceInCents: number; name: string; quantity: number }[];
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    metadata?: Record<string, string>;
    stripePriceId?: string;
  }): Promise<{ sessionId: string; url: string }> {
    const params: Record<string, string | number | undefined> = {
      mode: input.mode,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      customer: input.customerId,
    };

    if (input.mode === 'subscription' && input.stripePriceId) {
      params['line_items[0][price]'] = input.stripePriceId;
      params['line_items[0][quantity]'] = 1;
    } else {
      input.lineItems.forEach((item, i) => {
        params[`line_items[${i}][price_data][currency]`] = 'usd';
        params[`line_items[${i}][price_data][unit_amount]`] = item.priceInCents;
        params[`line_items[${i}][price_data][product_data][name]`] = item.name;
        params[`line_items[${i}][quantity]`] = item.quantity;
      });
    }

    if (input.metadata) {
      for (const [k, v] of Object.entries(input.metadata)) {
        params[`metadata[${k}]`] = v;
      }
    }

    const result = await this.request<{ id: string; url: string }>('/checkout/sessions', {
      method: 'POST',
      body: this.encode(params),
    });

    return { sessionId: result.id, url: result.url };
  }

  async getCheckoutSession(sessionId: string): Promise<{
    id: string;
    paymentStatus: string;
    paymentIntentId: string | null;
    subscriptionId: string | null;
    customerId: string | null;
    metadata: Record<string, string>;
  }> {
    const result = await this.request<{
      id: string;
      payment_status: string;
      payment_intent: string | null;
      subscription: string | null;
      customer: string | null;
      metadata: Record<string, string>;
    }>(`/checkout/sessions/${sessionId}`);

    return {
      id: result.id,
      paymentStatus: result.payment_status,
      paymentIntentId: result.payment_intent,
      subscriptionId: result.subscription,
      customerId: result.customer,
      metadata: result.metadata ?? {},
    };
  }

  async handleWebhook(event: { type: string; data: { object: Record<string, unknown> } }): Promise<WebhookResult> {
    const eventType = event.type;

    switch (eventType) {
      case 'payment_intent.succeeded':
        return { eventType, handled: true, data: { intentId: event.data.object.id } };
      case 'payment_intent.payment_failed':
        return { eventType, handled: true, data: { intentId: event.data.object.id, error: event.data.object.last_payment_error } };
      case 'charge.refunded':
        return { eventType, handled: true, data: { chargeId: event.data.object.id } };
      case 'checkout.session.completed':
        return { eventType, handled: true, data: { sessionId: event.data.object.id, paymentStatus: event.data.object.payment_status, metadata: event.data.object.metadata } };
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        return { eventType, handled: true, data: { subscriptionId: event.data.object.id, status: event.data.object.status, currentPeriodEnd: event.data.object.current_period_end } };
      case 'customer.subscription.deleted':
        return { eventType, handled: true, data: { subscriptionId: event.data.object.id, status: 'cancelled' } };
      case 'invoice.payment_failed':
        return { eventType, handled: true, data: { subscriptionId: event.data.object.subscription, invoiceId: event.data.object.id } };
      default:
        return { eventType, handled: false };
    }
  }

  private mapStatus(stripeStatus: string): PaymentIntentResult['status'] {
    switch (stripeStatus) {
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'requires_payment';
      case 'processing':
        return 'processing';
      case 'succeeded':
        return 'succeeded';
      case 'canceled':
        return 'cancelled';
      default:
        return 'requires_payment';
    }
  }
}
