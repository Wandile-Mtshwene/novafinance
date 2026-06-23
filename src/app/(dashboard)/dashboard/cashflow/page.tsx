import { Header } from "@/components/layout/header";
import { CashflowView } from "@/components/cashflow/cashflow-view";
import { getOrgSession } from "@/lib/auth/session";
import { getCashflowForecasts } from "@/lib/db/queries/cashflow";
import { getDashboardStats } from "@/lib/db/queries/dashboard";

export const metadata = { title: "Cash Flow | NovaFinance" };

export default async function CashflowPage() {
  const { user, orgId } = await getOrgSession();
  const year = new Date().getFullYear();

  const [forecasts, stats] = await Promise.all([
    getCashflowForecasts(orgId, year),
    getDashboardStats(orgId),
  ]);

  const totalInflows = forecasts.reduce((sum, f) => sum + parseFloat(f.actual_inflows || f.projected_inflows || "0"), 0);
  const totalOutflows = forecasts.reduce((sum, f) => sum + parseFloat(f.actual_outflows || f.projected_outflows || "0"), 0);

  return (
    <div className="flex flex-col h-full">
      <Header title="Cash Flow" subtitle="Monitor your cash position and runway." user={user} />
      <CashflowView
        forecasts={forecasts}
        cashBalance={stats.cash_balance}
        totalInflows={totalInflows}
        totalOutflows={totalOutflows}
      />
    </div>
  );
}
