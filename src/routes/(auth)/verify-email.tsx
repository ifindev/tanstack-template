import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Bot, CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mx-auto mb-6 flex w-fit items-center gap-2 font-heading font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </span>
          TanStack Template
        </Link>

        <Card className="rounded-xl shadow-xs">
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
              {status === "verifying" && "This should only take a moment."}
              {status === "success" && "Redirecting you to sign in."}
              {status === "error" &&
                "The verification link may be expired or invalid."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "error" && (
              <Button className="w-full" asChild>
                <Link to="/login">Go to sign in</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
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
      className={`mb-2 flex size-10 items-center justify-center rounded-md ${
        destructive
          ? "bg-destructive/10 text-destructive"
          : "bg-primary/10 text-primary"
      }`}
    >
      {children}
    </div>
  );
}
