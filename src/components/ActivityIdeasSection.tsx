import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivitySuggestionCard } from './ActivitySuggestionCard';
import { 
  useActivitySuggestions, 
  useGenerateActivitySuggestions, 
  useDismissActivitySuggestion,
  getTimeUntilRefresh 
} from '@/hooks/useActivitySuggestions';

export function ActivityIdeasSection() {
  const { data: suggestions, isLoading, refetch } = useActivitySuggestions();
  const generateSuggestions = useGenerateActivitySuggestions();
  const dismissSuggestion = useDismissActivitySuggestion();
  const [refreshTime, setRefreshTime] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  // Update refresh countdown
  useEffect(() => {
    if (suggestions && suggestions.length > 0) {
      const updateRefreshTime = () => {
        const earliestExpiry = suggestions.reduce((earliest, s) => {
          const expiry = new Date(s.expires_at).getTime();
          return expiry < earliest ? expiry : earliest;
        }, Infinity);
        
        if (earliestExpiry !== Infinity) {
          setRefreshTime(getTimeUntilRefresh(new Date(earliestExpiry).toISOString()));
        }
      };

      updateRefreshTime();
      const interval = setInterval(updateRefreshTime, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [suggestions]);

  // Auto-generate if no suggestions exist
  useEffect(() => {
    if (!isLoading && (!suggestions || suggestions.length === 0) && !generateSuggestions.isPending) {
      // Only auto-generate once on mount if there are no suggestions
      const hasTriedGeneration = sessionStorage.getItem('activity-suggestions-generated');
      if (!hasTriedGeneration) {
        sessionStorage.setItem('activity-suggestions-generated', 'true');
        generateSuggestions.mutate();
      }
    }
  }, [isLoading, suggestions]);

  const handleDismiss = async (suggestionId: string) => {
    setDismissingId(suggestionId);
    await dismissSuggestion.mutateAsync(suggestionId);
    setDismissingId(null);
  };

  const handleRefresh = () => {
    sessionStorage.removeItem('activity-suggestions-generated');
    generateSuggestions.mutate();
  };

  // Loading state
  if (isLoading || generateSuggestions.isPending) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">Activity Ideas</h2>
          </div>
        </div>
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-6 border border-accent/20">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-muted-foreground">Finding activity ideas...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no suggestions
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">Activity Ideas</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate Ideas
          </Button>
        </div>
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-6 border border-accent/20 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            No activity ideas yet. Add interests to your profile and connections to get personalized suggestions!
          </p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Try Generating Ideas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold">Activity Ideas</h2>
        </div>
        <div className="flex items-center gap-2">
          {refreshTime && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              Refreshes in {refreshTime}
            </span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={generateSuggestions.isPending}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Refresh suggestions"
          >
            <RefreshCw className={`w-4 h-4 ${generateSuggestions.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {suggestions.map(suggestion => (
          <ActivitySuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onDismiss={handleDismiss}
            isDismissing={dismissingId === suggestion.id}
          />
        ))}
      </div>
    </div>
  );
}
