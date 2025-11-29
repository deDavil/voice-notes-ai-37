import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  connections: { tags: string[] | null }[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ connections, selectedTags, onTagsChange }: TagFilterProps) {
  const [showAllTags, setShowAllTags] = useState(false);

  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    connections.forEach(c => {
      (c.tags || []).forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [connections]);

  const visibleTags = showAllTags ? availableTags : availableTags.slice(0, 8);
  const hasMoreTags = availableTags.length > 8;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onTagsChange([]);
  };

  if (availableTags.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      <p className="text-sm text-muted-foreground">Filter by tags:</p>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedTags.length === 0 ? "default" : "outline"}
          size="sm"
          onClick={clearFilters}
          className="rounded-full"
        >
          All
        </Button>
        
        {visibleTags.map(({ tag, count }) => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTag(tag)}
            className="rounded-full gap-1"
          >
            {tag}
            <Badge variant="secondary" className={cn(
              "ml-1 h-5 min-w-5 px-1.5 text-xs",
              selectedTags.includes(tag) && "bg-primary-foreground/20 text-primary-foreground"
            )}>
              {count}
            </Badge>
          </Button>
        ))}
        
        {hasMoreTags && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTags(!showAllTags)}
            className="rounded-full text-muted-foreground"
          >
            {showAllTags ? (
              <>
                Show less <ChevronUp className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                +{availableTags.length - 8} more <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Filtering by: {selectedTags.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="mx-1 gap-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={clearFilters}
            className="text-primary p-0 h-auto"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
