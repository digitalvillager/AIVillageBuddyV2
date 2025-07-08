import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { nanoid } from 'nanoid';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Info, DollarSign, Target, Code, Lightbulb, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Schema for form validation
const projectScopingSchema = z.object({
  name: z.string().min(3, {
    message: "Project name must be at least 3 characters",
  }),
});

type ProjectScopingFormValues = z.infer<typeof projectScopingSchema>;

const timelineOptions = [
  { value: "quick", label: "Quick win (1-4 weeks)" },
  { value: "medium", label: "Medium-term (1-3 months)" },
  { value: "strategic", label: "Strategic (3-6+ months)" },
];

const budgetOptions = [
  { value: "under_5k", label: "Under $5,000" },
  { value: "5k_to_15k", label: "$5,000-$15,000" },
  { value: "15k_to_50k", label: "$15,000-$50,000" },
  { value: "over_50k", label: "Over $50,000" },
];

const goalOptions = [
  { value: "reduce_costs", label: "Reduce Costs", icon: DollarSign },
  { value: "increase_revenue", label: "Increase Revenue", icon: Target },
  { value: "improve_efficiency", label: "Improve Efficiency", icon: Code },
  { value: "enhance_customer_experience", label: "Enhance Customer Experience", icon: Lightbulb },
  { value: "solve_specific_problem", label: "Solve Specific Problem", icon: Info },
];

export default function ProjectScoping() {

  console.log("ProjectScoping");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Helper function to clear session and create a new one
  const clearSessionAndCreateNew = async (projectId: string) => {
    try {
      // Create a new session ID
      const newSessionId = nanoid();
      
      // Clear old session data from localStorage
      localStorage.removeItem('sessionId');
      localStorage.setItem('sessionId', newSessionId);
      localStorage.setItem('projectId', projectId);
      
      // Create new session in the database with the project ID
      await apiRequest('POST', '/api/sessions', { 
        id: newSessionId,
        projectId: Number(projectId)
      });
      
      // Add initial greeting message for the new project
      await apiRequest('POST', '/api/messages', {
        sessionId: newSessionId,
        role: 'assistant',
        content: "Welcome to your new project! What would you like to focus on for your AI solution?"
      });
      
    } catch (error) {
      console.error('Failed to create new session:', error);
      // Still proceed with navigation even if session creation fails
    }
  };

  // Initialize the form
  const form = useForm<ProjectScopingFormValues>({
    resolver: zodResolver(projectScopingSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: ProjectScopingFormValues) => {
    try {
      setIsSubmitting(true);

      const savedSessionId = localStorage.getItem('sessionId');
      console.log("savedSessionId:");
      console.log(savedSessionId);

      const postData = {
        ...data,
        sessionId: savedSessionId,
        // Add default values for fields that backend expects
        timeline: "Not specified",
        budget: "Not specified",
        primaryGoal: "improve_efficiency",
        technicalComplexity: 3,
        projectConfidence: false,
      }

      // Make API request to create project with scoping data
      const response = await apiRequest("POST", "/api/projects", postData);
      
      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }
      
      const project = await response.json();
      
      // Invalidate the projects cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Clear existing session and create new one for this project
      await clearSessionAndCreateNew(project.id.toString());
      
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully!",
      });
      console.log("project created:");
      console.log(project);
      
      // Navigate to chat interface
      setLocation("/");
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      
      // Create project with default values
      const response = await apiRequest("POST", "/api/projects", {
        name: "New Project",
        timeline: "Not specified",
        budget: "Not specified",
        primaryGoal: "improve_efficiency",
        technicalComplexity: 3,
        projectConfidence: false,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }
      
      const project = await response.json();
      
      // Invalidate the projects cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Clear existing session and create new one for this project
      await clearSessionAndCreateNew(project.id.toString());
      
      toast({
        title: "Project Created",
        description: "Your new project has been created with default settings.",
      });
      
      // Navigate to chat interface
      setLocation("/");
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    if (typeof window !== 'undefined') {
      setLocation("/auth");
      return null;
    }
    
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-light-blue">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto p-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Project Scoping</CardTitle>
            <CardDescription>
              Help us understand your project requirements to provide more personalized AI assistance
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Project Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* Form Actions */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                  >
                    Skip for now
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Project...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
} 