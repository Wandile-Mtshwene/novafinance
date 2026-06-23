"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ComplianceRecord = {
  id: string;
  name: string;
  category: string;
  status: string;
  due_date: string | null;
  description: string | null;
};

type TaxRecord = {
  id: string;
  tax_type: string;
  period_start: string;
  period_end: string;
  due_date: string;
  status: string;
  tax_amount: string;
};

interface ComplianceViewProps {
  complianceRecords: ComplianceRecord[];
  taxRecords: TaxRecord[];
}

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" | "muted"; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  compliant: { label: "Compliant", variant: "success", icon: CheckCircle2 },
  pending: { label: "Pending", variant: "warning", icon: Clock },
  overdue: { label: "Overdue", variant: "danger", icon: AlertTriangle },
  not_applicable: { label: "N/A", variant: "muted", icon: ShieldCheck },
};

const DEFAULT_COMPLIANCE_ITEMS = [
  { name: "VAT Return (Monthly)", category: "VAT", status: "pending", description: "Monthly VAT 201 return to SARS" },
  { name: "PAYE Return (Monthly)", category: "PAYE", status: "pending", description: "Monthly EMP201 payroll tax return" },
  { name: "UIF Contribution", category: "UIF", status: "pending", description: "Monthly UIF contributions" },
  { name: "Provisional Tax (Feb)", category: "Income Tax", status: "pending", description: "First provisional tax payment" },
  { name: "Annual Financial Statements", category: "Corporate", status: "pending", description: "Annual financial statements preparation" },
  { name: "CIPC Annual Return", category: "Corporate", status: "pending", description: "Annual company return to CIPC" },
];

export function ComplianceView({ complianceRecords, taxRecords }: ComplianceViewProps) {
  const compliantCount = complianceRecords.filter((r) => r.status === "compliant").length;
  const overdueCount = complianceRecords.filter((r) => r.status === "overdue").length;
  const pendingCount = complianceRecords.filter((r) => r.status === "pending").length;
  const items = complianceRecords.length > 0 ? complianceRecords : DEFAULT_COMPLIANCE_ITEMS;

  return (
    <div className="p-6 space-y-6">
      {/* Status summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-sm font-medium text-[var(--nova-text)]">Compliant</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{compliantCount}</p>
        </div>
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-400" />
            <span className="text-sm font-medium text-[var(--nova-text)]">Pending</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{pendingCount || items.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-sm font-medium text-[var(--nova-text)]">Overdue</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{overdueCount}</p>
        </div>
      </div>

      {/* Compliance checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--nova-text)]">Compliance Checklist</h3>
          <Button variant="ghost" className="h-7 px-2 text-xs text-[var(--nova-accent)] gap-1">
            <Plus size={12} /> Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {(items as Array<{ name: string; category: string; status: string; description?: string | null }>).map((item, i) => {
            const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", item.status === "compliant" ? "bg-emerald-500/10" : item.status === "overdue" ? "bg-red-500/10" : "bg-amber-500/10")}>
                    <Icon size={14} className={cn(item.status === "compliant" ? "text-emerald-400" : item.status === "overdue" ? "text-red-400" : "text-amber-400")} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--nova-text)]">{item.name}</p>
                    {item.description && <p className="text-xs text-[var(--nova-muted)]">{item.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="muted" className="text-[9px] capitalize">{item.category}</Badge>
                  <Badge variant={cfg.variant} className="text-[9px]">{cfg.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
        <p className="text-xs text-amber-400">
          Compliance requirements are based on South African tax law. Always consult a registered tax practitioner for specific advice. Tax deadlines may vary based on your financial year and registration status.
        </p>
      </div>
    </div>
  );
}
