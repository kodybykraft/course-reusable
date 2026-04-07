import type { Money, Currency } from '../types/common.js';

/** Add two money amounts (integer cents) */
export function addMoney(a: Money, b: Money): Money {
  return a + b;
}

/** Subtract b from a (integer cents) */
export function subtractMoney(a: Money, b: Money): Money {
  return a - b;
}

/** Multiply money by a quantity */
export function multiplyMoney(amount: Money, quantity: number): Money {
  return Math.round(amount * quantity);
}

/** Apply a percentage discount. Returns the discount amount. */
export function percentageOf(amount: Money, percentage: number): Money {
  return Math.round((amount * percentage) / 100);
}

/** Format cents to a display string, e.g. 1999 -> "$19.99" */
export function formatMoney(cents: Money, currency: Currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/** Convert dollars to cents */
export function toCents(dollars: number): Money {
  return Math.round(dollars * 100);
}

/** Convert cents to dollars */
export function toDollars(cents: Money): number {
  return cents / 100;
}

/** Ensure money is non-negative */
export function clampMoney(amount: Money): Money {
  return Math.max(0, amount);
}

/** Sum an array of money amounts */
export function sumMoney(amounts: Money[]): Money {
  return amounts.reduce((sum, amount) => sum + amount, 0);
}
