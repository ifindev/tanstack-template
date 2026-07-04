import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { trpc } from "@/lib/client/trpc";
import { updateProfileSchema } from "@/modules/user/user.schema";

type FormData = z.infer<typeof updateProfileSchema>;

export function useProfileViewModel() {
  const { data: user } = trpc.user.me.useQuery();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // biome-ignore lint/suspicious/noExplicitAny: zod v3/v4 type bridge
    resolver: zodResolver(updateProfileSchema as any),
    values: user ? { name: user.name } : undefined,
  });

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => setSuccess(true),
  });

  const handleOnSubmit = (data: FormData) => {
    setSuccess(false);
    updateMutation.mutate(data);
  };

  return {
    user,
    success,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    updateMutation,
    onSubmit: handleOnSubmit,
  };
}
