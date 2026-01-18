-- ========================================================
-- RESTORE MISSING POLICIES (Fixes "Gagal Toggle Absensi")
-- ========================================================
-- 
-- Masalah: Script "Absolute Reset" sebelumnya menghapus policy untuk 
--          Attendance, Grades, dan Submissions.
-- Solusi: Script ini akan mengembalikan policy tersebut dengan AMAN.
--         Dilengkapi dengan DROP IF EXISTS agar bisa dijalankan ulang.
-- ========================================================
-- Pastikan Function helper ada
CREATE OR REPLACE FUNCTION public.is_class_teacher(p_class_id UUID, p_user_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.classes
        WHERE id = p_class_id
            AND teacher_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 1. ATTENDANCE (Sesi Absensi)
DROP POLICY IF EXISTS "Teacher manage attendance" ON public.attendance;
CREATE POLICY "Teacher manage attendance" ON public.attendance FOR ALL TO authenticated USING (
    public.is_class_teacher(class_id, auth.uid())
);
DROP POLICY IF EXISTS "Student view attendance" ON public.attendance;
CREATE POLICY "Student view attendance" ON public.attendance FOR
SELECT TO authenticated USING (true);
-- 2. ATTENDANCE RECORDS (Rekaman Absen Siswa)
DROP POLICY IF EXISTS "Teacher manage attendance records" ON public.attendance_records;
CREATE POLICY "Teacher manage attendance records" ON public.attendance_records FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.attendance a
        WHERE a.id = attendance_id
            AND public.is_class_teacher(a.class_id, auth.uid())
    )
);
DROP POLICY IF EXISTS "Student manage own records" ON public.attendance_records;
CREATE POLICY "Student manage own records" ON public.attendance_records FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
-- 3. SUBMISSIONS (Tugas Siswa)
DROP POLICY IF EXISTS "Student manage submissions" ON public.submissions;
CREATE POLICY "Student manage submissions" ON public.submissions FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "Teacher manage submissions" ON public.submissions;
CREATE POLICY "Teacher manage submissions" ON public.submissions FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.assignments a
            JOIN public.subjects s ON a.subject_id = s.id
        WHERE a.id = assignment_id
            AND public.is_class_teacher(s.class_id, auth.uid())
    )
);
-- 4. GRADES (Nilai)
DROP POLICY IF EXISTS "Teacher manage grades" ON public.grades;
CREATE POLICY "Teacher manage grades" ON public.grades FOR ALL TO authenticated USING (
    -- Direct Grade (via Student -> Class Member)
    (
        student_id IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM public.class_members cm
            WHERE cm.user_id = student_id
                AND public.is_class_teacher(cm.class_id, auth.uid())
        )
    )
    OR -- Submission Grade (via Submission -> Assignment -> ...)
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
);
DROP POLICY IF EXISTS "Student view grades" ON public.grades;
CREATE POLICY "Student view grades" ON public.grades FOR
SELECT TO authenticated USING (student_id = auth.uid());
-- ========================================================
-- DONE. Semua fitur Absensi, Tugas, & Nilai dipulihkan.
-- Notifikasi dibiarkan (sudah aman).
-- ========================================================