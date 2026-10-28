import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../src/lib/db/schema";

/** Standalone DB connection for CLI scripts (outside the Next.js runtime). */
export function connect() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString, max: 2 });
  return { db: drizzle(pool, { schema }), close: () => pool.end() };
}
