-- =============================================
-- VAULT SETTINGS TABLE
-- =============================================
-- This stores user-specific vault settings like PIN

-- Create vault_settings table
CREATE TABLE IF NOT EXISTS vault_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vault_settings_user_id ON vault_settings(user_id);

-- Enable RLS
ALTER TABLE vault_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own vault settings"
ON vault_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vault settings"
ON vault_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault settings"
ON vault_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FIX VAULT TABLE SCHEMA
-- =============================================
-- Ensure vault table has the correct columns

-- Add label column if it doesn't exist (rename from title if needed)
DO $$
BEGIN
  -- Check if 'title' column exists and 'label' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vault' AND column_name = 'title')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vault' AND column_name = 'label') THEN
    ALTER TABLE vault RENAME COLUMN title TO label;
  END IF;
  
  -- Check if 'encrypted_content' column exists and 'data_encrypted' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vault' AND column_name = 'encrypted_content')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vault' AND column_name = 'data_encrypted') THEN
    ALTER TABLE vault RENAME COLUMN encrypted_content TO data_encrypted;
  END IF;
  
  -- Add label column if neither exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vault' AND column_name = 'label') THEN
    ALTER TABLE vault ADD COLUMN label TEXT NOT NULL DEFAULT 'Untitled';
  END IF;
  
  -- Add data_encrypted column if neither exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vault' AND column_name = 'data_encrypted') THEN
    ALTER TABLE vault ADD COLUMN data_encrypted TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- =============================================
-- FIX DOCUMENTS TABLE SCHEMA
-- =============================================
-- Ensure documents table has the correct columns

DO $$
BEGIN
  -- Check if 'name' column exists and 'file_name' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_name') THEN
    ALTER TABLE documents RENAME COLUMN name TO file_name;
  END IF;
  
  -- Check if 'file_path' column exists and 'file_url' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_path')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_url') THEN
    ALTER TABLE documents RENAME COLUMN file_path TO file_url;
  END IF;
  
  -- Check if 'mime_type' column exists and 'file_type' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'mime_type')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_type') THEN
    ALTER TABLE documents RENAME COLUMN mime_type TO file_type;
  END IF;
  
  -- Check if 'created_at' column exists and 'uploaded_at' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'created_at')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'uploaded_at') THEN
    ALTER TABLE documents RENAME COLUMN created_at TO uploaded_at;
  END IF;
  
  -- Add file_name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_name') THEN
    ALTER TABLE documents ADD COLUMN file_name TEXT NOT NULL DEFAULT 'Untitled';
  END IF;
  
  -- Add file_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_url') THEN
    ALTER TABLE documents ADD COLUMN file_url TEXT NOT NULL DEFAULT '';
  END IF;
  
  -- Add file_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_type') THEN
    ALTER TABLE documents ADD COLUMN file_type TEXT NOT NULL DEFAULT 'application/octet-stream';
  END IF;
  
  -- Add uploaded_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'uploaded_at') THEN
    ALTER TABLE documents ADD COLUMN uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;
