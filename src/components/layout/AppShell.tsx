import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
    </div>
  );
}

interface AppHeaderProps {
  children: ReactNode;
  className?: string;
}

export function AppHeader({ children, className }: AppHeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border",
      className
    )}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        {children}
      </div>
    </header>
  );
}

interface AppMainProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl';
}

export function AppMain({ children, className, maxWidth = '4xl' }: AppMainProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <main className={cn(
      "mx-auto px-4 sm:px-6 py-6",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </main>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
