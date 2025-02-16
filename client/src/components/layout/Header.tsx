import { Link, useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface HeaderProps {
  username?: string;
}

export default function Header({ username }: HeaderProps) {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Welcome and Username Section */}
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <a className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Phish.net Explorer
            </a>
          </Link>
          {username && (
            <div className="text-lg font-semibold">
              Welcome, {username}!
            </div>
          )}
        </div>

        {/* Navigation Tabs - Only show when user is logged in */}
        {username && (
          <div className="pb-2">
            <Tabs defaultValue={location === "/" ? "shows" : location.substring(1)} className="w-full">
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3">
                <Link href="/">
                  <TabsTrigger value="shows" className={cn("cursor-pointer", location === "/" && "data-[state=active]:bg-primary")}>
                    My Shows
                  </TabsTrigger>
                </Link>
                <Link href="/songs">
                  <TabsTrigger value="songs" className={cn("cursor-pointer", location === "/songs" && "data-[state=active]:bg-primary")}>
                    My Songs
                  </TabsTrigger>
                </Link>
                <Link href="/venues">
                  <TabsTrigger value="venues" className={cn("cursor-pointer", location === "/venues" && "data-[state=active]:bg-primary")}>
                    My Venues
                  </TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>
    </header>
  );
}