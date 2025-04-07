import React, { useState } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { ProjectsPanel } from '@/components/projects/projects-panel';
import { useAuth } from '@/hooks/use-auth';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch all user projects
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg">Loading your projects...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 md:py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <Link to="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
        
        {projects && projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any) => (
              <Card 
                key={project.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    Created on {new Date(project.created).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3">
                    {project.description || 'No description provided.'}
                  </p>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    {project.sessions ? `${project.sessions.length} sessions` : 'No sessions'}
                  </span>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-muted rounded-full p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md text-center">
              Create your first AI solution project to start exploring possibilities for your business.
            </p>
            <Link to="/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create your first project
              </Button>
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}