-- ========================================================
-- FINAL REPAIR SCRIPT: RESTORE CLASS VISIBILITY
-- ========================================================
-- Script ini akan menghapus semua aturan keamanan (RLS) yang
-- tumpang tindih dan menerapkan aturan bersih agar data muncul.
-- ========================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. BERSIHKAN SEMUA POLICY LAMA (Tujuannya agar tidak ada kebijakan ganda yang membingungkan)
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN ('classes', 'class_members', 'attendance', 'attendance_records', 'grades', 'submissions')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;


-- 2. HELPER FUNCTION: is_class_teacher (Jika belum ada)
-- Fungsi ini digunakan di dalam policy agar tidak terjadi "RECURSION" (pemanggilan diri sendiri)
DROP FUNCTION IF EXISTS public.is_class_teacher(UUID, UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.is_class_teacher(_class_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = _class_id AND teacher_id = _user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. TERAPKAN POLICY BERSIH UNTUK 'CLASSES'
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Guru: Bisa melihat & mengelola kelas yang mereka buat
CREATE POLICY "Teacher_Manage_Own_Classes" ON public.classes 
FOR ALL TO authenticated 
USING (teacher_id = auth.uid());

-- Siswa: Bisa melihat kelas tempat mereka terdaftar
CREATE POLICY "Student_View_Enrolled_Classes" ON public.classes 
FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.class_members 
        WHERE class_id = id AND user_id = auth.uid()
    )
);

-- Publik/Anon: Bisa melihat kelas (untuk pendaftaran)
CREATE POLICY "Anon_View_Classes" ON public.classes 
FOR SELECT TO anon 
USING (deleted_at IS NULL);


-- 4. TERAPKAN POLICY BERSIH UNTUK 'CLASS_MEMBERS'
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Siapa pun yang login bisa melihat daftar keanggotaan (Aman karena datanya minim)
CREATE POLICY "View_All_Memberships" ON public.class_members 
FOR SELECT TO authenticated 
USING (true);

-- Guru: Bisa menambah/menghapus anggota di kelas miliknya
CREATE POLICY "Guru_Manage_Members" ON public.class_members 
FOR ALL TO authenticated 
USING (
    public.is_class_teacher(class_id, auth.uid())
);

-- Siswa: Bisa mendaftar sendiri (Insert)
CREATE POLICY "Siswa_Join_Class" ON public.class_members 
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());


-- 5. TERAPKAN POLICY BERSIH UNTUK 'ATTENDANCE'
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Guru: Bisa mengelola sesi absensi di kelas miliknya
CREATE POLICY "Guru_Manage_Attendance" ON public.attendance 
FOR ALL TO authenticated 
USING (
    public.is_class_teacher(class_id, auth.uid())
)
WITH CHECK (
    public.is_class_teacher(class_id, auth.uid())
);

-- Siswa: Bisa melihat sesi absensi di kelasnya
CREATE POLICY "Siswa_View_Attendance" ON public.attendance 
FOR SELECT TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.class_members WHERE class_id = attendance.class_id AND user_id = auth.uid())
);


-- 6. TERAPKAN POLICY BERSIH UNTUK 'ATTENDANCE_RECORDS'
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Guru: Bisa mengelola record absensi di sesi miliknya
CREATE POLICY "Guru_Manage_Records" ON public.attendance_records 
FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.attendance a 
        WHERE a.id = attendance_id 
        AND public.is_class_teacher(a.class_id, auth.uid())
    )
);

-- Siswa: Bisa melihat record miliknya sendiri dan melakukan "Check-in" (Insert)
CREATE POLICY "Siswa_View_Own_Records" ON public.attendance_records 
FOR SELECT TO authenticated 
USING (student_id = auth.uid());

CREATE POLICY "Siswa_Insert_Own_Record" ON public.attendance_records 
FOR INSERT TO authenticated 
WITH CHECK (student_id = auth.uid());


-- 7. TERAPKAN POLICY BERSIH UNTUK 'GRADES' & 'SUBMISSIONS'
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Guru: Bisa mengelola nilai & tugas di kelas miliknya
CREATE POLICY "Guru_Manage_Grades" ON public.grades 
FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.class_members cm 
        JOIN public.classes c ON cm.class_id = c.id 
        WHERE cm.user_id = grades.student_id 
        AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Guru_Manage_Submissions" ON public.submissions 
FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.assignments a 
        JOIN public.subjects s ON a.subject_id = s.id 
        JOIN public.classes c ON s.class_id = c.id 
        WHERE a.id = submissions.assignment_id 
        AND c.teacher_id = auth.uid()
    )
);

-- Siswa: Bisa melihat nilai & tugas miliknya sendiri
CREATE POLICY "Siswa_View_Own_Grades" ON public.grades 
FOR SELECT TO authenticated 
USING (student_id = auth.uid());

CREATE POLICY "Siswa_Manage_Own_Submissions" ON public.submissions 
FOR ALL TO authenticated 
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());


-- Tampilkan Pesan Berhasil
SELECT 'PERBAIKAN TOTAL SELESAI: Data Real-time & Visualisasi seharusnya sudah Akurat.' as status;
