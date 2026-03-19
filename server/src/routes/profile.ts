import { Router } from 'express';
import { z } from 'zod';
import { readDb, writeDb } from '../db.js';
import { sanitizeUser } from '../utils/auth.js';

const profileRouter = Router();

const budgetSchema = z.object({
  monthlyBudget: z.coerce.number().positive('Budget should be greater than zero.'),
});

profileRouter.get('/', async (req, res) => {
  const database = await readDb();
  const user = database.users.find((candidate) => candidate.id === req.userId);

  if (!user) {
    return res.status(404).json({
      message: 'User profile not found.',
    });
  }

  return res.json({
    user: sanitizeUser(user),
  });
});

profileRouter.put('/budget', async (req, res) => {
  const parsed = budgetSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? 'Please enter a valid budget.',
    });
  }

  const database = await readDb();
  const user = database.users.find((candidate) => candidate.id === req.userId);

  if (!user) {
    return res.status(404).json({
      message: 'User profile not found.',
    });
  }

  user.monthlyBudget = parsed.data.monthlyBudget;
  user.updatedAt = new Date().toISOString();
  await writeDb(database);

  return res.json({
    user: sanitizeUser(user),
  });
});

export { profileRouter };

