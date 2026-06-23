"use client";

import { TrendingUp, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  due_date: string;
  total_amount: string;
  amount_due: string;
  customer_name: string | null;
};

interface ReceivablesViewProps {
  invoices: Invoice[];
}

function daysOverdue(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / 86400000);
  return diff;
}

function agingBucket(dueDate: string): string {
  const days = daysOverdue(dueDate);
  if (days <= 0) return "current";
  if (days <= 30) return "1-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}

const BUCKET_COLORS: Record<string, string> = {
  current: "text-emerald-400",
  "1-30": "text-amber-400",
  "31-60": "text-orange-400",
  "61-90": "text-red-400",
  "90+": "text-red-600",
};

export function ReceivablesView({ invoices }: ReceivablesViewProps) {
  const outstanding = invoices.filter((i) => ["sent", "partially_paid", "overdue"].includes(i.status));
  const totalOutstanding = outstanding.reduce((sum, i) => sum + parseFloat(i.amount_due ?? "0"), 0);
  const overdueInvoices = outstanding.filter((i) => i.status === "overdue");
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + parseFloat(i.amount_due ?? "0"), 0);
  const currentAmount = totalOutstanding - overdueAmount;

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Outstanding" value={formatCurrency(totalOutstanding)} icon={TrendingUp} />
        <StatCard label="Current (not due)" value={formatCurrency(currentAmount)} icon={CheckCircle2} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
        <StatCard label="Overdue" value={formatCurrency(overdueAmount)} icon={AlertCircle} iconColor="text-red-400" iconBg="bg-red-500/10" sub={`${overdueInvoices.length} invoice${overdueInvoices.length !== 1 ? "s" : ""}`} />
      </div>

      {/* Aging table */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-3">Aging Schedule</h3>
        {outstanding.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No outstanding receivables" description="All your invoices are paid. Great job!" />
        ) : (
          <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--nova-border)] bg-[var(--nova-tint-1)]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Invoice</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Customer</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Due Date</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Aging</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Status</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {outstanding.map((inv) => {
                  const bucket = agingBucket(inv.due_date);
                  const days = daysOverdue(inv.due_date);
                  return (
                    <tr key={inv.id} className="border-b border-[var(--nova-border)] last:border-0 hover:bg-[var(--nova-tint-1)] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[var(--nova-text)]">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-sm text-[var(--nova-text)]">{inv.customer_name ?? "No customer"}</td>
                      <td className="px-4 py-3 text-xs text-[var(--nova-muted)]">{formatDate(inv.due_date)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold", BUCKET_COLORS[bucket])}>
                          {days <= 0 ? "Current" : `${days}d overdue`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={inv.status === "overdue" ? "danger" : inv.status === "partially_paid" ? "warning" : "default"} className="text-[10px] capitalize">
                          {inv.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[var(--nova-accent)]">
                        {formatCurrency(parseFloat(inv.amount_due))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
