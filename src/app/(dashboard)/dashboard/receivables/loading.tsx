import { Header } from "@/components/layout/header";
import { StatsSkeleton, TableSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Receivables" subtitle="Track outstanding customer balances." />
      <div className="p-6 space-y-6"><StatsSkeleton count={3} /><TableSkeleton rows={5} /></div>
    </div>
  );
}
