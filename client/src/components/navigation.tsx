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
    <div className="flex flex-col h-screen w-64 bg-background border-r">
      <div className="p-6">
        <Link href="/">
          <a className="flex items-center text-xl font-bold text-primary">
            <span>Digital Village AI Buddy</span>
          </a>
        </Link>
      </div>

      <div className="flex flex-col space-y-2 px-4 py-2">
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
      </div>

      <div className="mt-auto p-4">
        <button
          onClick={() => logoutMutation.mutate()}
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium w-full",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
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