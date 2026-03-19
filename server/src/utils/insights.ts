import { format, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns';
import type { CategoryKey, ExpenseRecord, InsightOverview } from '../types.js';

const categoryMeta: Record<
  CategoryKey,
  {
    label: string;
    color: string;
    icon: string;
  }
> = {
  food: { label: 'Food', color: '#F59E0B', icon: 'fast-food-outline' },
  travel: { label: 'Travel', color: '#3B82F6', icon: 'car-sport-outline' },
  shopping: { label: 'Shopping', color: '#8B5CF6', icon: 'bag-handle-outline' },
  bills: { label: 'Bills', color: '#EF4444', icon: 'receipt-outline' },
  health: { label: 'Health', color: '#10B981', icon: 'medkit-outline' },
  entertainment: { label: 'Fun', color: '#EC4899', icon: 'game-controller-outline' },
  groceries: { label: 'Groceries', color: '#14B8A6', icon: 'basket-outline' },
  utilities: { label: 'Utilities', color: '#64748B', icon: 'flash-outline' },
};

const sumAmounts = (expenses: ExpenseRecord[]) =>
  expenses.reduce((total, expense) => total + expense.amount, 0);

export const buildInsights = (
  expenses: ExpenseRecord[],
  budget: number,
  now = new Date(),
): InsightOverview => {
  const currentMonthExpenses = expenses.filter((expense) =>
    isSameMonth(parseISO(expense.date), now),
  );

  const previousMonthDate = subMonths(now, 1);
  const previousMonthExpenses = expenses.filter((expense) =>
    isSameMonth(parseISO(expense.date), previousMonthDate),
  );

  const totalSpent = sumAmounts(currentMonthExpenses);
  const previousMonthTotal = sumAmounts(previousMonthExpenses);
  const remaining = budget - totalSpent;
  const spentPercentOfBudget =
    budget <= 0 ? 0 : Number(((totalSpent / budget) * 100).toFixed(0));
  const budgetStatus =
    totalSpent > budget ? 'over' : spentPercentOfBudget >= 80 ? 'warning' : 'healthy';
  const changePercent =
    previousMonthTotal === 0
      ? totalSpent > 0
        ? 100
        : 0
      : Number((((totalSpent - previousMonthTotal) / previousMonthTotal) * 100).toFixed(0));
  const averageDailySpend = Number((totalSpent / Math.max(now.getDate(), 1)).toFixed(0));

  const grouped = currentMonthExpenses.reduce<Record<CategoryKey, number>>(
    (accumulator, expense) => {
      accumulator[expense.category] += expense.amount;
      return accumulator;
    },
    {
      food: 0,
      travel: 0,
      shopping: 0,
      bills: 0,
      health: 0,
      entertainment: 0,
      groceries: 0,
      utilities: 0,
    },
  );

  const categoryBreakdown = Object.entries(grouped)
    .filter(([, total]) => total > 0)
    .map(([category, total]) => ({
      category: category as CategoryKey,
      total,
      percent: totalSpent === 0 ? 0 : Number(((total / totalSpent) * 100).toFixed(0)),
      color: categoryMeta[category as CategoryKey].color,
      icon: categoryMeta[category as CategoryKey].icon,
      label: categoryMeta[category as CategoryKey].label,
    }))
    .sort((left, right) => right.total - left.total);

  const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
    const targetMonth = subMonths(startOfMonth(now), 5 - index);
    const total = sumAmounts(
      expenses.filter((expense) => isSameMonth(parseISO(expense.date), targetMonth)),
    );

    return {
      month: format(targetMonth, 'MMM'),
      total,
    };
  });

  const topCategory = categoryBreakdown[0];
  const recentExpenses = [...currentMonthExpenses]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 5);
  const alerts: InsightOverview['alerts'] = [];

  if (budgetStatus === 'over') {
    alerts.push({
      id: 'budget-over',
      level: 'over',
      title: 'Budget exceeded',
      message: `You are ${formatCurrency(Math.abs(remaining))} over your monthly budget.`,
    });
  } else if (budgetStatus === 'warning') {
    alerts.push({
      id: 'budget-warning',
      level: 'warning',
      title: 'Budget almost full',
      message: `${spentPercentOfBudget}% of this month’s budget is already used.`,
    });
  } else {
    alerts.push({
      id: 'budget-healthy',
      level: 'healthy',
      title: 'Budget on track',
      message: `You still have ${formatCurrency(remaining)} available this month.`,
    });
  }

  if (Math.abs(changePercent) >= 15 && previousMonthTotal > 0) {
    alerts.push({
      id: 'trend-change',
      level: changePercent > 0 ? 'warning' : 'info',
      title: changePercent > 0 ? 'Spending is rising' : 'Spending is improving',
      message:
        changePercent > 0
          ? `You are up ${Math.abs(changePercent)}% compared with last month.`
          : `You are down ${Math.abs(changePercent)}% compared with last month.`,
    });
  }

  if (currentMonthExpenses.some((expense) => expense.isRecurring)) {
    alerts.push({
      id: 'recurring-present',
      level: 'info',
      title: 'Recurring payments tracked',
      message: 'Repeat spending is separated from one-off transactions.',
    });
  }

  const categoryText = topCategory
    ? `You spent ${topCategory.percent}% on ${topCategory.label.toLowerCase()} this month.`
    : 'Start adding expenses to unlock your strongest spending pattern.';

  const trendText =
    previousMonthTotal === 0
      ? 'This is your first tracked month, so every expense is shaping your baseline.'
      : changePercent === 0
        ? 'Your spending stayed steady compared with last month.'
        : `Spending ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent)}% vs last month.`;

  return {
    summary: {
      totalSpent,
      budget,
      remaining,
      previousMonthTotal,
      changePercent,
      spentPercentOfBudget,
      averageDailySpend,
      transactionCount: currentMonthExpenses.length,
      budgetStatus,
    },
    categoryBreakdown,
    monthlyTrend,
    alerts,
    recentExpenses,
    highlightText: {
      category: categoryText,
      trend: trendText,
    },
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
