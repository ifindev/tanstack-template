import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

type VerifyStatus = "verifying" | "success" | "error";

export function useVerifyEmailViewModel(token: string | undefined) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerifyStatus>("verifying");

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

  const handleGoToSignIn = () => {
    navigate({ to: "/login" });
  };

  const title = useMemo(() => {
    if (status === "verifying") return "Verifying your email";
    if (status === "success") return "Email verified";
    return "Verification failed";
  }, [status]);

  const description = useMemo(() => {
    if (status === "verifying") return "This handoff should only take a moment.";
    if (status === "success") return "The workspace is ready. Redirecting you to sign in.";
    return "The verification link looks expired or invalid.";
  }, [status]);

  return {
    status,
    title,
    description,
    showErrorMessage: status === "error",
    onGoToSignIn: handleGoToSignIn,
  };
}
