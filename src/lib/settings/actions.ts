"use server";

import { getOrgSession } from "@/lib/auth/session";
import { upsertSettings, updateOrganizationSettings } from "@/lib/db/queries/settings";
import { revalidatePath } from "next/cache";

export async function saveOrganizationSettingsAction(orgId: string, formData: FormData) {
  const { orgId: sessionOrgId } = await getOrgSession();
  if (sessionOrgId !== orgId) return { error: "Unauthorized." };

  try {
    await updateOrganizationSettings(orgId, {
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      address: (formData.get("address") as string) || null,
      tax_number: (formData.get("tax_number") as string) || null,
      registration_number: (formData.get("registration_number") as string) || null,
      vat_registered: formData.get("vat_registered") === "true",
      vat_number: (formData.get("vat_number") as string) || null,
    });
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch {
    return { error: "Failed to save settings." };
  }
}

export async function saveFinanceSettingsAction(orgId: string, formData: FormData) {
  const { orgId: sessionOrgId } = await getOrgSession();
  if (sessionOrgId !== orgId) return { error: "Unauthorized." };

  try {
    const taxRateRaw = parseFloat(formData.get("default_tax_rate") as string);
    const taxRate = isNaN(taxRateRaw) ? 0.15 : taxRateRaw / 100;

    await updateOrganizationSettings(orgId, {
      currency: (formData.get("currency") as string) || "ZAR",
      financial_year_start: parseInt(formData.get("financial_year_start") as string) || 1,
    });

    await upsertSettings(orgId, {
      default_tax_rate: String(taxRate),
      default_payment_terms: parseInt(formData.get("default_payment_terms") as string) || 30,
      invoice_prefix: (formData.get("invoice_prefix") as string) || "INV",
      next_invoice_number: parseInt(formData.get("next_invoice_number") as string) || 1001,
      invoice_notes: (formData.get("invoice_notes") as string) || null,
      invoice_terms: (formData.get("invoice_terms") as string) || null,
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch {
    return { error: "Failed to save settings." };
  }
}
