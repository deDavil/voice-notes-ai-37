import { Users, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddConnection: () => void;
}

export function EmptyState({ onAddConnection }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Users className="w-12 h-12 text-primary" />
      </div>
      
      <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
        No connections yet
      </h2>
      
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        Record your first voice note to start building your personal network. 
        Just describe someone you met and we'll organize it for you.
      </p>
      
      <Button 
        variant="accent" 
        size="lg" 
        onClick={onAddConnection}
        className="gap-2"
      >
        <Mic className="w-5 h-5" />
        Record Your First Connection
      </Button>
    </div>
  );
}
