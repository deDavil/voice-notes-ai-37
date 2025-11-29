import { Connection } from '@/types/connection';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { WarmthBadge } from './WarmthBadge';
import { PriorityBadge } from './PriorityBadge';

interface ConnectionListViewProps {
  connections: Connection[];
  onConnectionClick: (id: string) => void;
}

const relationshipColors: Record<string, string> = {
  professional: 'bg-tag-professional/15 text-tag-professional border-tag-professional/30',
  personal: 'bg-tag-personal/15 text-tag-personal border-tag-personal/30',
  networking: 'bg-tag-networking/15 text-tag-networking border-tag-networking/30',
  other: 'bg-tag-other/15 text-tag-other border-tag-other/30',
};

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ConnectionListView({ connections, onConnectionClick }: ConnectionListViewProps) {
  return (
    <div className="space-y-2">
      {connections.map((connection) => (
        <div
          key={connection.id}
          onClick={() => onConnectionClick(connection.id)}
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card",
            "cursor-pointer transition-all duration-200",
            "hover:shadow-md hover:border-border active:scale-[0.99]"
          )}
        >
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={connection.photo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(connection.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {connection.name || 'Unknown'}
              </h3>
              {connection.is_favorite && (
                <Star className="w-4 h-4 fill-accent text-accent flex-shrink-0" />
              )}
              <PriorityBadge level={connection.priority} />
            </div>
            
            <p className="text-sm text-muted-foreground truncate">
              {connection.profession_or_role}
              {connection.company && ` at ${connection.company}`}
              {connection.location && ` · ${connection.location}`}
            </p>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs capitalize border",
                  relationshipColors[connection.relationship_type] || relationshipColors.other
                )}
              >
                {connection.relationship_type}
              </Badge>
              {connection.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {connection.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{connection.tags.length - 2}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(connection.updated_at), 'MMM d')}
            </div>
            <WarmthBadge level={connection.warmth_level} size="sm" />
            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
          </div>
        </div>
      ))}
    </div>
  );
}
