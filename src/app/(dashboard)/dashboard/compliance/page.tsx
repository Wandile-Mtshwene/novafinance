import { Header } from "@/components/layout/header";
import { ComplianceView } from "@/components/compliance/compliance-view";
import { getOrgSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { complianceRecords, taxRecords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata = { title: "Compliance | NovaFinance" };

export default async function CompliancePage() {
  const { user, orgId } = await getOrgSession();

  const [compliance, taxes] = await Promise.all([
    db.select().from(complianceRecords).where(eq(complianceRecords.organization_id, orgId)),
    db.select().from(taxRecords).where(eq(taxRecords.organization_id, orgId)),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Compliance" subtitle="Tax obligations, deadlines, and regulatory checklist." user={user} />
      <ComplianceView complianceRecords={compliance} taxRecords={taxes} />
    </div>
  );
}
