-- ========================================================
-- FIX GURU ACCOUNT (MANUAL REPAIR SCRIPT)
-- ========================================================
-- Run this in Supabase SQL Editor to fix the teacher account
-- ========================================================

-- 1. Ensure 'guru' role is assigned in public.users
UPDATE public.users 
SET role = 'guru', 
    full_name = 'Yesi Afdhal (Guru)'
WHERE email = 'yesiafdhal07@guru.sma.belajar.id';

-- 2. Sync to auth.users metadata (crucial for JWT/middleware)
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) 
    || jsonb_build_object('role', 'guru')
WHERE email = 'yesiafdhal07@guru.sma.belajar.id';

-- 3. Verify teacher profile exists
INSERT INTO public.teacher_profiles (id, position)
SELECT id, 'Guru Mata Pelajaran'
FROM public.users
WHERE email = 'yesiafdhal07@guru.sma.belajar.id'
ON CONFLICT (id) DO NOTHING;

-- 4. Check if classes exist for this teacher
-- (If no classes exist, we might need to create one to test the dashboard)
DO $$ 
DECLARE
    v_user_id UUID;
    v_class_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM public.users WHERE email = 'yesiafdhal07@guru.sma.belajar.id';
    
    IF NOT EXISTS (SELECT 1 FROM public.classes WHERE teacher_id = v_user_id) THEN
        INSERT INTO public.classes (name, teacher_id, description)
        VALUES ('Kelas Matematika Contoh', v_user_id, 'Kelas untuk pengujian dashboard')
        RETURNING id INTO v_class_id;
        
        -- Add a subject to the class
        INSERT INTO public.subjects (title, class_id)
        VALUES ('Matematika Dasar', v_class_id);
    END IF;
END $$;
