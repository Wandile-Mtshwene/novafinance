import { Header } from "@/components/layout/header";
import { CardGridSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your organization and financial preferences." />
      <div className="p-6"><CardGridSkeleton count={4} /></div>
    </div>
  );
}
