import { Header } from "@/components/layout/header";
import { StatsSkeleton, CardGridSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Compliance" subtitle="Tax obligations, deadlines, and regulatory checklist." />
      <div className="p-6 space-y-6"><StatsSkeleton count={3} /><CardGridSkeleton count={6} /></div>
    </div>
  );
}
