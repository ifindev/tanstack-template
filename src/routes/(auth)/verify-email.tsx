import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(auth)/verify-email")({
  component: VerifyEmailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    authClient.verifyEmail({ query: { token } }).then((result) => {
      if (result.error) {
        setStatus("error");
      } else {
        setStatus("success");
        setTimeout(() => navigate({ to: "/login" }), 2000);
      }
    });
  }, [token, navigate]);

  return (
    <AuthShell>
      <Card className="bg-background">
        <CardHeader>
          {status === "verifying" && (
            <StatusIcon>
              <Loader2 className="size-5 animate-spin" />
            </StatusIcon>
          )}
          {status === "success" && (
            <StatusIcon>
              <CheckCircle2 className="size-5" />
            </StatusIcon>
          )}
          {status === "error" && (
            <StatusIcon destructive>
              <AlertCircle className="size-5" />
            </StatusIcon>
          )}
          <CardTitle>
            {status === "verifying" && "Verifying your email"}
            {status === "success" && "Email verified"}
            {status === "error" && "Verification failed"}
          </CardTitle>
          <CardDescription>
            {status === "verifying" &&
              "This handoff should only take a moment."}
            {status === "success" &&
              "The workspace is ready. Redirecting you to sign in."}
            {status === "error" &&
              "The verification link looks expired or invalid."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "error" && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              Try requesting a new email or return to sign in if the account is
              already verified.
            </div>
          )}

          {status === "error" && (
            <Button className="w-full" asChild>
              <Link to="/login">Go to sign in</Link>
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
