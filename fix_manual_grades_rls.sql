-- ========================================================
-- FIX FOR MANUAL GRADES RLS (Save Grade Issue)
-- ========================================================
-- Run this in your Supabase SQL Editor to allow teachers 
-- to save "Nilai Manual" or "Keaktifan" without Submissions.

-- 1. Ensure helper function exists
DROP FUNCTION IF EXISTS public.is_class_teacher(UUID, UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.is_class_teacher(p_class_id UUID, p_user_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.classes
        WHERE id = p_class_id
            AND teacher_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up old policy
DROP POLICY IF EXISTS "Teacher manage grades" ON public.grades;

-- 3. Create fixed policy WITH fallback for Assignments without Submissions
CREATE POLICY "Teacher manage grades" ON public.grades FOR ALL TO authenticated USING (
    -- a. Keaktifan / Direct Grade (Siswa adalah anggota kelas yang diajarkan guru tersebut)
    (
        student_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM public.class_members cm
            WHERE cm.user_id = student_id
                AND public.is_class_teacher(cm.class_id, auth.uid())
        )
    )
    OR -- b. Submission Grade (Via Pengumpulan Tugas -> Penilaian Reguler)
    (
        submission_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM public.submissions sub
                JOIN public.assignments a ON sub.assignment_id = a.id
                JOIN public.subjects s ON a.subject_id = s.id
            WHERE sub.id = submission_id
                AND public.is_class_teacher(s.class_id, auth.uid())
        )
    )
    OR -- c. Manual Assignment Grade (Kondisi Baru: Untuk Tugas Manual Tanpa Pengumpulan)
    (
        assignment_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM public.assignments a
                JOIN public.subjects s ON a.subject_id = s.id
            WHERE a.id = assignment_id
                AND public.is_class_teacher(s.class_id, auth.uid())
        )
    )
);

-- 4. Verify Student View remains active
DROP POLICY IF EXISTS "Student view grades" ON public.grades;
CREATE POLICY "Student view grades" ON public.grades FOR SELECT TO authenticated USING (student_id = auth.uid());
