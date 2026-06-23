import { Header } from "@/components/layout/header";
import { StatementsView } from "@/components/statements/statements-view";
import { getOrgSession } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/db/queries/dashboard";
import { getExpenseSummary } from "@/lib/db/queries/expenses";
import { getInvoiceSummary } from "@/lib/db/queries/invoices";
import { getPayableSummary } from "@/lib/db/queries/payables";

export const metadata = { title: "Financial Statements | NovaFinance" };

export default async function StatementsPage() {
  const { user, orgId } = await getOrgSession();

  const [stats, expenseSummary, invoiceSummary, payableSummary] = await Promise.all([
    getDashboardStats(orgId),
    getExpenseSummary(orgId),
    getInvoiceSummary(orgId),
    getPayableSummary(orgId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Financial Statements" subtitle="Income statement, balance sheet, and cash flow." user={user} />
      <StatementsView
        totalRevenue={invoiceSummary.total_invoiced}
        totalExpenses={expenseSummary.total}
        totalAssets={stats.cash_balance}
        totalLiabilities={payableSummary.total_outstanding}
        totalEquity={invoiceSummary.total_invoiced - expenseSummary.total}
        cashBalance={stats.cash_balance}
        totalInflows={invoiceSummary.total_invoiced}
        totalOutflows={expenseSummary.total}
      />
    </div>
  );
}
