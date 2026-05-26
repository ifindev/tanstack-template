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
        "inline-flex shrink-0 items-center justify-center text-primary",
        className,
      )}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M10 0L12.4 7.6L20 10L12.4 12.4L10 20L7.6 12.4L0 10L7.6 7.6Z" />
      </svg>
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
      <BrandMark />
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
