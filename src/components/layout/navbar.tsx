import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="text-lg font-bold">
          TanStack Template
        </a>
        <nav className="flex items-center gap-4">
          {session?.user && (
            <>
              <a
                href="/chat"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Chat
              </a>
              <a
                href="/profile"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Profile
              </a>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          )}
          {!session && (
            <>
              <a href="/login" className="text-sm">
                Sign in
              </a>
              <Button asChild size="sm">
                <a href="/register">Get started</a>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
