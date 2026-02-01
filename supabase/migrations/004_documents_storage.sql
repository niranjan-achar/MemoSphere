-- =============================================
-- DOCUMENTS STORAGE SETUP
-- =============================================
-- This sets up Supabase Storage bucket for documents

-- Note: Storage buckets are created through Supabase Dashboard or API
-- This file contains the SQL policies for the documents bucket

-- Enable storage if not already enabled
-- (This is typically done automatically in Supabase)

-- Create RLS policies for documents bucket
-- These policies control access to files in the storage bucket

-- Policy: Users can upload their own files
CREATE POLICY "Users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own files  
CREATE POLICY "Users can view their documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- MANUAL STEPS REQUIRED IN SUPABASE DASHBOARD:
-- =============================================
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Create a new bucket named: documents
-- 3. Set bucket to Public or Private based on your needs:
--    - Public: Files accessible via public URL
--    - Private: Files require authentication
-- 4. Enable RLS on the bucket
-- 5. Set max file size (recommended: 50MB)
-- 6. Allowed MIME types (recommended):
--    - application/pdf
--    - image/*
--    - application/msword
--    - application/vnd.openxmlformats-officedocument.*
--    - application/vnd.ms-excel
--    - application/vnd.ms-powerpoint
--    - text/plain
--    - application/zip
--    - application/x-rar-compressed
-- =============================================
