import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";

// Schema for form validation
const projectScopingSchema = z.object({
  name: z.string().min(3, {
    message: "Project name must be at least 3 characters",
  }),
  timeline: z.enum(["quick", "medium", "strategic"]),
  budget: z.enum(["under_5k", "5k_to_15k", "15k_to_50k", "over_50k"]),
  primaryGoal: z.enum([
    "reduce_costs",
    "increase_revenue",
    "improve_efficiency",
    "enhance_customer_experience",
    "solve_specific_problem",
  ]),
  technicalComplexity: z.number().min(1).max(5),
  projectConfidence: z.boolean(),
  additionalContext: z.string().optional(),
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

export default function EditProject() {

  console.log("EditProject");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  // Get project ID from URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 2];
    setProjectId(id);
  }, []);

  // Fetch project data
  const { data: project } = useQuery({
    queryKey: ['/api/projects', projectId],
    queryFn: async () => {
      console.log("Project ID:", projectId);
      if (!projectId) return null;
      const response = await apiRequest('GET', `/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      else {
        console.log("Project fetched successfully");
        console.log(await response.json());
      }
      const projectJson = await response.json();
      setIsLoadingProject(false);
      return projectJson;
    },
    enabled: !!projectId,
  });

  // Initialize the form
  const form = useForm<ProjectScopingFormValues>({
    resolver: zodResolver(projectScopingSchema),
    defaultValues: {
      name: "",
      timeline: "medium",
      budget: "5k_to_15k",
      primaryGoal: "improve_efficiency",
      technicalComplexity: 3,
      projectConfidence: false,
      additionalContext: "",
    },
    values: project,
  });

  // Update form when project data is loaded
  useEffect(() => {
    if (project) {
      console.log("(useEffect)Project data:", project);
      form.reset({
        name: project.name,
        timeline: project.timeline,
        budget: project.budget,
        primaryGoal: project.primaryGoal,
        technicalComplexity: project.technicalComplexity,
        projectConfidence: project.projectConfidence,
        additionalContext: project.additionalContext || "",
      });
    } else {
      console.log("(useEffect)No project data found");
    }
  }, [project, form]);

  const onSubmit = async (data: ProjectScopingFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Make API request to update project
      const response = await apiRequest("PUT", `/api/projects/${projectId}`, data);
      
      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.statusText}`);
      }
      
      // Invalidate the projects cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      toast({
        title: "Project Updated",
        description: "Your project has been updated successfully!",
      });
      
      // Navigate back to projects page
      setLocation("/projects");
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
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

  if (isLoadingProject) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading project...</span>
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
            <CardTitle className="text-2xl font-bold">Edit Project</CardTitle>
            <CardDescription>
              Update your project parameters to refine the AI assistance
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

                {/* Implementation Timeline */}
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Implementation Timeline</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This helps us tailor the solution to your timeframe</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          {timelineOptions.map((option) => (
                            <FormItem key={option.value}>
                              <FormControl>
                                <RadioGroupItem
                                  value={option.value}
                                  className="peer sr-only"
                                />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <Clock className="mb-3 h-6 w-6" />
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Budget Range */}
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Budget Range</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This helps us suggest solutions within your budget</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          {budgetOptions.map((option) => (
                            <FormItem key={option.value}>
                              <FormControl>
                                <RadioGroupItem
                                  value={option.value}
                                  className="peer sr-only"
                                />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <DollarSign className="mb-3 h-6 w-6" />
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Primary Goal Focus */}
                <FormField
                  control={form.control}
                  name="primaryGoal"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Primary Goal Focus</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>What's the main objective you want to achieve?</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          {goalOptions.map((option) => (
                            <FormItem key={option.value}>
                              <FormControl>
                                <RadioGroupItem
                                  value={option.value}
                                  className="peer sr-only"
                                />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                <option.icon className="mb-3 h-6 w-6" />
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Technical Complexity */}
                <FormField
                  control={form.control}
                  name="technicalComplexity"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Technical Complexity Comfort</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>How comfortable are you with technical solutions?</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>Non-technical</span>
                        <span>Technically advanced</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Confidence */}
                <FormField
                  control={form.control}
                  name="projectConfidence"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Project Confidence</FormLabel>
                        <FormDescription>
                          {field.value
                            ? "You have a specific solution in mind"
                            : "You're exploring possibilities"}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Additional Context */}
                <FormField
                  control={form.control}
                  name="additionalContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Context (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional context about your project..."
                          className="min-h-[120px]"
                          {...field}
                        />
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
                    onClick={() => setLocation("/projects")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Project...
                      </>
                    ) : (
                      "Update Project"
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