-- Run this in Supabase SQL Editor to add new profile fields
-- Go to: https://supabase.com/dashboard/project/jllzfxehjhtvvkaiasll/sql/new

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS bio           TEXT,
    ADD COLUMN IF NOT EXISTS college       TEXT,
    ADD COLUMN IF NOT EXISTS department    TEXT,
    ADD COLUMN IF NOT EXISTS year          TEXT,
    ADD COLUMN IF NOT EXISTS roll_number   TEXT,
    ADD COLUMN IF NOT EXISTS phone         TEXT,
    ADD COLUMN IF NOT EXISTS linkedin      TEXT,
    ADD COLUMN IF NOT EXISTS instagram     TEXT,
    ADD COLUMN IF NOT EXISTS website       TEXT,
    ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT NOW();

-- Create avatars storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
CREATE POLICY IF NOT EXISTS "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view avatars (public bucket)
CREATE POLICY IF NOT EXISTS "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update/delete their own avatar
CREATE POLICY IF NOT EXISTS "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
