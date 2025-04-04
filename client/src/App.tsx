import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import { useState } from "react";
import About from "@/pages/About";
import ShowSearch from "@/pages/ShowSearch";

function Router() {
  const [activeTab, setActiveTab] = useState(() => {
    // Set initial active tab based on the current path
    const path = window.location.pathname;
    if (path === "/search") return "search";
    if (path === "/about") return "about";
    return "shows";
  });
  
  const username = localStorage.getItem("phish-explorer-username");
  const isLoggedIn = username !== null;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showNavigation={isLoggedIn} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isLoggedIn={isLoggedIn}
        username={username || ""}
      />
      <main className="container mx-auto px-4 py-8 mt-16">
        <Switch>
          <Route path="/">
            <HomePage initialTab={activeTab} onTabChange={setActiveTab} />
          </Route>
          <Route path="/search">
            <ShowSearch />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;