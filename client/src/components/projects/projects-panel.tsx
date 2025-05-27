import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProjectsPanelProps {
  currentProjectId?: string;
  onSelectProject?: (projectId: string) => void;
}

export function ProjectsPanel({ currentProjectId, onSelectProject }: ProjectsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch projects for the current user
  const { data: projects, isLoading } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest('DELETE', `/api/projects/${projectId}`);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Failed to delete project:', error);
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle delete project
  const handleDeleteProject = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation(); // Prevent card click event
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  // Handle edit project
  const handleEditProject = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation(); // Prevent card click event
    setLocation(`/projects/${projectId}/edit`);
  };

  const handleCreateProject = () => {
    setLocation("/projects/scoping");
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 pb-3">
        <h2 className="text-base font-medium">My Projects</h2>
        <p className="text-sm text-gray-600 mt-1">
          Create and manage your AI solutions
        </p>
      </div>

      <div className="px-4 pb-4 flex-1 overflow-auto flex flex-col">
        <Button 
          className="w-full mb-4 bg-primary text-white flex items-center justify-center"
          onClick={handleCreateProject}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {projects && projects.length > 0 ? (
              projects.map((project: any) => (
                <Card 
                  key={project.id} 
                  className={`cursor-pointer shadow-sm hover:shadow transition-shadow border-t-0 border-l-0 border-r-0 border-b relative ${
                    currentProjectId === String(project.id) ? 'border-primary-2 bg-gray-50' : 'border-gray-200'
                  }`}
                  onClick={() => onSelectProject && onSelectProject(String(project.id))}
                >
                  <CardHeader className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-70 hover:opacity-100 hover:bg-blue-50 hover:text-blue-500"
                          onClick={(e) => handleEditProject(e, project.id)}
                          title="Edit project"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-70 hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          title="Delete project"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <div className="text-center p-6 text-gray-500 flex-1 flex items-center justify-center">
                <p>No projects yet. Create one to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}