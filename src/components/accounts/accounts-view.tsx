"use client";

import { useState, useTransition } from "react";
import { Plus, Landmark, MoreHorizontal, Pencil, Trash2, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { AccountDialog } from "@/components/accounts/account-dialog";

type Account = {
  id: string;
  name: string;
  description: string | null;
  bank_name: string | null;
  account_number: string | null;
  currency: string;
  current_balance: string;
  opening_balance: string;
  is_active: boolean;
  is_default: boolean;
};

interface AccountsViewProps {
  accounts: Account[];
  orgId: string;
}

export function AccountsView({ accounts, orgId }: AccountsViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.current_balance ?? "0"), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Total balance banner */}
      <div className="rounded-2xl border border-[var(--nova-border)] bg-gradient-to-br from-[var(--nova-accent-dim)] to-transparent p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--nova-muted)] mb-1">Total Cash Balance</p>
        <p className="text-4xl font-bold text-[var(--nova-text)]">{formatCurrency(totalBalance)}</p>
        <p className="text-xs text-[var(--nova-muted)] mt-1">Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--nova-text)]">Bank Accounts</h2>
          <p className="text-xs text-[var(--nova-muted)]">Manage your cash and bank accounts</p>
        </div>
        <Button
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white h-8 px-3 text-xs gap-1.5"
        >
          <Plus size={14} />
          Add Account
        </Button>
      </div>

      {/* Account cards */}
      {accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No accounts yet"
          description="Add your first bank or cash account to start tracking your finances."
          action={{ label: "Add Account", onClick: () => { setEditing(null); setDialogOpen(true); } }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="group rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5 hover:border-[var(--nova-border-strong)] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--nova-accent-dim)]">
                    <Landmark size={18} className="text-[var(--nova-accent)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--nova-text)] leading-none">{account.name}</p>
                    {account.bank_name && (
                      <p className="text-xs text-[var(--nova-muted)] mt-0.5">{account.bank_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {account.is_default && (
                    <Badge variant="warning" className="text-[9px]">Default</Badge>
                  )}
                  <button
                    onClick={() => { setEditing(account); setDialogOpen(true); }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)] hover:text-[var(--nova-text)] transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              </div>

              {account.account_number && (
                <p className="font-mono text-xs text-[var(--nova-muted)] mb-3">
                  {account.account_number.replace(/(\d{4})(?=\d)/g, "$1 ")}
                </p>
              )}

              <div>
                <p className="text-xs text-[var(--nova-muted)] mb-1">Current Balance</p>
                <p className={`text-xl font-bold ${parseFloat(account.current_balance) >= 0 ? "text-[var(--nova-text)]" : "text-red-400"}`}>
                  {formatCurrency(parseFloat(account.current_balance), account.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        account={editing}
        orgId={orgId}
      />
    </div>
  );
}
