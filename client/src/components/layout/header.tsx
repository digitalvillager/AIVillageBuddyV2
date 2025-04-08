import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-white text-xs font-medium">DV</span>
              </div>
              <span className="text-base font-medium">
                Digital Village AI Buddy
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center justify-end gap-4">
          {user ? (
            <>
              <Link to="/">
                <span className="text-sm text-gray-600">Home</span>
              </Link>
              <Link to="/projects">
                <span className="text-sm text-gray-600">Projects</span>
              </Link>
              <span className="text-sm text-gray-600 cursor-pointer" onClick={handleLogout}>
                Logout
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                <span className="text-sm font-medium">J</span>
              </div>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}