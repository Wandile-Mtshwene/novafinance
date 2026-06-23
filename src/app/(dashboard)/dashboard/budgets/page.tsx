import { Header } from "@/components/layout/header";
import { BudgetsView } from "@/components/budgets/budgets-view";
import { getOrgSession } from "@/lib/auth/session";
import { getBudgets } from "@/lib/db/queries/budgets";

export const metadata = { title: "Budgets | NovaFinance" };

export default async function BudgetsPage() {
  const { user, orgId } = await getOrgSession();
  const budgets = await getBudgets(orgId);

  return (
    <div className="flex flex-col h-full">
      <Header title="Budgets" subtitle="Plan and track revenue and expense targets." user={user} />
      <BudgetsView budgets={budgets} orgId={orgId} />
    </div>
  );
}
