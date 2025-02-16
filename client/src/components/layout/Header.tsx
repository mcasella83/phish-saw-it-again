import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { IoMusicalNotes } from "react-icons/io5";

interface HeaderProps {
  showNavigation?: boolean;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  username?: string;
  onSignOut?: () => void;
}

export default function Header({ showNavigation = false, activeTab = "shows", onTabChange, username, onSignOut }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex flex-col">
          <Link href="/">
            <a className="text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
              <IoMusicalNotes className="h-8 w-8 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                I Saw It Again
              </span>
            </a>
          </Link>
          {username && (
            <div className="text-sm mt-1 flex items-center gap-2">
              <span>Welcome, {username}</span>
              {onSignOut && (
                <button 
                  onClick={onSignOut}
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
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
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
    </header>
  );
}