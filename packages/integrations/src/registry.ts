import type { PaymentProvider } from './types/payment-provider.js';
import type { ShippingProvider } from './types/shipping-provider.js';
import type { EmailProvider } from './types/email-provider.js';
import type { TaxProvider } from './types/tax-provider.js';

type ProviderType = 'payment' | 'shipping' | 'email' | 'tax';
type AnyProvider = PaymentProvider | ShippingProvider | EmailProvider | TaxProvider;

class ProviderRegistry {
  private providers = new Map<string, AnyProvider>();

  register(type: ProviderType, provider: AnyProvider): void {
    this.providers.set(`${type}:${provider.id}`, provider);
  }

  get<T extends AnyProvider>(type: ProviderType, id: string): T {
    const key = `${type}:${id}`;
    const provider = this.providers.get(key);
    if (!provider) throw new Error(`Provider not found: ${key}`);
    return provider as T;
  }

  getPayment(id: string): PaymentProvider {
    return this.get<PaymentProvider>('payment', id);
  }

  getShipping(id: string): ShippingProvider {
    return this.get<ShippingProvider>('shipping', id);
  }

  getEmail(id: string): EmailProvider {
    return this.get<EmailProvider>('email', id);
  }

  getTax(id: string): TaxProvider {
    return this.get<TaxProvider>('tax', id);
  }

  listByType(type: ProviderType): AnyProvider[] {
    const prefix = `${type}:`;
    const result: AnyProvider[] = [];
    for (const [key, provider] of this.providers) {
      if (key.startsWith(prefix)) result.push(provider);
    }
    return result;
  }
}

export const providerRegistry = new ProviderRegistry();
export type { ProviderRegistry };
