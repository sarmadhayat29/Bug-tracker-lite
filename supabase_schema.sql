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
