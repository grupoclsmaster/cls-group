-- Migration to add username column to members table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
