-- ========================================================
-- SECURE XP SYSTEM - Server-side Validation
-- Prevents client-side XP manipulation exploits
-- ========================================================
-- 1. Create secure XP award function (prevents client manipulation)
CREATE OR REPLACE FUNCTION public.award_xp_secure(p_action TEXT, p_xp INTEGER) RETURNS JSONB AS $$
DECLARE v_user_id UUID := auth.uid();
v_current_xp INTEGER;
v_new_xp INTEGER;
v_new_level INTEGER;
v_max_xp_per_action INTEGER := 100;
-- Maximum XP per single action
BEGIN -- Security: Validate user is authenticated
IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated';
END IF;
-- Security: Validate XP amount is within allowed range
IF p_xp < 0
OR p_xp > v_max_xp_per_action THEN RAISE EXCEPTION 'Invalid XP amount: must be between 0 and %',
v_max_xp_per_action;
END IF;
-- Security: Validate action is from allowed list
IF p_action NOT IN (
    'SUBMIT_ON_TIME',
    'SUBMIT_LATE',
    'ATTEND_CLASS',
    'GRADE_A',
    'GRADE_B',
    'GRADE_C',
    'DAILY_LOGIN',
    'MOOD_CHECKIN',
    'COMPLETE_QUIZ',
    'PERFECT_SCORE',
    'STREAK_7',
    'STREAK_30'
) THEN RAISE EXCEPTION 'Invalid action type: %',
p_action;
END IF;
-- Get or create user_xp record
SELECT xp_total INTO v_current_xp
FROM public.user_xp
WHERE user_id = v_user_id;
IF NOT FOUND THEN
INSERT INTO public.user_xp (user_id, xp_total, level)
VALUES (v_user_id, 0, 1);
v_current_xp := 0;
END IF;
-- Calculate new totals
v_new_xp := v_current_xp + p_xp;
v_new_level := GREATEST(1, FLOOR(v_new_xp / 100) + 1);
-- Insert XP log (audit trail)
INSERT INTO public.xp_logs (user_id, action, xp_earned)
VALUES (v_user_id, p_action, p_xp);
-- Update user XP
UPDATE public.user_xp
SET xp_total = v_new_xp,
    level = v_new_level,
    updated_at = NOW()
WHERE user_id = v_user_id;
-- Return result
RETURN jsonb_build_object(
    'success',
    true,
    'xp_earned',
    p_xp,
    'new_total',
    v_new_xp,
    'new_level',
    v_new_level,
    'action',
    p_action
);
EXCEPTION
WHEN OTHERS THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    SQLERRM
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. Create tables if not exist
CREATE TABLE IF NOT EXISTS public.user_xp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    xp_total INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.xp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    xp_earned INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 3. RLS Policies
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;
-- Users can only read their own XP
DROP POLICY IF EXISTS "Users see own xp" ON public.user_xp;
CREATE POLICY "Users see own xp" ON public.user_xp FOR
SELECT USING (user_id = auth.uid());
-- Users can only read their own logs
DROP POLICY IF EXISTS "Users see own xp logs" ON public.xp_logs;
CREATE POLICY "Users see own xp logs" ON public.xp_logs FOR
SELECT USING (user_id = auth.uid());
-- IMPORTANT: NO INSERT/UPDATE policies for user_xp and xp_logs!
-- All modifications MUST go through the secure RPC function.
-- 4. Grant execute permission on the secure function
GRANT EXECUTE ON FUNCTION public.award_xp_secure(TEXT, INTEGER) TO authenticated;
-- ========================================================
-- DONE! Run this in Supabase SQL Editor
-- ========================================================