import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, Loader2, MailWarning } from "lucide-react";
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
import { useLoginViewModel } from "./-login.view-model";

export const Route = createFileRoute("/(auth)/(login)/login")({
  component: LoginPage,
});

function LoginPage() {
  const vm = useLoginViewModel();

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
          {vm.unverified && (
            <div className="mb-5 flex gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-body-strong">
              <MailWarning className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  Your email still needs verification.
                </p>
                <button
                  type="button"
                  className="mt-1 text-primary underline-offset-4 hover:underline"
                  onClick={vm.onResendVerification}
                >
                  Resend verification email
                </button>
              </div>
            </div>
          )}

          <form onSubmit={vm.handleSubmit(vm.onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={!!vm.errors.email}
                {...vm.register("email")}
              />
              {vm.errors.email && (
                <p className="text-sm text-destructive">
                  {vm.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={vm.showPassword ? "text" : "password"}
                  aria-invalid={!!vm.errors.password}
                  className="pr-10"
                  {...vm.register("password")}
                />
                <button
                  type="button"
                  onClick={vm.toggleShowPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  aria-label={vm.showPassword ? "Hide password" : "Show password"}
                >
                  {vm.showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {vm.errors.password && (
                <p className="text-sm text-destructive">
                  {vm.errors.password.message}
                </p>
              )}
            </div>

            {vm.serverError && (
              <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{vm.serverError}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={vm.isSubmitting}>
              {vm.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {vm.isSubmitting ? "Signing you in..." : "Sign in"}
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
