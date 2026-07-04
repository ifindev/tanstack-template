import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { trpc } from "@/lib/client/trpc";
import { registerSchema } from "@/modules/auth/auth.schema";

type FormData = z.infer<typeof registerSchema>;

export function useRegisterViewModel() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // biome-ignore lint/suspicious/noExplicitAny: zod v3/v4 type bridge
    resolver: zodResolver(registerSchema as any),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => setSuccess(true),
    onError: (err) => setServerError(err.message),
  });

  const handleOnSubmit = (data: FormData) => {
    setServerError(null);
    registerMutation.mutate(data);
  };

  return {
    success,
    serverError,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    register,
    handleSubmit,
    errors,
    isSubmitting,
    registerMutation,
    onSubmit: handleOnSubmit,
  };
}
