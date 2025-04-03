import React from "react";
import { Link } from "wouter";
import { User, HelpCircle } from "lucide-react";

export function Header() {
  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="text-white font-bold text-xl md:text-2xl flex items-center cursor-pointer">
              <img 
                src="/assets/logo.png" 
                alt="Digital Village Logo" 
                className="w-8 h-8 mr-2"
              />
              Digital Village AI Buddy
            </div>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <button className="text-white hover:text-neutral-200 transition">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button className="text-white hover:text-neutral-200 transition">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
