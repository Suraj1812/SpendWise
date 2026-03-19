import bcrypt from 'bcryptjs';
import { format, subMonths } from 'date-fns';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { serverConfig } from './config.js';
import {
  categoryKeys,
  paymentMethodKeys,
  type DatabaseSchema,
  type ExpenseRecord,
  type UserRecord,
} from './types.js';

let writeQueue = Promise.resolve();

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  monthlyBudget: z.number(),
  isGuest: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const expenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  category: z.enum(categoryKeys),
  paymentMethod: z.enum(paymentMethodKeys).default('upi'),
  isRecurring: z.boolean().default(false),
  note: z.string().default(''),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const databaseSchema = z.object({
  users: z.array(userSchema),
  expenses: z.array(expenseSchema),
});

const createSeedDatabase = async (): Promise<DatabaseSchema> => {
  const now = new Date();
  const nowIso = now.toISOString();
  const demoUserId = 'demo-user';
  const demoUser: UserRecord = {
    id: demoUserId,
    name: 'Suraj',
    email: 'demo@spendwise.app',
    passwordHash: await bcrypt.hash('demo123', 10),
    monthlyBudget: 25000,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const buildDate = (monthsAgo: number, day: number) => {
    const target = subMonths(now, monthsAgo);
    target.setDate(day);
    return format(target, 'yyyy-MM-dd');
  };

  const buildExpense = (
    amount: number,
    category: ExpenseRecord['category'],
    note: string,
    monthsAgo: number,
    day: number,
    paymentMethod: ExpenseRecord['paymentMethod'],
    isRecurring = false,
  ): ExpenseRecord => ({
    id: nanoid(),
    userId: demoUserId,
    amount,
    category,
    paymentMethod,
    isRecurring,
    note,
    date: buildDate(monthsAgo, day),
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  return {
    users: [demoUser],
    expenses: [
      buildExpense(420, 'food', 'Lunch with the team', 0, 2, 'upi'),
      buildExpense(1890, 'shopping', 'New earbuds', 0, 4, 'card'),
      buildExpense(260, 'travel', 'Metro recharge', 0, 5, 'upi', true),
      buildExpense(760, 'groceries', 'Weekly groceries', 0, 6, 'upi'),
      buildExpense(1200, 'bills', 'Wi-Fi bill', 0, 8, 'bank', true),
      buildExpense(340, 'food', 'Coffee catch-up', 0, 10, 'cash'),
      buildExpense(580, 'entertainment', 'Movie tickets', 0, 12, 'card'),
      buildExpense(900, 'health', 'Pharmacy purchase', 0, 13, 'upi'),
      buildExpense(310, 'travel', 'Cab after work', 0, 14, 'cash'),
      buildExpense(640, 'food', 'Dinner delivery', 0, 16, 'upi'),
      buildExpense(750, 'food', 'Weekend brunch', 1, 4, 'card'),
      buildExpense(1800, 'shopping', 'Sneakers', 1, 8, 'card'),
      buildExpense(450, 'travel', 'Intercity bus', 1, 12, 'upi'),
      buildExpense(620, 'groceries', 'Household essentials', 2, 9, 'upi'),
      buildExpense(980, 'utilities', 'Electricity bill', 2, 13, 'bank', true),
      buildExpense(520, 'food', 'Office snacks', 3, 7, 'cash'),
    ],
  };
};

export const writeDb = async (database: DatabaseSchema) => {
  await mkdir(dirname(serverConfig.dataFile), { recursive: true });

  writeQueue = writeQueue.then(() =>
    writeFile(serverConfig.dataFile, JSON.stringify(database, null, 2), 'utf8'),
  );

  await writeQueue;
};

export const readDb = async (): Promise<DatabaseSchema> => {
  const raw = await readFile(serverConfig.dataFile, 'utf8');
  return databaseSchema.parse(JSON.parse(raw));
};

export const ensureDb = async () => {
  await mkdir(dirname(serverConfig.dataFile), { recursive: true });

  try {
    const existing = await readDb();

    if (!existing.users.length) {
      await writeDb(await createSeedDatabase());
    }
  } catch {
    await writeDb(await createSeedDatabase());
  }
};

export const resetDb = async () => {
  await writeDb(await createSeedDatabase());
};
