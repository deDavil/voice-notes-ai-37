import { useState, useMemo } from 'react';
import { X, ChevronDown, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Connection } from '@/types/connection';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TagFilterProps {
  connections: Connection[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ connections, selectedTags, onTagsChange }: TagFilterProps) {
  const [open, setOpen] = useState(false);
  
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    connections.forEach((c) => c.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [connections]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearTags = () => {
    onTagsChange([]);
  };

  if (allTags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "h-8 gap-1.5",
              selectedTags.length > 0 && "border-primary/50 bg-primary/5"
            )}
          >
            <Tag className="w-3.5 h-3.5" />
            Tags
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                {selectedTags.length}
              </Badge>
            )}
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={clearTags} className="w-full h-7 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Selected tags display */}
      {selectedTags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="gap-1 pl-2 pr-1 h-7 cursor-pointer hover:bg-secondary/80"
          onClick={() => toggleTag(tag)}
        >
          {tag}
          <X className="w-3 h-3" />
        </Badge>
      ))}
    </div>
  );
}
