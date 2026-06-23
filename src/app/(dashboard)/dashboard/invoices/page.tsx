import { Header } from "@/components/layout/header";
import { InvoicesView } from "@/components/invoices/invoices-view";
import { getOrgSession } from "@/lib/auth/session";
import { getInvoices } from "@/lib/db/queries/invoices";
import { getCustomers } from "@/lib/db/queries/customers";

export const metadata = { title: "Invoices | NovaFinance" };

export default async function InvoicesPage() {
  const { user, orgId } = await getOrgSession();
  const [invoices, customers] = await Promise.all([
    getInvoices(orgId, { limit: 100 }),
    getCustomers(orgId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Invoices" subtitle="Track your billing and receivables." user={user} />
      <InvoicesView invoices={invoices} customers={customers} orgId={orgId} />
    </div>
  );
}
