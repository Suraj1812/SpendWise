import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { serverConfig } from './config.js';
import { requireAuth } from './auth-middleware.js';
import { authRouter } from './routes/auth.js';
import { expensesRouter } from './routes/expenses.js';
import { insightsRouter } from './routes/insights.js';
import { profileRouter } from './routes/profile.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests right now. Please try again shortly.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please wait a few minutes and try again.',
  },
});

app.use(morgan(serverConfig.isProduction ? 'combined' : 'dev'));
app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin: serverConfig.corsOrigin,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'SpendWise API',
  });
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/expenses', requireAuth, expensesRouter);
app.use('/api/insights', requireAuth, insightsRouter);
app.use('/api/profile', requireAuth, profileRouter);

app.use((_req, res) => {
  res.status(404).json({
    message: 'Route not found.',
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    res.status(500).json({
      message: 'Something went wrong. Please try again.',
    });
  },
);
