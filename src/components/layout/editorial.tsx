import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("editorial-container", className)} {...props} />;
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  inverse = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {eyebrow && 
        <p className={cn("section-label", inverse && "text-primary-foreground/80")}>
          {eyebrow}
      </p>}
      <div className="space-y-3">
        <h2
          className={cn("display-title max-w-3xl", inverse && "text-on-dark")}
        >
          {title}
        </h2>
        <p
          className={cn(
            "max-w-2xl text-base leading-7 text-body sm:text-lg",
            inverse && "text-on-dark-soft",
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export function SurfacePanel({
  tone = "card",
  padding = "lg",
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div"> & {
  tone?: "card" | "soft" | "dark" | "coral";
  padding?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden",
        tone === "card" && "surface-card",
        tone === "soft" && "surface-soft",
        tone === "dark" && "surface-dark",
        tone === "coral" && "surface-coral",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        padding === "xl" && "p-10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
