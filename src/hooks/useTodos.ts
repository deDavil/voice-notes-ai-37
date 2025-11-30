import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Todo, TodoWithConnection } from '@/types/todo';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export function useTodos() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['todos', user?.id],
    queryFn: async () => {
      const { data: todos, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (todosError) throw todosError;

      // Fetch connection names
      const connectionIds = [...new Set((todos as Todo[]).map(t => t.connection_id))];
      if (connectionIds.length === 0) return [] as TodoWithConnection[];
      
      const { data: connections } = await supabase
        .from('connections')
        .select('id, name')
        .in('id', connectionIds);

      const connectionMap = new Map(connections?.map(c => [c.id, c.name]) || []);

      return (todos as Todo[]).map(todo => ({
        ...todo,
        connection_name: connectionMap.get(todo.connection_id) || null,
      })) as TodoWithConnection[];
    },
    enabled: !!user,
  });
}

export function useTodosByConnection(connectionId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['todos', 'connection', connectionId],
    queryFn: async () => {
      if (!connectionId) return [];
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('connection_id', connectionId)
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!connectionId && !!user,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (todo: { text: string; connection_id: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('todos')
        .insert({ ...todo, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('TO-DO added');
    },
    onError: (error) => {
      console.error('Error creating todo:', error);
      toast.error('Failed to add TO-DO');
    },
  });
}

export function useCreateTodos() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (todos: { text: string; connection_id: string }[]) => {
      if (!user) throw new Error('Not authenticated');
      if (todos.length === 0) return [];
      
      const todosWithUser = todos.map(t => ({ ...t, user_id: user.id }));
      const { data, error } = await supabase
        .from('todos')
        .insert(todosWithUser)
        .select();

      if (error) throw error;
      return data as Todo[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      if (data.length > 0) {
        toast.success(`${data.length} TO-DO${data.length > 1 ? 's' : ''} added`);
      }
    },
    onError: (error) => {
      console.error('Error creating todos:', error);
      toast.error('Failed to add TO-DOs');
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Todo> & { id: string }) => {
      const { data, error } = await supabase
        .from('todos')
        .update({
          ...updates,
          completed_at: updates.is_completed ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      console.error('Error updating todo:', error);
      toast.error('Failed to update TO-DO');
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('TO-DO deleted');
    },
    onError: (error) => {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete TO-DO');
    },
  });
}
