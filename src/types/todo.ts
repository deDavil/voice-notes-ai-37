export interface Todo {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  connection_id: string;
  text: string;
  is_completed: boolean;
  completed_at: string | null;
}

export interface TodoWithConnection extends Todo {
  connection_name: string | null;
}

export interface ExtractedTodo {
  text: string;
  context?: string;
}
