import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq, and, ilike, or, sum, count, SQL } from "drizzle-orm";

export async function getCustomers(organizationId: string, search?: string) {
  const conditions: SQL[] = [eq(customers.organization_id, organizationId), eq(customers.is_active, true)];
  if (search) {
    const clause = or(ilike(customers.name, `%${search}%`), ilike(customers.email, `%${search}%`));
    if (clause) conditions.push(clause);
  }
  return db
    .select()
    .from(customers)
    .where(and(...conditions))
    .orderBy(customers.name);
}

export async function getCustomerById(id: string, organizationId: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.organization_id, organizationId)))
    .limit(1);
  return customer ?? null;
}

export async function createCustomer(data: typeof customers.$inferInsert) {
  const [customer] = await db.insert(customers).values(data).returning();
  return customer;
}

export async function updateCustomer(id: string, organizationId: string, data: Partial<typeof customers.$inferInsert>) {
  const [customer] = await db
    .update(customers)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(customers.id, id), eq(customers.organization_id, organizationId)))
    .returning();
  return customer;
}

export async function deleteCustomer(id: string, organizationId: string) {
  await db
    .update(customers)
    .set({ is_active: false, updated_at: new Date() })
    .where(and(eq(customers.id, id), eq(customers.organization_id, organizationId)));
}

export async function getCustomerSummary(organizationId: string) {
  const [result] = await db
    .select({
      total_outstanding: sum(customers.total_outstanding),
      count: count(),
    })
    .from(customers)
    .where(and(eq(customers.organization_id, organizationId), eq(customers.is_active, true)));
  return {
    total_outstanding: parseFloat(result?.total_outstanding ?? "0"),
    count: result?.count ?? 0,
  };
}
