import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  connections: { tags: string[] | null }[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

// Predefined tag categories for organization
const TAG_CATEGORIES: Record<string, string[]> = {
  'Relationship': ['professional', 'personal', 'networking', 'mentor', 'mentee', 'colleague', 'friend', 'family'],
  'Industry': ['tech', 'startup', 'finance', 'healthcare', 'education', 'media', 'consulting', 'legal', 'design', 'marketing'],
  'Priority': ['high-priority', 'follow-up', 'warm-lead', 'key-contact', 'vip'],
  'Location': ['local', 'remote', 'international'],
};

function categorizeTag(tag: string): string {
  const lowerTag = tag.toLowerCase();
  for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
    if (tags.some(t => lowerTag.includes(t) || t.includes(lowerTag))) {
      return category;
    }
  }
  return 'Other';
}

export function TagFilter({ connections, selectedTags, onTagsChange }: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tagData = useMemo(() => {
    const tagCounts = new Map<string, number>();
    connections.forEach(c => {
      (c.tags || []).forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Group tags by category
    const categorizedTags: Record<string, { tag: string; count: number }[]> = {};
    
    tagCounts.forEach((count, tag) => {
      const category = categorizeTag(tag);
      if (!categorizedTags[category]) {
        categorizedTags[category] = [];
      }
      categorizedTags[category].push({ tag, count });
    });

    // Sort tags within each category by count
    Object.values(categorizedTags).forEach(tags => {
      tags.sort((a, b) => b.count - a.count);
    });

    return categorizedTags;
  }, [connections]);

  const filteredTagData = useMemo(() => {
    if (!searchQuery.trim()) return tagData;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, { tag: string; count: number }[]> = {};
    
    Object.entries(tagData).forEach(([category, tags]) => {
      const matchingTags = tags.filter(t => t.tag.toLowerCase().includes(query));
      if (matchingTags.length > 0) {
        filtered[category] = matchingTags;
      }
    });
    
    return filtered;
  }, [tagData, searchQuery]);

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

  const totalTags = Object.values(tagData).flat().length;

  if (totalTags === 0) return null;

  // Order categories with 'Other' at the end
  const categoryOrder = ['Relationship', 'Industry', 'Priority', 'Location', 'Other'];
  const sortedCategories = Object.keys(filteredTagData).sort((a, b) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2"
              aria-expanded={open}
            >
              <Filter className="w-4 h-4" />
              Filter by tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTags.length}
                </Badge>
              )}
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                open && "rotate-180"
              )} />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-72 p-0 bg-popover border border-border shadow-lg z-50" 
            align="start"
            sideOffset={4}
          >
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {sortedCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tags found
                  </p>
                ) : (
                  sortedCategories.map(category => (
                    <div key={category} className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1.5">
                        {category}
                      </p>
                      <div className="space-y-0.5">
                        {filteredTagData[category].map(({ tag, count }) => (
                          <label
                            key={tag}
                            className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => toggleTag(tag)}
                            />
                            <span className="flex-1 text-sm truncate">{tag}</span>
                            <Badge variant="outline" className="text-xs h-5 min-w-5 justify-center">
                              {count}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            {selectedTags.length > 0 && (
              <div className="p-2 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="w-full text-muted-foreground"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Selected tags as removable badges */}
        {selectedTags.map(tag => (
          <Badge 
            key={tag} 
            variant="secondary"
            className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors"
            onClick={() => toggleTag(tag)}
          >
            {tag}
            <X className="w-3 h-3" />
          </Badge>
        ))}
        
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground h-7 px-2"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
