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
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'))
    WITH CHECK (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));
