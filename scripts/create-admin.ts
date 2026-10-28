import { randomUUID } from "node:crypto";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { account, user } from "../src/lib/db/schema";
import { connect } from "./lib/db";

/**
 * Creates (or resets the password of) the dashboard administrator.
 * Public sign-up is disabled, so this is the only way to create an account.
 *
 *   ADMIN_EMAIL=… ADMIN_NAME=… ADMIN_PASSWORD=… npm run admin:create
 */
async function ask(question: string, fallback?: string): Promise<string> {
  if (fallback) return fallback;
  const rl = createInterface({ input, output });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

async function main() {
  const email = (await ask("Admin email: ", process.env.ADMIN_EMAIL)).toLowerCase();
  const name = await ask("Display name: ", process.env.ADMIN_NAME);
  const password = await ask("Password (min 12 chars): ", process.env.ADMIN_PASSWORD);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address");
  if (!name) throw new Error("Name is required");
  if (password.length < 12) throw new Error("Password must be at least 12 characters");

  const { db, close } = connect();
  try {
    const passwordHash = await hashPassword(password);
    const existing = await db.query.user.findFirst({ where: eq(user.email, email) });

    if (existing) {
      await db
        .update(account)
        .set({ password: passwordHash, updatedAt: new Date() })
        .where(and(eq(account.userId, existing.id), eq(account.providerId, "credential")));
      console.log(`✓ Password updated for ${email}`);
      return;
    }

    const userId = randomUUID();
    await db.transaction(async (tx) => {
      await tx.insert(user).values({ id: userId, name, email, emailVerified: true, role: "admin" });
      await tx.insert(account).values({
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: passwordHash,
      });
    });
    console.log(`✓ Admin account created for ${email}`);
  } finally {
    await close();
  }
}

main().catch((error) => {
  console.error(`✗ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
