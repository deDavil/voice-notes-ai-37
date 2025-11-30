import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronDown, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onAddConnection: () => void;
}

export function Header({ onAddConnection }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userInitial = profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-foreground hidden sm:block">Rolodex</span>
          </div>
          
          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <GlobalSearch />
          </div>
          
          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="sm:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-4 h-4" />
            </Button>
            
            <NotificationBell />
            
            <Button 
              size="sm"
              onClick={onAddConnection}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>

            {/* User Menu */}
            <div className="relative ml-1">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  "flex items-center gap-1.5 p-1 rounded-lg transition-colors",
                  "hover:bg-secondary",
                  menuOpen && "bg-secondary"
                )}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-border">
                  <span className="text-primary font-medium text-xs">
                    {userInitial}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-muted-foreground transition-transform hidden sm:block",
                  menuOpen && "rotate-180"
                )} />
              </button>

              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border py-1.5 z-20 animate-scale-in">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="font-medium text-foreground text-sm truncate">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Settings
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-muted-foreground" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile search bar */}
        {searchOpen && (
          <div className="pb-3 sm:hidden animate-fade-in">
            <GlobalSearch autoFocus onClose={() => setSearchOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
}
