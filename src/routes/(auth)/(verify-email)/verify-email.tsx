import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVerifyEmailViewModel } from "./-verify-email.view-model";

export const Route = createFileRoute("/(auth)/(verify-email)/verify-email")({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const vm = useVerifyEmailViewModel(token);

  return (
    <AuthShell>
      <Card className="bg-background">
        <CardHeader>
          {vm.status === "verifying" && (
            <StatusIcon>
              <Loader2 className="size-5 animate-spin" />
            </StatusIcon>
          )}
          {vm.status === "success" && (
            <StatusIcon>
              <CheckCircle2 className="size-5" />
            </StatusIcon>
          )}
          {vm.status === "error" && (
            <StatusIcon destructive>
              <AlertCircle className="size-5" />
            </StatusIcon>
          )}
          <CardTitle>{vm.title}</CardTitle>
          <CardDescription>{vm.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vm.showErrorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              Try requesting a new email or return to sign in if the account is
              already verified.
            </div>
          )}

          {vm.showErrorMessage && (
            <Button className="w-full" asChild>
              <Link to="/login" onClick={vm.onGoToSignIn}>
                Go to sign in
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
}

function StatusIcon({
  children,
  destructive = false,
}: {
  children: ReactNode;
  destructive?: boolean;
}) {
  return (
    <div
      className={
        destructive
          ? "mb-3 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
          : "mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
      }
    >
      {children}
    </div>
  );
}
