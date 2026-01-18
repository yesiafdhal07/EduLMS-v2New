-- ========================================================
-- FIXED SOFT DELETE VISIBILITY
-- Tujuan: Agar data yang dihapus (Soft Delete) oleh Guru:
-- 1. Tidak muncul di Dashboard Guru (sudah di-filter di Frontend)
-- 2. TETAP MUNCUL di tampilan Siswa (Request User)
-- ========================================================
-- A. CLASSES
-- 1. Guru: Bisa melihat semua (Active + Trash). Filter dilakukan di UI.
DROP POLICY IF EXISTS "Teachers view own classes" ON public.classes;
CREATE POLICY "Teachers view own classes" ON public.classes FOR
SELECT TO authenticated USING (
        teacher_id = auth.uid() -- Hapus condition 'deleted_at IS NULL' agar trash tetap bisa diakses (di tab Sampah)
        -- Frontend 'Active Tab' sudah difilter .is('deleted_at', null)
    );
-- 2. Siswa: Bisa melihat semua (Active + Deleted)
DROP POLICY IF EXISTS "Students view enrolled classes" ON public.classes;
CREATE POLICY "Students view enrolled classes" ON public.classes FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.class_members cm
            WHERE cm.class_id = id
                AND cm.user_id = auth.uid()
        ) -- Hapus 'deleted_at IS NULL' -> Siswa bisa lihat kelas yang dihapus
    );
-- B. ASSIGNMENTS
DROP POLICY IF EXISTS "Assignments viewable" ON public.assignments;
CREATE POLICY "Assignments viewable" ON public.assignments FOR
SELECT TO authenticated USING (
        -- Kembalikan ke permissive view (tanpa filter deleted_at)
        -- Keamanan level baris biasanya dihandle di level aplikasi atau join Subject
        true
    );
-- C. MATERIALS
DROP POLICY IF EXISTS "Materials viewable" ON public.materials;
CREATE POLICY "Materials viewable" ON public.materials FOR
SELECT TO authenticated USING (true);
-- ========================================================
-- Note:
-- Dengan ini, RLS tidak lagi menyembunyikan data terhapus.
-- - App Guru (Active Tab) harus filter `deleted_at IS NULL` (Sudah diupdate).
-- - App Siswa tidak perlu filter -> Data muncul semua.
-- ========================================================