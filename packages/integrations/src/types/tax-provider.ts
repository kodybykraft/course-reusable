import type { Money } from '@course/core';

export interface TaxCalculationRequest {
  fromAddress: { country: string; province?: string; zip?: string };
  toAddress: { country: string; province?: string; zip?: string };
  lineItems: Array<{
    id: string;
    amount: Money;
    quantity: number;
    taxCode?: string;
  }>;
  shipping: Money;
  customerId?: string;
}

export interface TaxCalculationResult {
  totalTax: Money;
  shippingTax: Money;
  lineItems: Array<{
    id: string;
    tax: Money;
    rate: number;
    taxName: string;
  }>;
}

export interface TaxProvider {
  readonly id: string;
  readonly name: string;

  calculateTax(request: TaxCalculationRequest): Promise<TaxCalculationResult>;

  createTransaction?(orderId: string, request: TaxCalculationRequest): Promise<{ transactionId: string }>;
  refundTransaction?(transactionId: string, amount: Money): Promise<void>;
}
