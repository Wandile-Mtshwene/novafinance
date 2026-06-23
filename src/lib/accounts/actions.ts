"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { createAccount, updateAccount, deleteAccount } from "@/lib/db/queries/accounts";

export async function createAccountAction(orgId: string, fd: FormData) {
  try {
    const { orgId: sessionOrgId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };

    const openingBalance = parseFloat(fd.get("opening_balance") as string) || 0;

    await createAccount({
      organization_id: orgId,
      name: fd.get("name") as string,
      bank_name: (fd.get("bank_name") as string) || null,
      account_number: (fd.get("account_number") as string) || null,
      currency: (fd.get("currency") as string) || "ZAR",
      opening_balance: openingBalance.toFixed(2),
      current_balance: openingBalance.toFixed(2),
    });

    revalidatePath("/dashboard/accounts");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to create account" };
  }
}

export async function updateAccountAction(id: string, orgId: string, fd: FormData) {
  try {
    const { orgId: sessionOrgId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };

    await updateAccount(id, orgId, {
      name: fd.get("name") as string,
      bank_name: (fd.get("bank_name") as string) || null,
      account_number: (fd.get("account_number") as string) || null,
      currency: (fd.get("currency") as string) || "ZAR",
    });

    revalidatePath("/dashboard/accounts");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to update account" };
  }
}

export async function deleteAccountAction(id: string, orgId: string) {
  try {
    const { orgId: sessionOrgId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };
    await deleteAccount(id, orgId);
    revalidatePath("/dashboard/accounts");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to delete account" };
  }
}
