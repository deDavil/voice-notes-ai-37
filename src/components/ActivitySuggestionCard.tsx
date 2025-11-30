import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ActivitySuggestion } from '@/hooks/useActivitySuggestions';

interface ActivitySuggestionCardProps {
  suggestion: ActivitySuggestion;
  onDismiss: (id: string) => void;
  isDismissing?: boolean;
}

export function ActivitySuggestionCard({ suggestion, onDismiss, isDismissing }: ActivitySuggestionCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleMessage = () => {
    navigate(`/connection/${suggestion.connection_id}`);
  };

  return (
    <div 
      className={cn(
        "bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-4 border border-accent/20 transition-all duration-200",
        isHovered && "border-accent/40 shadow-sm"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{suggestion.emoji}</span>
          <h3 className="font-semibold text-foreground">{suggestion.title}</h3>
        </div>
        <button
          onClick={() => onDismiss(suggestion.id)}
          disabled={isDismissing}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-background/50 transition-colors"
          title="Dismiss"
        >
          {isDismissing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {suggestion.description}
      </p>
      
      <div className="flex items-center justify-between">
        <Button
          onClick={handleMessage}
          variant="accent"
          size="sm"
          className="gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Message {suggestion.connection_name}
        </Button>
        
        <span className="text-xs text-muted-foreground">
          {suggestion.connection_name} · {suggestion.shared_interest}
        </span>
      </div>
    </div>
  );
}
