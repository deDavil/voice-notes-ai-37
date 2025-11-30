import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FollowUpConnection } from '@/hooks/useFollowUps';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Clipboard, Check, Briefcase, Target, Coffee, Building2, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { calculateNextFollowUp, FollowUpFrequency, getFrequencyDays } from '@/types/notification';
import { cn } from '@/lib/utils';

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
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && connection) {
      generateMessages();
    } else {
      setMessages(null);
      setCopiedIndex(null);
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
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleMarkDone = async () => {
    if (!connection) return;
    
    setIsMarkingDone(true);
    try {
      // Get current connection data for frequency
      const { data: connData, error: fetchError } = await supabase
        .from('connections')
        .select('follow_up_frequency')
        .eq('id', connection.id)
        .single();

      if (fetchError) throw fetchError;

      const frequency = (connData?.follow_up_frequency as FollowUpFrequency) || 'monthly';
      const now = new Date();
      const nextFollowUp = calculateNextFollowUp(frequency, now);
      const days = getFrequencyDays(frequency);

      // Update connection
      const { error: updateError } = await supabase
        .from('connections')
        .update({
          last_interaction_at: now.toISOString(),
          next_follow_up_at: nextFollowUp?.toISOString() || null,
        })
        .eq('id', connection.id);

      if (updateError) throw updateError;

      // Dismiss pending follow-up notifications
      await supabase
        .from('notifications')
        .update({ is_dismissed: true })
        .eq('connection_id', connection.id)
        .eq('type', 'follow_up')
        .eq('is_dismissed', false);

      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Show success toast with next reminder info
      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="font-medium">Follow-up completed!</p>
            <p className="text-sm text-muted-foreground">
              Next reminder for {connection.name} in {days} days
            </p>
          </div>
        </div>,
        { duration: 4000 }
      );
      
      onClose();
    } catch (err) {
      console.error('Failed to mark done:', err);
      toast.error('Failed to mark as done');
    } finally {
      setIsMarkingDone(false);
    }
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
              {connection.tags && connection.tags.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>{connection.tags.slice(0, 3).join(', ')}</span>
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
                <MessageOption
                  key={index}
                  message={message}
                  icon={getMessageIcon(message.type)}
                  isCopied={copiedIndex === index}
                  onCopy={() => copyToClipboard(message.text!, index)}
                />
              ))}
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="accent"
              className="flex-1"
              onClick={handleMarkDone}
              disabled={isMarkingDone}
            >
              {isMarkingDone ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                "Mark as Done - I've reached out"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnooze(3)}
              disabled={isMarkingDone}
            >
              Snooze 3 days
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Message option with inline copy icon
interface MessageOptionProps {
  message: GeneratedMessage;
  icon: React.ReactNode;
  isCopied: boolean;
  onCopy: () => void;
}

function MessageOption({ message, icon, isCopied, onCopy }: MessageOptionProps) {
  return (
    <Card className="border-border hover:border-border/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {icon}
            <span>{message.label}</span>
          </div>
          
          {/* Copy Icon */}
          <button
            onClick={onCopy}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              isCopied 
                ? "text-success" 
                : "text-muted-foreground hover:text-primary hover:bg-muted"
            )}
            title={isCopied ? 'Copied!' : 'Copy message'}
          >
            {isCopied ? (
              <span className="flex items-center gap-1 text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                Copied!
              </span>
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <p className="text-sm text-foreground leading-relaxed">{message.text}</p>
      </CardContent>
    </Card>
  );
}
