'use client';

import '@/styles/admin-dna.css';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { LayoutDashboard, School, Users, Activity, Heart, Settings, Clock, Search, Command, ShieldCheck, Copy, Power, Eye, RefreshCw, Shield } from 'lucide-react';
import { EntranceAnimation, CommandPalette, DetailDrawer, UniverseSkeleton, ProfileSettingsModal } from '@/components/ui';
import type { CommandItem } from '@/components/ui';
import {
    AdminOverview, SchoolManagement, UserManagement, SchoolHealthRadar,
    PlatformMonitoring, PolicySettings, AuditTimeline,
    KeyboardShortcutSheet, ContextMenuPortal, useContextMenu,
    DensityToggle, useDensity, NotificationCenter, PlatformPulse, UserTimelineModal
} from '@/components/admin';
import type { ContextMenuEntry } from '@/components/admin';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { DashboardSidebar, SidebarNavItem, RoleShell, RoleTopbar, MobileNavigation } from '@/components/layout';
import { getRoleTheme } from '@/lib/theme/roleTheme';
import { AIChatbot } from '@/components/shared/AIChatbot';
import { toast } from 'sonner';

type AdminTab = 'overview' | 'health' | 'schools' | 'users' | 'monitoring' | 'policies' | 'audit';

const NAV_ITEMS = [
    { id: 'overview' as const, label: 'Overview', description: 'Statistik platform', icon: LayoutDashboard },
    { id: 'health' as const, label: 'Health Radar', description: 'Skor kesehatan sekolah', icon: Heart },
    { id: 'schools' as const, label: 'Sekolah', description: 'Kelola sekolah & kode', icon: School },
    { id: 'users' as const, label: 'User', description: 'Kelola semua user', icon: Users },
    { id: 'monitoring' as const, label: 'Monitoring', description: 'Aktivitas platform', icon: Activity },
    { id: 'audit' as const, label: 'Audit Log', description: 'Riwayat aksi sistem', icon: Clock },
    { id: 'policies' as const, label: 'Kebijakan', description: 'Kebijakan global', icon: Settings },
];

const TAB_TITLES: Record<AdminTab, string> = {
    overview: 'Platform Overview',
    health: 'School Health Radar',
    schools: 'Manajemen Sekolah',
    users: 'Manajemen User',
    monitoring: 'Monitoring Aktivitas',
    audit: 'Audit Timeline',
    policies: 'Kebijakan Global',
};

const TAB_ORDER: AdminTab[] = ['overview', 'health', 'schools', 'users', 'monitoring', 'audit', 'policies'];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [showInspector, setShowInspector] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [healthSelectedSchool, setHealthSelectedSchool] = useState<string | null>(null);
    const [timelineUser, setTimelineUser] = useState<{ id: string; name: string; role: string } | null>(null);
    const {
        user, authLoading, loading,
        stats, schools, schoolHealth, users,
        createSchool, toggleSchoolActive, regenerateCode, updateUserRole, updateUserSchool,
    } = useAdminDashboard();
    const theme = getRoleTheme('admin');
    const [density, setDensity] = useDensity();
    const { menu: contextMenu, show: showContextMenu, close: closeContextMenu } = useContextMenu();

    // ── Number key shortcuts (1-7) for tab switching ──
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
            if (isInput || e.ctrlKey || e.metaKey || e.altKey) return;

            const num = parseInt(e.key, 10);
            if (num >= 1 && num <= 7) {
                e.preventDefault();
                setActiveTab(TAB_ORDER[num - 1]);
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // ── Enhanced Command Palette: entity search across schools/users ──
    const cmdItems: CommandItem[] = useMemo(() => {
        const navItems: CommandItem[] = NAV_ITEMS.map(item => ({
            id: `nav-${item.id}`,
            label: item.label,
            description: item.description,
            icon: <item.icon size={16} />,
            category: 'Navigasi',
            action: () => setActiveTab(item.id),
            keywords: [item.label.toLowerCase(), item.description.toLowerCase()],
        }));

        // Entity search: Schools
        const schoolItems: CommandItem[] = schools.map(s => ({
            id: `school-${s.id}`,
            label: s.name,
            description: `${s.guru_count} guru · ${s.siswa_count} siswa · ${s.class_count} kelas`,
            icon: <School size={16} />,
            category: 'Sekolah',
            action: () => {
                setActiveTab('schools');
                toast.info(`Navigating to: ${s.name}`);
            },
            keywords: [s.name.toLowerCase(), s.address?.toLowerCase() || '', s.is_active ? 'aktif' : 'nonaktif'],
        }));

        // Entity search: Users (top 50 to keep performant)
        const userItems: CommandItem[] = users.slice(0, 50).map(u => ({
            id: `user-${u.id}`,
            label: u.full_name,
            description: `${u.email} · ${u.role}`,
            icon: <Users size={16} />,
            category: 'User',
            action: () => {
                setActiveTab('users');
                toast.info(`Navigating to user: ${u.full_name}`);
            },
            keywords: [u.full_name.toLowerCase(), u.email.toLowerCase(), u.role, u.school_name?.toLowerCase() || ''],
        }));

        // Quick actions
        const actionItems: CommandItem[] = [
            {
                id: 'action-add-school',
                label: 'Tambah Sekolah Baru',
                description: 'Buat entitas sekolah baru',
                icon: <School size={16} />,
                category: 'Aksi Cepat',
                action: () => setActiveTab('schools'),
                keywords: ['buat', 'tambah', 'create', 'new', 'sekolah'],
            },
            {
                id: 'action-density',
                label: `Ubah Density (sekarang: ${density})`,
                description: 'Toggle compact/default/comfortable',
                icon: <Settings size={16} />,
                category: 'Aksi Cepat',
                action: () => {
                    const order: Array<typeof density> = ['compact', 'default', 'comfortable'];
                    const idx = order.indexOf(density);
                    setDensity(order[(idx + 1) % order.length]);
                    toast.success(`Density: ${order[(idx + 1) % order.length]}`);
                },
                keywords: ['density', 'compact', 'comfortable', 'tampilan'],
            },
        ];

        return [...navItems, ...actionItems, ...schoolItems, ...userItems];
    }, [schools, users, density, setDensity]);

    // ── Context menu handler for schools ──
    const handleSchoolContextMenu = useCallback((e: React.MouseEvent, school: { id: string; name: string; is_active: boolean; codes?: Array<{ code: string; role: string }> }) => {
        const items: ContextMenuEntry[] = [
            {
                id: 'cm-view-school',
                label: `Lihat "${school.name}"`,
                icon: Eye,
                action: () => toast.info(`Detail: ${school.name}`),
            },
            {
                id: 'cm-copy-guru-code',
                label: 'Salin Kode Guru',
                icon: Copy,
                action: () => {
                    const guruCode = school.codes?.find(c => c.role === 'guru')?.code;
                    if (guruCode) {
                        navigator.clipboard.writeText(guruCode);
                        toast.success('Kode guru disalin!');
                    } else {
                        toast.error('Kode guru tidak ditemukan');
                    }
                },
            },
            {
                id: 'cm-copy-siswa-code',
                label: 'Salin Kode Siswa',
                icon: Copy,
                action: () => {
                    const siswaCode = school.codes?.find(c => c.role === 'siswa')?.code;
                    if (siswaCode) {
                        navigator.clipboard.writeText(siswaCode);
                        toast.success('Kode siswa disalin!');
                    } else {
                        toast.error('Kode siswa tidak ditemukan');
                    }
                },
            },
            { type: 'separator' },
            {
                id: 'cm-toggle-active',
                label: school.is_active ? 'Nonaktifkan Sekolah' : 'Aktifkan Sekolah',
                icon: Power,
                danger: school.is_active,
                action: () => toggleSchoolActive(school.id, school.is_active),
            },
        ];
        showContextMenu(e, items);
    }, [showContextMenu, toggleSchoolActive]);

    // ── Context menu handler for users ──
    const handleUserContextMenu = useCallback((e: React.MouseEvent, u: { id: string; full_name: string; email: string; role: string }) => {
        const items: ContextMenuEntry[] = [
            {
                id: 'cm-copy-email',
                label: 'Salin Email',
                icon: Copy,
                action: () => {
                    navigator.clipboard.writeText(u.email);
                    toast.success('Email disalin!');
                },
            },
            {
                id: 'cm-view-user',
                label: `Lihat Timeline "${u.full_name}"`,
                icon: Eye,
                action: () => setTimelineUser({ id: u.id, name: u.full_name, role: u.role }),
            },
            { type: 'separator' },
            {
                id: 'cm-make-admin',
                label: 'Set Role: Admin',
                icon: Shield,
                action: () => updateUserRole(u.id, 'admin'),
                disabled: u.role === 'admin' || u.id === user?.id,
            },
            {
                id: 'cm-make-guru',
                label: 'Set Role: Guru',
                icon: Users,
                action: () => updateUserRole(u.id, 'guru'),
                disabled: u.role === 'guru',
            },
        ];
        showContextMenu(e, items);
    }, [showContextMenu, updateUserRole, user?.id]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 font-bold text-sm">Memuat Admin Panel...</span>
                </div>
            </div>
        );
    }

    return (
        <EntranceAnimation role="admin">
            <CommandPalette items={cmdItems} accentColor="rose" />
            <KeyboardShortcutSheet />
            <ContextMenuPortal menu={contextMenu} onClose={closeContextMenu} />
            
            {/* Sprint 2: User Timeline Modal */}
            {timelineUser && (
                <UserTimelineModal
                    userId={timelineUser.id}
                    userName={timelineUser.name}
                    role={timelineUser.role}
                    open={!!timelineUser}
                    onClose={() => setTimelineUser(null)}
                />
            )}

            <ProfileSettingsModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} role="admin" user={user} />

            <RoleShell role="admin" className="font-geist-mono">
                {/* Mobile Navigation */}
                <MobileNavigation
                    role="admin"
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
                        role="admin"
                        onLogout={() => { import('@/lib/supabase').then(m => m.supabase.auth.signOut()).then(() => window.location.href = '/login'); }}
                        extraContent={
                            <button
                                type="button"
                                onClick={() => {
                                    const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true });
                                    window.dispatchEvent(e);
                                }}
                                className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 text-xs font-medium hover:bg-white/10 hover:text-slate-300 transition-all"
                            >
                                <Search size={14} />
                                <span className="flex-1 text-left">Cari perintah...</span>
                                <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-mono"><Command size={10} />K</kbd>
                            </button>
                        }
                    >
                        {NAV_ITEMS.map(item => (
                            <SidebarNavItem
                                key={item.id}
                                role="admin"
                                icon={<item.icon size={20} />}
                                label={item.label}
                                description={item.description}
                                active={activeTab === item.id}
                                onClick={() => setActiveTab(item.id)}
                            />
                        ))}
                    </DashboardSidebar>

                    <main className="flex-1 p-6 md:p-10 overflow-y-auto mc-dotgrid">
                        <RoleTopbar
                            role="admin"
                            kicker="Admin Panel"
                            title={TAB_TITLES[activeTab]}
                            subtitle="Command Center untuk memonitor, mengelola, dan mengaudit seluruh platform."
                            right={
                                <div className="flex items-center gap-2">
                                    <NotificationCenter />
                                    {/* Density Toggle */}
                                    <DensityToggle density={density} onChangeDensity={setDensity} />

                                    {/* Shortcuts hint */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const e = new KeyboardEvent('keydown', { key: '?', bubbles: true });
                                            window.dispatchEvent(e);
                                        }}
                                        className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all"
                                        title="Keyboard Shortcuts"
                                    >
                                        <kbd className="px-1 py-0.5 bg-white/5 rounded text-[9px] font-mono border border-white/5">?</kbd>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowInspector(true)}
                                        className={`md:hidden px-4 py-2 rounded-xl text-xs font-black border ${theme.accentBorder} ${theme.accentBgSoft} ${theme.accentText} hover:opacity-90 transition-opacity flex items-center gap-2`}
                                    >
                                        <ShieldCheck size={14} /> Inspector
                                    </button>
                                    <div 
                                        onClick={() => setShowProfileModal(true)}
                                        className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors"
                                    >
                                        <div className={`w-9 h-9 rounded-xl ${theme.accentBgStrong} flex items-center justify-center font-black text-white text-xs`}>
                                            {user.full_name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-xs truncate">{user.full_name}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${theme.accentText}`}>Administrator</p>
                                        </div>
                                    </div>
                                </div>
                            }
                        />

                        {loading ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <UniverseSkeleton type="stats" role="admin" count={5} />
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                                    <UniverseSkeleton type="table" role="admin" count={6} />
                                    <UniverseSkeleton type="list" role="admin" count={4} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
                                <section className="min-w-0">
                                    {activeTab === 'overview' && <AdminOverview stats={{ ...stats, schools }} />}
                                    {activeTab === 'health' && (
                                        <SchoolHealthRadar 
                                            schools={schoolHealth} 
                                            onSelectSchool={(school) => {
                                                setHealthSelectedSchool(school.school_id);
                                                setActiveTab('schools');
                                            }}
                                        />
                                    )}
                                    {activeTab === 'schools' && (
                                        <SchoolManagement
                                            schools={schools}
                                            onCreateSchool={createSchool}
                                            onToggleActive={toggleSchoolActive}
                                            onRegenerateCode={regenerateCode}
                                            onContextMenu={handleSchoolContextMenu}
                                        />
                                    )}
                                    {activeTab === 'users' && (
                                        <UserManagement
                                            users={users}
                                            schools={schools}
                                            onUpdateRole={updateUserRole}
                                            onUpdateSchool={updateUserSchool}
                                            currentUserId={user?.id}
                                            onContextMenu={handleUserContextMenu}
                                        />
                                    )}
                                    {activeTab === 'monitoring' && <PlatformMonitoring />}
                                    {activeTab === 'audit' && <AuditTimeline />}
                                    {activeTab === 'policies' && <PolicySettings />}
                                </section>

                                <aside className="hidden xl:block sticky top-8">
                                    <AdminInspector activeTab={activeTab} stats={stats} schoolsCount={schools.length} density={density} />
                                </aside>
                            </div>
                        )}
                    </main>
                </div>

                <DetailDrawer
                    open={showInspector}
                    onClose={() => setShowInspector(false)}
                    title="Inspector"
                    subtitle="Ringkasan cepat konteks Admin"
                >
                    <AdminInspector activeTab={activeTab} stats={stats} schoolsCount={schools.length} density={density} />
                </DetailDrawer>

                {/* AI Chatbot */}
                <AIChatbot 
                    userRole="admin" 
                    userName={user?.full_name || 'Admin'}
                    userId={user?.id || ''}
                    schoolId={null}
                />
            </RoleShell>
        </EntranceAnimation>
    );
}

function AdminInspector({
    activeTab,
    stats,
    schoolsCount,
    density,
}: {
    activeTab: string;
    stats: {
        totalSchools?: number;
        totalGuru?: number;
        totalSiswa?: number;
        totalKepsek?: number;
        totalClasses?: number;
    } | null;
    schoolsCount: number;
    density: string;
}) {
    const theme = getRoleTheme('admin');

    return (
        <div className="mc-surface p-5">
            <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme.accentText}/70`}>
                Context
            </p>
            <h3 className="text-sm font-black text-white mt-1">
                {activeTab}
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3 mc-stagger">
                <InspectorStat label="Sekolah" value={String(stats?.totalSchools ?? schoolsCount)} />
                <InspectorStat label="User" value={String((stats?.totalGuru ?? 0) + (stats?.totalSiswa ?? 0) + (stats?.totalKepsek ?? 0) + 1)} />
                <InspectorStat label="Kelas" value={String(stats?.totalClasses ?? '—')} />
                <InspectorStat label="Density" value={density} />
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xs font-bold text-white mb-1">Shortcuts</p>
                <div className="space-y-1.5 text-[11px] text-slate-500 leading-relaxed">
                    <p><kbd className="px-1 py-0.5 bg-white/5 rounded text-slate-400 font-mono border border-white/5 text-[9px]">⌘K</kbd> Command Palette</p>
                    <p><kbd className="px-1 py-0.5 bg-white/5 rounded text-slate-400 font-mono border border-white/5 text-[9px]">?</kbd> Semua shortcut</p>
                    <p><kbd className="px-1 py-0.5 bg-white/5 rounded text-slate-400 font-mono border border-white/5 text-[9px]">D</kbd> Toggle density</p>
                    <p><kbd className="px-1 py-0.5 bg-white/5 rounded text-slate-400 font-mono border border-white/5 text-[9px]">1-7</kbd> Switch tab</p>
                </div>
            </div>
        </div>
    );
}

function InspectorStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mc-mono">{label}</p>
            <p className="text-lg font-black text-white mt-1 mc-mono">{value}</p>
        </div>
    );
}
