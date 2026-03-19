import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { readDb, writeDb } from '../db.js';
import { sanitizeUser, signToken } from '../utils/auth.js';
import type { UserRecord } from '../types.js';

const authRouter = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name should be at least 2 characters long.'),
  email: z.email(),
  password: z.string().min(6, 'Password should be at least 6 characters long.'),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

authRouter.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? 'Please check your details.',
    });
  }

  const database = await readDb();
  const email = parsed.data.email.toLowerCase();
  const existingUser = database.users.find((user) => user.email.toLowerCase() === email);

  if (existingUser) {
    return res.status(409).json({
      message: 'An account with this email already exists.',
    });
  }

  const now = new Date().toISOString();
  const user: UserRecord = {
    id: nanoid(),
    name: parsed.data.name,
    email,
    passwordHash: await bcrypt.hash(parsed.data.password, 10),
    monthlyBudget: 25000,
    createdAt: now,
    updatedAt: now,
  };

  database.users.push(user);
  await writeDb(database);

  return res.status(201).json({
    token: signToken(user.id),
    user: sanitizeUser(user),
  });
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Please enter a valid email and password.',
    });
  }

  const database = await readDb();
  const user = database.users.find(
    (candidate) => candidate.email.toLowerCase() === parsed.data.email.toLowerCase(),
  );

  if (!user) {
    return res.status(401).json({
      message: 'No account was found for this email.',
    });
  }

  const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: 'That password is incorrect.',
    });
  }

  return res.json({
    token: signToken(user.id),
    user: sanitizeUser(user),
  });
});

authRouter.post('/guest', async (_req, res) => {
  const database = await readDb();
  const now = new Date().toISOString();
  const guestId = nanoid();
  const guestUser: UserRecord = {
    id: guestId,
    name: 'Guest',
    email: `guest-${guestId}@guest.spendwise.local`,
    passwordHash: await bcrypt.hash(nanoid(12), 10),
    monthlyBudget: 15000,
    isGuest: true,
    createdAt: now,
    updatedAt: now,
  };

  database.users.push(guestUser);
  await writeDb(database);

  return res.status(201).json({
    token: signToken(guestUser.id),
    user: sanitizeUser(guestUser),
  });
});

export { authRouter };

