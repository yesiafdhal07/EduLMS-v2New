'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Users, ChevronDown, ChevronUp, Lock, LockOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StudentGoal {
    id: string;
    user_id: string;
    title: string;
    goals: string[];
    academic_year: string;
    unlock_date: string;
    is_unlocked: boolean;
    created_at: string;
    student_name: string;
}

interface StudentGoalsViewerProps {
    classId: string;
}

export function StudentGoalsViewer({ classId }: StudentGoalsViewerProps) {
    const [goals, setGoals] = useState<StudentGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

    const fetchStudentGoals = useCallback(async () => {
        if (!classId) return;
        
        try {
            // Fetch time capsules for students in this class
            const { data, error } = await supabase
                .from('time_capsules')
                .select(`
                    id,
                    user_id,
                    title,
                    goals,
                    academic_year,
                    unlock_date,
                    is_unlocked,
                    created_at,
                    users!inner(full_name, class_id)
                `)
                .eq('users.class_id', classId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data
            const transformedGoals = (data || []).map((item: any) => ({
                id: item.id,
                user_id: item.user_id,
                title: item.title,
                goals: item.goals || [],
                academic_year: item.academic_year,
                unlock_date: item.unlock_date,
                is_unlocked: item.is_unlocked,
                created_at: item.created_at,
                student_name: item.users?.full_name || 'Unknown'
            }));

            // Sort alphabetically by student name
            transformedGoals.sort((a, b) => a.student_name.localeCompare(b.student_name, 'id'));

            setGoals(transformedGoals);
        } catch (error) {
            console.error('Error fetching student goals:', error);
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchStudentGoals();
    }, [fetchStudentGoals]);

    const toggleExpand = (studentId: string) => {
        setExpandedStudent(expandedStudent === studentId ? null : studentId);
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-slate-400">
                Memuat target siswa...
            </div>
        );
    }

    if (goals.length === 0) {
        return (
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                <Target size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Belum ada siswa yang membuat Kapsul Waktu</p>
                <p className="text-slate-400 text-sm mt-2">Target siswa akan muncul di sini ketika mereka membuat kapsul waktu</p>
            </div>
        );
    }

    // Group by student
    const groupedByStudent = goals.reduce((acc, goal) => {
        if (!acc[goal.user_id]) {
            acc[goal.user_id] = {
                name: goal.student_name,
                capsules: []
            };
        }
        acc[goal.user_id].capsules.push(goal);
        return acc;
    }, {} as Record<string, { name: string; capsules: StudentGoal[] }>);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl">
                    <Target size={24} className="text-amber-600" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900">Target Siswa</h3>
                    <p className="text-slate-500 text-sm">{Object.keys(groupedByStudent).length} siswa telah membuat kapsul waktu</p>
                </div>
            </div>

            <div className="space-y-4">
                {Object.entries(groupedByStudent)
                    .sort(([, a], [, b]) => a.name.localeCompare(b.name, 'id'))
                    .map(([userId, data]) => (
                    <div 
                        key={userId}
                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
                    >
                        <button
                            type="button"
                            onClick={() => toggleExpand(userId)}
                            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center font-black text-amber-600">
                                    {data.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">{data.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {data.capsules.length} kapsul • 
                                        {data.capsules.reduce((sum, c) => sum + c.goals.length, 0)} target
                                    </p>
                                </div>
                            </div>
                            {expandedStudent === userId ? (
                                <ChevronUp size={20} className="text-slate-400" />
                            ) : (
                                <ChevronDown size={20} className="text-slate-400" />
                            )}
                        </button>

                        {expandedStudent === userId && (
                            <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                {data.capsules.map(capsule => (
                                    <div 
                                        key={capsule.id}
                                        className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {capsule.is_unlocked ? (
                                                    <LockOpen size={14} className="text-amber-500" />
                                                ) : (
                                                    <Lock size={14} className="text-slate-400" />
                                                )}
                                                <span className="font-bold text-slate-700 text-sm">{capsule.title}</span>
                                            </div>
                                            <span className="text-xs text-slate-400">{capsule.academic_year}</span>
                                        </div>
                                        {capsule.goals.length > 0 ? (
                                            <ul className="space-y-2">
                                                {capsule.goals.map((goal, idx) => (
                                                    <li 
                                                        key={idx}
                                                        className="flex items-start gap-2 text-sm text-slate-600"
                                                    >
                                                        <span className="text-amber-500">•</span>
                                                        {goal}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">Tidak ada target spesifik</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
