import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_NOTIFICATION_EMAIL: z.string().email(),
  FRONTEND_URL: z.string().url(),
  SMTP_HOST: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_PASS: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_FROM: z.preprocess(emptyToUndefined, z.string().optional()),
  TRUST_PROXY: z.preprocess(emptyToUndefined, z.string().optional()),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = parsed.data;

export const isSmtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_FROM);

/**
 * Express "trust proxy" setting, so req.ip (and rate limiting) sees the visitor's
 * address instead of the Next.js proxy's. Locally the proxy runs on loopback;
 * in production default to one hop. TRUST_PROXY accepts a hop count, true/false,
 * or a comma-separated list of addresses/subnets.
 */
export function trustProxySetting(): boolean | number | string {
  const raw = env.TRUST_PROXY;
  if (raw === undefined) return env.NODE_ENV === "production" ? 1 : "loopback";
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^\d+$/.test(raw)) return Number(raw);
  return raw;
}
