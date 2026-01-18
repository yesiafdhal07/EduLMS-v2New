'use client';

import { useState } from 'react';
import {
    LayoutDashboard, BookOpen, Clock, LogOut, GraduationCap, User, Archive, Star, BarChart3 as BarChart
} from 'lucide-react';

import { StudentDashboardStats, StudentAttendancePanel, StudentProgressChart, DeadlineAlert, AttendanceHistory, GradeHistory, StudentExportModal, StudentProfilePanel, PembelajaranSiswaTab, StudentAnalytics } from '@/components/siswa';
import { NavItem, NotificationBell, ThemeToggle, SearchBar, Footer, OnboardingModal, HelpButton, EntranceAnimation } from '@/components/ui';
// Removed direct import of Quiz components here, as they are now used in PembelajaranSiswaTab
import { useSiswaDashboard } from '@/hooks/useSiswaDashboard';
import { useOnboarding } from '@/hooks/useOnboarding';

// ========================================================
// SISWA DASHBOARD - REFACTORED
// Uses custom hook for all state management
// ========================================================
export default function StudentDashboard() {
    const {
        // State
        activeTab, setActiveTab, user, loading, uploading,
        // Data
        assignments, materials, attendanceSession, attendanceRecord, keaktifanGrades, progressData, studentClassId,
        // Modal
        showExportModal, setShowExportModal,
        // Actions
        handleCheckIn, handleUpload, handleLogout,
    } = useSiswaDashboard();

    // Quiz State
    const [quizViewMode, setQuizViewMode] = useState<'list' | 'play' | 'result'>('list');
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

    // Onboarding Tutorial
    const onboarding = useOnboarding('siswa');

    return (
        <EntranceAnimation role="siswa">
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex font-outfit text-white overflow-hidden">
                {/* Sidebar */}
                <aside className="w-72 bg-slate-900/50 backdrop-blur-xl text-white p-8 hidden md:flex flex-col border-r border-white/10 shadow-2xl z-50">
                    <div className="flex items-center gap-4 mb-14">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 rotate-3 group transform hover:rotate-0 transition-all">
                            <GraduationCap size={28} className="text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-black tracking-tighter block leading-none">EDU</span>
                            <span className="text-[10px] font-black tracking-[0.3em] text-emerald-400 uppercase">Student</span>
                        </div>
                    </div>

                    <nav className="space-y-3 flex-1">
                        <NavItem data-tour="nav-dashboard" icon={<LayoutDashboard size={20} />} label="Beranda" description="Ringkasan tugas & nilai" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} role="siswa" />
                        <NavItem data-tour="nav-pembelajaran" icon={<BookOpen size={20} />} label="Pembelajaran" description="Tugas, Materi, & Kuis" active={activeTab === 'pembelajaran'} onClick={() => setActiveTab('pembelajaran')} role="siswa" />
                        <NavItem data-tour="nav-analytics" icon={<BarChart size={20} />} label="Analitik" description="Nilai & Keaktifan" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} role="siswa" />
                        <NavItem data-tour="nav-presensi" icon={<Clock size={20} />} label="Presensi" description="Absensi & riwayat" active={activeTab === 'absensi'} onClick={() => setActiveTab('absensi')} role="siswa" />
                        <NavItem data-tour="nav-profil" icon={<User size={20} />} label="Profil" description="Lihat profil saya" active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} role="siswa" />
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
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 md:mb-14">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeTab} / siswa</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-1">
                                {activeTab === 'dashboard' && `Halo, ${user?.full_name || 'Pelajar'}! 👋`}
                                {activeTab === 'pembelajaran' && "Pembelajaran"}
                                {activeTab === 'analytics' && "Analitik Belajar"}
                                {activeTab === 'absensi' && "Presensi"}
                                {activeTab === 'profil' && "Profil Saya"}
                            </h2>
                            <p className="text-sm text-slate-400 font-medium">
                                {activeTab === 'dashboard' && "Lihat ringkasan tugas, nilai, dan perkembangan belajarmu."}
                                {activeTab === 'pembelajaran' && "Akses materi, tugas, dan kuis dalam satu tempat."}
                                {activeTab === 'analytics' && "Pantau nilai, kehadiran, dan keaktifanmu."}
                                {activeTab === 'absensi' && "Lakukan presensi dan lihat riwayat kehadiran."}
                                {activeTab === 'profil' && "Lihat informasi akun dan statistik pembelajaran Anda."}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <SearchBar
                                materials={materials.map(m => ({ id: m.id, title: m.title, content_url: m.content_url }))}
                                assignments={assignments.map(a => ({ id: a.id, title: a.title, deadline: a.deadline }))}
                                onSelect={() => {
                                    setActiveTab('pembelajaran');
                                }}
                            />
                            <ThemeToggle />
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all relative group hidden sm:block"
                                title="Arsip Data Saya"
                            >
                                <Archive size={20} />
                            </button>
                            <HelpButton onClick={onboarding.startTutorial} />
                            {user?.id && <NotificationBell userId={user.id} />}
                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-2.5 rounded-[2rem] shadow-sm border border-white/10">
                                <div className="flex items-center gap-3 px-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-black text-white leading-none mb-1">{user?.full_name || 'Siswa'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user?.className || 'Kelas'}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center font-bold text-white border border-emerald-200">
                                        {(user?.full_name || user?.email || 'S').charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Tab Content */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <DeadlineAlert assignments={assignments} />
                            {progressData.length > 0 && <StudentProgressChart data={progressData} />}
                            <StudentDashboardStats user={user} assignments={assignments} uploading={uploading} onUpload={handleUpload} />

                            {/* Keaktifan Grades */}
                            {keaktifanGrades.length > 0 && (
                                <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                            <Star className="text-emerald-400" size={20} />
                                        </div>
                                        <h3 className="text-lg font-black text-white">Nilai Keaktifan</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {keaktifanGrades.map((grade, idx) => (
                                            <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center">
                                                <p className="text-3xl font-black text-emerald-400">{grade.score}</p>
                                                <p className="text-xs text-slate-400 mt-1">Keaktifan {idx + 1}</p>
                                                {grade.feedback && <p className="text-xs text-slate-500 mt-2">{grade.feedback}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'pembelajaran' && (
                        <PembelajaranSiswaTab
                            materials={materials}
                            assignments={assignments}
                            onUpload={handleUpload}
                            uploading={uploading}
                            studentId={user?.id || ''}
                            // Quiz Props
                            quizViewMode={quizViewMode}
                            setQuizViewMode={setQuizViewMode}
                            selectedQuizId={selectedQuizId}
                            setSelectedQuizId={setSelectedQuizId}
                            selectedAttemptId={selectedAttemptId}
                            setSelectedAttemptId={setSelectedAttemptId}
                            studentClassId={studentClassId}
                        />

                    )}
                    {activeTab === 'analytics' && (
                        <StudentAnalytics
                            studentId={user?.id || ''}
                            classId={studentClassId || ''}
                        />
                    )}
                    {activeTab === 'absensi' && (
                        <div className="space-y-8">
                            <StudentAttendancePanel attendanceSession={attendanceSession} attendanceRecord={attendanceRecord} onCheckIn={handleCheckIn} studentId={user?.id} />
                            {user?.id && <AttendanceHistory studentId={user.id} />}
                        </div>
                    )}
                    {activeTab === 'profil' && <StudentProfilePanel user={user} />}

                    <Footer />

                    {/* Export Modal */}
                    <StudentExportModal
                        isOpen={showExportModal}
                        onClose={() => setShowExportModal(false)}
                        studentId={user?.id || ''}
                        studentName={user?.full_name || 'Siswa'}
                    />
                </main>

                {/* Bottom Nav - Mobile */}
                <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-50 md:hidden safe-area-bottom">
                    <NavItem icon={<LayoutDashboard size={24} />} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} variant="mobile" role="siswa" />
                    <NavItem icon={<BookOpen size={24} />} label="Belajar" active={activeTab === 'pembelajaran'} onClick={() => setActiveTab('pembelajaran')} variant="mobile" role="siswa" />
                    <NavItem icon={<BarChart size={24} />} label="Analitik" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} variant="mobile" role="siswa" />
                    <NavItem icon={<Clock size={24} />} label="Absensi" active={activeTab === 'absensi'} onClick={() => setActiveTab('absensi')} variant="mobile" role="siswa" />
                    <NavItem icon={<User size={24} />} label="Profil" active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} variant="mobile" role="siswa" />
                </nav>

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
