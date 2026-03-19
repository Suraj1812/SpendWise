export const categoryKeys = [
  'food',
  'travel',
  'shopping',
  'bills',
  'health',
  'entertainment',
  'groceries',
  'utilities',
] as const;

export type CategoryKey = (typeof categoryKeys)[number];

export const paymentMethodKeys = ['upi', 'card', 'cash', 'bank'] as const;

export type PaymentMethodKey = (typeof paymentMethodKeys)[number];

export const expenseSortKeys = ['latest', 'oldest', 'highest', 'lowest'] as const;

export type ExpenseSortKey = (typeof expenseSortKeys)[number];

export type BudgetStatus = 'healthy' | 'warning' | 'over';

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  monthlyBudget: number;
  isGuest?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<UserRecord, 'passwordHash'>;

export type ExpenseRecord = {
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

export type DatabaseSchema = {
  users: UserRecord[];
  expenses: ExpenseRecord[];
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
    budgetStatus: BudgetStatus;
  };
  categoryBreakdown: InsightCategory[];
  monthlyTrend: Array<{
    month: string;
    total: number;
  }>;
  alerts: Array<{
    id: string;
    level: BudgetStatus | 'info';
    title: string;
    message: string;
  }>;
  recentExpenses: ExpenseRecord[];
  highlightText: {
    category: string;
    trend: string;
  };
};

export type ExpenseListQuery = {
  search?: string;
  category?: CategoryKey | 'all';
  paymentMethod?: PaymentMethodKey | 'all';
  month?: string;
  sort?: ExpenseSortKey;
};
