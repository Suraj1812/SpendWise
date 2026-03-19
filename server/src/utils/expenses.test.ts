import assert from 'node:assert/strict';
import test from 'node:test';
import { buildExpenseCsv, filterExpenses } from './expenses.js';
import type { ExpenseRecord } from '../types.js';

const expenses: ExpenseRecord[] = [
  {
    id: '1',
    userId: 'u1',
    amount: 250,
    category: 'food',
    paymentMethod: 'upi',
    isRecurring: false,
    note: 'Lunch',
    date: '2026-03-10',
    createdAt: '2026-03-10T00:00:00.000Z',
    updatedAt: '2026-03-10T00:00:00.000Z',
  },
  {
    id: '2',
    userId: 'u1',
    amount: 1200,
    category: 'bills',
    paymentMethod: 'bank',
    isRecurring: true,
    note: 'Internet bill',
    date: '2026-03-05',
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-03-05T00:00:00.000Z',
  },
];

test('filterExpenses supports search, category, payment method, and sorting', () => {
  const filtered = filterExpenses(expenses, {
    search: 'bill',
    category: 'bills',
    paymentMethod: 'bank',
    sort: 'highest',
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0]?.id, '2');
});

test('buildExpenseCsv includes the new production fields', () => {
  const csv = buildExpenseCsv(expenses);

  assert.match(csv, /Payment Method/);
  assert.match(csv, /Recurring/);
  assert.match(csv, /Internet bill/);
});
