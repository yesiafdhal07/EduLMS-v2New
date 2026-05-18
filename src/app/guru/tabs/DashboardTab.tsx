import dynamic from 'next/dynamic';
import { Search, ChevronRight, Star, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Spinner, ErrorBanner, EmptyState, UniverseSkeleton } from '@/components/ui';
import { KeaktifanGradeList } from '@/components/guru/KeaktifanGradeList';
import { WorkQueue } from '@/components/guru/WorkQueue';
import { ClassMoodOverview } from '@/components/widgets/ClassMoodOverview';
import { ClassXPOverview } from '@/components/widgets/ClassXPOverview';
import { AIDashboardInsight } from '@/components/dashboard/AIDashboardInsight';
import type { InsightContext } from '@/lib/services/ai-insights.service';

// Dynamic imports for performance
const TeacherStatsPanel = dynamic(() => import('@/components/dashboard/TeacherStatsPanel').then(mod => mod.TeacherStatsPanel), {
    loading: () => <div className="h-40 bg-white/5 rounded-[2.5rem] animate-pulse" />
});

interface DashboardStudent {
    id: string;
    name: string;
    avg: string;
    status: 'TUNTAS' | 'REMEDIAL';
}

interface DashboardTabProps {
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
}

export function DashboardTab({ stats, students, loading, error, onRetry, onKeaktifan, classId, teacherId, onNavigate, onImport }: DashboardTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Error Handling */}
            {error && <ErrorBanner message={error} onRetry={onRetry} />}

            {/* Top Row: Quick Stats (Bento Header) */}
            <TeacherStatsPanel teacherId={teacherId} classId={classId || undefined} />
            
            {/* AI Alert Banner - Student Anomaly Detection */}
            {classId && students.filter(s => s.status === 'REMEDIAL').length > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/20">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                        <span className="text-lg">⚠️</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                            {students.filter(s => s.status === 'REMEDIAL').length} siswa memerlukan perhatian tambahan
                        </p>
                        <p className="text-[10px] text-slate-400">AI mendeteksi penurunan nilai pada minggu terakhir</p>
                    </div>
                    <button 
                        onClick={onKeaktifan}
                        className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition-all"
                    >
                        Lihat Siswa
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Content Area (Left: 8 columns) */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Work Queue Bento Card */}
                    <div className="universe-card p-7">
                        <WorkQueue teacherId={teacherId || ''} classId={classId || null} onNavigate={onNavigate || (() => {})} />
                    </div>

                    {/* Student Management Section */}
                    <div className="universe-card overflow-hidden shadow-2xl shadow-black/20">
                        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Search className="text-indigo-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-fraunces text-xl font-black text-white tracking-tight">Perkembangan Siswa</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Monitoring Akademik & Keaktifan</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {onKeaktifan && (
                                    <button
                                        onClick={onKeaktifan}
                                        className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 transition-all flex items-center gap-2"
                                    >
                                        <Star size={14} />
                                        Nilai Keaktifan
                                    </button>
                                )}
                                {onImport && classId && (
                                    <button
                                        onClick={onImport}
                                        className="px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-500/20 transition-all flex items-center gap-2"
                                    >
                                        <Upload size={14} />
                                        Import CSV
                                    </button>
                                )}
                                <div className="relative group flex-1 md:flex-none">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Cari nama siswa... (Tekan '/')"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-11 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 w-full md:w-64 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-separate border-spacing-y-3">
                                <thead>
                                    <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] px-4">
                                        <th className="px-6 pb-2">Informasi Profil</th>
                                        <th className="px-6 pb-2 text-center">Rerata</th>
                                        <th className="px-6 pb-2 text-center">Status</th>
                                        <th className="px-6 pb-2 text-right">Aksi</th>
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
                                            <tr key={s.id} className="group hover:bg-white/[0.04] transition-all duration-300">
                                                <td className="px-6 py-4 rounded-l-[1.5rem] bg-white/[0.01] group-hover:bg-transparent">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center font-black text-indigo-300 text-lg group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                            {(s.name || 'S').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-white group-hover:text-indigo-300 transition-colors">{s.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Siswa Aktif</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 bg-white/[0.01] group-hover:bg-transparent text-center">
                                                    <span className="text-xl font-black text-slate-200 group-hover:text-white transition-colors">{s.avg}</span>
                                                </td>
                                                <td className="px-6 py-4 bg-white/[0.01] group-hover:bg-transparent text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${s.status === 'TUNTAS' 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right rounded-r-[1.5rem] bg-white/[0.01] group-hover:bg-transparent">
                                                    <button
                                                        onClick={() => onNavigate && onNavigate('profil')}
                                                        className="p-3 bg-white/5 hover:bg-indigo-500 text-slate-400 hover:text-white rounded-2xl transition-all shadow-sm hover:rotate-12"
                                                    >
                                                        <ChevronRight size={20} />
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

                {/* Sidebar Area (Right: 4 columns) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* AI Dashboard Insight — USP Feature */}
                    {classId && (
                        <AIDashboardInsight
                            context={{
                                role: 'guru',
                                className: 'Kelas Aktif',
                                stats: {
                                    totalStudents: students.length,
                                    averageGrade: stats.avg,
                                    attendanceRate: stats.attendance,
                                    submissionRate: stats.submissions,
                                    pendingGrades: students.filter(s => s.status === 'REMEDIAL').length,
                                    activeAssignments: 0,
                                },
                                recentTrends: {
                                    gradeChange: stats.avg > 0 ? 2.5 : 0,
                                    attendanceChange: stats.attendance > 0 ? 1.2 : 0,
                                    submissionChange: 0,
                                },
                            } as InsightContext}
                        />
                    )}
                    
                    {/* Class Insights Section */}
                    {classId ? (
                        <div className="space-y-6">
                            <ClassMoodOverview classId={classId} />
                            <ClassXPOverview classId={classId} />
                        </div>
                    ) : (
                        <div className="universe-card p-7">
                            <div className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                Pilih Kelas untuk Insights
                            </div>
                        </div>
                    )}

                    {/* Active Rankings Section */}
                    {classId ? (
                        <KeaktifanGradeList classId={classId} />
                    ) : (
                        <div className="universe-card p-7">
                            <EmptyState 
                                icon={<Star size={32} className="opacity-50" />}
                                title="Pilih Kelas"
                                description="Data ranking akan muncul setelah kelas dipilih."
                                className="py-10"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
