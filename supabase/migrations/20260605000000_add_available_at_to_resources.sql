-- Add available_at to public.resources table for scheduling
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS available_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
