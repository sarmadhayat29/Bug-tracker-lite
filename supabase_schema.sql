-- Supabase Schema for Bug Tracker Lite

-- Create Profiles Table
CREATE TABLE public.profiles (
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  last_seen_at BIGINT,
  created_at BIGINT NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = uid );

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = uid );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = uid );


-- Create Bugs Table
CREATE TABLE public.bugs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'low' | 'medium' | 'high' | 'critical'
  status TEXT NOT NULL, -- 'open' | 'in-progress' | 'resolved' | 'closed'
  platform TEXT NOT NULL, -- 'web' | 'mobile' | 'desktop' | 'backend' | 'other'
  reporter_id UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  image_urls TEXT[] DEFAULT '{}',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Enable RLS for Bugs
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read bugs
CREATE POLICY "Authenticated users can read bugs."
  ON public.bugs FOR SELECT
  TO authenticated
  USING ( true );

-- Allow authenticated users to insert bugs
CREATE POLICY "Authenticated users can insert bugs."
  ON public.bugs FOR INSERT
  TO authenticated
  WITH CHECK ( auth.uid() = reporter_id );

-- Allow authenticated users to update bugs (in a real app you might restrict this to assigned/reporter)
CREATE POLICY "Authenticated users can update bugs."
  ON public.bugs FOR UPDATE
  TO authenticated
  USING ( true );


-- Create Storage Bucket for Bugs (if you haven't created it via UI)
-- Note: You might prefer to do this from the Supabase Storage UI, making sure to mark it "Public"
insert into storage.buckets (id, name, public)
values ('bugs', 'bugs', true) on conflict do nothing;

create policy "Bugs Images Public Access"
on storage.objects for select
using ( bucket_id = 'bugs' );

create policy "Authenticated Users can upload bug images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'bugs' );

-- Enable Realtime for the Bugs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bugs;

-- Create Storage Bucket for Downloads
INSERT INTO storage.buckets (id, name, public)
VALUES ('downloads', 'downloads', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy for Downloads Storage Bucket
DROP POLICY IF EXISTS "Downloads Public Read Access" ON storage.objects;
CREATE POLICY "Downloads Public Read Access" ON storage.objects FOR SELECT TO public USING ( bucket_id = 'downloads' );

/*
===================================================================
Supabase Storage CORS Configuration Instructions:
-------------------------------------------------------------------
To configure CORS (Cross-Origin Resource Sharing) for Supabase Storage:

1. Via Supabase Dashboard:
   - Go to Project Settings -> Storage -> CORS Configuration.
   - Add/edit CORS rules to allow cross-origin requests for app downloads:
     - Allowed Origins: * (or specific domain e.g., http://localhost:3000)
     - Allowed Methods: GET, HEAD, OPTIONS
     - Allowed Headers: *
     - Max Age (seconds): 3600

2. Via Supabase CLI / config.toml (Local Development):
   - In supabase/config.toml under [storage]:
     [storage.buckets.downloads]
     public = true
     file_size_limit = "100MiB"
     allowed_mime_types = [
       "application/vnd.android.package-archive",
       "application/x-msdownload",
       "application/zip"
     ]

3. Verification via HTTP OPTIONS Request:
   - Run curl command to test preflight response:
     curl -i -X OPTIONS "https://<PROJECT_REF>.supabase.co/storage/v1/object/public/downloads/builds/Android.apk" \
       -H "Origin: http://localhost:3000" \
       -H "Access-Control-Request-Method: GET"
===================================================================
*/

