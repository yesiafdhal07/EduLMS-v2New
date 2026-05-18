-- ========================================================
-- EMERGENCY RECOVERY & SYNC SCRIPT
-- ========================================================
-- Run this in Supabase SQL Editor to restore your users
-- ========================================================

-- 1. Sync all users from Auth to Public DB
INSERT INTO public.users (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'User'),
    COALESCE((raw_user_meta_data->>'role')::public.user_role, 'siswa')
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- 2. Specifically fix the Teacher account to have 'guru' role
-- (If it was manually set to 'admin' before, we change it to 'guru' for the dashboard)
UPDATE public.users 
SET role = 'guru' 
WHERE email = 'yesiafdhal07@guru.sma.belajar.id';

-- 3. Sync role back to Auth metadata
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) 
    || jsonb_build_object('role', 'guru')
WHERE email = 'yesiafdhal07@guru.sma.belajar.id';

-- 4. Ensure dummy school exists for testing multi-school logic
INSERT INTO public.schools (id, name, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sekolah Percontohan Klolakelas', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Assign users to the dummy school
UPDATE public.users 
SET school_id = '00000000-0000-0000-0000-000000000001'
WHERE school_id IS NULL;

-- 6. Verify and create teacher profile
INSERT INTO public.teacher_profiles (id, position)
SELECT id, 'Guru Matematika'
FROM public.users
WHERE role = 'guru'
ON CONFLICT (id) DO NOTHING;

-- 7. Ensure at least one class exists for the dashboard to load
DO $$ 
DECLARE
    v_teacher_record RECORD;
    v_class_id UUID;
BEGIN
    FOR v_teacher_record IN SELECT id FROM public.users WHERE role = 'guru' LOOP
        IF NOT EXISTS (SELECT 1 FROM public.classes WHERE teacher_id = v_teacher_record.id) THEN
            INSERT INTO public.classes (name, teacher_id)
            VALUES ('Kelas X-1 (Testing)', v_teacher_record.id)
            RETURNING id INTO v_class_id;
            
            INSERT INTO public.subjects (title, class_id)
            VALUES ('Matematika Wajib', v_class_id);
        END IF;
    END LOOP;
END $$;
