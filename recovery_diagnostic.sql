-- ========================================================
-- RECOVERY & DIAGNOSTIC SCRIPT V3 (EduLMS)
-- ========================================================
-- Script ini akan mengecek kolom 'deleted_at' dan RLS.
-- ========================================================

WITH stats AS (
    SELECT 
        (SELECT count(*) FROM public.classes) as total_classes,
        (SELECT count(*) FROM public.classes WHERE deleted_at IS NULL) as active_classes,
        (SELECT count(*) FROM public.classes WHERE deleted_at IS NOT NULL) as deleted_classes,
        (SELECT count(*) FROM public.class_members) as total_memberships
)
SELECT 
    'INFO KELAS' as kategori, 'Total Kelas di Database' as info, total_classes::text as nilai FROM stats
UNION ALL
SELECT 'INFO KELAS', 'Kelas Aktif (deleted_at IS NULL)', active_classes::text FROM stats
UNION ALL
SELECT 'INFO KELAS', 'Kelas Terhapus (deleted_at IS NOT NULL)', deleted_classes::text FROM stats
UNION ALL
SELECT 'INFO KELAS', 'Total Siswa Terdaftar (Keanggotaan)', total_memberships::text FROM stats
UNION ALL
SELECT 
    'DIAGNOSA RLS', 
    'Jumlah Policy di Tabel Classes',
    (SELECT count(*) FROM pg_policies WHERE tablename = 'classes')::text
UNION ALL
SELECT 
    'KESIMPULAN', 
    'Status Data',
    CASE 
        WHEN (SELECT total_classes FROM stats) > 0 AND (SELECT active_classes FROM stats) = 0 THEN 'MASALAH: Semua Kelas Terpindah ke Sampah (Soft Delete)'
        WHEN (SELECT total_classes FROM stats) > 0 AND (SELECT active_classes FROM stats) > 0 THEN 'MASALAH: RLS Politik (Data Ada tapi Tersembunyi)'
        ELSE 'TIDAK ADA DATA KELAS'
    END;
