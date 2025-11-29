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
