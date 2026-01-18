'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AttendanceHistoryRecord {
    id: string;
    date: string;
    status: 'hadir' | 'izin' | 'sakit' | 'alpa';
    recorded_at: string | null;
    class_name?: string;
}

interface AttendanceHistoryProps {
    studentId: string;
}

export function AttendanceHistory({ studentId }: AttendanceHistoryProps) {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<AttendanceHistoryRecord[]>([]);
    const [filter, setFilter] = useState<'all' | 'hadir' | 'izin' | 'sakit' | 'alpa'>('all');

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('attendance_records')
                .select(`
                    id,
                    status,
                    recorded_at,
                    attendance:attendance_id (
                        date,
                        class:class_id (name)
                    )
                `)
                .eq('student_id', studentId)
                .order('recorded_at', { ascending: false })
                .limit(50);

            // Supabase join query returns nested object
            interface AttendanceRecordWithJoin {
                id: string;
                status: 'hadir' | 'izin' | 'sakit' | 'alpa';
                recorded_at: string | null;
                attendance: {
                    date: string;
                    class: { name: string } | null;
                } | null;
            }

            if (error) throw error;

            const formatted = ((data || []) as unknown as AttendanceRecordWithJoin[]).map((record) => ({
                id: record.id,
                date: record.attendance?.date || '',
                status: record.status,
                recorded_at: record.recorded_at,
                class_name: record.attendance?.class?.name || ''
            }));

            setRecords(formatted);
        } catch (error) {
            console.error('Error fetching attendance history:', error);
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        if (studentId) fetchHistory();
    }, [studentId]);

    // Real-time subscription
    useEffect(() => {
        if (!studentId) return;

        const channel = supabase
            .channel('student_attendance_history')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'attendance_records', filter: `student_id=eq.${studentId}` },
                fetchHistory
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [studentId]);

    // Memoize expensive calculations
    const filteredRecords = useMemo(() =>
        filter === 'all' ? records : records.filter(r => r.status === filter),
        [records, filter]);

    const stats = useMemo(() => ({
        hadir: records.filter(r => r.status === 'hadir').length,
        izin: records.filter(r => r.status === 'izin').length,
        sakit: records.filter(r => r.status === 'sakit').length,
        alpa: records.filter(r => r.status === 'alpa').length
    }), [records]);

    const total = stats.hadir + stats.izin + stats.sakit + stats.alpa;
    const attendanceRate = total > 0 ? Math.round((stats.hadir / total) * 100) : 0;

    const statusConfig = {
        hadir: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Hadir' },
        izin: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Izin' },
        sakit: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Sakit' },
        alpa: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Alpa' }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                    <p className="text-3xl font-black text-indigo-400">{attendanceRate}%</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Kehadiran</p>
                </div>
                {Object.entries(stats).map(([key, value]) => {
                    const config = statusConfig[key as keyof typeof statusConfig];
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(filter === key ? 'all' : key as typeof filter)}
                            className={`p-4 rounded-2xl border text-center transition-all ${filter === key
                                ? 'bg-white/10 border-white/30'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <p className={`text-2xl font-black ${config.color}`}>{value}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{config.label}</p>
                        </button>
                    );
                })}
            </div>

            {/* History List */}
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-indigo-400" />
                        <h3 className="font-black text-white">Histori Kehadiran</h3>
                    </div>
                    <button
                        onClick={fetchHistory}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        aria-label="Refresh"
                    >
                        <RefreshCw size={16} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto scrollbar-custom">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Memuat data...</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-medium">Belum ada catatan kehadiran</p>
                        </div>
                    ) : (
                        filteredRecords.map((record) => {
                            const config = statusConfig[record.status];
                            const StatusIcon = config.icon;
                            return (
                                <div key={record.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                                        <StatusIcon size={20} className={config.color} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-white">
                                            {new Date(record.date).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {record.class_name && `${record.class_name} • `}
                                            {record.recorded_at
                                                ? `Dicatat: ${new Date(record.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                                                : 'Manual'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                                        {config.label}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
