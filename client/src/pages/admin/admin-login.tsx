import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ShieldAlert } from "lucide-react";
import { Link } from "wouter";

// Validation schema for admin login
const adminLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const { loginMutation } = useAuth();
  const [_, navigate] = useLocation();

  // Admin login form
  const form = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: AdminLoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/admin/dashboard");
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-light-blue">
      <header className="sticky top-0 z-50 w-full bg-white border-b">
        <div className="flex h-14 items-center justify-between px-6 md:px-8 max-w-[1440px] mx-auto">
          <Link to="/">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-white text-xs font-medium">DV</span>
              </div>
              <span className="text-base font-medium">
                Digital Village AI Buddy
              </span>
            </div>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <ShieldAlert className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Admin Portal</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the AI configuration dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Login to Admin Portal"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-gray-500 text-center">
              This area is restricted to authorized personnel only
            </div>
            <Link to="/" className="text-sm text-primary hover:underline text-center w-full">
              Return to Main Application
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <footer className="py-4 px-6 text-center border-t bg-white">
        <div className="container mx-auto text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Digital Village AI Buddy | Admin Portal</p>
        </div>
      </footer>
    </div>
  );
}