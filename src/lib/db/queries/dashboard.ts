import { db } from "@/lib/db";
import { invoices, expenses, payables, accounts, transactions } from "@/lib/db/schema";
import { eq, and, sum, count, desc, gte, sql } from "drizzle-orm";

export async function getDashboardStats(organizationId: string) {
  const [invoiceSummary] = await db
    .select({
      total_outstanding: sum(invoices.amount_due),
      total_invoiced: sum(invoices.total_amount),
    })
    .from(invoices)
    .where(eq(invoices.organization_id, organizationId));

  const [expenseSummary] = await db
    .select({ total: sum(expenses.total_amount) })
    .from(expenses)
    .where(eq(expenses.organization_id, organizationId));

  const [payableSummary] = await db
    .select({ total_outstanding: sum(payables.amount_due) })
    .from(payables)
    .where(eq(payables.organization_id, organizationId));

  const [accountSummary] = await db
    .select({ total_balance: sum(accounts.current_balance) })
    .from(accounts)
    .where(and(eq(accounts.organization_id, organizationId), eq(accounts.is_active, true)));

  return {
    total_receivables: parseFloat(invoiceSummary?.total_outstanding ?? "0"),
    total_invoiced: parseFloat(invoiceSummary?.total_invoiced ?? "0"),
    total_expenses: parseFloat(expenseSummary?.total ?? "0"),
    total_payables: parseFloat(payableSummary?.total_outstanding ?? "0"),
    cash_balance: parseFloat(accountSummary?.total_balance ?? "0"),
  };
}

export async function getRecentTransactions(organizationId: string, limit = 10) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.organization_id, organizationId))
    .orderBy(desc(transactions.created_at))
    .limit(limit);
}

export async function getMonthlyRevenue(organizationId: string, months = 12) {
  const result = await db.execute(sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', issue_date::date), 'Mon YY') AS month,
      DATE_TRUNC('month', issue_date::date) AS month_date,
      SUM(total_amount)::numeric AS revenue,
      SUM(amount_paid)::numeric AS collected
    FROM fin_invoices
    WHERE organization_id = ${organizationId}
      AND issue_date >= NOW() - INTERVAL '${sql.raw(months.toString())} months'
    GROUP BY DATE_TRUNC('month', issue_date::date)
    ORDER BY month_date ASC
  `);
  return result.rows as Array<{ month: string; revenue: string; collected: string }>;
}

export async function getMonthlyExpenses(organizationId: string, months = 12) {
  const result = await db.execute(sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', expense_date::date), 'Mon YY') AS month,
      DATE_TRUNC('month', expense_date::date) AS month_date,
      SUM(total_amount)::numeric AS expenses
    FROM fin_expenses
    WHERE organization_id = ${organizationId}
      AND expense_date >= NOW() - INTERVAL '${sql.raw(months.toString())} months'
    GROUP BY DATE_TRUNC('month', expense_date::date)
    ORDER BY month_date ASC
  `);
  return result.rows as Array<{ month: string; expenses: string }>;
}
