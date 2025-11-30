import { Connection } from '@/types/connection';
import { ConnectionCard } from '@/components/connections/ConnectionCard';

interface ConnectionListViewProps {
  connections: Connection[];
  onConnectionClick: (id: string) => void;
  userProfile?: any;
}

export function ConnectionListView({ 
  connections, 
  onConnectionClick,
}: ConnectionListViewProps) {
  return (
    <div className="space-y-2">
      {connections.map((connection) => (
        <ConnectionCard
          key={connection.id}
          connection={connection}
          onClick={() => onConnectionClick(connection.id)}
          variant="default"
        />
      ))}
    </div>
  );
}
