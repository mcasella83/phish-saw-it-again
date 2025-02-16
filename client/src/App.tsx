import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import Header from "@/components/layout/Header";
import MyShows from "@/pages/MyShows";
import MySongs from "@/pages/MySongs";
import MyVenues from "@/pages/MyVenues";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-16">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/my-shows" component={MyShows} />
          <Route path="/my-songs" component={MySongs} />
          <Route path="/my-venues" component={MyVenues} />
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