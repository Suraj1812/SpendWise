import { isValid, parseISO } from 'date-fns';
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { readDb, writeDb } from '../db.js';
import { buildExpenseCsv, buildExportFilename, filterExpenses } from '../utils/expenses.js';
import { categoryKeys, expenseSortKeys, paymentMethodKeys } from '../types.js';

const expensesRouter = Router();

const isValidExpenseDate = (value: string) => isValid(parseISO(value));
const querySchema = z.object({
  search: z.string().trim().optional(),
  category: z.enum(['all', ...categoryKeys]).optional(),
  paymentMethod: z.enum(['all', ...paymentMethodKeys]).optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Month must use the YYYY-MM format.')
    .optional(),
  sort: z.enum(expenseSortKeys).optional(),
});

const expenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero.'),
  category: z.enum(categoryKeys),
  paymentMethod: z.enum(paymentMethodKeys),
  isRecurring: z.coerce.boolean().default(false),
  note: z.string().trim().max(80).default(''),
  date: z.string().refine(isValidExpenseDate, 'Please choose a valid date.'),
});

expensesRouter.get('/', async (req, res) => {
  const parsedQuery = querySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      message: parsedQuery.error.issues[0]?.message ?? 'Please check the expense filters.',
    });
  }

  const database = await readDb();
  const userExpenses = database.expenses.filter((expense) => expense.userId === req.userId);
  const expenses = filterExpenses(userExpenses, parsedQuery.data);

  return res.json({ expenses });
});

expensesRouter.get('/export', async (req, res) => {
  const parsedQuery = querySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      message: parsedQuery.error.issues[0]?.message ?? 'Please check the export filters.',
    });
  }

  const database = await readDb();
  const userExpenses = database.expenses.filter((expense) => expense.userId === req.userId);
  const filteredExpenses = filterExpenses(userExpenses, parsedQuery.data);
  const csv = buildExpenseCsv(filteredExpenses);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${buildExportFilename()}"`);

  return res.send(csv);
});

expensesRouter.post('/', async (req, res) => {
  const parsed = expenseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? 'Please check your expense details.',
    });
  }

  const database = await readDb();
  const now = new Date().toISOString();
  const expense = {
    id: nanoid(),
    userId: req.userId ?? '',
    amount: parsed.data.amount,
    category: parsed.data.category,
    paymentMethod: parsed.data.paymentMethod,
    isRecurring: parsed.data.isRecurring,
    note: parsed.data.note,
    date: parsed.data.date,
    createdAt: now,
    updatedAt: now,
  };

  database.expenses.push(expense);
  await writeDb(database);

  return res.status(201).json({ expense });
});

expensesRouter.put('/:expenseId', async (req, res) => {
  const parsed = expenseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? 'Please check your expense details.',
    });
  }

  const database = await readDb();
  const expense = database.expenses.find(
    (candidate) => candidate.id === req.params.expenseId && candidate.userId === req.userId,
  );

  if (!expense) {
    return res.status(404).json({
      message: 'Expense not found.',
    });
  }

  expense.amount = parsed.data.amount;
  expense.category = parsed.data.category;
  expense.paymentMethod = parsed.data.paymentMethod;
  expense.isRecurring = parsed.data.isRecurring;
  expense.note = parsed.data.note;
  expense.date = parsed.data.date;
  expense.updatedAt = new Date().toISOString();

  await writeDb(database);

  return res.json({ expense });
});

expensesRouter.delete('/:expenseId', async (req, res) => {
  const database = await readDb();
  const index = database.expenses.findIndex(
    (candidate) => candidate.id === req.params.expenseId && candidate.userId === req.userId,
  );

  if (index === -1) {
    return res.status(404).json({
      message: 'Expense not found.',
    });
  }

  database.expenses.splice(index, 1);
  await writeDb(database);

  return res.status(204).send();
});

export { expensesRouter };
