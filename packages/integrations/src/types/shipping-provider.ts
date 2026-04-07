import type { Money } from '@course/core';

export interface ShippingRateQuote {
  id: string;
  name: string;
  price: Money;
  currency: string;
  estimatedDays?: number;
  carrier?: string;
}

export interface ShippingLabel {
  id: string;
  trackingNumber: string;
  trackingUrl: string;
  labelUrl: string;
  carrier: string;
}

export interface ShippingProvider {
  readonly id: string;
  readonly name: string;

  getRates(input: {
    originZip: string;
    destinationZip: string;
    destinationCountry: string;
    weight: number;
    weightUnit: string;
  }): Promise<ShippingRateQuote[]>;

  createLabel?(input: {
    rateId: string;
    fromAddress: Record<string, string>;
    toAddress: Record<string, string>;
  }): Promise<ShippingLabel>;

  trackShipment?(trackingNumber: string): Promise<{
    status: string;
    estimatedDelivery?: Date;
    events: Array<{ date: Date; description: string; location?: string }>;
  }>;
}
