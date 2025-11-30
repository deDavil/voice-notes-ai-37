import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FollowUpConnection } from '@/hooks/useFollowUps';
import { useLogInteraction } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Copy, Check, Briefcase, Target, Coffee, Building2, MapPin, Sparkles, Loader2 } from 'lucide-react';

interface GeneratedMessage {
  type: string;
  label: string;
  text: string | null;
}

interface PrepareMessageModalProps {
  connection: FollowUpConnection | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PrepareMessageModal({ connection, isOpen, onClose }: PrepareMessageModalProps) {
  const [messages, setMessages] = useState<GeneratedMessage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const logInteraction = useLogInteraction();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && connection) {
      generateMessages();
    } else {
      setMessages(null);
    }
  }, [isOpen, connection?.id]);

  const generateMessages = async () => {
    if (!connection) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-followup-messages', {
        body: { connectionId: connection.id }
      });

      if (error) throw error;
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to generate messages:', err);
      toast.error('Failed to generate messages');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleMarkDone = async () => {
    if (!connection) return;
    await logInteraction.mutateAsync(connection.id);
    queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
    toast.success('Follow-up marked as done');
    onClose();
  };

  const handleSnooze = async (days: number) => {
    if (!connection) return;
    
    const snoozeUntil = new Date();
    snoozeUntil.setDate(snoozeUntil.getDate() + days);

    const { error } = await supabase
      .from('connections')
      .update({ next_follow_up_at: snoozeUntil.toISOString() })
      .eq('id', connection.id);

    if (error) {
      toast.error('Failed to snooze');
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
    toast.success(`Snoozed for ${days} days`);
    onClose();
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'professional':
        return <Briefcase className="w-4 h-4" />;
      case 'interest':
        return <Target className="w-4 h-4" />;
      case 'casual':
        return <Coffee className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  if (!connection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prepare Follow-up for {connection.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context Card */}
          <Card className="bg-muted/50">
            <CardContent className="p-3 text-sm space-y-1">
              {connection.profession_or_role && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{connection.profession_or_role}</span>
                </div>
              )}
              {connection.how_we_met && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Met: {connection.how_we_met}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <span className="ml-3 text-muted-foreground">Generating messages...</span>
            </div>
          ) : messages ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Suggested Messages</p>

              {messages.filter(m => m.text).map((message, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      {getMessageIcon(message.type)}
                      <span>{message.label}</span>
                    </div>
                    <p className="text-sm text-foreground mb-3">{message.text}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-accent hover:text-accent"
                      onClick={() => copyToClipboard(message.text!, index)}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="accent"
              className="flex-1"
              onClick={handleMarkDone}
            >
              Mark as Done
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnooze(3)}
            >
              Snooze 3 days
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
