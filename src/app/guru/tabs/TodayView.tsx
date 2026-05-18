'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { 
    Clock, CalendarDays, TrendingUp, Users, 
    ClipboardCheck, AlertTriangle, ChevronRight, 
    Inbox, Search, Star, Upload, Zap, BookOpen,
    ArrowRight
} from 'lucide-react';
import { Spinner, ErrorBanner, EmptyState, UniverseSkeleton } from '@/components/ui';
import { WorkQueue } from '@/components/guru/WorkQueue';
import { ClassHeartbeat } from '@/components/guru/ClassHeartbeat';
import { AIDashboardInsight } from '@/components/dashboard/AIDashboardInsight';
import type { InsightContext } from '@/lib/services/ai-insights.service';

// Dynamic imports for performance
const TeacherStatsPanel = dynamic(
    () => import('@/components/dashboard/TeacherStatsPanel').then(mod => mod.TeacherStatsPanel),
    { loading: () => <div className="h-40 gs-card animate-pulse" /> }
);

// ========================================================
// TODAY VIEW — Priority Inbox (Todoist + Asana + Linear)
// The teacher opens the app and immediately sees
// what they need to do today.
// ========================================================

interface DashboardStudent {
    id: string;
    name: string;
    avg: string;
    status: 'TUNTAS' | 'REMEDIAL';
}

interface TodayViewProps {
    stats: { avg: number; attendance: number; submissions: number };
    students: DashboardStudent[];
    loading: boolean;
    error?: string | null;
    onRetry?: () => void;
    onKeaktifan?: () => void;
    classId?: string | null;
    teacherId?: string;
    onNavigate?: (tab: string) => void;
    onImport?: () => void;
    classes?: { id: string; name: string }[];
}

// Get time-appropriate greeting
function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 10) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
}

// Format today's date in Indonesian
function formatTodayDate(): string {
    return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function TodayView({ 
    stats, students, loading, error, onRetry, onKeaktifan, 
    classId, teacherId, onNavigate, onImport, classes 
}: TodayViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut: "/" to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const remedialCount = students.filter(s => s.status === 'REMEDIAL').length;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Error Handling */}
            {error && <ErrorBanner message={error} onRetry={onRetry} />}

            {/* ─── ROW 1: Greeting + Heartbeat ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Greeting Card */}
                <div className="lg:col-span-8 gs-card gs-glow p-8 relative">
                    <div className="relative z-10">
                        <p className="gs-label mb-3">{formatTodayDate()}</p>
                        <h1 className="gs-title text-3xl md:text-4xl mb-3">
                            {getGreeting()}{teacherId ? ' 👋' : ''}
                        </h1>
                        <p className="gs-body text-sm max-w-lg">
                            {classId 
                                ? `Berikut ringkasan aktivitas kelas hari ini. Ada ${remedialCount > 0 ? `${remedialCount} siswa perlu perhatian.` : 'semua siswa dalam kondisi baik.'}`
                                : 'Pilih kelas dari header untuk melihat detail aktivitas hari ini.'
                            }
                        </p>
                    </div>
                    {/* Decorative gradient orb */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />
                </div>

                {/* Class Heartbeat Widget */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <ClassHeartbeat classId={classId || null} teacherId={teacherId} />
                    {/* Quick Time Widget */}
                    <div className="gs-card p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--guru-accent-soft)] border border-[var(--guru-border-accent)] flex items-center justify-center">
                            <Clock size={18} className="text-[var(--guru-accent-text)]" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white gs-kpi">
                                {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="gs-label mt-1">Waktu Saat Ini</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── ROW 2: Priority Inbox ─── */}
            <div className="gs-card-accent p-7">
                <WorkQueue 
                    teacherId={teacherId || ''} 
                    classId={classId || null} 
                    onNavigate={onNavigate || (() => {})} 
                />
            </div>

            {/* ─── ROW 3: AI Remedial Alert ─── */}
            {classId && remedialCount > 0 && (
                <div className="gs-card p-5 border-l-[3px] border-l-[var(--guru-status-remedial)] flex items-center gap-5 group hover:bg-[var(--guru-surface-active)] transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--guru-status-remedial-bg)] flex items-center justify-center border border-rose-500/20 shrink-0">
                        <AlertTriangle size={22} className="text-rose-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                            {remedialCount} siswa memerlukan perhatian tambahan
                        </p>
                        <p className="text-xs text-[var(--guru-text-muted)] mt-0.5">
                            AI mendeteksi penurunan nilai pada minggu terakhir
                        </p>
                    </div>
                    <button 
                        onClick={onKeaktifan}
                        className="gs-btn-ghost flex items-center gap-2 shrink-0"
                    >
                        <span>Lihat Siswa</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            )}

            {/* ─── ROW 4: Quick Stats + AI Insight ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Stats Panel — 8 cols */}
                <div className="lg:col-span-8">
                    <TeacherStatsPanel teacherId={teacherId} classId={classId || undefined} />
                </div>

                {/* AI Insight — 4 cols */}
                <div className="lg:col-span-4">
                    {classId ? (
                        <AIDashboardInsight
                            context={{
                                role: 'guru',
                                className: 'Kelas Aktif',
                                stats: {
                                    totalStudents: students.length,
                                    averageGrade: stats.avg,
                                    attendanceRate: stats.attendance,
                                    submissionRate: stats.submissions,
                                    pendingGrades: remedialCount,
                                    activeAssignments: 0,
                                },
                                recentTrends: {
                                    gradeChange: stats.avg > 0 ? 2.5 : 0,
                                    attendanceChange: stats.attendance > 0 ? 1.2 : 0,
                                    submissionChange: 0,
                                },
                            } as InsightContext}
                        />
                    ) : (
                        <div className="gs-card p-7">
                            <div className="text-center py-10">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--guru-accent-soft)] flex items-center justify-center mx-auto mb-4 border border-[var(--guru-border-accent)]">
                                    <Zap size={22} className="text-[var(--guru-accent-text)]" />
                                </div>
                                <p className="gs-label">Pilih Kelas untuk AI Insight</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── ROW 5: Student Table ─── */}
            <div className="gs-card overflow-hidden">
                <div className="p-6 border-b border-[var(--guru-border-default)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--guru-surface-hover)]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--guru-accent-soft)] rounded-2xl flex items-center justify-center border border-[var(--guru-border-accent)]">
                            <Users className="text-[var(--guru-accent-text)]" size={24} />
                        </div>
                        <div>
                            <h3 className="gs-title text-xl">Perkembangan Siswa</h3>
                            <p className="gs-label mt-1">Monitoring Akademik &amp; Keaktifan</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {onKeaktifan && (
                            <button onClick={onKeaktifan} className="gs-btn-ghost text-xs flex items-center gap-2">
                                <Star size={14} />
                                Nilai Keaktifan
                            </button>
                        )}
                        {onImport && classId && (
                            <button onClick={onImport} className="gs-btn-ghost text-xs flex items-center gap-2">
                                <Upload size={14} />
                                Import CSV
                            </button>
                        )}
                        <div className="relative group flex-1 md:flex-none">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--guru-text-ghost)] group-focus-within:text-[var(--guru-accent-text)] transition-colors" size={15} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Cari siswa... ( / )"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="gs-input pl-10 pr-4 py-2.5 text-sm w-full md:w-60"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="gs-label">
                                <th className="px-5 pb-2">Informasi Profil</th>
                                <th className="px-5 pb-2 text-center">Rerata</th>
                                <th className="px-5 pb-2 text-center">Status</th>
                                <th className="px-5 pb-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-0">
                                        <UniverseSkeleton type="table" role="guru" count={5} />
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((s) => (
                                    <tr key={s.id} className="group hover:bg-[var(--guru-surface-hover)] transition-all duration-300 rounded-2xl">
                                        <td className="px-5 py-4 rounded-l-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--guru-accent-soft)] to-[var(--guru-secondary-soft)] border border-[var(--guru-border-default)] flex items-center justify-center font-black text-[var(--guru-accent-text)] text-base group-hover:from-[var(--guru-accent)] group-hover:to-[var(--guru-secondary)] group-hover:text-white transition-all duration-500">
                                                    {(s.name || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-[var(--guru-accent-text)] transition-colors text-sm">{s.name}</p>
                                                    <p className="gs-label mt-0.5">Siswa Aktif</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="gs-kpi text-xl text-slate-200 group-hover:text-white transition-colors">{s.avg}</span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`gs-badge ${s.status === 'TUNTAS' ? 'gs-badge-tuntas' : 'gs-badge-remedial'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right rounded-r-2xl">
                                            <button
                                                onClick={() => onNavigate && onNavigate('profil')}
                                                className="p-2.5 bg-[var(--guru-surface-hover)] hover:bg-[var(--guru-accent)] text-[var(--guru-text-muted)] hover:text-white rounded-xl transition-all duration-300"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-20">
                                        <EmptyState 
                                            icon={<Search size={40} className="opacity-50" />}
                                            title="Pencarian Nihil"
                                            description={`Tidak ada siswa dengan nama "${searchQuery}"`}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
