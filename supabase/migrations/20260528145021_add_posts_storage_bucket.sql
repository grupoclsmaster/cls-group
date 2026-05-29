-- Migration to add storage bucket and policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read on posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert on posts" ON storage.objects;

CREATE POLICY "Public Read on posts" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'posts');

CREATE POLICY "Authenticated Insert on posts" 
    ON storage.objects FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = 'posts');
