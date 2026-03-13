-- ========================================================
-- NEW FEATURES DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- ========================================================
-- ==================== MOOD CHECK-IN ====================
-- Table for storing daily mood logs
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mood INTEGER CHECK (
        mood >= 1
        AND mood <= 5
    ) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_mood_logs_user ON public.mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_date ON public.mood_logs(created_at);
-- RLS Policies
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own mood" ON public.mood_logs;
CREATE POLICY "Users can insert own mood" ON public.mood_logs FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can view own mood" ON public.mood_logs;
CREATE POLICY "Users can view own mood" ON public.mood_logs FOR
SELECT TO authenticated USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM class_members cm
                JOIN classes c ON cm.class_id = c.id
            WHERE cm.user_id = mood_logs.user_id
                AND c.teacher_id = auth.uid()
        )
    );
-- ==================== XP SYSTEM ====================
-- Table for storing user XP totals
CREATE TABLE IF NOT EXISTS public.user_xp (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    xp_total INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Table for XP transaction logs
CREATE TABLE IF NOT EXISTS public.xp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    xp_earned INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_xp_logs_user ON public.xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_date ON public.xp_logs(created_at);
-- RLS Policies
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own XP" ON public.user_xp;
CREATE POLICY "Users can view own XP" ON public.user_xp FOR
SELECT TO authenticated USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM class_members cm
                JOIN classes c ON cm.class_id = c.id
            WHERE cm.user_id = user_xp.user_id
                AND c.teacher_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can update own XP" ON public.user_xp;
CREATE POLICY "Users can update own XP" ON public.user_xp FOR ALL TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can view own XP logs" ON public.xp_logs;
CREATE POLICY "Users can view own XP logs" ON public.xp_logs FOR
SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own XP logs" ON public.xp_logs;
CREATE POLICY "Users can insert own XP logs" ON public.xp_logs FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- ==================== ANONYMOUS DISCUSSIONS ====================
-- Table for anonymous discussions
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        content TEXT NOT NULL,
        is_anonymous BOOLEAN DEFAULT true,
        is_resolved BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Table for discussion replies
CREATE TABLE IF NOT EXISTS public.discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        content TEXT NOT NULL,
        is_teacher BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_discussions_class ON public.discussions(class_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON public.discussion_replies(discussion_id);
-- RLS Policies
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
-- Anyone in class can view discussions (but author is hidden for students)
DROP POLICY IF EXISTS "Class members can view discussions" ON public.discussions;
CREATE POLICY "Class members can view discussions" ON public.discussions FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM class_members cm
            WHERE cm.class_id = discussions.class_id
                AND cm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM classes c
            WHERE c.id = discussions.class_id
                AND c.teacher_id = auth.uid()
        )
    );
-- Students can create discussions
DROP POLICY IF EXISTS "Students can create discussions" ON public.discussions;
CREATE POLICY "Students can create discussions" ON public.discussions FOR
INSERT TO authenticated WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM class_members cm
            WHERE cm.class_id = discussions.class_id
                AND cm.user_id = auth.uid()
        )
    );
-- Replies policies
DROP POLICY IF EXISTS "Class members can view replies" ON public.discussion_replies;
CREATE POLICY "Class members can view replies" ON public.discussion_replies FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM discussions d
                JOIN class_members cm ON cm.class_id = d.class_id
            WHERE d.id = discussion_replies.discussion_id
                AND cm.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM discussions d
                JOIN classes c ON c.id = d.class_id
            WHERE d.id = discussion_replies.discussion_id
                AND c.teacher_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can create replies" ON public.discussion_replies;
CREATE POLICY "Users can create replies" ON public.discussion_replies FOR
INSERT TO authenticated WITH CHECK (author_id = auth.uid());
-- ==================== AUDIO FEEDBACK ====================
-- Add audio_feedback_url column to grades table
ALTER TABLE public.grades
ADD COLUMN IF NOT EXISTS audio_feedback_url TEXT;
-- Grant access to tables
GRANT SELECT,
    INSERT,
    UPDATE ON public.mood_logs TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE ON public.user_xp TO authenticated;
GRANT SELECT,
    INSERT ON public.xp_logs TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE ON public.discussions TO authenticated;
GRANT SELECT,
    INSERT ON public.discussion_replies TO authenticated;