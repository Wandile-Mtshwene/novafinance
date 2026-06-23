import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getAccounts(organizationId: string) {
  return db
    .select()
    .from(accounts)
    .where(and(eq(accounts.organization_id, organizationId), eq(accounts.is_active, true)))
    .orderBy(accounts.name);
}

export async function getAccountById(id: string, organizationId: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.organization_id, organizationId)))
    .limit(1);
  return account ?? null;
}

export async function createAccount(data: typeof accounts.$inferInsert) {
  const [account] = await db.insert(accounts).values(data).returning();
  return account;
}

export async function updateAccount(id: string, organizationId: string, data: Partial<typeof accounts.$inferInsert>) {
  const [account] = await db
    .update(accounts)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.organization_id, organizationId)))
    .returning();
  return account;
}

export async function deleteAccount(id: string, organizationId: string) {
  await db
    .update(accounts)
    .set({ is_active: false, updated_at: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.organization_id, organizationId)));
}

export async function getTotalBalance(organizationId: string) {
  const rows = await db
    .select({ balance: accounts.current_balance })
    .from(accounts)
    .where(and(eq(accounts.organization_id, organizationId), eq(accounts.is_active, true)));
  return rows.reduce((sum, r) => sum + parseFloat(r.balance ?? "0"), 0);
}
