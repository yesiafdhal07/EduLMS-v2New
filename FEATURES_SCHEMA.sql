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