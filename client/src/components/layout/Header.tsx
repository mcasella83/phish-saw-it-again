import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { clearShowsCache } from "@/lib/storage-utils";
import { IoMusicalNotes } from "react-icons/io5";

interface HeaderProps {
  showNavigation?: boolean;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  isLoggedIn?: boolean;
  username?: string;
}

export default function Header({
  showNavigation = false,
  activeTab = "shows",
  onTabChange,
  isLoggedIn = false,
  username = "",
}: HeaderProps) {
  const handleSignOut = () => {
    // Clear all cached data
    localStorage.removeItem("phish-explorer-username");
    clearShowsCache();
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a className="text-2xl font-bold flex flex-col items-left hover:opacity-80 transition-opacity">
            <div className="flex items-left gap-2">
              <IoMusicalNotes className="h-8 w-8 text-primary" />
              <span className="text-primary">I Saw It Again</span>
            </div>
            {isLoggedIn && username && (
              <div className="flex items-left justify-start w-full gap-4 text-sm mt-1">
                <span className="text-muted-foreground">
                  Viewing stats for: {username}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </a>
        </div>
        {showNavigation && (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <button
                  className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === "shows" ? "bg-accent/50" : ""
                  }`}
                  onClick={() => onTabChange?.("shows")}
                >
                  My Shows
                </button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button
                  className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === "songs" ? "bg-accent/50" : ""
                  }`}
                  onClick={() => onTabChange?.("songs")}
                >
                  My Songs
                </button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button
                  className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === "venues" ? "bg-accent/50" : ""
                  }`}
                  onClick={() => onTabChange?.("venues")}
                >
                  My Venues
                </button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button
                  className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === "about" ? "bg-accent/50" : ""
                  }`}
                  onClick={() => onTabChange?.("about")}
                >
                  About
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
    </header>
  );
}
