import React from "react";
import { Link, useLocation } from "wouter";
import { Home, FolderOpen, Settings, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/auth";
      }
    });
  };
  
  if (!user) return null;
  
  const linkClass = (path: string) => {
    return `flex items-center w-full py-2 px-3 rounded-md transition-colors ${
      location === path 
        ? "bg-primary/10 text-primary font-medium" 
        : "hover:bg-muted text-muted-foreground"
    }`;
  };
  
  const handleClick = (callback?: () => void) => {
    if (isMobile && onClose) {
      onClose();
    }
    if (callback) {
      callback();
    }
  };
  
  return (
    <div className={`h-full flex flex-col ${isMobile ? 'p-4' : 'p-2'} bg-white border-r`}>
      {/* Nav Menu */}
      <div className="flex flex-col space-y-1 flex-1">
        <Link href="/">
          <button 
            className={linkClass("/")}
            onClick={() => handleClick()}
          >
            <Home className="h-5 w-5 mr-2" />
            <span>Home</span>
          </button>
        </Link>
        
        <Link href="/projects">
          <button 
            className={linkClass("/projects")}
            onClick={() => handleClick()}
          >
            <FolderOpen className="h-5 w-5 mr-2" />
            <span>My Projects</span>
          </button>
        </Link>
        
        <Separator className="my-2" />
        
        <Link href="/settings">
          <button 
            className={linkClass("/settings")}
            onClick={() => handleClick()}
          >
            <Settings className="h-5 w-5 mr-2" />
            <span>Settings</span>
          </button>
        </Link>
        
        <Link href="/help">
          <button 
            className={linkClass("/help")}
            onClick={() => handleClick()}
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            <span>Help</span>
          </button>
        </Link>
      </div>
      
      {/* Logout */}
      <div className="mt-auto pt-2">
        <button 
          className="flex items-center w-full py-2 px-3 rounded-md text-red-500 hover:bg-red-50 transition-colors"
          onClick={() => handleClick(handleLogout)}
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export function SidebarMini() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/auth";
      }
    });
  };
  
  if (!user) return null;
  
  return (
    <TooltipProvider>
      <div className="h-full flex flex-col p-2 bg-white border-r items-center">
        <div className="flex flex-col space-y-4 flex-1 items-center pt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/">
                <Button 
                  variant={location === "/" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-10 w-10"
                >
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Home</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/projects">
                <Button 
                  variant={location === "/projects" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-10 w-10"
                >
                  <FolderOpen className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">My Projects</TooltipContent>
          </Tooltip>
          
          <Separator className="w-5 my-2" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/settings">
                <Button 
                  variant={location === "/settings" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-10 w-10"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/help">
                <Button 
                  variant={location === "/help" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-10 w-10"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Help</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="mt-auto pb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}