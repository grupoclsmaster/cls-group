-- Migration: Replace hardcoded email-based RLS policies with role-based policies
-- Uses public.get_member_type() helper function created in 20260601000000_add_member_type.sql

-- ============================================================================
-- SECTION 1: DROP OLD EMAIL-HARDCODED POLICIES
-- ============================================================================

-- From 20260528172500_super_admin_policies.sql — modules
DROP POLICY IF EXISTS "Allow super admin insert on modules" ON public.modules;
DROP POLICY IF EXISTS "Allow super admin update on modules" ON public.modules;
DROP POLICY IF EXISTS "Allow super admin delete on modules" ON public.modules;

-- From 20260528172500_super_admin_policies.sql — lessons
DROP POLICY IF EXISTS "Allow super admin insert on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow super admin update on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow super admin delete on lessons" ON public.lessons;

-- From 20260528172500_super_admin_policies.sql — resources
DROP POLICY IF EXISTS "Allow super admin insert on resources" ON public.resources;
DROP POLICY IF EXISTS "Allow super admin update on resources" ON public.resources;
DROP POLICY IF EXISTS "Allow super admin delete on resources" ON public.resources;

-- From 20260528172500_super_admin_policies.sql — calendar_events
DROP POLICY IF EXISTS "Allow super admin insert on calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow super admin update on calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow super admin delete on calendar_events" ON public.calendar_events;

-- From 20260528172500_super_admin_policies.sql — investment_opportunities
DROP POLICY IF EXISTS "Allow super admin insert on investment_opportunities" ON public.investment_opportunities;
DROP POLICY IF EXISTS "Allow super admin update on investment_opportunities" ON public.investment_opportunities;
DROP POLICY IF EXISTS "Allow super admin delete on investment_opportunities" ON public.investment_opportunities;

-- From 20260528175300_admin_config_and_comments.sql — lesson_comments
DROP POLICY IF EXISTS "Allow delete for authenticated owner or admin" ON public.lesson_comments;

-- From 20260530104800_add_courses_table.sql — courses
DROP POLICY IF EXISTS "Allow admin all operations on courses" ON public.courses;


-- ============================================================================
-- SECTION 2: CREATE NEW ROLE-BASED POLICIES
-- ============================================================================

-- --------------------------------------------------------------------------
-- MODULES: Admin full access (INSERT, UPDATE, DELETE)
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert modules"
  ON public.modules FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update modules"
  ON public.modules FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete modules"
  ON public.modules FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- LESSONS: Admin full access + Mentors/Masters can manage their own lessons
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert lessons"
  ON public.lessons FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update lessons"
  ON public.lessons FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete lessons"
  ON public.lessons FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- Mentors and Masters can insert new lessons
CREATE POLICY "Mentors and masters can insert lessons"
  ON public.lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_member_type() IN ('mentor', 'master')
  );

-- Mentors and Masters can update their own lessons (matched by instructor_name)
CREATE POLICY "Mentors and masters can update own lessons"
  ON public.lessons FOR UPDATE
  TO authenticated
  USING (
    public.get_member_type() IN ('mentor', 'master')
    AND instructor_name = (SELECT name FROM public.members WHERE id = auth.uid())
  )
  WITH CHECK (
    public.get_member_type() IN ('mentor', 'master')
    AND instructor_name = (SELECT name FROM public.members WHERE id = auth.uid())
  );

-- Mentors and Masters can delete their own lessons (matched by instructor_name)
CREATE POLICY "Mentors and masters can delete own lessons"
  ON public.lessons FOR DELETE
  TO authenticated
  USING (
    public.get_member_type() IN ('mentor', 'master')
    AND instructor_name = (SELECT name FROM public.members WHERE id = auth.uid())
  );

-- --------------------------------------------------------------------------
-- COURSES: Admin full access
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert courses"
  ON public.courses FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update courses"
  ON public.courses FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete courses"
  ON public.courses FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- RESOURCES: Admin full access
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert resources"
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update resources"
  ON public.resources FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete resources"
  ON public.resources FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- CALENDAR_EVENTS: Admin full access
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert calendar_events"
  ON public.calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update calendar_events"
  ON public.calendar_events FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete calendar_events"
  ON public.calendar_events FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- INVESTMENT_OPPORTUNITIES: Admin full access
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can insert investment_opportunities"
  ON public.investment_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can update investment_opportunities"
  ON public.investment_opportunities FOR UPDATE
  TO authenticated
  USING (public.get_member_type() = 'admin')
  WITH CHECK (public.get_member_type() = 'admin');

CREATE POLICY "Admin can delete investment_opportunities"
  ON public.investment_opportunities FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- --------------------------------------------------------------------------
-- LESSON_COMMENTS: Admin can delete any + owner can delete own
-- --------------------------------------------------------------------------
CREATE POLICY "Admin can delete any comment"
  ON public.lesson_comments FOR DELETE
  TO authenticated
  USING (public.get_member_type() = 'admin');

-- Re-create owner delete policy (the old one combined owner + email check, we keep owner separate)
CREATE POLICY "Users can delete own comments"
  ON public.lesson_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
