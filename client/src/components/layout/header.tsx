import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { UserPreferencesDialog } from '@/components/user-preferences-dialog';

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Get the first letter of the username for the avatar fallback
  const getUserInitial = () => {
    if (!user || !user.username) return '';
    return user.username.charAt(0).toUpperCase();
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      <div className="flex h-14 items-center justify-between px-6 md:px-8 max-w-[1280px] mx-auto">
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
        
        <div className="flex items-center justify-end gap-2">
          {user && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowPreferences(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8 cursor-pointer bg-blue-100">
                      {user.profilePhoto ? (
                        <AvatarImage src={user.profilePhoto} alt={user.name || user.username} />
                      ) : null}
                    <AvatarFallback className="text-blue-500">
                      {getUserInitial()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/account">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPreferences(true)}>
                    Preferences
                </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          )}
        </div>
      </div>
      <UserPreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />
    </header>
  );
}