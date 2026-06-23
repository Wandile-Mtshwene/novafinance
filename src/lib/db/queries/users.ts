import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserById(id: string) {
  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return u ?? null;
}

export async function upsertUser(data: {
  id: string;
  organization_id: string;
  email: string;
  full_name?: string | null;
  role: "owner" | "admin" | "accountant" | "finance_manager" | "bookkeeper" | "viewer";
}) {
  const [u] = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: data.email,
        full_name: data.full_name,
        updated_at: new Date(),
      },
    })
    .returning();
  return u;
}

export async function getUsersByOrg(organizationId: string) {
  return db.select().from(users).where(eq(users.organization_id, organizationId));
}
