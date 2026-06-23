import { NovaLogo } from "@/components/nova-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--nova-surface)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <NovaLogo size="md" />
        </div>
        {children}
      </div>
    </div>
  );
}
