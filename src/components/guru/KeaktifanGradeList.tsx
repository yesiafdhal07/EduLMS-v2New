// ============================================================
// KEAKTIFAN GRADE LIST
// Component to display keaktifan grades given by teacher
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { Star, User, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface KeaktifanGrade {
    id: string;
    score: number;
    feedback: string | null;
    created_at: string;
    student: {
        full_name: string;
    };
}

interface KeaktifanGradeListProps {
    classId: string | null;
}

export function KeaktifanGradeList({ classId }: KeaktifanGradeListProps) {
    const [grades, setGrades] = useState<KeaktifanGrade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!classId) return;

        const fetchGrades = async () => {
            setLoading(true);
            try {
                // Get class members first
                const { data: members } = await supabase
                    .from('class_members')
                    .select('user_id')
                    .eq('class_id', classId);

                const studentIds = (members || []).map(m => m.user_id);

                if (studentIds.length === 0) {
                    setGrades([]);
                    setLoading(false);
                    return;
                }

                // Fetch keaktifan grades for these students
                const { data, error } = await supabase
                    .from('grades')
                    .select(`
                        id, score, feedback, created_at,
                        student:users!grades_student_id_fkey(full_name)
                    `)
                    .eq('type', 'keaktifan')
                    .in('student_id', studentIds)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (error) {
                    console.error('Error fetching keaktifan grades:', error);
                } else {
                    setGrades((data || []) as unknown as KeaktifanGrade[]);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, [classId]);

    if (!classId) return null;

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (grades.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <Star className="text-amber-400" size={20} />
                    </div>
                    <h3 className="text-lg font-black text-white">Riwayat Nilai Keaktifan</h3>
                </div>
                <p className="text-slate-400 text-center py-8">Belum ada nilai keaktifan yang diberikan.</p>
            </div>
        );
    }

    // Calculate stats
    const avgScore = grades.reduce((a, b) => a + b.score, 0) / grades.length;
    const uniqueStudents = new Set(grades.map(g => g.student.full_name)).size;

    return (
        <div className="bg-[#12141C] backdrop-blur-2xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
            {/* Header with Background Accent */}
            <div className="relative p-8 pb-6 border-b border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] rounded-full -mr-16 -mt-16" />
                
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 rotate-3">
                            <Star className="text-white" size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight leading-tight">
                                Riwayat Nilai<br />Keaktifan
                            </h3>
                            <p className="text-slate-500 text-xs mt-1 font-medium uppercase tracking-widest">Aktivitas Siswa Terbaru</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-center min-w-[80px]">
                            <p className="text-amber-400 font-black text-lg leading-none">{grades.length}</p>
                            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Total</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-center min-w-[80px]">
                            <p className="text-emerald-400 font-black text-lg leading-none">{avgScore.toFixed(1)}</p>
                            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Rata</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-center min-w-[80px]">
                            <p className="text-sky-400 font-black text-lg leading-none">{uniqueStudents}</p>
                            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Siswa</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Body */}
            <div className="p-4 max-h-[450px] overflow-y-auto universe-scrollbar">
                <div className="space-y-2">
                    {grades.map((grade) => (
                        <div
                            key={grade.id}
                            className="group flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl p-4 border border-white/5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 transition-colors">
                                    <User size={18} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
                                </div>
                                <div className="max-w-[140px] sm:max-w-[200px]">
                                    <p className="text-white font-bold truncate tracking-tight">{grade.student.full_name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(grade.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </p>
                                        {grade.feedback && (
                                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                        )}
                                        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[80px]">
                                            {grade.feedback}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className={`text-2xl font-black tabular-nums tracking-tighter ${
                                        grade.score >= 80 ? 'text-emerald-400' :
                                        grade.score >= 60 ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                        {grade.score}
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${
                                                grade.score >= 80 ? 'bg-emerald-500' :
                                                grade.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${grade.score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Insight */}
            <div className="bg-amber-500/5 p-4 text-center">
                <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.2em]">
                    Trend Keaktifan Stabil • {grades.length} Entri Terakhir
                </p>
            </div>
        </div>
    );
}
