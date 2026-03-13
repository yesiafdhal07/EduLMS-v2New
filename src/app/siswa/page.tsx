'use client';

import { useState, useEffect } from 'react';
import {
    LayoutDashboard, BookOpen, Clock, LogOut, GraduationCap, User, Archive, Star, BarChart3 as BarChart, MessageSquare, Trophy
} from 'lucide-react';

import { StudentDashboardStats, StudentAttendancePanel, StudentProgressChart, DeadlineAlert, AttendanceHistory, GradeHistory, StudentExportModal, StudentProfilePanel, PembelajaranSiswaTab, StudentAnalytics } from '@/components/siswa';
import { NavItem, NotificationBell, ThemeToggle, SearchBar, Footer, OnboardingModal, HelpButton, EntranceAnimation, FocusModeToggle, DeadlineCountdown, LowDataToggle, AnimatedTabContent } from '@/components/ui';
import { useFocusMode } from '@/context/FocusModeContext';
import { PomodoroTimer } from '@/components/widgets/PomodoroTimer';
import { XPProgressBar } from '@/components/widgets/XPProgressBar';
import { XPFlowParticles } from '@/components/widgets/XPFlowParticles';
import { BadgeList } from '@/components/widgets/BadgeList';
import { LeaderboardWidget } from '@/components/widgets/LeaderboardWidget';
import { useGamification } from '@/hooks/useGamification';
import { MoodCheckinModal } from '@/components/modals/MoodCheckinModal';
import { useMoodCheckin } from '@/hooks/useMoodCheckin';
import { DiscussionForum } from '@/components/discussion/DiscussionForum';
import { DashboardSidebar, SidebarNavItem } from '@/components/layout';
// Removed direct import of Quiz components here, as they are now used in PembelajaranSiswaTab
import { useSiswaDashboard } from '@/hooks/useSiswaDashboard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useTimeCapsule } from '@/hooks/useTimeCapsule';
import { TimeCapsuleModal, TimeCapsuleCard, TimeCapsuleReveal } from '@/components/timecapsule';

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
    const onboarding = useOnboarding(user?.id);

    // Focus Mode
    const { isFocusMode } = useFocusMode();

    // Mood Check-in
    const moodCheckin = useMoodCheckin({ userId: user?.id, enabled: !!user?.id });

    // Gamification Data
    const gamification = useGamification();

    // Time Capsule
    const timeCapsule = useTimeCapsule();
    const [showTimeCapsuleModal, setShowTimeCapsuleModal] = useState(false);
    const [selectedCapsule, setSelectedCapsule] = useState<typeof timeCapsule.capsules[0] | null>(null);

    // Auto-reveal newly unlocked time capsules (in-app notification)
    useEffect(() => {
        if (timeCapsule.newlyUnlocked.length > 0 && !selectedCapsule) {
            // Auto-open the first newly unlocked capsule
            setSelectedCapsule(timeCapsule.newlyUnlocked[0]);
        }
    }, [timeCapsule.newlyUnlocked, selectedCapsule]);

    return (
        <EntranceAnimation role="siswa">
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex font-outfit text-white overflow-hidden">
                {/* Sidebar - Hidden in Focus Mode */}
                {/* Sidebar - Hidden in Focus Mode */}
                <DashboardSidebar 
                    role="siswa" 
                    onLogout={handleLogout} 
                    className={`${isFocusMode ? 'w-0 p-0 overflow-hidden opacity-0 border-none' : 'w-72 p-8'} transition-all duration-500 ease-in-out`}
                    extraContent={
                        user?.id && (
                            <XPProgressBar 
                                currentXP={gamification.stats.totalXP} 
                                level={gamification.stats.level} 
                                nextLevelXP={gamification.stats.nextLevelXP} 
                                variant="compact" 
                                className="mb-4" 
                            />
                        )
                    }
                >
                    <SidebarNavItem role="siswa" icon={<LayoutDashboard size={20} />} label="Beranda" description="Ringkasan tugas & nilai" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarNavItem role="siswa" icon={<BookOpen size={20} />} label="Pembelajaran" description="Tugas, Materi, & Kuis" active={activeTab === 'pembelajaran'} onClick={() => setActiveTab('pembelajaran')} />
                    <SidebarNavItem role="siswa" icon={<BarChart size={20} />} label="Analitik" description="Nilai & Keaktifan" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <SidebarNavItem role="siswa" icon={<Clock size={20} />} label="Presensi" description="Absensi & riwayat" active={activeTab === 'absensi'} onClick={() => setActiveTab('absensi')} />
                    <SidebarNavItem role="siswa" icon={<MessageSquare size={20} />} label="Diskusi" description="Forum Anonim" active={activeTab === 'diskusi'} onClick={() => setActiveTab('diskusi')} />
                    <SidebarNavItem role="siswa" icon={<Trophy size={20} />} label="Prestasi" description="Lencana & Peringkat" active={activeTab === 'prestasi'} onClick={() => setActiveTab('prestasi')} />
                    <SidebarNavItem role="siswa" icon={<User size={20} />} label="Profil" description="Lihat profil saya" active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} />
                </DashboardSidebar>

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
                                {activeTab === 'diskusi' && "Forum Diskusi"}
                                {activeTab === 'prestasi' && "Pencapaian Saya"}
                                {activeTab === 'profil' && "Profil Saya"}
                            </h2>
                            <p className="text-sm text-slate-400 font-medium">
                                {activeTab === 'dashboard' && "Lihat ringkasan tugas, nilai, dan perkembangan belajarmu."}
                                {activeTab === 'pembelajaran' && "Akses materi, tugas, dan kuis dalam satu tempat."}
                                {activeTab === 'analytics' && "Pantau nilai, kehadiran, dan keaktifanmu."}
                                {activeTab === 'absensi' && "Lakukan presensi dan lihat riwayat kehadiran."}
                                {activeTab === 'diskusi' && "Tanya jawab anonim dengan guru."}
                                {activeTab === 'prestasi' && "Lihat pencapaian, koleksi lencana, dan peringkat kelasmu."}
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
                            <LowDataToggle />
                            <FocusModeToggle />
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

                    {/* Tab Content - GSAP Animated */}
                    <AnimatedTabContent tabKey={activeTab} className="min-h-0">
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
                    {activeTab === 'diskusi' && (
                        <DiscussionForum 
                            classId={studentClassId || ''}
                            userId={user?.id || ''}
                            isTeacher={false}
                        />
                    )}
                    {activeTab === 'prestasi' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                             {/* XP Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <XPProgressBar 
                                    currentXP={gamification.stats.totalXP} 
                                    level={gamification.stats.level} 
                                    nextLevelXP={gamification.stats.nextLevelXP} 
                                />
                                <div className="glass-panel p-6 rounded-[2rem] flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-white">Streak Belajar</h3>
                                        <p className="text-slate-400 text-sm">Konsistensi adalah kunci!</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-orange-500 flex items-center justify-end gap-2">
                                            {gamification.stats.streak.current} <span className="text-lg">🔥</span>
                                        </div>
                                        <p className="text-xs text-orange-400/80 font-bold uppercase tracking-wider">Hari Berturut-turut</p>
                                    </div>
                                </div>
                            </div>

                            {/* Badges & Leaderboard Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-white">Koleksi Lencana</h3>
                                        <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
                                            {gamification.stats.badges.filter(b => b.unlockedAt).length} / {gamification.stats.badges.length} Diraih
                                        </span>
                                    </div>
                                    <BadgeList badges={gamification.stats.badges} />
                                </div>
                                <div>
                                    <LeaderboardWidget entries={gamification.stats.leaderboard} currentUserId={user?.id} />
                                </div>
                            </div>

                            {/* Time Capsule Section */}
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-white">🕰️ Kapsul Waktu</h3>
                                        <p className="text-slate-400 text-sm">Pesan untuk dirimu di masa depan</p>
                                    </div>
                                    {!timeCapsule.activeCapsule && (
                                        <button
                                            type="button"
                                            onClick={() => setShowTimeCapsuleModal(true)}
                                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-400 hover:to-orange-500 transition-all flex items-center gap-2"
                                        >
                                            ✨ Buat Kapsul Baru
                                        </button>
                                    )}
                                </div>

                                {timeCapsule.loading ? (
                                    <div className="text-center text-slate-400 py-8">Memuat kapsul waktu...</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {timeCapsule.activeCapsule && (
                                            <TimeCapsuleCard capsule={timeCapsule.activeCapsule} />
                                        )}
                                        {timeCapsule.unlockedCapsules.map(capsule => (
                                            <TimeCapsuleCard 
                                                key={capsule.id} 
                                                capsule={capsule} 
                                                onClick={() => setSelectedCapsule(capsule)}
                                            />
                                        ))}
                                        {!timeCapsule.activeCapsule && timeCapsule.unlockedCapsules.length === 0 && (
                                            <div className="col-span-full text-center py-12 bg-white/5 rounded-[2rem] border border-white/10">
                                                <p className="text-slate-400">Belum ada kapsul waktu. Buat yang pertama!</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    </AnimatedTabContent>

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

                {/* Pomodoro Timer Widget */}
                <PomodoroTimer />

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

                {/* Mood Check-in Modal */}
                <MoodCheckinModal
                    isOpen={moodCheckin.shouldShowModal}
                    onClose={moodCheckin.dismissModal}
                    onSubmit={moodCheckin.submitMood}
                    userName={user?.full_name}
                />

                {/* Time Capsule Modals */}
                <TimeCapsuleModal
                    isOpen={showTimeCapsuleModal}
                    onClose={() => setShowTimeCapsuleModal(false)}
                    onSubmit={timeCapsule.createCapsule}
                />

                {selectedCapsule && (
                    <TimeCapsuleReveal
                        capsule={selectedCapsule}
                        isOpen={!!selectedCapsule}
                        onClose={() => {
                            // Dismiss from newly unlocked list so it won't auto-show again
                            timeCapsule.dismissNewlyUnlocked(selectedCapsule.id);
                            setSelectedCapsule(null);
                        }}
                        onSaveReflection={(reflection) => timeCapsule.addReflection(selectedCapsule.id, reflection)}
                    />
                )}
                
                {/* XP Particle Host */}
                <XPFlowParticles />
            </div>
        </EntranceAnimation>
    );
}
