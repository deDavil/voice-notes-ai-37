-- Migrate existing key_interests to tags (merge them)
UPDATE connections
SET tags = (
  SELECT array_agg(DISTINCT t)
  FROM unnest(array_cat(COALESCE(tags, '{}'), COALESCE(key_interests, '{}'))) AS t
)
WHERE key_interests IS NOT NULL AND array_length(key_interests, 1) > 0;

-- Drop the key_interests column
ALTER TABLE connections DROP COLUMN IF EXISTS key_interests;