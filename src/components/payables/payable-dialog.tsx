"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPayableAction } from "@/lib/payables/actions";

type Vendor = { id: string; name: string };

interface PayableDialogProps {
  open: boolean;
  onClose: () => void;
  vendors: Vendor[];
  orgId: string;
}

export function PayableDialog({ open, onClose, vendors, orgId }: PayableDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createPayableAction(orgId, fd);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[var(--nova-card)] border-[var(--nova-border)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[var(--nova-text)]">Add Bill</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

          <div className="space-y-1.5">
            <Label htmlFor="vendor_id" className="text-xs text-[var(--nova-muted)]">Vendor</Label>
            <select id="vendor_id" name="vendor_id" className="w-full h-9 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 text-sm">
              <option value="">No vendor</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bill_number" className="text-xs text-[var(--nova-muted)]">Bill Number</Label>
              <Input id="bill_number" name="bill_number" placeholder="e.g. BILL-001" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="total_amount" className="text-xs text-[var(--nova-muted)]">Total Amount</Label>
              <Input id="total_amount" name="total_amount" type="number" step="0.01" min="0" required placeholder="0.00" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="issue_date" className="text-xs text-[var(--nova-muted)]">Issue Date</Label>
              <Input id="issue_date" name="issue_date" type="date" defaultValue={today} required className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date" className="text-xs text-[var(--nova-muted)]">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" defaultValue={due} required className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs text-[var(--nova-muted)]">Notes</Label>
            <Input id="notes" name="notes" placeholder="Optional notes" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 text-[var(--nova-muted)]">Cancel</Button>
            <Button type="submit" disabled={isPending} className="h-9 bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white">
              {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
              Add Bill
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
