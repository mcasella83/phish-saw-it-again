import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ProductsPage from "@/pages/products";
import CreateProduct from "@/pages/products/create";
import EditProduct from "@/pages/products/edit/[id]";
import Header from "@/components/layout/Header";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <Switch>
          <Route path="/" component={ProductsPage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/create" component={CreateProduct} />
          <Route path="/products/edit/:id" component={EditProduct} />
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
