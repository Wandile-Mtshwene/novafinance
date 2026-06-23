"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { createPayable, updatePayable } from "@/lib/db/queries/payables";

export async function createPayableAction(orgId: string, fd: FormData) {
  try {
    const { orgId: sessionOrgId, userId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };

    const total = parseFloat(fd.get("total_amount") as string) || 0;

    await createPayable({
      organization_id: orgId,
      vendor_id: (fd.get("vendor_id") as string) || null,
      bill_number: (fd.get("bill_number") as string) || null,
      status: "received",
      issue_date: fd.get("issue_date") as string,
      due_date: fd.get("due_date") as string,
      subtotal: total.toFixed(2),
      tax_amount: "0",
      total_amount: total.toFixed(2),
      amount_paid: "0",
      amount_due: total.toFixed(2),
      notes: (fd.get("notes") as string) || null,
      created_by: userId,
    });

    revalidatePath("/dashboard/payables");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to create bill" };
  }
}

export async function markPayablePaidAction(id: string, orgId: string) {
  try {
    const { orgId: sessionOrgId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };
    await updatePayable(id, orgId, { status: "paid", amount_paid: undefined, amount_due: "0" });
    revalidatePath("/dashboard/payables");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to mark bill as paid" };
  }
}
