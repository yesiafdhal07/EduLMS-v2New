'use client';

import { useState, useEffect, useCallback } from 'react';
import { Swords, Trophy, TrendingUp, TrendingDown, Minus, Crown, Loader2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ============================================================
// CLASS WARS WIDGET — USP #10
// Shows live class ranking compared to other classes in the
// same school by avg grade + attendance. Drives competition.
// ============================================================

interface ClassStanding {
    classId: string;
    className: string;
    avgGrade: number;
    attendanceRate: number;
    score: number; // composite
    rank: number;
    isCurrent: boolean;
}

interface ClassWarsWidgetProps {
    schoolId: string;
    currentClassId: string;
}

function computeScore(avgGrade: number, attendanceRate: number): number {
    return Math.round(avgGrade * 0.6 + attendanceRate * 0.4);
}

export function ClassWarsWidget({ schoolId, currentClassId }: ClassWarsWidgetProps) {
    const [standings, setStandings] = useState<ClassStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStandings = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all classes in school
            const { data: classes, error: classErr } = await supabase
                .from('classes')
                .select('id, name')
                .eq('school_id', schoolId);

            if (classErr || !classes?.length) {
                setError('Tidak ada kelas ditemukan');
                return;
            }

            // Fetch grades per class
            const standingResults: ClassStanding[] = [];

            for (const cls of classes) {
                // Get class members' grades
                const { data: members } = await supabase
                    .from('class_members')
                    .select('user_id, users!inner(grades(score), attendance(status))')
                    .eq('class_id', cls.id);

                if (!members?.length) continue;

                const allGrades: number[] = [];
                let totalAttendance = 0;
                let presentCount = 0;

                members.forEach(m => {
                    const user = Array.isArray(m.users) ? m.users[0] : m.users;
                    const grades = (user as any)?.grades || [];
                    const attendance = (user as any)?.attendance || [];

                    grades.forEach((g: { score: number }) => {
                        if (g.score !== null) allGrades.push(g.score);
                    });

                    attendance.forEach((a: { status: string }) => {
                        totalAttendance++;
                        if (a.status === 'hadir') presentCount++;
                    });
                });

                const avgGrade = allGrades.length > 0
                    ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length
                    : 0;

                const attendanceRate = totalAttendance > 0
                    ? (presentCount / totalAttendance) * 100
                    : 0;

                standingResults.push({
                    classId: cls.id,
                    className: cls.name,
                    avgGrade: Math.round(avgGrade * 10) / 10,
                    attendanceRate: Math.round(attendanceRate * 10) / 10,
                    score: computeScore(avgGrade, attendanceRate),
                    rank: 0,
                    isCurrent: cls.id === currentClassId,
                });
            }

            // Sort & assign ranks
            standingResults.sort((a, b) => b.score - a.score);
            standingResults.forEach((s, i) => { s.rank = i + 1; });

            setStandings(standingResults);
        } catch (err) {
            console.error('[ClassWarsWidget]', err);
            setError('Gagal memuat data Class Wars');
        } finally {
            setLoading(false);
        }
    }, [schoolId, currentClassId]);

    useEffect(() => {
        fetchStandings();
    }, [fetchStandings]);

    const currentClass = standings.find(s => s.isCurrent);
    const total = standings.length;

    const trendIcon = currentClass
        ? currentClass.rank === 1 ? <Crown size={14} className="text-amber-400" />
          : currentClass.rank <= Math.ceil(total / 2) ? <TrendingUp size={14} className="text-emerald-400" />
          : <TrendingDown size={14} className="text-rose-400" />
        : null;

    return (
        <div className="bg-gradient-to-br from-rose-950/40 to-slate-900/80 border border-rose-500/20 rounded-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center border border-rose-500/30 shrink-0">
                    <Swords size={18} className="text-rose-400" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Class Wars</p>
                    <p className="text-xs text-slate-500">Peringkat kelas se-sekolah</p>
                </div>
                {currentClass && (
                    <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                        {trendIcon}
                        <span className="text-sm font-black text-white">#{currentClass.rank}</span>
                        <span className="text-xs text-slate-500">/ {total}</span>
                    </div>
                )}
            </div>

            {/* Standings */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-rose-400" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center py-6 text-slate-500 gap-2">
                    <Users size={28} className="opacity-40" />
                    <p className="text-xs">{error}</p>
                </div>
            ) : standings.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                    Butuh minimal 2 kelas untuk Class Wars
                </div>
            ) : (
                <div className="space-y-2">
                    {standings.slice(0, 5).map(s => (
                        <div
                            key={s.classId}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                s.isCurrent
                                    ? 'bg-indigo-600/25 border border-indigo-500/40'
                                    : 'bg-white/[0.03] border border-white/5'
                            }`}
                        >
                            {/* Rank badge */}
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                s.rank === 1 ? 'bg-amber-500/30 text-amber-300' :
                                s.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                                s.rank === 3 ? 'bg-orange-600/20 text-orange-400' :
                                'bg-white/5 text-slate-500'
                            }`}>
                                {s.rank === 1 ? '👑' : s.rank}
                            </span>

                            {/* Class name */}
                            <span className={`flex-1 text-sm font-bold truncate ${s.isCurrent ? 'text-white' : 'text-slate-400'}`}>
                                {s.className}
                                {s.isCurrent && <span className="ml-2 text-[9px] text-indigo-400 font-black">(Kelasmu)</span>}
                            </span>

                            {/* Score bar */}
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${s.isCurrent ? 'bg-indigo-500' : 'bg-slate-600'}`}
                                        style={{ width: `${Math.min(s.score, 100)}%` }}
                                    />
                                </div>
                                <span className={`text-xs font-black w-8 text-right ${s.isCurrent ? 'text-indigo-300' : 'text-slate-500'}`}>
                                    {s.score}
                                </span>
                            </div>
                        </div>
                    ))}

                    {standings.length > 5 && (
                        <p className="text-center text-[10px] text-slate-600 pt-1">
                            +{standings.length - 5} kelas lainnya
                        </p>
                    )}
                </div>
            )}

            <p className="text-[9px] text-slate-700 text-center">
                Skor = 60% Nilai + 40% Kehadiran
            </p>
        </div>
    );
}
