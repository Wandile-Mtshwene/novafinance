import { Header } from "@/components/layout/header";
import { ChartSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Financial Statements" subtitle="Income statement, balance sheet, and cash flow." />
      <div className="p-6 space-y-6"><ChartSkeleton height={400} /></div>
    </div>
  );
}
