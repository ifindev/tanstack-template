import type * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "./app-sidebar";

const mockUseLocation = vi.fn();
const mockUseNavigate = vi.fn();
const mockUseSession = vi.fn();
const mockSignOut = vi.fn();
const mockUseSidebar = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockUseNavigate,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => mockUseSession(),
    signOut: () => mockSignOut(),
  },
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipContent: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
}));

vi.mock("@/components/ui/sidebar", async () => {
  return {
    Sidebar: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    SidebarContent: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    SidebarFooter: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    SidebarGroup: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    SidebarGroupContent: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    SidebarGroupLabel: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    SidebarHeader: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    SidebarMenu: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul {...props}>{children}</ul>
    ),
    SidebarMenuItem: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLLIElement>) => <li {...props}>{children}</li>,
    SidebarMenuButton: ({
      children,
      asChild,
      tooltip,
      isActive,
      ...props
    }: React.HTMLAttributes<HTMLButtonElement> & {
      asChild?: boolean;
      tooltip?: unknown;
      isActive?: boolean;
    }) => {
      if (asChild) {
        return children;
      }

      return (
        <button
          data-tooltip={typeof tooltip === "string" ? tooltip : undefined}
          data-active={isActive}
          {...props}
        >
          {children}
        </button>
      );
    },
    SidebarRail: (props: React.HTMLAttributes<HTMLButtonElement>) => (
      <button {...props} />
    ),
    SidebarTrigger: (props: React.HTMLAttributes<HTMLButtonElement>) => (
      <button data-slot="sidebar-trigger" {...props}>
        <span
          data-icon={
            mockUseSidebar().state === "collapsed"
              ? "panel-left-open"
              : "panel-left-close"
          }
        />
        <span>Toggle Sidebar</span>
      </button>
    ),
    useSidebar: () => mockUseSidebar(),
  };
});

describe("AppSidebar", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderSidebar(state: "expanded" | "collapsed") {
    mockUseLocation.mockReturnValue({ pathname: "/chat" });
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Muhammad Arifin",
          email: "marifin@mail.com",
        },
      },
    });
    mockUseSidebar.mockReturnValue({
      isMobile: false,
      setOpenMobile: vi.fn(),
      state,
      toggleSidebar: vi.fn(),
      open: state === "expanded",
      openMobile: false,
      setOpen: vi.fn(),
    });

    return renderToStaticMarkup(<AppSidebar />);
  }

  it("renders the brand without the removed workspace card in expanded mode", () => {
    const html = renderSidebar("expanded");

    expect(html).toContain("Northstar Start");
    expect(html).not.toContain("Product shell");
  });

  it("uses the collapse trigger as the top control in collapsed mode", () => {
    const html = renderSidebar("collapsed");

    expect(html).toContain("flex-1 group-data-[collapsible=icon]:hidden");
    expect(html).toContain('data-slot="sidebar-trigger"');
    expect(html).toContain('data-icon="panel-left-open"');
    expect(html).toContain("Expand sidebar");
  });

  it("marks collapsed labels as hidden and keeps the compact avatar sizing contract", () => {
    const html = renderSidebar("collapsed");

    expect(html).toContain('group-data-[collapsible=icon]:hidden">Chat');
    expect(html).toContain('group-data-[collapsible=icon]:hidden">Profile');
    expect(html).toContain(
      "grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden",
    );
    expect(html).toContain('group-data-[collapsible=icon]:hidden">Sign out');
    expect(html).toContain("group-data-[collapsible=icon]:size-8");
  });

  it("renders profile in the system section after chat", () => {
    const html = renderSidebar("expanded");

    expect(html.indexOf(">Explore<")).toBeLessThan(html.indexOf(">Chat<"));
    expect(html.indexOf(">System<")).toBeLessThan(html.indexOf(">Profile<"));
    expect(html.indexOf(">Chat<")).toBeLessThan(html.indexOf(">System<"));
  });
});
