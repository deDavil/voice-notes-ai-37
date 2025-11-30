import { Link, useLocation } from 'react-router-dom';
import { Users, CheckSquare, Lightbulb, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Connections', icon: Users },
  { to: '/todos', label: 'To-dos', icon: CheckSquare },
  { to: '/suggestions', label: 'Suggestions', icon: Lightbulb },
  { to: '/follow-ups', label: 'Follow-ups', icon: CalendarCheck },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="sticky top-14 z-40 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex gap-0.5 -mb-px overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap",
                  "border-b-2 -mb-px",
                  isActive
                    ? "text-foreground border-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-border"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
