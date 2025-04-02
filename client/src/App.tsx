import { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from "./components/ui/toaster";
import { useToast } from './hooks/use-toast';

// Pages
import Home from './pages/home';
import Game from './pages/game';
import StoryCreate from './pages/StoryCreate';
import Profile from './pages/Profile';
import NotFound from './pages/not-found';
import Login from './pages/auth/login';

// Protected route component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Mock authentication - in real app would check a token or session
  const isAuthenticated = true;

  if (!isAuthenticated) {
    toast({
      title: "Authentication required",
      description: "Please log in to view this page",
      variant: "destructive",
    });
    navigate('/login');
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/create" component={() => <ProtectedRoute component={StoryCreate} />} />
      <Route path="/game" component={() => <ProtectedRoute component={Game} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background">
        <Router />
        <Toaster />
      </main>
    </QueryClientProvider>
  );
}

export default App;