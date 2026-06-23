import { Header } from "@/components/layout/header";
import { StatsSkeleton, ChartSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Cash Flow" subtitle="Monitor your cash position and runway." />
      <div className="p-6 space-y-6"><StatsSkeleton count={4} /><ChartSkeleton height={280} /></div>
    </div>
  );
}
