-- Add DELETE policy for profiles table (GDPR/CCPA compliance)
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Add storage policies for connection-photos bucket
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'connection-photos');

CREATE POLICY "Authenticated users can update their photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'connection-photos');

CREATE POLICY "Authenticated users can delete their photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'connection-photos');

CREATE POLICY "Anyone can view connection photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'connection-photos');