'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, Settings, ChevronLeft, ChevronRight, X, ShieldAlert, Clock, CheckSquare, Square, Users, School } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    school_id: string | null;
    created_at: string;
    school_name?: string;
}

interface AdminSchool {
    id: string;
    name: string;
}

interface Props {
    users: AdminUser[];
    schools: AdminSchool[];
    onUpdateRole: (userId: string, newRole: string) => void;
    onUpdateSchool: (userId: string, schoolId: string | null) => void;
    currentUserId?: string; // The logged-in admin's ID
    onContextMenu?: (e: React.MouseEvent, user: AdminUser) => void;
}

const ROLE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
    admin: { label: 'Admin', bg: 'bg-rose-500/20', text: 'text-rose-400' },
    kepala_sekolah: { label: 'Kepsek', bg: 'bg-amber-500/20', text: 'text-amber-400' },
    guru: { label: 'Guru', bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
    siswa: { label: 'Siswa', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
};

const AVAILABLE_ROLES = ['admin', 'kepala_sekolah', 'guru', 'siswa'];

const ITEMS_PER_PAGE = 25;

export function UserManagement({ users, schools, onUpdateRole, onUpdateSchool, currentUserId, onContextMenu }: Props) {
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editingSchool, setEditingSchool] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ userId: string; userName: string; currentRole: string; newRole: string } | null>(null);
    const [page, setPage] = useState(1);
    
    // Selection state for bulk actions
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showBulkAction, setShowBulkAction] = useState(false);
    const [bulkRole, setBulkRole] = useState<string>('');
    const [bulkSchool, setBulkSchool] = useState<string>('');

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase());
            const matchRole = filterRole === 'all' || u.role === filterRole;
            return matchSearch && matchRole;
        });
    }, [users, search, filterRole]);

    // Reset page when filters change
    useMemo(() => { setPage(1); }, [search, filterRole]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Last seen heuristic: based on created_at (we don't have login data, so we derive activity status)
    const getActivityStatus = (createdAt: string) => {
        const daysSinceCreation = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreation <= 7) return { label: 'Baru', color: 'text-emerald-400', dot: 'bg-emerald-400' };
        if (daysSinceCreation <= 30) return { label: 'Aktif', color: 'text-sky-400', dot: 'bg-sky-400' };
        return { label: 'Lama', color: 'text-slate-500', dot: 'bg-slate-600' };
    };

    const handleRoleClick = (userId: string, userName: string, currentRole: string, newRole: string) => {
        // BUG-02 FIX: Prevent self-demotion
        if (userId === currentUserId) {
            return; // Silently ignore — button is already disabled in UI
        }
        // BUG-01 FIX: Require confirmation before role change
        setConfirmAction({ userId, userName, currentRole, newRole });
    };

    const confirmRoleChange = () => {
        if (!confirmAction) return;
        onUpdateRole(confirmAction.userId, confirmAction.newRole);
        setConfirmAction(null);
        setEditingUser(null);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginated.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginated.map(u => u.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkApply = () => {
        if (!bulkRole && !bulkSchool) {
            toast.error('Pilih role atau sekolah untuk diubah');
            return;
        }

        selectedIds.forEach(id => {
            if (bulkRole) onUpdateRole(id, bulkRole);
            if (bulkSchool) onUpdateSchool(id, bulkSchool === 'root' ? null : bulkSchool);
        });

        toast.success(`Berhasil memperbarui ${selectedIds.length} pengguna`);
        setSelectedIds([]);
        setShowBulkAction(false);
        setBulkRole('');
        setBulkSchool('');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-geist-mono">
            {/* Confirmation Dialog — BUG-01 FIX */}
            {confirmAction && (
                <div className="fixed inset-0 z-[99980] flex items-center justify-center" onClick={() => setConfirmAction(null)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative bg-[#12141A] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                                <ShieldAlert size={24} className="text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm">KONFIRMASI PERUBAHAN ROLE</h3>
                                <p className="text-slate-500 text-xs mt-0.5">Aksi ini akan mengubah akses pengguna</p>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-6 space-y-2">
                            <p className="text-xs text-slate-400">
                                <span className="text-slate-600">User:</span>{' '}
                                <span className="text-white font-bold">{confirmAction.userName}</span>
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                                <span className={`${ROLE_LABELS[confirmAction.currentRole]?.bg} ${ROLE_LABELS[confirmAction.currentRole]?.text} px-2 py-0.5 rounded text-[10px] font-black uppercase`}>
                                    {ROLE_LABELS[confirmAction.currentRole]?.label}
                                </span>
                                <span className="text-slate-600">→</span>
                                <span className={`${ROLE_LABELS[confirmAction.newRole]?.bg} ${ROLE_LABELS[confirmAction.newRole]?.text} px-2 py-0.5 rounded text-[10px] font-black uppercase`}>
                                    {ROLE_LABELS[confirmAction.newRole]?.label}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-3 bg-white/5 text-slate-400 rounded-xl font-bold text-xs hover:bg-white/10 transition-colors uppercase tracking-widest">
                                Batal
                            </button>
                            <button onClick={confirmRoleChange} className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl font-bold text-xs hover:bg-rose-400 transition-colors uppercase tracking-widest">
                                Konfirmasi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Control Bar — Technical Compact Style */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                <div className="relative flex-1 w-full max-w-md">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="SEARCH_USERS_BY_NAME_OR_EMAIL..."
                        className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 text-[12px] font-bold uppercase tracking-wider transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest hidden lg:block">FILTER_BY_ROLE</span>
                    <div className="relative w-full sm:w-48">
                        <select
                            value={filterRole}
                            onChange={e => setFilterRole(e.target.value)}
                            className="w-full appearance-none bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 pr-10 text-white font-bold text-[12px] uppercase tracking-wider focus:outline-none focus:border-rose-500/50 cursor-pointer"
                        >
                            <option value="all">ALL_ROLES</option>
                            {AVAILABLE_ROLES.map(r => (
                                <option key={r} value={r}>{r.toUpperCase()}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* User Table — High Density Grid */}
            <div className="universe-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-[12px] border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 text-slate-500">
                                <th className="px-6 py-4 w-10">
                                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-white transition-colors">
                                        {selectedIds.length === paginated.length && paginated.length > 0 ? <CheckSquare size={16} className="text-rose-500" /> : <Square size={16} />}
                                    </button>
                                </th>
                                <th className="text-left px-6 py-4 font-black uppercase tracking-[0.2em]">Full_Name</th>
                                <th className="text-left px-6 py-4 font-black uppercase tracking-[0.2em]">System_Identity</th>
                                <th className="text-left px-6 py-4 font-black uppercase tracking-[0.2em]">Linked_School</th>
                                <th className="text-left px-6 py-4 font-black uppercase tracking-[0.2em]">Access_Level</th>
                                <th className="text-left px-6 py-4 font-black uppercase tracking-[0.2em]">Status</th>
                                <th className="text-right px-6 py-4 font-black uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {paginated.map(u => {
                                const roleInfo = ROLE_LABELS[u.role] || { label: u.role, bg: 'bg-slate-500/20', text: 'text-slate-400' };
                                const activity = getActivityStatus(u.created_at);
                                const isSelf = u.id === currentUserId;
                                return (
                                    <tr key={u.id} onContextMenu={onContextMenu ? (e) => onContextMenu(e, u) : undefined} className={`group mc-table-row ${selectedIds.includes(u.id) ? 'bg-rose-500/[0.03]' : ''}`}>
                                        <td className="px-6 py-4 w-10">
                                            <button onClick={() => toggleSelect(u.id)} className="text-slate-500 hover:text-white transition-colors">
                                                {selectedIds.includes(u.id) ? <CheckSquare size={16} className="text-rose-500" /> : <Square size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${roleInfo.bg} flex items-center justify-center text-xs font-black ${roleInfo.text}`}>
                                                    {u.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="text-white font-bold tracking-tight flex items-center gap-1.5">
                                                        {u.full_name}
                                                        {isSelf && <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-black">YOU</span>}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-500 group-hover:text-slate-400 transition-colors font-mono">{u.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingSchool === u.id ? (
                                                <div className="flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-200">
                                                    <select
                                                        autoFocus
                                                        value={u.school_id || ''}
                                                        onChange={(e) => {
                                                            onUpdateSchool(u.id, e.target.value || null);
                                                            setEditingSchool(null);
                                                        }}
                                                        className="bg-black/40 border border-white/10 rounded-md px-2 py-1 text-[10px] text-white font-bold uppercase focus:outline-none focus:border-rose-500/50"
                                                    >
                                                        <option value="">ROOT_SYSTEM</option>
                                                        {schools.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                                        ))}
                                                    </select>
                                                    <button onClick={() => setEditingSchool(null)} className="text-slate-500 hover:text-rose-400 p-1">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setEditingSchool(u.id)}
                                                    className="px-2 py-0.5 rounded bg-white/5 text-slate-500 border border-white/5 text-[10px] hover:border-rose-500/30 hover:text-rose-300 transition-all cursor-pointer group/school"
                                                    title="Klik untuk pindahkan sekolah"
                                                >
                                                    {u.school_name ? u.school_name.toUpperCase() : 'ROOT_SYSTEM'}
                                                    <Settings size={8} className="inline-block ml-1 opacity-0 group-hover/school:opacity-100 transition-opacity" />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`${roleInfo.bg} ${roleInfo.text} px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.15em] border border-current opacity-70 group-hover:opacity-100 transition-opacity`}>
                                                {roleInfo.label}
                                            </span>
                                        </td>
                                        {/* F-10: Activity Status Indicator */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${activity.dot}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${activity.color}`}>{activity.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingUser === u.id ? (
                                                <div className="flex items-center justify-end gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                                                    {AVAILABLE_ROLES.map(r => {
                                                        const isCurrentRole = u.role === r;
                                                        const isSelfDemotion = isSelf && r !== 'admin';
                                                        return (
                                                            <button
                                                                key={r}
                                                                onClick={() => handleRoleClick(u.id, u.full_name, u.role, r)}
                                                                disabled={isCurrentRole || isSelfDemotion}
                                                                title={isSelfDemotion ? 'Tidak bisa mengubah role sendiri' : undefined}
                                                                className={`
                                                                    px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all
                                                                    ${isCurrentRole 
                                                                        ? 'bg-white/10 text-slate-500 cursor-not-allowed' 
                                                                        : isSelfDemotion
                                                                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white shadow-lg shadow-rose-500/20'
                                                                    }
                                                                `}
                                                            >
                                                                {ROLE_LABELS[r]?.label || r}
                                                            </button>
                                                        );
                                                    })}
                                                    <button 
                                                        onClick={() => setEditingUser(null)} 
                                                        className="ml-2 w-7 h-7 flex items-center justify-center bg-white/5 rounded-md text-slate-500 hover:text-white transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setEditingUser(u.id)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <Settings size={12} className="group-hover:rotate-90 transition-transform duration-500" />
                                                    CONFIGURE_ROLE
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-600">
                            <Search size={24} />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">ERR_NO_USERS_MATCHED</p>
                    </div>
                )}
                
                {/* Table Footer — REAL pagination (BUG-04 FIX) */}
                <div className="bg-white/[0.01] border-t border-white/5 px-6 py-4 flex items-center justify-between">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                        DATA_SOURCE: PRODUCTION · SHOWING: {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} ENTITIES
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page <= 1} 
                            onClick={() => setPage(p => p - 1)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors disabled:text-slate-700 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-[10px] font-black text-slate-500 tabular-nums font-mono px-2">
                            {page}/{totalPages}
                        </span>
                        <button 
                            disabled={page >= totalPages} 
                            onClick={() => setPage(p => p + 1)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors disabled:text-slate-700 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-[#12141A] border border-rose-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-6 backdrop-blur-md">
                        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                            <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center font-black">
                                {selectedIds.length}
                            </div>
                            <div>
                                <p className="text-white font-black text-[10px] uppercase tracking-wider">Terpilih</p>
                                <p className="text-slate-500 text-[9px]">Pilih aksi massal</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-500 uppercase">Ubah Role</label>
                                <select 
                                    value={bulkRole}
                                    onChange={e => setBulkRole(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white font-bold focus:outline-none focus:border-rose-500/50"
                                >
                                    <option value="">Pilih Role...</option>
                                    {AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-500 uppercase">Ubah Sekolah</label>
                                <select 
                                    value={bulkSchool}
                                    onChange={e => setBulkSchool(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white font-bold focus:outline-none focus:border-rose-500/50"
                                >
                                    <option value="">Pilih Sekolah...</option>
                                    <option value="root">ROOT_SYSTEM</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                                </select>
                            </div>

                            <button 
                                onClick={handleBulkApply}
                                className="mt-4 px-6 py-2.5 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                            >
                                Apply All
                            </button>
                            
                            <button 
                                onClick={() => setSelectedIds([])}
                                className="mt-4 w-10 h-10 flex items-center justify-center bg-white/5 text-slate-400 rounded-xl hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
