'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3, CheckCircle, Clock, BookOpen, Star,
    TrendingUp, TrendingDown, Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { StudentAssignment } from '@/types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// ========================================================
// STUDENT ANALYTICS DASHBOARD
// Display grades, attendance, and progress
// ========================================================

interface StudentAnalyticsProps {
    studentId: string;
    classId: string;
}

interface AnalyticsData {
    grades: {
        assignments: number; // Average
        quizzes: number; // Average
        keaktifan: number; // Latest or Average
    };
    attendance: {
        present: number;
        absent: number;
        late: number;
        excused: number;
        total: number;
    };
    completion: {
        assignments: { completed: number; total: number };
        quizzes: { completed: number; total: number };
    };
    history: {
        date: string;
        type: 'assignment' | 'quiz' | 'keaktifan';
        title: string;
        score: number;
    }[];
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1'];

export function StudentAnalytics({ studentId, classId }: StudentAnalyticsProps) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (studentId && classId) {
            fetchAnalytics();
        }
    }, [studentId, classId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Fetch Attendance Stats
            const { data: attendanceLogs } = await supabase
                .from('attendance_records')
                .select('status, attendance:attendance_id!inner(class_id)')
                .eq('student_id', studentId)
                .eq('attendance.class_id', classId);

            const attendance = {
                present: attendanceLogs?.filter(l => l.status === 'hadir').length || 0,
                absent: attendanceLogs?.filter(l => l.status === 'alpa').length || 0,
                late: attendanceLogs?.filter(l => l.status === 'terlambat').length || 0,
                excused: attendanceLogs?.filter(l => l.status === 'izin' || l.status === 'sakit').length || 0,
                total: attendanceLogs?.length || 0
            };

            // 2. Fetch Grades (Assignments & Keaktifan)
            const { data: grades } = await supabase
                .from('grades')
                .select('score, type, assignment:assignments(title)')
                .eq('student_id', studentId);

            const assignmentGrades = grades?.filter(g => g.type === 'assignment').map(g => g.score) || [];
            const keaktifanGrades = grades?.filter(g => g.type === 'keaktifan').map(g => g.score) || [];

            // 3. Fetch Quiz Attempts
            const { data: quizAttempts } = await supabase
                .from('quiz_attempts')
                .select('percentage, quiz:quizzes!inner(title, class_id)')
                .eq('student_id', studentId)
                .eq('quiz.class_id', classId)
                .eq('status', 'graded');

            const quizScores = quizAttempts?.map(q => Number(q.percentage)) || [];

            // 4. Calculate Averages
            const avgAssignment = assignmentGrades.length > 0
                ? assignmentGrades.reduce((a, b) => a + b, 0) / assignmentGrades.length
                : 0;

            const avgQuiz = quizScores.length > 0
                ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
                : 0;

            const avgKeaktifan = keaktifanGrades.length > 0
                ? keaktifanGrades.reduce((a, b) => a + b, 0) / keaktifanGrades.length
                : 0;

            // 5. Completion Rates (Need total counts)
            // For simplicity, using partial data or separate counts if needed. 
            // Here assuming previously fetched counts or roughly estimating.

            // Build history
            const history = [
                ...(grades?.filter(g => g.type === 'assignment').map(g => ({
                    date: '', // Created_at not selected above, simplified
                    type: 'assignment' as const,
                    title: (g.assignment as any)?.title || 'Tugas',
                    score: g.score
                })) || []),
                ...(quizAttempts?.map(q => ({
                    date: '',
                    type: 'quiz' as const,
                    title: (q.quiz as any)?.title || 'Kuis',
                    score: Number(q.percentage)
                })) || []),
                ...(grades?.filter(g => g.type === 'keaktifan').map(g => ({
                    date: '',
                    type: 'keaktifan' as const,
                    title: 'Nilai Keaktifan',
                    score: g.score
                })) || [])
            ];

            setData({
                grades: {
                    assignments: avgAssignment,
                    quizzes: avgQuiz,
                    keaktifan: avgKeaktifan
                },
                attendance,
                completion: {
                    assignments: { completed: assignmentGrades.length, total: 0 }, // Would need total assignments count
                    quizzes: { completed: quizScores.length, total: 0 }
                },
                history
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Memuat data analitik...</div>;
    }

    if (!data) return null;

    const pieData = [
        { name: 'Hadir', value: data.attendance.present, color: '#10b981' },
        { name: 'Izin/Sakit', value: data.attendance.excused, color: '#6366f1' },
        { name: 'Alpha', value: data.attendance.absent, color: '#ef4444' },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<BookOpen size={24} />}
                    label="Rata-rata Tugas"
                    value={data.grades.assignments.toFixed(0)}
                    color="indigo"
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    label="Rata-rata Kuis"
                    value={data.grades.quizzes.toFixed(0)}
                    color="emerald"
                />
                <StatCard
                    icon={<Star size={24} />}
                    label="Nilai Keaktifan"
                    value={data.grades.keaktifan.toFixed(0)}
                    color="amber"
                />
                <StatCard
                    icon={<Clock size={24} />}
                    label="Kehadiran"
                    value={data.attendance.total > 0
                        ? `${((data.attendance.present / data.attendance.total) * 100).toFixed(0)}%`
                        : '0%'}
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Chart */}
                <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Statistik Kehadiran</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grade History */}
                <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Riwayat Nilai Terbaru</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {data.history.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">Belum ada nilai yang tercatat.</p>
                        ) : (
                            data.history.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                            ${item.type === 'assignment' ? 'bg-indigo-500/20 text-indigo-400' :
                                                item.type === 'quiz' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    'bg-amber-500/20 text-amber-400'}`}>
                                            {item.type === 'assignment' && <BookOpen size={14} />}
                                            {item.type === 'quiz' && <CheckCircle size={14} />}
                                            {item.type === 'keaktifan' && <Star size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{item.title}</p>
                                            <p className="text-xs text-slate-400 capitalize">{item.type}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${item.score >= 80 ? 'text-emerald-400' :
                                            item.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                                        }`}>{item.score}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    const colors: Record<string, string> = {
        indigo: 'bg-indigo-500/20 text-indigo-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/20 text-amber-400',
        blue: 'bg-blue-500/20 text-blue-400'
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
        </div>
    );
}
