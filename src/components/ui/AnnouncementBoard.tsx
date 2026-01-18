'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Megaphone, Pin, AlertTriangle, Clock, X, Plus,
    ChevronDown, ChevronUp, Trash2, Edit2
} from 'lucide-react';
import { toast } from 'sonner';

// ========================================================
// ANNOUNCEMENT BOARD COMPONENT
// Display and manage class announcements
// ========================================================

interface Announcement {
    id: string;
    class_id: string;
    teacher_id: string;
    title: string;
    content: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    pinned: boolean;
    expires_at: string | null;
    created_at: string;
    teacher?: {
        name: string;
    };
}

interface AnnouncementBoardProps {
    classId: string;
    isTeacher?: boolean;
}

const priorityConfig = {
    low: { color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Rendah' },
    normal: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Normal' },
    high: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Penting' },
    urgent: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Mendesak' },
};

export function AnnouncementBoard({ classId, isTeacher = false }: AnnouncementBoardProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Fetch announcements
    useEffect(() => {
        fetchAnnouncements();

        // Subscribe to realtime updates
        const channel = supabase
            .channel('announcements')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'announcements', filter: `class_id=eq.${classId}` },
                () => fetchAnnouncements()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [classId]);

    const fetchAnnouncements = async () => {
        const { data, error } = await supabase
            .from('announcements')
            .select(`*, teacher:users!teacher_id(name)`)
            .eq('class_id', classId)
            .order('pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (!error && data) {
            setAnnouncements(data);
        }
        setLoading(false);
    };

    const deleteAnnouncement = async (id: string) => {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Gagal menghapus pengumuman');
        } else {
            toast.success('Pengumuman dihapus');
        }
    };

    const togglePin = async (id: string, currentPinned: boolean) => {
        const { error } = await supabase
            .from('announcements')
            .update({ pinned: !currentPinned })
            .eq('id', id);

        if (!error) {
            toast.success(currentPinned ? 'Pin dicabut' : 'Pengumuman di-pin');
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 animate-pulse">
                <div className="h-6 w-40 bg-white/10 rounded mb-4" />
                <div className="space-y-3">
                    <div className="h-20 bg-white/5 rounded-xl" />
                    <div className="h-20 bg-white/5 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <Megaphone size={20} className="text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Pengumuman</h3>
                    {announcements.length > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                            {announcements.length}
                        </span>
                    )}
                </div>

                {isTeacher && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-all"
                    >
                        <Plus size={16} />
                        Buat
                    </button>
                )}
            </div>

            {/* Announcements List */}
            {announcements.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <Megaphone size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Belum ada pengumuman</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {announcements.map((ann) => (
                        <AnnouncementCard
                            key={ann.id}
                            announcement={ann}
                            isTeacher={isTeacher}
                            isExpanded={expandedId === ann.id}
                            onToggle={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                            onDelete={() => deleteAnnouncement(ann.id)}
                            onTogglePin={() => togglePin(ann.id, ann.pinned)}
                        />
                    ))}
                </div>
            )}

            {/* Create Form Modal */}
            {showForm && (
                <CreateAnnouncementModal
                    classId={classId}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        fetchAnnouncements();
                    }}
                />
            )}
        </div>
    );
}

// Individual announcement card
function AnnouncementCard({
    announcement,
    isTeacher,
    isExpanded,
    onToggle,
    onDelete,
    onTogglePin,
}: {
    announcement: Announcement;
    isTeacher: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onDelete: () => void;
    onTogglePin: () => void;
}) {
    const priority = priorityConfig[announcement.priority];
    const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();

    return (
        <div
            className={`
                p-4 rounded-xl border transition-all
                ${announcement.pinned ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}
                ${isExpired ? 'opacity-50' : ''}
            `}
        >
            {/* Header */}
            <div className="flex items-start gap-3">
                {announcement.pinned && (
                    <Pin size={14} className="text-amber-400 mt-1 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white truncate">{announcement.title}</h4>
                        <span className={`px-2 py-0.5 ${priority.bg} ${priority.color} text-xs font-bold rounded-full`}>
                            {priority.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{announcement.teacher?.name || 'Guru'}</span>
                        <span>•</span>
                        <span>{new Date(announcement.created_at).toLocaleDateString('id-ID')}</span>
                        {announcement.expires_at && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {isExpired ? 'Kadaluarsa' : `Berakhir ${new Date(announcement.expires_at).toLocaleDateString('id-ID')}`}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {isTeacher && (
                        <>
                            <button
                                onClick={onTogglePin}
                                className={`p-1.5 rounded-lg transition-colors ${announcement.pinned ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:bg-white/10'}`}
                                title={announcement.pinned ? 'Cabut pin' : 'Pin'}
                            >
                                <Pin size={14} />
                            </button>
                            <button
                                onClick={onDelete}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Hapus"
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={onToggle}
                        className="p-1.5 text-slate-400 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Content (expandable) */}
            {isExpanded && announcement.content && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{announcement.content}</p>
                </div>
            )}
        </div>
    );
}

// Create announcement modal
function CreateAnnouncementModal({
    classId,
    onClose,
    onSuccess,
}: {
    classId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
    const [pinned, setPinned] = useState(false);
    const [expiresAt, setExpiresAt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);

        const { data: userData } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('announcements')
            .insert({
                class_id: classId,
                teacher_id: userData.user?.id,
                title: title.trim(),
                content: content.trim() || null,
                priority,
                pinned,
                expires_at: expiresAt || null,
            });

        setLoading(false);

        if (error) {
            toast.error('Gagal membuat pengumuman');
        } else {
            toast.success('Pengumuman berhasil dibuat');
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-900 rounded-[2rem] p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Buat Pengumuman</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white/10 rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Judul</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500"
                            placeholder="Judul pengumuman..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Isi (Opsional)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 min-h-[100px]"
                            placeholder="Detail pengumuman..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Prioritas</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as typeof priority)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            >
                                <option value="low">Rendah</option>
                                <option value="normal">Normal</option>
                                <option value="high">Penting</option>
                                <option value="urgent">Mendesak</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Kadaluarsa (Opsional)</label>
                            <input
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={pinned}
                            onChange={(e) => setPinned(e.target.checked)}
                            className="w-5 h-5 rounded bg-white/10 border-white/20"
                        />
                        <span className="text-sm text-slate-300">Pin di atas</span>
                    </label>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Buat Pengumuman'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
