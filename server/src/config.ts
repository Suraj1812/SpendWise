import { config } from 'dotenv';
import { join, resolve } from 'node:path';
import { z } from 'zod';

config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(10).default('spendwise-local-secret'),
  DATA_FILE: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
});

const env = envSchema.parse(process.env);

export const serverConfig = {
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  port: env.PORT,
  jwtSecret: env.JWT_SECRET,
  corsOrigin: env.CORS_ORIGIN,
  dataFile: env.DATA_FILE ? resolve(env.DATA_FILE) : join(process.cwd(), 'data', 'db.json'),
};
