import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <>
      <Navbar />
      <main className="container mx-auto max-w-lg px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">{user?.email}</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              {success && (
                <p className="text-sm text-green-600">
                  Profile updated successfully.
                </p>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
