-- 009_sprint_6_ai_enhancements.sql
-- Adds fields for AI grading and structured feedback

-- 1. Add text_content to submissions (for essays/text-based answers)
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS text_content TEXT;

-- 2. Add structured AI feedback to grades
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS ai_feedback_json JSONB;

-- 3. Add AI recommendation field to students/users for predictive analytics
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_academic_prediction TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_prediction_updated_at TIMESTAMPTZ;

-- 4. Enable RLS for new columns (inherited by table RLS)
COMMENT ON COLUMN public.grades.ai_feedback_json IS 'Structured feedback from OpenRouter/Gemini';
