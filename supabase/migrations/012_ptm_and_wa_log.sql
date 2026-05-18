-- Migration 012: PTM Sessions & WhatsApp Notification Log
-- USP #21 — PTM Scheduler, USP #20 — WhatsApp Notifications

-- ─── ptm_sessions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ptm_sessions (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id          UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title             TEXT NOT NULL DEFAULT 'Pertemuan Orang Tua & Guru',
    scheduled_at      TIMESTAMPTZ NOT NULL,
    duration_minutes  INTEGER NOT NULL DEFAULT 60,
    location          TEXT,
    notes             TEXT,
    status            TEXT NOT NULL DEFAULT 'upcoming'
                      CHECK (status IN ('upcoming', 'done', 'cancelled')),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ptm_class_date
    ON public.ptm_sessions (class_id, scheduled_at);

-- ─── wa_notification_log ──────────────────────────────────────
-- Keeps a record of all outgoing WA messages for audit trail
CREATE TABLE IF NOT EXISTS public.wa_notification_log (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id     UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    sender_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
    phone        TEXT NOT NULL,
    type         TEXT NOT NULL,     -- grade_alert | attendance_alert | ptm_invite | announcement
    message      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'sent',  -- sent | failed | simulated
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_log_class
    ON public.wa_notification_log (class_id, created_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.ptm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_notification_log ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own PTM sessions
CREATE POLICY "Guru read own class PTM"
    ON public.ptm_sessions FOR SELECT
    USING (
        teacher_id = auth.uid()
        OR class_id IN (
            SELECT id FROM public.classes
            WHERE school_id IN (
                SELECT school_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Guru insert PTM sessions"
    ON public.ptm_sessions FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Guru update own PTM sessions"
    ON public.ptm_sessions FOR UPDATE
    USING (teacher_id = auth.uid());

CREATE POLICY "Guru read own WA log"
    ON public.wa_notification_log FOR SELECT
    USING (sender_id = auth.uid());

CREATE POLICY "System insert WA log"
    ON public.wa_notification_log FOR INSERT
    WITH CHECK (true);  -- Allow server-side inserts
