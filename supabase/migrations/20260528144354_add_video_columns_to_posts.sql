-- Migration to add video columns to community posts table
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'standard';
