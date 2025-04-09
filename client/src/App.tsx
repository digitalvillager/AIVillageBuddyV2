import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ProjectsPage from "@/pages/projects-page";
import NewProject from "@/pages/new-project";
import AdminLoginPage from "@/pages/admin/admin-login";
import AdminDashboard from "@/pages/admin/dashboard";
import { AuthProvider } from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import ErrorBoundary from "@/components/error-boundary";
import { useEffect } from "react";

// Add global error handler for uncaught runtime errors
function ErrorHandler() {
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error);
      // We could send this to a logging service if needed
    };

    window.addEventListener("error", errorHandler);
    
    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  return null;
}


function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

function ProtectedRouteWithNav(props: any) {
  return (
    <ProtectedRoute 
      {...props} 
      component={(routeProps: any) => (
        <MainLayout>
          <props.component {...routeProps} />
        </MainLayout>
      )} 
    />
  );
}

function Router() {
  return (
    <Switch>
      <ProtectedRouteWithNav path="/" component={Home} />
      <ProtectedRouteWithNav path="/projects" component={ProjectsPage} />
      <ProtectedRouteWithNav path="/projects/new" component={NewProject} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin" component={AdminRouter} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/admin">
        <AdminLoginPage />
      </Route>
      <Route path="/admin/dashboard">
        {user ? <AdminDashboard /> : <AdminLoginPage />}
      </Route>
      <Route>
        <AdminLoginPage />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorHandler />
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
