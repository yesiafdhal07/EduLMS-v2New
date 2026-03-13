-- ========================================================
-- FIX ANALYTICS & DATA FILTERING
-- ========================================================
-- 1. Add class_id to grades table to support per-class participation grades
ALTER TABLE public.grades
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE;
-- 2. Create attendance_logs VIEW for Analytics Dashboard
-- This resolves the "Analytics data missing" issue for attendance
CREATE OR REPLACE VIEW public.attendance_logs AS
SELECT ar.id,
    ar.student_id,
    ar.status,
    a.created_at,
    a.class_id,
    a.date as session_date
FROM public.attendance_records ar
    JOIN public.attendance a ON ar.attendance_id = a.id;
-- Grant permissions
GRANT SELECT ON public.attendance_logs TO authenticated,
    service_role;
-- 3. Policy for grades (Update if needed)
-- Ensure teachers can view grades for their classes
-- Drop existing policy first to avoid conflict
DROP POLICY IF EXISTS "Teachers can view grades for their classes" ON public.grades;
CREATE POLICY "Teachers can view grades for their classes" ON public.grades FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.classes c
            WHERE c.id = grades.class_id
                AND c.teacher_id = auth.uid()
        )
    );