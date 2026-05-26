import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/layout/brand";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <Link to="/" className="mx-auto block w-fit">
          <BrandLockup compact />
        </Link>
        {children}
      </div>
    </main>
  );
}
