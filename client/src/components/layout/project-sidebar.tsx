import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  FolderPlus, 
  Folder,
  Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Project } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

export function ProjectSidebar() {
  const [open, setOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Auto-close the sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
    }
  }, [location, isMobile]);

  // Fetch user's projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['/api/projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await apiRequest('GET', `/api/projects?userId=${user.id}`);
      return response.json();
    },
    enabled: !!user
  });

  const handleNewProject = () => {
    navigate("/projects?new=true");
    setOpen(false);
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/projects?id=${projectId}`);
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2 focus:outline-none">
          <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[350px] border-r">
        <SheetHeader className="mb-5">
          <SheetTitle>My Projects</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-[calc(100vh-12rem)]">
          <Button 
            onClick={handleNewProject}
            variant="outline" 
            className="mb-4 w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
          
          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : projects && projects.length > 0 ? (
                projects.map((project: Project) => (
                  <div 
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className={`
                      p-3 rounded-md cursor-pointer flex items-center
                      ${location.includes(`id=${project.id}`) ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}
                    `}
                  >
                    <Folder className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="font-medium truncate">{project.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No projects yet</p>
                  <p className="text-sm">Create your first project</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <SheetFooter className="mt-4">
          <p className="text-xs text-gray-500 w-full text-center">
            Manage your AI solution projects and continue your conversations
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}