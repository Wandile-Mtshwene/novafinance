"use client";

import { Scale, Download, BarChart3, FileText, TrendingUp, TrendingDown, Droplets, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend,
} from "recharts";

interface ReportsViewProps {
  totalRevenue: number;
  totalExpenses: number;
  totalReceivables: number;
  totalPayables: number;
  cashBalance: number;
  expensesByCategory: Array<{ category_name: string | null; total: string | null }>;
  monthlyRevenue: Array<{ month: string; revenue: string }>;
}

const COLORS = ["#f59e0b", "#fdba74", "#10b981", "#60a5fa", "#a78bfa", "#ef4444"];

const REPORT_CARDS = [
  { title: "Financial Summary", description: "Revenue, expenses, and profit overview", icon: BarChart3 },
  { title: "Expense Report", description: "Breakdown by category and vendor", icon: TrendingDown },
  { title: "Receivables Report", description: "Outstanding invoices and aging", icon: TrendingUp },
  { title: "Cash Flow Report", description: "Inflows, outflows, and balance", icon: Droplets },
  { title: "Profitability Report", description: "Gross and net margin analysis", icon: PieChart },
  { title: "Custom Report", description: "Build a custom report with filters", icon: FileText },
];

export function ReportsView({
  totalRevenue, totalExpenses, totalReceivables, totalPayables, cashBalance,
  expensesByCategory, monthlyRevenue,
}: ReportsViewProps) {
  const netProfit = totalRevenue - totalExpenses;
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

  const monthlyData = monthlyRevenue.map((r) => ({
    month: r.month,
    revenue: parseFloat(r.revenue),
  }));

  const categoryData = expensesByCategory
    .filter((e) => e.category_name && parseFloat(e.total ?? "0") > 0)
    .map((e) => ({
      name: e.category_name ?? "Other",
      value: parseFloat(e.total ?? "0"),
    }));

  return (
    <div className="p-6 space-y-6">
      {/* KPI strip */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Revenue", value: formatCurrency(totalRevenue), color: "text-emerald-400" },
          { label: "Expenses", value: formatCurrency(totalExpenses), color: "text-red-400" },
          { label: "Net Profit", value: formatCurrency(netProfit), color: netProfit >= 0 ? "text-[var(--nova-accent)]" : "text-red-400" },
          { label: "Gross Margin", value: `${grossMargin.toFixed(1)}%`, color: "text-sky-400" },
          { label: "Cash Balance", value: formatCurrency(cashBalance), color: "text-[var(--nova-text)]" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-4 text-center">
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-[var(--nova-muted)] mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--nova-text)]">Monthly Revenue</h3>
            <Button variant="ghost" className="h-7 px-2 text-xs text-[var(--nova-muted)] gap-1">
              <Download size={12} /> Export
            </Button>
          </div>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-[var(--nova-muted)]">No revenue data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--nova-card)", border: "1px solid var(--nova-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: unknown) => [`R${Number(v).toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--nova-text)]">Expenses by Category</h3>
            <Button variant="ghost" className="h-7 px-2 text-xs text-[var(--nova-muted)] gap-1">
              <Download size={12} /> Export
            </Button>
          </div>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-[var(--nova-muted)]">No expense data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--nova-card)", border: "1px solid var(--nova-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: unknown) => [`R${Number(v).toLocaleString()}`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RechartsPie>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Report cards */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-3">Available Reports</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_CARDS.map((report) => {
            const Icon = report.icon;
            return (
              <button key={report.title} className="group flex items-start gap-3 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-4 text-left hover:border-[var(--nova-accent)]/30 hover:bg-[var(--nova-tint-1)] transition-all">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--nova-accent-dim)]">
                  <Icon size={15} className="text-[var(--nova-accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--nova-text)] group-hover:text-[var(--nova-accent)] transition-colors">{report.title}</p>
                  <p className="text-xs text-[var(--nova-muted)] mt-0.5">{report.description}</p>
                </div>
                <Download size={13} className="shrink-0 text-[var(--nova-dim)] opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
