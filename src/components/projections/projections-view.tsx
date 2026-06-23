"use client";

import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface ProjectionsViewProps {
  monthlyRevenue: number;
  monthlyExpenses: number;
  cashBalance: number;
}

function generateProjections(baseRevenue: number, baseExpenses: number, currentCash: number, months = 12) {
  const data = [];
  let runningCash = currentCash;

  for (let i = 0; i < months; i++) {
    const monthIndex = (new Date().getMonth() + i) % 12;
    const year = new Date().getFullYear() + Math.floor((new Date().getMonth() + i) / 12);
    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];

    const growthFactor = 1 + i * 0.02;
    const base = baseRevenue * growthFactor;
    const optimistic = base * 1.2;
    const pessimistic = base * 0.8;
    const expenses = baseExpenses * growthFactor;

    runningCash += base - expenses;

    data.push({
      month: `${monthName} ${year.toString().slice(-2)}`,
      base: Math.round(base),
      optimistic: Math.round(optimistic),
      pessimistic: Math.round(pessimistic),
      expenses: Math.round(expenses),
      cashBalance: Math.round(runningCash),
    });
  }
  return data;
}

export function ProjectionsView({ monthlyRevenue, monthlyExpenses, cashBalance }: ProjectionsViewProps) {
  const data = generateProjections(monthlyRevenue, monthlyExpenses, cashBalance);

  return (
    <div className="p-6 space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-[var(--nova-border)] bg-gradient-to-br from-[var(--nova-accent-dim)] to-transparent p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--nova-muted)] mb-1">12-Month Forecast</p>
        <p className="text-sm text-[var(--nova-muted)] max-w-lg">
          Based on your average monthly revenue of {formatCurrency(monthlyRevenue)} and expenses of {formatCurrency(monthlyExpenses)}.
          Three scenarios are modeled: base, optimistic (+20%), and pessimistic (-20%).
        </p>
      </div>

      {/* Revenue Projections Chart */}
      <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
        <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">Revenue Scenarios</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "var(--nova-card)", border: "1px solid var(--nova-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: unknown) => [`R${Number(v).toLocaleString()}`, ""]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="optimistic" name="Best Case" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="base" name="Base Case" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="pessimistic" name="Worst Case" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cash Balance Projection */}
      <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
        <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">Projected Cash Balance</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "var(--nova-card)", border: "1px solid var(--nova-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: unknown) => [`R${Number(v).toLocaleString()}`, "Cash Balance"]} />
            <Line type="monotone" dataKey="cashBalance" name="Cash Balance" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--nova-border)]">
          <h3 className="text-sm font-semibold text-[var(--nova-text)]">Projection Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--nova-border)] bg-[var(--nova-tint-1)]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Month</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Best Case</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Base Case</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Worst Case</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Projected Cash</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.month} className="border-b border-[var(--nova-border)] last:border-0 hover:bg-[var(--nova-tint-1)] transition-colors">
                  <td className="px-4 py-2.5 text-sm text-[var(--nova-text)]">{row.month}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-400">{formatCurrency(row.optimistic)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-[var(--nova-accent)]">{formatCurrency(row.base)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-red-400">{formatCurrency(row.pessimistic)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-sky-400">{formatCurrency(row.cashBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
