import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface ProjectsPanelProps {
  currentProjectId?: string;
  onSelectProject?: (projectId: string) => void;
}

export function ProjectsPanel({ currentProjectId, onSelectProject }: ProjectsPanelProps) {
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

  return (
    <div className="w-full bg-white rounded-lg shadow">
      <div className="bg-primary text-white p-4">
        <h2 className="font-semibold text-lg">My Projects</h2>
        <p className="text-sm text-neutral-100 mt-1">
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
                  className={`cursor-pointer hover:border-primary/50 transition-colors ${
                    currentProjectId === project.id ? 'border-primary' : ''
                  }`}
                  onClick={() => onSelectProject && onSelectProject(project.id)}
                >
                  <CardHeader className="py-3">
                    <CardTitle className="text-md">{project.name}</CardTitle>
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