import { Link, useLocation } from 'react-router-dom';
import { Users, CheckSquare, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Connections', icon: Users },
  { to: '/todos', label: 'TO-DOs', icon: CheckSquare },
  { to: '/suggestions', label: 'Suggestions', icon: Lightbulb },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="sticky top-[73px] z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="flex gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
