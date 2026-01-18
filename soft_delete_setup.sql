-- ========================================================
-- SOFT DELETE SETUP (Fitur Tong Sampah)
-- ========================================================
-- 1. Menambahkan kolom 'deleted_at'
-- 2. Mengupdate Policy agar data terhapus "disembunyikan"
-- 3. Membuat Policy khusus untuk melihat "Sampah"
-- ========================================================
-- A. Tambah Kolom deleted_at
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.materials
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- Indexing untuk performa
CREATE INDEX IF NOT EXISTS idx_classes_deleted ON public.classes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_assignments_deleted ON public.assignments(deleted_at);
-- B. Update Function Helper (Optional, logic remains same)
-- (No change needed for 'is_class_teacher')
-- C. Update Policies: CLASSES
-- 1. View (Hide deleted)
DROP POLICY IF EXISTS "Teachers view own classes" ON public.classes;
CREATE POLICY "Teachers view own classes" ON public.classes FOR
SELECT TO authenticated USING (
        teacher_id = auth.uid()
        AND deleted_at IS NULL -- Only active
    );
DROP POLICY IF EXISTS "Students view enrolled classes" ON public.classes;
CREATE POLICY "Students view enrolled classes" ON public.classes FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.class_members cm
            WHERE cm.class_id = id
                AND cm.user_id = auth.uid()
        )
        AND deleted_at IS NULL -- Only active
    );
-- 2. Trash View (Show deleted to Teacher)
DROP POLICY IF EXISTS "Teachers view trash classes" ON public.classes;
CREATE POLICY "Teachers view trash classes" ON public.classes FOR
SELECT TO authenticated USING (
        teacher_id = auth.uid()
        AND deleted_at IS NOT NULL -- Only trash
    );
-- 3. Soft Delete Action (Teacher updates deleted_at)
-- Gunakan Policy "Teachers manage classes" yang sudah ada? 
-- Policy "Teachers manage classes" biasanya (USING teacher_id = uid). 
-- Jika policy itu mencakup UPDATE, maka sudah bisa soft delete.
-- Kita pastikan policy manage ada.
DROP POLICY IF EXISTS "Teachers manage classes" ON public.classes;
CREATE POLICY "Teachers manage classes" ON public.classes FOR ALL TO authenticated USING (teacher_id = auth.uid());
-- Handles UPDATE deleted_at
-- D. Update Policies: ASSIGNMENTS
-- 1. View (Hide deleted)
DROP POLICY IF EXISTS "Assignments viewable" ON public.assignments;
CREATE POLICY "Assignments viewable" ON public.assignments FOR
SELECT TO authenticated USING (
        deleted_at IS NULL -- Only active
    );
-- 2. Trash View (Show deleted to Teacher)
DROP POLICY IF EXISTS "Teachers view trash assignments" ON public.assignments;
CREATE POLICY "Teachers view trash assignments" ON public.assignments FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.subjects s
                JOIN public.classes c ON s.class_id = c.id
            WHERE s.id = subject_id
                AND c.teacher_id = auth.uid()
        )
        AND deleted_at IS NOT NULL
    );
-- 3. Manage (Allow update deleted_at)
DROP POLICY IF EXISTS "Teachers manage assignments" ON public.assignments;
CREATE POLICY "Teachers manage assignments" ON public.assignments FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.subjects s
            JOIN public.classes c ON s.class_id = c.id
        WHERE s.id = subject_id
            AND c.teacher_id = auth.uid()
    )
);
-- E. Update Policies: MATERIALS
-- 1. View
DROP POLICY IF EXISTS "Materials viewable" ON public.materials;
CREATE POLICY "Materials viewable" ON public.materials FOR
SELECT TO authenticated USING (deleted_at IS NULL);
-- 2. Trash View
DROP POLICY IF EXISTS "Teachers view trash materials" ON public.materials;
CREATE POLICY "Teachers view trash materials" ON public.materials FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.subjects s
                JOIN public.classes c ON s.class_id = c.id
            WHERE s.id = subject_id
                AND c.teacher_id = auth.uid()
        )
        AND deleted_at IS NOT NULL
    );
-- 3. Manage
DROP POLICY IF EXISTS "Teachers manage materials" ON public.materials;
CREATE POLICY "Teachers manage materials" ON public.materials FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.subjects s
            JOIN public.classes c ON s.class_id = c.id
        WHERE s.id = subject_id
            AND c.teacher_id = auth.uid()
    )
);
-- ========================================================
-- DONE. Sistem Soft Delete siap.
-- ========================================================