'use client';

import { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateReportCardPDF } from '@/lib/services/report-card.service';
import { toast } from 'sonner';

interface Props {
    classId: string;
    studentId: string;
    studentName: string;
    className?: string;
}

export function ReportCardGenerator({ classId, studentId, studentName, className }: Props) {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // 1. Fetch academic data for this student
            const { data: grades } = await supabase
                .from('grades')
                .select('*')
                .eq('student_id', studentId)
                .eq('class_id', classId);

            // 2. Fetch attendance stats
            const { data: attendanceLogs } = await supabase
                .from('attendance_records')
                .select('status, attendance!inner(class_id)')
                .eq('attendance.class_id', classId)
                .eq('student_id', studentId);

            // 3. Fetch school info (from user metadata or teacher profile)
            const { data: { user } } = await supabase.auth.getUser();
            const schoolName = user?.user_metadata?.school_name || 'Klolakelas Academy';
            const teacherName = user?.user_metadata?.full_name || 'Guru Mata Pelajaran';

            // 4. Calculate attendance
            const totalDays = attendanceLogs?.length || 1;
            const present = attendanceLogs?.filter(l => l.status === 'hadir' || l.status === 'present').length || 0;
            const sick = attendanceLogs?.filter(l => l.status === 'sakit' || l.status === 'sick').length || 0;
            const absent = attendanceLogs?.filter(l => l.status === 'alpa' || l.status === 'absent').length || 0;

            // 5. Format grades
            const formattedGrades = (grades || []).map(g => ({
                subject: g.subject || 'Mata Pelajaran',
                score: g.score,
                category: g.type === 'assignment' ? 'Tugas' : g.type === 'quiz' ? 'Kuis' : 'Keaktifan',
                status: g.score >= 75 ? 'TUNTAS' : 'REMEDIAL'
            }));

            // 6. Generate PDF
            await generateReportCardPDF({
                studentName,
                className: className || 'Kelas Aktif',
                schoolName,
                semester: 'Ganjil',
                academicYear: '2023/2024',
                grades: formattedGrades.length > 0 ? formattedGrades : [{ subject: 'Data Belum Tersedia', score: 0, category: '-', status: '-' }],
                attendance: { present, absent, sick, totalDays },
                teacherName
            });

            toast.success(`Rapor untuk ${studentName} berhasil diunduh!`);
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Gagal membuat rapor. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group"
        >
            {loading ? (
                <Loader2 size={12} className="animate-spin" />
            ) : (
                <Download size={12} className="group-hover:translate-y-0.5 transition-transform" />
            )}
            Download Rapor
        </button>
    );
}
