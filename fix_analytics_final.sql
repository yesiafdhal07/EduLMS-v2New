-- ========================================================
-- FIX ANALYTICS FINAL: Realtime & Data Visibility
-- ========================================================
-- 1. Enable Realtime for critical tables explicitly
-- This ensures that changes to these tables broadcast events to the dashboard
BEGIN;
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.attendance_records,
public.grades,
public.submissions,
public.attendance;
COMMIT;
-- 2. Backfill class_id for existing grades (Assignment Grades)
-- This fixes "Distribution of Grades" for existing assignment data
UPDATE public.grades g
SET class_id = c.id
FROM public.submissions s
    JOIN public.assignments a ON s.assignment_id = a.id
    JOIN public.subjects sub ON a.subject_id = sub.id
    JOIN public.classes c ON sub.class_id = c.id
WHERE g.submission_id = s.id
    AND g.class_id IS NULL;
-- 3. Update Policy for Attendance Records (Optimize for Teachers)
-- Ensure teachers can quickly view records for their classes
DROP POLICY IF EXISTS "Officers view records" ON public.attendance_records;
CREATE POLICY "Officers view records" ON public.attendance_records FOR
SELECT TO authenticated USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.attendance a
                JOIN public.classes c ON a.class_id = c.id
            WHERE a.id = attendance_records.attendance_id
                AND c.teacher_id = auth.uid()
        )
    );
-- 4. Verify Attendance Logs View (Re-apply date fix just in case)
CREATE OR REPLACE VIEW public.attendance_logs AS
SELECT ar.id,
    ar.student_id,
    ar.status,
    a.created_at,
    -- Ensure this uses attendance timestamp
    a.class_id,
    a.date as session_date
FROM public.attendance_records ar
    JOIN public.attendance a ON ar.attendance_id = a.id;
-- Grant permissions again
GRANT SELECT ON public.attendance_logs TO authenticated,
    service_role;