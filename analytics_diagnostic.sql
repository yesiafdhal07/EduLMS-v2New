-- DIAGNOSA DATA ANALYTIC GURU
-- Jalankan ini di Supabase SQL Editor untuk melihat data apa yang sebenarnya ada

-- 1. Cek User ID Saya (Guru)
SELECT auth.uid() as my_id;

-- 2. Cek Kelas Saya
SELECT id, name FROM public.classes WHERE teacher_id = auth.uid();

-- 3. Cek Jumlah Siswa per Kelas
SELECT 
    c.name as class_name, 
    count(cm.user_id) as student_count 
FROM public.classes c
LEFT JOIN public.class_members cm ON c.id = cm.class_id
WHERE c.teacher_id = auth.uid()
GROUP BY c.name;

-- 4. Cek Data Nilai yang SEHARUSNYA Muncul (Tanpa RLS filter manual)
SELECT 
    c.name as class_name,
    u.full_name as student_name,
    g.score,
    g.type,
    g.created_at
FROM public.grades g
JOIN public.users u ON g.student_id = u.id
JOIN public.class_members cm ON u.id = cm.user_id
JOIN public.classes c ON cm.class_id = c.id
WHERE c.teacher_id = auth.uid();

-- 5. Cek apakah ada record di attendance_records untuk kelas guru
SELECT count(*) 
FROM public.attendance_records ar
JOIN public.attendance a ON ar.attendance_id = a.id
JOIN public.classes c ON a.class_id = c.id
WHERE c.teacher_id = auth.uid();
