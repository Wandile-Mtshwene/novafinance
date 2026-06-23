import { Header } from "@/components/layout/header";
import { TableSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Transactions" subtitle="Your complete general ledger." />
      <div className="p-6"><TableSkeleton rows={8} /></div>
    </div>
  );
}
