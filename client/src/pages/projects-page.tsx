import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Project } from "@shared/schema";
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
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Projects Sidebar */}
      <div 
        className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && <h2 className="font-semibold text-gray-700">My Projects</h2>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoadingProjects ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : projectsError ? (
            <div className="p-4 text-red-500 text-sm">
              Error loading projects
            </div>
          ) : projects.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm text-center">
              {sidebarOpen ? "No projects yet" : ""}
            </div>
          ) : (
            <ul className="py-2">
              {projects.map((project) => (
                <li 
                  key={project.id}
                  className={`
                    flex items-center py-2 px-4 cursor-pointer hover:bg-gray-100
                    ${selectedProjectId === project.id ? "bg-gray-100" : ""}
                  `}
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <Folder className={`h-5 w-5 ${sidebarOpen ? "mr-3" : ""} text-primary`} />
                  {sidebarOpen && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm truncate">{project.name}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDeleteProject(project.id)}>
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size={sidebarOpen ? "default" : "icon"} 
                className="w-full"
              >
                {sidebarOpen ? (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> New Project
                  </>
                ) : (
                  <FolderPlus className="h-4 w-4" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project to organize your AI conversations.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="My AI Project" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of your project" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createProjectMutation.isPending}
                    >
                      {createProjectMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Project"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 bg-white p-6 overflow-y-auto">
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
      </div>
    </div>
  );
}