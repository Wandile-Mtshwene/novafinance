import { Header } from "@/components/layout/header";
import { ReceivablesView } from "@/components/receivables/receivables-view";
import { getOrgSession } from "@/lib/auth/session";
import { getInvoices } from "@/lib/db/queries/invoices";

export const metadata = { title: "Receivables | NovaFinance" };

export default async function ReceivablesPage() {
  const { user, orgId } = await getOrgSession();
  const invoices = await getInvoices(orgId, { limit: 200 });
  const outstanding = invoices.filter((i) => ["sent", "partially_paid", "overdue"].includes(i.status));

  return (
    <div className="flex flex-col h-full">
      <Header title="Receivables" subtitle="Track outstanding customer balances." user={user} />
      <ReceivablesView invoices={outstanding} />
    </div>
  );
}
