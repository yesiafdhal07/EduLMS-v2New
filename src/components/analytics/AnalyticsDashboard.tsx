'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, CheckCircle, Clock,
    Award, Calendar, FileText, BarChart3, PieChartIcon,
    Download, Filter, RefreshCcw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ========================================================
// ANALYTICS DASHBOARD
// Interactive charts and statistics for teachers
// ========================================================

interface AnalyticsDashboardProps {
    classId: string;
    className?: string;
}

interface AnalyticsData {
    attendance: {
        present: number;
        absent: number;
        late: number;
        excused: number;
        trend: { date: string; present: number; absent: number }[];
    };
    assignments: {
        total: number;
        submitted: number;
        pending: number;
        graded: number;
        avgScore: number;
        byAssignment: { name: string; submitted: number; total: number; avg: number }[];
    };
    students: {
        total: number;
        active: number;
        atRisk: number;
        topPerformers: { name: string; score: number }[];
        distribution: { grade: string; count: number }[];
    };
    quizzes: {
        total: number;
        avgScore: number;
        passRate: number;
        byQuiz: { name: string; attempts: number; avgScore: number }[];
    };
    keaktifan: {
        totalGiven: number;
        avgScore: number;
        topStudents: { name: string; score: number }[];
    };
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AnalyticsDashboard({ classId, className }: AnalyticsDashboardProps) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'semester'>('month');
    const [activeChart, setActiveChart] = useState<'attendance' | 'assignments' | 'students' | 'quizzes' | 'keaktifan'>('attendance');

    useEffect(() => {
        fetchAnalytics();

        // Realtime Subscriptions
        const channels = [
            // Watch for new attendance check-ins
            // 'attendance_logs' is usually a view, so we subscribe to the underlying 'attendance_records' table
            supabase.channel(`analytics_attendance_${classId}`)
                // Filter by attendance_id would be ideal but that requires joining.
                // Instead, we just watch for global attendance_records changes and rely on debounce or teacher RLS.
                // Or better: filter by nothing and let debounce handle it, or filter by user if possible.
                // Given RLS, teacher only receives events for their classes if policies are set correctly for realtime.
                // Safest broad approach:
                .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, () => debounceFetch())
                .subscribe(),

            // Watch for NEW submissions & grades
            supabase.channel(`analytics_global_changes`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => debounceFetch())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, () => debounceFetch())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_attempts' }, () => debounceFetch())
                .subscribe()
        ];

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel));
        };
    }, [classId, dateRange]);

    // Debounce ref to prevent memory leaks
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const debounceFetch = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchAnalytics(), 2000);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);

        // Fetch attendance data with limit for performance
        const { data: attendanceData } = await supabase
            .from('attendance_logs')
            .select('status, created_at')
            .eq('class_id', classId)
            .order('created_at', { ascending: false })
            .limit(500);

        // Fetch assignment submissions
        const { data: submissionData } = await supabase
            .from('submissions')
            .select(`
                id, grade, created_at,
                assignment:assignments!inner(id, title, class_id)
            `)
            .eq('assignment.class_id', classId);

        // Fetch students
        const { data: studentData } = await supabase
            .from('class_members')
            .select(`
                user:users!inner(id, name)
            `)
            .eq('class_id', classId);

        // Fetch quiz data
        const { data: quizData } = await supabase
            .from('quiz_attempts')
            .select(`
                id, percentage, passed,
                quiz:quizzes!inner(id, title, class_id)
            `)
            .eq('quiz.class_id', classId)
            .eq('status', 'graded');

        // Fetch keaktifan grades
        const studentIds = (studentData as any || []).map((s: any) => s.user.id);

        const { data: keaktifanData, error: keaktifanError } = await supabase
            .from('grades')
            .select(`
                score, student_id, created_at,
                user:users!grades_student_id_fkey(full_name)
            `)
            .eq('type', 'keaktifan')
            .in('student_id', studentIds)
            .limit(200);

        // Process keaktifan data
        const kScores = (keaktifanData || []).map(k => k.score);
        const avgKeaktifan = kScores.length > 0
            ? kScores.reduce((a, b) => a + b, 0) / kScores.length
            : 0;

        const keaktifanByStudent: Record<string, { name: string, total: number, count: number }> = {};
        (keaktifanData || []).forEach(k => {
            const name = (k.user as any)?.full_name || 'Unknown';
            if (!keaktifanByStudent[name]) keaktifanByStudent[name] = { name, total: 0, count: 0 };
            keaktifanByStudent[name].total += k.score;
            keaktifanByStudent[name].count += 1;
        });

        const topKeaktifan = Object.values(keaktifanByStudent)
            .map(s => ({ name: s.name, score: s.total / s.count }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        // Process data - use any to handle Supabase's dynamic types
        const processedData: AnalyticsData = {
            attendance: processAttendanceData(attendanceData || []),
            assignments: processAssignmentData(submissionData as any || []),
            students: processStudentData(studentData as any || [], submissionData as any || []),
            quizzes: processQuizData(quizData as any || []),
            keaktifan: {
                totalGiven: keaktifanData?.length || 0,
                avgScore: avgKeaktifan,
                topStudents: topKeaktifan
            }
        };

        setData(processedData);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className={`space-y-6 ${className}`}>
                <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="h-80 bg-white/5 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-white/10">
                <BarChart3 size={48} className="mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">Tidak ada data analytics</p>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                        <BarChart3 size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                        <p className="text-sm text-slate-400">Statistik dan performa kelas</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                    >
                        <option value="week">7 Hari Terakhir</option>
                        <option value="month">30 Hari Terakhir</option>
                        <option value="semester">Semester Ini</option>
                    </select>
                    <button
                        onClick={fetchAnalytics}
                        className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                    >
                        <RefreshCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users size={24} />}
                    label="Total Siswa"
                    value={data.students.total}
                    color="indigo"
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    label="Rata-rata Kehadiran"
                    value={`${((data.attendance.present / (data.attendance.present + data.attendance.absent + data.attendance.late)) * 100 || 0).toFixed(0)}%`}
                    color="emerald"
                    trend={data.attendance.present > data.attendance.absent ? 'up' : 'down'}
                />
                <StatCard
                    icon={<FileText size={24} />}
                    label="Tugas Dikumpul"
                    value={`${data.assignments.submitted}/${data.assignments.total * data.students.total}`}
                    color="amber"
                />
                <StatCard
                    icon={<Award size={24} />}
                    label="Rata-rata Nilai"
                    value={data.assignments.avgScore.toFixed(0)}
                    color="purple"
                    trend={data.assignments.avgScore >= 70 ? 'up' : 'down'}
                />
            </div>

            {/* Chart Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['attendance', 'assignments', 'students', 'quizzes', 'keaktifan'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveChart(tab)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeChart === tab
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        {tab === 'attendance' && 'Kehadiran'}
                        {tab === 'assignments' && 'Tugas'}
                        {tab === 'students' && 'Siswa'}
                        {tab === 'quizzes' && 'Kuis'}
                        {tab === 'keaktifan' && 'Keaktifan'}
                    </button>
                ))}
            </div>

            {/* Charts */}
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
                {activeChart === 'attendance' && <AttendanceChart data={data.attendance} />}
                {activeChart === 'assignments' && <AssignmentsChart data={data.assignments} />}
                {activeChart === 'students' && <StudentsChart data={data.students} />}
                {activeChart === 'quizzes' && <QuizzesChart data={data.quizzes} />}
                {activeChart === 'keaktifan' && <KeaktifanChart data={data.keaktifan} />}
            </div>

            {/* At-Risk Students Alert */}
            {data.students.atRisk > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <TrendingDown size={24} className="text-red-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-400">Perhatian!</h4>
                        <p className="text-sm text-red-300">
                            {data.students.atRisk} siswa berisiko tertinggal (kehadiran atau nilai rendah)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Stat Card Component
function StatCard({
    icon,
    label,
    value,
    color,
    trend,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: 'indigo' | 'emerald' | 'amber' | 'purple' | 'red';
    trend?: 'up' | 'down';
}) {
    const colorClasses = {
        indigo: 'bg-indigo-500/20 text-indigo-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/20 text-amber-400',
        purple: 'bg-purple-500/20 text-purple-400',
        red: 'bg-red-500/20 text-red-400',
    };

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    </div>
                )}
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
        </div>
    );
}

// Attendance Chart
function AttendanceChart({ data }: { data: AnalyticsData['attendance'] }) {
    const pieData = [
        { name: 'Hadir', value: data.present, color: '#10b981' },
        { name: 'Tidak Hadir', value: data.absent, color: '#ef4444' },
        { name: 'Terlambat', value: data.late, color: '#f59e0b' },
        { name: 'Izin', value: data.excused, color: '#6366f1' },
    ].filter(d => d.value > 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h4 className="text-lg font-bold text-white mb-4">Distribusi Kehadiran</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px'
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h4 className="text-lg font-bold text-white mb-4">Tren Kehadiran</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px'
                            }}
                        />
                        <Area type="monotone" dataKey="present" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Hadir" />
                        <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Tidak Hadir" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Assignments Chart
function AssignmentsChart({ data }: { data: AnalyticsData['assignments'] }) {
    return (
        <div>
            <h4 className="text-lg font-bold text-white mb-4">Pengumpulan per Tugas</h4>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.byAssignment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px'
                        }}
                    />
                    <Legend />
                    <Bar dataKey="submitted" fill="#10b981" name="Dikumpul" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" fill="#6366f1" name="Total Siswa" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-emerald-400">{data.submitted}</p>
                    <p className="text-xs text-slate-400">Total Dikumpul</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-amber-400">{data.pending}</p>
                    <p className="text-xs text-slate-400">Menunggu</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-indigo-400">{data.avgScore.toFixed(0)}</p>
                    <p className="text-xs text-slate-400">Rata-rata Nilai</p>
                </div>
            </div>
        </div>
    );
}

// Students Chart
function StudentsChart({ data }: { data: AnalyticsData['students'] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h4 className="text-lg font-bold text-white mb-4">Distribusi Nilai</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="grade" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px'
                            }}
                        />
                        <Bar dataKey="count" fill="#6366f1" name="Jumlah Siswa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h4 className="text-lg font-bold text-white mb-4">Top Performers</h4>
                <div className="space-y-3">
                    {data.topPerformers.slice(0, 5).map((student, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-500 text-white' :
                                i === 1 ? 'bg-slate-400 text-white' :
                                    i === 2 ? 'bg-amber-700 text-white' :
                                        'bg-white/10 text-slate-400'
                                }`}>
                                {i + 1}
                            </div>
                            <span className="flex-1 text-white truncate">{student.name}</span>
                            <span className="text-emerald-400 font-bold">{student.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Quizzes Chart
function QuizzesChart({ data }: { data: AnalyticsData['quizzes'] }) {
    return (
        <div>
            <h4 className="text-lg font-bold text-white mb-4">Performa Kuis</h4>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.byQuiz}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px'
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={2} name="Rata-rata Nilai" dot={{ fill: '#6366f1' }} />
                    <Line type="monotone" dataKey="attempts" stroke="#10b981" strokeWidth={2} name="Jumlah Percobaan" dot={{ fill: '#10b981' }} />
                </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-indigo-400">{data.total}</p>
                    <p className="text-xs text-slate-400">Total Kuis</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-amber-400">{data.avgScore.toFixed(0)}%</p>
                    <p className="text-xs text-slate-400">Rata-rata Nilai</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-emerald-400">{data.passRate.toFixed(0)}%</p>
                    <p className="text-xs text-slate-400">Tingkat Kelulusan</p>
                </div>
            </div>
        </div>
    );
}

// Keaktifan Chart
function KeaktifanChart({ data }: { data: AnalyticsData['keaktifan'] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h4 className="text-lg font-bold text-white mb-4">Siswa Teraktif</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.topStudents} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px'
                            }}
                        />
                        <Bar dataKey="score" fill="#f59e0b" name="Skor Keaktifan" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h4 className="text-lg font-bold text-white mb-4">Peringkat Keaktifan</h4>
                <div className="space-y-3">
                    {data.topStudents.map((student, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-500 text-white' :
                                i === 1 ? 'bg-slate-400 text-white' :
                                    i === 2 ? 'bg-amber-700 text-white' :
                                        'bg-white/10 text-slate-400'
                                }`}>
                                {i + 1}
                            </div>
                            <span className="flex-1 text-white truncate">{student.name}</span>
                            <span className="text-emerald-400 font-bold">{student.score}</span>
                        </div>
                    ))}
                    {data.topStudents.length === 0 && (
                        <p className="text-slate-400 text-center py-4">Belum ada data keaktifan</p>
                    )}
                </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-amber-500">{data.totalGiven}</p>
                    <p className="text-xs text-slate-400">Total Nilai Diberikan</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-emerald-500">{data.avgScore.toFixed(0)}</p>
                    <p className="text-xs text-slate-400">Rata-rata Skor per Siswa</p>
                </div>
            </div>
        </div>
    );
}

// Data processing functions
function processAttendanceData(logs: { status: string; created_at: string }[]): AnalyticsData['attendance'] {
    const present = logs.filter(l => l.status === 'present' || l.status === 'hadir').length;
    const absent = logs.filter(l => l.status === 'absent' || l.status === 'alpha').length;
    const late = logs.filter(l => l.status === 'late' || l.status === 'terlambat').length;
    const excused = logs.filter(l => l.status === 'excused' || l.status === 'izin' || l.status === 'sakit').length;

    // Group by date for trend
    const byDate = logs.reduce((acc, log) => {
        const date = new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (!acc[date]) acc[date] = { present: 0, absent: 0 };
        if (log.status === 'present' || log.status === 'hadir') acc[date].present++;
        else acc[date].absent++;
        return acc;
    }, {} as Record<string, { present: number; absent: number }>);

    const trend = Object.entries(byDate).map(([date, counts]) => ({
        date,
        ...counts,
    })).slice(-7);

    return { present, absent, late, excused, trend };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processAssignmentData(submissions: any[]): AnalyticsData['assignments'] {
    const submitted = submissions.length;
    const graded = submissions.filter((s: any) => s.grade !== null).length;
    const pending = submitted - graded;
    const avgScore = graded > 0
        ? submissions.filter((s: any) => s.grade !== null).reduce((sum: number, s: any) => sum + (s.grade || 0), 0) / graded
        : 0;

    // Group by assignment
    const byAssignment = Object.values(
        submissions.reduce((acc: any, sub: any) => {
            const assignment = Array.isArray(sub.assignment) ? sub.assignment[0] : sub.assignment;
            const name = assignment?.title || 'Unknown';
            if (!acc[name]) acc[name] = { name, submitted: 0, total: 0, grades: [] as number[] };
            acc[name].submitted++;
            if (sub.grade !== null) acc[name].grades.push(sub.grade);
            return acc;
        }, {} as Record<string, { name: string; submitted: number; total: number; grades: number[] }>)
    ).map((a: any) => ({
        name: a.name.length > 15 ? a.name.slice(0, 15) + '...' : a.name,
        submitted: a.submitted,
        total: a.submitted, // Placeholder
        avg: a.grades.length > 0 ? a.grades.reduce((s: number, g: number) => s + g, 0) / a.grades.length : 0,
    }));

    return { total: byAssignment.length, submitted, pending, graded, avgScore, byAssignment };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processStudentData(
    students: any[],
    submissions: any[]
): AnalyticsData['students'] {
    const total = students.length;
    const active = students.length; // Placeholder
    const atRisk = 0; // Would need more complex logic

    // Calculate grades and distribution
    const grades = submissions.filter((s: any) => s.grade !== null).map((s: any) => s.grade as number);
    const distribution = [
        { grade: 'A (90-100)', count: grades.filter((g: number) => g >= 90).length },
        { grade: 'B (80-89)', count: grades.filter((g: number) => g >= 80 && g < 90).length },
        { grade: 'C (70-79)', count: grades.filter((g: number) => g >= 70 && g < 80).length },
        { grade: 'D (60-69)', count: grades.filter((g: number) => g >= 60 && g < 70).length },
        { grade: 'E (<60)', count: grades.filter((g: number) => g < 60).length },
    ];

    const topPerformers = students.map((s: any) => {
        const user = Array.isArray(s.user) ? s.user[0] : s.user;
        return {
            name: user?.name || 'Unknown',
            score: Math.floor(Math.random() * 30) + 70, // Placeholder - would need real calculation
        };
    }).sort((a: any, b: any) => b.score - a.score);

    return { total, active, atRisk, topPerformers, distribution };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processQuizData(attempts: any[]): AnalyticsData['quizzes'] {
    const total = new Set(attempts.map((a: any) => {
        const quiz = Array.isArray(a.quiz) ? a.quiz[0] : a.quiz;
        return quiz?.title;
    })).size;
    const validAttempts = attempts.filter((a: any) => a.percentage !== null);
    const avgScore = validAttempts.length > 0
        ? validAttempts.reduce((sum: number, a: any) => sum + (a.percentage || 0), 0) / validAttempts.length
        : 0;
    const passRate = validAttempts.length > 0
        ? (validAttempts.filter((a: any) => a.passed).length / validAttempts.length) * 100
        : 0;

    // Group by quiz
    const byQuiz = Object.values(
        attempts.reduce((acc: any, att: any) => {
            const quiz = Array.isArray(att.quiz) ? att.quiz[0] : att.quiz;
            const name = quiz?.title || 'Unknown';
            if (!acc[name]) acc[name] = { name, attempts: 0, scores: [] as number[] };
            acc[name].attempts++;
            if (att.percentage !== null) acc[name].scores.push(att.percentage);
            return acc;
        }, {} as Record<string, { name: string; attempts: number; scores: number[] }>)
    ).map((q: any) => ({
        name: q.name.length > 15 ? q.name.slice(0, 15) + '...' : q.name,
        attempts: q.attempts,
        avgScore: q.scores.length > 0 ? q.scores.reduce((s: number, g: number) => s + g, 0) / q.scores.length : 0,
    }));

    return { total, avgScore, passRate, byQuiz };
}
