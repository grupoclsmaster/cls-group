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
