-- Migration: Feed Likes & Comment Likes

-- 1. Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- 2. Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_comment_like UNIQUE (comment_id, user_id)
);

-- RLS Policies
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Post Likes Policies
CREATE POLICY "Allow authenticated read on post_likes"
    ON public.post_likes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on post_likes"
    ON public.post_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated delete on post_likes"
    ON public.post_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Comment Likes Policies
CREATE POLICY "Allow authenticated read on comment_likes"
    ON public.comment_likes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on comment_likes"
    ON public.comment_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated delete on comment_likes"
    ON public.comment_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
