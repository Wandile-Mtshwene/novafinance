"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { createExpense, updateExpense, deleteExpense } from "@/lib/db/queries/expenses";

export async function createExpenseAction(orgId: string, fd: FormData) {
  try {
    const { orgId: sessionOrgId, userId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };

    const amount = parseFloat(fd.get("amount") as string) || 0;

    await createExpense({
      organization_id: orgId,
      description: fd.get("description") as string,
      amount: amount.toFixed(2),
      tax_amount: "0",
      total_amount: amount.toFixed(2),
      expense_date: fd.get("expense_date") as string,
      category_id: (fd.get("category_id") as string) || null,
      vendor_id: (fd.get("vendor_id") as string) || null,
      account_id: (fd.get("account_id") as string) || null,
      notes: (fd.get("notes") as string) || null,
      created_by: userId,
    });

    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to create expense" };
  }
}

export async function updateExpenseAction(id: string, orgId: string, fd: FormData) {
  try {
    const { orgId: sessionOrgId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };

    const amount = parseFloat(fd.get("amount") as string) || 0;

    await updateExpense(id, orgId, {
      description: fd.get("description") as string,
      amount: amount.toFixed(2),
      total_amount: amount.toFixed(2),
      expense_date: fd.get("expense_date") as string,
      category_id: (fd.get("category_id") as string) || null,
      vendor_id: (fd.get("vendor_id") as string) || null,
      notes: (fd.get("notes") as string) || null,
    });

    revalidatePath("/dashboard/expenses");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to update expense" };
  }
}

export async function deleteExpenseAction(id: string, orgId: string) {
  try {
    const { orgId: sessionOrgId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };
    await deleteExpense(id, orgId);
    revalidatePath("/dashboard/expenses");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to delete expense" };
  }
}
