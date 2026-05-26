import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Compass,
  LogOut,
  MessageSquare,
  Settings,
  UserRound,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

const primaryNav = [
  {
    title: "Chat",
    to: "/chat",
    icon: MessageSquare,
    isActive: (pathname: string) =>
      pathname === "/chat" || pathname.startsWith("/chat/"),
  },
];

const systemNav = [
  {
    title: "Profile",
    to: "/profile",
    icon: UserRound,
    isActive: (pathname: string) => pathname === "/profile",
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userName = user?.name || "Account";
  const userEmail = user?.email || "Signed in";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await authClient.signOut();
    setOpenMobile(false);
    navigate({ to: "/" });
  };

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
          <SidebarMenu className="flex-1 group-data-[collapsible=icon]:hidden">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                tooltip="Northstar Start"
                className="h-auto p-0 hover:bg-transparent data-active:bg-transparent"
              >
                <Link
                  to="/chat"
                  onClick={() => setOpenMobile(false)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sidebar-border bg-background text-primary">
                    <Compass className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-heading text-[0.95rem] font-semibold tracking-[-0.03em] text-foreground">
                      Northstar Start
                    </span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="hidden size-9 rounded-lg border border-sidebar-border bg-background text-foreground hover:bg-sidebar-accent md:flex group-data-[collapsible=icon]:mx-auto" />
            </TooltipTrigger>
            <TooltipContent
              side="right"
              hidden={state !== "collapsed" || isMobile}
            >
              Expand sidebar
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Explore</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {primaryNav.map((item) => {
                const active = item.isActive(location.pathname);
                return (
                  <SidebarMenuItem
                    key={item.to}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={active}
                      tooltip={item.title}
                      className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
                    >
                      <Link
                        to={item.to}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon className="size-4 group-data-[collapsible=icon]:mt-0" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {systemNav.map((item) => {
                const active = item.isActive(location.pathname);
                return (
                  <SidebarMenuItem
                    key={item.to}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={active}
                      tooltip={item.title}
                      className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
                    >
                      <Link
                        to={item.to}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon className="size-4" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <SidebarMenuButton
                  tooltip="Settings"
                  disabled
                  className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
                >
                  <Settings className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Settings
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              className="h-auto cursor-default items-start gap-3 rounded-xl border border-sidebar-border bg-background px-3 py-3 hover:bg-background group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0!"
              tooltip={userEmail}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground group-data-[collapsible=icon]:size-8">
                {initials || "U"}
              </span>
              <span className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium text-foreground">
                  {userName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign out"
              className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
            >
              <LogOut className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Sign out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
