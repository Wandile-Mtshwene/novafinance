import { Header } from "@/components/layout/header";
import { TransactionsView } from "@/components/transactions/transactions-view";
import { getOrgSession } from "@/lib/auth/session";
import { getTransactions } from "@/lib/db/queries/transactions";

export const metadata = { title: "Transactions | NovaFinance" };

export default async function TransactionsPage() {
  const { user, orgId } = await getOrgSession();
  const transactions = await getTransactions(orgId, { limit: 100 });

  return (
    <div className="flex flex-col h-full">
      <Header title="Transactions" subtitle="Your complete general ledger." user={user} />
      <TransactionsView transactions={transactions} />
    </div>
  );
}
