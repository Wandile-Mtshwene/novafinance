import { Header } from "@/components/layout/header";
import { TableSkeleton, StatsSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Expenses" subtitle="Track and categorize your business expenses." />
      <div className="p-6 space-y-6">
        <StatsSkeleton count={1} />
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
