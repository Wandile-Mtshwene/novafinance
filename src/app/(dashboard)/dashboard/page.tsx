import { Header } from "@/components/layout/header";
import { DashboardOverview } from "@/components/dashboard/overview";
import { getOrgSession } from "@/lib/auth/session";
import { getDashboardStats, getMonthlyRevenue, getMonthlyExpenses } from "@/lib/db/queries/dashboard";

export const metadata = { title: "Dashboard | NovaFinance" };

export default async function DashboardPage() {
  const { user, orgId } = await getOrgSession();

  const [stats, monthlyRevenue, monthlyExpenses] = await Promise.all([
    getDashboardStats(orgId),
    getMonthlyRevenue(orgId, 6),
    getMonthlyExpenses(orgId, 6),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle="Your financial brain at a glance."
        user={user}
      />
      <DashboardOverview
        userName={user.name ?? user.email}
        stats={stats}
        monthlyRevenue={monthlyRevenue}
        monthlyExpenses={monthlyExpenses}
      />
    </div>
  );
}
