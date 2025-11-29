import { Connection } from '@/types/connection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WarmthBadge } from './WarmthBadge';
import { PriorityBadge } from './PriorityBadge';

interface ConnectionTableViewProps {
  connections: Connection[];
  onConnectionClick: (id: string) => void;
}

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
  
  const due = new Date(nextFollowUp);
  const now = new Date();
  const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return { color: 'text-destructive', label: 'Overdue', dot: 'bg-destructive' };
  if (daysUntil <= 7) return { color: 'text-warning', label: `Due in ${daysUntil}d`, dot: 'bg-warning' };
  return { color: 'text-muted-foreground', label: `${daysUntil}d`, dot: 'bg-primary' };
}

export function ConnectionTableView({ connections, onConnectionClick }: ConnectionTableViewProps) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Role</TableHead>
            <TableHead className="hidden lg:table-cell">Company</TableHead>
            <TableHead className="hidden sm:table-cell">Location</TableHead>
            <TableHead className="hidden md:table-cell">Warmth</TableHead>
            <TableHead>Follow-up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connections.map((connection) => {
            const followUpStatus = getFollowUpStatus(connection.next_follow_up_at, connection.follow_up_enabled);
            
            return (
              <TableRow
                key={connection.id}
                onClick={() => onConnectionClick(connection.id)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={connection.photo_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(connection.name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{connection.name || 'Unknown'}</span>
                    {connection.is_favorite && (
                      <Star className="w-3 h-3 fill-accent text-accent" />
                    )}
                    <PriorityBadge level={connection.priority} size="sm" />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {connection.profession_or_role || '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {connection.company || '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {connection.location || '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <WarmthBadge level={connection.warmth_level} size="sm" />
                </TableCell>
                <TableCell>
                  {followUpStatus ? (
                    <div className={cn("flex items-center gap-1.5 text-sm", followUpStatus.color)}>
                      <div className={cn("w-2 h-2 rounded-full", followUpStatus.dot)} />
                      {followUpStatus.label}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
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
