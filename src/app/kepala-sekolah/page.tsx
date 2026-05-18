'use client';

import { useState, useMemo } from 'react';
import { LayoutDashboard, Users, BookOpen, AlertTriangle, ArrowLeftRight, Search, Command, Grid3X3, FileText, Calendar } from 'lucide-react';
import { EntranceAnimation, CommandPalette, UniverseSkeleton, ProfileSettingsModal } from '@/components/ui';
import type { CommandItem } from '@/components/ui';
import { KepsekOverview, TeacherMonitoring, ClassMonitoring, InterventionInbox, ClassBenchmark, TeacherMatrix, NarrativeReport, AttendanceHeatmap, ExecutiveBriefing } from '@/components/kepala-sekolah';
import { useKepsekDashboard } from '@/hooks/useKepsekDashboard';
import { DashboardSidebar, SidebarNavItem, RoleShell, RoleTopbar, MobileNavigation } from '@/components/layout';
import { getRoleTheme } from '@/lib/theme/roleTheme';
import { AIChatbot } from '@/components/shared/AIChatbot';

type KepsekTab = 'beranda' | 'guru' | 'matrix' | 'kelas' | 'alerts' | 'benchmark' | 'report' | 'attendance';

const NAV_ITEMS = [
    { id: 'beranda' as const, label: 'Beranda', description: 'Ringkasan sekolah', icon: LayoutDashboard },
    { id: 'alerts' as const, label: 'Intervensi', description: 'Peringatan & tindakan', icon: AlertTriangle },
    { id: 'guru' as const, label: 'Guru', description: 'Monitoring guru', icon: BookOpen },
    { id: 'matrix' as const, label: 'Matriks', description: 'Kinerja guru', icon: Grid3X3 },
    { id: 'kelas' as const, label: 'Kelas', description: 'Monitoring kelas', icon: Users },
    { id: 'benchmark' as const, label: 'Benchmark', description: 'Bandingkan kelas', icon: ArrowLeftRight },
    { id: 'attendance' as const, label: 'Kehadiran', description: 'Heatmap kehadiran', icon: Calendar },
    { id: 'report' as const, label: 'Laporan', description: 'Laporan naratif', icon: FileText },
];

const TAB_TITLES: Record<KepsekTab, string> = {
    beranda: 'Dashboard Sekolah',
    alerts: 'Kotak Intervensi',
    guru: 'Monitoring Guru',
    matrix: 'Matriks Kinerja Guru',
    kelas: 'Monitoring Kelas',
    benchmark: 'Benchmark Kelas',
    attendance: 'Heatmap Kehadiran',
    report: 'Laporan Naratif',
};

const TAB_SUBTITLES: Record<KepsekTab, string> = {
    beranda: 'Pantau perkembangan sekolah dalam satu tampilan.',
    alerts: 'Masalah yang membutuhkan perhatian Anda.',
    guru: 'Lihat kinerja dan beban guru.',
    matrix: 'Bandingkan performa guru dalam satu tampilan.',
    kelas: 'Perbandingan performa antar kelas.',
    benchmark: 'Bandingkan metrik dua kelas secara langsung.',
    attendance: 'Visualisasi kehadiran siswa per bulan.',
    report: 'Laporan otomatis kinerja sekolah.',
};

export default function KepalaSekolahDashboard() {
    const [activeTab, setActiveTab] = useState<KepsekTab>('beranda');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const {
        user, authLoading, loading,
        stats, teachers, classOverviews, alerts, schoolName,
    } = useKepsekDashboard();
    const theme = getRoleTheme('kepala_sekolah');

    const cmdItems: CommandItem[] = useMemo(() => [
        { id: 'kepsek-beranda', label: 'Beranda', description: 'Ringkasan sekolah', category: 'Navigasi', action: () => setActiveTab('beranda') },
        { id: 'kepsek-alerts', label: 'Intervensi', description: 'Peringatan & tindakan', category: 'Navigasi', action: () => setActiveTab('alerts') },
        { id: 'kepsek-guru', label: 'Monitoring Guru', description: 'Kinerja guru', category: 'Navigasi', action: () => setActiveTab('guru') },
        { id: 'kepsek-kelas', label: 'Monitoring Kelas', description: 'Performa kelas', category: 'Navigasi', action: () => setActiveTab('kelas') },
        { id: 'kepsek-bench', label: 'Benchmark Kelas', description: 'Bandingkan 2 kelas', category: 'Navigasi', action: () => setActiveTab('benchmark') },
        { id: 'kepsek-matrix', label: 'Matriks Guru', description: 'Kinerja guru visual', category: 'Navigasi', action: () => setActiveTab('matrix') },
        { id: 'kepsek-attendance', label: 'Heatmap Kehadiran', description: 'Visualisasi kehadiran', category: 'Navigasi', action: () => setActiveTab('attendance') },
        { id: 'kepsek-report', label: 'Laporan Naratif', description: 'Laporan otomatis', category: 'Navigasi', action: () => setActiveTab('report') },
    ], []);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-[#080E1C] flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 font-bold text-sm">Memuat Dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <EntranceAnimation role="kepala_sekolah">
            <CommandPalette items={cmdItems} accentColor="amber" />
            <ProfileSettingsModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} role="kepala_sekolah" user={user} />
            <RoleShell role="kepala_sekolah" className="font-fraunces">
                {/* Mobile Navigation (Phase 4: Mobile Hardening) */}
                <MobileNavigation
                    role="kepala_sekolah"
                    onLogout={() => { import('@/lib/supabase').then(m => m.supabase.auth.signOut()).then(() => window.location.href = '/login'); }}
                    items={NAV_ITEMS.map(item => ({
                        label: item.label,
                        icon: item.icon,
                        active: activeTab === item.id,
                        onClick: () => setActiveTab(item.id)
                    }))}
                />
                <div className="flex-1 flex h-full overflow-hidden">
                    <DashboardSidebar
                        role="kepala_sekolah"
                        onLogout={() => { import('@/lib/supabase').then(m => m.supabase.auth.signOut()).then(() => window.location.href = '/login'); }}
                        extraContent={
                            <button onClick={() => {
                                const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true });
                                window.dispatchEvent(e);
                            }} className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 text-xs font-medium hover:bg-white/10 hover:text-slate-300 transition-all">
                                <Search size={14} />
                                <span className="flex-1 text-left">Cari...</span>
                                <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-mono"><Command size={10} />K</kbd>
                            </button>
                        }
                    >
                        {NAV_ITEMS.map(item => (
                            <SidebarNavItem
                                key={item.id}
                                role="kepala_sekolah"
                                icon={<item.icon size={20} />}
                                label={item.label}
                                description={item.description}
                                active={activeTab === item.id}
                                onClick={() => setActiveTab(item.id)}
                            />
                        ))}
                    </DashboardSidebar>

                    <main className="flex-1 h-full p-6 md:p-8 overflow-y-auto scrollbar-hide">
                        <RoleTopbar
                            role="kepala_sekolah"
                            kicker={schoolName}
                            title={TAB_TITLES[activeTab]}
                            subtitle={TAB_SUBTITLES[activeTab]}
                            right={
                                <div 
                                    onClick={() => setShowProfileModal(true)}
                                    className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors"
                                >
                                    <div className={`w-9 h-9 rounded-xl ${theme.accentBgStrong} flex items-center justify-center font-black text-white text-xs`}>
                                        {user.full_name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-xs truncate">{user.full_name}</p>
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${theme.accentText}`}>Kepala Sekolah</p>
                                    </div>
                                    {alerts.length > 0 && (
                                        <span className="bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                                            {alerts.length}
                                        </span>
                                    )}
                                </div>
                            }
                        />

                        {loading ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <UniverseSkeleton type="stats" role="kepala_sekolah" count={4} />
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <UniverseSkeleton type="chart" role="kepala_sekolah" />
                                    <UniverseSkeleton type="list" role="kepala_sekolah" count={5} />
                                </div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'beranda' && (
                                    <div className="space-y-6">
                                        <ExecutiveBriefing schoolName={schoolName} />
                                        <KepsekOverview stats={stats} schoolName={schoolName} />
                                        {alerts.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-amber-400" /> Peringatan Aktif
                                                </h3>
                                                <InterventionInbox alerts={alerts} compact />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'alerts' && <InterventionInbox alerts={alerts} />}
                                {activeTab === 'guru' && <TeacherMonitoring teachers={teachers} />}
                                {activeTab === 'matrix' && <TeacherMatrix teachers={teachers} />}
                                {activeTab === 'kelas' && <ClassMonitoring classes={classOverviews} />}
                                {activeTab === 'benchmark' && <ClassBenchmark classes={classOverviews} />}
                                {activeTab === 'attendance' && <AttendanceHeatmap />}
                                {activeTab === 'report' && <NarrativeReport stats={stats} schoolName={schoolName} classes={classOverviews} />}
                            </>
                        )}
                    </main>
                </div>

                {/* AI Chatbot */}
                <AIChatbot
                    userRole="kepala_sekolah"
                    userName={user.full_name || 'Kepala Sekolah'}
                    schoolName={schoolName}
                    stats={{
                        totalStudents: stats?.totalSiswa,
                        totalClasses: stats?.totalClasses,
                        averageGrade: stats?.avgGrade,
                        attendanceRate: stats?.avgAttendance,
                    }}
                />
            </RoleShell>
        </EntranceAnimation>
    );
}
