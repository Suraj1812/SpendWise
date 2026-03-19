import assert from 'node:assert/strict';
import test from 'node:test';
import { buildInsights } from './insights.js';
import type { ExpenseRecord } from '../types.js';

const expenses: ExpenseRecord[] = [
  {
    id: '1',
    userId: 'u1',
    amount: 1800,
    category: 'food',
    paymentMethod: 'upi',
    isRecurring: false,
    note: 'Dining out',
    date: '2026-03-08',
    createdAt: '2026-03-08T00:00:00.000Z',
    updatedAt: '2026-03-08T00:00:00.000Z',
  },
  {
    id: '2',
    userId: 'u1',
    amount: 2200,
    category: 'bills',
    paymentMethod: 'bank',
    isRecurring: true,
    note: 'Internet bill',
    date: '2026-03-10',
    createdAt: '2026-03-10T00:00:00.000Z',
    updatedAt: '2026-03-10T00:00:00.000Z',
  },
  {
    id: '3',
    userId: 'u1',
    amount: 900,
    category: 'travel',
    paymentMethod: 'cash',
    isRecurring: false,
    note: 'Cab rides',
    date: '2026-02-14',
    createdAt: '2026-02-14T00:00:00.000Z',
    updatedAt: '2026-02-14T00:00:00.000Z',
  },
];

test('buildInsights calculates budget status, alerts, and recent expenses', () => {
  const overview = buildInsights(expenses, 4500, new Date('2026-03-19T00:00:00.000Z'));

  assert.equal(overview.summary.totalSpent, 4000);
  assert.equal(overview.summary.spentPercentOfBudget, 89);
  assert.equal(overview.summary.budgetStatus, 'warning');
  assert.equal(overview.summary.transactionCount, 2);
  assert.equal(overview.recentExpenses.length, 2);
  assert.match(overview.highlightText.category, /bills/i);
  assert.equal(overview.alerts.some((alert) => alert.id === 'recurring-present'), true);
});
