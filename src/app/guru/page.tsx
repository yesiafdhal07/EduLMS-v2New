'use client';

import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Calendar, XCircle, BookOpen, GraduationCap, Archive, BarChart3, Plus, ChevronRight, FileText, Users, Brain, ClipboardCheck
} from 'lucide-react';

import '@/styles/guru-dna.css';
import dynamic from 'next/dynamic';
import { NavItem, NotificationBell, ThemeToggle, SearchBar, Footer, OnboardingModal, HelpButton, EntranceAnimation, AnimatedTabContent, CommandPalette, UniverseSkeleton, ProfileSettingsModal, QuickAddModal } from '@/components/ui';
import type { CommandItem } from '@/components/ui';
import { AttendancePanel, ClassHeartbeat, ManajemenKelasTab } from '@/components/guru';
import { GuruModals } from '@/components/guru/GuruModals';
import { AIChatbot } from '@/components/shared/AIChatbot';
import { TodayView } from './tabs/TodayView';
import { KontenTab } from './tabs/KontenTab';
import { InsightTab } from './tabs/InsightTab';
import { PortfolioTab, TrashTab } from './tabs';

import { useGuruDashboard } from '@/hooks/useGuruDashboard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { DashboardSidebar, SidebarNavItem, RoleShell, RoleTopbar, MobileNavigation } from '@/components/layout';
import { getRoleTheme } from '@/lib/theme/roleTheme';

// ========================================================
// GURU DASHBOARD — "Indigo Studio" Refactor
// Navigation: 6 zones (Today, Kelas, Konten, Insight, Presensi, Profil)
// Design System: gs-* tokens from guru-dna.css
// ========================================================

// Tab type definition — reduced from 10 to 6 core + 1 utility
type GuruTab = 'today' | 'kelas' | 'konten' | 'insight' | 'presensi' | 'profil' | 'trash';

export default function GuruDashboard() {
    const {
        user, loading,
        classes, selectedClassId, setSelectedClassId,
        attendanceSession, attendanceLogs, checkedInIds, pendingRecords, processingAttendance, setStudentStatus, approveCheckIn, rejectCheckIn,
        students, materials, assignments, stats, teacherName, teacherProfile, portfolioStats,
        activeTab, setActiveTab,
        showMaterialModal, setShowMaterialModal,
        showAssignmentModal, setShowAssignmentModal,
        showSubmissionModal, setShowSubmissionModal,
        selectedAssignment, setSelectedAssignment,
        showClassModal, setShowClassModal,
        showManualGradeModal, setShowManualGradeModal,
        showArchiveModal, setShowArchiveModal,
        manualGradeAssignment, setManualGradeAssignment,
        newClassName, setNewClassName,
        handleCreateClass, handleToggleAttendance, handleLogout, fetchMaterials, fetchAssignments, fetchStudents,
        showBulkImportModal, setShowBulkImportModal,
    } = useGuruDashboard();

    const onboarding = useOnboarding(user?.id);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showQuickAddModal, setShowQuickAddModal] = useState(false);
    const theme = getRoleTheme('guru');

    // ── Map legacy tab names to new system ──
    const currentTab: GuruTab = (() => {
        const t = activeTab as string;
        if (t === 'dashboard') return 'today';
        if (t === 'manajemen_kelas') return 'kelas';
        if (t === 'pembelajaran' || t === 'pipeline') return 'konten';
        if (t === 'analytics') return 'insight';
        if (t === 'absensi') return 'presensi';
        if (t === 'portofolio') return 'profil';
        if (t === 'trash') return 'trash';
        if (t === 'jadwal') return 'today';
        if (t === 'diskusi') return 'kelas';
        return t as GuruTab;
    })();

    const navigateTo = (tab: GuruTab) => {
        // Map new tab names back to legacy hook values
        const legacyMap: Record<GuruTab, string> = {
            today: 'dashboard',
            kelas: 'manajemen_kelas',
            konten: 'pembelajaran',
            insight: 'analytics',
            presensi: 'absensi',
            profil: 'portofolio',
            trash: 'trash',
        };
        setActiveTab(legacyMap[tab] as any);
    };

    // ── Keyboard shortcuts (1-6 + C + /) ──
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

            const tabMap: Record<string, GuruTab> = {
                '1': 'today', '2': 'kelas', '3': 'konten',
                '4': 'insight', '5': 'presensi', '6': 'profil',
            };
            if (tabMap[e.key]) { e.preventDefault(); navigateTo(tabMap[e.key]); }
            if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setShowQuickAddModal(true); }
            if (e.key === '/') { e.preventDefault(); (document.querySelector('input[placeholder*="Cari"]') as HTMLInputElement)?.focus(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // ── Command Palette items ──
    const quickAddItems: CommandItem[] = [
        { id: 'add-task', label: 'Tambah Tugas', description: 'Buat penugasan baru', category: 'Aksi Cepat', icon: <FileText size={16} />, action: () => setShowAssignmentModal(true), keywords: ['tugas', 'assignment'] },
        { id: 'add-material', label: 'Tambah Materi', description: 'Unggah bahan ajar', category: 'Aksi Cepat', icon: <BookOpen size={16} />, action: () => setShowMaterialModal(true), keywords: ['materi', 'bahan'] },
        { id: 'add-class', label: 'Buat Kelas Baru', description: 'Buat ruang kelas baru', category: 'Manajemen', icon: <Plus size={16} />, action: () => setShowClassModal(true), keywords: ['kelas', 'class'] },
        { id: 'nav-today', label: 'Ke Hari Ini', description: 'Kembali ke beranda', category: 'Navigasi', icon: <LayoutDashboard size={16} />, action: () => navigateTo('today') },
        { id: 'nav-konten', label: 'Ke Konten', description: 'Kelola materi & tugas', category: 'Navigasi', icon: <BookOpen size={16} />, action: () => navigateTo('konten') },
    ];

    // ── Tab metadata ──
    const TAB_META: Record<GuruTab, { kicker: string; title: string; subtitle: string }> = {
        today: { kicker: 'Studio · Hari Ini', title: `Selamat Datang, ${teacherName || 'Guru'}! 👋`, subtitle: 'Ringkasan aktivitas & prioritas hari ini.' },
        kelas: { kicker: 'Studio · Kelas', title: 'Kelas Saya', subtitle: 'Kelola daftar kelas, siswa, dan kode akses.' },
        konten: { kicker: 'Studio · Konten', title: 'Konten Pembelajaran', subtitle: 'Kelola materi, tugas, dan kuis dalam satu tempat.' },
        insight: { kicker: 'Studio · Insight', title: 'Insight Kelas', subtitle: 'Analitik berbasis AI untuk monitoring performa.' },
        presensi: { kicker: 'Studio · Presensi', title: 'Presensi Siswa', subtitle: 'Kelola kehadiran dengan QR Code atau manual.' },
        profil: { kicker: 'Studio · Profil', title: 'Profil Guru', subtitle: 'Lihat dan edit profil serta pencapaian mengajar.' },
        trash: { kicker: 'Studio · Sampah', title: 'Tong Sampah', subtitle: 'Pulihkan data yang terhapus atau hapus permanen.' },
    };

    const meta = TAB_META[currentTab] || TAB_META.today;

    return (
        <EntranceAnimation role="guru">
            <CommandPalette items={quickAddItems} accentColor="indigo" shortcutKey="c" requireModifier={false} />
            <RoleShell role="guru" className="flex h-screen font-outfit overflow-hidden relative">
                {/* ── Sidebar (6 zones) ── */}
                <DashboardSidebar role="guru" onLogout={handleLogout}>
                    <div className="gs-section-label mt-2">Workspace</div>
                    <SidebarNavItem role="guru" icon={<LayoutDashboard size={20} />} label="Hari Ini" description="Prioritas & ringkasan" active={currentTab === 'today'} onClick={() => navigateTo('today')} shortcut="1" />
                    <SidebarNavItem role="guru" icon={<Users size={20} />} label="Kelas" description="Manajemen kelas & siswa" active={currentTab === 'kelas'} onClick={() => navigateTo('kelas')} shortcut="2" />
                    <SidebarNavItem role="guru" icon={<BookOpen size={20} />} label="Konten" description="Materi, Tugas & Kuis" active={currentTab === 'konten'} onClick={() => navigateTo('konten')} shortcut="3" />

                    <div className="gs-section-label mt-6">Insight</div>
                    <SidebarNavItem role="guru" icon={<Brain size={20} />} label="Insight" description="Analitik & AI" active={currentTab === 'insight'} onClick={() => navigateTo('insight')} shortcut="4" />
                    <SidebarNavItem role="guru" icon={<ClipboardCheck size={20} />} label="Presensi" description="Absensi QR & manual" active={currentTab === 'presensi'} onClick={() => navigateTo('presensi')} shortcut="5" />

                    <div className="pt-4 mt-4 border-t border-white/10">
                        <SidebarNavItem role="guru" icon={<GraduationCap size={20} />} label="Profil" description="Profil & portofolio" active={currentTab === 'profil'} onClick={() => navigateTo('profil')} shortcut="6" />
                        <SidebarNavItem role="guru" icon={<div className="text-rose-400"><Archive size={20} /></div>} label="Sampah" description="Pulihkan data terhapus" active={currentTab === 'trash'} onClick={() => navigateTo('trash')} />
                    </div>
                </DashboardSidebar>

                {/* ── Main Content ── */}
                <main className="flex-1 h-full overflow-y-auto p-6 md:p-12 pb-40 md:pb-12 bg-transparent text-white scrollbar-hide relative z-10 w-full">
                    <RoleTopbar
                        role="guru"
                        kicker={meta.kicker}
                        title={meta.title}
                        subtitle={meta.subtitle}
                        right={
                            <div className="flex items-center gap-2 flex-wrap">
                                <ClassHeartbeat classId={selectedClassId} teacherId={user?.id} />
                                {(classes || []).length > 0 && (
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--guru-accent-text)]"><LayoutDashboard size={14} /></div>
                                        <select
                                            className="gs-input pl-8 pr-7 py-2 text-xs font-bold w-40 appearance-none cursor-pointer"
                                            value={selectedClassId || ''}
                                            onChange={(e) => setSelectedClassId(e.target.value)}
                                        >
                                            {(classes || []).map(c => <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>)}
                                        </select>
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><ChevronRight size={12} className="rotate-90" /></div>
                                    </div>
                                )}
                                <button onClick={() => setShowQuickAddModal(true)} className="gs-btn-primary w-9 h-9 !p-0 relative" title="Aksi Cepat (C)">
                                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                    <div className="absolute -bottom-1.5 -right-1.5 bg-slate-950 border border-white/10 text-[8px] font-black px-1 py-0.5 rounded text-slate-400 pointer-events-none leading-none">C</div>
                                </button>
                                <div className="flex items-center gap-1 bg-[var(--guru-surface-hover)] p-1 rounded-xl border border-[var(--guru-border-default)]">
                                    <SearchBar materials={materials} assignments={assignments} onSelect={() => navigateTo('konten')} />
                                    <div className="h-5 w-px bg-white/8 mx-0.5" />
                                    <ThemeToggle />
                                    <button onClick={() => setShowArchiveModal(true)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all hidden sm:flex" title="Arsip Data"><Archive size={16} /></button>
                                    <HelpButton onClick={onboarding.startTutorial} />
                                    {user?.id && <NotificationBell userId={user.id} />}
                                </div>
                                <div onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 bg-[var(--guru-surface-hover)] p-1.5 pr-3 rounded-xl border border-[var(--guru-border-default)] cursor-pointer hover:bg-[var(--guru-surface-active)] transition-all group">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm bg-gradient-to-br from-[var(--guru-accent)] to-[var(--guru-secondary)] shadow-md group-hover:scale-105 transition-transform shrink-0">
                                        {(teacherName || 'G').charAt(0)}
                                    </div>
                                    <div className="hidden xl:block">
                                        <p className="text-[11px] font-black text-white leading-none">{teacherName || 'Guru'}</p>
                                        <p className="text-[9px] font-bold text-[var(--guru-text-muted)] uppercase tracking-wide leading-none mt-0.5">Educator</p>
                                    </div>
                                </div>
                            </div>
                        }
                    />

                    {/* ── Tab Content ── */}
                    <AnimatedTabContent tabKey={currentTab} className="min-h-0">
                        {loading ? (
                            <div className="space-y-8">
                                <UniverseSkeleton type="stats" role="guru" count={4} />
                                <UniverseSkeleton type="chart" role="guru" />
                                <UniverseSkeleton type="table" role="guru" count={5} />
                            </div>
                        ) : currentTab === 'today' ? (
                            <TodayView
                                stats={stats} students={students} loading={loading} error={null}
                                onRetry={() => navigateTo('today')}
                                onKeaktifan={() => { setManualGradeAssignment(null); setShowManualGradeModal(true); }}
                                classId={selectedClassId} teacherId={user?.id}
                                onNavigate={(tab: string) => navigateTo(tab as GuruTab)}
                                onImport={() => setShowBulkImportModal(true)}
                                classes={classes}
                            />
                        ) : currentTab === 'kelas' ? (
                            <ManajemenKelasTab
                                classes={classes || []}
                                onSelectClass={(id) => { setSelectedClassId(id); navigateTo('today'); }}
                                onCreateClass={() => setShowClassModal(true)}
                                onBulkImport={(id) => { setSelectedClassId(id); setShowBulkImportModal(true); }}
                            />
                        ) : currentTab === 'konten' ? (
                            <KontenTab
                                materials={materials} assignments={assignments}
                                onAddMaterial={() => setShowMaterialModal(true)}
                                onAddAssignment={() => setShowAssignmentModal(true)}
                                onViewSubmissions={(a) => { setSelectedAssignment(a); setShowSubmissionModal(true); }}
                                onManualGrade={(a) => { setManualGradeAssignment(a); setShowManualGradeModal(true); }}
                                classSelected={!!selectedClassId} classId={selectedClassId || ''}
                            />
                        ) : currentTab === 'insight' ? (
                            <InsightTab
                                classId={selectedClassId || undefined}
                                students={students}
                                stats={stats}
                                schoolId={user?.school_id || undefined}
                            />
                        ) : currentTab === 'presensi' ? (
                            !selectedClassId ? (
                                <div className="gs-card flex flex-col items-center justify-center min-h-[400px] p-12">
                                    <div className="w-20 h-20 bg-[var(--guru-accent-soft)] rounded-3xl flex items-center justify-center mb-6 border border-[var(--guru-border-accent)]">
                                        <ClipboardCheck size={40} className="text-[var(--guru-accent-text)]" />
                                    </div>
                                    <h3 className="gs-title text-2xl mb-3">Pilih Kelas Terlebih Dahulu</h3>
                                    <p className="gs-body text-center max-w-md text-sm">Silakan pilih kelas dari dropdown di header untuk mengelola presensi.</p>
                                </div>
                            ) : (
                                <AttendancePanel
                                    attendanceSession={attendanceSession} selectedClassId={selectedClassId}
                                    classes={classes} onToggleSession={handleToggleAttendance}
                                    processing={processingAttendance} logs={attendanceLogs}
                                    students={students} checkedInIds={checkedInIds}
                                    onSetStatus={setStudentStatus} pendingRecords={pendingRecords}
                                    onApprove={approveCheckIn} onReject={rejectCheckIn}
                                />
                            )
                        ) : currentTab === 'profil' ? (
                            <PortfolioTab teacherName={teacherName} initialProfile={teacherProfile} portfolioStats={portfolioStats} />
                        ) : currentTab === 'trash' ? (
                            <TrashTab userId={user?.id} />
                        ) : null}
                    </AnimatedTabContent>
                    <Footer />
                </main>

                {/* ── Mobile Navigation (6 items) ── */}
                <MobileNavigation
                    role="guru" onLogout={handleLogout}
                    items={[
                        { label: 'Hari Ini', icon: LayoutDashboard, active: currentTab === 'today', onClick: () => navigateTo('today') },
                        { label: 'Kelas', icon: Users, active: currentTab === 'kelas', onClick: () => navigateTo('kelas') },
                        { label: 'Konten', icon: BookOpen, active: currentTab === 'konten', onClick: () => navigateTo('konten') },
                        { label: 'Insight', icon: Brain, active: currentTab === 'insight', onClick: () => navigateTo('insight') },
                        { label: 'Presensi', icon: ClipboardCheck, active: currentTab === 'presensi', onClick: () => navigateTo('presensi') },
                        { label: 'Profil', icon: GraduationCap, active: currentTab === 'profil', onClick: () => navigateTo('profil') },
                    ]}
                    extraContent={
                        <div className="px-2 mb-4 space-y-4">
                            {(classes || []).length > 0 && (
                                <div>
                                    <p className="gs-label mb-2 ml-1 text-[var(--guru-accent-text)]">Kelas Aktif</p>
                                    <select className="w-full gs-input py-3.5 text-[11px] font-black" value={selectedClassId || ''} onChange={(e) => setSelectedClassId(e.target.value)}>
                                        {(classes || []).map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <p className="gs-label mb-2 ml-1 text-slate-500">Lainnya</p>
                                <button
                                    onClick={() => navigateTo('trash')}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                        currentTab === 'trash'
                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                                    }`}
                                >
                                    <Archive size={16} className={currentTab === 'trash' ? 'text-rose-400' : ''} />
                                    <span className="text-sm">Tong Sampah</span>
                                </button>
                            </div>
                        </div>
                    }
                />

                {/* ── Modals (extracted) ── */}
                <GuruModals
                    user={user} classes={classes} selectedClassId={selectedClassId}
                    showSubmissionModal={showSubmissionModal} setShowSubmissionModal={setShowSubmissionModal} selectedAssignment={selectedAssignment}
                    showMaterialModal={showMaterialModal} setShowMaterialModal={setShowMaterialModal} fetchMaterials={fetchMaterials}
                    showAssignmentModal={showAssignmentModal} setShowAssignmentModal={setShowAssignmentModal} fetchAssignments={fetchAssignments}
                    showManualGradeModal={showManualGradeModal} setShowManualGradeModal={setShowManualGradeModal} manualGradeAssignment={manualGradeAssignment} setManualGradeAssignment={setManualGradeAssignment}
                    showArchiveModal={showArchiveModal} setShowArchiveModal={setShowArchiveModal}
                    showProfileModal={showProfileModal} setShowProfileModal={setShowProfileModal}
                    showQuickAddModal={showQuickAddModal} setShowQuickAddModal={setShowQuickAddModal} setShowClassModal={setShowClassModal} setActiveTab={(tab) => navigateTo(tab as GuruTab)}
                    showBulkImportModal={showBulkImportModal} setShowBulkImportModal={setShowBulkImportModal} fetchStudents={fetchStudents}
                />

                {/* ── Class Create Modal ── */}
                {showClassModal && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
                        <button type="button" className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-default" onClick={() => setShowClassModal(false)} aria-label="Tutup modal" />
                        <div className="bg-[#181A20] w-full max-w-xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 border border-white/10">
                            <div className="p-8 md:p-10 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">Tambah Kelas Baru</h3>
                                <button type="button" onClick={() => setShowClassModal(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors border border-white/10" aria-label="Tutup modal"><XCircle size={24} /></button>
                            </div>
                            <div className="p-8 md:p-10 space-y-6">
                                <div className="space-y-3">
                                    <label htmlFor="new-class-name" className="gs-label ml-2">Nama Kelas</label>
                                    <input id="new-class-name" type="text" placeholder="Contoh: XII IPA 1" className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 font-bold transition-all text-white placeholder:text-slate-500" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                                </div>
                            </div>
                            <div className="p-8 md:p-10 bg-white/5 flex gap-4 safe-area-bottom border-t border-white/10">
                                <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all">BATAL</button>
                                <button type="button" onClick={handleCreateClass} className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-900/30 hover:bg-indigo-500 transition-all uppercase tracking-widest">SIMPAN KELAS</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Chatbot — floating assistant */}
                <AIChatbot
                    userRole="guru"
                    userName={teacherName || 'Guru'}
                    userId={user?.id || ''}
                    schoolId={user?.school_id || null}
                    className={classes.find(c => c.id === selectedClassId)?.name}
                    stats={{
                        totalStudents: students.length,
                        totalClasses: classes.length,
                        averageGrade: stats?.avg,
                        attendanceRate: stats?.attendance,
                        pendingGrades: stats?.submissions,
                    }}
                />

                {/* Onboarding */}
                <OnboardingModal isOpen={onboarding.isOpen} currentStep={onboarding.currentStep} steps={onboarding.steps} totalSteps={onboarding.totalSteps} progress={onboarding.progress} onNext={onboarding.nextStep} onPrev={onboarding.prevStep} onSkip={onboarding.skipTutorial} onClose={onboarding.closeTutorial} />
            </RoleShell>
        </EntranceAnimation>
    );
}
