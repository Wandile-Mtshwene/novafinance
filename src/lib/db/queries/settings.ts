import { db } from "@/lib/db";
import { settings as fin_settings, organizations as fin_organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSettings(orgId: string) {
  const rows = await db
    .select()
    .from(fin_settings)
    .where(eq(fin_settings.organization_id, orgId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertSettings(orgId: string, data: Partial<typeof fin_settings.$inferInsert>) {
  const existing = await getSettings(orgId);
  if (existing) {
    const rows = await db
      .update(fin_settings)
      .set({ ...data, updated_at: new Date() })
      .where(eq(fin_settings.organization_id, orgId))
      .returning();
    return rows[0];
  } else {
    const rows = await db
      .insert(fin_settings)
      .values({ organization_id: orgId, ...data })
      .returning();
    return rows[0];
  }
}

export async function updateOrganizationSettings(orgId: string, data: Partial<typeof fin_organizations.$inferInsert>) {
  const rows = await db
    .update(fin_organizations)
    .set({ ...data, updated_at: new Date() })
    .where(eq(fin_organizations.id, orgId))
    .returning();
  return rows[0];
}
