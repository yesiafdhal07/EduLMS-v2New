-- ============================================================
-- KLOLAKELAS — COMBINED MIGRATION (011–013)
-- Jalankan file ini di Supabase SQL Editor
-- Dibuat: Sprint B-E rollup
-- ============================================================

-- ─── SAFE GUARD: Cek ekstensi yang dibutuhkan ────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- [011] SEMESTER SNAPSHOTS (Sprint B — USP #14)
-- Tabel snapshot nilai per semester untuk Tren Lintas Semester
-- ============================================================

CREATE TABLE IF NOT EXISTS public.semester_snapshots (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    semester    TEXT NOT NULL,       -- e.g. "2024/2025 Ganjil"
    avg_grade   NUMERIC(5,2),
    attendance  NUMERIC(5,2),        -- percentage 0-100
    xp_earned   INTEGER DEFAULT 0,
    snapshot_at TIMESTAMPTZ DEFAULT NOW(),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_id, semester)
);

CREATE INDEX IF NOT EXISTS idx_semester_snapshots_student
    ON public.semester_snapshots (student_id, class_id);

CREATE INDEX IF NOT EXISTS idx_semester_snapshots_class
    ON public.semester_snapshots (class_id, semester);

ALTER TABLE public.semester_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "School members read semester snapshots" ON public.semester_snapshots;
CREATE POLICY "School members read semester snapshots"
    ON public.semester_snapshots FOR SELECT
    USING (
        student_id = auth.uid()
        OR class_id IN (
            SELECT id FROM public.classes WHERE school_id IN (
                SELECT school_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "System insert semester snapshots" ON public.semester_snapshots;
CREATE POLICY "System insert semester snapshots"
    ON public.semester_snapshots FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('guru', 'admin', 'kepala_sekolah')
        )
    );

-- Helper view: latest snapshot per student per class
CREATE OR REPLACE VIEW public.latest_semester_snapshots AS
SELECT DISTINCT ON (student_id, class_id)
    *
FROM public.semester_snapshots
ORDER BY student_id, class_id, created_at DESC;

-- ============================================================
-- [012] PTM SESSIONS & WA NOTIFICATION LOG (Sprint D — USP #20, #21)
-- ============================================================

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

CREATE TABLE IF NOT EXISTS public.wa_notification_log (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id     UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    sender_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
    phone        TEXT NOT NULL,
    type         TEXT NOT NULL,
    message      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'sent',
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_log_class
    ON public.wa_notification_log (class_id, created_at DESC);

ALTER TABLE public.ptm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guru read own class PTM" ON public.ptm_sessions;
CREATE POLICY "Guru read own class PTM"
    ON public.ptm_sessions FOR SELECT
    USING (
        teacher_id = auth.uid()
        OR class_id IN (
            SELECT id FROM public.classes WHERE school_id IN (
                SELECT school_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Guru insert PTM sessions" ON public.ptm_sessions;
CREATE POLICY "Guru insert PTM sessions"
    ON public.ptm_sessions FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Guru update own PTM sessions" ON public.ptm_sessions;
CREATE POLICY "Guru update own PTM sessions"
    ON public.ptm_sessions FOR UPDATE
    USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Guru read own WA log" ON public.wa_notification_log;
CREATE POLICY "Guru read own WA log"
    ON public.wa_notification_log FOR SELECT
    USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "System insert WA log" ON public.wa_notification_log;
CREATE POLICY "System insert WA log"
    ON public.wa_notification_log FOR INSERT
    WITH CHECK (true);

-- ============================================================
-- [013] KAS KELAS DIGITAL (Sprint E — USP #18)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.kas_kelas (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id     UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount       INTEGER NOT NULL CHECK (amount > 0),
    description  TEXT NOT NULL,
    recorded_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kas_class_date
    ON public.kas_kelas (class_id, created_at DESC);

ALTER TABLE public.kas_kelas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "School members read kas" ON public.kas_kelas;
CREATE POLICY "School members read kas"
    ON public.kas_kelas FOR SELECT
    USING (
        class_id IN (
            SELECT id FROM public.classes WHERE school_id IN (
                SELECT school_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Guru insert kas" ON public.kas_kelas;
CREATE POLICY "Guru insert kas"
    ON public.kas_kelas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('guru', 'admin', 'kepala_sekolah')
        )
    );

DROP POLICY IF EXISTS "Guru update own kas" ON public.kas_kelas;
CREATE POLICY "Guru update own kas"
    ON public.kas_kelas FOR UPDATE
    USING (recorded_by = auth.uid());

DROP POLICY IF EXISTS "Guru delete own kas" ON public.kas_kelas;
CREATE POLICY "Guru delete own kas"
    ON public.kas_kelas FOR DELETE
    USING (recorded_by = auth.uid());

-- ============================================================
-- DONE ✅
-- Tabel yang berhasil dibuat:
--   semester_snapshots  → GradeTrendChart (mode Semester)
--   ptm_sessions        → PTMScheduler
--   wa_notification_log → WANotifPanel audit trail
--   kas_kelas           → KasKelas (guru + ortu)
-- ============================================================
