import { db } from "@/lib/db";
import { expenses, expenseCategories, vendors } from "@/lib/db/schema";
import { eq, and, desc, gte, lte, sum, count } from "drizzle-orm";

export async function getExpenses(
  organizationId: string,
  opts?: { limit?: number; offset?: number; fromDate?: string; toDate?: string; categoryId?: string }
) {
  const conditions = [eq(expenses.organization_id, organizationId)];
  if (opts?.fromDate) conditions.push(gte(expenses.expense_date, opts.fromDate));
  if (opts?.toDate) conditions.push(lte(expenses.expense_date, opts.toDate));
  if (opts?.categoryId) conditions.push(eq(expenses.category_id, opts.categoryId));

  return db
    .select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      total_amount: expenses.total_amount,
      expense_date: expenses.expense_date,
      category_id: expenses.category_id,
      vendor_id: expenses.vendor_id,
      notes: expenses.notes,
      created_at: expenses.created_at,
      category_name: expenseCategories.name,
      vendor_name: vendors.name,
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.category_id, expenseCategories.id))
    .leftJoin(vendors, eq(expenses.vendor_id, vendors.id))
    .where(and(...conditions))
    .orderBy(desc(expenses.expense_date))
    .limit(opts?.limit ?? 50)
    .offset(opts?.offset ?? 0);
}

export async function createExpense(data: typeof expenses.$inferInsert) {
  const [expense] = await db.insert(expenses).values(data).returning();
  return expense;
}

export async function updateExpense(id: string, organizationId: string, data: Partial<typeof expenses.$inferInsert>) {
  const [expense] = await db
    .update(expenses)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(expenses.id, id), eq(expenses.organization_id, organizationId)))
    .returning();
  return expense;
}

export async function deleteExpense(id: string, organizationId: string) {
  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.organization_id, organizationId)));
}

export async function getExpenseSummary(organizationId: string) {
  const [result] = await db
    .select({
      total: sum(expenses.total_amount),
      count: count(),
    })
    .from(expenses)
    .where(eq(expenses.organization_id, organizationId));

  return {
    total: parseFloat(result?.total ?? "0"),
    count: result?.count ?? 0,
  };
}

export async function getExpensesByCategory(organizationId: string) {
  return db
    .select({
      category_name: expenseCategories.name,
      total: sum(expenses.total_amount),
      count: count(),
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.category_id, expenseCategories.id))
    .where(eq(expenses.organization_id, organizationId))
    .groupBy(expenseCategories.name);
}

export async function getExpenseCategories(organizationId: string) {
  return db
    .select()
    .from(expenseCategories)
    .where(and(eq(expenseCategories.organization_id, organizationId), eq(expenseCategories.is_active, true)))
    .orderBy(expenseCategories.name);
}

export async function createExpenseCategory(data: typeof expenseCategories.$inferInsert) {
  const [cat] = await db.insert(expenseCategories).values(data).returning();
  return cat;
}
