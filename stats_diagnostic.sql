-- ========================================================
-- STATS DIAGNOSTIC (EduLMS)
-- ========================================================

SELECT 
    'ATTENDANCE' as kategori, 'Total Sesi Absensi' as info, count(*)::text as nilai FROM public.attendance
UNION ALL
SELECT 'ATTENDANCE', 'Total Record Kehadiran', count(*)::text FROM public.attendance_records
UNION ALL
SELECT 'GRADES', 'Total Record Nilai', count(*)::text FROM public.grades
UNION ALL
SELECT 'GRADES', 'Rata-rata Nilai (Global)', round(avg(score), 2)::text FROM public.grades
UNION ALL
SELECT 
    'DIAGNOSA RLS', 
    'Policy di Attendance', 
    (SELECT count(*) FROM pg_policies WHERE tablename = 'attendance')::text
UNION ALL
SELECT 
    'DIAGNOSA RLS', 
    'Policy di Attendance Records', 
    (SELECT count(*) FROM pg_policies WHERE tablename = 'attendance_records')::text;
