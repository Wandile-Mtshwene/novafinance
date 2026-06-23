import { Header } from "@/components/layout/header";
import { PayablesView } from "@/components/payables/payables-view";
import { getOrgSession } from "@/lib/auth/session";
import { getPayables } from "@/lib/db/queries/payables";
import { getVendors } from "@/lib/db/queries/vendors";

export const metadata = { title: "Payables | NovaFinance" };

export default async function PayablesPage() {
  const { user, orgId } = await getOrgSession();
  const [payables, vendors] = await Promise.all([
    getPayables(orgId, { limit: 100 }),
    getVendors(orgId),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Payables" subtitle="Track bills and supplier payments." user={user} />
      <PayablesView payables={payables} vendors={vendors} orgId={orgId} />
    </div>
  );
}
