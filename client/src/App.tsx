import { Switch, Route, Link } from "wouter";
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
  const { logoutMutation } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
            <span className="text-sm font-medium">DV</span>
          </div>
          <span className="font-medium">Digital Village AI Buddy</span>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/">
            <a className="text-sm text-slate-600 hover:text-slate-900">Home</a>
          </Link>
          <Link href="/projects">
            <a className="text-sm text-slate-600 hover:text-slate-900">Projects</a>
          </Link>
          <button 
            onClick={() => logoutMutation.mutate()}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Logout
          </button>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <span className="text-sm font-medium">J</span>
          </div>
        </div>
      </div>
      
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
  return (
    <div className="admin-layout">
      <h1 className="text-3xl font-bold text-center mb-8 mt-4">Digital Village AI Admin Portal</h1>
      <div className="container mx-auto">
        <Switch>
          <Route path="/admin/ai-config" component={AIConfigPage} />
          <Route>
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
          </Route>
        </Switch>
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
