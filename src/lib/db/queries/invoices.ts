import { db } from "@/lib/db";
import { invoices, invoiceItems, customers } from "@/lib/db/schema";
import { eq, and, desc, gte, lte, sum, count, sql } from "drizzle-orm";

export async function getInvoices(
  organizationId: string,
  opts?: { limit?: number; offset?: number; status?: string }
) {
  const conditions = [eq(invoices.organization_id, organizationId)];
  if (opts?.status) conditions.push(eq(invoices.status, opts.status as typeof invoices.status._.data));

  return db
    .select({
      id: invoices.id,
      invoice_number: invoices.invoice_number,
      status: invoices.status,
      issue_date: invoices.issue_date,
      due_date: invoices.due_date,
      total_amount: invoices.total_amount,
      amount_paid: invoices.amount_paid,
      amount_due: invoices.amount_due,
      customer_id: invoices.customer_id,
      created_at: invoices.created_at,
      customer_name: customers.name,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customer_id, customers.id))
    .where(and(...conditions))
    .orderBy(desc(invoices.issue_date))
    .limit(opts?.limit ?? 50)
    .offset(opts?.offset ?? 0);
}

export async function getInvoiceById(id: string, organizationId: string) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.organization_id, organizationId)))
    .limit(1);
  if (!invoice) return null;

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoice_id, id))
    .orderBy(invoiceItems.sort_order);

  return { ...invoice, items };
}

export async function createInvoice(data: typeof invoices.$inferInsert) {
  const [invoice] = await db.insert(invoices).values(data).returning();
  return invoice;
}

export async function updateInvoice(id: string, organizationId: string, data: Partial<typeof invoices.$inferInsert>) {
  const [invoice] = await db
    .update(invoices)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(invoices.id, id), eq(invoices.organization_id, organizationId)))
    .returning();
  return invoice;
}

export async function getInvoiceSummary(organizationId: string) {
  const [result] = await db
    .select({
      total_outstanding: sum(invoices.amount_due),
      total_invoiced: sum(invoices.total_amount),
      total_paid: sum(invoices.amount_paid),
      count: count(),
    })
    .from(invoices)
    .where(and(eq(invoices.organization_id, organizationId)));

  const overdueCount = await db
    .select({ count: count() })
    .from(invoices)
    .where(
      and(
        eq(invoices.organization_id, organizationId),
        eq(invoices.status, "overdue")
      )
    );

  return {
    total_outstanding: parseFloat(result?.total_outstanding ?? "0"),
    total_invoiced: parseFloat(result?.total_invoiced ?? "0"),
    total_paid: parseFloat(result?.total_paid ?? "0"),
    count: result?.count ?? 0,
    overdue_count: overdueCount[0]?.count ?? 0,
  };
}

export async function getNextInvoiceNumber(organizationId: string): Promise<string> {
  const [last] = await db
    .select({ invoice_number: invoices.invoice_number })
    .from(invoices)
    .where(eq(invoices.organization_id, organizationId))
    .orderBy(desc(invoices.created_at))
    .limit(1);

  if (!last) return "INV-1001";
  const num = parseInt(last.invoice_number.replace(/\D/g, "")) || 1000;
  return `INV-${num + 1}`;
}
