"use client";

import { Droplets, TrendingUp, TrendingDown, Flame } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

type CashflowForecast = {
  forecast_month: number;
  forecast_year: number;
  projected_inflows: string;
  projected_outflows: string;
  projected_closing: string;
  actual_inflows: string;
  actual_outflows: string;
  actual_closing: string;
};

interface CashflowViewProps {
  forecasts: CashflowForecast[];
  cashBalance: number;
  totalInflows: number;
  totalOutflows: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function CashflowView({ forecasts, cashBalance, totalInflows, totalOutflows }: CashflowViewProps) {
  const burnRate = totalOutflows / Math.max(forecasts.length, 1);
  const runway = burnRate > 0 ? cashBalance / burnRate : 0;

  const chartData = forecasts.map((f) => ({
    month: `${MONTHS[f.forecast_month - 1]} ${f.forecast_year.toString().slice(-2)}`,
    inflows: parseFloat(f.actual_inflows || f.projected_inflows),
    outflows: parseFloat(f.actual_outflows || f.projected_outflows),
    balance: parseFloat(f.actual_closing || f.projected_closing),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cash Balance" value={formatCurrency(cashBalance)} icon={Droplets} />
        <StatCard label="Total Inflows" value={formatCurrency(totalInflows)} icon={TrendingUp} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
        <StatCard label="Total Outflows" value={formatCurrency(totalOutflows)} icon={TrendingDown} iconColor="text-red-400" iconBg="bg-red-500/10" />
        <StatCard
          label="Cash Runway"
          value={runway > 0 ? `${runway.toFixed(1)} months` : "N/A"}
          icon={Flame}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
          sub="At current burn rate"
        />
      </div>

      {/* Cash flow bar chart */}
      <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
        <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-4">Monthly Cash Flow</h3>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-[var(--nova-muted)]">
            No cash flow data yet. Add accounts and record transactions to see your cash flow.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--nova-muted)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "var(--nova-card)", border: "1px solid var(--nova-border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: unknown) => [`R${Number(v).toLocaleString()}`, ""]}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="inflows" name="Inflows" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflows" name="Outflows" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Closing balance trend */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <h3 className="text-sm font-semibold text-[var(--nova-text)] mb-2">Closing Balance by Month</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--nova-border)]">
                  <th className="py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Month</th>
                  <th className="py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Inflows</th>
                  <th className="py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Outflows</th>
                  <th className="py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Net</th>
                  <th className="py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--nova-muted)]">Closing Balance</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row) => {
                  const net = row.inflows - row.outflows;
                  return (
                    <tr key={row.month} className="border-b border-[var(--nova-border)] last:border-0">
                      <td className="py-2.5 text-sm text-[var(--nova-text)]">{row.month}</td>
                      <td className="py-2.5 text-right font-mono text-sm text-emerald-400">{formatCurrency(row.inflows)}</td>
                      <td className="py-2.5 text-right font-mono text-sm text-red-400">{formatCurrency(row.outflows)}</td>
                      <td className={`py-2.5 text-right font-mono text-sm font-semibold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {net >= 0 ? "+" : ""}{formatCurrency(net)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-sm text-[var(--nova-text)]">{formatCurrency(row.balance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
