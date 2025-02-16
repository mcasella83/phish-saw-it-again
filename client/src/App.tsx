import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import { useState } from "react";

function Router() {
  const [activeTab, setActiveTab] = useState("shows");
  const username = localStorage.getItem("phish-explorer-username");
  const isLoggedIn = username !== null;

  const handleSignOut = () => {
    localStorage.removeItem("phish-explorer-username");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showNavigation={isLoggedIn} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        username={username || undefined}
        onSignOut={isLoggedIn ? handleSignOut : undefined}
      />
      <main className="container mx-auto px-4 py-8 mt-16">
        <Switch>
          <Route path="/">
            <HomePage initialTab={activeTab} onTabChange={setActiveTab} />
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