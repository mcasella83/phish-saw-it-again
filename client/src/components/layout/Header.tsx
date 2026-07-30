import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { clearShowsCache } from "@/lib/storage-utils";

interface HeaderProps {
  showNavigation?: boolean;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  isLoggedIn?: boolean;
  username?: string;
  onRefresh?: () => void;
}

export default function Header({
  showNavigation = false,
  activeTab = "shows",
  onTabChange,
  isLoggedIn = false,
  username = "",
  onRefresh,
}: HeaderProps) {
  const isMobile = useIsMobile();

  const handleSignOut = () => {
    localStorage.removeItem("phish-explorer-username");
    clearShowsCache();
    window.location.reload();
  };

  const NavItems = () => (
    <>
      {showNavigation && (
        <>
          <button
            className={cn(
              "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              activeTab === "shows" && "bg-accent/50",
            )}
            onClick={() => onTabChange?.("shows")}
          >
            My Shows
          </button>
          <button
            className={cn(
              "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              activeTab === "songs" && "bg-accent/50",
            )}
            onClick={() => onTabChange?.("songs")}
          >
            My Songs
          </button>
          <button
            className={cn(
              "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              activeTab === "venues" && "bg-accent/50",
            )}
            onClick={() => onTabChange?.("venues")}
          >
            My Venues
          </button>
        </>
      )}
      <Link href="/search" 
        className={cn(
          "w-full text-left px-4 py-2 text-sm font-medium transition-colors block",
          "hover:bg-accent hover:text-accent-foreground",
          activeTab === "search" && "bg-accent/50",
        )}>
        Show Search
      </Link>
      <Link href="/about" 
        className={cn(
          "w-full text-left px-4 py-2 text-sm font-medium transition-colors block",
          "hover:bg-accent hover:text-accent-foreground",
          activeTab === "about" && "bg-accent/50",
        )}>
        About
      </Link>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                window.history.pushState({}, "", "/");
                onTabChange?.("login");
              } else {
                onTabChange?.("shows");
              }
            }}
            className="text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-primary">I Saw It Again</span>
          </button>
          {isLoggedIn && username && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Viewing stats for: {username}
              </span>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  Refresh Stats
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-2 mt-8">
                <NavItems />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center space-x-4">
            <NavItems />
          </nav>
        )}
      </div>
    </header>
  );
}
