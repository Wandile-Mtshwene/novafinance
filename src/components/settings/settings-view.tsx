"use client";

import { useState, useTransition } from "react";
import { Loader2, Building2, DollarSign, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { saveOrganizationSettingsAction, saveFinanceSettingsAction } from "@/lib/settings/actions";

type Organization = {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  financial_year_start: number;
  phone: string | null;
  email: string | null;
  address: string | null;
  tax_number: string | null;
  registration_number: string | null;
  vat_registered: boolean;
  vat_number: string | null;
  vat_rate: string | null;
};

type Settings = {
  invoice_prefix: string;
  next_invoice_number: number;
  default_payment_terms: number;
  default_tax_rate: string;
  invoice_notes: string | null;
  invoice_terms: string | null;
} | null;

interface SettingsViewProps {
  org: Organization;
  settings: Settings;
}

type Tab = "organization" | "finance" | "invoicing" | "notifications";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "finance", label: "Financial", icon: DollarSign },
  { id: "invoicing", label: "Invoicing", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function SettingsView({ org, settings }: SettingsViewProps) {
  const [tab, setTab] = useState<Tab>("organization");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleOrgSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveOrganizationSettingsAction(org.id, fd);
      if (result?.error) setError(result.error);
      else setSuccess("Organization settings saved.");
    });
  }

  function handleFinanceSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveFinanceSettingsAction(org.id, fd);
      if (result?.error) setError(result.error);
      else setSuccess("Finance settings saved.");
    });
  }

  return (
    <div className="p-6">
      <div className="flex gap-6 max-w-5xl">
        {/* Sidebar tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSuccess(null); setError(null); }}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors",
                  tab === t.id
                    ? "bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                    : "text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)] hover:text-[var(--nova-text)]"
                )}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {(success || error) && (
            <div className={cn("mb-4 rounded-xl border px-4 py-3 text-sm", success ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400")}>
              {success ?? error}
            </div>
          )}

          {tab === "organization" && (
            <form onSubmit={handleOrgSubmit} className="space-y-5">
              <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
                <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">Organization Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Organization Name</Label>
                    <Input name="name" defaultValue={org.name} required className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Phone</Label>
                    <Input name="phone" defaultValue={org.phone ?? ""} placeholder="+27 10 000 0000" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Email</Label>
                    <Input name="email" type="email" defaultValue={org.email ?? ""} placeholder="finance@company.com" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Address</Label>
                    <Input name="address" defaultValue={org.address ?? ""} placeholder="123 Business Street, City" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Tax Number</Label>
                    <Input name="tax_number" defaultValue={org.tax_number ?? ""} placeholder="SARS tax number" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Registration Number</Label>
                    <Input name="registration_number" defaultValue={org.registration_number ?? ""} placeholder="CIPC reg number" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
                <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">VAT Registration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">VAT Registered</Label>
                    <select name="vat_registered" defaultValue={org.vat_registered ? "true" : "false"} className="w-full h-9 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 text-sm">
                      <option value="false">Not registered</option>
                      <option value="true">VAT registered</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">VAT Number</Label>
                    <Input name="vat_number" defaultValue={org.vat_number ?? ""} placeholder="VAT number" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending} className="h-9 bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white">
                  {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {tab === "finance" && (
            <form onSubmit={handleFinanceSubmit} className="space-y-5">
              <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
                <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">Financial Year</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Financial Year Start</Label>
                    <select name="financial_year_start" defaultValue={org.financial_year_start} className="w-full h-9 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 text-sm">
                      {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Currency</Label>
                    <select name="currency" defaultValue={org.currency} className="w-full h-9 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 text-sm">
                      <option value="ZAR">ZAR (South African Rand)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Default Tax Rate (%)</Label>
                    <Input name="default_tax_rate" type="number" step="0.01" min="0" max="100" defaultValue={settings ? (parseFloat(settings.default_tax_rate) * 100).toFixed(2) : "15"} className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Default Payment Terms (days)</Label>
                    <Input name="default_payment_terms" type="number" min="0" defaultValue={settings?.default_payment_terms ?? 30} className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending} className="h-9 bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white">
                  {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {tab === "invoicing" && (
            <form onSubmit={handleFinanceSubmit} className="space-y-5">
              <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
                <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">Invoice Defaults</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Invoice Prefix</Label>
                    <Input name="invoice_prefix" defaultValue={settings?.invoice_prefix ?? "INV"} className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Next Invoice Number</Label>
                    <Input name="next_invoice_number" type="number" min="1" defaultValue={settings?.next_invoice_number ?? 1001} className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Default Invoice Notes</Label>
                    <textarea name="invoice_notes" rows={3} defaultValue={settings?.invoice_notes ?? ""} placeholder="Thank you for your business." className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 py-2 text-sm resize-none" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs text-[var(--nova-muted)]">Default Invoice Terms</Label>
                    <textarea name="invoice_terms" rows={3} defaultValue={settings?.invoice_terms ?? ""} placeholder="Payment is due within 30 days of invoice date." className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 py-2 text-sm resize-none" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending} className="h-9 bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white">
                  {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {tab === "notifications" && (
            <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-6 text-center py-20">
              <Bell size={28} className="text-[var(--nova-accent)] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[var(--nova-text)]">Notifications coming soon</h3>
              <p className="text-xs text-[var(--nova-muted)] mt-1.5 max-w-xs mx-auto">Configure email alerts for overdue invoices, upcoming tax deadlines, and low cash balance warnings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
