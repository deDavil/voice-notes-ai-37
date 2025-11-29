import { Connection } from '@/types/connection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ConnectionCardProps {
  connection: Connection;
  onClick: () => void;
}

const relationshipColors: Record<string, string> = {
  professional: 'bg-tag-professional/15 text-tag-professional border-tag-professional/30',
  personal: 'bg-tag-personal/15 text-tag-personal border-tag-personal/30',
  networking: 'bg-tag-networking/15 text-tag-networking border-tag-networking/30',
  other: 'bg-tag-other/15 text-tag-other border-tag-other/30',
};

export function ConnectionCard({ connection, onClick }: ConnectionCardProps) {
  const displayName = connection.name || 'Unknown';
  const contextSnippet = connection.how_we_met || connection.profession_or_role || 'No details yet';
  
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
        "border border-border/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {displayName}
              </h3>
              {connection.is_favorite && (
                <Star className="w-4 h-4 fill-accent text-accent flex-shrink-0" />
              )}
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {contextSnippet}
            </p>
            
            <div className="flex flex-wrap items-center gap-2">
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
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
              
              {connection.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{connection.tags.length - 2} more
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(connection.updated_at), 'MMM d')}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
