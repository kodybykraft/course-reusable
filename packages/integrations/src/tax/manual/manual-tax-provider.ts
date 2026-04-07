import type { TaxProvider, TaxCalculationRequest, TaxCalculationResult } from '../../types/tax-provider.js';

export interface ManualTaxConfig {
  rates: Array<{
    country: string;
    province?: string;
    rate: number; // decimal, e.g. 0.08 for 8%
    name: string;
    includeShipping?: boolean;
  }>;
}

/**
 * Manual tax provider — applies configured tax rates based on destination.
 * No external API calls. Rates are configured in code or via dashboard settings.
 */
export class ManualTaxProvider implements TaxProvider {
  readonly id = 'manual';
  readonly name = 'Manual Tax';

  constructor(private config: ManualTaxConfig) {}

  async calculateTax(request: TaxCalculationRequest): Promise<TaxCalculationResult> {
    const matchingRates = this.config.rates.filter((r) => {
      if (r.country !== request.toAddress.country) return false;
      if (r.province && request.toAddress.province && r.province !== request.toAddress.province) return false;
      return true;
    });

    if (matchingRates.length === 0) {
      return { totalTax: 0, shippingTax: 0, lineItems: [] };
    }

    let totalTax = 0;
    let shippingTax = 0;
    const lineItemResults: TaxCalculationResult['lineItems'] = [];

    for (const item of request.lineItems) {
      const itemTotal = item.amount * item.quantity;
      let itemTax = 0;

      for (const rate of matchingRates) {
        itemTax += Math.round(itemTotal * rate.rate);
      }

      lineItemResults.push({
        id: item.id,
        tax: itemTax,
        rate: matchingRates[0].rate,
        taxName: matchingRates[0].name,
      });

      totalTax += itemTax;
    }

    for (const rate of matchingRates) {
      if (rate.includeShipping && request.shipping > 0) {
        const sTax = Math.round(request.shipping * rate.rate);
        shippingTax += sTax;
        totalTax += sTax;
      }
    }

    return { totalTax, shippingTax, lineItems: lineItemResults };
  }
}
