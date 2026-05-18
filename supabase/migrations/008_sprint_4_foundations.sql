-- ========================================================
-- MIGRATION: Sprint 4 Foundations
-- 1. Add 'orang_tua' role
-- 2. Parent-Student link table
-- 3. Forum System (Posts & Comments)
-- 4. Benchmarking View
-- ========================================================

-- 1. Add 'orang_tua' to user_role enum
DO $$ BEGIN
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'orang_tua';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Parent-Student link table
CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  relationship TEXT, -- e.g., 'Ayah', 'Ibu', 'Wali'
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(parent_id, student_id)
);

ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

-- RLS: Parent views own links, Admin/Kepsek views all in school
CREATE POLICY "Parents view own links" ON public.parent_student_links
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Admin/Kepsek view all links" ON public.parent_student_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah')
    )
  );

-- 3. Forum System
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE, -- Optional: school-wide if null
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_announcement BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  flag_count INTEGER DEFAULT 0,
  school_id UUID REFERENCES public.schools(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  flag_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Forum RLS (Basic: everyone in school can read/write)
CREATE POLICY "Users read posts in their school" ON public.forum_posts
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (
    author_id = auth.uid()
  );

CREATE POLICY "Authors/Admins edit posts" ON public.forum_posts
  FOR UPDATE USING (
    author_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'guru', 'kepala_sekolah'))
  );

-- 4. Benchmarking View for Kepala Sekolah
CREATE OR REPLACE VIEW public.school_benchmarking AS
SELECT 
  s.id AS school_id,
  s.name AS school_name,
  COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'siswa') AS student_count,
  COUNT(DISTINCT c.id) AS class_count,
  ROUND(AVG(gr.score), 2) AS avg_grade,
  ROUND(AVG(CASE WHEN ar.status = 'hadir' THEN 100 ELSE 0 END), 2) AS attendance_rate
FROM public.schools s
LEFT JOIN public.users u ON u.school_id = s.id
LEFT JOIN public.classes c ON c.school_id = s.id
LEFT JOIN public.grades gr ON gr.student_id = u.id
LEFT JOIN public.attendance_records ar ON ar.student_id = u.id
GROUP BY s.id, s.name;

-- 5. RPC for flagging (Moderation)
CREATE OR REPLACE FUNCTION public.increment_forum_flag(target_id UUID, target_type TEXT)
RETURNS VOID AS $$
BEGIN
  IF target_type = 'post' THEN
    UPDATE public.forum_posts SET flag_count = flag_count + 1 WHERE id = target_id;
  ELSIF target_type = 'comment' THEN
    UPDATE public.forum_comments SET flag_count = flag_count + 1 WHERE id = target_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to views
GRANT SELECT ON public.school_benchmarking TO authenticated;
