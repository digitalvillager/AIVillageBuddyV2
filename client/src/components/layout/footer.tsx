import React from 'react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="container flex flex-col sm:flex-row items-center justify-between py-4 md:py-6">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <img
            src="/icon.png"
            alt="Digital Village Logo"
            className="h-5 w-5 object-contain"
          />
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Digital Village. All rights reserved.
          </span>
        </div>
        
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/privacy">
            <span className="hover:text-foreground transition-colors">Privacy</span>
          </Link>
          <Link to="/terms">
            <span className="hover:text-foreground transition-colors">Terms</span>
          </Link>
          <Link to="/contact">
            <span className="hover:text-foreground transition-colors">Contact</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}