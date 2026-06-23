import { Header } from "@/components/layout/header";
import { CardGridSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Budgets" subtitle="Plan and track revenue and expense targets." />
      <div className="p-6"><CardGridSkeleton count={3} /></div>
    </div>
  );
}
