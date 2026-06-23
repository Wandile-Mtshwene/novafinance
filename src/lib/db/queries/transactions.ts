import { db } from "@/lib/db";
import { transactions, accounts } from "@/lib/db/schema";
import { eq, and, desc, gte, lte, count, sum } from "drizzle-orm";

export async function getTransactions(
  organizationId: string,
  opts?: { limit?: number; offset?: number; fromDate?: string; toDate?: string }
) {
  const conditions = [eq(transactions.organization_id, organizationId)];
  if (opts?.fromDate) conditions.push(gte(transactions.transaction_date, opts.fromDate));
  if (opts?.toDate) conditions.push(lte(transactions.transaction_date, opts.toDate));

  return db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.transaction_date))
    .limit(opts?.limit ?? 50)
    .offset(opts?.offset ?? 0);
}

export async function getTransactionById(id: string, organizationId: string) {
  const [tx] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.organization_id, organizationId)))
    .limit(1);
  return tx ?? null;
}

export async function createTransaction(data: typeof transactions.$inferInsert) {
  const [tx] = await db.insert(transactions).values(data).returning();
  return tx;
}

export async function updateTransaction(id: string, organizationId: string, data: Partial<typeof transactions.$inferInsert>) {
  const [tx] = await db
    .update(transactions)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.organization_id, organizationId)))
    .returning();
  return tx;
}

export async function getTransactionSummary(organizationId: string) {
  const rows = await db
    .select({ type: transactions.type, total: sum(transactions.amount) })
    .from(transactions)
    .where(and(eq(transactions.organization_id, organizationId), eq(transactions.status, "posted")))
    .groupBy(transactions.type);

  const summary = { income: 0, expense: 0, transfer: 0, adjustment: 0, opening_balance: 0 };
  for (const row of rows) {
    summary[row.type as keyof typeof summary] = parseFloat(row.total ?? "0");
  }
  return summary;
}
