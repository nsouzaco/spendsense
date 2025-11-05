// Time windows for signal detection
export const TIME_WINDOWS = {
  SHORT: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  LONG: 180 * 24 * 60 * 60 * 1000, // 180 days in milliseconds
} as const;

// Subscription detection thresholds
export const SUBSCRIPTION_THRESHOLDS = {
  MIN_OCCURRENCES: 3,
  DETECTION_WINDOW_DAYS: 90,
  MIN_MONTHLY_SPEND: 50,
  MIN_SHARE_PERCENTAGE: 10,
} as const;

// Credit utilization thresholds
export const CREDIT_THRESHOLDS = {
  LOW: 0.3, // 30%
  MEDIUM: 0.5, // 50%
  HIGH: 0.8, // 80%
} as const;

// Income stability thresholds
export const INCOME_THRESHOLDS = {
  MAX_GAP_DAYS: 45,
  MIN_BUFFER_MONTHS: 1,
  LOW_INCOME_ANNUAL: 30000,
  LOW_INCOME_MONTHLY: 2500,
} as const;

// Savings thresholds
export const SAVINGS_THRESHOLDS = {
  MIN_GROWTH_RATE: 0.02, // 2%
  MIN_MONTHLY_INFLOW: 200,
  MIN_EMERGENCY_FUND_MONTHS: 3,
} as const;

// General thresholds
export const GENERAL_THRESHOLDS = {
  MIN_BEHAVIORS_FOR_COVERAGE: 3,
} as const;

