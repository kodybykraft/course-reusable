import { useState, useCallback } from 'react';
import { useCourse } from '../context/course-context.js';

interface CheckoutResult {
  type: 'redirect' | 'enrolled';
  checkoutUrl?: string;
  sessionId?: string;
  purchaseId: string;
  courseId?: string;
}

interface CouponValidation {
  originalPrice: number;
  discount: number;
  finalPrice: number;
  coupon: { code: string; type: string; value: number };
}

export function useCheckout() {
  const { fetcher } = useCourse();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async (input: {
    productId: string;
    couponCode?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher<CheckoutResult>('/checkout', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      // If Stripe redirect, navigate the browser
      if (result.type === 'redirect' && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  const validateCoupon = useCallback(async (code: string, price: number): Promise<CouponValidation | null> => {
    try {
      return await fetcher<CouponValidation>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, price }),
      });
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [fetcher]);

  return { checkout, validateCoupon, loading, error };
}

export function useSubscription() {
  const { fetcher } = useCourse();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(async (planId: string, stripeCustomerId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher<{ subscription: any; clientSecret: string | null }>('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planId, stripeCustomerId }),
      });
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  const cancel = useCallback(async (subscriptionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetcher(`/subscriptions/${subscriptionId}/cancel`, { method: 'POST' });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  return { subscribe, cancel, loading, error };
}
