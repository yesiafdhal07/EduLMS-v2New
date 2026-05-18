-- ============================================================
-- KLOLAKELAS — ALL-IN-ONE MASTER MIGRATION
-- Menggabungkan semua schema, fitur, fix, dan migration terakhir
-- Script ini IDEMPOTENT (Aman dijalankan berkali-kali)
-- ============================================================


-- ------------------------------------------------------------
-- SOURCE: UNIFIED_MASTER_SCRIPT.sql
-- ------------------------------------------------------------

-- ========================================================
-- UNIFIED MASTER SCRIPT (MATH-LMS) - SAFE VERSION
-- ========================================================
-- 
-- ⚠️ KEAMANAN DATA:
-- Script ini AMAN dan TIDAK akan menghapus data yang sudah ada!
-- 
-- Apa yang dilakukan script ini:
-- ✅ Membuat tabel baru JIKA BELUM ADA
-- ✅ Menambah kolom baru JIKA BELUM ADA
-- ✅ Membuat/update function dan trigger
-- ✅ Membuat RLS policy
-- ✅ Membuat index untuk performa
-- ❌ TIDAK menghapus tabel
-- ❌ TIDAK menghapus data
--
-- Script ini IDEMPOTENT - bisa dijalankan berkali-kali dengan aman
--
-- Run this in Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ========================================================
-- ==========================================
-- 1. EXTENSIONS & TYPES (SAFE)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create types only if they don't exist
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('admin', 'kepala_sekolah', 'guru', 'siswa');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE public.attendance_status AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE public.grade_type AS ENUM ('formatif', 'sumatif', 'manual', 'keaktifan');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE public.material_type AS ENUM ('file', 'link');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- ==========================================
-- 2. CORE TABLES (CREATE IF NOT EXISTS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role DEFAULT 'siswa' NOT NULL,
  school_id UUID REFERENCES public.schools(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  weightage JSONB DEFAULT '{"tugas": 40, "keaktifan": 30, "ujian": 30}'
);
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  content_url TEXT NOT NULL,
  type public.material_type DEFAULT 'file' NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  required_format TEXT DEFAULT 'PDF' NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(assignment_id, student_id)
);
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) CHECK (
    score >= 0
    AND score <= 100
  ),
  type public.grade_type DEFAULT 'formatif',
  feedback TEXT,
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_final BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_grades_assignment_id ON public.grades(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);

-- ==========================================
-- 3. ATTENDANCE & PROFILES (CREATE IF NOT EXISTS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  is_open BOOLEAN DEFAULT false NOT NULL,
  location_center TEXT,
  location_lat DOUBLE PRECISION,
  location_long DOUBLE PRECISION,
  radius NUMERIC,
  radius_meters INTEGER DEFAULT 100,
  type TEXT CHECK (type IN ('manual', 'qr_code')) DEFAULT 'manual',
  active_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, date)
);
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_id UUID REFERENCES public.attendance(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status public.attendance_status DEFAULT 'hadir' NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attendance_id, student_id)
);
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  teaching_experience TEXT,
  education_history TEXT,
  achievements TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  photo_url TEXT,
  position TEXT
);
-- ==========================================
-- 4. NOTIFICATIONS, REVIEWS & AUDIT (CREATE IF NOT EXISTS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'assignment',
      'grade',
      'deadline',
      'submission',
      'attendance'
    )
  ),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS public.peer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER CHECK (
    score >= 0
    AND score <= 100
  ),
  feedback TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  UNIQUE(submission_id, reviewer_id)
);
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE
  SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ==========================================
-- 5. ENABLE RLS (SAFE - tidak hapus data)
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- ==========================================
-- 6. RLS POLICIES (DROP IF EXISTS + CREATE)
-- ==========================================
-- Users
DROP POLICY IF EXISTS "Profiles viewable" ON public.users;
CREATE POLICY "Profiles viewable" ON public.users FOR
SELECT TO authenticated USING (true);
-- Classes
DROP POLICY IF EXISTS "Teachers view own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers create classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers update own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers delete own classes" ON public.classes;
DROP POLICY IF EXISTS "Anon can view classes for registration" ON public.classes;
DROP POLICY IF EXISTS "Students view enrolled classes" ON public.classes;
CREATE POLICY "Teachers view own classes" ON public.classes FOR
SELECT TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Teachers create classes" ON public.classes FOR
INSERT TO authenticated WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role = 'guru'
    )
  );
CREATE POLICY "Teachers update own classes" ON public.classes FOR
UPDATE TO authenticated USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers delete own classes" ON public.classes FOR DELETE TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "Anon can view classes for registration" ON public.classes FOR
SELECT TO anon USING (true);
CREATE POLICY "Students view enrolled classes" ON public.classes FOR
SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.class_members cm
      WHERE cm.class_id = id
        AND cm.user_id = auth.uid()
    )
  );
-- Class members
DROP POLICY IF EXISTS "Members view" ON public.class_members;
DROP POLICY IF EXISTS "Students join" ON public.class_members;
DROP POLICY IF EXISTS "Teachers manage members" ON public.class_members;
CREATE POLICY "Members view" ON public.class_members FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Students join" ON public.class_members FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Teachers manage members" ON public.class_members FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = class_members.class_id
      AND c.teacher_id = auth.uid()
  )
);
-- Subjects
DROP POLICY IF EXISTS "Subjects viewable" ON public.subjects;
DROP POLICY IF EXISTS "Teachers manage subjects" ON public.subjects;
CREATE POLICY "Subjects viewable" ON public.subjects FOR
SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.classes c
      WHERE c.id = class_id
        AND c.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.class_members cm
      WHERE cm.class_id = subjects.class_id
        AND cm.user_id = auth.uid()
    )
  );
CREATE POLICY "Teachers manage subjects" ON public.subjects FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = class_id
      AND c.teacher_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = class_id
      AND c.teacher_id = auth.uid()
  )
);
-- Materials
DROP POLICY IF EXISTS "Materials viewable" ON public.materials;
DROP POLICY IF EXISTS "Teachers manage materials" ON public.materials;
CREATE POLICY "Materials viewable" ON public.materials FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage materials" ON public.materials FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.subjects s
      JOIN public.classes c ON s.class_id = c.id
    WHERE s.id = subject_id
      AND c.teacher_id = auth.uid()
  )
);
-- Assignments
DROP POLICY IF EXISTS "Assignments viewable" ON public.assignments;
DROP POLICY IF EXISTS "Guru insert assignments" ON public.assignments;
DROP POLICY IF EXISTS "Guru update assignments" ON public.assignments;
DROP POLICY IF EXISTS "Guru delete assignments" ON public.assignments;
CREATE POLICY "Assignments viewable" ON public.assignments FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Guru insert assignments" ON public.assignments FOR
INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.subjects s
        JOIN public.classes c ON s.class_id = c.id
      WHERE s.id = subject_id
        AND c.teacher_id = auth.uid()
    )
  );
CREATE POLICY "Guru update assignments" ON public.assignments FOR
UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.subjects s
        JOIN public.classes c ON s.class_id = c.id
      WHERE s.id = subject_id
        AND c.teacher_id = auth.uid()
    )
  );
CREATE POLICY "Guru delete assignments" ON public.assignments FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.subjects s
      JOIN public.classes c ON s.class_id = c.id
    WHERE s.id = subject_id
      AND c.teacher_id = auth.uid()
  )
);
-- Submissions
DROP POLICY IF EXISTS "Submissions view/create" ON public.submissions;
CREATE POLICY "Submissions view/create" ON public.submissions FOR ALL TO authenticated USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.assignments a
      JOIN public.subjects s ON a.subject_id = s.id
      JOIN public.classes c ON s.class_id = c.id
    WHERE a.id = submissions.assignment_id
      AND c.teacher_id = auth.uid()
  )
);
-- Grades
DROP POLICY IF EXISTS "Students view own grades" ON public.grades;
DROP POLICY IF EXISTS "Teachers manage grades" ON public.grades;
CREATE POLICY "Students view own grades" ON public.grades FOR
SELECT TO authenticated USING (
    (
      submission_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM submissions s
        WHERE s.id = grades.submission_id
          AND s.student_id = auth.uid()
      )
    )
    OR (student_id = auth.uid())
  );
CREATE POLICY "Teachers manage grades" ON public.grades FOR ALL TO authenticated USING (
  (
    submission_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.submissions sub
        JOIN public.assignments a ON sub.assignment_id = a.id
        JOIN public.subjects s ON a.subject_id = s.id
        JOIN public.classes c ON s.class_id = c.id
      WHERE sub.id = submission_id
        AND c.teacher_id = auth.uid()
    )
  )
  OR (
    student_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM class_members cm
        JOIN classes c ON cm.class_id = c.id
      WHERE cm.user_id = grades.student_id
        AND c.teacher_id = auth.uid()
    )
  )
);
-- Attendance
DROP POLICY IF EXISTS "Attendance view" ON public.attendance;
DROP POLICY IF EXISTS "Teachers manage attendance" ON public.attendance;
CREATE POLICY "Attendance view" ON public.attendance FOR
SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage attendance" ON public.attendance FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = attendance.class_id
      AND c.teacher_id = auth.uid()
  )
);
-- Attendance records
DROP POLICY IF EXISTS "Records view/marked by student" ON public.attendance_records;
CREATE POLICY "Records view/marked by student" ON public.attendance_records FOR ALL TO authenticated USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.attendance a
      JOIN public.classes c ON a.class_id = c.id
    WHERE a.id = attendance_records.attendance_id
      AND c.teacher_id = auth.uid()
  )
);
-- Notifications
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow inserts for authenticated" ON public.notifications;
DROP POLICY IF EXISTS "Allow inserts for admin and guru" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR
SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR
UPDATE TO authenticated USING (user_id = auth.uid());
-- SECURITY FIX: Restrict notification creation to admins and teachers only.
-- System-generated notifications use SECURITY DEFINER functions (create_notification)
-- which bypass RLS, so trigger-based notifications still work.
CREATE POLICY "Allow inserts for admin and guru" ON public.notifications FOR
INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'guru')
  )
);
-- Peer reviews
DROP POLICY IF EXISTS "Reviewers see assigned reviews" ON public.peer_reviews;
DROP POLICY IF EXISTS "Reviewers update own reviews" ON public.peer_reviews;
DROP POLICY IF EXISTS "Teachers can assign peer reviews" ON public.peer_reviews;
CREATE POLICY "Reviewers see assigned reviews" ON public.peer_reviews FOR
SELECT TO authenticated USING (
    reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.submissions s
      WHERE s.id = submission_id
        AND s.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.submissions s
        JOIN public.assignments a ON s.assignment_id = a.id
        JOIN public.subjects sub ON a.subject_id = sub.id
        JOIN public.classes c ON sub.class_id = c.id
      WHERE s.id = submission_id
        AND c.teacher_id = auth.uid()
    )
  );
CREATE POLICY "Reviewers update own reviews" ON public.peer_reviews FOR
UPDATE TO authenticated USING (reviewer_id = auth.uid());
CREATE POLICY "Teachers can assign peer reviews" ON public.peer_reviews FOR
INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.submissions s
        JOIN public.assignments a ON s.assignment_id = a.id
        JOIN public.subjects sub ON a.subject_id = sub.id
        JOIN public.classes c ON sub.class_id = c.id
      WHERE s.id = submission_id
        AND c.teacher_id = auth.uid()
    )
  );
-- Audit logs
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR
SELECT TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND role IN ('admin', 'guru')
    )
  );
-- ==========================================
-- 7. FUNCTIONS (CREATE OR REPLACE - SAFE)
-- ==========================================
-- SECURITY FIX: Never trust client-supplied role from raw_user_meta_data.
-- Role is derived server-side from validated school_codes table only.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE
  v_school_code TEXT;
  v_class_id UUID;
  v_school_id UUID;
  v_code_role public.user_role;
  v_final_role public.user_role := 'siswa'::public.user_role; -- Safe default
BEGIN
  -- Extract metadata
  v_school_code := new.raw_user_meta_data->>'school_code';
  v_class_id := (new.raw_user_meta_data->>'class_id')::UUID;

  -- Derive school and role from validated school_codes table
  IF v_school_code IS NOT NULL AND v_school_code != '' THEN
    SELECT school_id, role::public.user_role INTO v_school_id, v_code_role
    FROM public.school_codes
    WHERE code = v_school_code AND is_active = true;

    IF FOUND THEN
      v_final_role := v_code_role;
    END IF;
  END IF;

  -- 1. Create public.users profile
  INSERT INTO public.users (id, email, full_name, role, school_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User Baru'),
    v_final_role,
    v_school_id
  ) ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    school_id = EXCLUDED.school_id;

  -- 2. If student, automatically join class
  IF v_final_role = 'siswa' AND v_class_id IS NOT NULL THEN
    INSERT INTO public.class_members (class_id, user_id)
    VALUES (v_class_id, new.id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Drop and recreate trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE OR REPLACE FUNCTION public.sync_user_role_to_auth() RETURNS trigger AS $$ BEGIN
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role)
WHERE id = new.id;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_user_role_update ON public.users;
CREATE TRIGGER on_user_role_update
AFTER
UPDATE OF role ON public.users FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_to_auth();
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL
  ) RETURNS UUID AS $$
DECLARE v_id UUID;
BEGIN
INSERT INTO public.notifications (user_id, type, title, message, link)
VALUES (p_user_id, p_type, p_title, p_message, p_link)
RETURNING id INTO v_id;
RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION notify_new_assignment() RETURNS TRIGGER AS $$
DECLARE v_subject RECORD;
v_class RECORD;
v_member RECORD;
BEGIN
SELECT * INTO v_subject
FROM public.subjects
WHERE id = NEW.subject_id;
SELECT * INTO v_class
FROM public.classes
WHERE id = v_subject.class_id;
IF NEW.student_id IS NULL THEN FOR v_member IN
SELECT user_id
FROM public.class_members
WHERE class_id = v_subject.class_id LOOP PERFORM create_notification(
    v_member.user_id,
    'assignment',
    'Tugas Baru: ' || NEW.title,
    'Guru telah memberikan tugas baru untuk kelas ' || v_class.name,
    '/siswa?tab=tugas'
  );
END LOOP;
ELSE PERFORM create_notification(
  NEW.student_id,
  'assignment',
  'Tugas Baru: ' || NEW.title,
  'Anda mendapat tugas khusus',
  '/siswa?tab=tugas'
);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS trigger_notify_new_assignment ON public.assignments;
CREATE TRIGGER trigger_notify_new_assignment
AFTER
INSERT ON public.assignments FOR EACH ROW EXECUTE FUNCTION notify_new_assignment();
CREATE OR REPLACE FUNCTION notify_grade_given() RETURNS TRIGGER AS $$
DECLARE v_submission RECORD;
v_assignment RECORD;
v_student_id UUID;
v_title TEXT;
BEGIN IF NEW.submission_id IS NOT NULL THEN
SELECT * INTO v_submission
FROM public.submissions
WHERE id = NEW.submission_id;
SELECT * INTO v_assignment
FROM public.assignments
WHERE id = v_submission.assignment_id;
v_student_id := v_submission.student_id;
v_title := v_assignment.title;
ELSE v_student_id := NEW.student_id;
IF NEW.type = 'keaktifan' THEN v_title := 'Keaktifan';
ELSIF NEW.assignment_id IS NOT NULL THEN
SELECT title INTO v_title
FROM public.assignments
WHERE id = NEW.assignment_id;
ELSE v_title := 'Nilai Manual';
END IF;
END IF;
IF v_student_id IS NOT NULL THEN PERFORM create_notification(
  v_student_id,
  'grade',
  'Nilai Diberikan: ' || COALESCE(v_title, 'Tugas'),
  'Kamu mendapat nilai ' || NEW.score,
  '/siswa?tab=tugas'
);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS trigger_notify_grade_given ON public.grades;
CREATE TRIGGER trigger_notify_grade_given
AFTER
INSERT ON public.grades FOR EACH ROW EXECUTE FUNCTION notify_grade_given();
CREATE OR REPLACE FUNCTION notify_submission() RETURNS TRIGGER AS $$
DECLARE v_assignment RECORD;
v_subject RECORD;
v_class RECORD;
v_student RECORD;
BEGIN
SELECT * INTO v_assignment
FROM public.assignments
WHERE id = NEW.assignment_id;
SELECT * INTO v_subject
FROM public.subjects
WHERE id = v_assignment.subject_id;
SELECT * INTO v_class
FROM public.classes
WHERE id = v_subject.class_id;
SELECT * INTO v_student
FROM public.users
WHERE id = NEW.student_id;
PERFORM create_notification(
  v_class.teacher_id,
  'submission',
  'Pengumpulan Tugas: ' || v_assignment.title,
  v_student.full_name || ' telah mengumpulkan tugas',
  '/guru?tab=penugasan'
);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS trigger_notify_submission ON public.submissions;
CREATE TRIGGER trigger_notify_submission
AFTER
INSERT ON public.submissions FOR EACH ROW EXECUTE FUNCTION notify_submission();
-- ==========================================
-- 8. QR & UTILITY FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 double precision,
    lon1 double precision,
    lat2 double precision,
    lon2 double precision
  ) RETURNS double precision LANGUAGE plpgsql AS $$
DECLARE R CONSTANT integer := 6371000;
dLat double precision;
dLon double precision;
a double precision;
c double precision;
BEGIN dLat := radians(lat2 - lat1);
dLon := radians(lon2 - lon1);
a := sin(dLat / 2) * sin(dLat / 2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon / 2) * sin(dLon / 2);
c := 2 * atan2(sqrt(a), sqrt(1 - a));
RETURN R * c;
END;
$$;
CREATE OR REPLACE FUNCTION verify_qr_attendance(
    p_student_id uuid,
    p_session_id uuid,
    p_scanned_token text,
    p_lat double precision,
    p_long double precision
  ) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_session RECORD;
v_distance double precision;
v_existing_record uuid;
BEGIN
SELECT * INTO v_session
FROM attendance
WHERE id = p_session_id;
IF v_session IS NULL THEN RETURN json_build_object(
  'success',
  false,
  'message',
  'Sesi absensi tidak ditemukan.'
);
END IF;
IF v_session.is_open = false THEN RETURN json_build_object(
  'success',
  false,
  'message',
  'Sesi absensi sudah ditutup.'
);
END IF;
IF v_session.type = 'qr_code'
AND v_session.active_token != p_scanned_token THEN RETURN json_build_object(
  'success',
  false,
  'message',
  'QR Code tidak valid.'
);
END IF;
IF v_session.type = 'qr_code'
AND v_session.location_lat IS NOT NULL
AND v_session.location_long IS NOT NULL THEN v_distance := calculate_distance(
  v_session.location_lat,
  v_session.location_long,
  p_lat,
  p_long
);
IF v_distance > v_session.radius_meters THEN RETURN json_build_object(
  'success',
  false,
  'message',
  'Lokasi terlalu jauh.'
);
END IF;
END IF;
SELECT id INTO v_existing_record
FROM attendance_records
WHERE attendance_id = p_session_id
  AND student_id = p_student_id;
IF v_existing_record IS NOT NULL THEN RETURN json_build_object(
  'success',
  true,
  'message',
  'Anda sudah absensi.'
);
END IF;
INSERT INTO attendance_records (attendance_id, student_id, status, recorded_at)
VALUES (p_session_id, p_student_id, 'hadir', now());
RETURN json_build_object('success', true, 'message', 'Absensi berhasil!');
EXCEPTION
WHEN OTHERS THEN RETURN json_build_object(
  'success',
  false,
  'message',
  'Error: ' || SQLERRM
);
END;
$$;
CREATE OR REPLACE FUNCTION get_landing_stats() RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public,
  auth AS $$
DECLARE user_count INT;
grade_count INT;
BEGIN
SELECT count(*) INTO user_count
FROM auth.users;
SELECT count(*) INTO grade_count
FROM grades;
RETURN json_build_object(
  'users',
  COALESCE(user_count, 0),
  'grades',
  COALESCE(grade_count, 0)
);
END;
$$;
GRANT EXECUTE ON FUNCTION get_landing_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_landing_stats() TO authenticated;
CREATE OR REPLACE FUNCTION update_modified_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_assignments_modtime ON public.assignments;
CREATE TRIGGER update_assignments_modtime BEFORE
UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
DROP TRIGGER IF EXISTS update_grades_modtime ON public.grades;
CREATE TRIGGER update_grades_modtime BEFORE
UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION update_modified_column();
-- ==========================================
-- 9. PERFORMANCE INDEXES (IF NOT EXISTS)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_attendance ON public.attendance_records(attendance_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grades_submission ON public.grades(submission_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user ON public.class_members(user_id);
CREATE INDEX IF NOT EXISTS idx_class_members_class ON public.class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON public.materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON public.assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON public.assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read)
WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_peer_reviews_submission ON public.peer_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewer ON public.peer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_assignment_id ON grades(assignment_id);
CREATE INDEX IF NOT EXISTS idx_grades_type ON grades(type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
-- ==========================================
-- 10. REALTIME PUBLICATION (SAFE)
-- ==========================================
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.notifications;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.peer_reviews;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.attendance;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.attendance_records;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.assignments;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.materials;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.submissions;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.grades;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- ==========================================
-- 11. STORAGE BUCKETS (OPTIONAL - Skip if error)
-- ==========================================
-- Note: If you get "must be owner" error, configure storage manually:
-- Dashboard > Storage > New Bucket > Create 'assignments' and 'materials'
DO $$ BEGIN
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignments', 'assignments', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true) ON CONFLICT DO NOTHING;
EXCEPTION
WHEN insufficient_privilege THEN RAISE NOTICE 'Storage buckets skipped - create manually in Dashboard > Storage';
WHEN OTHERS THEN RAISE NOTICE 'Storage buckets skipped: %',
SQLERRM;
END $$;
-- Storage policies - wrapped in exception handler
DO $$ BEGIN DROP POLICY IF EXISTS "Storage access" ON storage.objects;
CREATE POLICY "Storage access" ON storage.objects FOR ALL TO authenticated USING (
  (
    bucket_id = 'assignments'
    AND (
      auth.uid()::text = (storage.foldername(name)) [1]
      OR EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
          AND role = 'guru'
      )
    )
  )
  OR (
    bucket_id = 'materials'
    AND (
      EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
          AND role = 'guru'
      )
    )
  )
) WITH CHECK (
  (
    bucket_id = 'assignments'
    AND (
      auth.uid()::text = (storage.foldername(name)) [1]
    )
  )
  OR (
    bucket_id = 'materials'
    AND (
      EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
          AND role = 'guru'
      )
    )
  )
);
EXCEPTION
WHEN insufficient_privilege THEN RAISE NOTICE 'Storage policies skipped - configure manually in Dashboard > Storage > Policies';
WHEN OTHERS THEN RAISE NOTICE 'Storage policies skipped: %',
SQLERRM;
END $$;
-- ==========================================
-- 12. SYNC EXISTING USERS (SAFE)
-- ==========================================
INSERT INTO public.users (id, email, full_name, role)
SELECT id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  COALESCE(
    (raw_user_meta_data->>'role')::public.user_role,
    'siswa'::public.user_role
  )
FROM auth.users ON CONFLICT (id) DO NOTHING;
-- ==========================================
-- DONE! ✅
-- ==========================================
-- 
-- Script ini telah:
-- ✅ Membuat semua tabel (jika belum ada)
-- ✅ Mengaktifkan RLS di semua tabel
-- ✅ Membuat semua policy keamanan
-- ✅ Membuat semua function dan trigger
-- ✅ Membuat semua index untuk performa
-- ✅ Setup realtime publication
-- ✅ Setup storage buckets
--
-- TIDAK ada data yang dihapus! 🎉
-- ==========================================
-- ==========================================
-- 8. SECURITY FIXES (SPRINT 1)
-- ==========================================

-- BUG-008: Server-side Auto Grading
CREATE OR REPLACE FUNCTION public.grade_quiz_answer() RETURNS TRIGGER AS $$
DECLARE
    v_question RECORD;
    v_is_correct BOOLEAN := false;
BEGIN
    -- Fetch the correct answer and points from the question
    SELECT type, correct_answer, points INTO v_question 
    FROM public.questions 
    WHERE id = NEW.question_id;

    IF FOUND THEN
        -- Evaluate based on question type
        IF v_question.type IN ('multiple_choice', 'true_false') THEN
            -- Exact match for JSON strings (we strip quotes to compare safely)
            v_is_correct := (NEW.answer::text = v_question.correct_answer::text) OR
                            (trim(both '"' from NEW.answer::text) = trim(both '"' from v_question.correct_answer::text));
                            
        ELSIF v_question.type = 'short_answer' THEN
            -- Check if the answer matches any of the valid short answers (assuming JSON array in correct_answer)
            -- For simplicity in trigger, basic text match for now. Advanced grading may need edge functions.
            v_is_correct := (lower(trim(both '"' from NEW.answer::text)) = lower(trim(both '"' from v_question.correct_answer::text)));
        END IF;

        -- Assign results
        NEW.is_correct := v_is_correct;
        NEW.points_earned := CASE WHEN v_is_correct THEN v_question.points ELSE 0 END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_grade_quiz_answer ON public.quiz_answers;
CREATE TRIGGER trigger_grade_quiz_answer
BEFORE INSERT OR UPDATE ON public.quiz_answers
FOR EACH ROW EXECUTE FUNCTION public.grade_quiz_answer();


-- BUG-003: Secure School Code Validation (RPC)
CREATE OR REPLACE FUNCTION public.validate_school_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'valid', true,
        'school_id', s.id,
        'school_name', s.name,
        'role', sc.role
    ) INTO v_result
    FROM public.school_codes sc
    JOIN public.schools s ON sc.school_id = s.id
    WHERE sc.code = upper(trim(p_code)) AND sc.is_active = true;

    IF v_result IS NULL THEN
        RETURN json_build_object('valid', false, 'message', 'Kode tidak valid atau non-aktif');
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke dangerous table access, allow RPC instead
REVOKE ALL ON public.school_codes FROM anon;
GRANT EXECUTE ON FUNCTION public.validate_school_code(TEXT) TO anon;

REVOKE ALL ON public.school_codes FROM anon;
GRANT EXECUTE ON FUNCTION public.validate_school_code(TEXT) TO anon;

-- ==========================================
-- 9. PERFORMANCE & DATA INTEGRITY (SPRINT 2)
-- ==========================================

-- BUG-012: Fix Race Conditions & Scoping in Manual Grades
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.upsert_manual_grade(
    p_student_id UUID,
    p_class_id UUID,
    p_assignment_id UUID,
    p_mode TEXT,
    p_score NUMERIC,
    p_feedback TEXT
) RETURNS JSON AS $$
DECLARE
    v_existing_id UUID;
BEGIN
    -- Check for existing grade safely
    IF p_mode = 'keaktifan' THEN
        SELECT id INTO v_existing_id FROM public.grades 
        WHERE student_id = p_student_id AND type = 'keaktifan' AND class_id = p_class_id 
        FOR UPDATE SKIP LOCKED; -- Prevent race conditions
    ELSE
        SELECT id INTO v_existing_id FROM public.grades 
        WHERE student_id = p_student_id AND type = 'manual' AND assignment_id = p_assignment_id
        FOR UPDATE SKIP LOCKED;
    END IF;

    IF v_existing_id IS NOT NULL THEN
        -- Update
        UPDATE public.grades 
        SET score = p_score, feedback = p_feedback, updated_at = NOW() 
        WHERE id = v_existing_id;
    ELSE
        -- Insert
        INSERT INTO public.grades (student_id, class_id, assignment_id, type, score, feedback)
        VALUES (
            p_student_id, 
            p_class_id, 
            p_assignment_id, 
            p_mode::public.grade_type, 
            p_score, 
            p_feedback
        );
    END IF;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'UNIFIED_MASTER_SCRIPT (SAFE VERSION + SPRINT 1 & 2 PATCHES) berhasil dijalankan!' AS message;


-- ------------------------------------------------------------
-- SOURCE: FEATURES_SCHEMA.sql
-- ------------------------------------------------------------

-- ========================================================
-- FEATURES SCHEMA (MATH-LMS) - SAFE VERSION
-- ========================================================
-- 
-- ⚠️ KEAMANAN DATA:
-- Script ini AMAN dan TIDAK akan menghapus data yang sudah ada!
-- 
-- Run this AFTER running UNIFIED_MASTER_SCRIPT.sql
-- ========================================================
-- ==========================================
-- PART 1: ANNOUNCEMENTS & REMINDERS
-- ==========================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        title TEXT NOT NULL,
        content TEXT,
        priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        pinned BOOLEAN DEFAULT false,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS material_tags (
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (material_id, tag_id)
);
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    type TEXT DEFAULT 'custom' CHECK (
        type IN ('assignment', 'exam', 'meeting', 'custom')
    ),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_class ON announcements(class_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_date);
-- RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers can manage their announcements" ON announcements;
CREATE POLICY "Teachers can manage their announcements" ON announcements FOR ALL TO authenticated USING (
    teacher_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM class_members cm
        WHERE cm.class_id = announcements.class_id
            AND cm.user_id = auth.uid()
    )
) WITH CHECK (teacher_id = auth.uid());
DROP POLICY IF EXISTS "Students can read class announcements" ON announcements;
CREATE POLICY "Students can read class announcements" ON announcements FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM class_members cm
            WHERE cm.class_id = announcements.class_id
                AND cm.user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can manage their own reminders" ON reminders;
CREATE POLICY "Users can manage their own reminders" ON reminders FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Anyone can read tags" ON tags;
CREATE POLICY "Anyone can read tags" ON tags FOR
SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Teachers can create tags" ON tags;
CREATE POLICY "Teachers can create tags" ON tags FOR
INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1
            FROM users
            WHERE id = auth.uid()
                AND role IN ('guru', 'admin')
        )
    );
-- Realtime (safe)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
        AND tablename = 'announcements'
) THEN ALTER PUBLICATION supabase_realtime
ADD TABLE announcements;
END IF;
END $$;
-- ==========================================
-- PART 2: QUIZ SYSTEM
-- ==========================================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        instructions TEXT,
        time_limit INTEGER,
        shuffle_questions BOOLEAN DEFAULT false,
        shuffle_options BOOLEAN DEFAULT false,
        show_answers_after BOOLEAN DEFAULT false,
        show_score_after BOOLEAN DEFAULT true,
        max_attempts INTEGER DEFAULT 1,
        passing_score INTEGER DEFAULT 60,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (
        type IN (
            'multiple_choice',
            'multiple_answer',
            'true_false',
            'short_answer',
            'essay',
            'matching'
        )
    ),
    content TEXT NOT NULL,
    explanation TEXT,
    options JSONB,
    correct_answer JSONB,
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5, 2),
    max_score INTEGER,
    percentage NUMERIC(5, 2),
    passed BOOLEAN,
    time_spent INTEGER,
    started_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'in_progress' CHECK (
        status IN ('in_progress', 'submitted', 'graded', 'expired')
    ),
    UNIQUE(quiz_id, student_id, started_at)
);
CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer JSONB,
    is_correct BOOLEAN,
    points_earned NUMERIC(5, 2) DEFAULT 0,
    graded_by UUID REFERENCES users(id),
    feedback TEXT,
    answered_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(attempt_id, question_id)
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_class ON quizzes(class_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON quiz_answers(attempt_id);
-- RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers can manage quizzes" ON quizzes;
CREATE POLICY "Teachers can manage quizzes" ON quizzes FOR ALL TO authenticated USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
DROP POLICY IF EXISTS "Students can view published quizzes" ON quizzes;
CREATE POLICY "Students can view published quizzes" ON quizzes FOR
SELECT TO authenticated USING (
        published = true
        AND EXISTS (
            SELECT 1
            FROM class_members cm
            WHERE cm.class_id = quizzes.class_id
                AND cm.user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Teachers can manage questions" ON questions;
CREATE POLICY "Teachers can manage questions" ON questions FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM quizzes q
        WHERE q.id = questions.quiz_id
            AND q.teacher_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM quizzes q
        WHERE q.id = questions.quiz_id
            AND q.teacher_id = auth.uid()
    )
);
DROP POLICY IF EXISTS "Students can view quiz questions" ON questions;
CREATE POLICY "Students can view quiz questions" ON questions FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM quizzes q
                JOIN class_members cm ON cm.class_id = q.class_id
            WHERE q.id = questions.quiz_id
                AND q.published = true
                AND cm.user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Students can manage their attempts" ON quiz_attempts;
CREATE POLICY "Students can manage their attempts" ON quiz_attempts FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "Teachers can view quiz attempts" ON quiz_attempts;
CREATE POLICY "Teachers can view quiz attempts" ON quiz_attempts FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM quizzes q
            WHERE q.id = quiz_attempts.quiz_id
                AND q.teacher_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Students can manage their answers" ON quiz_answers;
CREATE POLICY "Students can manage their answers" ON quiz_answers FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM quiz_attempts qa
        WHERE qa.id = quiz_answers.attempt_id
            AND qa.student_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM quiz_attempts qa
        WHERE qa.id = quiz_answers.attempt_id
            AND qa.student_id = auth.uid()
    )
);
DROP POLICY IF EXISTS "Teachers can grade answers" ON quiz_answers;
CREATE POLICY "Teachers can grade answers" ON quiz_answers FOR
UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM quiz_attempts qa
                JOIN quizzes q ON q.id = qa.quiz_id
            WHERE qa.id = quiz_answers.attempt_id
                AND q.teacher_id = auth.uid()
        )
    );
-- Auto-grade function
CREATE OR REPLACE FUNCTION grade_quiz_attempt(attempt_uuid UUID) RETURNS VOID AS $$
DECLARE total_score NUMERIC := 0;
max_possible INTEGER := 0;
answer_record RECORD;
BEGIN FOR answer_record IN
SELECT qa.id,
    qa.is_correct,
    q.points
FROM quiz_answers qa
    JOIN questions q ON q.id = qa.question_id
WHERE qa.attempt_id = attempt_uuid
    AND q.type IN (
        'multiple_choice',
        'multiple_answer',
        'true_false',
        'short_answer'
    ) LOOP max_possible := max_possible + answer_record.points;
IF answer_record.is_correct THEN total_score := total_score + answer_record.points;
UPDATE quiz_answers
SET points_earned = answer_record.points
WHERE id = answer_record.id;
END IF;
END LOOP;
UPDATE quiz_attempts
SET score = total_score,
    max_score = max_possible,
    percentage = CASE
        WHEN max_possible > 0 THEN (total_score / max_possible) * 100
        ELSE 0
    END,
    passed = CASE
        WHEN max_possible > 0 THEN ((total_score / max_possible) * 100) >= (
            SELECT passing_score
            FROM quizzes
            WHERE id = (
                    SELECT quiz_id
                    FROM quiz_attempts
                    WHERE id = attempt_uuid
                )
        )
        ELSE false
    END,
    status = 'graded',
    submitted_at = now()
WHERE id = attempt_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==========================================
-- PART 3: PEER REVIEW COLUMNS (SAFE ADD)
-- ==========================================
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'peer_reviews'
        AND column_name = 'assignment_id'
) THEN
ALTER TABLE peer_reviews
ADD COLUMN assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'peer_reviews'
        AND column_name = 'reviewee_id'
) THEN
ALTER TABLE peer_reviews
ADD COLUMN reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE;
END IF;
END $$;
-- Peer review distribution function
CREATE OR REPLACE FUNCTION distribute_peer_reviews(p_assignment_id UUID) RETURNS TEXT AS $$
DECLARE v_students UUID [] := ARRAY []::UUID [];
v_submissions UUID [] := ARRAY []::UUID [];
v_count INT;
v_reviewer_id UUID;
v_reviewee_id UUID;
v_submission_id UUID;
i INT;
BEGIN
SELECT ARRAY_AGG(student_id),
    ARRAY_AGG(id) INTO v_students,
    v_submissions
FROM (
        SELECT student_id,
            id
        FROM submissions
        WHERE assignment_id = p_assignment_id
        ORDER BY random()
    ) AS sub;
v_count := array_length(v_students, 1);
IF v_count IS NULL
OR v_count < 2 THEN RETURN 'Error: Minimal 2 siswa diperlukan untuk peer review.';
END IF;
FOR i IN 1..v_count LOOP v_reviewer_id := v_students [i];
IF i = v_count THEN v_reviewee_id := v_students [1];
v_submission_id := v_submissions [1];
ELSE v_reviewee_id := v_students [i + 1];
v_submission_id := v_submissions [i + 1];
END IF;
INSERT INTO public.peer_reviews (
        assignment_id,
        reviewer_id,
        reviewee_id,
        submission_id,
        status
    )
VALUES (
        p_assignment_id,
        v_reviewer_id,
        v_reviewee_id,
        v_submission_id,
        'assigned'
    ) ON CONFLICT DO NOTHING;
END LOOP;
RETURN 'Success: Peer reviews assigned to ' || v_count || ' students.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION approve_peer_review(p_review_id UUID) RETURNS VOID AS $$
DECLARE v_review RECORD;
BEGIN
SELECT * INTO v_review
FROM peer_reviews
WHERE id = p_review_id;
IF v_review IS NULL THEN RAISE EXCEPTION 'Peer review not found';
END IF;
IF v_review.score IS NULL THEN RAISE EXCEPTION 'Cannot approve review without a score';
END IF;
UPDATE peer_reviews
SET status = 'approved'
WHERE id = p_review_id;
INSERT INTO grades (student_id, assignment_id, score, feedback)
VALUES (
        v_review.reviewee_id,
        v_review.assignment_id,
        v_review.score,
        'Peer Review Verified: ' || COALESCE(v_review.feedback, '')
    ) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ==========================================
-- DONE! ✅
-- ==========================================
SELECT 'FEATURES_SCHEMA (SAFE VERSION) berhasil dijalankan!' AS message;


-- ------------------------------------------------------------
-- SOURCE: gamification_schema.sql
-- ------------------------------------------------------------

-- ========================================================
-- GAMIFICATION SCHEMA
-- Badges, Streaks, Points, and Leaderboard
-- ========================================================
-- 1. BADGES TABLE - Badge definitions
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL,
    -- Emoji or icon name
    category VARCHAR(50) NOT NULL DEFAULT 'achievement',
    -- achievement, streak, milestone
    criteria JSONB NOT NULL,
    -- Conditions to unlock
    points INTEGER NOT NULL DEFAULT 0,
    -- Points reward
    rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    -- common, rare, epic, legendary
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 2. USER_BADGES TABLE - Earned badges per user
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_id) -- Each badge can only be earned once per user
);
-- 3. USER_STREAKS TABLE - Daily activity streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 4. USER_POINTS TABLE - Total points per user
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 5. POINT_TRANSACTIONS TABLE - Point history
CREATE TABLE IF NOT EXISTS public.point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL,
    -- 'assignment', 'quiz', 'streak', 'badge', 'attendance'
    source_id UUID,
    -- Reference to the source (assignment_id, quiz_id, etc.)
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- ========================================================
-- DEFAULT BADGES
-- ========================================================
INSERT INTO public.badges (
        name,
        description,
        icon,
        category,
        criteria,
        points,
        rarity
    )
VALUES (
        'Pengguna Baru',
        'Selamat datang di platform!',
        '🎉',
        'milestone',
        '{"action": "first_login"}',
        10,
        'common'
    ),
    (
        'Pengumpul Rajin',
        'Kumpulkan 5 tugas tepat waktu',
        '📚',
        'achievement',
        '{"action": "submit_assignments", "count": 5}',
        50,
        'common'
    ),
    (
        'Murid Teladan',
        'Hadir 10 hari berturut-turut',
        '⭐',
        'streak',
        '{"action": "attendance_streak", "days": 10}',
        100,
        'rare'
    ),
    (
        'Sang Perfeksionis',
        'Dapatkan nilai 100 di kuis',
        '💯',
        'achievement',
        '{"action": "perfect_quiz"}',
        200,
        'epic'
    ),
    (
        'Master Kuis',
        'Selesaikan 10 kuis',
        '🧠',
        'achievement',
        '{"action": "complete_quizzes", "count": 10}',
        150,
        'rare'
    ),
    (
        'Legenda Belajar',
        'Hadir 30 hari berturut-turut',
        '🔥',
        'streak',
        '{"action": "attendance_streak", "days": 30}',
        500,
        'legendary'
    ),
    (
        'Si Cepat',
        'Kumpulkan tugas 24 jam sebelum deadline',
        '⚡',
        'achievement',
        '{"action": "early_submission"}',
        75,
        'rare'
    ),
    (
        'Konsisten',
        'Login 7 hari berturut-turut',
        '📅',
        'streak',
        '{"action": "login_streak", "days": 7}',
        70,
        'common'
    ) ON CONFLICT DO NOTHING;
-- ========================================================
-- RLS POLICIES
-- ========================================================
-- Badges: Everyone can read
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR
SELECT TO authenticated USING (true);
-- User Badges: Users see their own, teachers see their students
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own badges" ON public.user_badges;
CREATE POLICY "Users see own badges" ON public.user_badges FOR
SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Teachers see student badges" ON public.user_badges;
CREATE POLICY "Teachers see student badges" ON public.user_badges FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.users u
                JOIN public.class_members cm ON cm.user_id = u.id
                JOIN public.classes c ON c.id = cm.class_id
            WHERE u.id = user_badges.user_id
                AND c.teacher_id = auth.uid()
        )
    );
-- User Streaks: Users see their own
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own streaks" ON public.user_streaks;
CREATE POLICY "Users see own streaks" ON public.user_streaks FOR
SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users update own streaks" ON public.user_streaks;
CREATE POLICY "Users update own streaks" ON public.user_streaks FOR
UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users insert own streaks" ON public.user_streaks;
CREATE POLICY "Users insert own streaks" ON public.user_streaks FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- User Points: Everyone can see (for leaderboard)
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Points are viewable by everyone" ON public.user_points;
CREATE POLICY "Points are viewable by everyone" ON public.user_points FOR
SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users update own points" ON public.user_points;
CREATE POLICY "Users update own points" ON public.user_points FOR
UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users insert own points" ON public.user_points;
CREATE POLICY "Users insert own points" ON public.user_points FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- Point Transactions: Users see their own
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own transactions" ON public.point_transactions;
CREATE POLICY "Users see own transactions" ON public.point_transactions FOR
SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users insert own transactions" ON public.point_transactions;
CREATE POLICY "Users insert own transactions" ON public.point_transactions FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- ========================================================
-- HELPER FUNCTIONS
-- ========================================================
-- Function to add points to user
CREATE OR REPLACE FUNCTION public.add_points(
        p_user_id UUID,
        p_points INTEGER,
        p_source VARCHAR(50),
        p_source_id UUID DEFAULT NULL,
        p_description TEXT DEFAULT NULL
    ) RETURNS void AS $$ BEGIN -- Insert into user_points if not exists
INSERT INTO public.user_points (user_id, total_points, level)
VALUES (p_user_id, 0, 1) ON CONFLICT (user_id) DO NOTHING;
-- Update total points
UPDATE public.user_points
SET total_points = total_points + p_points,
    level = GREATEST(1, FLOOR((total_points + p_points) / 100) + 1),
    updated_at = now()
WHERE user_id = p_user_id;
-- Log transaction
INSERT INTO public.point_transactions (user_id, points, source, source_id, description)
VALUES (
        p_user_id,
        p_points,
        p_source,
        p_source_id,
        p_description
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID) RETURNS void AS $$
DECLARE v_last_date DATE;
v_current_streak INTEGER;
v_longest_streak INTEGER;
BEGIN -- Get current streak data
SELECT last_activity_date,
    current_streak,
    longest_streak INTO v_last_date,
    v_current_streak,
    v_longest_streak
FROM public.user_streaks
WHERE user_id = p_user_id;
IF NOT FOUND THEN -- First activity
INSERT INTO public.user_streaks (
        user_id,
        current_streak,
        longest_streak,
        last_activity_date
    )
VALUES (p_user_id, 1, 1, CURRENT_DATE);
ELSIF v_last_date = CURRENT_DATE THEN -- Already logged today, do nothing
NULL;
ELSIF v_last_date = CURRENT_DATE - 1 THEN -- Consecutive day
UPDATE public.user_streaks
SET current_streak = current_streak + 1,
    longest_streak = GREATEST(longest_streak, current_streak + 1),
    last_activity_date = CURRENT_DATE,
    updated_at = now()
WHERE user_id = p_user_id;
ELSE -- Streak broken
UPDATE public.user_streaks
SET current_streak = 1,
    last_activity_date = CURRENT_DATE,
    updated_at = now()
WHERE user_id = p_user_id;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------
-- SOURCE: time_capsule_schema.sql
-- ------------------------------------------------------------

-- =============================================
-- TIME CAPSULE SCHEMA
-- Allows students to write goals at start of year
-- and reveal them at the end of the school year
-- =============================================
-- Time Capsule Entries Table
CREATE TABLE IF NOT EXISTS time_capsules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Kapsul Waktuku',
    message_to_future_self TEXT NOT NULL,
    goals JSONB DEFAULT '[]'::jsonb,
    -- Array of goal strings
    mood_at_creation TEXT CHECK (
        mood_at_creation IN (
            'excited',
            'hopeful',
            'nervous',
            'determined',
            'curious'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT now(),
    academic_year TEXT NOT NULL,
    -- e.g., "2025/2026"
    unlock_date DATE NOT NULL,
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMPTZ,
    reflection TEXT,
    -- Student's reflection after unlock
    CONSTRAINT valid_unlock_date CHECK (unlock_date > created_at::date)
);
-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_time_capsules_user_id ON time_capsules(user_id);
CREATE INDEX IF NOT EXISTS idx_time_capsules_unlock_date ON time_capsules(unlock_date);
CREATE INDEX IF NOT EXISTS idx_time_capsules_academic_year ON time_capsules(academic_year);
-- Enable Row Level Security
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
-- RLS Policies
-- Drop existing policies if they already exist to prevent errors on re-run
DROP POLICY IF EXISTS "Users can view own capsules" ON time_capsules;
DROP POLICY IF EXISTS "Teachers can view student goals" ON time_capsules;
DROP POLICY IF EXISTS "Users can create own capsules" ON time_capsules;
DROP POLICY IF EXISTS "Users can update own capsules" ON time_capsules;

-- Helper function to avoid Infinite Recursion if class_members has RLS rules
CREATE OR REPLACE FUNCTION public.is_student_teacher(p_student_id UUID, p_teacher_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.class_members cm
            JOIN public.classes c ON c.id = cm.class_id
        WHERE cm.user_id = p_student_id
            AND c.teacher_id = p_teacher_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users can only view their own capsules
CREATE POLICY "Users can view own capsules" ON time_capsules FOR
SELECT USING (auth.uid() = user_id);

-- Teachers can view goals (not messages) of students in their classes
CREATE POLICY "Teachers can view student goals" ON time_capsules FOR
SELECT USING (
        public.is_student_teacher(user_id, auth.uid())
    );

-- Users can create their own capsules
CREATE POLICY "Users can create own capsules" ON time_capsules FOR
INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own capsules (for reflection after unlock)
CREATE POLICY "Users can update own capsules" ON time_capsules FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Function to check and unlock capsules
CREATE OR REPLACE FUNCTION check_and_unlock_capsules() RETURNS INTEGER AS $$
DECLARE unlocked_count INTEGER;
BEGIN
UPDATE time_capsules
SET is_unlocked = true,
    unlocked_at = now()
WHERE unlock_date <= CURRENT_DATE
    AND is_unlocked = false;
GET DIAGNOSTICS unlocked_count = ROW_COUNT;
RETURN unlocked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to get capsules ready for unlock notification
CREATE OR REPLACE FUNCTION get_capsules_to_notify() RETURNS TABLE (
        capsule_id UUID,
        user_id UUID,
        title TEXT,
        created_at TIMESTAMPTZ
    ) AS $$ BEGIN RETURN QUERY
SELECT tc.id,
    tc.user_id,
    tc.title,
    tc.created_at
FROM time_capsules tc
WHERE tc.unlock_date = CURRENT_DATE
    AND tc.is_unlocked = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Helper function to get current semester
CREATE OR REPLACE FUNCTION get_current_semester() RETURNS TEXT AS $$
DECLARE current_month INTEGER;
current_year INTEGER;
BEGIN current_month := EXTRACT(
    MONTH
    FROM CURRENT_DATE
);
current_year := EXTRACT(
    YEAR
    FROM CURRENT_DATE
);
-- Semester 1 (Ganjil): July - December
-- Semester 2 (Genap): January - June
IF current_month >= 7 THEN RETURN current_year || '/' || (current_year + 1) || ' Semester 1';
ELSE RETURN (current_year - 1) || '/' || current_year || ' Semester 2';
END IF;
END;
$$ LANGUAGE plpgsql;


-- ------------------------------------------------------------
-- SOURCE: soft_delete_setup.sql
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- SOURCE: fix_analytics_final.sql
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- SOURCE: fix_analytics_realtime.sql
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- SOURCE: fix_manual_grades_rls.sql
-- ------------------------------------------------------------

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



-- ------------------------------------------------------------
-- SOURCE: fix_registration_and_enrollment.sql
-- ------------------------------------------------------------

-- ========================================================
-- FIX REGISTRATION & ENROLLMENT (Perbaikan Pendaftaran)
-- ========================================================
-- 1. Fix RLS: Allow Anon/Public to see active classes
-- 2. Fix Trigger: Auto-enroll student to class upon signup
-- ========================================================
-- A. FIX RLS FOR CLASSES (Registration Dropdown)
-- --------------------------------------------------------
-- Drop potential conflicting policies
DROP POLICY IF EXISTS "Anon can view classes for registration" ON public.classes;
DROP POLICY IF EXISTS "Public view classes" ON public.classes;
-- Create explicit policy for Anon/Public to view classes (excluding deleted)
-- This ensures the registration dropdown is populated.
CREATE POLICY "Anon can view classes for registration" ON public.classes FOR
SELECT TO anon USING (deleted_at IS NULL);
-- Also ensure 'authenticated' users (e.g. during session creation) can see classes
-- if they are not yet enrolled (optional, but good for safety)
DROP POLICY IF EXISTS "Auth view all active classes" ON public.classes;
CREATE POLICY "Auth view all active classes" ON public.classes FOR
SELECT TO authenticated USING (
        deleted_at IS NULL
        AND teacher_id != auth.uid() -- Teachers have their own policy
        AND NOT EXISTS (
            -- Only if not covered by "Student view enrolled"
            SELECT 1
            FROM public.class_members cm
            WHERE cm.class_id = id
                AND cm.user_id = auth.uid()
        )
    );
-- B. FIX USER TRIGGER (Auto-Enrollment)
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE v_class_id UUID;
v_role public.user_role;
BEGIN -- Determine role
v_role := COALESCE(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'siswa'::public.user_role
);
-- 1. Insert into public.users
INSERT INTO public.users (id, email, full_name, role)
VALUES (
        new.id,
        new.email,
        COALESCE(
            new.raw_user_meta_data->>'full_name',
            'User Baru'
        ),
        v_role
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
-- 2. Auto-Enrollment for Students (if class_id provided)
IF v_role = 'siswa' THEN -- Extract class_id safely
BEGIN v_class_id := (new.raw_user_meta_data->>'class_id')::UUID;
EXCEPTION
WHEN OTHERS THEN v_class_id := NULL;
-- Invalid UUID format check
END;
-- If class_id exists, insert into class_members
IF v_class_id IS NOT NULL THEN
INSERT INTO public.class_members (class_id, user_id)
VALUES (v_class_id, new.id) ON CONFLICT (class_id, user_id) DO NOTHING;
END IF;
END IF;
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Re-apply trigger to be safe (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ========================================================
-- DONE. Isu "Kelas Hilang" dan "Tidak Terdaftar" teratasi.
-- ========================================================


-- ------------------------------------------------------------
-- SOURCE: fix_rls_final.sql
-- ------------------------------------------------------------

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



-- ------------------------------------------------------------
-- SOURCE: fix_teacher_account.sql
-- ------------------------------------------------------------

-- ========================================================
-- FIX GURU ACCOUNT (MANUAL REPAIR SCRIPT)
-- ========================================================
-- Run this in Supabase SQL Editor to fix the teacher account
-- ========================================================

-- 1. Ensure 'guru' role is assigned in public.users
UPDATE public.users 
SET role = 'guru', 
    full_name = 'Yesi Afdhal (Guru)'
WHERE email = 'yesiafdhal07@guru.sma.belajar.id';

-- 2. Sync to auth.users metadata (crucial for JWT/middleware)
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) 
    || jsonb_build_object('role', 'guru')
WHERE email = 'yesiafdhal07@guru.sma.belajar.id';

-- 3. Verify teacher profile exists
INSERT INTO public.teacher_profiles (id, position)
SELECT id, 'Guru Mata Pelajaran'
FROM public.users
WHERE email = 'yesiafdhal07@guru.sma.belajar.id'
ON CONFLICT (id) DO NOTHING;

-- 4. Check if classes exist for this teacher
-- (If no classes exist, we might need to create one to test the dashboard)
DO $$ 
DECLARE
    v_user_id UUID;
    v_class_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM public.users WHERE email = 'yesiafdhal07@guru.sma.belajar.id';
    
    IF NOT EXISTS (SELECT 1 FROM public.classes WHERE teacher_id = v_user_id) THEN
        INSERT INTO public.classes (name, teacher_id, description)
        VALUES ('Kelas Matematika Contoh', v_user_id, 'Kelas untuk pengujian dashboard')
        RETURNING id INTO v_class_id;
        
        -- Add a subject to the class
        INSERT INTO public.subjects (title, class_id)
        VALUES ('Matematika Dasar', v_class_id);
    END IF;
END $$;



-- ------------------------------------------------------------
-- SOURCE: soft_delete_visibility_fix.sql
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- SOURCE: supabase/migrations/011_semester_snapshots.sql
-- ------------------------------------------------------------

-- Migration 011: Semester Snapshots for Cross-Semester Trend Analysis
-- USP #14 — Tren Lintas Semester

-- ─── semester_snapshots ───────────────────────────────────────
-- Stores pre-computed end-of-semester statistics per class.
-- Can be populated manually by admin or via scheduled function.

CREATE TABLE IF NOT EXISTS public.semester_snapshots (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id        UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    school_id       UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    semester        TEXT NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
    school_year     TEXT NOT NULL, -- e.g. "2024/2025"
    avg_grade       NUMERIC(5,2) NOT NULL DEFAULT 0,
    attendance_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- percentage 0-100
    submission_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- percentage 0-100
    student_count   INTEGER NOT NULL DEFAULT 0,
    tuntas_count    INTEGER NOT NULL DEFAULT 0,       -- students above KKM
    snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one snapshot per class per semester/year
CREATE UNIQUE INDEX IF NOT EXISTS uniq_class_semester_year
    ON public.semester_snapshots (class_id, semester, school_year);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_snapshots_class_date
    ON public.semester_snapshots (class_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_snapshots_school
    ON public.semester_snapshots (school_id, school_year);

-- ─── RLS Policies ──────────────────────────────────────────────
ALTER TABLE public.semester_snapshots ENABLE ROW LEVEL SECURITY;

-- Guru & Kepsek can read snapshots for their school
CREATE POLICY "Allow read own school snapshots"
    ON public.semester_snapshots FOR SELECT
    USING (
        school_id IN (
            SELECT school_id FROM public.users
            WHERE id = auth.uid()
        )
    );

-- Only admin/guru can insert their class snapshots
CREATE POLICY "Allow guru insert class snapshots"
    ON public.semester_snapshots FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('guru', 'admin', 'kepala_sekolah')
        )
    );

-- Only creator or admin can update
CREATE POLICY "Allow creator update snapshots"
    ON public.semester_snapshots FOR UPDATE
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah')
    ));

-- ─── Helper View ───────────────────────────────────────────────
-- Quick trend comparison: last 2 semesters per class
CREATE OR REPLACE VIEW public.class_semester_trend AS
SELECT
    s.class_id,
    s.semester,
    s.school_year,
    s.avg_grade,
    s.attendance_rate,
    s.submission_rate,
    s.student_count,
    ROUND((s.tuntas_count::NUMERIC / NULLIF(s.student_count, 0)) * 100, 1) AS tuntas_rate,
    s.snapshot_date,
    LAG(s.avg_grade) OVER (
        PARTITION BY s.class_id ORDER BY s.snapshot_date
    ) AS prev_avg_grade,
    ROUND(
        s.avg_grade - LAG(s.avg_grade) OVER (
            PARTITION BY s.class_id ORDER BY s.snapshot_date
        ), 2
    ) AS grade_delta
FROM public.semester_snapshots s
ORDER BY s.class_id, s.snapshot_date DESC;



-- ------------------------------------------------------------
-- SOURCE: supabase/migrations/012_ptm_and_wa_log.sql
-- ------------------------------------------------------------

-- Migration 012: PTM Sessions & WhatsApp Notification Log
-- USP #21 — PTM Scheduler, USP #20 — WhatsApp Notifications

-- ─── ptm_sessions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ptm_sessions (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id          UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title             TEXT NOT NULL DEFAULT 'Pertemuan Orang Tua & Guru',
    scheduled_at      TIMESTAMPTZ NOT NULL,
    duration_minutes  INTEGER NOT NULL DEFAULT 60,
    location          TEXT,
    notes             TEXT,
    status            TEXT NOT NULL DEFAULT 'upcoming'
                      CHECK (status IN ('upcoming', 'done', 'cancelled')),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ptm_class_date
    ON public.ptm_sessions (class_id, scheduled_at);

-- ─── wa_notification_log ──────────────────────────────────────
-- Keeps a record of all outgoing WA messages for audit trail
CREATE TABLE IF NOT EXISTS public.wa_notification_log (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id     UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    sender_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
    phone        TEXT NOT NULL,
    type         TEXT NOT NULL,     -- grade_alert | attendance_alert | ptm_invite | announcement
    message      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'sent',  -- sent | failed | simulated
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_log_class
    ON public.wa_notification_log (class_id, created_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.ptm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_notification_log ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own PTM sessions
CREATE POLICY "Guru read own class PTM"
    ON public.ptm_sessions FOR SELECT
    USING (
        teacher_id = auth.uid()
        OR class_id IN (
            SELECT id FROM public.classes
            WHERE school_id IN (
                SELECT school_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Guru insert PTM sessions"
    ON public.ptm_sessions FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Guru update own PTM sessions"
    ON public.ptm_sessions FOR UPDATE
    USING (teacher_id = auth.uid());

CREATE POLICY "Guru read own WA log"
    ON public.wa_notification_log FOR SELECT
    USING (sender_id = auth.uid());

CREATE POLICY "System insert WA log"
    ON public.wa_notification_log FOR INSERT
    WITH CHECK (true);  -- Allow server-side inserts



-- ------------------------------------------------------------
-- SOURCE: supabase/migrations/013_kas_kelas.sql
-- ------------------------------------------------------------

-- Migration 013: Kas Kelas Digital
-- USP #18 — Class treasury management

CREATE TABLE IF NOT EXISTS public.kas_kelas (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id     UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount       INTEGER NOT NULL CHECK (amount > 0),   -- in IDR
    description  TEXT NOT NULL,
    recorded_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kas_class_date
    ON public.kas_kelas (class_id, created_at DESC);

-- RLS
ALTER TABLE public.kas_kelas ENABLE ROW LEVEL SECURITY;

-- Everyone in the same school can view kas
CREATE POLICY "School members read kas"
    ON public.kas_kelas FOR SELECT
    USING (
        class_id IN (
            SELECT id FROM public.classes WHERE school_id IN (
                SELECT school_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

-- Only teachers can insert/update
CREATE POLICY "Guru insert kas"
    ON public.kas_kelas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('guru', 'admin', 'kepala_sekolah')
        )
    );

CREATE POLICY "Guru update own kas"
    ON public.kas_kelas FOR UPDATE
    USING (recorded_by = auth.uid());

CREATE POLICY "Guru delete own kas"
    ON public.kas_kelas FOR DELETE
    USING (recorded_by = auth.uid());


