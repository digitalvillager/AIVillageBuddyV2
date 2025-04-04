import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, FolderOpen } from "lucide-react";

export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  
  const closeDrawer = () => setOpen(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col h-full py-6">
          <div className="flex-1 space-y-4">
            <h3 className="font-medium mb-2 px-2">Navigation</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className={`w-full justify-start ${location === "/" ? "bg-gray-100" : ""}`}
              onClick={closeDrawer}
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className={`w-full justify-start ${location === "/projects" ? "bg-gray-100" : ""}`}
              onClick={closeDrawer}
            >
              <Link href="/projects">
                <FolderOpen className="h-4 w-4 mr-2" />
                My Projects
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}