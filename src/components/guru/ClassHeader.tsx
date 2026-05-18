'use client';

import { Users, FileText, CheckCircle, Clock, BookOpen, TrendingUp } from 'lucide-react';

interface ClassStats {
    studentCount: number;
    assignmentCount: number;
    materialCount: number;
    avgGrade: number;
    submissionRate: number;
    attendanceRate: number;
}

interface Props {
    className: string;
    stats: ClassStats;
}

export function ClassHeader({ className: clsName, stats }: Props) {
    const items = [
        { icon: Users, label: 'Siswa', value: stats.studentCount, color: 'text-blue-400' },
        { icon: FileText, label: 'Tugas', value: stats.assignmentCount, color: 'text-violet-400' },
        { icon: BookOpen, label: 'Materi', value: stats.materialCount, color: 'text-cyan-400' },
        { icon: TrendingUp, label: 'Rata-rata', value: stats.avgGrade.toFixed(1), color: 'text-emerald-400' },
        { icon: CheckCircle, label: 'Pengumpulan', value: `${stats.submissionRate.toFixed(0)}%`, color: 'text-amber-400' },
        { icon: Clock, label: 'Kehadiran', value: `${stats.attendanceRate.toFixed(0)}%`, color: 'text-rose-400' },
    ];

    return (
        <div className="bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/10 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest">Kelas Aktif</p>
                    <h2 className="text-xl font-black text-white">{clsName}</h2>
                </div>
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <BookOpen size={20} className="text-indigo-400" />
                </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {items.map(item => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-3 text-center">
                        <item.icon size={14} className={`${item.color} mx-auto mb-1.5`} />
                        <p className="text-white font-black text-sm">{item.value}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
