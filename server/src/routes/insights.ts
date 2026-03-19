import { Router } from 'express';
import { readDb } from '../db.js';
import { buildInsights } from '../utils/insights.js';

const insightsRouter = Router();

insightsRouter.get('/overview', async (req, res) => {
  const database = await readDb();
  const user = database.users.find((candidate) => candidate.id === req.userId);

  if (!user) {
    return res.status(404).json({
      message: 'User profile not found.',
    });
  }

  const expenses = database.expenses.filter((expense) => expense.userId === req.userId);

  return res.json({
    overview: buildInsights(expenses, user.monthlyBudget),
  });
});

export { insightsRouter };

