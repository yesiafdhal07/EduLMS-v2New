-- Migration 013: Kas Kelas Digital
-- USP #18 — Class treasury management

CREATE TABLE IF NOT EXISTS public.kas_kelas (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id     UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount       INTEGER NOT NULL CHECK (amount > 0),   -- in IDR
    description  TEXT NOT NULL,
    recorded_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kas_class_date
    ON public.kas_kelas (class_id, created_at DESC);

-- RLS
ALTER TABLE public.kas_kelas ENABLE ROW LEVEL SECURITY;

-- Everyone in the same school can view kas
CREATE POLICY "School members read kas"
    ON public.kas_kelas FOR SELECT
    USING (
        class_id IN (
            SELECT id FROM public.classes WHERE school_id IN (
                SELECT school_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

-- Only teachers can insert/update
CREATE POLICY "Guru insert kas"
    ON public.kas_kelas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('guru', 'admin', 'kepala_sekolah')
        )
    );

CREATE POLICY "Guru update own kas"
    ON public.kas_kelas FOR UPDATE
    USING (recorded_by = auth.uid());

CREATE POLICY "Guru delete own kas"
    ON public.kas_kelas FOR DELETE
    USING (recorded_by = auth.uid());
