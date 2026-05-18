'use client';

import { useState } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    MessageSquare,
    Trophy,
    CreditCard,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { DashboardSidebar, SidebarNavItem } from '@/components/layout/DashboardSidebar';
import { RoleTopbar } from '@/components/layout/RoleTopbar';
import { ParentDashboard } from '@/components/ortu/ParentDashboard';
import { OrtuAcademicTab, OrtuAttendanceTab } from '@/components/ortu/OrtuDetailTabs';
import { KasKelas } from '@/components/guru/KasKelas';
import { ForumModule } from '@/components/forum/ForumModule';
import { Leaderboard } from '@/components/common/Leaderboard';
import { useAuth } from '@/hooks/useAuth';
import { parentRepository } from '@/lib/repositories/parent.repository';
import { AIChatbot } from '@/components/shared/AIChatbot';
import { useEffect } from 'react';

type OrtuTab = 'dashboard' | 'academic' | 'attendance' | 'forum' | 'gamification' | 'finance';

export default function ParentPage() {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<OrtuTab>('dashboard');

    // Linked student for detail tabs
    const [linkedStudent, setLinkedStudent] = useState<{ id: string; full_name: string; school_id: string; class_id?: string } | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        parentRepository.getLinkedStudents(user.id).then(data => {
            if (data && data.length > 0) {
                const first = data[0] as any;
                setLinkedStudent({
                    id: first.student?.id ?? first.student_id ?? '',
                    full_name: first.student?.full_name ?? 'Siswa',
                    school_id: first.student?.school_id ?? user?.school_id ?? '',
                    class_id: first.student?.class_id,
                });
            }
        }).catch(console.error);
    }, [user?.id, user?.school_id]);

    if (!user) return null;

    const tabTitle: Record<OrtuTab, string> = {
        dashboard: `Selamat Datang, ${user.full_name || 'Orang Tua'}`,
        academic: 'Nilai & Akademik',
        attendance: 'Rekap Kehadiran',
        forum: 'Forum Diskusi',
        gamification: 'Prestasi Siswa',
        finance: 'Kas Kelas',
    };

    return (
        <RoleShell role="orang_tua">
            <DashboardSidebar role="orang_tua" onLogout={signOut}>
                <SidebarNavItem
                    icon={<LayoutDashboard size={18} />}
                    label="Dashboard"
                    description="Ringkasan Akademik"
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                    role="orang_tua"
                />
                <SidebarNavItem
                    icon={<BookOpen size={18} />}
                    label="Akademik"
                    description="Nilai & Tugas"
                    active={activeTab === 'academic'}
                    onClick={() => setActiveTab('academic')}
                    role="orang_tua"
                />
                <SidebarNavItem
                    icon={<Calendar size={18} />}
                    label="Kehadiran"
                    description="Rekap Presensi"
                    active={activeTab === 'attendance'}
                    onClick={() => setActiveTab('attendance')}
                    role="orang_tua"
                />
                <SidebarNavItem
                    icon={<MessageSquare size={18} />}
                    label="Forum"
                    description="Diskusi Sekolah"
                    active={activeTab === 'forum'}
                    onClick={() => setActiveTab('forum')}
                    role="orang_tua"
                />
                <SidebarNavItem
                    icon={<Trophy size={18} />}
                    label="Prestasi"
                    description="Leaderboard & Lencana"
                    active={activeTab === 'gamification'}
                    onClick={() => setActiveTab('gamification')}
                    role="orang_tua"
                />
                <SidebarNavItem
                    icon={<CreditCard size={18} />}
                    label="Kas Kelas"
                    description="Keuangan Transparansi"
                    active={activeTab === 'finance'}
                    onClick={() => setActiveTab('finance')}
                    role="orang_tua"
                />
            </DashboardSidebar>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <RoleTopbar
                    role="orang_tua"
                    title={tabTitle[activeTab]}
                    subtitle="Pantau perkembangan akademik anak Anda."
                />

                <main className="flex-1 overflow-hidden flex flex-col">
                    {/* ─── Dashboard ─── */}
                    {activeTab === 'dashboard' && <ParentDashboard user={user} />}

                    {/* ─── Akademik ─── */}
                    {activeTab === 'academic' && (
                        linkedStudent ? (
                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                <OrtuAcademicTab
                                    studentId={linkedStudent.id}
                                    studentName={linkedStudent.full_name}
                                />
                            </div>
                        ) : (
                            <EmptyState message="Belum ada data siswa yang terhubung" />
                        )
                    )}

                    {/* ─── Kehadiran ─── */}
                    {activeTab === 'attendance' && (
                        linkedStudent ? (
                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                <OrtuAttendanceTab
                                    studentId={linkedStudent.id}
                                    studentName={linkedStudent.full_name}
                                />
                            </div>
                        ) : (
                            <EmptyState message="Belum ada data siswa yang terhubung" />
                        )
                    )}

                    {/* ─── Forum ─── */}
                    {activeTab === 'forum' && (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="px-8 pt-8 space-y-1">
                                <h2 className="text-3xl font-black text-white font-fraunces">Forum Diskusi</h2>
                                <p className="text-slate-500 text-sm">Hubungi sekolah dan orang tua lainnya di sini.</p>
                            </div>
                            <ForumModule user={user} />
                        </div>
                    )}

                    {/* ─── Gamification / Prestasi ─── */}
                    {activeTab === 'gamification' && (
                        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
                            <div className="max-w-2xl mx-auto space-y-8">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-white font-fraunces">Prestasi Siswa</h2>
                                    <p className="text-slate-500 text-sm">Lihat peringkat dan pencapaian anak-anak di sekolah.</p>
                                </div>
                                <Leaderboard schoolId={user.school_id!} />
                            </div>
                        </div>
                    )}

                    {/* ─── Kas Kelas ─── */}
                    {activeTab === 'finance' && (
                        linkedStudent?.class_id ? (
                            <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
                                <div className="max-w-xl mx-auto">
                                    <KasKelas
                                        classId={linkedStudent.class_id}
                                        isTeacher={false}
                                    />
                                </div>
                            </div>
                        ) : (
                            <EmptyState message="Data kelas belum tersedia" />
                        )
                    )}
                </main>
            </div>

            {/* AI Chatbot */}
            <AIChatbot
                userRole="orang_tua"
                userName={user.full_name || 'Orang Tua'}
            />
        </RoleShell>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 p-8">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                <LayoutDashboard size={28} className="opacity-30" />
            </div>
            <p className="font-bold tracking-widest uppercase text-xs text-center">{message}</p>
        </div>
    );
}
