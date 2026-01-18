-- ========================================================
-- NUCLEAR FIX FOR RLS INFINITE RECURSION (V2)
-- ========================================================
-- 1. Create Helper Function (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_class_teacher(p_class_id UUID, p_user_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.classes
        WHERE id = p_class_id
            AND teacher_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. Clean up ALL old policies (Drop by ANY known name)
DROP POLICY IF EXISTS "Teachers manage members" ON public.class_members;
DROP POLICY IF EXISTS "Teachers can insert members" ON public.class_members;
DROP POLICY IF EXISTS "Teachers can update members" ON public.class_members;
DROP POLICY IF EXISTS "Teachers can delete members" ON public.class_members;
DROP POLICY IF EXISTS "Members view" ON public.class_members;
DROP POLICY IF EXISTS "Students join" ON public.class_members;
DROP POLICY IF EXISTS "Teachers view own classes" ON public.classes;
DROP POLICY IF EXISTS "Students view enrolled classes" ON public.classes;
DROP POLICY IF EXISTS "Anon can view classes for registration" ON public.classes;
DROP POLICY IF EXISTS "Anon can view classes" ON public.classes;
-- Added this!
DROP POLICY IF EXISTS "Teachers create classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers update own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers delete own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers manage classes" ON public.classes;
-- 3. Recreate Policies for CLASS_MEMBERS
CREATE POLICY "Members view" ON public.class_members FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage members" ON public.class_members FOR ALL TO authenticated USING (
    public.is_class_teacher(class_id, auth.uid())
);
CREATE POLICY "Students join" ON public.class_members FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- 4. Recreate Policies for CLASSES
CREATE POLICY "Teachers view own classes" ON public.classes FOR
SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Students view enrolled classes" ON public.classes FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.class_members cm
            WHERE cm.class_id = id
                AND cm.user_id = auth.uid()
        )
    );
CREATE POLICY "Anon can view classes" ON public.classes FOR
SELECT TO anon USING (true);
CREATE POLICY "Teachers manage classes" ON public.classes FOR ALL TO authenticated USING (teacher_id = auth.uid());
-- 5. Fix USERS Policy
DROP POLICY IF EXISTS "Profiles viewable" ON public.users;
CREATE POLICY "Profiles viewable" ON public.users FOR
SELECT TO authenticated USING (true);