import React from "react";
import { Link, useLocation } from "wouter";
import { User, HelpCircle, LogOut, FolderOpen, Home, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MobileDrawer } from "./mobile-drawer";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth");
      }
    });
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {user && <MobileDrawer />}
          <Link href="/">
            <div className="text-gray-800 font-bold text-xl md:text-2xl flex items-center cursor-pointer">
              <img 
                src="/assets/logo.png" 
                alt="Digital Village Logo" 
                className="w-8 h-8 mr-2"
              />
              Digital Village AI Buddy
            </div>
          </Link>
        </div>
        
        {/* Navigation Menu Removed */}
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/help">
              <HelpCircle className="h-5 w-5" />
            </Link>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Mobile navigation removed */}
                
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth">
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
