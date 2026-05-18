'use client';

import { BarChart3, Loader2, TrendingUp, TrendingDown, Brain, Users2, MessageCircle, Calendar, Megaphone } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AIDashboardInsight } from '@/components/dashboard/AIDashboardInsight';
import { RaporNaratifPanel } from '@/components/guru/RaporNaratifPanel';
import { StudentRiskAI } from '@/components/guru/StudentRiskAI';
import { ClassroomGenome } from '@/components/guru/ClassroomGenome';
import { WANotifPanel } from '@/components/guru/WANotifPanel';
import { PTMScheduler } from '@/components/guru/PTMScheduler';
import { KasKelas } from '@/components/guru/KasKelas';
import { AnnouncementBoard } from '@/components/ui/AnnouncementBoard';
import type { InsightContext } from '@/lib/services/ai-insights.service';

// ========================================================
// INSIGHT TAB — AI-Powered Analytics (Vercel-inspired)
// Replaces passive charts with actionable insight cards
// ========================================================

const GradeTrendChart = dynamic(() => import('@/components/analytics').then(mod => mod.GradeTrendChart), { 
    ssr: false, 
    loading: () => <div className="h-64 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div> 
});
const GradeDistributionChart = dynamic(() => import('@/components/analytics').then(mod => mod.GradeDistributionChart), { 
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div> 
});
const TopPerformers = dynamic(() => import('@/components/analytics').then(mod => mod.TopPerformers), { 
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div> 
});

interface InsightTabProps {
    classId?: string;
    students?: { id: string; name: string; avg: string; status: 'TUNTAS' | 'REMEDIAL' }[];
    stats?: { avg: number; attendance: number; submissions: number };
    schoolId?: string;
}

export function InsightTab({ classId, students = [], stats: dashStats, schoolId }: InsightTabProps) {
    const { stats, loading } = useAnalytics(classId);

    const remedialStudents = students.filter(s => s.status === 'REMEDIAL');
    const tuntasStudents = students.filter(s => s.status === 'TUNTAS');

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
            {/* ─── Header ─── */}
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--guru-accent)] to-[var(--guru-secondary)] rounded-2xl flex items-center justify-center shadow-2xl shadow-[var(--guru-accent-glow)] border border-[var(--guru-border-default)] shrink-0">
                    <Brain className="text-white" size={28} />
                </div>
                <div>
                    <h2 className="gs-title text-3xl">Insight Kelas</h2>
                    <p className="gs-body text-sm mt-1">Analitik berbasis AI untuk monitoring performa akademik secara realtime.</p>
                </div>
            </div>

            {/* ─── AI Summary Card ─── */}
            {classId && dashStats && (
                <div className="gs-card-accent p-6">
                    <AIDashboardInsight
                        context={{
                            role: 'guru',
                            className: 'Kelas Aktif',
                            stats: {
                                totalStudents: students.length,
                                averageGrade: dashStats.avg,
                                attendanceRate: dashStats.attendance,
                                submissionRate: dashStats.submissions,
                                pendingGrades: remedialStudents.length,
                                activeAssignments: 0,
                            },
                            recentTrends: {
                                gradeChange: dashStats.avg > 0 ? 2.5 : 0,
                                attendanceChange: dashStats.attendance > 0 ? 1.2 : 0,
                                submissionChange: 0,
                            },
                        } as InsightContext}
                    />
                </div>
            )}

            {/* ─── KPI Summary Cards ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gs-stagger">
                <KPICard
                    label="Rata-rata Kelas"
                    value={loading ? '-' : stats.averageScore.toString()}
                    suffix=""
                    status="info"
                    loading={loading}
                />
                <KPICard
                    label="Tingkat Kelulusan"
                    value={loading ? '-' : stats.passRate.toString()}
                    suffix="%"
                    status="tuntas"
                    loading={loading}
                />
                <KPICard
                    label="Kehadiran"
                    value={loading ? '-' : stats.attendanceRate.toString()}
                    suffix="%"
                    status="pending"
                    loading={loading}
                />
                <KPICard
                    label="Tugas Selesai"
                    value={loading ? '-' : stats.completedAssignments.toString()}
                    suffix=""
                    status="remedial"
                    loading={loading}
                />
            </div>

            {/* ─── Student Spotlight ─── */}
            {students.length > 0 && (
                <div className="gs-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <Users2 size={18} className="text-[var(--guru-accent-text)]" />
                            <h3 className="gs-title text-lg">Sorotan Siswa</h3>
                        </div>
                        <span className="gs-badge gs-badge-accent">
                            {remedialStudents.length} perlu perhatian
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Show remedial students first, then top tuntas */}
                        {[...remedialStudents.slice(0, 4), ...tuntasStudents.slice(0, Math.max(0, 4 - remedialStudents.length))].slice(0, 4).map(student => (
                            <div 
                                key={student.id} 
                                className={`gs-card p-4 text-center group hover:scale-[1.02] transition-all ${
                                    student.status === 'REMEDIAL' 
                                        ? 'border-rose-500/20 hover:border-rose-500/40' 
                                        : 'border-emerald-500/20 hover:border-emerald-500/40'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center font-black text-sm ${
                                    student.status === 'REMEDIAL'
                                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                }`}>
                                    {student.name.charAt(0)}
                                </div>
                                <p className="text-xs font-bold text-white truncate mb-1">{student.name}</p>
                                <div className="flex items-center justify-center gap-1">
                                    {student.status === 'REMEDIAL' ? (
                                        <TrendingDown size={12} className="text-rose-400" />
                                    ) : (
                                        <TrendingUp size={12} className="text-emerald-400" />
                                    )}
                                    <span className={`gs-kpi text-lg ${
                                        student.status === 'REMEDIAL' ? 'text-rose-400' : 'text-emerald-400'
                                    }`}>
                                        {student.avg}
                                    </span>
                                </div>
                                <span className={`gs-badge mt-2 text-[8px] ${
                                    student.status === 'REMEDIAL' ? 'gs-badge-remedial' : 'gs-badge-tuntas'
                                }`}>
                                    {student.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── AI Feature Panels ─── */}
            <div className="space-y-6">
                {/* Classroom Genome — USP #15 */}
                {students.length > 0 && dashStats && (
                    <ClassroomGenome
                        students={students}
                        stats={dashStats}
                    />
                )}

                {/* Rapor Naratif AI — USP #3 */}
                <RaporNaratifPanel students={students} stats={dashStats} />

                {/* Student Risk AI — USP #6 */}
                {schoolId && <StudentRiskAI schoolId={schoolId} />}
            </div>

            {/* ─── Charts Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart - Full Width (now has built-in Semester toggle) */}
                <div className="lg:col-span-2">
                    <GradeTrendChart classId={classId} />
                </div>

                {/* Distribution & Top Performers */}
                <div className="gs-card p-6">
                    <h3 className="gs-title text-lg mb-6">Distribusi Nilai</h3>
                    <GradeDistributionChart classId={classId} />
                </div>
                <div className="gs-card p-6">
                    <h3 className="gs-title text-lg mb-6">Siswa Berprestasi</h3>
                    <TopPerformers classId={classId} limit={5} />
                </div>
            </div>

            {/* ─── Communication Section (Sprint D) ─── */}
            {classId && (
                <>
                    {/* Section header */}
                    <div className="flex items-center gap-4 pt-2">
                        <div className="flex-1 h-px bg-white/5" />
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/8">
                            <MessageCircle size={12} className="text-green-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Komunikasi Orang Tua</span>
                        </div>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* WA Notification Panel — USP #20 */}
                        <WANotifPanel classId={classId} className="Kelas" />

                        {/* PTM Scheduler — USP #21 */}
                        <PTMScheduler classId={classId} />

                        {/* Kas Kelas — USP #18 */}
                        <KasKelas classId={classId} isTeacher={true} />

                        {/* Announcement Board — USP #22 (full width) */}
                        <div className="lg:col-span-2">
                            <AnnouncementBoard classId={classId} isTeacher={true} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── KPI Card Component ───

interface KPICardProps {
    label: string;
    value: string;
    suffix: string;
    status: 'tuntas' | 'remedial' | 'pending' | 'info';
    loading?: boolean;
}

function KPICard({ label, value, suffix, status, loading }: KPICardProps) {
    const dotColor = {
        tuntas: 'bg-[var(--guru-status-tuntas)]',
        remedial: 'bg-[var(--guru-status-remedial)]',
        pending: 'bg-[var(--guru-status-pending)]',
        info: 'bg-[var(--guru-status-info)]',
    };

    return (
        <div className="gs-card p-5 transition-all hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-3">
                <p className="gs-label group-hover:text-[var(--guru-text-secondary)] transition-colors">{label}</p>
                <div className={`w-2 h-2 rounded-full ${dotColor[status]} animate-pulse`} />
            </div>
            {loading ? (
                <Loader2 className="animate-spin text-[var(--guru-accent-text)]" size={24} />
            ) : (
                <p className="gs-kpi text-3xl text-white gs-count-shimmer">
                    {value}<span className="text-lg ml-1 text-[var(--guru-text-muted)]">{suffix}</span>
                </p>
            )}
        </div>
    );
}
