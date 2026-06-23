import { Header } from "@/components/layout/header";
import { CardGridSkeleton, StatsSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Accounts" subtitle="Manage your bank and cash accounts." />
      <div className="p-6 space-y-6">
        <StatsSkeleton count={1} />
        <CardGridSkeleton count={3} />
      </div>
    </div>
  );
}
