import { Header } from "@/components/layout/header";
import { ReportsView } from "@/components/reports/reports-view";
import { getOrgSession } from "@/lib/auth/session";
import { getDashboardStats, getMonthlyRevenue } from "@/lib/db/queries/dashboard";
import { getExpenseSummary, getExpensesByCategory } from "@/lib/db/queries/expenses";
import { getInvoiceSummary } from "@/lib/db/queries/invoices";

export const metadata = { title: "Reports | NovaFinance" };

export default async function ReportsPage() {
  const { user, orgId } = await getOrgSession();

  const [stats, invoiceSummary, expenseSummary, expensesByCategory, monthlyRevenue] = await Promise.all([
    getDashboardStats(orgId),
    getInvoiceSummary(orgId),
    getExpenseSummary(orgId),
    getExpensesByCategory(orgId),
    getMonthlyRevenue(orgId, 6),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Reports" subtitle="Financial insights, summaries, and exports." user={user} />
      <ReportsView
        totalRevenue={invoiceSummary.total_invoiced}
        totalExpenses={expenseSummary.total}
        totalReceivables={stats.total_receivables}
        totalPayables={stats.total_payables}
        cashBalance={stats.cash_balance}
        expensesByCategory={expensesByCategory}
        monthlyRevenue={monthlyRevenue}
      />
    </div>
  );
}
