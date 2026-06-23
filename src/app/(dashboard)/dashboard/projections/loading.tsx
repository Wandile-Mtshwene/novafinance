import { Header } from "@/components/layout/header";
import { ChartSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Projections" subtitle="Revenue, expense, and cash flow forecasts." />
      <div className="p-6 space-y-6"><ChartSkeleton height={260} /><ChartSkeleton height={200} /></div>
    </div>
  );
}
