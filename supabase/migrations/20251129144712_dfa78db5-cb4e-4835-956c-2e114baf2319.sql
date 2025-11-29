-- Create connections table for storing people the user meets
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT,
  how_we_met TEXT,
  profession_or_role TEXT,
  key_interests TEXT[] DEFAULT '{}',
  important_facts TEXT[] DEFAULT '{}',
  relationship_type TEXT DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  follow_up_actions TEXT[] DEFAULT '{}',
  additional_notes TEXT,
  original_transcription TEXT,
  is_favorite BOOLEAN DEFAULT false
);

-- Enable Row Level Security (public for MVP, no auth)
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (MVP without auth)
CREATE POLICY "Allow all operations on connections" 
ON public.connections 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();