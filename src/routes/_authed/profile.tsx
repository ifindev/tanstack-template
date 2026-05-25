import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import { trpc } from "@/lib/trpc";
import { updateProfileSchema } from "@/modules/user/schema";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
});

type FormData = z.infer<typeof updateProfileSchema>;

function ProfilePage() {
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

  const onSubmit = (data: FormData) => {
    setSuccess(false);
    updateMutation.mutate(data);
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Profile</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your workspace identity and review account details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-lg border bg-card p-4 text-card-foreground shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading font-medium">
                {user?.name ?? "Account"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email ?? "Loading..."}
              </p>
            </div>
          </div>
        </aside>

        <Card className="rounded-lg shadow-xs">
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              This name appears in authenticated workspace views.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                  <CheckCircle2 className="size-4" />
                  Profile updated successfully.
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
              >
                {isSubmitting || updateMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {isSubmitting || updateMutation.isPending
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
