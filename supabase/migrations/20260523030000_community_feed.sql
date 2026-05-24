-- Migration to add Community Feed Posts

CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_role TEXT,
    content TEXT,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    liked_by_users UUID[] DEFAULT '{}'::UUID[], -- Array of user IDs who liked this post
    saved_by_users UUID[] DEFAULT '{}'::UUID[], -- Array of user IDs who saved this post
    comments JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated read on community_posts"
    ON public.community_posts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on community_posts"
    ON public.community_posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow authenticated update on community_posts"
    ON public.community_posts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on community_posts"
    ON public.community_posts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
