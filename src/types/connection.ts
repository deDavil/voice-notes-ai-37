import { FollowUpFrequency } from './notification';

export interface Connection {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  how_we_met: string | null;
  profession_or_role: string | null;
  key_interests: string[];
  important_facts: string[];
  relationship_type: string;
  tags: string[];
  follow_up_actions: string[];
  additional_notes: string | null;
  original_transcription: string | null;
  is_favorite: boolean;
  follow_up_frequency: FollowUpFrequency;
  last_interaction_at: string | null;
  next_follow_up_at: string | null;
  follow_up_enabled: boolean;
  // New expanded fields
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  birthday: string | null;
  company: string | null;
  company_website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  introduced_by: string | null;
  how_i_can_help: string | null;
  how_they_can_help: string | null;
  warmth_level: WarmthLevel;
  priority: PriorityLevel;
}

export interface ExtractedData {
  name: string | null;
  how_we_met: string | null;
  profession_or_role: string | null;
  key_interests: string[];
  important_facts: string[];
  relationship_type: string;
  suggested_tags: string[];
  follow_up_actions: string[];
  additional_context: string | null;
}

export type RelationshipType = 'professional' | 'personal' | 'networking' | 'other';
export type WarmthLevel = 'cold' | 'neutral' | 'warm' | 'hot';
export type PriorityLevel = 'low' | 'normal' | 'high' | 'vip';

export const WARMTH_OPTIONS = [
  { value: 'cold', label: 'Cold', emoji: '🧊' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'warm', label: 'Warm', emoji: '🔥' },
  { value: 'hot', label: 'Hot', emoji: '⚡' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'vip', label: 'VIP', emoji: '⭐' },
] as const;
