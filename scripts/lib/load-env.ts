import { existsSync } from "node:fs";

/**
 * Loads `.env.local` then `.env` for CLI scripts, like `next dev` does for the app.
 * Variables that are already set (shell, Docker Compose) are never overwritten, and
 * the first file to define a variable wins, so `.env.local` takes precedence.
 */
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
