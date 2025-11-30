import { Connection } from '@/types/connection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ConnectionTableViewProps {
  connections: Connection[];
  onConnectionClick: (id: string) => void;
}

const relationshipColors: Record<string, string> = {
  professional: 'bg-blue-50 text-blue-600 border-blue-200',
  personal: 'bg-green-50 text-green-600 border-green-200',
  networking: 'bg-purple-50 text-purple-600 border-purple-200',
  other: 'bg-gray-50 text-gray-600 border-gray-200',
};

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getFollowUpStatus(nextFollowUp: string | null, enabled: boolean) {
  if (!enabled || !nextFollowUp) return null;
  
  const now = new Date();
  const followUp = new Date(nextFollowUp);
  const diffDays = Math.ceil((followUp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { label: 'Overdue', className: 'text-error bg-error/10' };
  } else if (diffDays <= 7) {
    return { label: `Due in ${diffDays}d`, className: 'text-warning bg-warning/10' };
  }
  return { label: 'On track', className: 'text-success bg-success/10' };
}

export function ConnectionTableView({ connections, onConnectionClick }: ConnectionTableViewProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[280px]">Name</TableHead>
            <TableHead className="hidden sm:table-cell">Role</TableHead>
            <TableHead className="hidden md:table-cell">Company</TableHead>
            <TableHead className="hidden lg:table-cell">Location</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connections.map((connection) => {
            const followUpStatus = getFollowUpStatus(
              connection.next_follow_up_at, 
              connection.follow_up_enabled
            );
            
            return (
              <TableRow 
                key={connection.id}
                onClick={() => onConnectionClick(connection.id)}
                className="cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={connection.photo_url || undefined} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {getInitials(connection.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground truncate text-sm">
                          {connection.name || 'Unknown'}
                        </span>
                        {connection.is_favorite && (
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] px-1 py-0 h-3.5 capitalize border font-normal mt-0.5",
                          relationshipColors[connection.relationship_type] || relationshipColors.other
                        )}
                      >
                        {connection.relationship_type}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground truncate">
                    {connection.profession_or_role || '-'}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground truncate">
                    {connection.company || '-'}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {connection.location ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{connection.location}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
