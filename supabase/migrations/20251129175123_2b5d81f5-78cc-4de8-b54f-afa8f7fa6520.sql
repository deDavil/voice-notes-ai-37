-- Add follow-up columns to connections table
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS follow_up_frequency TEXT DEFAULT 'monthly';
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS follow_up_enabled BOOLEAN DEFAULT TRUE;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow_up', 'event', 'reminder')),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  action_url TEXT
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for notifications
CREATE POLICY "Allow all operations on notifications"
ON public.notifications
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes for notifications
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_dismissed ON public.notifications(is_dismissed);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_connection ON public.notifications(connection_id);

-- Update existing connections to have next_follow_up_at based on their created_at
UPDATE public.connections
SET next_follow_up_at = created_at + INTERVAL '30 days'
WHERE next_follow_up_at IS NULL;