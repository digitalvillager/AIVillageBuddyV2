import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { Header } from "@/components/layout/header";
import { ProjectDrawer } from "@/components/layout/project-drawer";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Folder, 
  FolderPlus,
  Trash2,
  Loader2, 
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Validation schema for project creation
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Fetch projects
  const { 
    data: projects = [], 
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project created",
        description: "Your new project has been created",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "The project has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (selectedProjectId === null) {
        setSelectedProjectId(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete project",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form for creating a project
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };
  
  // Handle project selection
  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId);
    // Navigate to the project detail view or load sessions for this project
  };
  
  // Handle project deletion
  const handleDeleteProject = (projectId: number) => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProjectMutation.mutate(projectId);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 relative">
        {/* Project Drawer - ChatGPT style */}
        <ProjectDrawer
          selectedProjectId={selectedProjectId}
          onProjectSelect={handleProjectSelect}
        />
        
        {/* Main Content */}
        <main className="container mx-auto p-4 md:py-6">
          {selectedProjectId ? (
            <div>
              {/* Selected project display with sessions */}
              {projects.find(project => project.id === selectedProjectId) ? (
                <div>
                  <h1 className="text-2xl font-bold mb-6">
                    {projects.find(project => project.id === selectedProjectId)?.name}
                  </h1>
                  <p className="text-gray-600 mb-8">
                    {projects.find(project => project.id === selectedProjectId)?.description || 
                    "No description provided."}
                  </p>
                  
                  {/* Project sessions will be displayed here */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* We'll implement session cards here later */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Button variant="outline" className="mx-auto mb-2">
                        <Plus className="h-4 w-4 mr-2" /> New Session
                      </Button>
                      <p className="text-sm text-gray-500">Start a new AI conversation</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Project not found</h2>
                    <p className="text-gray-600 mb-4">The selected project may have been deleted.</p>
                    <Button onClick={() => setSelectedProjectId(null)}>
                      Go Back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold mb-4">Welcome to Projects</h2>
                <p className="text-gray-600 mb-6">
                  Create or select a project to start organizing your AI conversations.
                  Each project can contain multiple sessions for different AI solutions.
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Project
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}