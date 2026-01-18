-- ========================================================
-- ABSOLUTE RLS RESET & FIX (The "Red Button")
-- ========================================================
-- 
-- Masalah: Error Infinite Recursion 'class_members' membandel.
-- Penyebab: Kemungkinan ada Policy lama dengan nama lain yang tidak terhapus.
-- Solusi: Script ini akan mencari SEMUA policy di tabel terkait dan MENGHAPUSNYA.
--         Lalu menerapkan policy yang benar (Nuclear Fix).
-- ========================================================
DO $$
DECLARE r RECORD;
BEGIN -- 1. Loop through all policies for our problematic tables
FOR r IN
SELECT schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE tablename IN (
        'users',
        'classes',
        'class_members',
        'subjects',
        'assignments',
        'submissions',
        'grades',
        'attendance',
        'attendance_records'
    ) LOOP -- 2. Drop execution
    EXECUTE format(
        'DROP POLICY IF EXISTS %I ON %I.%I',
        r.policyname,
        r.schemaname,
        r.tablename
    );
RAISE NOTICE 'Dropped policy: % on %',
r.policyname,
r.tablename;
END LOOP;
END $$;
-- ========================================================
-- RE-APPLY SECURE POLICIES (Nuclear Fix Version)
-- ========================================================
-- 1. Helper Function (Security Definer)
CREATE OR REPLACE FUNCTION public.is_class_teacher(p_class_id UUID, p_user_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.classes
        WHERE id = p_class_id
            AND teacher_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. USERS (Simple)
CREATE POLICY "Profiles viewable" ON public.users FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Self update" ON public.users FOR
UPDATE TO authenticated USING (id = auth.uid());
-- 3. CLASS_MEMBERS (Non-Recursive)
CREATE POLICY "Members view" ON public.class_members FOR
SELECT TO authenticated USING (true);
-- Insert/Update/Delete uses the Function
CREATE POLICY "Teachers manage members" ON public.class_members FOR ALL TO authenticated USING (
    public.is_class_teacher(class_id, auth.uid())
);
CREATE POLICY "Students join" ON public.class_members FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- 4. CLASSES (Non-Recursive)
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
-- 5. OTHER TABLES (Safe Defaults)
-- Subjects
CREATE POLICY "Subjects viewable" ON public.subjects FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage subjects" ON public.subjects FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.classes c
        WHERE c.id = class_id
            AND c.teacher_id = auth.uid()
    )
);
-- Assignments
CREATE POLICY "Assignments viewable" ON public.assignments FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage assignments" ON public.assignments FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.subjects s
            JOIN public.classes c ON s.class_id = c.id
        WHERE s.id = subject_id
            AND c.teacher_id = auth.uid()
    )
);
-- ========================================================
-- DONE. Clean Slate.
-- ========================================================