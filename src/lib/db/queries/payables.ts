import { db } from "@/lib/db";
import { payables, vendors } from "@/lib/db/schema";
import { eq, and, desc, sum, count } from "drizzle-orm";

export async function getPayables(
  organizationId: string,
  opts?: { limit?: number; offset?: number; status?: string }
) {
  const conditions = [eq(payables.organization_id, organizationId)];
  if (opts?.status) conditions.push(eq(payables.status, opts.status as typeof payables.status._.data));

  return db
    .select({
      id: payables.id,
      bill_number: payables.bill_number,
      status: payables.status,
      issue_date: payables.issue_date,
      due_date: payables.due_date,
      total_amount: payables.total_amount,
      amount_paid: payables.amount_paid,
      amount_due: payables.amount_due,
      vendor_id: payables.vendor_id,
      created_at: payables.created_at,
      vendor_name: vendors.name,
    })
    .from(payables)
    .leftJoin(vendors, eq(payables.vendor_id, vendors.id))
    .where(and(...conditions))
    .orderBy(desc(payables.due_date))
    .limit(opts?.limit ?? 50)
    .offset(opts?.offset ?? 0);
}

export async function createPayable(data: typeof payables.$inferInsert) {
  const [payable] = await db.insert(payables).values(data).returning();
  return payable;
}

export async function updatePayable(id: string, organizationId: string, data: Partial<typeof payables.$inferInsert>) {
  const [payable] = await db
    .update(payables)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(payables.id, id), eq(payables.organization_id, organizationId)))
    .returning();
  return payable;
}

export async function getPayableSummary(organizationId: string) {
  const [result] = await db
    .select({
      total_outstanding: sum(payables.amount_due),
      total_bills: sum(payables.total_amount),
      count: count(),
    })
    .from(payables)
    .where(eq(payables.organization_id, organizationId));
  return {
    total_outstanding: parseFloat(result?.total_outstanding ?? "0"),
    total_bills: parseFloat(result?.total_bills ?? "0"),
    count: result?.count ?? 0,
  };
}
