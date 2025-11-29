import { Mic, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddConnection: () => void;
}

export function Header({ onAddConnection }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              AI Rolodex
            </h1>
            <p className="text-sm text-muted-foreground">
              Remember everyone you meet
            </p>
          </div>
          
          <Button 
            variant="accent" 
            size="sm"
            onClick={onAddConnection}
            className="gap-2"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
