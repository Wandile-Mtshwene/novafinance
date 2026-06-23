import { db } from "@/lib/db";
import { budgets, budgetLines, chartOfAccounts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getBudgets(organizationId: string) {
  return db
    .select()
    .from(budgets)
    .where(eq(budgets.organization_id, organizationId))
    .orderBy(desc(budgets.fiscal_year));
}

export async function getBudgetById(id: string, organizationId: string) {
  const [budget] = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.organization_id, organizationId)))
    .limit(1);
  if (!budget) return null;

  const lines = await db
    .select({
      id: budgetLines.id,
      month: budgetLines.month,
      year: budgetLines.year,
      budgeted_amount: budgetLines.budgeted_amount,
      actual_amount: budgetLines.actual_amount,
      variance: budgetLines.variance,
      chart_account_id: budgetLines.chart_account_id,
      account_name: chartOfAccounts.name,
      account_code: chartOfAccounts.code,
    })
    .from(budgetLines)
    .leftJoin(chartOfAccounts, eq(budgetLines.chart_account_id, chartOfAccounts.id))
    .where(eq(budgetLines.budget_id, id));

  return { ...budget, lines };
}

export async function createBudget(data: typeof budgets.$inferInsert) {
  const [budget] = await db.insert(budgets).values(data).returning();
  return budget;
}

export async function updateBudget(id: string, organizationId: string, data: Partial<typeof budgets.$inferInsert>) {
  const [budget] = await db
    .update(budgets)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(budgets.id, id), eq(budgets.organization_id, organizationId)))
    .returning();
  return budget;
}
