'use client';

import { useState } from 'react';
import { Download, Calendar, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { exportAttendanceToPdf, type AttendanceRecord } from '@/lib/exportPdf';

interface AttendanceExportProps {
    classId: string;
    className: string;
}

interface AttendanceData {
    date: string;
    student_name: string;
    status: string;
    recorded_at: string;
}

export function AttendanceExport({ classId, className }: AttendanceExportProps) {
    const [loading, setLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'semester'>('month');

    const getDateRange = () => {
        const end = new Date();
        const start = new Date();

        switch (dateRange) {
            case 'week':
                start.setDate(end.getDate() - 7);
                break;
            case 'month':
                start.setMonth(end.getMonth() - 1);
                break;
            case 'semester':
                start.setMonth(end.getMonth() - 6);
                break;
        }

        return { start, end };
    };

    const handleExport = async () => {
        if (!classId) {
            toast.error('Pilih kelas terlebih dahulu');
            return;
        }

        setLoading(true);
        try {
            const { start, end } = getDateRange();

            // Fetch attendance data
            const { data, error } = await supabase
                .from('attendance')
                .select(`
                    date,
                    attendance_records (
                        status,
                        recorded_at,
                        student_id,
                        users:student_id (full_name)
                    )
                `)
                .eq('class_id', classId)
                .gte('date', start.toISOString().split('T')[0])
                .lte('date', end.toISOString().split('T')[0])
                .order('date', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.warning('Tidak ada data absensi dalam rentang waktu ini');
                setLoading(false);
                return;
            }

            // Transform data for Excel
            const excelData: AttendanceData[] = [];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.forEach((attendance: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                attendance.attendance_records?.forEach((record: any) => {
                    excelData.push({
                        date: new Date(attendance.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        student_name: record.users?.full_name || 'Unknown',
                        status: record.status.toUpperCase(),
                        recorded_at: record.recorded_at
                            ? new Date(record.recorded_at).toLocaleTimeString('id-ID')
                            : '-'
                    });
                });
            });

            // Sort by date and name
            excelData.sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                return a.student_name.localeCompare(b.student_name);
            });

            // Dynamic import xlsx - reduces initial bundle size
            const XLSX = await import('xlsx');

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Create main data sheet
            const ws = XLSX.utils.json_to_sheet(excelData, {
                header: ['date', 'student_name', 'status', 'recorded_at']
            });

            // Set column headers
            XLSX.utils.sheet_add_aoa(ws, [
                ['Tanggal', 'Nama Siswa', 'Status', 'Waktu Presensi']
            ], { origin: 'A1' });

            // Set column widths
            ws['!cols'] = [
                { wch: 30 },  // Tanggal
                { wch: 25 },  // Nama Siswa
                { wch: 10 },  // Status
                { wch: 15 }   // Waktu
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi');

            // Create summary sheet
            const summaryData = calculateSummary(excelData);
            const summaryWs = XLSX.utils.json_to_sheet(summaryData);
            XLSX.utils.sheet_add_aoa(summaryWs, [
                ['Nama Siswa', 'Hadir', 'Izin', 'Sakit', 'Alpa', 'Total', 'Persentase Kehadiran']
            ], { origin: 'A1' });
            summaryWs['!cols'] = [
                { wch: 25 },
                { wch: 8 },
                { wch: 8 },
                { wch: 8 },
                { wch: 8 },
                { wch: 8 },
                { wch: 20 }
            ];
            XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan');

            // Generate filename
            const rangeLabel = dateRange === 'week' ? 'Mingguan' : dateRange === 'month' ? 'Bulanan' : 'Semester';
            const filename = `Absensi_${className}_${rangeLabel}_${new Date().toISOString().split('T')[0]}.xlsx`;

            // Download
            XLSX.writeFile(wb, filename);
            toast.success('File berhasil diunduh!');

        } catch (error) {
            console.error('Export error:', error);
            toast.error('Gagal mengexport data absensi');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPdf = async () => {
        if (!classId) {
            toast.error('Pilih kelas terlebih dahulu');
            return;
        }

        setPdfLoading(true);
        try {
            const { start, end } = getDateRange();

            const { data, error } = await supabase
                .from('attendance')
                .select(`
                    date,
                    attendance_records (
                        status,
                        recorded_at,
                        student_id,
                        users:student_id (full_name)
                    )
                `)
                .eq('class_id', classId)
                .gte('date', start.toISOString().split('T')[0])
                .lte('date', end.toISOString().split('T')[0])
                .order('date', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.warning('Tidak ada data absensi dalam rentang waktu ini');
                setPdfLoading(false);
                return;
            }

            // Transform data for PDF
            const pdfData: AttendanceRecord[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.forEach((attendance: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                attendance.attendance_records?.forEach((record: any) => {
                    pdfData.push({
                        studentName: record.users?.full_name || 'Unknown',
                        date: attendance.date,
                        status: record.status,
                        time: record.recorded_at
                            ? new Date(record.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                            : undefined
                    });
                });
            });

            const rangeLabel = dateRange === 'week' ? '7 Hari' : dateRange === 'month' ? '1 Bulan' : 'Semester';
            exportAttendanceToPdf(pdfData, className, rangeLabel);
            toast.success('PDF berhasil diunduh!');

        } catch (error) {
            console.error('PDF Export error:', error);
            toast.error('Gagal mengexport PDF');
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
                <Calendar size={18} className="text-indigo-400" />
                <span className="text-sm font-bold text-slate-300">Export Absensi:</span>
            </div>

            <div className="flex-1 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setDateRange('week')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateRange === 'week'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                    aria-pressed={dateRange === 'week'}
                >
                    7 Hari
                </button>
                <button
                    type="button"
                    onClick={() => setDateRange('month')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateRange === 'month'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                    aria-pressed={dateRange === 'month'}
                >
                    1 Bulan
                </button>
                <button
                    type="button"
                    onClick={() => setDateRange('semester')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateRange === 'semester'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                    aria-pressed={dateRange === 'semester'}
                >
                    Semester
                </button>
            </div>

            <button
                type="button"
                onClick={handleExport}
                disabled={loading || pdfLoading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                aria-label="Download file Excel absensi"
            >
                {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Download size={18} />
                )}
                Excel
            </button>

            <button
                type="button"
                onClick={handleExportPdf}
                disabled={loading || pdfLoading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-600/20"
                aria-label="Download file PDF absensi"
            >
                {pdfLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <FileText size={18} />
                )}
                PDF
            </button>
        </div>
    );
}

function calculateSummary(data: AttendanceData[]) {
    const summary: Record<string, { hadir: number; izin: number; sakit: number; alpa: number }> = {};

    data.forEach(record => {
        if (!summary[record.student_name]) {
            summary[record.student_name] = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
        }

        const status = record.status.toLowerCase() as 'hadir' | 'izin' | 'sakit' | 'alpa';
        if (summary[record.student_name][status] !== undefined) {
            summary[record.student_name][status]++;
        }
    });

    return Object.entries(summary).map(([name, counts]) => {
        const total = counts.hadir + counts.izin + counts.sakit + counts.alpa;
        const percentage = total > 0 ? ((counts.hadir / total) * 100).toFixed(1) + '%' : '0%';

        return {
            student_name: name,
            hadir: counts.hadir,
            izin: counts.izin,
            sakit: counts.sakit,
            alpa: counts.alpa,
            total,
            percentage
        };
    }).sort((a, b) => a.student_name.localeCompare(b.student_name));
}
