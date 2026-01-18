-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - SAFE VERSION
-- EduLMS - Supabase Security Configuration
-- =====================================================
-- 
-- ⚠️ KEAMANAN DATA:
-- Script ini AMAN dijalankan dan TIDAK akan menghapus data apapun!
-- 
-- Apa yang dilakukan script ini:
-- ✅ Mengaktifkan RLS (Row Level Security) pada tabel
-- ✅ Membuat policy untuk mengontrol akses data
-- ❌ TIDAK menghapus data
-- ❌ TIDAK mengubah struktur tabel
-- ❌ TIDAK menghapus kolom
--
-- Script ini IDEMPOTENT artinya bisa dijalankan berkali-kali
-- tanpa efek samping (DROP IF EXISTS sebelum CREATE)
--
-- Run this migration in Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =====================================================
-- ========================================================
-- STEP 1: ENABLE RLS ON ALL TABLES (AMAN - tidak hapus data)
-- ========================================================
-- Catatan: ALTER TABLE ... ENABLE ROW LEVEL SECURITY hanya mengaktifkan
-- fitur keamanan, TIDAK menghapus atau mengubah data sama sekali
DO $$ BEGIN -- Users table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'users'
) THEN
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
END IF;
-- Classes table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'classes'
) THEN
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
END IF;
-- Class members table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'class_members'
) THEN
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
END IF;
-- Subjects table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'subjects'
) THEN
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
END IF;
-- Assignments table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'assignments'
) THEN
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
END IF;
-- Submissions table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'submissions'
) THEN
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
END IF;
-- Grades table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'grades'
) THEN
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
END IF;
-- Materials table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'materials'
) THEN
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
END IF;
-- Attendance table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'attendance'
) THEN
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
END IF;
-- Attendance records table
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'attendance_records'
) THEN
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
END IF;
END $$;
-- ========================================================
-- STEP 2: USERS TABLE POLICIES
-- ========================================================
-- Drop existing policies first (kalau ada) untuk hindari error duplicate
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON users;
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users FOR
SELECT USING (auth.uid() = id);
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR
UPDATE USING (auth.uid() = id);
-- Teachers can view students in their classes
CREATE POLICY "Teachers can view students in their classes" ON users FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM class_members cm
                JOIN classes c ON cm.class_id = c.id
            WHERE cm.user_id = users.id
                AND c.teacher_id = auth.uid()
        )
    );
-- ========================================================
-- STEP 3: CLASSES TABLE POLICIES
-- ========================================================
DROP POLICY IF EXISTS "Teachers can manage own classes" ON classes;
DROP POLICY IF EXISTS "Students can view enrolled classes" ON classes;
-- Teachers can CRUD their own classes
CREATE POLICY "Teachers can manage own classes" ON classes FOR ALL USING (teacher_id = auth.uid());
-- Students can view classes they're enrolled in
CREATE POLICY "Students can view enrolled classes" ON classes FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM class_members
            WHERE class_id = classes.id
                AND user_id = auth.uid()
        )
    );
-- ========================================================
-- STEP 4: CLASS_MEMBERS TABLE POLICIES
-- ========================================================
DROP POLICY IF EXISTS "Teachers can manage class members" ON class_members;
DROP POLICY IF EXISTS "Students can view own membership" ON class_members;
-- Teachers can manage members of their classes
CREATE POLICY "Teachers can manage class members" ON class_members FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM classes
        WHERE id = class_members.class_id
            AND teacher_id = auth.uid()
    )
);
-- Students can view their own membership
CREATE POLICY "Students can view own membership" ON class_members FOR
SELECT USING (user_id = auth.uid());
-- ========================================================
-- STEP 5: ASSIGNMENTS TABLE POLICIES
-- ========================================================
DROP POLICY IF EXISTS "Teachers can manage assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments" ON assignments;
-- Teachers can manage assignments for their classes
CREATE POLICY "Teachers can manage assignments" ON assignments FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM subjects s
            JOIN classes c ON s.class_id = c.id
        WHERE s.id = assignments.subject_id
            AND c.teacher_id = auth.uid()
    )
);
-- Students can view assignments for enrolled classes
CREATE POLICY "Students can view assignments" ON assignments FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM subjects s
                JOIN class_members cm ON s.class_id = cm.class_id
            WHERE s.id = assignments.subject_id
                AND cm.user_id = auth.uid()
        )
    );
-- ========================================================
-- STEP 6: SUBMISSIONS TABLE POLICIES
-- ========================================================
DROP POLICY IF EXISTS "Students can manage own submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers can view submissions" ON submissions;
-- Students can manage their own submissions
CREATE POLICY "Students can manage own submissions" ON submissions FOR ALL USING (student_id = auth.uid());
-- Teachers can view submissions for their classes
CREATE POLICY "Teachers can view submissions" ON submissions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM assignments a
                JOIN subjects s ON a.subject_id = s.id
                JOIN classes c ON s.class_id = c.id
            WHERE a.id = submissions.assignment_id
                AND c.teacher_id = auth.uid()
        )
    );
-- ========================================================
-- STEP 7: GRADES TABLE POLICIES
-- ========================================================
DROP POLICY IF EXISTS "Teachers can manage grades" ON grades;
DROP POLICY IF EXISTS "Students can view own grades" ON grades;
-- Teachers can manage grades for their classes
CREATE POLICY "Teachers can manage grades" ON grades FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM class_members cm
            JOIN classes c ON cm.class_id = c.id
        WHERE cm.user_id = grades.student_id
            AND c.teacher_id = auth.uid()
    )
);
-- Students can view their own grades
CREATE POLICY "Students can view own grades" ON grades FOR
SELECT USING (student_id = auth.uid());
-- ========================================================
-- STEP 8: MATERIALS TABLE POLICIES
-- ========================================================
DROP POLICY IF EXISTS "Teachers can manage materials" ON materials;
DROP POLICY IF EXISTS "Students can view materials" ON materials;
-- Teachers can manage materials for their classes
CREATE POLICY "Teachers can manage materials" ON materials FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM subjects s
            JOIN classes c ON s.class_id = c.id
        WHERE s.id = materials.subject_id
            AND c.teacher_id = auth.uid()
    )
);
-- Students can view materials for enrolled classes
CREATE POLICY "Students can view materials" ON materials FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM subjects s
                JOIN class_members cm ON s.class_id = cm.class_id
            WHERE s.id = materials.subject_id
                AND cm.user_id = auth.uid()
        )
    );
-- ========================================================
-- STEP 9: ATTENDANCE TABLE POLICIES
-- ========================================================
DROP POLICY IF EXISTS "Teachers can manage attendance" ON attendance;
DROP POLICY IF EXISTS "Students can view attendance" ON attendance;
-- Teachers can manage attendance for their classes
CREATE POLICY "Teachers can manage attendance" ON attendance FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM classes
        WHERE id = attendance.class_id
            AND teacher_id = auth.uid()
    )
);
-- Students can view attendance for enrolled classes
CREATE POLICY "Students can view attendance" ON attendance FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM class_members
            WHERE class_id = attendance.class_id
                AND user_id = auth.uid()
        )
    );
-- ========================================================
-- STEP 10: ATTENDANCE_RECORDS TABLE POLICIES
-- ========================================================
DROP POLICY IF EXISTS "Teachers can manage attendance records" ON attendance_records;
DROP POLICY IF EXISTS "Students can manage own attendance" ON attendance_records;
-- Teachers can manage attendance records for their classes
CREATE POLICY "Teachers can manage attendance records" ON attendance_records FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM attendance a
            JOIN classes c ON a.class_id = c.id
        WHERE a.id = attendance_records.attendance_id
            AND c.teacher_id = auth.uid()
    )
);
-- Students can insert/view their own attendance records
CREATE POLICY "Students can manage own attendance" ON attendance_records FOR ALL USING (student_id = auth.uid());
-- ========================================================
-- DONE! 🎉
-- ========================================================
-- 
-- Setelah menjalankan script ini:
-- ✅ RLS sudah aktif di semua tabel
-- ✅ Semua data existing TETAP AMAN
-- ✅ Guru hanya bisa akses kelas mereka sendiri
-- ✅ Siswa hanya bisa akses data kelas yang mereka ikuti
--
-- Catatan: Untuk service_role/admin access, gunakan service_role key
-- yang akan bypass RLS secara default
-- ========================================================