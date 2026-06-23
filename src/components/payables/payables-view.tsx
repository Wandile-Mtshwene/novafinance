"use client";

import { useState } from "react";
import { TrendingDown, AlertCircle, Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PayableDialog } from "@/components/payables/payable-dialog";

type Payable = {
  id: string;
  bill_number: string | null;
  status: string;
  due_date: string;
  total_amount: string;
  amount_due: string;
  vendor_id: string | null;
  vendor_name: string | null;
  created_at: Date;
};

type Vendor = { id: string; name: string };

interface PayablesViewProps {
  payables: Payable[];
  vendors: Vendor[];
  orgId: string;
}

function daysUntilDue(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  return Math.floor((due.getTime() - now.getTime()) / 86400000);
}

export function PayablesView({ payables, vendors, orgId }: PayablesViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const totalOutstanding = payables.reduce((sum, p) => sum + parseFloat(p.amount_due ?? "0"), 0);
  const overdue = payables.filter((p) => p.status === "overdue");
  const overdueAmount = overdue.reduce((sum, p) => sum + parseFloat(p.amount_due ?? "0"), 0);
  const dueSoon = payables.filter((p) => {
    const days = daysUntilDue(p.due_date);
    return days >= 0 && days <= 7 && p.status !== "paid";
  });

  const filtered = payables.filter((p) => {
    return !search || (p.vendor_name ?? "").toLowerCase().includes(search.toLowerCase()) || (p.bill_number ?? "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Payable" value={formatCurrency(totalOutstanding)} icon={TrendingDown} iconColor="text-[var(--nova-accent)]" />
        <StatCard label="Overdue" value={formatCurrency(overdueAmount)} icon={AlertCircle} iconColor="text-red-400" iconBg="bg-red-500/10" sub={`${overdue.length} bill${overdue.length !== 1 ? "s" : ""}`} />
        <StatCard label="Due in 7 Days" value={formatCurrency(dueSoon.reduce((s, p) => s + parseFloat(p.amount_due ?? "0"), 0))} icon={AlertCircle} iconColor="text-amber-400" iconBg="bg-amber-500/10" sub={`${dueSoon.length} bill${dueSoon.length !== 1 ? "s" : ""}`} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input placeholder="Search bills..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] text-sm" />
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white h-9 px-3 text-xs gap-1.5">
          <Plus size={14} /> Add Bill
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={TrendingDown} title={payables.length === 0 ? "No bills yet" : "No results"} description={payables.length === 0 ? "Record bills from suppliers to track what you owe." : "Try adjusting your search."} action={payables.length === 0 ? { label: "Add Bill", onClick: () => setDialogOpen(true) } : undefined} />
      ) : (
        <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--nova-border)] bg-[var(--nova-tint-1)]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Bill #</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Vendor</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Due Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Days</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const days = daysUntilDue(p.due_date);
                const isOverdue = p.status === "overdue" || days < 0;
                return (
                  <tr key={p.id} className="border-b border-[var(--nova-border)] last:border-0 hover:bg-[var(--nova-tint-1)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--nova-muted)]">{p.bill_number ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-[var(--nova-text)]">{p.vendor_name ?? "No vendor"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--nova-muted)]">{formatDate(p.due_date)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-semibold", isOverdue ? "text-red-400" : days <= 7 ? "text-amber-400" : "text-[var(--nova-muted)]")}>
                        {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === "overdue" ? "danger" : p.status === "paid" ? "success" : p.status === "partially_paid" ? "warning" : "muted"} className="text-[10px] capitalize">
                        {p.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-red-400">
                      {formatCurrency(parseFloat(p.amount_due))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PayableDialog open={dialogOpen} onClose={() => setDialogOpen(false)} vendors={vendors} orgId={orgId} />
    </div>
  );
}
