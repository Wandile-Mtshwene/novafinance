"use client";

import { useState, useTransition } from "react";
import { Plus, Receipt, Search, Tag, Trash2, Pencil } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { deleteExpenseAction } from "@/lib/expenses/actions";

type Expense = {
  id: string;
  description: string;
  amount: string;
  total_amount: string;
  expense_date: string;
  category_id: string | null;
  vendor_id: string | null;
  notes: string | null;
  created_at: Date;
  category_name: string | null;
  vendor_name: string | null;
};

type Category = { id: string; name: string };
type Vendor = { id: string; name: string };
type Account = { id: string; name: string };

interface ExpensesViewProps {
  expenses: Expense[];
  categories: Category[];
  vendors: Vendor[];
  accounts: Account[];
  orgId: string;
}

export function ExpensesView({ expenses, categories, vendors, accounts, orgId }: ExpensesViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.total_amount ?? "0"), 0);

  const filtered = expenses.filter((e) => {
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase()) || (e.vendor_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || e.category_id === categoryFilter;
    return matchSearch && matchCat;
  });

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteExpenseAction(id, orgId);
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-[var(--nova-border)] bg-gradient-to-br from-red-500/10 to-transparent p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--nova-muted)] mb-1">Total Expenses</p>
        <p className="text-4xl font-bold text-[var(--nova-text)]">{formatCurrency(total)}</p>
        <p className="text-xs text-[var(--nova-muted)] mt-1">{expenses.length} expense{expenses.length !== 1 ? "s" : ""} recorded</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] text-sm" />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white h-9 px-3 text-xs gap-1.5 ml-auto">
          <Plus size={14} /> Add Expense
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Receipt} title={expenses.length === 0 ? "No expenses yet" : "No results"} description={expenses.length === 0 ? "Track your business expenses to understand your spending." : "Try adjusting your search."} action={expenses.length === 0 ? { label: "Add Expense", onClick: () => setDialogOpen(true) } : undefined} />
      ) : (
        <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--nova-border)] bg-[var(--nova-tint-1)]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Description</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Vendor</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Amount</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense) => (
                <tr key={expense.id} className="border-b border-[var(--nova-border)] last:border-0 hover:bg-[var(--nova-tint-1)] transition-colors group">
                  <td className="px-4 py-3 text-xs text-[var(--nova-muted)]">{formatDate(expense.expense_date)}</td>
                  <td className="px-4 py-3 text-sm text-[var(--nova-text)] font-medium">{expense.description}</td>
                  <td className="px-4 py-3">
                    {expense.category_name ? (
                      <Badge variant="muted" className="gap-1 text-[10px]">
                        <Tag size={9} />{expense.category_name}
                      </Badge>
                    ) : <span className="text-xs text-[var(--nova-dim)]">Uncategorized</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--nova-muted)]">{expense.vendor_name ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-red-400">{formatCurrency(parseFloat(expense.total_amount))}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(expense); setDialogOpen(true); }} className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)] hover:text-[var(--nova-text)] transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(expense.id)} disabled={isPending} className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--nova-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} expense={editing} categories={categories} vendors={vendors} accounts={accounts} orgId={orgId} />
    </div>
  );
}
