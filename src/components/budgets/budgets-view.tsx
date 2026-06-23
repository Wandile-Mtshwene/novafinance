"use client";

import { useState } from "react";
import { PieChart, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Budget = {
  id: string;
  name: string;
  fiscal_year: number;
  period: string;
  start_date: string;
  end_date: string;
  total_revenue: string;
  total_expenses: string;
  is_active: boolean;
};

interface BudgetsViewProps {
  budgets: Budget[];
  orgId: string;
}

export function BudgetsView({ budgets, orgId }: BudgetsViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--nova-text)]">Budgets</h2>
          <p className="text-xs text-[var(--nova-muted)]">Plan and track your financial budgets</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white h-8 px-3 text-xs gap-1.5">
          <Plus size={14} /> New Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No budgets yet"
          description="Create your first budget to plan revenue and expenses by period."
          action={{ label: "New Budget", onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const revenue = parseFloat(budget.total_revenue);
            const expenses = parseFloat(budget.total_expenses);
            const net = revenue - expenses;
            return (
              <div key={budget.id} className="group rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5 hover:border-[var(--nova-border-strong)] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--nova-text)]">{budget.name}</p>
                    <p className="text-xs text-[var(--nova-muted)] capitalize mt-0.5">{budget.period} budget</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[var(--nova-muted)]">FY{budget.fiscal_year}</span>
                    {budget.is_active && <Badge variant="success" className="text-[9px]">Active</Badge>}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--nova-muted)]">
                      <TrendingUp size={11} className="text-emerald-400" /> Revenue
                    </div>
                    <span className="font-mono text-sm text-emerald-400">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--nova-muted)]">
                      <TrendingDown size={11} className="text-red-400" /> Expenses
                    </div>
                    <span className="font-mono text-sm text-red-400">{formatCurrency(expenses)}</span>
                  </div>
                  <div className="border-t border-[var(--nova-border)] pt-2.5 flex justify-between items-center">
                    <span className="text-xs font-semibold text-[var(--nova-text)]">Net</span>
                    <span className={cn("font-mono text-sm font-bold", net >= 0 ? "text-[var(--nova-accent)]" : "text-red-400")}>
                      {net >= 0 ? "+" : ""}{formatCurrency(net)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
