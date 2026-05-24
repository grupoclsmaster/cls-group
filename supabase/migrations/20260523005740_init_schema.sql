-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create custom Enums
DO $$ BEGIN
    CREATE TYPE member_status AS ENUM ('Ativo', 'Inativo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE calendar_event_type AS ENUM ('mentoria', 'atualizacao');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT,
    company TEXT,
    industry TEXT,
    location TEXT,
    initials TEXT,
    img TEXT,
    status member_status DEFAULT 'Ativo',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    deactivated_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create Calendar Events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_type calendar_event_type NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    mentor_name TEXT,
    mentor_role TEXT,
    mentor_avatar TEXT,
    mentor_bio TEXT,
    topic TEXT,
    zoom_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Investment Opportunities table
CREATE TABLE IF NOT EXISTS public.investment_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT,
    description TEXT,
    long_description TEXT,
    image_url TEXT,
    badge TEXT,
    target_irr TEXT,
    min_investment TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Create Resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    format TEXT,
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Create Webhook Logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    email TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Create Todos table (found in page.tsx)
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Setup Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 10. Base Policies (Assuming authenticated users can select, but only admins or specific roles can insert/update)
-- For demonstration, allowing all authenticated users to read everything:

CREATE POLICY "Allow authenticated read on members" 
    ON public.members FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on calendar_events" 
    ON public.calendar_events FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on investment_opportunities" 
    ON public.investment_opportunities FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on projects" 
    ON public.projects FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on resources" 
    ON public.resources FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated read on todos" 
    ON public.todos FOR SELECT 
    TO authenticated 
    USING (true);

-- Allow webhook service to insert logs
CREATE POLICY "Allow insert webhook logs" 
    ON public.webhook_logs FOR INSERT 
    WITH CHECK (true);
