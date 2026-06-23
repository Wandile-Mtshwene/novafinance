import { Header } from "@/components/layout/header";
import { ProjectionsView } from "@/components/projections/projections-view";
import { getOrgSession } from "@/lib/auth/session";
import { getDashboardStats, getMonthlyRevenue, getMonthlyExpenses } from "@/lib/db/queries/dashboard";

export const metadata = { title: "Projections | NovaFinance" };

export default async function ProjectionsPage() {
  const { user, orgId } = await getOrgSession();

  const [stats, monthlyRevenue, monthlyExpenses] = await Promise.all([
    getDashboardStats(orgId),
    getMonthlyRevenue(orgId, 3),
    getMonthlyExpenses(orgId, 3),
  ]);

  const avgRevenue = monthlyRevenue.length > 0
    ? monthlyRevenue.reduce((sum, r) => sum + parseFloat(r.revenue), 0) / monthlyRevenue.length
    : 0;

  const avgExpenses = monthlyExpenses.length > 0
    ? monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.expenses), 0) / monthlyExpenses.length
    : 0;

  return (
    <div className="flex flex-col h-full">
      <Header title="Projections" subtitle="Revenue, expense, and cash flow forecasts." user={user} />
      <ProjectionsView
        monthlyRevenue={avgRevenue}
        monthlyExpenses={avgExpenses}
        cashBalance={stats.cash_balance}
      />
    </div>
  );
}
