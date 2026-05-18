'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, Send, Loader2, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { whatsappService } from '@/lib/services/whatsapp.service';
import { toast } from 'sonner';

// ============================================================
// WA NOTIFICATION PANEL — USP #20
// Allows teacher to trigger WA notifications to parents:
// - Grade alerts (below threshold)
// - Attendance alerts (alpa/unauthorized)
// ============================================================

interface WANotifPanelProps {
    classId: string;
    className?: string;
}

type NotifMode = 'grade' | 'attendance';

export function WANotifPanel({ classId, className = 'Kelas' }: WANotifPanelProps) {
    const [mode, setMode] = useState<NotifMode>('grade');
    const [threshold, setThreshold] = useState(70);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ sent: number; failed: number; skipped: number } | null>(null);
    const [hasKey] = useState(() =>
        !!(typeof window !== 'undefined' &&
           (process.env.FONNTE_API_KEY ?? process.env.NEXT_PUBLIC_FONNTE_API_KEY))
    );

    const handleSendGradeAlerts = useCallback(async () => {
        setSending(true);
        setResult(null);

        try {
            // Fetch students below threshold
            const { data: members } = await supabase
                .from('class_members')
                .select(`
                    users!inner(
                        id, full_name, parent_phone, parent_name,
                        grades(score, type, created_at)
                    )
                `)
                .eq('class_id', classId)
                .eq('users.role', 'siswa');

            if (!members?.length) {
                toast.warning('Tidak ada siswa ditemukan');
                setSending(false);
                return;
            }

            let sent = 0, failed = 0, skipped = 0;

            for (const m of members) {
                const user = Array.isArray(m.users) ? m.users[0] : m.users;
                const phone = (user as any)?.parent_phone;
                const studentName = (user as any)?.full_name ?? 'Siswa';
                const parentName = (user as any)?.parent_name ?? 'Orang Tua';

                if (!phone) { skipped++; continue; }

                const grades: { score: number; type: string }[] = (user as any)?.grades ?? [];
                if (!grades.length) { skipped++; continue; }

                const avgScore = grades.reduce((a, g) => a + (g.score ?? 0), 0) / grades.length;
                if (avgScore >= threshold) { skipped++; continue; }

                // Find worst subject
                const sorted = [...grades].sort((a, b) => a.score - b.score);
                const worst = sorted[0];

                const r = await whatsappService.notifyGradeAlert(
                    phone, studentName, worst.type, worst.score, worst.type
                );
                if (r.success) sent++;
                else failed++;
                await new Promise(res => setTimeout(res, 350));
            }

            setResult({ sent, failed, skipped });
            if (sent > 0) toast.success(`✅ ${sent} notifikasi nilai berhasil dikirim!`);
            else toast.info('Tidak ada siswa di bawah threshold dengan nomor WA orang tua');
        } catch {
            toast.error('Terjadi kesalahan saat mengirim notifikasi');
        } finally {
            setSending(false);
        }
    }, [classId, threshold]);

    const handleSendAttendanceAlerts = useCallback(async () => {
        setSending(true);
        setResult(null);

        try {
            // Get today's attendance — alpa only
            const today = new Date().toISOString().split('T')[0];

            const { data: absences } = await supabase
                .from('attendance')
                .select(`
                    status,
                    users!inner(full_name, parent_phone, parent_name)
                `)
                .eq('class_id', classId)
                .eq('status', 'alpa')
                .gte('created_at', `${today}T00:00:00`)
                .lte('created_at', `${today}T23:59:59`);

            if (!absences?.length) {
                toast.info('Tidak ada siswa alpa hari ini');
                setSending(false);
                return;
            }

            let sent = 0, failed = 0, skipped = 0;
            const dateStr = new Date().toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long'
            });

            for (const abs of absences) {
                const user = Array.isArray(abs.users) ? abs.users[0] : abs.users;
                const phone = (user as any)?.parent_phone;
                const studentName = (user as any)?.full_name ?? 'Siswa';

                if (!phone) { skipped++; continue; }

                const r = await whatsappService.notifyAttendance(
                    phone, studentName, 'alpa', dateStr, className
                );
                if (r.success) sent++;
                else failed++;
                await new Promise(res => setTimeout(res, 350));
            }

            setResult({ sent, failed, skipped });
            if (sent > 0) toast.success(`✅ ${sent} notifikasi absensi terkirim!`);
        } catch {
            toast.error('Terjadi kesalahan saat mengirim notifikasi absensi');
        } finally {
            setSending(false);
        }
    }, [classId, className]);

    return (
        <div className="gs-card p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center border border-green-500/25">
                    <MessageCircle size={20} className="text-green-400" />
                </div>
                <div>
                    <h3 className="gs-title text-lg">Notifikasi WhatsApp</h3>
                    <p className="gs-body text-xs mt-0.5">Kirim notif otomatis ke orang tua siswa</p>
                </div>
                {!hasKey && (
                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/25 rounded-lg">
                        <AlertTriangle size={11} className="text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-bold">DEV MODE</span>
                    </div>
                )}
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center bg-white/5 border border-white/8 rounded-xl overflow-hidden">
                {(['grade', 'attendance'] as NotifMode[]).map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                            mode === m ? 'bg-green-600 text-white' : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        {m === 'grade' ? '📊 Alert Nilai' : '📋 Alert Absensi'}
                    </button>
                ))}
            </div>

            {/* Config */}
            {mode === 'grade' && (
                <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        Threshold Nilai (kirim jika nilai rata-rata di bawah:)
                    </label>
                    <div className="flex items-center gap-3 mt-2">
                        <input
                            type="range"
                            min={50} max={90} step={5}
                            value={threshold}
                            onChange={e => setThreshold(parseInt(e.target.value))}
                            className="flex-1 accent-green-500"
                        />
                        <span className="text-sm font-black text-white w-8 text-right">{threshold}</span>
                    </div>
                </div>
            )}

            {mode === 'attendance' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2">
                    <Users size={14} className="text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-300">
                        Akan mengirim WA ke orang tua siswa yang <span className="font-black">ALPA</span> hari ini
                    </p>
                </div>
            )}

            {/* Send Button */}
            <button
                onClick={mode === 'grade' ? handleSendGradeAlerts : handleSendAttendanceAlerts}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl text-sm font-black text-white transition-all"
            >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? 'Mengirim...' : `Kirim Notifikasi ${mode === 'grade' ? 'Nilai' : 'Absensi'}`}
            </button>

            {/* Result */}
            {result && (
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: 'Terkirim', value: result.sent, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                        { label: 'Gagal', value: result.failed, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                        { label: 'Skip', value: result.skipped, color: 'text-slate-400', bg: 'bg-white/5 border-white/10' },
                    ].map(r => (
                        <div key={r.label} className={`border rounded-xl p-2 text-center ${r.bg}`}>
                            <p className={`text-lg font-black ${r.color}`}>{r.value}</p>
                            <p className="text-[10px] text-slate-500">{r.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
