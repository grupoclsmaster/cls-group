-- Migration: Add foreign key constraint from lesson_comments(user_id) to members(id)
-- This allows PostgREST / Supabase JS client to perform joins between comments and members.

ALTER TABLE public.lesson_comments
  DROP CONSTRAINT IF EXISTS lesson_comments_user_id_members_fkey,
  ADD CONSTRAINT lesson_comments_user_id_members_fkey
  FOREIGN KEY (user_id) REFERENCES public.members(id)
  ON DELETE SET NULL;
