import { Header } from "@/components/layout/header";
import { StatsSkeleton, ChartSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Reports" subtitle="Financial insights, summaries, and exports." />
      <div className="p-6 space-y-6">
        <StatsSkeleton count={5} />
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton height={200} />
          <ChartSkeleton height={200} />
        </div>
      </div>
    </div>
  );
}
