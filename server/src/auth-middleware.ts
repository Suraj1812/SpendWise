import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { serverConfig } from './config.js';

type TokenPayload = {
  userId: string;
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Missing authorization token.',
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, serverConfig.jwtSecret) as TokenPayload;
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({
      message: 'Your session has expired. Please log in again.',
    });
  }
};

