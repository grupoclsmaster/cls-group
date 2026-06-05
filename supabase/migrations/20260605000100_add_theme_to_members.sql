-- Add theme preference column to members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light'));
