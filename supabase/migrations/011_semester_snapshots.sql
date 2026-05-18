-- Migration 011: Semester Snapshots for Cross-Semester Trend Analysis
-- USP #14 — Tren Lintas Semester

-- ─── semester_snapshots ───────────────────────────────────────
-- Stores pre-computed end-of-semester statistics per class.
-- Can be populated manually by admin or via scheduled function.

CREATE TABLE IF NOT EXISTS public.semester_snapshots (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id        UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    school_id       UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    semester        TEXT NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
    school_year     TEXT NOT NULL, -- e.g. "2024/2025"
    avg_grade       NUMERIC(5,2) NOT NULL DEFAULT 0,
    attendance_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- percentage 0-100
    submission_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- percentage 0-100
    student_count   INTEGER NOT NULL DEFAULT 0,
    tuntas_count    INTEGER NOT NULL DEFAULT 0,       -- students above KKM
    snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one snapshot per class per semester/year
CREATE UNIQUE INDEX IF NOT EXISTS uniq_class_semester_year
    ON public.semester_snapshots (class_id, semester, school_year);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_snapshots_class_date
    ON public.semester_snapshots (class_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_snapshots_school
    ON public.semester_snapshots (school_id, school_year);

-- ─── RLS Policies ──────────────────────────────────────────────
ALTER TABLE public.semester_snapshots ENABLE ROW LEVEL SECURITY;

-- Guru & Kepsek can read snapshots for their school
CREATE POLICY "Allow read own school snapshots"
    ON public.semester_snapshots FOR SELECT
    USING (
        school_id IN (
            SELECT school_id FROM public.users
            WHERE id = auth.uid()
        )
    );

-- Only admin/guru can insert their class snapshots
CREATE POLICY "Allow guru insert class snapshots"
    ON public.semester_snapshots FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('guru', 'admin', 'kepala_sekolah')
        )
    );

-- Only creator or admin can update
CREATE POLICY "Allow creator update snapshots"
    ON public.semester_snapshots FOR UPDATE
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'kepala_sekolah')
    ));

-- ─── Helper View ───────────────────────────────────────────────
-- Quick trend comparison: last 2 semesters per class
CREATE OR REPLACE VIEW public.class_semester_trend AS
SELECT
    s.class_id,
    s.semester,
    s.school_year,
    s.avg_grade,
    s.attendance_rate,
    s.submission_rate,
    s.student_count,
    ROUND((s.tuntas_count::NUMERIC / NULLIF(s.student_count, 0)) * 100, 1) AS tuntas_rate,
    s.snapshot_date,
    LAG(s.avg_grade) OVER (
        PARTITION BY s.class_id ORDER BY s.snapshot_date
    ) AS prev_avg_grade,
    ROUND(
        s.avg_grade - LAG(s.avg_grade) OVER (
            PARTITION BY s.class_id ORDER BY s.snapshot_date
        ), 2
    ) AS grade_delta
FROM public.semester_snapshots s
ORDER BY s.class_id, s.snapshot_date DESC;
