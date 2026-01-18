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