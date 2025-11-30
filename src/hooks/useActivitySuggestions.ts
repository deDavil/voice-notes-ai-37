import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ActivitySuggestion {
  id: string;
  created_at: string;
  expires_at: string;
  user_id: string;
  connection_id: string;
  connection_name: string;
  shared_interest: string;
  emoji: string;
  title: string;
  description: string;
  is_dismissed: boolean;
  dismissed_at: string | null;
}

export function useActivitySuggestions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['activity-suggestions', user?.id],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('activity_suggestions')
        .select('*')
        .eq('is_dismissed', false)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as ActivitySuggestion[];
    },
    enabled: !!user,
  });

  return query;
}

export function useGenerateActivitySuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-activity-suggestions');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-suggestions'] });
    },
    onError: (error) => {
      console.error('Error generating activity suggestions:', error);
      toast.error('Failed to generate activity ideas');
    },
  });
}

export function useDismissActivitySuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from('activity_suggestions')
        .update({ 
          is_dismissed: true,
          dismissed_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-suggestions'] });
    },
    onError: (error) => {
      console.error('Error dismissing suggestion:', error);
      toast.error('Failed to dismiss suggestion');
    },
  });
}

export function getTimeUntilRefresh(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  
  if (diff <= 0) return 'now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h`;
  
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m`;
}
