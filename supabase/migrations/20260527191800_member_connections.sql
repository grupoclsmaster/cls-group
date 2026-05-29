-- Migration to add Member Connections
CREATE TABLE IF NOT EXISTS public.member_connections (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_connection UNIQUE (requester_id, receiver_id),
    CONSTRAINT self_connection_check CHECK (requester_id <> receiver_id)
);

-- Enable RLS
ALTER TABLE public.member_connections ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Allow users to view their own connections"
    ON public.member_connections FOR SELECT
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Insert policy
CREATE POLICY "Allow users to send connection requests"
    ON public.member_connections FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = requester_id);

-- Update policy
CREATE POLICY "Allow users to update their connections"
    ON public.member_connections FOR UPDATE
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Delete policy
CREATE POLICY "Allow users to delete connections"
    ON public.member_connections FOR DELETE
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
