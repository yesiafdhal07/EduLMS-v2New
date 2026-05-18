'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    BookOpen, CalendarDays, GraduationCap, TrendingUp, TrendingDown,
    Minus, CheckCircle2, XCircle, AlertCircle, Clock, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ============================================================
// ORTU ACADEMIC TAB — USP #19
// Shows grades and assignments for linked student (read-only).
// ============================================================

interface OrtuAcademicTabProps {
    studentId: string;
    studentName: string;
}

interface Grade {
    id: string;
    score: number;
    type: string;
    feedback: string | null;
    created_at: string;
    subject?: { title: string };
}

interface Assignment {
    id: string;
    title: string;
    deadline: string;
    subject?: { title: string };
    submissions?: { score: number | null; submitted_at: string }[];
}

export function OrtuAcademicTab({ studentId, studentName }: OrtuAcademicTabProps) {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [gradesRes, assignRes] = await Promise.all([
            supabase
                .from('grades')
                .select('*, subject:subjects!inner(title)')
                .eq('student_id', studentId)
                .order('created_at', { ascending: false })
                .limit(20),
            supabase
                .from('assignments')
                .select('*, subject:subjects!inner(title), submissions!inner(score, submitted_at)')
                .eq('submissions.student_id', studentId)
                .order('deadline', { ascending: false })
                .limit(10),
        ]);

        if (!gradesRes.error && gradesRes.data) setGrades(gradesRes.data);
        if (!assignRes.error && assignRes.data) setAssignments(assignRes.data);
        setLoading(false);
    }, [studentId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
    );

    const avgGrade = grades.length > 0
        ? grades.reduce((s, g) => s + g.score, 0) / grades.length
        : null;

    return (
        <div className="p-6 space-y-6 max-w-3xl">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/80 border border-indigo-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <GraduationCap size={20} className="text-indigo-400" />
                    <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Ringkasan Akademik</p>
                        <p className="text-xs text-slate-500">{studentName}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Rata-rata Nilai', value: avgGrade !== null ? avgGrade.toFixed(1) : '-', color: avgGrade !== null && avgGrade >= 75 ? 'text-emerald-400' : 'text-rose-400' },
                        { label: 'Total Nilai', value: grades.length.toString(), color: 'text-slate-300' },
                        { label: 'Tugas Dikumpul', value: assignments.length.toString(), color: 'text-sky-400' },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Grades */}
            <div>
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                    <BookOpen size={14} className="text-indigo-400" /> Nilai Terbaru
                </h3>
                {grades.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Belum ada nilai</p>
                ) : (
                    <div className="space-y-2">
                        {grades.slice(0, 8).map(g => (
                            <div key={g.id} className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                                    g.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                    g.score >= 70 ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-rose-500/20 text-rose-400'
                                }`}>{g.score}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">
                                        {(g.subject as any)?.title ?? g.type}
                                    </p>
                                    <p className="text-xs text-slate-500">{g.type} · {new Date(g.created_at).toLocaleDateString('id-ID')}</p>
                                    {g.feedback && <p className="text-xs text-slate-600 mt-0.5 truncate">{g.feedback}</p>}
                                </div>
                                {g.score >= 75
                                    ? <TrendingUp size={14} className="text-emerald-400 shrink-0" />
                                    : <TrendingDown size={14} className="text-rose-400 shrink-0" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================
// ORTU ATTENDANCE TAB — USP #19
// Shows attendance history for linked student.
// ============================================================

interface OrtuAttendanceTabProps {
    studentId: string;
    studentName: string;
}

interface AttendanceRecord {
    id: string;
    status: 'hadir' | 'izin' | 'sakit' | 'alpa';
    created_at: string;
    class?: { name: string };
}

const STATUS_CFG = {
    hadir: { label: 'Hadir', color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: <CheckCircle2 size={14} /> },
    izin: { label: 'Izin', color: 'text-sky-400', bg: 'bg-sky-500/15', icon: <AlertCircle size={14} /> },
    sakit: { label: 'Sakit', color: 'text-amber-400', bg: 'bg-amber-500/15', icon: <Clock size={14} /> },
    alpa: { label: 'Alpa', color: 'text-rose-400', bg: 'bg-rose-500/15', icon: <XCircle size={14} /> },
};

export function OrtuAttendanceTab({ studentId, studentName }: OrtuAttendanceTabProps) {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase
            .from('attendance')
            .select('*, class:classes!inner(name)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(30)
            .then(({ data, error }) => {
                if (!error && data) setRecords(data);
                setLoading(false);
            });
    }, [studentId]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
    );

    const summary = {
        hadir: records.filter(r => r.status === 'hadir').length,
        izin: records.filter(r => r.status === 'izin').length,
        sakit: records.filter(r => r.status === 'sakit').length,
        alpa: records.filter(r => r.status === 'alpa').length,
    };
    const attendanceRate = records.length > 0 ? Math.round((summary.hadir / records.length) * 100) : 0;

    return (
        <div className="p-6 space-y-6 max-w-3xl">
            {/* Summary */}
            <div className="bg-gradient-to-br from-sky-950/50 to-slate-900/80 border border-sky-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <CalendarDays size={20} className="text-sky-400" />
                    <div>
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Rekap Kehadiran</p>
                        <p className="text-xs text-slate-500">{studentName} · {records.length} pertemuan</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className={`text-2xl font-black ${attendanceRate >= 80 ? 'text-emerald-400' : attendanceRate >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {attendanceRate}%
                        </p>
                        <p className="text-[10px] text-slate-500">Tingkat Kehadiran</p>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {(Object.entries(summary) as [keyof typeof STATUS_CFG, number][]).map(([key, val]) => {
                        const cfg = STATUS_CFG[key];
                        return (
                            <div key={key} className={`${cfg.bg} rounded-xl p-2.5 text-center border border-white/5`}>
                                <p className={`text-lg font-black ${cfg.color}`}>{val}</p>
                                <p className="text-[9px] text-slate-500">{cfg.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Records */}
            <div>
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                    <CalendarDays size={14} className="text-sky-400" /> Riwayat Terbaru
                </h3>
                {records.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Belum ada data kehadiran</p>
                ) : (
                    <div className="space-y-1.5">
                        {records.map(r => {
                            const cfg = STATUS_CFG[r.status];
                            return (
                                <div key={r.id} className="flex items-center gap-3 px-3 py-2 bg-white/[0.03] border border-white/5 rounded-xl">
                                    <div className={`${cfg.color} shrink-0`}>{cfg.icon}</div>
                                    <span className={`text-xs font-black w-14 ${cfg.color}`}>{cfg.label}</span>
                                    <span className="text-xs text-slate-500 flex-1">{(r.class as any)?.name ?? 'Kelas'}</span>
                                    <span className="text-[10px] text-slate-600">{new Date(r.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
