"use client";

import {
  TrendingUp, TrendingDown, Landmark, Droplets,
  FileText, Receipt, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

interface DashboardStats {
  total_receivables: number;
  total_invoiced: number;
  total_expenses: number;
  total_payables: number;
  cash_balance: number;
}

interface MonthlyData {
  month: string;
  revenue: string;
  collected: string;
}

interface ExpenseData {
  month: string;
  expenses: string;
}

interface DashboardOverviewProps {
  userName: string;
  stats: DashboardStats;
  monthlyRevenue: MonthlyData[];
  monthlyExpenses: ExpenseData[];
}

const CHART_STYLE = {
  fontFamily: "inherit",
  fontSize: 11,
};

export function DashboardOverview({ userName, stats, monthlyRevenue, monthlyExpenses }: DashboardOverviewProps) {
  const mergedChart = monthlyRevenue.map((r) => {
    const expEntry = monthlyExpenses.find((e) => e.month === r.month);
    return {
      month: r.month,
      revenue: parseFloat(r.revenue),
      collected: parseFloat(r.collected),
      expenses: parseFloat(expEntry?.expenses ?? "0"),
    };
  });

  const netProfit = stats.total_invoiced - stats.total_expenses;
  const profitUp = netProfit >= 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--nova-text)]">
            Good day, <span className="text-[var(--nova-accent)]">{userName.split(" ")[0]}</span>
          </h2>
          <p className="text-sm text-[var(--nova-muted)] mt-0.5">
            Here is your financial overview.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Cash Balance"
            value={formatCurrency(stats.cash_balance)}
            icon={Landmark}
            sub="Across all accounts"
          />
          <StatCard
            label="Accounts Receivable"
            value={formatCurrency(stats.total_receivables)}
            icon={TrendingUp}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
            sub="Outstanding invoices"
          />
          <StatCard
            label="Accounts Payable"
            value={formatCurrency(stats.total_payables)}
            icon={TrendingDown}
            iconColor="text-red-400"
            iconBg="bg-red-500/10"
            sub="Outstanding bills"
          />
          <StatCard
            label="Net Position"
            value={formatCurrency(Math.abs(netProfit))}
            icon={profitUp ? ArrowUpRight : ArrowDownRight}
            iconColor={profitUp ? "text-emerald-400" : "text-red-400"}
            iconBg={profitUp ? "bg-emerald-500/10" : "bg-red-500/10"}
            trend={{ value: profitUp ? "Surplus" : "Deficit", up: profitUp }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue vs Expenses */}
          <div className="lg:col-span-2 rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
            <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">Revenue vs Expenses</h3>
            {mergedChart.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-[var(--nova-muted)]">
                No data yet. Add invoices and expenses to see trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mergedChart} style={CHART_STYLE}>
                  <defs>
                    <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "var(--nova-card)", border: "1px solid var(--nova-border)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v: unknown) => [`R${Number(v).toLocaleString()}`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f59e0b" fill="url(#revenue-grad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#expense-grad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick stats */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--nova-accent-dim)]">
                  <FileText size={15} className="text-[var(--nova-accent)]" />
                </div>
                <span className="text-sm font-medium text-[var(--nova-text)]">Invoiced</span>
              </div>
              <div className="text-xl font-bold text-[var(--nova-text)]">{formatCurrency(stats.total_invoiced)}</div>
              <div className="text-xs text-[var(--nova-muted)] mt-0.5">Total invoiced</div>
            </div>

            <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10">
                  <Receipt size={15} className="text-red-400" />
                </div>
                <span className="text-sm font-medium text-[var(--nova-text)]">Expenses</span>
              </div>
              <div className="text-xl font-bold text-[var(--nova-text)]">{formatCurrency(stats.total_expenses)}</div>
              <div className="text-xs text-[var(--nova-muted)] mt-0.5">Total spent</div>
            </div>

            <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10">
                  <Droplets size={15} className="text-sky-400" />
                </div>
                <span className="text-sm font-medium text-[var(--nova-text)]">Net Cash</span>
              </div>
              <div className={`text-xl font-bold ${profitUp ? "text-emerald-400" : "text-red-400"}`}>
                {profitUp ? "+" : "-"}{formatCurrency(Math.abs(netProfit))}
              </div>
              <div className="text-xs text-[var(--nova-muted)] mt-0.5">Revenue minus expenses</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
