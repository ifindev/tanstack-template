import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";
import { loginSchema } from "@/modules/auth/schema";

export const Route = createFileRoute("/(auth)/login")({
  component: LoginPage,
});

type FormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // biome-ignore lint/suspicious/noExplicitAny: zod v3/v4 type bridge
  } = useForm<FormData>({ resolver: zodResolver(loginSchema as any) });

  const resendMutation = trpc.auth.resendVerification.useMutation();

  const onSubmit = async (data: FormData) => {
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
    navigate({ to: "/profile" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          {unverified && (
            <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              Your email is not verified.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => resendMutation.mutate({ email })}
              >
                Resend verification email
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                Create one
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
