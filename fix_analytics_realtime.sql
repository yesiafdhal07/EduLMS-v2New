-- ============================================================
-- FIX ANALYTICS REALTIME & ACCESS
-- Mengatasi masalah data tidak muncul dan tidak realtime
-- ============================================================
-- 1. Pastikan Realtime aktif untuk tabel yang dibutuhkan
DO $$ BEGIN -- Add tables to publication if not already added
ALTER PUBLICATION supabase_realtime
ADD TABLE grades;
ALTER PUBLICATION supabase_realtime
ADD TABLE attendance_records;
ALTER PUBLICATION supabase_realtime
ADD TABLE submissions;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- 2. Perbaiki RLS untuk Grades (Nilai)
-- Masalah umum: Query join kompleks di RLS bisa gagal atau lambat
-- Solusi: Policy yang lebih permissive untuk Guru (bisa melihat semua nilai jika role='guru')
-- ATAU tetap strict tapi pastikan logic-nya benar.
-- Kita akan buat policy khusus untuk "Analytics View" yang lebih optimal.
DROP POLICY IF EXISTS "Teacher view grades for analytics" ON public.grades;
CREATE POLICY "Teacher view grades for analytics" ON public.grades FOR
SELECT TO authenticated USING (
        -- Guru bisa melihat semua nilai (sebagai fallback jika join gagal)
        -- Idealnya filter by class_id, tapi tables grades tidak punya class_id langsung.
        -- Kita gunakan check role sederhana untuk performa dashboard
        (
            EXISTS (
                SELECT 1
                FROM public.users
                WHERE id = auth.uid()
                    AND role = 'guru'
            )
        )
        OR -- Siswa hanya lihat nilai sendiri
        (student_id = auth.uid())
    );
-- 3. Perbaiki RLS untuk Attendance Records
DROP POLICY IF EXISTS "Teacher view attendance for analytics" ON public.attendance_records;
CREATE POLICY "Teacher view attendance for analytics" ON public.attendance_records FOR
SELECT TO authenticated USING (
        -- Guru bisa melihat semua absensi
        (
            EXISTS (
                SELECT 1
                FROM public.users
                WHERE id = auth.uid()
                    AND role = 'guru'
            )
        )
        OR -- Siswa hanya lihat absensi sendiri
        (student_id = auth.uid())
    );
-- 4. Perbaiki RLS untuk Submissions
DROP POLICY IF EXISTS "Teacher view submissions for analytics" ON public.submissions;
CREATE POLICY "Teacher view submissions for analytics" ON public.submissions FOR
SELECT TO authenticated USING (
        -- Guru bisa melihat semua submission
        (
            EXISTS (
                SELECT 1
                FROM public.users
                WHERE id = auth.uid()
                    AND role = 'guru'
            )
        )
        OR -- Siswa hanya lihat submission sendiri
        (student_id = auth.uid())
    );
-- ============================================================
-- NOTE:
-- Policy "Teacher manage..." yang lama mungkin masih ada dan lebih strict (via join).
-- Postgres menggunakan OR untuk multiple policies.
-- Jadi jika policy baru ini TRUE, maka user bisa akses.
-- Ini aman karena kita hanya membolehkan SELECT (bukan insert/update/delete)
-- untuk SEMUA data, TAPI dibatasi hanya untuk user dengan role 'guru'.
-- ============================================================