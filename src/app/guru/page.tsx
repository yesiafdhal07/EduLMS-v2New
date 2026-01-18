'use client';

import {
    Users, FileText, LogOut, LayoutDashboard, Calendar, XCircle, BookOpen, GraduationCap, Archive, FileQuestion, BarChart3,
} from 'lucide-react';

import { NavItem, NotificationBell, ThemeToggle, SearchBar, Footer, OnboardingModal, HelpButton, EntranceAnimation } from '@/components/ui';
import { AttendancePanel, SubmissionReviewModal, MaterialModal, AssignmentModal, ManualGradeModal, DataArchiveModal } from '@/components/guru';
import { DashboardTab, PortfolioTab, PembelajaranTab, TrashTab } from './tabs';
import { QuizBuilder } from '@/components/quiz';
import { AnalyticsDashboard } from '@/components/analytics';
import { useGuruDashboard } from '@/hooks/useGuruDashboard';
import { useOnboarding } from '@/hooks/useOnboarding';

// ========================================================
// GURU DASHBOARD - REFACTORED
// Uses custom hook for all state management
// ========================================================
export default function GuruDashboard() {
    const {
        // Auth & Loading
        user, loading, localLoading, dashboardError,
        // Classes
        classes, selectedClassId, setSelectedClassId, updateClass, deleteClass,
        // Attendance
        attendanceSession, attendanceLogs, checkedInIds, pendingRecords, processingAttendance, setStudentStatus, approveCheckIn, rejectCheckIn,
        // Data
        students, materials, assignments, stats, teacherName, teacherSubjectId, teacherProfile, portfolioStats, setTeacherProfile,
        // Tab
        activeTab, setActiveTab,
        // Modals
        showMaterialModal, setShowMaterialModal,
        showAssignmentModal, setShowAssignmentModal,
        showSubmissionModal, setShowSubmissionModal,
        selectedAssignment, setSelectedAssignment,
        showClassModal, setShowClassModal,
        showManualGradeModal, setShowManualGradeModal,
        showArchiveModal, setShowArchiveModal,
        manualGradeAssignment, setManualGradeAssignment,
        // Form
        newClassName, setNewClassName,
        // Actions
        handleCreateClass, handleToggleAttendance, handleLogout, fetchMaterials, fetchAssignments,
    } = useGuruDashboard();

    // Onboarding Tutorial
    const onboarding = useOnboarding('guru');

    return (
        <EntranceAnimation role="guru">
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex font-outfit text-white overflow-hidden">
                {/* Sidebar */}
                <aside className="w-72 bg-slate-900/50 backdrop-blur-xl text-white p-8 hidden md:flex flex-col border-r border-white/10 shadow-2xl z-50">
                    <div className="flex items-center gap-4 mb-14">
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 rotate-3 group transform hover:rotate-0 transition-all">
                            <BookOpen size={28} className="text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-black tracking-tighter block leading-none">EDU</span>
                            <span className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase">Academy</span>
                        </div>
                    </div>

                    <nav className="space-y-3 flex-1">
                        <NavItem data-tour="nav-dashboard" icon={<LayoutDashboard size={20} />} label="Beranda" description="Ringkasan kelas & statistik" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <NavItem data-tour="nav-pembelajaran" icon={<BookOpen size={20} />} label="Pembelajaran" description="Materi, Tugas & Kuis" active={activeTab === 'pembelajaran'} onClick={() => setActiveTab('pembelajaran')} />
                        <NavItem data-tour="nav-analytics" icon={<BarChart3 size={20} />} label="Analytics" description="Statistik & laporan" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                        <NavItem data-tour="nav-presensi" icon={<Calendar size={20} />} label="Presensi" description="Absensi QR & manual" active={activeTab === 'absensi'} onClick={() => setActiveTab('absensi')} />
                        <NavItem data-tour="nav-profil" icon={<GraduationCap size={20} />} label="Profil" description="Profil & portofolio" active={activeTab === 'portofolio'} onClick={() => setActiveTab('portofolio')} />
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <NavItem data-tour="nav-trash" icon={<div className="text-rose-400"><Archive size={20} /></div>} label="Sampah" description="Pulihkan data terhapus" active={activeTab === 'trash'} onClick={() => setActiveTab('trash')} />
                        </div>
                    </nav>

                    <div className="pt-8 border-t border-white/10 mt-6 box-border">
                        <button type="button" onClick={handleLogout} className="flex items-center gap-4 p-4 w-full hover:bg-rose-500/10 text-rose-400 rounded-2xl transition-all duration-300 group">
                            <div className="p-2 rounded-xl bg-transparent group-hover:bg-rose-500/20 transition-colors"><LogOut size={20} /></div>
                            <span className="font-bold text-sm">Keluar Sistem</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 h-screen overflow-y-auto p-4 md:p-12 pb-32 md:pb-12 bg-transparent text-white scrollbar-hide">
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 md:mb-14">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel Guru / {activeTab}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-1">
                                {activeTab === 'dashboard' && `Selamat Datang, ${teacherName || 'Guru'}! 👋`}
                                {activeTab === 'pembelajaran' && "Pembelajaran"}
                                {activeTab === 'analytics' && "Analytics Dashboard"}
                                {activeTab === 'absensi' && "Presensi Siswa"}
                                {activeTab === 'portofolio' && "Profil Guru"}
                                {activeTab === 'trash' && "Tong Sampah"}
                            </h2>
                            <p className="text-sm text-slate-400 font-medium">
                                {activeTab === 'dashboard' && "Pantau statistik kelas dan perkembangan siswa dalam satu tampilan."}
                                {activeTab === 'pembelajaran' && "Kelola materi, tugas, dan kuis dalam satu tempat."}
                                {activeTab === 'analytics' && "Analisis performa kelas dengan grafik interaktif."}
                                {activeTab === 'absensi' && "Kelola kehadiran siswa dengan QR Code atau sistem manual."}
                                {activeTab === 'trash' && "Pulihkan data yang tidak sengaja terhapus atau hapus permanen."}
                                {activeTab === 'portofolio' && "Lihat dan edit profil serta pencapaian mengajar Anda."}
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            {classes.length > 0 && (
                                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-sm animate-in fade-in zoom-in duration-500">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Kelas:</span>
                                    <select
                                        aria-label="Pilih kelas untuk ditampilkan"
                                        className="bg-transparent font-black text-indigo-400 focus:outline-none cursor-pointer text-sm [&>option]:text-slate-900"
                                        value={selectedClassId || ''}
                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                    >
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <SearchBar
                                    materials={materials}
                                    assignments={assignments}
                                    onSelect={(result) => {
                                        setActiveTab('pembelajaran');
                                    }}
                                />
                                <ThemeToggle />
                                <button
                                    onClick={() => setShowArchiveModal(true)}
                                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all relative group hidden sm:block"
                                    title="Arsip Data & Reset"
                                >
                                    <Archive size={20} />
                                </button>
                                <HelpButton onClick={onboarding.startTutorial} />
                                {user?.id && <NotificationBell userId={user.id} />}
                                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-2.5 rounded-[2rem] shadow-sm border border-white/10">
                                    <div className="flex items-center gap-3 px-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-black text-white leading-none mb-1">{teacherName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Guru Pengajar</p>
                                        </div>
                                        <div className="w-12 h-12 bg-indigo-500 rounded-[1.5rem] flex items-center justify-center font-bold text-white border border-indigo-200">{teacherName.charAt(0)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Tab Content */}
                    {activeTab === 'dashboard' && (
                        <DashboardTab
                            stats={stats}
                            students={students}
                            loading={loading || localLoading}
                            error={dashboardError}
                            onRetry={() => setActiveTab('dashboard')}
                            onKeaktifan={() => { setManualGradeAssignment(null); setShowManualGradeModal(true); }}
                            classId={selectedClassId}
                        />
                    )}
                    {activeTab === 'pembelajaran' && (
                        <PembelajaranTab
                            materials={materials}
                            assignments={assignments}
                            onAddMaterial={() => setShowMaterialModal(true)}
                            onAddAssignment={() => setShowAssignmentModal(true)}
                            onViewSubmissions={(assignment) => { setSelectedAssignment(assignment); setShowSubmissionModal(true); }}
                            onManualGrade={(assignment) => { setManualGradeAssignment(assignment); setShowManualGradeModal(true); }}
                            classSelected={!!selectedClassId}
                            classId={selectedClassId || ''}
                        />
                    )}
                    {
                        // Quiz Tab removed as it is now part of PembelajaranTab
                    }
                    {activeTab === 'analytics' && (
                        selectedClassId ? (
                            <AnalyticsDashboard classId={selectedClassId} />
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-12">
                                <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                                    <BarChart3 size={40} className="text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3">Pilih Kelas Terlebih Dahulu</h3>
                                <p className="text-slate-400 text-center max-w-md">Silakan pilih kelas dari dropdown di header untuk melihat analytics.</p>
                            </div>
                        )
                    )}
                    {activeTab === 'absensi' && (
                        !selectedClassId ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-12">
                                <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                                    <Calendar size={40} className="text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3">Pilih Kelas Terlebih Dahulu</h3>
                                <p className="text-slate-400 text-center max-w-md">Silakan pilih kelas dari dropdown di header untuk mengelola presensi.</p>
                            </div>
                        ) : (
                            <AttendancePanel
                                attendanceSession={attendanceSession}
                                selectedClassId={selectedClassId}
                                classes={classes}
                                onToggleSession={handleToggleAttendance}
                                processing={processingAttendance}
                                logs={attendanceLogs}
                                students={students}
                                checkedInIds={checkedInIds}
                                onSetStatus={setStudentStatus}
                                pendingRecords={pendingRecords}
                                onApprove={approveCheckIn}
                                onReject={rejectCheckIn}
                            />
                        )
                    )}
                    {activeTab === 'portofolio' && <PortfolioTab teacherName={teacherName} initialProfile={teacherProfile} portfolioStats={portfolioStats} />}
                    {activeTab === 'trash' && <TrashTab userId={user?.id} />}

                    <Footer />
                </main>

                {/* Bottom Nav - Mobile */}
                <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-50 md:hidden safe-area-bottom">
                    <NavItem icon={<LayoutDashboard size={24} />} label="Beranda" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} variant="mobile" />
                    <NavItem icon={<BookOpen size={24} />} label="Belajar" active={activeTab === 'pembelajaran'} onClick={() => setActiveTab('pembelajaran')} variant="mobile" />
                    <NavItem icon={<BarChart3 size={24} />} label="Analitik" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} variant="mobile" />
                    <NavItem icon={<Calendar size={24} />} label="Absensi" active={activeTab === 'absensi'} onClick={() => setActiveTab('absensi')} variant="mobile" />
                    <NavItem icon={<GraduationCap size={24} />} label="Profil" active={activeTab === 'portofolio'} onClick={() => setActiveTab('portofolio')} variant="mobile" />
                </nav>

                {/* Modals */}
                <SubmissionReviewModal isOpen={showSubmissionModal} onClose={() => setShowSubmissionModal(false)} assignment={selectedAssignment} />
                <MaterialModal isOpen={showMaterialModal} onClose={() => setShowMaterialModal(false)} onSuccess={fetchMaterials} subjectId={teacherSubjectId} classId={selectedClassId} />
                <AssignmentModal isOpen={showAssignmentModal} onClose={() => setShowAssignmentModal(false)} onSuccess={fetchAssignments} classes={classes} selectedClassId={selectedClassId} />
                <ManualGradeModal
                    isOpen={showManualGradeModal}
                    onClose={() => { setShowManualGradeModal(false); setManualGradeAssignment(null); }}
                    classId={selectedClassId}
                    assignment={manualGradeAssignment}
                    mode={manualGradeAssignment ? 'manual' : 'keaktifan'}
                />
                <DataArchiveModal isOpen={showArchiveModal} onClose={() => setShowArchiveModal(false)} classes={classes} />

                {/* Class Modal */}
                {showClassModal && (
                    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
                        <button type="button" className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-default" onClick={() => setShowClassModal(false)} aria-label="Tutup modal" />
                        <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
                            <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Tambah Kelas Baru</h3>
                                <button type="button" onClick={() => setShowClassModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors" aria-label="Tutup modal">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="p-8 md:p-10 space-y-6">
                                <div className="space-y-3">
                                    <label htmlFor="new-class-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Nama Kelas</label>
                                    <input id="new-class-name" type="text" placeholder="Contoh: XII IPA 1" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all text-slate-900" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                                </div>
                            </div>
                            <div className="p-8 md:p-10 bg-slate-50 flex gap-4 safe-area-bottom">
                                <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all">BATAL</button>
                                <button type="button" onClick={handleCreateClass} className="flex-2 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all uppercase tracking-widest">SIMPAN KELAS</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Onboarding Tutorial */}
                <OnboardingModal
                    isOpen={onboarding.isOpen}
                    currentStep={onboarding.currentStep}
                    steps={onboarding.steps}
                    totalSteps={onboarding.totalSteps}
                    progress={onboarding.progress}
                    onNext={onboarding.nextStep}
                    onPrev={onboarding.prevStep}
                    onSkip={onboarding.skipTutorial}
                    onClose={onboarding.closeTutorial}
                />
            </div>
        </EntranceAnimation>
    );
}
