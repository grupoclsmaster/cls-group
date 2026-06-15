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
