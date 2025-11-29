import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Connection } from '@/types/connection';

export interface FollowUpConnection extends Connection {
  recentTodos: { id: string; text: string; is_completed: boolean }[];
}

export interface GroupedFollowUps {
  overdue: FollowUpConnection[];
  thisWeek: FollowUpConnection[];
  comingUp: FollowUpConnection[];
}

export function useFollowUps() {
  return useQuery({
    queryKey: ['follow-ups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          todos (
            id,
            text,
            is_completed
          )
        `)
        .eq('follow_up_enabled', true)
        .neq('follow_up_frequency', 'none')
        .not('next_follow_up_at', 'is', null)
        .order('next_follow_up_at', { ascending: true });

      if (error) throw error;

      // Add recent incomplete todos to each connection
      const connectionsWithTodos = (data || []).map(conn => ({
        ...conn,
        recentTodos: (conn.todos || [])
          .filter((t: any) => !t.is_completed)
          .slice(0, 3)
      })) as FollowUpConnection[];

      return groupFollowUps(connectionsWithTodos);
    },
  });
}

function groupFollowUps(connections: FollowUpConnection[]): GroupedFollowUps {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const groups: GroupedFollowUps = {
    overdue: [],
    thisWeek: [],
    comingUp: []
  };

  connections.forEach(conn => {
    if (!conn.next_follow_up_at) return;
    
    const dueDate = new Date(conn.next_follow_up_at);

    if (dueDate < now) {
      groups.overdue.push(conn);
    } else if (dueDate <= weekFromNow) {
      groups.thisWeek.push(conn);
    } else {
      groups.comingUp.push(conn);
    }
  });

  // Sort each group by due date (soonest first)
  groups.overdue.sort((a, b) => 
    new Date(a.next_follow_up_at!).getTime() - new Date(b.next_follow_up_at!).getTime()
  );
  groups.thisWeek.sort((a, b) => 
    new Date(a.next_follow_up_at!).getTime() - new Date(b.next_follow_up_at!).getTime()
  );
  groups.comingUp.sort((a, b) => 
    new Date(a.next_follow_up_at!).getTime() - new Date(b.next_follow_up_at!).getTime()
  );

  return groups;
}

export function getStatusIndicator(nextFollowUp: string | null) {
  if (!nextFollowUp) return { color: 'muted', emoji: '⚪', label: 'No due date' };
  
  const now = new Date();
  const due = new Date(nextFollowUp);
  const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return { 
      color: 'destructive', 
      emoji: '🔴', 
      label: `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} overdue` 
    };
  }
  if (daysUntil === 0) {
    return { color: 'warning', emoji: '🟡', label: 'Due today' };
  }
  if (daysUntil <= 7) {
    return { 
      color: 'warning', 
      emoji: '🟡', 
      label: `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` 
    };
  }
  return { 
    color: 'success', 
    emoji: '🟢', 
    label: `Due in ${daysUntil} days` 
  };
}

export function formatDaysAgo(date: string | null): string {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const then = new Date(date);
  const daysAgo = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return '1 day ago';
  return `${daysAgo} days ago`;
}
