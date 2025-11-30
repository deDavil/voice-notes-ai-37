import { ReactNode } from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  icon,
  title, 
  description, 
  actionLabel,
  onAction,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 animate-fade-in",
      className
    )}>
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
        {icon || <Users className="w-8 h-8 text-muted-foreground" />}
      </div>
      
      <h2 className="text-lg font-semibold text-foreground mb-1.5 text-center">
        {title}
      </h2>
      
      <p className="text-muted-foreground text-center max-w-sm mb-6 text-sm">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Convenience wrapper for connections empty state
interface ConnectionsEmptyStateProps {
  onAddConnection: () => void;
}

export function ConnectionsEmptyState({ onAddConnection }: ConnectionsEmptyStateProps) {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8 text-muted-foreground" />}
      title="No connections yet"
      description="Start building your personal network by adding your first connection. Record a voice note or add details manually."
      actionLabel="Add Connection"
      onAction={onAddConnection}
    />
  );
}
