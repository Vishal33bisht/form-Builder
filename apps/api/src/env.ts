import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "prod"]).default("development"),
  BASE_URL: z.string().default("http://localhost:8000"),
  // Database
  DATABASE_URL: z.string(),
  
  // JWT Authentication
  JWT_SECRET: z.string(),

  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().optional().default("60000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional().default("10"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
