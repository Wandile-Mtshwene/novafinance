import { Header } from "@/components/layout/header";
import { SettingsView } from "@/components/settings/settings-view";
import { getOrgSession } from "@/lib/auth/session";
import { getOrganizationById } from "@/lib/db/queries/organizations";
import { getSettings } from "@/lib/db/queries/settings";

export const metadata = { title: "Settings | NovaFinance" };

export default async function SettingsPage() {
  const { user, orgId } = await getOrgSession();

  const [org, settings] = await Promise.all([
    getOrganizationById(orgId),
    getSettings(orgId),
  ]);

  if (!org) return null;

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your organization and financial preferences." user={user} />
      <SettingsView org={org} settings={settings} />
    </div>
  );
}
