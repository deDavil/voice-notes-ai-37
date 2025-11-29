-- Add new columns to connections table for expanded fields
ALTER TABLE connections ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS introduced_by TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS how_i_can_help TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS how_they_can_help TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS warmth_level TEXT DEFAULT 'neutral';
ALTER TABLE connections ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Create bucket for profile photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('connection-photos', 'connection-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to photos
CREATE POLICY "Public read access for connection photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'connection-photos');

-- Allow uploads to connection photos bucket
CREATE POLICY "Allow uploads to connection photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'connection-photos');

-- Allow updates to connection photos
CREATE POLICY "Allow updates to connection photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'connection-photos');

-- Allow deletes from connection photos
CREATE POLICY "Allow deletes from connection photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'connection-photos');