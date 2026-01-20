import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { Loader2 } from "lucide-react";

// Pages
import AuthPage from "@/pages/AuthPage";
import CustomerHome from "@/pages/CustomerHome";
import DriverDashboard from "@/pages/DriverDashboard";
import BookingsPage from "@/pages/BookingsPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, role }: { component: React.ComponentType; role?: "customer" | "driver" }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (role && user.role !== role && user.role !== "admin") {
    // Redirect if role doesn't match (simple protection)
    // If a driver tries to access customer home, send them to dashboard
    return <Redirect to="/" />;
  }

  return <Component />;
}

function HomeRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-background" />;
  
  if (!user) return <Redirect to="/login" />;
  
  if (user.role === "driver") return <DriverDashboard />;
  if (user.role === "admin") return <AdminDashboard />; // Admin default
  return <CustomerHome />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={AuthPage} />
      
      {/* Dynamic Home based on Role */}
      <Route path="/" component={HomeRouter} />
      
      <Route path="/bookings">
        <ProtectedRoute component={BookingsPage} />
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} />
      </Route>

      {/* Secret Admin Route */}
      <Route path="/admin8886" component={AdminDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <BottomNav />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
