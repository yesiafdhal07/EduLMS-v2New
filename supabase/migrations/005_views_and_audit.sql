-- ========================================================
-- MIGRATION 005: Database Views + Enhanced Audit Log
-- Performance-optimized read models for all 4 role dashboards
-- ========================================================

-- =====================
-- A. ADMIN: School Health Summary View
-- =====================
CREATE OR REPLACE VIEW public.admin_school_health AS
SELECT
  s.id AS school_id,
  s.name AS school_name,
  s.is_active,
  s.created_at,
  COALESCE(ug.guru_count, 0) AS guru_count,
  COALESCE(us.siswa_count, 0) AS siswa_count,
  COALESCE(uc.class_count, 0) AS class_count,
  COALESCE(ua.assignment_count, 0) AS assignment_count,
  COALESCE(usub.submission_count, 0) AS submission_count,
  COALESCE(ugr.graded_count, 0) AS graded_count,
  CASE WHEN COALESCE(ua.assignment_count, 0) > 0
    THEN ROUND(COALESCE(usub.submission_count, 0)::NUMERIC / GREATEST(ua.assignment_count * GREATEST(us.siswa_count, 1), 1) * 100, 1)
    ELSE 0
  END AS submission_rate,
  COALESCE(ugr.avg_grade, 0) AS avg_grade,
  COALESCE(att.avg_attendance_rate, 0) AS avg_attendance_rate,
  COALESCE(ugr.avg_grading_days, 0) AS avg_grading_days,
  COALESCE(login_stats.active_30d, 0) AS active_users_30d,
  CASE WHEN COALESCE(ug.guru_count, 0) + COALESCE(us.siswa_count, 0) > 0
    THEN ROUND(COALESCE(login_stats.active_30d, 0)::NUMERIC / (COALESCE(ug.guru_count, 0) + COALESCE(us.siswa_count, 0)) * 100, 1)
    ELSE 0
  END AS login_rate_30d
FROM public.schools s
LEFT JOIN (
  SELECT school_id, COUNT(*) AS guru_count FROM public.users WHERE role = 'guru' GROUP BY school_id
) ug ON ug.school_id = s.id
LEFT JOIN (
  SELECT school_id, COUNT(*) AS siswa_count FROM public.users WHERE role = 'siswa' GROUP BY school_id
) us ON us.school_id = s.id
LEFT JOIN (
  SELECT school_id, COUNT(*) AS class_count FROM public.classes WHERE deleted_at IS NULL GROUP BY school_id
) uc ON uc.school_id = s.id
LEFT JOIN (
  SELECT c.school_id, COUNT(a.id) AS assignment_count
  FROM public.assignments a
  JOIN public.subjects sub ON sub.id = a.subject_id
  JOIN public.classes c ON c.id = sub.class_id
  WHERE a.deleted_at IS NULL
  GROUP BY c.school_id
) ua ON ua.school_id = s.id
LEFT JOIN (
  SELECT c.school_id, COUNT(sm.id) AS submission_count
  FROM public.submissions sm
  JOIN public.assignments a ON a.id = sm.assignment_id
  JOIN public.subjects sub ON sub.id = a.subject_id
  JOIN public.classes c ON c.id = sub.class_id
  GROUP BY c.school_id
) usub ON usub.school_id = s.id
LEFT JOIN (
  SELECT c.school_id,
    COUNT(g.id) AS graded_count,
    ROUND(AVG(g.score), 1) AS avg_grade,
    ROUND(AVG(EXTRACT(EPOCH FROM (g.graded_at - sm.submitted_at)) / 86400)::NUMERIC, 1) AS avg_grading_days
  FROM public.grades g
  JOIN public.submissions sm ON sm.id = g.submission_id
  JOIN public.assignments a ON a.id = sm.assignment_id
  JOIN public.subjects sub ON sub.id = a.subject_id
  JOIN public.classes c ON c.id = sub.class_id
  WHERE g.graded_at IS NOT NULL AND sm.submitted_at IS NOT NULL
  GROUP BY c.school_id
) ugr ON ugr.school_id = s.id
LEFT JOIN (
  SELECT c.school_id,
    ROUND(AVG(CASE WHEN ar.status = 'hadir' THEN 100.0 ELSE 0.0 END), 1) AS avg_attendance_rate
  FROM public.attendance_records ar
  JOIN public.attendance att ON att.id = ar.attendance_id
  JOIN public.classes c ON c.id = att.class_id
  GROUP BY c.school_id
) att ON att.school_id = s.id
LEFT JOIN (
  SELECT u.school_id, COUNT(DISTINCT au.id) AS active_30d
  FROM auth.users au
  JOIN public.users u ON u.id = au.id
  WHERE au.last_sign_in_at > NOW() - INTERVAL '30 days'
  GROUP BY u.school_id
) login_stats ON login_stats.school_id = s.id;

-- =====================
-- B. KEPSEK: Class Performance Summary View
-- =====================
CREATE OR REPLACE VIEW public.school_class_performance AS
SELECT
  c.id AS class_id,
  c.name AS class_name,
  c.school_id,
  c.teacher_id,
  tu.full_name AS teacher_name,
  COALESCE(cm.student_count, 0) AS student_count,
  COALESCE(asg.assignment_count, 0) AS assignment_count,
  COALESCE(gr.avg_grade, 0) AS avg_grade,
  COALESCE(gr.graded_submissions, 0) AS graded_submissions,
  COALESCE(gr.total_submissions, 0) AS total_submissions,
  CASE WHEN COALESCE(gr.total_submissions, 0) > 0
    THEN ROUND(gr.graded_submissions::NUMERIC / gr.total_submissions * 100, 1)
    ELSE 0
  END AS grading_completion_rate,
  COALESCE(att.attendance_rate, 0) AS attendance_rate,
  COALESCE(att.total_records, 0) AS attendance_records_count,
  CASE WHEN COALESCE(asg.assignment_count, 0) > 0 AND COALESCE(cm.student_count, 0) > 0
    THEN ROUND(COALESCE(gr.total_submissions, 0)::NUMERIC / (asg.assignment_count * cm.student_count) * 100, 1)
    ELSE 0
  END AS submission_rate,
  CASE WHEN COALESCE(gr.avg_grade, 0) >= 75 THEN 'above_kkm' ELSE 'below_kkm' END AS kkm_status
FROM public.classes c
LEFT JOIN public.users tu ON tu.id = c.teacher_id
LEFT JOIN (
  SELECT class_id, COUNT(*) AS student_count FROM public.class_members GROUP BY class_id
) cm ON cm.class_id = c.id
LEFT JOIN (
  SELECT sub.class_id, COUNT(a.id) AS assignment_count
  FROM public.assignments a
  JOIN public.subjects sub ON sub.id = a.subject_id
  WHERE a.deleted_at IS NULL
  GROUP BY sub.class_id
) asg ON asg.class_id = c.id
LEFT JOIN (
  SELECT sub.class_id,
    ROUND(AVG(g.score), 1) AS avg_grade,
    COUNT(g.id) AS graded_submissions,
    COUNT(DISTINCT sm.id) AS total_submissions
  FROM public.grades g
  JOIN public.submissions sm ON sm.id = g.submission_id
  JOIN public.assignments a ON a.id = sm.assignment_id
  JOIN public.subjects sub ON sub.id = a.subject_id
  GROUP BY sub.class_id
) gr ON gr.class_id = c.id
LEFT JOIN (
  SELECT att.class_id,
    ROUND(AVG(CASE WHEN ar.status = 'hadir' THEN 100.0 ELSE 0.0 END), 1) AS attendance_rate,
    COUNT(ar.id) AS total_records
  FROM public.attendance_records ar
  JOIN public.attendance att ON att.id = ar.attendance_id
  GROUP BY att.class_id
) att ON att.class_id = c.id
WHERE c.deleted_at IS NULL;

-- =====================
-- C. GURU: Work Queue Summary View
-- =====================
CREATE OR REPLACE VIEW public.teacher_work_queue AS
SELECT
  c.teacher_id,
  c.id AS class_id,
  c.name AS class_name,
  c.school_id,
  COALESCE(pending_grade.count, 0) AS pending_grade_count,
  COALESCE(deadline_soon.count, 0) AS deadline_soon_count,
  COALESCE(pending_review.count, 0) AS pending_review_count,
  COALESCE(pending_grade.count, 0) + COALESCE(deadline_soon.count, 0) + COALESCE(pending_review.count, 0) AS total_work_items
FROM public.classes c
LEFT JOIN (
  SELECT sub.class_id, COUNT(sm.id) AS count
  FROM public.submissions sm
  JOIN public.assignments a ON a.id = sm.assignment_id
  JOIN public.subjects sub ON sub.id = a.subject_id
  LEFT JOIN public.grades g ON g.submission_id = sm.id
  WHERE g.id IS NULL
  GROUP BY sub.class_id
) pending_grade ON pending_grade.class_id = c.id
LEFT JOIN (
  SELECT sub.class_id, COUNT(a.id) AS count
  FROM public.assignments a
  JOIN public.subjects sub ON sub.id = a.subject_id
  WHERE a.deadline IS NOT NULL
    AND a.deadline > NOW()
    AND a.deadline < NOW() + INTERVAL '24 hours'
    AND a.deleted_at IS NULL
  GROUP BY sub.class_id
) deadline_soon ON deadline_soon.class_id = c.id
LEFT JOIN (
  SELECT a.subject_id, sub.class_id, COUNT(pr.id) AS count
  FROM public.peer_reviews pr
  JOIN public.submissions sm ON sm.id = pr.submission_id
  JOIN public.assignments a ON a.id = sm.assignment_id
  JOIN public.subjects sub ON sub.id = a.subject_id
  WHERE pr.status = 'pending'
  GROUP BY a.subject_id, sub.class_id
) pending_review ON pending_review.class_id = c.id
WHERE c.deleted_at IS NULL;

-- =====================
-- D. SISWA: Dashboard Summary View
-- =====================
CREATE OR REPLACE VIEW public.student_dashboard_summary AS
SELECT
  u.id AS student_id,
  u.full_name,
  u.school_id,
  cm.class_id,
  c.name AS class_name,
  COALESCE(asg.total_assignments, 0) AS total_assignments,
  COALESCE(sub_stats.submitted_count, 0) AS submitted_count,
  COALESCE(gr.avg_grade, 0) AS avg_grade,
  COALESCE(gr.graded_count, 0) AS graded_count,
  COALESCE(att.attendance_rate, 0) AS attendance_rate,
  COALESCE(att.total_present, 0) AS total_present,
  COALESCE(att.total_sessions, 0) AS total_sessions,
  COALESCE(xp.xp_total, 0) AS xp_total,
  COALESCE(xp.level, 1) AS xp_level,
  COALESCE(streak.current_streak, 0) AS current_streak,
  COALESCE(streak.longest_streak, 0) AS longest_streak,
  COALESCE(badge_count.count, 0) AS badge_count,
  COALESCE(quiz_stats.quizzes_taken, 0) AS quizzes_taken,
  COALESCE(quiz_stats.avg_quiz_score, 0) AS avg_quiz_score
FROM public.users u
JOIN public.class_members cm ON cm.user_id = u.id
JOIN public.classes c ON c.id = cm.class_id
LEFT JOIN (
  SELECT sub.class_id, COUNT(a.id) AS total_assignments
  FROM public.assignments a
  JOIN public.subjects sub ON sub.id = a.subject_id
  WHERE a.deleted_at IS NULL
  GROUP BY sub.class_id
) asg ON asg.class_id = cm.class_id
LEFT JOIN (
  SELECT sm.student_id, COUNT(sm.id) AS submitted_count
  FROM public.submissions sm
  GROUP BY sm.student_id
) sub_stats ON sub_stats.student_id = u.id
LEFT JOIN (
  SELECT g.student_id, ROUND(AVG(g.score), 1) AS avg_grade, COUNT(g.id) AS graded_count
  FROM public.grades g
  GROUP BY g.student_id
) gr ON gr.student_id = u.id
LEFT JOIN (
  SELECT ar.student_id,
    ROUND(AVG(CASE WHEN ar.status = 'hadir' THEN 100.0 ELSE 0.0 END), 1) AS attendance_rate,
    SUM(CASE WHEN ar.status = 'hadir' THEN 1 ELSE 0 END) AS total_present,
    COUNT(ar.id) AS total_sessions
  FROM public.attendance_records ar
  GROUP BY ar.student_id
) att ON att.student_id = u.id
LEFT JOIN public.user_xp xp ON xp.user_id = u.id
LEFT JOIN public.user_streaks streak ON streak.user_id = u.id
LEFT JOIN (
  SELECT user_id, COUNT(*) AS count FROM public.user_badges GROUP BY user_id
) badge_count ON badge_count.user_id = u.id
LEFT JOIN (
  SELECT qa.student_id,
    COUNT(qa.id) AS quizzes_taken,
    ROUND(AVG(qa.percentage), 1) AS avg_quiz_score
  FROM public.quiz_attempts qa
  WHERE qa.status = 'completed'
  GROUP BY qa.student_id
) quiz_stats ON quiz_stats.student_id = u.id
WHERE u.role = 'siswa';

-- =====================
-- E. Enhanced Audit Log System
-- =====================

-- Ensure audit_logs table exists with all needed columns
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  school_id UUID REFERENCES public.schools(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON public.audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- RLS: Admin reads all, Kepsek reads own school, Guru reads own actions
DROP POLICY IF EXISTS "Admin read all audit" ON public.audit_logs;
CREATE POLICY "Admin read all audit" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin insert audit" ON public.audit_logs;
CREATE POLICY "Admin insert audit" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Kepsek read school audit" ON public.audit_logs;
CREATE POLICY "Kepsek read school audit" ON public.audit_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role = 'kepala_sekolah')
  );

DROP POLICY IF EXISTS "User read own audit" ON public.audit_logs;
CREATE POLICY "User read own audit" ON public.audit_logs
  FOR SELECT USING (actor_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated insert audit" ON public.audit_logs;
CREATE POLICY "Authenticated insert audit" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- =====================
-- F. Feedback Templates Table (for Guru Feedback Bank)
-- =====================
CREATE TABLE IF NOT EXISTS public.feedback_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.feedback_templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_feedback_templates_teacher ON public.feedback_templates(teacher_id);

DROP POLICY IF EXISTS "Teacher manage own templates" ON public.feedback_templates;
CREATE POLICY "Teacher manage own templates" ON public.feedback_templates
  FOR ALL USING (teacher_id = auth.uid());

-- =====================
-- G. School Policies Table (for Admin Policy Engine)
-- =====================
CREATE TABLE IF NOT EXISTS public.school_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  policy_key TEXT NOT NULL,
  policy_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (school_id, policy_key)
);

ALTER TABLE public.school_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage policies" ON public.school_policies;
CREATE POLICY "Admin manage policies" ON public.school_policies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Kepsek read own school policies" ON public.school_policies;
CREATE POLICY "Kepsek read own school policies" ON public.school_policies
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role = 'kepala_sekolah')
    OR school_id IS NULL
  );
