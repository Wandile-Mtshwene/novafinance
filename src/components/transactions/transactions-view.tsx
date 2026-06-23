"use client";

import { useState } from "react";
import { ArrowLeftRight, Search, ArrowUpRight, ArrowDownRight, RefreshCw, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Transaction = {
  id: string;
  description: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  transaction_date: string;
  reference: string | null;
  notes: string | null;
};

interface TransactionsViewProps {
  transactions: Transaction[];
}

const TYPE_CONFIG: Record<string, { label: string; colorClass: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  income: { label: "Income", colorClass: "text-emerald-400", icon: ArrowUpRight },
  expense: { label: "Expense", colorClass: "text-red-400", icon: ArrowDownRight },
  transfer: { label: "Transfer", colorClass: "text-sky-400", icon: RefreshCw },
  adjustment: { label: "Adjustment", colorClass: "text-amber-400", icon: RefreshCw },
  opening_balance: { label: "Opening Balance", colorClass: "text-purple-400", icon: ArrowUpRight },
};

const STATUS_VARIANT: Record<string, "success" | "muted" | "warning" | "danger" | "default"> = {
  posted: "success",
  draft: "muted",
  reconciled: "default",
  voided: "danger",
};

export function TransactionsView({ transactions }: TransactionsViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = transactions.filter((t) => {
    const matchSearch = !search || t.description.toLowerCase().includes(search.toLowerCase()) || (t.reference ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] text-sm" />
        </div>
        <div className="flex gap-1.5">
          {["all", "income", "expense", "transfer", "adjustment"].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize", typeFilter === t ? "bg-[var(--nova-accent)] text-white" : "bg-[var(--nova-tint-2)] text-[var(--nova-muted)] hover:text-[var(--nova-text)]")}>
              {t === "all" ? "All" : TYPE_CONFIG[t]?.label ?? t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title={transactions.length === 0 ? "No transactions yet" : "No results"} description={transactions.length === 0 ? "Transactions are created automatically as you record invoices, expenses, and payments." : "Try adjusting your search or filter."} />
      ) : (
        <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--nova-border)] bg-[var(--nova-tint-1)]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Description</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Type</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Reference</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const typeCfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.adjustment;
                const TypeIcon = typeCfg.icon;
                const isNegative = ["expense"].includes(tx.type);

                return (
                  <tr key={tx.id} className="border-b border-[var(--nova-border)] last:border-0 hover:bg-[var(--nova-tint-1)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--nova-muted)]">{formatDate(tx.transaction_date)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--nova-text)]">{tx.description}</td>
                    <td className="px-4 py-3">
                      <div className={cn("flex items-center gap-1.5 text-xs font-medium", typeCfg.colorClass)}>
                        <TypeIcon size={12} />
                        {typeCfg.label}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[tx.status] ?? "muted"} className="text-[10px] capitalize">{tx.status}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--nova-muted)]">{tx.reference ?? "-"}</td>
                    <td className={cn("px-4 py-3 text-right font-mono text-sm font-semibold", isNegative ? "text-red-400" : "text-emerald-400")}>
                      {isNegative ? "-" : "+"}{formatCurrency(parseFloat(tx.amount))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
