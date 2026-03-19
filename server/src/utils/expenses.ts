import { format } from 'date-fns';
import type { ExpenseListQuery, ExpenseRecord } from '../types.js';

const paymentMethodLabels: Record<ExpenseRecord['paymentMethod'], string> = {
  upi: 'UPI',
  card: 'Card',
  cash: 'Cash',
  bank: 'Bank',
};

export const filterExpenses = (expenses: ExpenseRecord[], query: ExpenseListQuery = {}) => {
  const normalizedSearch = query.search?.trim().toLowerCase();

  const filtered = expenses.filter((expense) => {
    if (query.category && query.category !== 'all' && expense.category !== query.category) {
      return false;
    }

    if (
      query.paymentMethod &&
      query.paymentMethod !== 'all' &&
      expense.paymentMethod !== query.paymentMethod
    ) {
      return false;
    }

    if (query.month && !expense.date.startsWith(query.month)) {
      return false;
    }

    if (normalizedSearch) {
      const haystack = [
        expense.note,
        expense.category,
        expense.paymentMethod,
        paymentMethodLabels[expense.paymentMethod],
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  });

  return sortExpenses(filtered, query.sort ?? 'latest');
};

export const sortExpenses = (
  expenses: ExpenseRecord[],
  sort: ExpenseListQuery['sort'] = 'latest',
) => {
  return [...expenses].sort((left, right) => {
    switch (sort) {
      case 'oldest':
        return new Date(left.date).getTime() - new Date(right.date).getTime();
      case 'highest':
        return right.amount - left.amount;
      case 'lowest':
        return left.amount - right.amount;
      case 'latest':
      default:
        return new Date(right.date).getTime() - new Date(left.date).getTime();
    }
  });
};

export const buildExpenseCsv = (expenses: ExpenseRecord[]) => {
  const headers = ['Date', 'Category', 'Payment Method', 'Recurring', 'Amount', 'Note'];
  const rows = expenses.map((expense) => [
    expense.date,
    expense.category,
    paymentMethodLabels[expense.paymentMethod],
    expense.isRecurring ? 'Yes' : 'No',
    String(expense.amount),
    expense.note,
  ]);

  return [headers, ...rows]
    .map((row) =>
      row
        .map((column) => `"${String(column).replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n');
};

export const buildExportFilename = () => `spendwise-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
