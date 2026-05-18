'use client';

import { useState, useMemo } from 'react';
import { FileText, Download, Printer, School } from 'lucide-react';
import type { KepsekStats, ClassOverview } from '@/hooks/useKepsekDashboard';

interface Props {
    stats: KepsekStats;
    schoolName: string;
    classes: ClassOverview[];
}

function gradeLabel(avg: number): string {
    if (avg >= 85) return 'sangat baik';
    if (avg >= 70) return 'baik';
    if (avg >= 55) return 'cukup';
    return 'perlu perhatian khusus';
}

function attendanceLabel(pct: number): string {
    if (pct >= 90) return 'sangat tinggi';
    if (pct >= 75) return 'baik';
    if (pct >= 60) return 'cukup';
    return 'rendah dan memerlukan intervensi';
}

export function NarrativeReport({ stats, schoolName, classes }: Props) {
    const [period] = useState(() => {
        const now = new Date();
        const month = now.toLocaleString('id-ID', { month: 'long' });
        return `${month} ${now.getFullYear()}`;
    });

    const bestClass = useMemo(() => {
        if (classes.length === 0) return null;
        return [...classes].sort((a, b) => b.avg_grade - a.avg_grade)[0];
    }, [classes]);

    const worstClass = useMemo(() => {
        if (classes.length === 0) return null;
        return [...classes].sort((a, b) => a.avg_grade - b.avg_grade)[0];
    }, [classes]);

    const narrative = useMemo(() => {
        const lines: string[] = [];

        lines.push(`LAPORAN NARATIF KINERJA SEKOLAH`);
        lines.push(`${schoolName} — Periode ${period}`);
        lines.push('');
        lines.push(`1. RINGKASAN UMUM`);
        lines.push(`Sekolah ${schoolName} memiliki ${stats.totalGuru} guru pengajar dan ${stats.totalSiswa} siswa aktif yang tersebar di ${stats.totalClasses} kelas. Rata-rata nilai keseluruhan adalah ${stats.avgGrade.toFixed(1)}, yang termasuk kategori ${gradeLabel(stats.avgGrade)}. Tingkat kehadiran siswa mencapai ${stats.avgAttendance.toFixed(1)}%, yang tergolong ${attendanceLabel(stats.avgAttendance)}.`);
        lines.push('');
        lines.push(`2. ANALISIS KELAS`);
        if (bestClass) {
            lines.push(`Kelas dengan performa terbaik adalah ${bestClass.name} dengan rata-rata nilai ${bestClass.avg_grade.toFixed(1)} dan ${bestClass.student_count} siswa. Pengajar kelas ini menunjukkan dedikasi yang baik dalam proses pembelajaran.`);
        }
        if (worstClass && worstClass.id !== bestClass?.id) {
            lines.push(`Kelas ${worstClass.name} memerlukan perhatian lebih dengan rata-rata nilai ${worstClass.avg_grade.toFixed(1)}. Disarankan untuk melakukan observasi kelas dan diskusi dengan guru pengampu.`);
        }
        lines.push('');
        lines.push(`3. REKOMENDASI`);

        if (stats.avgGrade < 70) {
            lines.push(`- Perlu dilakukan evaluasi metode pengajaran karena rata-rata nilai masih di bawah standar KKM.`);
        }
        if (stats.avgAttendance < 80) {
            lines.push(`- Tingkat kehadiran perlu ditingkatkan. Disarankan untuk menerapkan sistem reward kehadiran.`);
        }
        if ((stats.submissionRate ?? 0) < 70) {
            lines.push(`- Tingkat pengumpulan tugas (${(stats.submissionRate ?? 0).toFixed(0)}%) perlu ditingkatkan melalui reminder dan follow-up berkala.`);
        }
        if (stats.avgGrade >= 80 && stats.avgAttendance >= 85) {
            lines.push(`- Performa sekolah secara keseluruhan sudah baik. Pertahankan dan tingkatkan dengan program pengayaan.`);
        }

        lines.push('');
        lines.push(`Laporan ini dibuat secara otomatis oleh sistem Klolakelas pada ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`);

        return lines.join('\n');
    }, [stats, schoolName, period, bestClass, worstClass]);

    const handlePrint = () => {
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`<html><head><title>Laporan ${schoolName}</title><style>body{font-family:system-ui;padding:40px;max-width:800px;margin:0 auto;line-height:1.8;color:#1a1a1a}h1{border-bottom:2px solid #000;padding-bottom:8px}</style></head><body><pre style="white-space:pre-wrap;font-family:system-ui">${narrative}</pre></body></html>`);
            win.document.close();
            win.print();
        }
    };

    const handleDownload = () => {
        const blob = new Blob([narrative], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_${schoolName.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileText size={20} className="text-amber-400" />
                    <h3 className="text-lg font-black text-white">Laporan Naratif</h3>
                    <span className="bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/20">{period}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleDownload}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#181A20] border border-white/5 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors">
                        <Download size={12} /> Unduh
                    </button>
                    <button onClick={handlePrint}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors">
                        <Printer size={12} /> Cetak
                    </button>
                </div>
            </div>

            <div className="bg-[#181A20] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                    <School size={16} className="text-amber-400" />
                    <p className="text-sm font-black text-white">{schoolName}</p>
                    <span className="text-slate-600 text-xs">&middot; Periode {period}</span>
                </div>
                <pre className="text-sm text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                    {narrative}
                </pre>
            </div>
        </div>
    );
}
