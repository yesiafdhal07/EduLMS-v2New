'use client';

import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Users, BookOpen, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/error-handler';

interface TeacherStats {
    totalStudents: number;
    activeAssignments: number;
    classAverage: number;
    attendanceRate: number;
}

interface TeacherStatsPanelProps {
    classId?: string;
}

export function TeacherStatsPanel({ classId }: TeacherStatsPanelProps) {
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get teacher's classes
            const { data: classes } = await supabase
                .from('classes')
                .select('id')
                .eq('teacher_id', user.id);

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

            // 4. Class Average (from grades)
            const { data: grades } = await supabase
                .from('grades')
                .select('score');

            const allScores = grades?.map(g => g.score).filter((s): s is number => s !== null) || [];
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

    const statsConfig = [
        { label: 'Total Siswa', value: stats.totalStudents.toString(), icon: Users, bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
        { label: 'Tugas Aktif', value: stats.activeAssignments.toString(), icon: BookOpen, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        { label: 'Rata-rata Kelas', value: stats.classAverage.toFixed(1), icon: TrendingUp, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
        { label: 'Tingkat Hadir', value: `${stats.attendanceRate}%`, icon: CheckCircle, bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {statsConfig.map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor} ${stat.textColor}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution Chart */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Distribusi Nilai Siswa</h3>
                        <span className="text-xs text-slate-400 font-medium">Data Real-time</span>
                    </div>
                    <div className="h-64 w-full">
                        {gradeDistribution.some(g => g.value > 0) ? (
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
                                    >
                                        {gradeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                Belum ada data nilai
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-4 flex-wrap">
                        {gradeDistribution.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                {item.name}: <span className="font-bold">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance Trend Chart */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Tren Kehadiran Mingguan</h3>
                        <span className="text-xs text-slate-400 font-medium">7 Hari Terakhir</span>
                    </div>
                    <div className="h-64 w-full">
                        {attendanceTrend.some(t => t.hadir > 0) ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                                <BarChart data={attendanceTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`${value}%`, 'Kehadiran']}
                                    />
                                    <Bar dataKey="hadir" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} name="Kehadiran (%)" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                Belum ada data kehadiran minggu ini
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
