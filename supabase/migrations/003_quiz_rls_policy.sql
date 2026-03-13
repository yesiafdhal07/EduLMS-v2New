-- ========================================================
-- QUIZ RLS POLICY - Max Attempts Limiter
-- Prevents students from bypassing attempt limits
-- ========================================================
-- Ensure RLS is enabled on quiz_attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if any
DROP POLICY IF EXISTS "Limit quiz attempts insert" ON quiz_attempts;
DROP POLICY IF EXISTS "Students can view own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Students can update own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Teachers can view all attempts" ON quiz_attempts;
-- SECURITY: Limit quiz attempts based on max_attempts setting
-- This prevents students from bypassing the limit via direct SQL insert
CREATE POLICY "Limit quiz attempts insert" ON quiz_attempts FOR
INSERT TO authenticated WITH CHECK (
        -- Get the student's current attempt count
        (
            SELECT COUNT(*)
            FROM quiz_attempts qa
            WHERE qa.quiz_id = quiz_attempts.quiz_id
                AND qa.student_id = auth.uid()
        ) < (
            -- Get max_attempts from quiz settings
            SELECT COALESCE(q.max_attempts, 1)
            FROM quizzes q
            WHERE q.id = quiz_attempts.quiz_id
        )
        AND student_id = auth.uid() -- Must be the current user
    );
-- Students can view their own attempts
CREATE POLICY "Students can view own attempts" ON quiz_attempts FOR
SELECT TO authenticated USING (student_id = auth.uid());
-- Students can update only their own in-progress attempts
CREATE POLICY "Students can update own attempts" ON quiz_attempts FOR
UPDATE TO authenticated USING (
        student_id = auth.uid()
        AND status = 'in_progress'
    );
-- Teachers can view attempts for their quizzes
CREATE POLICY "Teachers can view all attempts" ON quiz_attempts FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM quizzes q
                JOIN subjects s ON q.subject_id = s.id
                OR q.class_id = s.class_id
                JOIN classes c ON s.class_id = c.id
            WHERE q.id = quiz_attempts.quiz_id
                AND c.teacher_id = auth.uid()
        )
    );
-- ========================================================
-- QUIZ ANSWERS RLS
-- ========================================================
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students manage own answers" ON quiz_answers;
DROP POLICY IF EXISTS "Teachers view attempt answers" ON quiz_answers;
-- Students can manage answers for their own attempts
CREATE POLICY "Students manage own answers" ON quiz_answers FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM quiz_attempts qa
        WHERE qa.id = quiz_answers.attempt_id
            AND qa.student_id = auth.uid()
    )
);
-- Teachers can view answers for their students
CREATE POLICY "Teachers view attempt answers" ON quiz_answers FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM quiz_attempts qa
                JOIN quizzes q ON qa.quiz_id = q.id
                JOIN classes c ON q.class_id = c.id
            WHERE qa.id = quiz_answers.attempt_id
                AND c.teacher_id = auth.uid()
        )
    );
-- ========================================================
-- DONE! ✅
-- ========================================================