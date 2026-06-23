import Image from "next/image";
import { cn } from "@/lib/utils";

interface NovaFinanceLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
}

const iconSizes = { sm: 24, md: 32, lg: 40 };
const textSizes = { sm: "text-base", md: "text-xl", lg: "text-2xl" };

export function NovaLogo({ size = "md", className, iconOnly = false }: NovaFinanceLogoProps) {
  const px = iconSizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="shrink-0 inline-flex rounded-lg [html.light_&]:bg-white [html.light_&]:p-0.5">
        <Image
          src="/logo-finance.png"
          alt="NovaFinance"
          width={px}
          height={px}
          priority
        />
      </span>
      {!iconOnly && (
        <span className={cn("font-semibold tracking-tight text-[var(--nova-text)]", textSizes[size])}>
          Nova<span className="text-[#F59E0B]">Finance</span>
        </span>
      )}
    </div>
  );
}
