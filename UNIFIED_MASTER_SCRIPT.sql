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
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('admin', 'guru', 'siswa');
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
CREATE POLICY "Users view own notifications" ON public.notifications FOR
SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR
UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow inserts for authenticated" ON public.notifications FOR
INSERT TO authenticated WITH CHECK (true);
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
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.users (id, email, full_name, role)
VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      'User Baru'
    ),
    COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'siswa'::public.user_role
    )
  ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
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
SELECT 'UNIFIED_MASTER_SCRIPT (SAFE VERSION) berhasil dijalankan!' AS message;