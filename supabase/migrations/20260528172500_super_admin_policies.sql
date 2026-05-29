-- Migration to add INSERT, UPDATE, DELETE policies for super admins
-- Super admins are: Magnorjsantos@hotmail.com and mayaracosta00@gmail.com

-- 1. Policies for modules
CREATE POLICY "Allow super admin insert on modules" 
    ON public.modules FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on modules" 
    ON public.modules FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on modules" 
    ON public.modules FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

-- 2. Policies for lessons
CREATE POLICY "Allow super admin insert on lessons" 
    ON public.lessons FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on lessons" 
    ON public.lessons FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on lessons" 
    ON public.lessons FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

-- 3. Policies for resources
CREATE POLICY "Allow super admin insert on resources" 
    ON public.resources FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on resources" 
    ON public.resources FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on resources" 
    ON public.resources FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

-- 4. Policies for calendar_events
CREATE POLICY "Allow super admin insert on calendar_events" 
    ON public.calendar_events FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on calendar_events" 
    ON public.calendar_events FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on calendar_events" 
    ON public.calendar_events FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

-- 5. Policies for investment_opportunities
CREATE POLICY "Allow super admin insert on investment_opportunities" 
    ON public.investment_opportunities FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin update on investment_opportunities" 
    ON public.investment_opportunities FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));

CREATE POLICY "Allow super admin delete on investment_opportunities" 
    ON public.investment_opportunities FOR DELETE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' IN ('Magnorjsantos@hotmail.com', 'mayaracosta00@gmail.com'));
