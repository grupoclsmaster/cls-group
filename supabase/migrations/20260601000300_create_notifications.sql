-- Migration: Create Notifications Table

CREATE TYPE notification_type AS ENUM ('mentoria', 'atualizacao', 'masterclass', 'oportunidade', 'recurso');

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- if null, it's a global notification for everyone
    title TEXT NOT NULL,
    description TEXT,
    type notification_type DEFAULT 'mentoria',
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications, or global notifications (user_id IS NULL)
CREATE POLICY "Allow users to read their own or global notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Users can update their own notifications (e.g. mark as read)
CREATE POLICY "Allow users to update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins and mentors can insert notifications (broad access, let's keep it simple for now, or use get_member_type() if available)
-- Note: the get_member_type() function was added in a previous migration.
CREATE POLICY "Admins and mentors can insert notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_member_type() IN ('admin', 'mentor')
    );
