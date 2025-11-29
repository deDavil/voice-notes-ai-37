import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Connection } from '@/types/connection';
import { toast } from 'sonner';

export function useConnections() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Connection[];
    },
  });
}

export function useConnection(id: string | undefined) {
  return useQuery({
    queryKey: ['connection', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Connection | null;
    },
    enabled: !!id,
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connection: Omit<Connection, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('connections')
        .insert(connection)
        .select()
        .single();

      if (error) throw error;
      return data as Connection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection saved successfully');
    },
    onError: (error) => {
      console.error('Error creating connection:', error);
      toast.error('Failed to save connection');
    },
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Connection> & { id: string }) => {
      const { data, error } = await supabase
        .from('connections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Connection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection', data.id] });
      toast.success('Connection updated successfully');
    },
    onError: (error) => {
      console.error('Error updating connection:', error);
      toast.error('Failed to update connection');
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection deleted');
    },
    onError: (error) => {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection');
    },
  });
}
