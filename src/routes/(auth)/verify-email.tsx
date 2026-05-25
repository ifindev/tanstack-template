import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === "verifying" && (
          <p className="text-muted-foreground">Verifying your email...</p>
        )}
        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold">Email verified!</h2>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold text-destructive">
              Verification failed
            </h2>
            <p className="text-muted-foreground">
              The link may be expired.{" "}
              <a href="/login" className="text-primary underline">
                Go to login
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
