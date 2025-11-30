import { Connection } from '@/types/connection';
import { Profile } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WarmthBadge } from './WarmthBadge';
import { PriorityBadge } from './PriorityBadge';
import { findCommonGround } from '@/lib/commonGround';

interface ConnectionGalleryViewProps {
  connections: Connection[];
  onConnectionClick: (id: string) => void;
  userProfile?: Profile | null;
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

function getFollowUpStatus(nextFollowUp: string | null) {
  if (!nextFollowUp) return null;
  
  const due = new Date(nextFollowUp);
  const now = new Date();
  const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return { color: 'text-destructive', label: 'Overdue', dot: 'bg-destructive' };
  if (daysUntil <= 7) return { color: 'text-warning', label: `${daysUntil}d`, dot: 'bg-warning' };
  return { color: 'text-muted-foreground', label: `${daysUntil}d`, dot: 'bg-primary' };
}

export function ConnectionGalleryView({ connections, onConnectionClick, userProfile }: ConnectionGalleryViewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {connections.map((connection) => {
        const followUpStatus = connection.follow_up_enabled ? getFollowUpStatus(connection.next_follow_up_at) : null;
        const common = findCommonGround(userProfile || null, connection);
        
        return (
          <Card
            key={connection.id}
            onClick={() => onConnectionClick(connection.id)}
            className={cn(
              "cursor-pointer transition-all duration-200",
              "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
              "border border-border/50"
            )}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="relative mb-3">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={connection.photo_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(connection.name)}
                  </AvatarFallback>
                </Avatar>
                {connection.is_favorite && (
                  <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-semibold text-foreground truncate max-w-full">
                  {connection.name || 'Unknown'}
                </h3>
                <PriorityBadge level={connection.priority} size="sm" />
              </div>
              
              <p className="text-sm text-muted-foreground truncate max-w-full mb-2">
                {connection.profession_or_role || connection.company || 'No role'}
              </p>
              
              {/* Common Ground Badge */}
              {common.total > 0 && (
                <div className="flex items-center gap-1 text-xs text-primary mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>{common.total} in common</span>
                </div>
              )}
              
              <div className="flex flex-wrap justify-center gap-1 mb-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize border",
                    relationshipColors[connection.relationship_type] || relationshipColors.other
                  )}
                >
                  {connection.relationship_type}
                </Badge>
                {connection.tags.slice(0, 1).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between w-full">
                <WarmthBadge level={connection.warmth_level} size="sm" />
                {followUpStatus && (
                  <div className={cn("flex items-center gap-1 text-xs", followUpStatus.color)}>
                    <div className={cn("w-2 h-2 rounded-full", followUpStatus.dot)} />
                    {followUpStatus.label}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
