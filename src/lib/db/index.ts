import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __db?: Database; __pool?: Pool };

function createDatabase(): Database {
  const pool = new Pool({ connectionString: env().DATABASE_URL, max: 10 });
  globalForDb.__pool = pool;
  return drizzle(pool, { schema });
}

/**
 * Lazily created singleton. Re-used across hot reloads in development so we
 * don't exhaust Postgres connections.
 */
export function getDb(): Database {
  globalForDb.__db ??= createDatabase();
  return globalForDb.__db;
}

export { schema };
