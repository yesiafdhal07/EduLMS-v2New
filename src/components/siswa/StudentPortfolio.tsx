'use client';

import { useState, useEffect, useMemo } from 'react';
import { Briefcase, Award, TrendingUp, BookOpen, Calendar, Star, Download, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
    studentId: string;
    studentName: string;
    classId?: string;
}

interface PortfolioData {
    totalAssignments: number;
    submittedCount: number;
    avgGrade: number;
    topGrades: { title: string; grade: number }[];
    attendanceRate: number;
    totalDays: number;
    presentDays: number;
    badges: { name: string; icon: string }[];
    xp: number;
    level: number;
}

export function StudentPortfolio({ studentId, studentName, classId }: Props) {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) return;
        const fetch = async () => {
            setLoading(true);

            const [assignmentRes, submissionRes, attendanceRes, gamRes] = await Promise.all([
                classId ? supabase.from('assignments').select('id, title').eq('class_id', classId) : Promise.resolve({ data: [] }),
                supabase.from('submissions').select('id, grade, assignment_id, assignments!inner(title)').eq('student_id', studentId).not('grade', 'is', null).order('grade', { ascending: false }),
                supabase.from('attendance_logs').select('status').eq('student_id', studentId),
                supabase.from('gamification_points').select('points').eq('user_id', studentId),
            ]);

            const assignments = assignmentRes.data || [];
            const submissions = (submissionRes.data || []) as any[];
            const attendance = attendanceRes.data || [];
            const gamPoints = (gamRes.data || []) as any[];

            const totalXP = gamPoints.reduce((s: number, p: any) => s + (p.points || 0), 0);
            const grades = submissions.filter(s => s.grade != null);
            const avgGrade = grades.length > 0 ? grades.reduce((s, g) => s + g.grade, 0) / grades.length : 0;

            const totalDays = attendance.length;
            const presentDays = attendance.filter((a: any) => a.status === 'hadir' || a.status === 'present').length;

            const topGrades = grades.slice(0, 5).map(s => ({
                title: s.assignments?.title || 'Tugas',
                grade: s.grade,
            }));

            setData({
                totalAssignments: assignments.length,
                submittedCount: submissions.length,
                avgGrade,
                topGrades,
                attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
                totalDays,
                presentDays,
                badges: [],
                xp: totalXP,
                level: Math.floor(totalXP / 500) + 1,
            });
            setLoading(false);
        };
        fetch();
    }, [studentId, classId]);

    const handleExport = () => {
        if (!data) return;
        const lines = [
            `PORTOFOLIO SISWA`,
            `Nama: ${studentName}`,
            `Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
            ``,
            `RINGKASAN AKADEMIK`,
            `Tugas dikumpulkan: ${data.submittedCount}`,
            `Rata-rata Nilai: ${data.avgGrade.toFixed(1)}`,
            `Tingkat Kehadiran: ${data.attendanceRate.toFixed(1)}% (${data.presentDays}/${data.totalDays} hari)`,
            ``,
            `TOP NILAI TERBAIK`,
            ...data.topGrades.map((g, i) => `${i + 1}. ${g.title}: ${g.grade}`),
            ``,
            `GAMIFIKASI`,
            `XP Total: ${data.xp}`,
            `Level: ${data.level}`,
        ];

        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Portofolio_${studentName.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-white/5 rounded-3xl" />
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/10 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                            {studentName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">{studentName}</h2>
                            <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Portofolio Siswa</p>
                        </div>
                    </div>
                    <button onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-colors">
                        <Download size={12} /> Ekspor
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBlock icon={<TrendingUp size={16} className="text-emerald-400" />} label="Rata-rata Nilai" value={data.avgGrade.toFixed(1)} />
                    <StatBlock icon={<FileText size={16} className="text-blue-400" />} label="Tugas Dikumpul" value={`${data.submittedCount}`} />
                    <StatBlock icon={<Calendar size={16} className="text-amber-400" />} label="Kehadiran" value={`${data.attendanceRate.toFixed(0)}%`} />
                    <StatBlock icon={<Star size={16} className="text-violet-400" />} label="Level / XP" value={`Lv.${data.level} (${data.xp})`} />
                </div>
            </div>

            {data.topGrades.length > 0 && (
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Award size={18} className="text-amber-400" />
                        <h3 className="text-lg font-black text-white">Nilai Terbaik</h3>
                    </div>
                    <div className="space-y-2">
                        {data.topGrades.map((g, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                                    i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-500/20 text-slate-300' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                    #{i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{g.title}</p>
                                </div>
                                <span className="text-lg font-black text-emerald-400">{g.grade}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar size={18} className="text-blue-400" />
                    <h3 className="text-lg font-black text-white">Ringkasan Kehadiran</h3>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round"
                                strokeDasharray={`${data.attendanceRate} ${100 - data.attendanceRate}`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-black text-white">{data.attendanceRate.toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-slate-400">
                            Hadir <span className="text-emerald-400 font-bold">{data.presentDays}</span> dari <span className="text-white font-bold">{data.totalDays}</span> hari
                        </p>
                        <p className="text-xs text-slate-500">
                            {data.attendanceRate >= 90 ? 'Kehadiran sangat baik! Pertahankan!' :
                                data.attendanceRate >= 75 ? 'Kehadiran baik, tapi bisa lebih baik lagi.' :
                                'Perlu meningkatkan kehadiran.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-2">{icon}</div>
            <p className="text-white font-black text-lg">{value}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase">{label}</p>
        </div>
    );
}
