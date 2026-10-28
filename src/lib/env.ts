import "server-only";
import { z } from "zod";

const booleanish = z
  .enum(["true", "false", "1", "0"])
  .optional()
  .transform((value) => value === "true" || value === "1");

const megabytes = (fallback: number) =>
  z.coerce.number().int().positive().default(fallback).transform((mb) => mb * 1024 * 1024);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.url(),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  /** Secret used to hash IP addresses of contact form submissions. */
  IP_HASH_SECRET: z.string().min(16),

  S3_ENDPOINT: z.url(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().min(3),
  S3_SECRET_KEY: z.string().min(8),
  S3_BUCKET: z.string().min(3),
  S3_FORCE_PATH_STYLE: booleanish.default(true),

  CLAMAV_HOST: z.string().optional(),
  CLAMAV_PORT: z.coerce.number().int().positive().default(3310),
  /** When true, uploads are rejected if the antivirus scanner is not reachable. */
  UPLOAD_REQUIRE_SCAN: booleanish.default(false),
  UPLOAD_TMP_DIR: z.string().optional(),
  UPLOAD_MAX_IMAGE_MB: megabytes(25),
  UPLOAD_MAX_VIDEO_MB: megabytes(2048),
  UPLOAD_MAX_DOCUMENT_MB: megabytes(25),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Validated environment. Parsed lazily so that `next build` does not require
 * runtime secrets; the first request fails fast if configuration is invalid.
 */
export function env(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid environment configuration:\n${issues.join("\n")}`);
  }
  cached = parsed.data;
  return cached;
}
