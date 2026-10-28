import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

/** Applies pending SQL migrations from ./drizzle. Run before starting the app. */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new Pool({ connectionString, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
    console.log("✓ Database migrations applied");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("✗ Migration failed:", error);
  process.exit(1);
});
