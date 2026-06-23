"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createExpenseAction, updateExpenseAction } from "@/lib/expenses/actions";

type Expense = { id: string; description: string; amount: string; expense_date: string; category_id: string | null; vendor_id: string | null; notes: string | null };
type Category = { id: string; name: string };
type Vendor = { id: string; name: string };
type Account = { id: string; name: string };

interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  categories: Category[];
  vendors: Vendor[];
  accounts: Account[];
  orgId: string;
}

export function ExpenseDialog({ open, onClose, expense, categories, vendors, accounts, orgId }: ExpenseDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = expense
        ? await updateExpenseAction(expense.id, orgId, fd)
        : await createExpenseAction(orgId, fd);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[var(--nova-card)] border-[var(--nova-border)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[var(--nova-text)]">{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-[var(--nova-muted)]">Description</Label>
            <Input id="description" name="description" defaultValue={expense?.description} required placeholder="e.g. Office supplies" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs text-[var(--nova-muted)]">Amount (excl. tax)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue={expense?.amount} required placeholder="0.00" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expense_date" className="text-xs text-[var(--nova-muted)]">Date</Label>
              <Input id="expense_date" name="expense_date" type="date" defaultValue={expense?.expense_date ?? today} required className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category_id" className="text-xs text-[var(--nova-muted)]">Category</Label>
              <select id="category_id" name="category_id" defaultValue={expense?.category_id ?? ""} className="w-full h-9 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 text-sm">
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor_id" className="text-xs text-[var(--nova-muted)]">Vendor</Label>
              <select id="vendor_id" name="vendor_id" defaultValue={expense?.vendor_id ?? ""} className="w-full h-9 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 text-sm">
                <option value="">No vendor</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account_id" className="text-xs text-[var(--nova-muted)]">Paid from Account</Label>
            <select id="account_id" name="account_id" className="w-full h-9 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 text-sm">
              <option value="">No account</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs text-[var(--nova-muted)]">Notes</Label>
            <Input id="notes" name="notes" defaultValue={expense?.notes ?? ""} placeholder="Optional notes" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 text-[var(--nova-muted)]">Cancel</Button>
            <Button type="submit" disabled={isPending} className="h-9 bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white">
              {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
              {expense ? "Save Changes" : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
