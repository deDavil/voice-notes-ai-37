export type SuggestionType = 'book' | 'podcast' | 'article' | 'tool' | 'course' | 'other';

export interface Suggestion {
  id: string;
  created_at: string;
  updated_at: string;
  connection_id: string;
  text: string;
  type: SuggestionType;
  url: string | null;
  is_completed: boolean;
  completed_at: string | null;
}

export interface SuggestionWithConnection extends Suggestion {
  connection_name: string | null;
}

export interface ExtractedSuggestion {
  text: string;
  type: SuggestionType;
  context?: string;
}

export const suggestionTypeIcons: Record<SuggestionType, string> = {
  book: '📚',
  podcast: '🎧',
  article: '📄',
  tool: '🔧',
  course: '🎓',
  other: '💡',
};

export const suggestionTypeLabels: Record<SuggestionType, string> = {
  book: 'Book',
  podcast: 'Podcast',
  article: 'Article',
  tool: 'Tool',
  course: 'Course',
  other: 'Other',
};
