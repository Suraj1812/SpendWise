import jwt from 'jsonwebtoken';
import { serverConfig } from '../config.js';
import type { PublicUser, UserRecord } from '../types.js';

export const signToken = (userId: string) =>
  jwt.sign({ userId }, serverConfig.jwtSecret, {
    expiresIn: '7d',
  });

export const sanitizeUser = ({ passwordHash, ...user }: UserRecord): PublicUser => user;

