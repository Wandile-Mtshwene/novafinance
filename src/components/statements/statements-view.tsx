"use client";

import { useState } from "react";
import { BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatementLine {
  label: string;
  amount: number;
  indent?: boolean;
  bold?: boolean;
  separator?: boolean;
}

interface FinancialStatementsProps {
  totalRevenue: number;
  totalExpenses: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cashBalance: number;
  totalInflows: number;
  totalOutflows: number;
}

type StatementTab = "income" | "balance" | "cashflow";

const TABS: { id: StatementTab; label: string }[] = [
  { id: "income", label: "Income Statement" },
  { id: "balance", label: "Balance Sheet" },
  { id: "cashflow", label: "Cash Flow Statement" },
];

function StatementRow({ line }: { line: StatementLine }) {
  if (line.separator) {
    return <tr><td colSpan={2} className="border-t border-[var(--nova-border)] pt-2" /></tr>;
  }
  return (
    <tr className={cn("group", line.bold && "font-semibold")}>
      <td className={cn("py-2 text-sm text-[var(--nova-text)]", line.indent && "pl-6 text-[var(--nova-muted)]")}>
        {line.label}
      </td>
      <td className={cn("py-2 text-right font-mono text-sm", line.bold ? "text-[var(--nova-text)] font-bold" : "text-[var(--nova-muted)]", line.amount < 0 && "text-red-400")}>
        {formatCurrency(Math.abs(line.amount))}
        {line.amount < 0 && " (Deficit)"}
      </td>
    </tr>
  );
}

export function StatementsView({
  totalRevenue, totalExpenses, totalAssets, totalLiabilities, totalEquity, cashBalance, totalInflows, totalOutflows,
}: FinancialStatementsProps) {
  const [tab, setTab] = useState<StatementTab>("income");

  const netProfit = totalRevenue - totalExpenses;
  const netCash = totalInflows - totalOutflows;

  const incomeStatement: StatementLine[] = [
    { label: "Revenue", bold: true, amount: 0 },
    { label: "Sales Revenue", indent: true, amount: totalRevenue },
    { label: "Total Revenue", bold: true, amount: totalRevenue },
    { separator: true, label: "", amount: 0 },
    { label: "Expenses", bold: true, amount: 0 },
    { label: "Operating Expenses", indent: true, amount: totalExpenses },
    { label: "Total Expenses", bold: true, amount: totalExpenses },
    { separator: true, label: "", amount: 0 },
    { label: "Net Profit / (Loss)", bold: true, amount: netProfit },
  ];

  const balanceSheet: StatementLine[] = [
    { label: "Assets", bold: true, amount: 0 },
    { label: "Cash and Cash Equivalents", indent: true, amount: cashBalance },
    { label: "Total Assets", bold: true, amount: totalAssets || cashBalance },
    { separator: true, label: "", amount: 0 },
    { label: "Liabilities", bold: true, amount: 0 },
    { label: "Accounts Payable", indent: true, amount: totalLiabilities },
    { label: "Total Liabilities", bold: true, amount: totalLiabilities },
    { separator: true, label: "", amount: 0 },
    { label: "Equity", bold: true, amount: 0 },
    { label: "Retained Earnings", indent: true, amount: netProfit },
    { label: "Total Equity", bold: true, amount: totalEquity || netProfit },
    { separator: true, label: "", amount: 0 },
    { label: "Total Liabilities and Equity", bold: true, amount: (totalLiabilities + (totalEquity || netProfit)) },
  ];

  const cashFlowStatement: StatementLine[] = [
    { label: "Operating Activities", bold: true, amount: 0 },
    { label: "Cash Received from Customers", indent: true, amount: totalInflows },
    { label: "Cash Paid to Suppliers", indent: true, amount: -totalOutflows },
    { label: "Net Cash from Operating Activities", bold: true, amount: netCash },
    { separator: true, label: "", amount: 0 },
    { label: "Closing Cash Balance", bold: true, amount: cashBalance },
  ];

  const currentStatement = tab === "income" ? incomeStatement : tab === "balance" ? balanceSheet : cashFlowStatement;

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--nova-tint-2)] w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id ? "bg-[var(--nova-card)] text-[var(--nova-text)] shadow-sm" : "text-[var(--nova-muted)] hover:text-[var(--nova-text)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Statement */}
      <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--nova-border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--nova-accent-dim)]">
              <BookOpen size={15} className="text-[var(--nova-accent)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--nova-text)]">
                {TABS.find((t) => t.id === tab)?.label}
              </h3>
              <p className="text-xs text-[var(--nova-muted)]">For the period ending today</p>
            </div>
          </div>
          <Button variant="ghost" className="h-8 px-3 text-xs text-[var(--nova-muted)] gap-1.5">
            <Download size={13} /> Export
          </Button>
        </div>

        <div className="px-6 py-4">
          <table className="w-full">
            <tbody>
              {currentStatement.map((line, i) => (
                <StatementRow key={i} line={line} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
