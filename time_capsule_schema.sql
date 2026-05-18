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