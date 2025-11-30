-- Create activity_suggestions table
CREATE TABLE public.activity_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
  connection_name TEXT NOT NULL,
  shared_interest TEXT NOT NULL,
  emoji TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for quick lookups
CREATE INDEX idx_activity_suggestions_user ON public.activity_suggestions(user_id, expires_at);
CREATE INDEX idx_activity_suggestions_active ON public.activity_suggestions(user_id, is_dismissed, expires_at);

-- Enable RLS
ALTER TABLE public.activity_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own activity suggestions"
  ON public.activity_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity suggestions"
  ON public.activity_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity suggestions"
  ON public.activity_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity suggestions"
  ON public.activity_suggestions FOR DELETE
  USING (auth.uid() = user_id);