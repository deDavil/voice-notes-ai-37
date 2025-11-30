-- Remove public write access policies (security risk - allows anonymous modifications)
DROP POLICY IF EXISTS "Allow uploads to connection photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to connection photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from connection photos" ON storage.objects;

-- Also remove duplicate public SELECT policy (keeping "Anyone can view connection photos")
DROP POLICY IF EXISTS "Public read access for connection photos" ON storage.objects;