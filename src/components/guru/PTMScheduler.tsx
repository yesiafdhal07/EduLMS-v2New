'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Plus, Send, Loader2, CheckCircle2, Users, X, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { whatsappService } from '@/lib/services/whatsapp.service';
import { toast } from 'sonner';

// ============================================================
// PTM SCHEDULER — USP #21
// Schedule Parent-Teacher Meetings, send WA invites to parents.
// ============================================================

interface PTMSession {
    id: string;
    class_id: string;
    teacher_id: string;
    title: string;
    scheduled_at: string;   // ISO datetime
    duration_minutes: number;
    location: string;
    notes: string | null;
    status: 'upcoming' | 'done' | 'cancelled';
    created_at: string;
}

interface Parent {
    student_name: string;
    parent_name: string;
    parent_phone: string;
}

interface PTMSchedulerProps {
    classId: string;
    teacherName?: string;
}

export function PTMScheduler({ classId, teacherName = 'Guru' }: PTMSchedulerProps) {
    const [sessions, setSessions] = useState<PTMSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ptm_sessions')
            .select('*')
            .eq('class_id', classId)
            .order('scheduled_at', { ascending: true });

        if (!error && data) setSessions(data);
        setLoading(false);
    }, [classId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return (
        <div className="gs-card p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500/15 rounded-xl flex items-center justify-center border border-sky-500/25">
                        <Calendar size={20} className="text-sky-400" />
                    </div>
                    <div>
                        <h3 className="gs-title text-lg">PTM Scheduler</h3>
                        <p className="gs-body text-xs mt-0.5">Jadwalkan & kirim undangan WhatsApp ke orang tua</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-black text-white transition-all"
                >
                    <Plus size={12} /> Buat Jadwal
                </button>
            </div>

            {/* Session List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-sky-400" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-slate-500 gap-2">
                    <Calendar size={32} className="opacity-40" />
                    <p className="text-sm">Belum ada jadwal PTM</p>
                    <p className="text-xs opacity-60">Klik "Buat Jadwal" untuk membuat sesi baru</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map(s => (
                        <PTMSessionCard
                            key={s.id}
                            session={s}
                            classId={classId}
                            teacherName={teacherName}
                            onStatusChange={fetchSessions}
                        />
                    ))}
                </div>
            )}

            {/* Create Form */}
            {showForm && (
                <CreatePTMModal
                    classId={classId}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => { setShowForm(false); fetchSessions(); }}
                />
            )}
        </div>
    );
}

// ─── Session Card ────────────────────────────────────────────
function PTMSessionCard({
    session, classId, teacherName, onStatusChange
}: {
    session: PTMSession;
    classId: string;
    teacherName: string;
    onStatusChange: () => void;
}) {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const scheduledDate = new Date(session.scheduled_at);
    const isPast = scheduledDate < new Date();

    const statusConfig = {
        upcoming: { color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/25', label: 'Akan Datang' },
        done: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25', label: 'Selesai' },
        cancelled: { color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/25', label: 'Dibatalkan' },
    };

    const cfg = statusConfig[session.status];

    const handleSendInvites = async () => {
        setSending(true);
        try {
            // Fetch parents for this class
            const { data: members } = await supabase
                .from('class_members')
                .select(`
                    users!inner(
                        full_name,
                        parent_phone,
                        parent_name
                    )
                `)
                .eq('class_id', classId)
                .eq('users.role', 'siswa');

            if (!members?.length) {
                toast.warning('Tidak ada data orang tua ditemukan');
                return;
            }

            const parents: Parent[] = members
                .map(m => {
                    const u = Array.isArray(m.users) ? m.users[0] : m.users;
                    return {
                        student_name: (u as any)?.full_name ?? '',
                        parent_name: (u as any)?.parent_name ?? 'Orang Tua',
                        parent_phone: (u as any)?.parent_phone ?? '',
                    };
                })
                .filter(p => p.parent_phone);

            if (parents.length === 0) {
                toast.warning('Tidak ada nomor WA orang tua yang tersimpan');
                return;
            }

            const dateStr = scheduledDate.toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });
            const timeStr = scheduledDate.toLocaleTimeString('id-ID', {
                hour: '2-digit', minute: '2-digit'
            });

            let sentCount = 0;
            for (const parent of parents) {
                const result = await whatsappService.notifyPTMInvite(
                    parent.parent_phone,
                    parent.parent_name,
                    parent.student_name,
                    dateStr,
                    timeStr,
                    teacherName
                );
                if (result.success) sentCount++;
                await new Promise(r => setTimeout(r, 300));
            }

            setSent(true);
            toast.success(`✅ ${sentCount} undangan PTM berhasil dikirim via WhatsApp!`);
        } catch {
            toast.error('Gagal mengirim undangan WA');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={`border rounded-xl p-4 space-y-3 ${cfg.bg}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-white">{session.title}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {scheduledDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {scheduledDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {session.location && (
                            <span>📍 {session.location}</span>
                        )}
                    </div>
                    {session.notes && (
                        <p className="text-xs text-slate-500 mt-1">{session.notes}</p>
                    )}
                </div>

                {session.status === 'upcoming' && !isPast && (
                    <button
                        onClick={handleSendInvites}
                        disabled={sending || sent}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                            sent
                                ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                                : 'bg-green-600 hover:bg-green-500 text-white'
                        } disabled:opacity-50`}
                        title="Kirim undangan WhatsApp ke semua orang tua"
                    >
                        {sending ? <Loader2 size={11} className="animate-spin" /> :
                         sent ? <CheckCircle2 size={11} /> :
                         <Send size={11} />}
                        {sending ? 'Kirim...' : sent ? 'Terkirim' : 'Kirim WA'}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Create PTM Modal ─────────────────────────────────────────
function CreatePTMModal({ classId, onClose, onSuccess }: {
    classId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        title: 'Pertemuan Orang Tua & Guru',
        scheduled_at: '',
        duration_minutes: 60,
        location: '',
        notes: '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.scheduled_at) return;
        setSaving(true);

        const { data: userData } = await supabase.auth.getUser();

        const { error } = await supabase.from('ptm_sessions').insert({
            class_id: classId,
            teacher_id: userData.user?.id,
            title: form.title,
            scheduled_at: form.scheduled_at,
            duration_minutes: form.duration_minutes,
            location: form.location || null,
            notes: form.notes || null,
            status: 'upcoming',
        });

        setSaving(false);
        if (error) {
            toast.error('Gagal membuat jadwal PTM');
        } else {
            toast.success('✅ Jadwal PTM berhasil dibuat!');
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">Buat Jadwal PTM</h3>
                    <button onClick={onClose} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-400">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Judul</label>
                        <input
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Tanggal & Waktu</label>
                            <input
                                type="datetime-local"
                                value={form.scheduled_at}
                                onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Durasi (menit)</label>
                            <input
                                type="number"
                                value={form.duration_minutes}
                                onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 60 }))}
                                min={15} max={240} step={15}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Lokasi / Link Meet</label>
                        <input
                            value={form.location}
                            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                            placeholder="Contoh: Ruang Kelas 7A / https://meet.google.com/xxx"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Catatan (Opsional)</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            rows={2}
                            placeholder="Agenda atau hal yang perlu dipersiapkan..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/40 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-sm font-bold text-slate-400 rounded-xl transition-all">
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !form.scheduled_at}
                            className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-sm font-black text-white rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                            {saving ? 'Menyimpan...' : 'Buat Jadwal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
