import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import Login from "@/pages/auth/login";
import { useQuery } from "@tanstack/react-query";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, navigate] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/game">
        {() => <ProtectedRoute component={Game} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
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
import { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';

// Pages
import Home from './pages/Home';
import Game from './pages/Game';
import StoryCreate from './pages/StoryCreate';
import Profile from './pages/Profile';

// Create a client
const queryClient = new QueryClient();

// Simple authentication state
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const [location, setLocation] = useState(location);
  const { toast } = useToast();
  
  // Mock authentication - in real app would check a token or session
  const isAuthenticated = true;
  
  if (!isAuthenticated) {
    toast({
      title: "Authentication required",
      description: "Please log in to view this page",
      variant: "destructive",
    });
    setLocation('/');
    return null;
  }
  
  return <Component {...rest} />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/create" component={() => <ProtectedRoute component={StoryCreate} />} />
          <Route path="/game" component={() => <ProtectedRoute component={Game} />} />
          <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
          <Route>Page not found</Route>
        </Switch>
        <Toaster />
      </main>
    </QueryClientProvider>
  );
}

export default App;
