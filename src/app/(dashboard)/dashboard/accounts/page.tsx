import { Header } from "@/components/layout/header";
import { AccountsView } from "@/components/accounts/accounts-view";
import { getOrgSession } from "@/lib/auth/session";
import { getAccounts } from "@/lib/db/queries/accounts";

export const metadata = { title: "Accounts | NovaFinance" };

export default async function AccountsPage() {
  const { user, orgId } = await getOrgSession();
  const accounts = await getAccounts(orgId);

  return (
    <div className="flex flex-col h-full">
      <Header title="Accounts" subtitle="Manage your bank and cash accounts." user={user} />
      <AccountsView accounts={accounts} orgId={orgId} />
    </div>
  );
}
