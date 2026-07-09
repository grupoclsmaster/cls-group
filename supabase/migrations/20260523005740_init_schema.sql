-- ==========================================
-- UNIFIED DATABASE SCHEMA - CLUB PRO CLS
-- Generated on 2026-07-09T22:55:45.248Z
-- ==========================================

-- ------------------------------------------
-- Migration: 20260523005740_init_schema.sql
-- ------------------------------------------

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create custom Enums
DO $$ BEGIN
    CREATE TYPE member_status AS ENUM ('Ativo', 'Inativo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE calendar_event_type AS ENUM ('mentoria', 'atualizacao');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT,
    company TEXT,
    industry TEXT,
    location TEXT,
    initials TEXT,
    img TEXT,
    status member_status DEFAULT 'Ativo',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    deactivated_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create Calendar Events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_type calendar_event_type NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    mentor_name TEXT,
    mentor_role TEXT,
    mentor_avatar TEXT,
    mentor_bio TEXT,
    topic TEXT,
    zoom_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Investment Opportunities table
CREATE TABLE IF NOT EXISTS public.investment_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT,
    description TEXT,
    long_description TEXT,
    image_url TEXT,
    badge TEXT,
    target_irr TEXT,
    min_investment TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Create Resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    format TEXT,
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Create Webhook Logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    email TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Create Todos table (found in page.tsx)
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Setup Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 10. Base Policies (Assuming authenticated users can select, but only admins or specific roles can insert/update)
-- For demonstration, allowing all authenticated users to read everything:

CREATE POLICY "Allow authenticated read on members" 
    ON public.members FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on calendar_events" 
    ON public.calendar_events FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on investment_opportunities" 
    ON public.investment_opportunities FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on projects" 
    ON public.projects FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on resources" 
    ON public.resources FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on todos" 
    ON public.todos FOR SELECT 
    TO authenticated 
    USING (true);

-- Allow webhook service to insert logs
CREATE POLICY "Allow insert webhook logs" 
    ON public.webhook_logs FOR INSERT 
    WITH CHECK (true);


-- ------------------------------------------
-- Migration: 20260523020000_masterclasses_schema.sql
-- ------------------------------------------

-- Migration to add Masterclasses: Modules, Lessons, and Progress

-- 1. Create public.modules table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    sequence_order INTEGER DEFAULT 0,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create public.lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    long_description TEXT,
    duration TEXT NOT NULL,
    video_url TEXT,
    thumbnail_url TEXT,
    instructor_name TEXT,
    instructor_role TEXT,
    instructor_avatar TEXT,
    sequence_order INTEGER DEFAULT 0,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create public.user_lesson_progress table
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    watched_seconds INTEGER DEFAULT 0,
    total_seconds INTEGER DEFAULT 0,
    percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies for modules
CREATE POLICY "Allow authenticated read on modules"
    ON public.modules FOR SELECT
    TO authenticated
    USING (true);

-- 6. Create Policies for lessons
CREATE POLICY "Allow authenticated read on lessons"
    ON public.lessons FOR SELECT
    TO authenticated
    USING (true);

-- 7. Create Policies for user_lesson_progress
CREATE POLICY "Allow users to view their own progress"
    ON public.user_lesson_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own progress"
    ON public.user_lesson_progress FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own progress"
    ON public.user_lesson_progress FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ------------------------------------------
-- Migration: 20260523030000_community_feed.sql
-- ------------------------------------------

-- Migration to add Community Feed Posts

CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_role TEXT,
    content TEXT,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    liked_by_users UUID[] DEFAULT '{}'::UUID[], -- Array of user IDs who liked this post
    saved_by_users UUID[] DEFAULT '{}'::UUID[], -- Array of user IDs who saved this post
    comments JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated read on community_posts"
    ON public.community_posts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on community_posts"
    ON public.community_posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow authenticated update on community_posts"
    ON public.community_posts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on community_posts"
    ON public.community_posts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- ------------------------------------------
-- Migration: 20260527191800_member_connections.sql
-- ------------------------------------------

-- Migration to add Member Connections
CREATE TABLE IF NOT EXISTS public.member_connections (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_connection UNIQUE (requester_id, receiver_id),
    CONSTRAINT self_connection_check CHECK (requester_id <> receiver_id)
);

-- Enable RLS
ALTER TABLE public.member_connections ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Allow users to view their own connections"
    ON public.member_connections FOR SELECT
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Insert policy
CREATE POLICY "Allow users to send connection requests"
    ON public.member_connections FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = requester_id);

-- Update policy
CREATE POLICY "Allow users to update their connections"
    ON public.member_connections FOR UPDATE
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Delete policy
CREATE POLICY "Allow users to delete connections"
    ON public.member_connections FOR DELETE
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id);


-- ------------------------------------------
-- Migration: 20260527193500_add_member_bio_and_update_policy.sql
-- ------------------------------------------

-- Migration to add bio column, social URLs, and update policy to members table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS x_url TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS website_url TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'members' AND policyname = 'Allow users to update their own member profile'
    ) THEN
        CREATE POLICY "Allow users to update their own member profile"
            ON public.members FOR UPDATE
            TO authenticated
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;
END
$$;


-- ------------------------------------------
-- Migration: 20260528143526_add_username_to_members.sql
-- ------------------------------------------

-- Migration to add username column to members table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;


-- ------------------------------------------
-- Migration: 20260528144354_add_video_columns_to_posts.sql
-- ------------------------------------------

-- Migration to add video columns to community posts table
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'standard';


-- ------------------------------------------
-- Migration: 20260528145021_add_posts_storage_bucket.sql
-- ------------------------------------------

-- Migration to add storage bucket and policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read on posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert on posts" ON storage.objects;

CREATE POLICY "Public Read on posts" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'posts');

CREATE POLICY "Authenticated Insert on posts" 
    ON storage.objects FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = 'posts');


-- ------------------------------------------
-- Migration: 20260528160623_add_story_views_table.sql
-- ------------------------------------------

-- Migration to add Story Views tracking

CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_story_viewer UNIQUE (story_id, viewer_id)
);

-- Enable RLS
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Policies for story_views
CREATE POLICY "Allow authenticated read on story_views"
    ON public.story_views FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on story_views"
    ON public.story_views FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = viewer_id);


-- ------------------------------------------
-- Migration: 20260528172500_super_admin_policies.sql
-- ------------------------------------------

-- Migration to add INSERT, UPDATE, DELETE policies for super admins
-- Super admins are: magnorjsantos@hotmail.com and mayaracosta00@gmail.com

-- 1. Policies for modules
CREATE POLICY "Allow super admin insert on modules" 
    ON public.modules FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on modules" 
    ON public.modules FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on modules" 
    ON public.modules FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

-- 2. Policies for lessons
CREATE POLICY "Allow super admin insert on lessons" 
    ON public.lessons FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on lessons" 
    ON public.lessons FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on lessons" 
    ON public.lessons FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

-- 3. Policies for resources
CREATE POLICY "Allow super admin insert on resources" 
    ON public.resources FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on resources" 
    ON public.resources FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on resources" 
    ON public.resources FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

-- 4. Policies for calendar_events
CREATE POLICY "Allow super admin insert on calendar_events" 
    ON public.calendar_events FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on calendar_events" 
    ON public.calendar_events FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on calendar_events" 
    ON public.calendar_events FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

-- 5. Policies for investment_opportunities
CREATE POLICY "Allow super admin insert on investment_opportunities" 
    ON public.investment_opportunities FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on investment_opportunities" 
    ON public.investment_opportunities FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on investment_opportunities" 
    ON public.investment_opportunities FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));


-- ------------------------------------------
-- Migration: 20260528175300_admin_config_and_comments.sql
-- ------------------------------------------

-- Migration: Admin config and real comments system
CREATE TABLE IF NOT EXISTS public.lesson_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lesson_comments' AND policyname = 'Allow select for authenticated'
  ) THEN
    CREATE POLICY "Allow select for authenticated" ON public.lesson_comments FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lesson_comments' AND policyname = 'Allow insert for authenticated'
  ) THEN
    CREATE POLICY "Allow insert for authenticated" ON public.lesson_comments FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lesson_comments' AND policyname = 'Allow delete for authenticated owner or admin'
  ) THEN
    CREATE POLICY "Allow delete for authenticated owner or admin" ON public.lesson_comments FOR DELETE TO authenticated USING (
      auth.uid() = user_id OR
      (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com')
    );
  END IF;
END $$;

ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS description text;


ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS sequence_order integer DEFAULT 0;




-- ------------------------------------------
-- Migration: 20260530104800_add_courses_table.sql
-- ------------------------------------------

-- Migration to add Courses table for Masterclasses hierarchy

-- 1. Create public.courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    status TEXT DEFAULT 'rascunho',
    sequence_order INTEGER DEFAULT 0,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Add course_id to public.modules
ALTER TABLE public.modules
ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- 3. Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for courses
CREATE POLICY "Allow authenticated read on courses"
    ON public.courses FOR SELECT
    TO authenticated
    USING (true);

-- Super admin policies are expected to be updated elsewhere, or handled by existing role checks 
-- (Assuming full access is granted through Postgres RLS roles or similar).
-- We'll add basic admin policies similar to how modules might be set up if needed.
CREATE POLICY "Allow admin all operations on courses"
    ON public.courses FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'))
    WITH CHECK (auth.jwt() ->> 'email' IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));


-- ------------------------------------------
-- Migration: 20260601000000_add_member_type.sql
-- ------------------------------------------

-- Migration: Add member_type column and role-based helper function
-- Introduces a proper role system (admin, master, mentor) to replace hardcoded email checks.

-- 1. Create the member_type enum
DO $$ BEGIN
    CREATE TYPE member_type_enum AS ENUM ('admin', 'master', 'mentor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add column member_type to public.members with default 'mentor'
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS member_type member_type_enum DEFAULT 'mentor';

-- 3. Set existing admin users
UPDATE public.members
  SET member_type = 'admin'
  WHERE LOWER(email) IN ('magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com');

-- 4. Create helper function to check the current user's member type (for RLS policies)
CREATE OR REPLACE FUNCTION public.get_member_type()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT member_type::TEXT FROM public.members WHERE id = auth.uid();
$$;

-- 5. Add INSERT policy for members table (admins only can insert new members)
CREATE POLICY "Admins can insert members"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT member_type FROM public.members WHERE id = auth.uid()) = 'admin'
  );


-- ------------------------------------------
-- Migration: 20260601000100_update_rls_for_roles.sql
-- ------------------------------------------

-- Migration: Replace hardcoded email-based RLS policies with role-based policies
-- Uses public.get_member_type() helper function created in 20260601000000_add_member_type.sql

-- ============================================================================
-- SECTION 1: DROP OLD EMAIL-HARDCODED POLICIES
-- ============================================================================

-- From 20260528172500_super_admin_policies.sql — modules
DROP POLICY IF EXISTS "Allow super admin insert on modules" ON public.modules;
DROP POLICY IF EXISTS "Allow super admin update on modules" ON public.modules;
DROP POLICY IF EXISTS "Allow super admin delete on modules" ON public.modules;

-- From 20260528172500_super_admin_policies.sql — lessons
DROP POLICY IF EXISTS "Allow super admin insert on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow super admin update on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow super admin delete on lessons" ON public.lessons;

-- From 20260528172500_super_admin_policies.sql — resources
DROP POLICY IF EXISTS "Allow super admin insert on resources" ON public.resources;
DROP POLICY IF EXISTS "Allow super admin update on resources" ON public.resources;
DROP POLICY IF EXISTS "Allow super admin delete on resources" ON public.resources;

-- From 20260528172500_super_admin_policies.sql — calendar_events
DROP POLICY IF EXISTS "Allow super admin insert on calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow super admin update on calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow super admin delete on calendar_events" ON public.calendar_events;

-- From 20260528172500_super_admin_policies.sql — investment_opportunities
DROP POLICY IF EXISTS "Allow super admin insert on investment_opportunities" ON public.investment_opportunities;
DROP POLICY IF EXISTS "Allow super admin update on investment_opportunities" ON public.investment_opportunities;
DROP POLICY IF EXISTS "Allow super admin delete on investment_opportunities" ON public.investment_opportunities;

-- From 20260528175300_admin_config_and_comments.sql — lesson_comments
DROP POLICY IF EXISTS "Allow delete for authenticated owner or admin" ON public.lesson_comments;

-- From 20260530104800_add_courses_table.sql — courses
DROP POLICY IF EXISTS "Allow admin all operations on courses" ON public.courses;


-- ============================================================================
-- SECTION 2: CREATE NEW ROLE-BASED POLICIES
-- ============================================================================

-- --------------------------------------------------------------------------
-- MODULES: Admin full access (INSERT, UPDATE, DELETE)
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert modules"
  ON public.modules FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update modules"
  ON public.modules FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete modules"
  ON public.modules FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- LESSONS: Admin full access + Mentors/Masters can manage their own lessons
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert lessons"
  ON public.lessons FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update lessons"
  ON public.lessons FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete lessons"
  ON public.lessons FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- Mentors and Masters can insert new lessons
CREATE POLICY "Mentors and masters can insert lessons"
  ON public.lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_member_type() IN ('mentor', 'master')
  );

-- Mentors and Masters can update their own lessons (matched by instructor_name)
CREATE POLICY "Mentors and masters can update own lessons"
  ON public.lessons FOR UPDATE
  TO authenticated
  USING (
    public.get_member_type() IN ('mentor', 'master')
    AND instructor_name = (SELECT name FROM public.members WHERE id = auth.uid())
  )
  WITH CHECK (
    public.get_member_type() IN ('mentor', 'master')
    AND instructor_name = (SELECT name FROM public.members WHERE id = auth.uid())
  );

-- Mentors and Masters can delete their own lessons (matched by instructor_name)
CREATE POLICY "Mentors and masters can delete own lessons"
  ON public.lessons FOR DELETE
  TO authenticated
  USING (
    public.get_member_type() IN ('mentor', 'master')
    AND instructor_name = (SELECT name FROM public.members WHERE id = auth.uid())
  );

-- --------------------------------------------------------------------------
-- COURSES: Admin full access
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert courses"
  ON public.courses FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update courses"
  ON public.courses FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete courses"
  ON public.courses FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- RESOURCES: Admin full access
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert resources"
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update resources"
  ON public.resources FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete resources"
  ON public.resources FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- CALENDAR_EVENTS: Admin full access
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert calendar_events"
  ON public.calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update calendar_events"
  ON public.calendar_events FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete calendar_events"
  ON public.calendar_events FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- INVESTMENT_OPPORTUNITIES: Admin full access
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert investment_opportunities"
  ON public.investment_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update investment_opportunities"
  ON public.investment_opportunities FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete investment_opportunities"
  ON public.investment_opportunities FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- LESSON_COMMENTS: Admin can delete any + owner can delete own
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can delete any comment"
  ON public.lesson_comments FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- Re-create owner delete policy (the old one combined owner + email check, we keep owner separate)
CREATE POLICY "Users can delete own comments"
  ON public.lesson_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ------------------------------------------
-- Migration: 20260601000200_fix_lesson_comments_foreign_key.sql
-- ------------------------------------------

-- Migration: Add foreign key constraint from lesson_comments(user_id) to members(id)
-- This allows PostgREST / Supabase JS client to perform joins between comments and members.

ALTER TABLE public.lesson_comments
  DROP CONSTRAINT IF EXISTS lesson_comments_user_id_members_fkey,
  ADD CONSTRAINT lesson_comments_user_id_members_fkey
  FOREIGN KEY (user_id) REFERENCES public.members(id)
  ON DELETE SET NULL;


-- ------------------------------------------
-- Migration: 20260601000300_create_notifications.sql
-- ------------------------------------------

-- Migration: Create Notifications Table

CREATE TYPE notification_type AS ENUM ('mentoria', 'atualizacao', 'masterclass', 'oportunidade', 'recurso');

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- if null, it's a global notification for everyone
    title TEXT NOT NULL,
    description TEXT,
    type notification_type DEFAULT 'mentoria',
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications, or global notifications (user_id IS NULL)
CREATE POLICY "Allow users to read their own or global notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Users can update their own notifications (e.g. mark as read)
CREATE POLICY "Allow users to update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins and mentors can insert notifications (broad access, let's keep it simple for now, or use get_member_type() if available)
-- Note: the get_member_type() function was added in a previous migration.
CREATE POLICY "Admins and mentors can insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_member_type() IN ('admin', 'mentor')
    );


-- ------------------------------------------
-- Migration: 20260601000400_update_feed_likes.sql
-- ------------------------------------------

-- Migration: Feed Likes & Comment Likes

-- 1. Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- 2. Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id)
);

-- RLS Policies
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Post Likes Policies
CREATE POLICY "Allow authenticated read on post_likes"
    ON public.post_likes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on post_likes"
    ON public.post_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated delete on post_likes"
    ON public.post_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Comment Likes Policies
CREATE POLICY "Allow authenticated read on comment_likes"
    ON public.comment_likes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on comment_likes"
    ON public.comment_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated delete on comment_likes"
    ON public.comment_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- ------------------------------------------
-- Migration: 20260605000000_add_available_at_to_resources.sql
-- ------------------------------------------

-- Add available_at to public.resources table for scheduling
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS available_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;


-- ------------------------------------------
-- Migration: 20260605000100_add_theme_to_members.sql
-- ------------------------------------------

-- Add theme preference column to members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light'));


-- ------------------------------------------
-- Migration: 20260615000000_create_missions.sql
-- ------------------------------------------

-- Migration: Create missions and mission_submissions tables

-- 1. Create missions table
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    has_text_question BOOLEAN DEFAULT false,
    text_question TEXT,
    has_form_link BOOLEAN DEFAULT false,
    form_link TEXT,
    has_file_upload BOOLEAN DEFAULT false,
    file_upload_label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create mission submissions table
CREATE TABLE IF NOT EXISTS public.mission_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    text_answer TEXT,
    form_submitted_link TEXT,
    file_url TEXT,
    file_name TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.members(id) ON DELETE SET NULL,
    UNIQUE (mission_id, student_id)
);

-- 3. Create missions storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('missions', 'missions', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for public.missions
DROP POLICY IF EXISTS "Allow authenticated read on missions" ON public.missions;
CREATE POLICY "Allow authenticated read on missions"
    ON public.missions FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin all on missions" ON public.missions;
CREATE POLICY "Allow admin all on missions"
    ON public.missions FOR ALL
    TO authenticated
    USING (public.get_member_type() = 'admin')
    WITH CHECK (public.get_member_type() = 'admin');

-- 6. RLS Policies for public.mission_submissions
DROP POLICY IF EXISTS "Allow users to read own submissions, admins read all" ON public.mission_submissions;
CREATE POLICY "Allow users to read own submissions, admins read all"
    ON public.mission_submissions FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.get_member_type() = 'admin');

DROP POLICY IF EXISTS "Allow users to insert own submissions" ON public.mission_submissions;
CREATE POLICY "Allow users to insert own submissions"
    ON public.mission_submissions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Allow users to update own submissions" ON public.mission_submissions;
CREATE POLICY "Allow users to update own submissions"
    ON public.mission_submissions FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid() AND status != 'approved')
    WITH CHECK (student_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Allow admins to update all submissions" ON public.mission_submissions;
CREATE POLICY "Allow admins to update all submissions"
    ON public.mission_submissions FOR UPDATE
    TO authenticated
    USING (public.get_member_type() = 'admin')
    WITH CHECK (public.get_member_type() = 'admin');

DROP POLICY IF EXISTS "Allow admins to delete submissions" ON public.mission_submissions;
CREATE POLICY "Allow admins to delete submissions"
    ON public.mission_submissions FOR DELETE
    TO authenticated
    USING (public.get_member_type() = 'admin');

-- 7. Storage Policies for 'missions' bucket
DROP POLICY IF EXISTS "Public Read on missions" ON storage.objects;
CREATE POLICY "Public Read on missions"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'missions');

DROP POLICY IF EXISTS "Authenticated Insert on missions" ON storage.objects;
CREATE POLICY "Authenticated Insert on missions"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'missions');


-- ------------------------------------------
-- Migration: 20260624000000_create_ecosystem_banners.sql
-- ------------------------------------------

-- Migration to add ecosystem_banners table and seed it

CREATE TABLE IF NOT EXISTS public.ecosystem_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    tag TEXT,
    image TEXT NOT NULL,
    cta_text TEXT NOT NULL,
    cta_link TEXT NOT NULL,
    disabled BOOLEAN DEFAULT false,
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ecosystem_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read on ecosystem_banners" ON public.ecosystem_banners;
CREATE POLICY "Allow authenticated read on ecosystem_banners"
    ON public.ecosystem_banners FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can insert ecosystem_banners" ON public.ecosystem_banners;
CREATE POLICY "Admin can insert ecosystem_banners"
    ON public.ecosystem_banners FOR INSERT
    TO authenticated
    WITH CHECK (public.get_member_type() = 'admin');

DROP POLICY IF EXISTS "Admin can update ecosystem_banners" ON public.ecosystem_banners;
CREATE POLICY "Admin can update ecosystem_banners"
    ON public.ecosystem_banners FOR UPDATE
    TO authenticated
    USING (public.get_member_type() = 'admin')
    WITH CHECK (public.get_member_type() = 'admin');

DROP POLICY IF EXISTS "Admin can delete ecosystem_banners" ON public.ecosystem_banners;
CREATE POLICY "Admin can delete ecosystem_banners"
    ON public.ecosystem_banners FOR DELETE
    TO authenticated
    USING (public.get_member_type() = 'admin');

INSERT INTO public.ecosystem_banners (title, subtitle, description, tag, image, cta_text, cta_link, disabled, sequence_order)
VALUES 
('CLUB CLS PRO', 'Programa de Aceleração', 'CLUB CLS PRO é o Master Mind, Mentoria para empresários.', 'FECHADO', '/bg-club-cls-pro.PNG', 'Indisponível no momento', '#', true, 1),
('O Código da Construção', '2ª Edição • Outubro 2026', 'O maior evento de engenharia, negócios e incorporação imobiliária do Brasil está de volta. Garanta sua vaga no lote de pré-lançamento com condições exclusivas.', 'EVENTO PRINCIPAL', '/ocdc2.png', 'Garantir Ingresso', 'https://www.ocodigodaconstrucao.com.br/#planos-2-edicao', false, 2),
('EP30 — Incorporação Imobiliária: Como Transformar Terrenos em Negócios', 'Concreto & Conversa', 'Neste episódio do Concreto & Conversa, discutimos o passo a passo de como estruturar e transformar terrenos em negócios rentáveis na incorporação imobiliária.', 'NOVO EPISÓDIO', 'https://img.youtube.com/vi/QUNkDh4OKfc/maxresdefault.jpg', 'Assistir Agora', 'https://youtu.be/QUNkDh4OKfc', false, 3),
('Saia do improviso.', 'Curso', 'O Manual completo para empresas saírem do "Apaga incêndio" e realmente crescer de forma saudável.', 'CURSO', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200', 'Ver Grade Curricular', '/masterclasses', false, 4),
('CLS Studio', 'Estúdio CLS, Grave seu Podcast', 'Produza seus episódios com estrutura profissional de áudio e vídeo, câmeras 4k, microfones de ponta e suporte técnico completo.', 'CLS STUDIO', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1200', 'Grave seu Podcast', '#studio', false, 5)
ON CONFLICT DO NOTHING;


-- ------------------------------------------
-- Migration: 20260709000000_strict_select_rls.sql
-- ------------------------------------------

-- Migration: Strict Select RLS policies for modules, lessons, and resources
-- Enforces strict visibility checks: non-admins cannot read drafts or future-scheduled items.

-- ==========================================
-- 1. MODULES SELECT POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Allow authenticated read on modules" ON public.modules;
DROP POLICY IF EXISTS "Allow select for authenticated on modules" ON public.modules;

CREATE POLICY "Allow strict select on modules"
    ON public.modules FOR SELECT
    TO authenticated
    USING (
        public.get_member_type() = 'admin'
        OR (
            (status = 'published' OR status = 'publicado')
            AND (scheduled_at IS NULL OR scheduled_at <= now())
        )
    );

-- ==========================================
-- 2. LESSONS SELECT POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Allow authenticated read on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow select for authenticated on lessons" ON public.lessons;

CREATE POLICY "Allow strict select on lessons"
    ON public.lessons FOR SELECT
    TO authenticated
    USING (
        public.get_member_type() = 'admin'
        OR (
            (status = 'published' OR status = 'publicado')
            AND (scheduled_at IS NULL OR scheduled_at <= now())
        )
    );

-- ==========================================
-- 3. RESOURCES SELECT POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Allow authenticated read on resources" ON public.resources;
DROP POLICY IF EXISTS "Allow select for authenticated on resources" ON public.resources;

CREATE POLICY "Allow strict select on resources"
    ON public.resources FOR SELECT
    TO authenticated
    USING (
        public.get_member_type() = 'admin'
        OR (
            available_at IS NULL OR available_at <= now()
        )
    );


