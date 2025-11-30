import { Connection } from '@/types/connection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MoreHorizontal, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConnectionCardProps {
  connection: Connection;
  onClick: () => void;
  variant?: 'default' | 'compact';
  showActions?: boolean;
}

const relationshipColors: Record<string, string> = {
  professional: 'bg-blue-50 text-blue-600 border-blue-200',
  personal: 'bg-green-50 text-green-600 border-green-200',
  networking: 'bg-purple-50 text-purple-600 border-purple-200',
  other: 'bg-gray-50 text-gray-600 border-gray-200',
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

function getFollowUpStatus(nextFollowUp: string | null, enabled: boolean) {
  if (!enabled || !nextFollowUp) return null;
  
  const now = new Date();
  const followUp = new Date(nextFollowUp);
  const diffDays = Math.ceil((followUp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { label: 'Overdue', className: 'text-error' };
  } else if (diffDays <= 7) {
    return { label: `${diffDays}d`, className: 'text-warning' };
  }
  return null;
}

export function ConnectionCard({ 
  connection, 
  onClick, 
  variant = 'default',
  showActions = true 
}: ConnectionCardProps) {
  const isCompact = variant === 'compact';
  const followUpStatus = getFollowUpStatus(connection.next_follow_up_at, connection.follow_up_enabled);
  
  const contextSnippet = connection.how_we_met || connection.additional_notes;
  const lastInteraction = connection.last_interaction_at 
    ? formatDistanceToNow(new Date(connection.last_interaction_at), { addSuffix: true })
    : null;

  return (
    <div 
      className={cn(
        "group bg-card rounded-xl border border-border shadow-card transition-all duration-200 cursor-pointer",
        "hover:shadow-card-hover hover:border-border/80",
        isCompact ? "p-3" : "p-4"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className={cn(isCompact ? "h-10 w-10" : "h-12 w-12")}>
            <AvatarImage src={connection.photo_url || undefined} alt={connection.name || ''} />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
              {getInitials(connection.name)}
            </AvatarFallback>
          </Avatar>
          {connection.is_favorite && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
              <Star className="w-2.5 h-2.5 text-white fill-white" />
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className={cn(
              "font-semibold text-foreground truncate",
              isCompact ? "text-sm" : "text-base"
            )}>
              {connection.name || 'Unknown'}
            </h3>
            {connection.priority === 'vip' && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-amber-200">
                VIP
              </Badge>
            )}
          </div>
          
          <p className={cn(
            "text-muted-foreground truncate",
            isCompact ? "text-xs" : "text-sm"
          )}>
            {connection.profession_or_role}
            {connection.company && (
              <span className="text-muted-foreground/70"> · {connection.company}</span>
            )}
          </p>
          
          {!isCompact && contextSnippet && (
            <p className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-1">
              {contextSnippet}
            </p>
          )}
          
          {/* Tags and metadata */}
          <div className={cn(
            "flex items-center gap-2 flex-wrap",
            isCompact ? "mt-1.5" : "mt-2"
          )}>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 capitalize border font-normal",
                relationshipColors[connection.relationship_type] || relationshipColors.other
              )}
            >
              {connection.relationship_type}
            </Badge>
            
            {connection.tags.slice(0, isCompact ? 1 : 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-[10px] px-1.5 py-0 h-4 font-normal"
              >
                {tag}
              </Badge>
            ))}
            
            {connection.tags.length > (isCompact ? 1 : 2) && (
              <span className="text-[10px] text-muted-foreground">
                +{connection.tags.length - (isCompact ? 1 : 2)}
              </span>
            )}
          </div>
          
          {/* Last interaction */}
          {!isCompact && lastInteraction && (
            <p className="text-[11px] text-muted-foreground mt-2">
              Last contact: {lastInteraction}
            </p>
          )}
        </div>
        
        {/* Right side - actions and status */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {followUpStatus && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 font-medium border-0",
                followUpStatus.className
              )}
            >
              {followUpStatus.label}
            </Badge>
          )}
          
          {showActions && !isCompact && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add note
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" />
                    Set reminder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          <ChevronRight className={cn(
            "w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors",
            isCompact && "hidden sm:block"
          )} />
        </div>
      </div>
    </div>
  );
}
