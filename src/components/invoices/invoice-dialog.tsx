"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvoiceAction } from "@/lib/invoices/actions";
import { formatCurrency } from "@/lib/utils";

type Customer = { id: string; name: string };

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  orgId: string;
}

interface LineItem {
  description: string;
  quantity: string;
  unit_price: string;
}

export function InvoiceDialog({ open, onClose, customers, orgId }: InvoiceDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<LineItem[]>([
    { description: "", quantity: "1", unit_price: "" },
  ]);

  const subtotal = lines.reduce((sum, l) => {
    const qty = parseFloat(l.quantity) || 0;
    const price = parseFloat(l.unit_price) || 0;
    return sum + qty * price;
  }, 0);

  function addLine() {
    setLines((prev) => [...prev, { description: "", quantity: "1", unit_price: "" }]);
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: keyof LineItem, value: string) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("lines", JSON.stringify(lines));

    startTransition(async () => {
      const result = await createInvoiceAction(orgId, fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setLines([{ description: "", quantity: "1", unit_price: "" }]);
        onClose();
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[var(--nova-card)] border-[var(--nova-border)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[var(--nova-text)]">New Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customer_id" className="text-xs text-[var(--nova-muted)]">Customer</Label>
              <select id="customer_id" name="customer_id" className="w-full h-9 rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 text-sm">
                <option value="">No customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue_date" className="text-xs text-[var(--nova-muted)]">Issue Date</Label>
              <Input id="issue_date" name="issue_date" type="date" defaultValue={today} required className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date" className="text-xs text-[var(--nova-muted)]">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" defaultValue={due} required className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reference" className="text-xs text-[var(--nova-muted)]">Reference (optional)</Label>
              <Input id="reference" name="reference" placeholder="PO or reference number" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-[var(--nova-muted)]">Line Items</Label>
              <Button type="button" variant="ghost" onClick={addLine} className="h-7 px-2 text-xs text-[var(--nova-accent)] gap-1">
                <Plus size={12} /> Add Line
              </Button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-1">
                <span className="col-span-5 text-[9px] font-semibold uppercase tracking-widest text-[var(--nova-dim)]">Description</span>
                <span className="col-span-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--nova-dim)]">Qty</span>
                <span className="col-span-3 text-[9px] font-semibold uppercase tracking-widest text-[var(--nova-dim)]">Unit Price</span>
                <span className="col-span-2 text-right text-[9px] font-semibold uppercase tracking-widest text-[var(--nova-dim)]">Total</span>
              </div>
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    value={line.description}
                    onChange={(e) => updateLine(i, "description", e.target.value)}
                    placeholder="Item description"
                    required
                    className="col-span-5 h-8 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] text-xs"
                  />
                  <Input
                    value={line.quantity}
                    onChange={(e) => updateLine(i, "quantity", e.target.value)}
                    type="number"
                    min="0"
                    step="0.001"
                    className="col-span-2 h-8 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] text-xs"
                  />
                  <Input
                    value={line.unit_price}
                    onChange={(e) => updateLine(i, "unit_price", e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                    className="col-span-3 h-8 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] text-xs"
                  />
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <span className="font-mono text-xs text-[var(--nova-text)]">
                      {formatCurrency((parseFloat(line.quantity) || 0) * (parseFloat(line.unit_price) || 0))}
                    </span>
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(i)} className="text-[var(--nova-dim)] hover:text-red-400 transition-colors">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="space-y-1.5 min-w-48">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--nova-muted)]">Subtotal</span>
                  <span className="font-mono font-semibold text-[var(--nova-text)]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[var(--nova-border)] pt-1.5">
                  <span className="font-semibold text-[var(--nova-text)]">Total</span>
                  <span className="font-mono font-bold text-[var(--nova-accent)]">{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs text-[var(--nova-muted)]">Notes (optional)</Label>
            <textarea id="notes" name="notes" rows={2} placeholder="Payment instructions or notes for the customer" className="w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] px-3 py-2 text-sm resize-none" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 text-[var(--nova-muted)]">Cancel</Button>
            <Button type="submit" disabled={isPending} className="h-9 bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white">
              {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
              Create Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
