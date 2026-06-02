import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

type Props = {
  height?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
};

export function Logo({ height = 48, showText = false, className, textClassName }: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src={BRAND.logo}
        alt={BRAND.name}
        width={Math.round(height * 2.8)}
        height={height}
        className="h-auto w-auto max-w-[min(100%,280px)] shrink-0 object-contain drop-shadow-md"
        style={{ height, width: "auto" }}
        priority
      />
      {showText && (
        <div className={cn("min-w-0", textClassName)}>
          <p className="font-display text-lg font-bold leading-tight text-primary md:text-xl">
            {BRAND.nameShort}
          </p>
          <p className="text-xs font-semibold tracking-wide text-on-surface-variant">Agency ERP</p>
        </div>
      )}
    </div>
  );
}
