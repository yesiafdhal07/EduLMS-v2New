'use client';

import { useState } from 'react';
import { Download, Calendar, FileSpreadsheet, Archive, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface StudentExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
}

type ArchiveType = 'attendance' | 'grades';

export function StudentExportModal({ isOpen, onClose, studentId, studentName }: StudentExportModalProps) {
    const [archiveType, setArchiveType] = useState<ArchiveType>('attendance');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');

    if (!isOpen) return null;

    const handleExport = async () => {
        setLoading(true);
        setStep('processing');
        try {
            if (archiveType === 'attendance') {
                await exportAttendance();
            } else {
                await exportGrades();
            }
            setStep('success');
            toast.success('Data berhasil didownload!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Gagal mengexport data');
            setStep('select');
        } finally {
            setLoading(false);
        }
    };

    const exportAttendance = async () => {
        // Fetch student's attendance records
        const { data, error } = await supabase
            .from('attendance_records')
            .select(`
                status,
                recorded_at,
                attendance:attendance_id (
                    date,
                    subjects:class_id (
                        name
                    )
                )
            `)
            .eq('student_id', studentId)
            .order('recorded_at', { ascending: false });

        if (error) throw error;

        // Transform
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = data?.map((rec: any) => ({
            Tanggal: new Date(rec.attendance?.date).toLocaleDateString('id-ID'),
            Status: rec.status.toUpperCase(),
            Waktu: rec.recorded_at ? new Date(rec.recorded_at).toLocaleTimeString('id-ID') : '-',
        })) || [];

        // Dynamic import xlsx
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Riwayat Absensi");
        XLSX.writeFile(wb, `ABSENSI_SAYA_${studentName.replace(/\s+/g, '_')}.xlsx`);
    };

    const exportGrades = async () => {
        // 1. Fetch Assignments Grades
        const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select(`
                grades (score, feedback),
                assignments:assignment_id (
                    title,
                    deadline
                )
            `)
            .eq('student_id', studentId);

        if (subError) throw subError;

        // 2. Fetch Participation Grades
        const { data: participation, error: partError } = await supabase
            .from('grades')
            .select(`
                score, feedback, created_at
            `)
            .eq('student_id', studentId)
            .eq('type', 'keaktifan');

        if (partError) throw partError;

        const rows: any[] = [];

        // Assignments
        submissions?.forEach((sub: any) => {
            if (sub.grades && sub.grades.length > 0) {
                rows.push({
                    Kategori: 'Tugas',
                    Item: sub.assignments?.title,
                    Nilai: sub.grades[0].score,
                    Feedback: sub.grades[0].feedback,
                    Tanggal: '-'
                });
            }
        });

        // Participation
        participation?.forEach((p: any) => {
            rows.push({
                Kategori: 'Keaktifan',
                Item: 'Partisipasi Kelas',
                Nilai: p.score,
                Feedback: p.feedback || '-',
                Tanggal: new Date(p.created_at).toLocaleDateString('id-ID')
            });
        });

        if (rows.length === 0) {
            rows.push({ Kategori: '-', Item: 'Belum ada nilai', Nilai: 0, Feedback: '-', Tanggal: '-' });
        }

        // Dynamic import xlsx
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transkrip Nilai");
        XLSX.writeFile(wb, `TRANSKRIP_NILAI_${studentName.replace(/\s+/g, '_')}.xlsx`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                            <Archive className="text-indigo-600" size={24} />
                            Arsip Data Saya
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Download Rekap Data</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <span className="sr-only">Tutup</span>
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-8">
                    {step === 'select' && (
                        <div className="space-y-6">
                            <p className="text-slate-500 text-sm font-medium">
                                Pilih jenis data yang ingin Anda unduh sebagai arsip pribadi.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setArchiveType('attendance')}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${archiveType === 'attendance' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-indigo-200 text-slate-400'
                                        }`}
                                >
                                    <Calendar size={32} />
                                    <span className="font-bold text-sm">Absensi</span>
                                </button>
                                <button
                                    onClick={() => setArchiveType('grades')}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${archiveType === 'grades' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-indigo-200 text-slate-400'
                                        }`}
                                >
                                    <FileSpreadsheet size={32} />
                                    <span className="font-bold text-sm">Nilai</span>
                                </button>
                            </div>

                            <button
                                onClick={handleExport}
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                Download Excel
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-12 space-y-6">
                            <div className="relative w-20 h-20 mx-auto">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 animate-pulse">Sedang Mendownload...</h4>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-6 animate-in zoom-in-50">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-4">
                                <CheckCircle size={40} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 mb-2">Berhasil!</h4>
                                <p className="text-slate-500">File arsip telah tersimpan di perangkat Anda.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
