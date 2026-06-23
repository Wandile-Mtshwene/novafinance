import { Header } from "@/components/layout/header";
import { TableSkeleton, StatsSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Invoices" subtitle="Track your billing and receivables." />
      <div className="p-6 space-y-6">
        <StatsSkeleton count={3} />
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
