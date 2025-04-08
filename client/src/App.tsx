import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ProjectsPage from "@/pages/projects-page";
import NewProject from "@/pages/new-project";
import AIConfigPage from "@/pages/admin/ai-config";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import ErrorBoundary from "@/components/error-boundary";
import { Navigation } from "@/components/navigation";
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


function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/projects" component={ProjectsPage} />
      <ProtectedRoute path="/projects/new" component={NewProject} />
      <ProtectedRoute path="/admin/ai-config" component={AIConfigPage} />
      <Route path="/auth" component={AuthPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorHandler />
          <Navigation />
          <main className="py-6">
            <Router />
          </main>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
