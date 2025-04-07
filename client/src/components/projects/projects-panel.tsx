import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
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

  return (
    <div className="w-full bg-white rounded-lg shadow">
      <div className="bg-background border-b p-4">
        <h2 className="font-semibold text-lg">My Projects</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Create and manage your AI solutions
        </p>
      </div>

      <div className="p-4">
        <Link to="/projects/new">
          <Button className="w-full mb-4">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {projects && projects.length > 0 ? (
              projects.map((project: any) => (
                <Card 
                  key={project.id} 
                  className={`cursor-pointer hover:border-primary/50 transition-colors relative ${
                    currentProjectId === String(project.id) ? 'border-primary' : ''
                  }`}
                  onClick={() => onSelectProject && onSelectProject(String(project.id))}
                >
                  {/* Delete Button - Top Right */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 opacity-70 hover:opacity-100 hover:bg-red-50 hover:text-red-500 z-10"
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <CardHeader className="py-3">
                    <CardTitle className="text-md pr-8">{project.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Created on {new Date(project.created).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm line-clamp-2">{project.description || 'No description'}</p>
                  </CardContent>
                  <CardFooter className="py-2 text-xs text-muted-foreground">
                    {project.sessions ? `${project.sessions.length} sessions` : 'No sessions'}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <p>No projects yet. Create one to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}