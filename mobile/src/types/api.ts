import type { CategoryKey } from '../constants/categories';
import type { PaymentMethodKey } from '../constants/paymentMethods';

export type User = {
  id: string;
  name: string;
  email: string;
  monthlyBudget: number;
  isGuest?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Expense = {
  id: string;
  userId: string;
  amount: number;
  category: CategoryKey;
  paymentMethod: PaymentMethodKey;
  isRecurring: boolean;
  note: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type InsightCategory = {
  category: CategoryKey;
  total: number;
  percent: number;
  color: string;
  icon: string;
  label: string;
};

export type InsightOverview = {
  summary: {
    totalSpent: number;
    budget: number;
    remaining: number;
    previousMonthTotal: number;
    changePercent: number;
    spentPercentOfBudget: number;
    averageDailySpend: number;
    transactionCount: number;
    budgetStatus: 'healthy' | 'warning' | 'over';
  };
  categoryBreakdown: InsightCategory[];
  monthlyTrend: Array<{
    month: string;
    total: number;
  }>;
  alerts: Array<{
    id: string;
    level: 'healthy' | 'warning' | 'over' | 'info';
    title: string;
    message: string;
  }>;
  recentExpenses: Expense[];
  highlightText: {
    category: string;
    trend: string;
  };
};
