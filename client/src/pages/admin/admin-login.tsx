import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ShieldAlert } from "lucide-react";

// Validation schema for admin login
const adminLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, isLoading, loginMutation } = useAuth();
  const [_, navigate] = useLocation();

  // Admin login form
  const adminLoginForm = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle navigation after authentication
  if (user) {
    if (user.isAdmin === true) {
      navigate("/admin");
    } else {
      // User is logged in but not an admin
      setErrorMessage("You do not have administrator privileges to access this area.");
    }
  }
  
  const onAdminLoginSubmit = (data: AdminLoginData) => {
    setErrorMessage(null);
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        if (user.isAdmin === true) {
          navigate("/admin");
        } else {
          setErrorMessage("You do not have administrator privileges to access this area.");
        }
      },
      onError: (error) => {
        setErrorMessage("Invalid admin credentials. Please try again.");
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4 text-primary">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Admin Portal</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...adminLoginForm}>
              <form onSubmit={adminLoginForm.handleSubmit(onAdminLoginSubmit)} className="space-y-4">
                {errorMessage && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                    {errorMessage}
                  </div>
                )}
                <FormField
                  control={adminLoginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminLoginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending || isLoading}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Login to Admin"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <a href="/" className="text-sm text-primary hover:underline">
                Return to Main Application
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gray-100 py-4 px-6 text-center border-t">
        <div className="container mx-auto text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Digital Village AI Buddy | Admin Portal</p>
        </div>
      </div>
    </div>
  );
}