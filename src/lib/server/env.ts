import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
  TRUSTED_ORIGINS: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().optional(),
  AI_MODEL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_GA_MEASUREMENT_ID: z.string().optional(),
  PRISMA_LOG: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
  PORT: z.coerce.number().optional(),
});

function parseTrustedOrigins(
  trustedOrigins: string | undefined,
  betterAuthUrl: string,
): string[] {
  const raw = trustedOrigins ?? betterAuthUrl;
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseEnv() {
  const parsed = envSchema.parse(process.env);
  const isProduction = parsed.NODE_ENV === "production";

  const databaseUrl =
    parsed.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/tanstack_template";
  const redisUrl = parsed.REDIS_URL ?? "redis://localhost:6379";
  const betterAuthUrl = parsed.BETTER_AUTH_URL ?? "http://localhost:3000";
  const betterAuthSecret =
    parsed.BETTER_AUTH_SECRET ?? "change-me-in-production-min-32-chars";

  if (isProduction) {
    const missing: string[] = [];
    if (!parsed.DATABASE_URL) missing.push("DATABASE_URL");
    if (!parsed.REDIS_URL) missing.push("REDIS_URL");
    if (!parsed.BETTER_AUTH_SECRET) missing.push("BETTER_AUTH_SECRET");
    if (!parsed.BETTER_AUTH_URL) missing.push("BETTER_AUTH_URL");
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`,
      );
    }
  }

  const aiApiKey = parsed.AI_API_KEY?.trim() || parsed.OPENAI_API_KEY?.trim();
  const aiModel = parsed.AI_MODEL?.trim();
  const aiBaseUrl = parsed.AI_BASE_URL?.trim();

  return {
    nodeEnv: parsed.NODE_ENV,
    isProduction,
    databaseUrl,
    redisUrl,
    betterAuthUrl,
    betterAuthSecret,
    trustedOrigins: parseTrustedOrigins(parsed.TRUSTED_ORIGINS, betterAuthUrl),
    smtpHost: parsed.SMTP_HOST ?? "localhost",
    smtpPort: parsed.SMTP_PORT ?? 1025,
    smtpUser: parsed.SMTP_USER,
    smtpPass: parsed.SMTP_PASS,
    emailFrom: parsed.EMAIL_FROM ?? "noreply@example.com",
    aiApiKey: aiApiKey || undefined,
    aiModel: aiModel || undefined,
    aiBaseUrl: aiBaseUrl || undefined,
    chatEnabled: Boolean(aiApiKey && aiModel),
    sentryDsn: parsed.SENTRY_DSN,
    viteSentryDsn: parsed.VITE_SENTRY_DSN,
    viteGaMeasurementId: parsed.VITE_GA_MEASUREMENT_ID,
    prismaLog: parsed.PRISMA_LOG === "debug",
    logLevel: parsed.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
    port: parsed.PORT ?? 3000,
  };
}

export const env = parseEnv();

export type Env = typeof env;
