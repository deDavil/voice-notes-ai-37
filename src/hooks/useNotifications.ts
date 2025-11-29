import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Notification, calculateNextFollowUp, FollowUpFrequency } from '@/types/notification';
import { differenceInDays } from 'date-fns';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*, connections(name)')
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Notification[];
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_dismissed', false)
        .eq('is_read', false);

      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_dismissed: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useLogInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      // Get current connection data
      const { data: connection, error: fetchError } = await supabase
        .from('connections')
        .select('follow_up_frequency')
        .eq('id', connectionId)
        .single();

      if (fetchError) throw fetchError;

      const now = new Date();
      const nextFollowUp = calculateNextFollowUp(
        (connection?.follow_up_frequency as FollowUpFrequency) || 'monthly',
        now
      );

      // Update connection
      const { error: updateError } = await supabase
        .from('connections')
        .update({
          last_interaction_at: now.toISOString(),
          next_follow_up_at: nextFollowUp?.toISOString() || null,
        })
        .eq('id', connectionId);

      if (updateError) throw updateError;

      // Dismiss pending follow-up notifications
      const { error: dismissError } = await supabase
        .from('notifications')
        .update({ is_dismissed: true })
        .eq('connection_id', connectionId)
        .eq('type', 'follow_up')
        .eq('is_dismissed', false);

      if (dismissError) throw dismissError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useCheckFollowUpNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const now = new Date();

      // Get connections due for follow-up
      const { data: dueConnections, error: fetchError } = await supabase
        .from('connections')
        .select('*')
        .eq('follow_up_enabled', true)
        .neq('follow_up_frequency', 'none')
        .lte('next_follow_up_at', now.toISOString());

      if (fetchError) throw fetchError;
      if (!dueConnections || dueConnections.length === 0) return;

      for (const connection of dueConnections) {
        // Check if notification already exists
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('connection_id', connection.id)
          .eq('type', 'follow_up')
          .eq('is_dismissed', false)
          .maybeSingle();

        if (!existing) {
          const daysSince = connection.last_interaction_at
            ? differenceInDays(now, new Date(connection.last_interaction_at))
            : differenceInDays(now, new Date(connection.created_at));

          let message = `It's been ${daysSince} days since you last connected.`;
          if (connection.key_interests && connection.key_interests.length > 0) {
            message = `It's been ${daysSince} days. Ask about their ${connection.key_interests[0]}?`;
          }

          await supabase.from('notifications').insert({
            connection_id: connection.id,
            type: 'follow_up',
            title: `Time to reconnect with ${connection.name || 'this contact'}`,
            message,
            action_url: `/connection/${connection.id}`,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
