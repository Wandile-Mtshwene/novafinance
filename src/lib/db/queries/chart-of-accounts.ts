import { db } from "@/lib/db";
import { chartOfAccounts } from "@/lib/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";

export async function getChartOfAccounts(organizationId: string) {
  return db
    .select()
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.organization_id, organizationId), eq(chartOfAccounts.is_active, true)))
    .orderBy(chartOfAccounts.code);
}

export async function getAccountById(id: string, organizationId: string) {
  const [account] = await db
    .select()
    .from(chartOfAccounts)
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.organization_id, organizationId)))
    .limit(1);
  return account ?? null;
}

export async function createAccount(data: typeof chartOfAccounts.$inferInsert) {
  const [account] = await db.insert(chartOfAccounts).values(data).returning();
  return account;
}

export async function updateAccount(id: string, organizationId: string, data: Partial<typeof chartOfAccounts.$inferInsert>) {
  const [account] = await db
    .update(chartOfAccounts)
    .set({ ...data, updated_at: new Date() })
    .where(and(eq(chartOfAccounts.id, id), eq(chartOfAccounts.organization_id, organizationId)))
    .returning();
  return account;
}

export async function seedChartOfAccounts(organizationId: string) {
  const STANDARD_ACCOUNTS = [
    { code: "1000", name: "Current Assets", type: "asset" as const, subtype: "current_asset" as const, is_system: true },
    { code: "1100", name: "Cash and Cash Equivalents", type: "asset" as const, subtype: "current_asset" as const, is_system: true },
    { code: "1200", name: "Accounts Receivable", type: "asset" as const, subtype: "current_asset" as const, is_system: true },
    { code: "1300", name: "Inventory", type: "asset" as const, subtype: "current_asset" as const, is_system: true },
    { code: "1400", name: "Prepaid Expenses", type: "asset" as const, subtype: "current_asset" as const, is_system: true },
    { code: "1500", name: "Fixed Assets", type: "asset" as const, subtype: "fixed_asset" as const, is_system: true },
    { code: "1600", name: "Property and Equipment", type: "asset" as const, subtype: "fixed_asset" as const, is_system: true },
    { code: "2000", name: "Current Liabilities", type: "liability" as const, subtype: "current_liability" as const, is_system: true },
    { code: "2100", name: "Accounts Payable", type: "liability" as const, subtype: "current_liability" as const, is_system: true },
    { code: "2200", name: "Accrued Liabilities", type: "liability" as const, subtype: "current_liability" as const, is_system: true },
    { code: "2300", name: "VAT Payable", type: "liability" as const, subtype: "current_liability" as const, is_system: true },
    { code: "2400", name: "PAYE Payable", type: "liability" as const, subtype: "current_liability" as const, is_system: true },
    { code: "2500", name: "Long-term Liabilities", type: "liability" as const, subtype: "long_term_liability" as const, is_system: true },
    { code: "3000", name: "Equity", type: "equity" as const, subtype: "owners_equity" as const, is_system: true },
    { code: "3100", name: "Owner's Equity", type: "equity" as const, subtype: "owners_equity" as const, is_system: true },
    { code: "3200", name: "Retained Earnings", type: "equity" as const, subtype: "retained_earnings" as const, is_system: true },
    { code: "4000", name: "Revenue", type: "revenue" as const, subtype: "operating_revenue" as const, is_system: true },
    { code: "4100", name: "Sales Revenue", type: "revenue" as const, subtype: "operating_revenue" as const, is_system: true },
    { code: "4200", name: "Service Revenue", type: "revenue" as const, subtype: "operating_revenue" as const, is_system: true },
    { code: "4300", name: "Other Revenue", type: "revenue" as const, subtype: "other_revenue" as const, is_system: true },
    { code: "5000", name: "Cost of Goods Sold", type: "expense" as const, subtype: "cost_of_goods_sold" as const, is_system: true },
    { code: "5100", name: "Cost of Sales", type: "expense" as const, subtype: "cost_of_goods_sold" as const, is_system: true },
    { code: "6000", name: "Operating Expenses", type: "expense" as const, subtype: "operating_expense" as const, is_system: true },
    { code: "6100", name: "Rent and Occupancy", type: "expense" as const, subtype: "operating_expense" as const, is_system: true },
    { code: "6200", name: "Salaries and Wages", type: "expense" as const, subtype: "operating_expense" as const, is_system: true },
    { code: "6300", name: "Utilities", type: "expense" as const, subtype: "operating_expense" as const, is_system: true },
    { code: "6400", name: "Marketing and Advertising", type: "expense" as const, subtype: "operating_expense" as const, is_system: true },
    { code: "6500", name: "Travel and Entertainment", type: "expense" as const, subtype: "operating_expense" as const, is_system: true },
    { code: "6600", name: "Professional Fees", type: "expense" as const, subtype: "operating_expense" as const, is_system: true },
    { code: "6700", name: "Office Expenses", type: "expense" as const, subtype: "operating_expense" as const, is_system: true },
    { code: "6800", name: "Depreciation", type: "expense" as const, subtype: "operating_expense" as const, is_system: true },
    { code: "6900", name: "Interest Expense", type: "expense" as const, subtype: "other_expense" as const, is_system: true },
    { code: "7000", name: "Other Expenses", type: "expense" as const, subtype: "other_expense" as const, is_system: true },
  ];

  await db.insert(chartOfAccounts).values(
    STANDARD_ACCOUNTS.map((a) => ({ ...a, organization_id: organizationId }))
  ).onConflictDoNothing();
}
