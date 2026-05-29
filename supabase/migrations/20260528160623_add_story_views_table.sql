-- Migration to add Story Views tracking

CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_story_viewer UNIQUE (story_id, viewer_id)
);

-- Enable RLS
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Policies for story_views
CREATE POLICY "Allow authenticated read on story_views"
    ON public.story_views FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on story_views"
    ON public.story_views FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = viewer_id);
