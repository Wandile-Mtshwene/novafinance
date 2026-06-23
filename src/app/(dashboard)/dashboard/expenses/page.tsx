import { Header } from "@/components/layout/header";
import { ExpensesView } from "@/components/expenses/expenses-view";
import { getOrgSession } from "@/lib/auth/session";
import { getExpenses, getExpenseCategories } from "@/lib/db/queries/expenses";
import { getVendors } from "@/lib/db/queries/vendors";
import { getAccounts } from "@/lib/db/queries/accounts";

export const metadata = { title: "Expenses | NovaFinance" };

export default async function ExpensesPage() {
  const { user, orgId } = await getOrgSession();
  const [expenses, categories, vendors, accounts] = await Promise.all([
    getExpenses(orgId, { limit: 100 }),
    getExpenseCategories(orgId),
    getVendors(orgId),
    getAccounts(orgId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Expenses" subtitle="Track and categorize your business expenses." user={user} />
      <ExpensesView expenses={expenses} categories={categories} vendors={vendors} accounts={accounts} orgId={orgId} />
    </div>
  );
}
