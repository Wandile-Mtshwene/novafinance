import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";

export async function createOrganization(data: {
  name: string;
  slug: string;
  owner_id: string;
}) {
  const [org] = await db.insert(organizations).values(data).returning();
  return org;
}

export async function getOrganizationById(id: string) {
  const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return org ?? null;
}

export async function updateOrganization(id: string, data: Partial<typeof organizations.$inferInsert>) {
  const [org] = await db
    .update(organizations)
    .set({ ...data, updated_at: new Date() })
    .where(eq(organizations.id, id))
    .returning();
  return org;
}

export async function generateUniqueSlug(name: string): Promise<string> {
  let base = slugify(name);
  if (!base) base = "org";
  let slug = base;
  let i = 2;
  while (true) {
    const existing = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    if (!existing.length) return slug;
    slug = `${base}-${i++}`;
  }
}
