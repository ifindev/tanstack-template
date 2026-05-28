import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";
import { loginSchema } from "@/modules/auth/schema";

type FormData = z.infer<typeof loginSchema>;

export function useLoginViewModel() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // biome-ignore lint/suspicious/noExplicitAny: zod v3/v4 type bridge
    resolver: zodResolver(loginSchema as any),
  });

  const resendMutation = trpc.auth.resendVerification.useMutation();

  const handleSubmitForm = async (data: FormData) => {
    setServerError(null);
    setUnverified(false);
    setEmail(data.email);
    const result = await authClient.signIn.email(data);
    if (result.error) {
      if (result.error.code === "EMAIL_NOT_VERIFIED") {
        setUnverified(true);
      } else {
        setServerError(result.error.message ?? "Login failed");
      }
      return;
    }
    navigate({ to: "/chat" });
  };

  const handleResendVerification = () => {
    resendMutation.mutate({ email });
  };

  return {
    email,
    unverified,
    serverError,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    register,
    handleSubmit,
    errors,
    isSubmitting,
    resendMutation,
    onSubmit: handleSubmitForm,
    onResendVerification: handleResendVerification,
  };
}
