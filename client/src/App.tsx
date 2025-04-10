import { Switch, Route, Link, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ProjectsPage from "@/pages/projects-page";
import NewProject from "@/pages/new-project";
import AIConfigPage from "@/pages/admin/ai-config";
import AdminLoginPage from "@/pages/admin/admin-login";
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

// Protected admin route component
function ProtectedAdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element | null;
}) {
  const { user, isLoading } = useAuth();
  
  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : user && user.isAdmin === true ? (
        <Component />
      ) : (
        <div>
          <Redirect to="/admin/login" />
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      )}
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      <ProtectedRouteWithNav path="/" component={Home} />
      <ProtectedRouteWithNav path="/projects" component={ProjectsPage} />
      <ProtectedRouteWithNav path="/projects/new" component={NewProject} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <ProtectedAdminRoute path="/admin" component={AdminRouter} />
      <ProtectedAdminRoute path="/admin/ai-config" component={AIConfigPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  return (
    <div className="admin-layout">
      <h1 className="text-3xl font-bold text-center mb-8 mt-4">Digital Village AI Admin Portal</h1>
      <div className="container mx-auto">
        <div className="mb-4">
          <Link href="/" className="text-primary hover:underline">
            &larr; Back to Main Application
          </Link>
        </div>
        <div className="flex justify-center items-center p-10">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
            <div className="flex flex-col gap-4">
              <Link href="/admin/ai-config">
                <div className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                  AI Configurations
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
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
