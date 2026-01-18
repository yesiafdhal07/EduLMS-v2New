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
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <Star className="text-amber-400" size={20} />
                    </div>
                    <h3 className="text-lg font-black text-white">Riwayat Nilai Keaktifan</h3>
                </div>
                <div className="flex gap-4 text-sm w-full md:w-auto justify-between md:justify-end">
                    <div className="text-center">
                        <p className="text-amber-400 font-bold">{grades.length}</p>
                        <p className="text-slate-400 text-xs">Total</p>
                    </div>
                    <div className="text-center">
                        <p className="text-emerald-400 font-bold">{avgScore.toFixed(1)}</p>
                        <p className="text-slate-400 text-xs">Rata-rata</p>
                    </div>
                    <div className="text-center">
                        <p className="text-blue-400 font-bold">{uniqueStudents}</p>
                        <p className="text-slate-400 text-xs">Siswa</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
                <div className="overflow-x-auto">
                    <div className="min-w-[500px] space-y-3">
                        {grades.map((grade) => (
                            <div
                                key={grade.id}
                                className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                                        <User size={14} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{grade.student.full_name}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(grade.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-black ${grade.score >= 80 ? 'text-emerald-400' :
                                        grade.score >= 60 ? 'text-amber-400' : 'text-red-400'
                                        }`}>
                                        {grade.score}
                                    </p>
                                    {grade.feedback && (
                                        <p className="text-xs text-slate-400 max-w-[150px] truncate">{grade.feedback}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
