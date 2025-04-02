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
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2"/>
                <path d="M8 12H16M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
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
