export interface Notification {
  id: string;
  created_at: string;
  connection_id: string | null;
  type: 'follow_up' | 'event' | 'reminder';
  title: string;
  message: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  action_url: string | null;
  connections?: {
    name: string | null;
  };
}

export type FollowUpFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'none';

export const FREQUENCY_OPTIONS: { value: FollowUpFrequency; label: string; days: number | null }[] = [
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'biweekly', label: 'Bi-weekly', days: 14 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly', days: 90 },
  { value: 'none', label: 'No reminders', days: null }
];

export const FREQUENCY_LABELS: Record<FollowUpFrequency, string> = {
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  monthly: 'Every month',
  quarterly: 'Every 3 months',
  none: 'No reminders'
};

export function getFrequencyDays(frequency: FollowUpFrequency): number | null {
  return FREQUENCY_OPTIONS.find(f => f.value === frequency)?.days ?? null;
}

export function calculateNextFollowUp(frequency: FollowUpFrequency, fromDate: Date = new Date()): Date | null {
  const days = getFrequencyDays(frequency);
  if (!days) return null;
  
  const next = new Date(fromDate);
  next.setDate(next.getDate() + days);
  return next;
}

export function getSuggestedFrequency(relationshipType: string): FollowUpFrequency {
  const frequencyMap: Record<string, FollowUpFrequency> = {
    'client': 'weekly',
    'warm-lead': 'weekly',
    'investor': 'biweekly',
    'collaborator': 'biweekly',
    'founder': 'biweekly',
    'mentor': 'monthly',
    'mentee': 'monthly',
    'professional': 'monthly',
    'personal': 'monthly',
    'networking': 'quarterly',
    'other': 'monthly'
  };
  
  return frequencyMap[relationshipType] || 'monthly';
}
