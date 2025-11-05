import { PersonaType } from '@/types';

export const PERSONA_NAMES: Record<PersonaType, string> = {
  HIGH_UTILIZATION: 'High Utilization',
  VARIABLE_INCOME_BUDGETER: 'Variable Income Budgeter',
  SUBSCRIPTION_HEAVY: 'Subscription-Heavy',
  SAVINGS_BUILDER: 'Savings Builder',
  LOW_INCOME_STABILIZER: 'Low Income Stabilizer',
};

export const PERSONA_DESCRIPTIONS: Record<PersonaType, string> = {
  HIGH_UTILIZATION: 'Users with high credit card utilization or interest charges who need help managing credit',
  VARIABLE_INCOME_BUDGETER: 'Users with irregular income who need specialized budgeting strategies',
  SUBSCRIPTION_HEAVY: 'Users with many recurring subscriptions that may need auditing',
  SAVINGS_BUILDER: 'Users actively saving who can optimize their savings strategy',
  LOW_INCOME_STABILIZER: 'Users with limited income who need micro-budgeting and assistance',
};

export const PERSONA_FOCUS: Record<PersonaType, string> = {
  HIGH_UTILIZATION: 'Reduce utilization and interest charges, payment planning, autopay education',
  VARIABLE_INCOME_BUDGETER: 'Percent-based budgeting, emergency fund fundamentals, income smoothing strategies',
  SUBSCRIPTION_HEAVY: 'Subscription audit, cancellation/negotiation tactics, bill alert setup',
  SAVINGS_BUILDER: 'Goal setting, automation, APY optimization (HYSA/CD basics)',
  LOW_INCOME_STABILIZER: 'Micro-budgeting, building emergency fund on limited income, accessing assistance programs',
};

// Priority order: High Utilization → Variable Income → Subscription → Savings → Low Income
export const PERSONA_PRIORITY: Record<PersonaType, number> = {
  HIGH_UTILIZATION: 1,
  VARIABLE_INCOME_BUDGETER: 2,
  SUBSCRIPTION_HEAVY: 3,
  SAVINGS_BUILDER: 4,
  LOW_INCOME_STABILIZER: 5,
};

