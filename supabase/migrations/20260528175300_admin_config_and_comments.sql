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


