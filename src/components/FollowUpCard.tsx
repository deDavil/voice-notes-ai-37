import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FollowUpConnection, getStatusIndicator, formatDaysAgo } from '@/hooks/useFollowUps';
import { MessageSquare, Check } from 'lucide-react';

interface FollowUpCardProps {
  connection: FollowUpConnection;
  onPrepareMessage: (connection: FollowUpConnection) => void;
  onMarkDone: (connectionId: string) => void;
}

export function FollowUpCard({ connection, onPrepareMessage, onMarkDone }: FollowUpCardProps) {
  const navigate = useNavigate();
  const status = getStatusIndicator(connection.next_follow_up_at);
  const lastContact = formatDaysAgo(connection.last_interaction_at);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">{status.emoji}</span>
            <div className="min-w-0">
              <h3
                className="font-semibold text-foreground hover:text-accent cursor-pointer truncate"
                onClick={() => navigate(`/connection/${connection.id}`)}
              >
                {connection.name || 'Unnamed'}
              </h3>
              {connection.profession_or_role && (
                <p className="text-sm text-muted-foreground truncate">
                  {connection.profession_or_role}
                </p>
              )}
              <p className="text-xs text-muted-foreground/70 mt-1">
                {status.label} · Last contact: {lastContact}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="accent"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onPrepareMessage(connection)}
          >
            <MessageSquare className="w-4 h-4" />
            Prepare Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => onMarkDone(connection.id)}
          >
            <Check className="w-4 h-4" />
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
