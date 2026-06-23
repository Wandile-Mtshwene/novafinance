import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema";
import { eq, and, ilike, or, sum, count, SQL } from "drizzle-orm";

export async function getVendors(organizationId: string, search?: string) {
  const conditions: SQL[] = [eq(vendors.organization_id, organizationId), eq(vendors.is_active, true)];
  if (search) {
    const clause = or(ilike(vendors.name, `%${search}%`), ilike(vendors.email, `%${search}%`));
    if (clause) conditions.push(clause);
  }
  return db
    .select()
    .from(vendors)
    .where(and(...conditions))
    .orderBy(vendors.name);
}

export async function getVendorById(id: string, organizationId: string) {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.id, id), eq(vendors.organization_id, organizationId)))
    .limit(1);
  return vendor ?? null;
}

export async function createVendor(data: typeof vendors.$inferInsert) {
  const [vendor] = await db.insert(vendors).values(data).returning();
  return vendor;
}

export async function updateVendor(id: string, organizationId: string, data: Partial<typeof vendors.$inferInsert>) {
  const [vendor] = await db
    .update(vendors)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(vendors.id, id), eq(vendors.organization_id, organizationId)))
    .returning();
  return vendor;
}

export async function getVendorSummary(organizationId: string) {
  const [result] = await db
    .select({
      total_outstanding: sum(vendors.total_outstanding),
      count: count(),
    })
    .from(vendors)
    .where(and(eq(vendors.organization_id, organizationId), eq(vendors.is_active, true)));
  return {
    total_outstanding: parseFloat(result?.total_outstanding ?? "0"),
    count: result?.count ?? 0,
  };
}
