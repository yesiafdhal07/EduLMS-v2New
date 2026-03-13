-- ========================================================
-- FIX REGISTRATION & ENROLLMENT (Perbaikan Pendaftaran)
-- ========================================================
-- 1. Fix RLS: Allow Anon/Public to see active classes
-- 2. Fix Trigger: Auto-enroll student to class upon signup
-- ========================================================
-- A. FIX RLS FOR CLASSES (Registration Dropdown)
-- --------------------------------------------------------
-- Drop potential conflicting policies
DROP POLICY IF EXISTS "Anon can view classes for registration" ON public.classes;
DROP POLICY IF EXISTS "Public view classes" ON public.classes;
-- Create explicit policy for Anon/Public to view classes (excluding deleted)
-- This ensures the registration dropdown is populated.
CREATE POLICY "Anon can view classes for registration" ON public.classes FOR
SELECT TO anon USING (deleted_at IS NULL);
-- Also ensure 'authenticated' users (e.g. during session creation) can see classes
-- if they are not yet enrolled (optional, but good for safety)
DROP POLICY IF EXISTS "Auth view all active classes" ON public.classes;
CREATE POLICY "Auth view all active classes" ON public.classes FOR
SELECT TO authenticated USING (
        deleted_at IS NULL
        AND teacher_id != auth.uid() -- Teachers have their own policy
        AND NOT EXISTS (
            -- Only if not covered by "Student view enrolled"
            SELECT 1
            FROM public.class_members cm
            WHERE cm.class_id = id
                AND cm.user_id = auth.uid()
        )
    );
-- B. FIX USER TRIGGER (Auto-Enrollment)
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE v_class_id UUID;
v_role public.user_role;
BEGIN -- Determine role
v_role := COALESCE(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'siswa'::public.user_role
);
-- 1. Insert into public.users
INSERT INTO public.users (id, email, full_name, role)
VALUES (
        new.id,
        new.email,
        COALESCE(
            new.raw_user_meta_data->>'full_name',
            'User Baru'
        ),
        v_role
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
-- 2. Auto-Enrollment for Students (if class_id provided)
IF v_role = 'siswa' THEN -- Extract class_id safely
BEGIN v_class_id := (new.raw_user_meta_data->>'class_id')::UUID;
EXCEPTION
WHEN OTHERS THEN v_class_id := NULL;
-- Invalid UUID format check
END;
-- If class_id exists, insert into class_members
IF v_class_id IS NOT NULL THEN
INSERT INTO public.class_members (class_id, user_id)
VALUES (v_class_id, new.id) ON CONFLICT (class_id, user_id) DO NOTHING;
END IF;
END IF;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Re-apply trigger to be safe (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ========================================================
-- DONE. Isu "Kelas Hilang" dan "Tidak Terdaftar" teratasi.
-- ========================================================