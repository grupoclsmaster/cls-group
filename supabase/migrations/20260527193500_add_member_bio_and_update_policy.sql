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
