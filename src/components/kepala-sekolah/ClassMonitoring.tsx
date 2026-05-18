'use client';

import { Users, TrendingUp, BookOpen } from 'lucide-react';

interface ClassOverview {
    id: string;
    name: string;
    teacher_name: string;
    student_count: number;
    avg_grade: number;
    attendance_rate: number;
}

export function ClassMonitoring({ classes }: { classes: ClassOverview[] }) {
    const getGradeColor = (grade: number) => {
        if (grade >= 80) return 'text-emerald-400';
        if (grade >= 70) return 'text-amber-400';
        if (grade > 0) return 'text-rose-400';
        return 'text-slate-500';
    };

    const getGradeBg = (grade: number) => {
        if (grade >= 80) return 'bg-emerald-500';
        if (grade >= 70) return 'bg-amber-500';
        if (grade > 0) return 'bg-rose-500';
        return 'bg-slate-600';
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-black text-white">Monitoring Kelas</h2>

            <div className="bg-[#181A20] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kelas</th>
                                <th className="text-left px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Guru</th>
                                <th className="text-center px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Siswa</th>
                                <th className="text-center px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rata-rata Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(cls => (
                                <tr key={cls.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                                <BookOpen size={14} className="text-amber-400" />
                                            </div>
                                            <span className="text-white font-bold">{cls.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-400">{cls.teacher_name}</td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Users size={12} className="text-slate-500" />
                                            <span className="text-white font-bold">{cls.student_count}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getGradeBg(cls.avg_grade)}`} />
                                            <span className={`font-black ${getGradeColor(cls.avg_grade)}`}>
                                                {cls.avg_grade > 0 ? cls.avg_grade : '-'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {classes.length === 0 && (
                    <div className="py-12 text-center text-slate-500 font-medium">Belum ada data kelas.</div>
                )}
            </div>
        </div>
    );
}
