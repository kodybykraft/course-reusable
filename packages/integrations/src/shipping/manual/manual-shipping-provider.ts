import type { ShippingProvider, ShippingRateQuote } from '../../types/shipping-provider.js';

export interface ManualShippingConfig {
  rates: Array<{
    id: string;
    name: string;
    price: number; // cents
    minWeight?: number;
    maxWeight?: number;
    countries?: string[];
    estimatedDays?: number;
  }>;
}

/**
 * Manual shipping provider — flat rate and weight-based shipping.
 * No external API calls. Rates are configured in code or via dashboard settings.
 */
export class ManualShippingProvider implements ShippingProvider {
  readonly id = 'manual';
  readonly name = 'Manual Shipping';

  constructor(private config: ManualShippingConfig) {}

  async getRates(input: {
    originZip: string;
    destinationZip: string;
    destinationCountry: string;
    weight: number;
    weightUnit: string;
  }): Promise<ShippingRateQuote[]> {
    return this.config.rates
      .filter((rate) => {
        if (rate.countries && !rate.countries.includes(input.destinationCountry)) return false;
        if (rate.minWeight !== undefined && input.weight < rate.minWeight) return false;
        if (rate.maxWeight !== undefined && input.weight > rate.maxWeight) return false;
        return true;
      })
      .map((rate) => ({
        id: rate.id,
        name: rate.name,
        price: rate.price,
        currency: 'USD',
        estimatedDays: rate.estimatedDays,
      }));
  }
}
