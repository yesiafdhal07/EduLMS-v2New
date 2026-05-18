'use client';

import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Users, BookOpen, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/error-handler';
import { SkeletonCardGrid } from '@/components/ui/SkeletonLoading';
import { ErrorBoundary } from '@/components/ui';

interface TeacherStats {
    totalStudents: number;
    activeAssignments: number;
    classAverage: number;
    attendanceRate: number;
}

interface TeacherStatsPanelProps {
    classId?: string;
    teacherId?: string;
}

export function TeacherStatsPanel({ classId, teacherId }: TeacherStatsPanelProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<TeacherStats>({
        totalStudents: 0,
        activeAssignments: 0,
        classAverage: 0,
        attendanceRate: 0
    });
    const [gradeDistribution, setGradeDistribution] = useState<Array<{ name: string; value: number; color: string }>>([]);
    const [attendanceTrend, setAttendanceTrend] = useState<Array<{ day: string; hadir: number }>>([]);

    // Fetch all data
    const fetchData = async () => {
        try {
            setLoading(true);
            let currentTeacherId = teacherId;
            
            if (!currentTeacherId) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                currentTeacherId = user.id;
            }

            // 1. Get teacher's classes
            const { data: classes } = await supabase
                .from('classes')
                .select('id')
                .eq('teacher_id', currentTeacherId);

            const classIds = classId ? [classId] : (classes?.map(c => c.id) || []);
            if (classIds.length === 0) {
                setLoading(false);
                return;
            }

            // 2. Total Students
            const { count: studentCount } = await supabase
                .from('class_members')
                .select('*', { count: 'exact', head: true })
                .in('class_id', classIds);

            // 3. Active Assignments (deadline > now)
            const { data: subjects } = await supabase
                .from('subjects')
                .select('id')
                .in('class_id', classIds);

            const subjectIds = subjects?.map(s => s.id) || [];

            const { count: activeAssignments } = await supabase
                .from('assignments')
                .select('*', { count: 'exact', head: true })
                .in('subject_id', subjectIds)
                .gte('deadline', new Date().toISOString());

            // 4. Class Average & Grade Distribution (from members of these classes)
            const { data: memberGrades } = await supabase
                .from('class_members')
                .select('users(id, grades(score))')
                .in('class_id', classIds);

            const allScores = (memberGrades || [])
                .flatMap(m => (m.users as any)?.grades || [])
                .map((g: any) => g.score)
                .filter((s): s is number => s !== null);

            const classAverage = allScores.length > 0
                ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
                : 0;

            // 5. Grade Distribution
            const distribution = calculateGradeDistribution(allScores);
            setGradeDistribution(distribution);

            // 6. Attendance Rate (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const { data: attendanceData } = await supabase
                .from('attendance')
                .select('id, date, attendance_records(status)')
                .in('class_id', classIds)
                .gte('date', weekAgo.toISOString().split('T')[0])
                .order('date', { ascending: true });

            const { rate, trend } = calculateAttendanceStats(attendanceData || []);
            setAttendanceTrend(trend);

            setStats({
                totalStudents: studentCount || 0,
                activeAssignments: activeAssignments || 0,
                classAverage: Math.round(classAverage * 10) / 10,
                attendanceRate: rate
            });

        } catch (error) {
            logError(error, 'TeacherStatsPanel.fetchData');
        } finally {
            setLoading(false);
        }
    };

    // Calculate grade distribution
    function calculateGradeDistribution(scores: number[]) {
        const distribution = { A: 0, B: 0, C: 0, D: 0 };

        scores.forEach(score => {
            if (score >= 85) distribution.A++;
            else if (score >= 70) distribution.B++;
            else if (score >= 55) distribution.C++;
            else distribution.D++;
        });

        return [
            { name: 'A (85-100)', value: distribution.A, color: '#10B981' },
            { name: 'B (70-84)', value: distribution.B, color: '#6366F1' },
            { name: 'C (55-69)', value: distribution.C, color: '#F59E0B' },
            { name: 'D (<55)', value: distribution.D, color: '#EF4444' },
        ];
    }

    // Calculate attendance stats
    function calculateAttendanceStats(data: any[]): { rate: number; trend: Array<{ day: string; hadir: number }> } {
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const trendMap: Record<string, { total: number; hadir: number }> = {};

        let totalRecords = 0;
        let hadirRecords = 0;

        data.forEach(attendance => {
            const date = new Date(attendance.date);
            const dayName = dayNames[date.getDay()];

            if (!trendMap[dayName]) {
                trendMap[dayName] = { total: 0, hadir: 0 };
            }

            attendance.attendance_records?.forEach((record: any) => {
                totalRecords++;
                trendMap[dayName].total++;
                if (record.status === 'hadir') {
                    hadirRecords++;
                    trendMap[dayName].hadir++;
                }
            });
        });

        const rate = totalRecords > 0 ? Math.round((hadirRecords / totalRecords) * 100) : 0;

        // Convert to array for chart (weekday order)
        const weekdays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        const trend = weekdays.map(day => ({
            day,
            hadir: trendMap[day]?.total > 0
                ? Math.round((trendMap[day].hadir / trendMap[day].total) * 100)
                : 0
        }));

        return { rate, trend };
    }

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [classId]);

    // Real-time subscriptions
    useEffect(() => {
        const channel = supabase
            .channel('teacher_stats_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'class_members' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, fetchData)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [classId]);

    // Calculate health score (0-100)
    const healthScore = Math.round(
        (stats.attendanceRate * 0.3) + 
        (Math.min(stats.classAverage, 100) * 0.4) + 
        (stats.activeAssignments > 0 ? 20 : 30)
    );
    
    const isHealthy = healthScore >= 80;
    const isWarning = healthScore >= 60 && healthScore < 80;

    const statsConfig = [
        { label: 'Total Siswa', value: stats.totalStudents.toString(), icon: Users, gradient: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/20' },
        { label: 'Tugas Aktif', value: stats.activeAssignments.toString(), icon: BookOpen, gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
        { label: 'Rata-rata Kelas', value: stats.classAverage.toFixed(1), icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
        { label: 'Tingkat Hadir', value: `${stats.attendanceRate}%`, icon: CheckCircle, gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
    ];

    if (loading) {
        return <SkeletonCardGrid count={4} />;
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* Quick Stats Cards (Bento Bento) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {/* Class Health Score - USP Feature */}
                <div className="group relative overflow-hidden rounded-[2rem] p-6 border border-white/5 bg-gradient-to-br from-emerald-500/10 to-indigo-500/5 hover:bg-emerald-500/15 transition-all duration-500 hover:-translate-y-1">
                    <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">Class Health</p>
                            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`} />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">{healthScore}</h3>
                            <span className="text-sm text-slate-500 font-bold">/100</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${isHealthy ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : isWarning ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}
                                style={{ width: `${healthScore}%` }}
                            />
                        </div>
                        <p className={`text-[10px] font-bold ${isHealthy ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'}`}>
                            {isHealthy ? '✨ Excellent' : isWarning ? '⚠️ Needs Attention' : '🔴 Critical'}
                        </p>
                    </div>
                    {/* Glow effect */}
                    <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl transition-all ${isHealthy ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' : isWarning ? 'bg-amber-500/20 group-hover:bg-amber-500/30' : 'bg-rose-500/20 group-hover:bg-rose-500/30'}`} />
                </div>

                {statsConfig.map((stat, idx) => (
                    <div 
                        key={idx} 
                        className="group relative overflow-hidden rounded-[2rem] p-6 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20"
                    >
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            
                            <div>
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">
                                        {stat.value}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Grade Distribution Chart (Bento Style) */}
                <div className="glass-panel rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/20">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <TrendingUp className="text-indigo-400" size={18} />
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-white tracking-tight">Distribusi Performa</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Analisis Nilai Kumulatif</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Live Sync</span>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        {gradeDistribution.some(g => g.value > 0) ? (
                            <ErrorBoundary>
                                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                                    <PieChart>
                                        <Pie
                                            data={gradeDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {gradeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}
                                            itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ErrorBoundary>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                Belum ada data nilai
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-4 flex-wrap">
                        {gradeDistribution.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                {item.name}: <span className="font-bold text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance Trend Chart (Bento Style) */}
                <div className="glass-panel rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/20">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <CheckCircle className="text-emerald-400" size={18} />
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-white tracking-tight">Tren Kehadiran</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ringkasan Mingguan</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        {attendanceTrend.some(t => t.hadir > 0) ? (
                            <ErrorBoundary>
                                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                                    <BarChart data={attendanceTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}
                                            formatter={(value) => [`${value}%`, 'Kehadiran']}
                                            labelStyle={{ color: '#94a3b8' }}
                                        />
                                        <Bar dataKey="hadir" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} name="Kehadiran (%)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ErrorBoundary>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                Belum ada data kehadiran minggu ini
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
