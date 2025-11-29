import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Suggestion, SuggestionWithConnection, SuggestionType } from '@/types/suggestion';
import { toast } from 'sonner';

export function useSuggestions() {
  return useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => {
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('suggestions')
        .select('*')
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (suggestionsError) throw suggestionsError;

      // Fetch connection names
      const connectionIds = [...new Set((suggestions as Suggestion[]).map(s => s.connection_id))];
      const { data: connections } = await supabase
        .from('connections')
        .select('id, name')
        .in('id', connectionIds);

      const connectionMap = new Map(connections?.map(c => [c.id, c.name]) || []);

      return (suggestions as Suggestion[]).map(suggestion => ({
        ...suggestion,
        connection_name: connectionMap.get(suggestion.connection_id) || null,
      })) as SuggestionWithConnection[];
    },
  });
}

export function useSuggestionsByConnection(connectionId: string | undefined) {
  return useQuery({
    queryKey: ['suggestions', 'connection', connectionId],
    queryFn: async () => {
      if (!connectionId) return [];
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('connection_id', connectionId)
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Suggestion[];
    },
    enabled: !!connectionId,
  });
}

export function useCreateSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestion: { text: string; connection_id: string; type: SuggestionType; url?: string }) => {
      const { data, error } = await supabase
        .from('suggestions')
        .insert(suggestion)
        .select()
        .single();

      if (error) throw error;
      return data as Suggestion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      toast.success('Suggestion added');
    },
    onError: (error) => {
      console.error('Error creating suggestion:', error);
      toast.error('Failed to add suggestion');
    },
  });
}

export function useCreateSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestions: { text: string; connection_id: string; type: SuggestionType; url?: string }[]) => {
      if (suggestions.length === 0) return [];
      const { data, error } = await supabase
        .from('suggestions')
        .insert(suggestions)
        .select();

      if (error) throw error;
      return data as Suggestion[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      if (data.length > 0) {
        toast.success(`${data.length} suggestion${data.length > 1 ? 's' : ''} added`);
      }
    },
    onError: (error) => {
      console.error('Error creating suggestions:', error);
      toast.error('Failed to add suggestions');
    },
  });
}

export function useUpdateSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Suggestion> & { id: string }) => {
      const { data, error } = await supabase
        .from('suggestions')
        .update({
          ...updates,
          completed_at: updates.is_completed ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Suggestion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (error) => {
      console.error('Error updating suggestion:', error);
      toast.error('Failed to update suggestion');
    },
  });
}

export function useDeleteSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      toast.success('Suggestion deleted');
    },
    onError: (error) => {
      console.error('Error deleting suggestion:', error);
      toast.error('Failed to delete suggestion');
    },
  });
}
