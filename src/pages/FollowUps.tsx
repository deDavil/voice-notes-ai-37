import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { FollowUpCard } from '@/components/FollowUpCard';
import { PrepareMessageModal } from '@/components/PrepareMessageModal';
import { useFollowUps, FollowUpConnection } from '@/hooks/useFollowUps';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CalendarCheck, PartyPopper, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { calculateNextFollowUp, FollowUpFrequency } from '@/types/notification';

export default function FollowUps() {
  const { data: groups, isLoading } = useFollowUps();
  const [selectedConnection, setSelectedConnection] = useState<FollowUpConnection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handlePrepareMessage = (connection: FollowUpConnection) => {
    setSelectedConnection(connection);
    setIsModalOpen(true);
  };

  const handleMarkDone = async (connectionId: string) => {
    const { data: connection } = await supabase
      .from('connections')
      .select('follow_up_frequency')
      .eq('id', connectionId)
      .single();

    if (connection) {
      const now = new Date();
      const nextFollowUp = calculateNextFollowUp(connection.follow_up_frequency as FollowUpFrequency, now);

      await supabase
        .from('connections')
        .update({
          last_interaction_at: now.toISOString(),
          next_follow_up_at: nextFollowUp?.toISOString() || null
        })
        .eq('id', connectionId);

      await supabase
        .from('notifications')
        .update({ is_dismissed: true })
        .eq('connection_id', connectionId)
        .eq('type', 'follow_up')
        .eq('is_dismissed', false);
    }

    queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
    queryClient.invalidateQueries({ queryKey: ['connections'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    toast.success('Follow-up marked as done');
  };

  const totalCount = groups 
    ? groups.overdue.length + groups.thisWeek.length + groups.comingUp.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                AI Rolodex
              </h1>
              <p className="text-sm text-muted-foreground">
                Remember everyone you meet
              </p>
            </div>
          </div>
        </div>
      </header>
      <Navigation />

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarCheck className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground">Follow-ups Due</h1>
          </div>
          <p className="text-muted-foreground">
            Stay connected with the people who matter
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <PartyPopper className="w-12 h-12 text-accent" />
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
              You're all caught up!
            </h2>

            <p className="text-muted-foreground text-center max-w-sm mb-8">
              No follow-ups due right now. Great job staying connected with your network.
            </p>

            <Button variant="outline" asChild>
              <Link to="/">View All Connections</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overdue Section */}
            {groups && groups.overdue.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2">
                  <span className="text-lg">🔴</span>
                  Overdue ({groups.overdue.length})
                </h2>
                <div className="space-y-3">
                  {groups.overdue.map(connection => (
                    <FollowUpCard
                      key={connection.id}
                      connection={connection}
                      onPrepareMessage={handlePrepareMessage}
                      onMarkDone={handleMarkDone}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* This Week Section */}
            {groups && groups.thisWeek.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-lg">🟡</span>
                  This Week ({groups.thisWeek.length})
                </h2>
                <div className="space-y-3">
                  {groups.thisWeek.map(connection => (
                    <FollowUpCard
                      key={connection.id}
                      connection={connection}
                      onPrepareMessage={handlePrepareMessage}
                      onMarkDone={handleMarkDone}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Coming Up Section */}
            {groups && groups.comingUp.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-lg">🟢</span>
                  Coming Up ({groups.comingUp.length})
                </h2>
                <div className="space-y-3">
                  {groups.comingUp.map(connection => (
                    <FollowUpCard
                      key={connection.id}
                      connection={connection}
                      onPrepareMessage={handlePrepareMessage}
                      onMarkDone={handleMarkDone}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <PrepareMessageModal
        connection={selectedConnection}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedConnection(null);
        }}
      />
    </div>
  );
}
