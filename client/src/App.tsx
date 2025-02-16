import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import MySongs from "@/pages/MySongs";
import MyVenues from "@/pages/MyVenues";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/songs" component={MySongs} />
        <Route path="/venues" component={MyVenues} />
        <Route component={NotFound} />
      </Switch>
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