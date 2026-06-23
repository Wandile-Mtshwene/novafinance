"use server";

import { revalidatePath } from "next/cache";
import { getOrgSession } from "@/lib/auth/session";
import { createInvoice, updateInvoice, getNextInvoiceNumber } from "@/lib/db/queries/invoices";
import { db } from "@/lib/db";
import { invoiceItems } from "@/lib/db/schema";

export async function createInvoiceAction(orgId: string, fd: FormData) {
  try {
    const { orgId: sessionOrgId, userId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };

    const lines = JSON.parse(fd.get("lines") as string) as Array<{
      description: string;
      quantity: string;
      unit_price: string;
    }>;

    const issueDate = fd.get("issue_date") as string;
    const dueDate = fd.get("due_date") as string;
    const customerId = (fd.get("customer_id") as string) || null;

    const subtotal = lines.reduce((sum, l) => {
      return sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.unit_price) || 0);
    }, 0);

    const invoiceNumber = await getNextInvoiceNumber(orgId);

    const invoice = await createInvoice({
      organization_id: orgId,
      customer_id: customerId,
      invoice_number: invoiceNumber,
      reference: (fd.get("reference") as string) || null,
      status: "draft",
      issue_date: issueDate,
      due_date: dueDate,
      subtotal: subtotal.toFixed(2),
      tax_amount: "0",
      discount_amount: "0",
      total_amount: subtotal.toFixed(2),
      amount_paid: "0",
      amount_due: subtotal.toFixed(2),
      notes: (fd.get("notes") as string) || null,
      created_by: userId,
    });

    await db.insert(invoiceItems).values(
      lines.map((l, i) => {
        const qty = parseFloat(l.quantity) || 0;
        const price = parseFloat(l.unit_price) || 0;
        return {
          invoice_id: invoice.id,
          description: l.description,
          quantity: qty.toString(),
          unit_price: price.toFixed(2),
          total: (qty * price).toFixed(2),
          sort_order: i,
        };
      })
    );

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
    return { invoiceId: invoice.id };
  } catch (err) {
    console.error(err);
    return { error: "Failed to create invoice" };
  }
}

export async function updateInvoiceStatusAction(id: string, orgId: string, status: string) {
  try {
    const { orgId: sessionOrgId } = await getOrgSession();
    if (sessionOrgId !== orgId) return { error: "Unauthorized" };
    await updateInvoice(id, orgId, { status: status as typeof import("@/lib/db/schema").invoices.$inferInsert.status });
    revalidatePath("/dashboard/invoices");
    return {};
  } catch (err) {
    console.error(err);
    return { error: "Failed to update invoice" };
  }
}
