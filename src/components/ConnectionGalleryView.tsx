import { Connection } from '@/types/connection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionGalleryViewProps {
  connections: Connection[];
  onConnectionClick: (id: string) => void;
  userProfile?: any;
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

export function ConnectionGalleryView({ 
  connections, 
  onConnectionClick,
}: ConnectionGalleryViewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {connections.map((connection) => (
        <div
          key={connection.id}
          onClick={() => onConnectionClick(connection.id)}
          className={cn(
            "group bg-card rounded-xl border border-border p-4 cursor-pointer transition-all duration-200",
            "hover:shadow-card-hover hover:border-border/80",
            "flex flex-col items-center text-center"
          )}
        >
          <div className="relative mb-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={connection.photo_url || undefined} alt={connection.name || ''} />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-medium text-sm">
                {getInitials(connection.name)}
              </AvatarFallback>
            </Avatar>
            {connection.is_favorite && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-foreground text-sm truncate w-full mb-0.5">
            {connection.name || 'Unknown'}
          </h3>
          
          <p className="text-xs text-muted-foreground truncate w-full mb-2">
            {connection.profession_or_role || connection.company || 'No details'}
          </p>
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0 h-4 capitalize border font-normal",
              relationshipColors[connection.relationship_type] || relationshipColors.other
            )}
          >
            {connection.relationship_type}
          </Badge>
        </div>
      ))}
    </div>
  );
}
