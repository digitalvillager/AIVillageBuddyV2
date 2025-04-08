import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from "@/lib/utils";
import { Home, Settings, FolderOpen, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center text-xl font-bold text-primary">
                <span>Digital Village AI Buddy</span>
              </a>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <NavLink href="/" icon={<Home className="h-4 w-4 mr-2" />} active={location === "/"}>
                Home
              </NavLink>
              <NavLink
                href="/projects"
                icon={<FolderOpen className="h-4 w-4 mr-2" />}
                active={location.startsWith("/projects")}
              >
                Projects
              </NavLink>
              <NavLink
                href="/admin/ai-config"
                icon={<Settings className="h-4 w-4 mr-2" />}
                active={location.startsWith("/admin")}
              >
                Admin
              </NavLink>
              <button
                onClick={() => logoutMutation.mutate()}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                  "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  active: boolean;
}

function NavLink({ href, children, icon, active }: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 rounded-md text-sm font-medium",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        {icon}
        {children}
      </a>
    </Link>
  );
}