"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAccountAction, updateAccountAction } from "@/lib/accounts/actions";

type Account = {
  id: string;
  name: string;
  description: string | null;
  bank_name: string | null;
  account_number: string | null;
  currency: string;
  current_balance: string;
  opening_balance: string;
  is_default: boolean;
};

interface AccountDialogProps {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  orgId: string;
}

export function AccountDialog({ open, onClose, account, orgId }: AccountDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = account
        ? await updateAccountAction(account.id, orgId, fd)
        : await createAccountAction(orgId, fd);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[var(--nova-card)] border-[var(--nova-border)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[var(--nova-text)]">
            {account ? "Edit Account" : "Add Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-[var(--nova-muted)]">Account Name</Label>
            <Input id="name" name="name" defaultValue={account?.name} required placeholder="e.g. Standard Bank Current" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank_name" className="text-xs text-[var(--nova-muted)]">Bank Name</Label>
            <Input id="bank_name" name="bank_name" defaultValue={account?.bank_name ?? ""} placeholder="e.g. Standard Bank" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account_number" className="text-xs text-[var(--nova-muted)]">Account Number</Label>
            <Input id="account_number" name="account_number" defaultValue={account?.account_number ?? ""} placeholder="e.g. 1234567890" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-xs text-[var(--nova-muted)]">Currency</Label>
              <Input id="currency" name="currency" defaultValue={account?.currency ?? "ZAR"} placeholder="ZAR" className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opening_balance" className="text-xs text-[var(--nova-muted)]">Opening Balance</Label>
              <Input id="opening_balance" name="opening_balance" type="number" step="0.01" defaultValue={account?.opening_balance ?? "0"} className="h-9 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)]" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 text-[var(--nova-muted)]">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="h-9 bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white">
              {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
              {account ? "Save Changes" : "Add Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
