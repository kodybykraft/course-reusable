/** All money values are stored as integer cents to avoid floating-point issues */
export type Money = number & { __brand?: 'Money' };

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortInput {
  field: string;
  direction: SortDirection;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type CourseStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'active' | 'completed' | 'paused' | 'expired';
export type PurchaseStatus = 'pending' | 'completed' | 'refunded';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';
export type CouponType = 'percentage' | 'fixed';
export type Currency = string; // ISO 4217, e.g. 'USD'
