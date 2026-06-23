"use client";

import { useState } from "react";
import { Plus, FileText, Search, Calendar, AlertCircle, CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceDialog } from "@/components/invoices/invoice-dialog";
import { cn } from "@/lib/utils";

type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  total_amount: string;
  amount_paid: string;
  amount_due: string;
  customer_id: string | null;
  customer_name: string | null;
  created_at: Date;
};

type Customer = { id: string; name: string };

interface InvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
  orgId: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; variant: "success" | "warning" | "danger" | "muted" | "default" }> = {
  draft: { label: "Draft", icon: Clock, variant: "muted" },
  sent: { label: "Sent", icon: Clock, variant: "default" },
  partially_paid: { label: "Partial", icon: AlertCircle, variant: "warning" },
  paid: { label: "Paid", icon: CheckCircle2, variant: "success" },
  overdue: { label: "Overdue", icon: AlertCircle, variant: "danger" },
  voided: { label: "Voided", icon: XCircle, variant: "muted" },
  cancelled: { label: "Cancelled", icon: XCircle, variant: "muted" },
};

export function InvoicesView({ invoices, customers, orgId }: InvoicesViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      !search ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = invoices.reduce((sum, i) => sum + parseFloat(i.amount_due ?? "0"), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + parseFloat(i.amount_paid ?? "0"), 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="p-6 space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <p className="text-xs text-[var(--nova-muted)] mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-[var(--nova-text)]">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <p className="text-xs text-[var(--nova-muted)] mb-1">Collected</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <p className="text-xs text-[var(--nova-muted)] mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-400">{overdueCount} invoice{overdueCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] text-sm"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "draft", "sent", "overdue", "paid"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                statusFilter === s
                  ? "bg-[var(--nova-accent)] text-white"
                  : "bg-[var(--nova-tint-2)] text-[var(--nova-muted)] hover:text-[var(--nova-text)]"
              )}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white h-9 px-3 text-xs gap-1.5 ml-auto"
        >
          <Plus size={14} />
          New Invoice
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={invoices.length === 0 ? "No invoices yet" : "No results"}
          description={invoices.length === 0 ? "Create your first invoice to start tracking your receivables." : "Try adjusting your search or filter."}
          action={invoices.length === 0 ? { label: "New Invoice", onClick: () => setDialogOpen(true) } : undefined}
        />
      ) : (
        <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--nova-border)] bg-[var(--nova-tint-1)]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Invoice</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Customer</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Due Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Amount</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Balance</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const statusCfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft;
                const StatusIcon = statusCfg.icon;
                const isOverdue = inv.status === "overdue";

                return (
                  <tr key={inv.id} className="border-b border-[var(--nova-border)] last:border-0 hover:bg-[var(--nova-tint-1)] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-[var(--nova-text)]">{inv.invoice_number}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--nova-text)]">{inv.customer_name ?? "No customer"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className={isOverdue ? "text-red-400" : "text-[var(--nova-muted)]"} />
                        <span className={cn("text-xs", isOverdue ? "text-red-400 font-medium" : "text-[var(--nova-muted)]")}>
                          {formatDate(inv.due_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusCfg.variant} className="gap-1">
                        <StatusIcon size={9} />
                        {statusCfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-[var(--nova-text)]">
                      {formatCurrency(parseFloat(inv.total_amount))}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      <span className={parseFloat(inv.amount_due) > 0 ? "text-[var(--nova-accent)]" : "text-emerald-400"}>
                        {formatCurrency(parseFloat(inv.amount_due))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={14} className="text-[var(--nova-dim)] ml-auto" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <InvoiceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        customers={customers}
        orgId={orgId}
      />
    </div>
  );
}
