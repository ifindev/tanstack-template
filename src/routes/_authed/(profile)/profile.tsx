import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, UserRound } from "lucide-react";
import { PageContainer, SurfacePanel } from "@/components/layout/editorial";
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
import { useProfileViewModel } from "./-profile.view-model";

export const Route = createFileRoute("/_authed/(profile)/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const vm = useProfileViewModel();

  return (
    <main className="flex-1 py-8 sm:py-10">
      <PageContainer className="space-y-8">
        <div className="space-y-3">
          <p className="section-label">Profile</p>
          <h1 className="display-title">
            Account details and workspace identity.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-body sm:text-lg">
            Keep the authenticated shell grounded in a real user record without
            turning settings into an afterthought.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <SurfacePanel tone="card" padding="lg" className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserRound className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-heading text-xl font-semibold tracking-[-0.03em] text-foreground">
                  {vm.user?.name ?? "Account"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {vm.user?.email ?? "Loading..."}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                What this updates
              </p>
              <p className="mt-2 text-sm leading-7 text-body">
                The display name shown across the authenticated workspace and
                future collaboration surfaces.
              </p>
            </div>
          </SurfacePanel>

          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Profile details</CardTitle>
              <CardDescription>
                This starter keeps profile editing deliberately small: one real
                field, clearly persisted, easy to test.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={vm.handleSubmit(vm.onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...vm.register("name")} />
                  {vm.errors.name && (
                    <p className="text-sm text-destructive">
                      {vm.errors.name.message}
                    </p>
                  )}
                </div>

                {vm.success && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-body-strong">
                    <CheckCircle2 className="size-4 text-primary" />
                    Profile updated successfully.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={vm.isSubmitting || vm.updateMutation.isPending}
                >
                  {vm.isSubmitting || vm.updateMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {vm.isSubmitting || vm.updateMutation.isPending
                    ? "Saving changes..."
                    : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </main>
  );
}
