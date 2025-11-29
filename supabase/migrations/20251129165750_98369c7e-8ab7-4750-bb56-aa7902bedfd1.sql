-- Create todos table
CREATE TABLE public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create suggestions table
CREATE TABLE public.suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_todos_connection ON public.todos(connection_id);
CREATE INDEX idx_todos_completed ON public.todos(is_completed);
CREATE INDEX idx_suggestions_connection ON public.suggestions(connection_id);
CREATE INDEX idx_suggestions_type ON public.suggestions(type);
CREATE INDEX idx_suggestions_completed ON public.suggestions(is_completed);

-- Enable RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for todos (public access for now, matching connections table)
CREATE POLICY "Allow all operations on todos" ON public.todos FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for suggestions (public access for now, matching connections table)
CREATE POLICY "Allow all operations on suggestions" ON public.suggestions FOR ALL USING (true) WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suggestions_updated_at
  BEFORE UPDATE ON public.suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();