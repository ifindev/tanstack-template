import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/shared/auth/better-auth";

const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  return session;
});

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const session = await getServerSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <div className="h-5 w-px bg-border" />
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-medium">
              Workspace
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Authenticated app
            </p>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
