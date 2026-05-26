import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, MailWarning } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const [email, setEmail] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
    <AuthShell>
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unverified && (
            <div className="mb-5 flex gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-body-strong">
              <MailWarning className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  Your email still needs verification.
                </p>
                <button
                  type="button"
                  className="mt-1 text-primary underline-offset-4 hover:underline"
                  onClick={() => resendMutation.mutate({ email })}
                >
                  Resend verification email
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {isSubmitting ? "Signing you in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <Link
                to="/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
