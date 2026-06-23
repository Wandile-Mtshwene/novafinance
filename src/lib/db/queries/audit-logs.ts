import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function createAuditLog(data: typeof auditLogs.$inferInsert) {
  const [log] = await db.insert(auditLogs).values(data).returning();
  return log;
}

export async function getAuditLogs(
  organizationId: string,
  opts?: { limit?: number; offset?: number; entityType?: string; userId?: string }
) {
  const conditions = [eq(auditLogs.organization_id, organizationId)];
  if (opts?.entityType) conditions.push(eq(auditLogs.entity_type, opts.entityType));
  if (opts?.userId) conditions.push(eq(auditLogs.user_id, opts.userId));

  return db
    .select()
    .from(auditLogs)
    .where(and(...conditions))
    .orderBy(desc(auditLogs.created_at))
    .limit(opts?.limit ?? 50)
    .offset(opts?.offset ?? 0);
}
