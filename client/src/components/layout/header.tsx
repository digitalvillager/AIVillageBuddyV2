import React from "react";
import { Link } from "wouter";
import { User } from "lucide-react";
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
import { MobileDrawer } from "./mobile-drawer";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Mobile sidebar drawer */}
        {user && <MobileDrawer />}
        
        <div className="flex items-center">
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
        
        <div className="flex items-center">
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
                
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
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
