import { Compass } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
}: ComponentPropsWithoutRef<"span"> & {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-primary",
        className,
      )}
    >
      <Compass className="size-4" />
    </span>
  );
}

export function BrandLockup({
  title = "Northstar Start",
  subtitle = "Production-ready TanStack starter",
  className,
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark className={compact ? "size-9 rounded-lg" : undefined} />
      <span className="grid min-w-0 text-left leading-tight">
        <span
          className={cn(
            "truncate font-heading text-[0.95rem] font-semibold tracking-[-0.03em] text-foreground",
            compact && "text-sm",
          )}
        >
          {title}
        </span>
        {!compact && (
          <span className="truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
