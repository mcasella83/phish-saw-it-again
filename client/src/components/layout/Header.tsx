import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { IoMusicalNotes } from "react-icons/io5";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="text-2xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
              <IoMusicalNotes className="h-8 w-8 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                I Saw It Again
              </span>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}