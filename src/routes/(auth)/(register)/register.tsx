import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
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
import { useRegisterViewModel } from "./register.view-model";

export const Route = createFileRoute("/(auth)/(register)/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const vm = useRegisterViewModel();

  if (vm.success) {
    return (
      <AuthShell>
        <Card className="bg-background">
          <CardHeader>
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MailCheck className="size-5" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a verification link. Click it to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to="/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details. You'll receive a verification email before
            signing in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={vm.handleSubmit(vm.onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                aria-invalid={!!vm.errors.name}
                {...vm.register("name")}
              />
              {vm.errors.name && (
                <p className="text-sm text-destructive">
                  {vm.errors.name.message}
                </p>
              )}
            </div>

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
              {vm.isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already set up?{" "}
              <Link
                to="/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
