-- 010_sprint_5_qr_attendance.sql
-- Infrastructure for Dynamic QR Attendance and Geo-fencing

-- 1. Update attendance_sessions with QR and Location fields
ALTER TABLE public.attendance_sessions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'qr_code'));
ALTER TABLE public.attendance_sessions ADD COLUMN IF NOT EXISTS active_token TEXT;
ALTER TABLE public.attendance_sessions ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION;
ALTER TABLE public.attendance_sessions ADD COLUMN IF NOT EXISTS location_long DOUBLE PRECISION;
ALTER TABLE public.attendance_sessions ADD COLUMN IF NOT EXISTS radius_meters INTEGER DEFAULT 100;

-- 2. Create a function to rotate QR tokens automatically (optional, can be done from app)
-- But for security, let's add a verified_at column to records to track QR vs Manual
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS method TEXT DEFAULT 'manual' CHECK (method IN ('manual', 'qr_code'));
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS verification_lat DOUBLE PRECISION;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS verification_long DOUBLE PRECISION;

-- 3. RLS for attendance
-- Students can only insert their own records if the session is OPEN and type is qr_code
CREATE POLICY "Students can mark attendance via QR" ON public.attendance_records
FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
        SELECT 1 FROM public.attendance_sessions
        WHERE id = attendance_id AND is_open = true AND type = 'qr_code'
    )
);

COMMENT ON TABLE public.attendance_sessions IS 'Stores class attendance sessions, now supporting QR codes.';
