'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Wallet, Plus, TrendingUp, TrendingDown, Loader2, X, Receipt, Users, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================
// KAS KELAS DIGITAL — USP #18
// Class treasury management: deposits, expenses, balance.
// Used by guru (full CRUD) and ortu (read-only).
// ============================================================

interface KasEntry {
    id: string;
    class_id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    recorded_by: string;
    created_at: string;
    recorder?: { full_name: string };
}

interface KasKelasProps {
    classId: string;
    isTeacher?: boolean;
}

function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export function KasKelas({ classId, isTeacher = false }: KasKelasProps) {
    const [entries, setEntries] = useState<KasEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('kas_kelas')
            .select('*, recorder:users!recorded_by(full_name)')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (!error && data) setEntries(data);
        setLoading(false);
    }, [classId]);

    useEffect(() => {
        fetchEntries();

        const channel = supabase
            .channel(`kas_${classId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'kas_kelas', filter: `class_id=eq.${classId}` },
                () => fetchEntries()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [classId, fetchEntries]);

    const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpense;

    const handleExport = () => {
        const csv = [
            'Tanggal,Jenis,Nominal,Keterangan',
            ...entries.map(e => [
                new Date(e.created_at).toLocaleDateString('id-ID'),
                e.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                e.amount,
                `"${e.description}"`,
            ].join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'kas-kelas.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="gs-card p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center border border-emerald-500/25">
                        <Wallet size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="gs-title text-lg">Kas Kelas</h3>
                        <p className="gs-body text-xs mt-0.5">Rekap keuangan kelas secara transparan</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExport} className="p-2 bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg transition-all" title="Export CSV">
                        <Download size={14} className="text-slate-400" />
                    </button>
                    {isTeacher && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-black text-white transition-all"
                        >
                            <Plus size={12} /> Catat
                        </button>
                    )}
                </div>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Saldo', value: balance, color: balance >= 0 ? 'text-emerald-400' : 'text-rose-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Pemasukan', value: totalIncome, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
                    { label: 'Pengeluaran', value: totalExpense, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                ].map(s => (
                    <div key={s.label} className={`border rounded-xl p-3 text-center ${s.bg}`}>
                        <p className={`text-sm font-black ${s.color}`}>{formatRp(s.value)}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Entries List */}
            {loading ? (
                <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-emerald-400" /></div>
            ) : entries.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-slate-500 gap-2">
                    <Receipt size={28} className="opacity-40" />
                    <p className="text-xs">Belum ada catatan kas</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                    {entries.map(e => (
                        <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] rounded-xl border border-white/5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                e.type === 'income' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                            }`}>
                                {e.type === 'income'
                                    ? <TrendingUp size={13} className="text-emerald-400" />
                                    : <TrendingDown size={13} className="text-rose-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{e.description}</p>
                                <p className="text-[10px] text-slate-600">{new Date(e.created_at).toLocaleDateString('id-ID')}</p>
                            </div>
                            <span className={`text-sm font-black shrink-0 ${e.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {e.type === 'income' ? '+' : '-'}{formatRp(e.amount)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <KasEntryModal
                    classId={classId}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => { setShowForm(false); fetchEntries(); }}
                />
            )}
        </div>
    );
}

// ─── Entry Form Modal ─────────────────────────────────────────
function KasEntryModal({ classId, onClose, onSuccess }: {
    classId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [type, setType] = useState<'income' | 'expense'>('income');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(amount.replace(/\D/g, ''));
        if (!num || !description.trim()) return;
        setSaving(true);

        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase.from('kas_kelas').insert({
            class_id: classId,
            type,
            amount: num,
            description: description.trim(),
            recorded_by: userData.user?.id,
        });

        setSaving(false);
        if (error) { toast.error('Gagal mencatat kas'); return; }
        toast.success(`✅ ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'} berhasil dicatat!`);
        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">Catat Transaksi</h3>
                    <button onClick={onClose} className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-400">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type toggle */}
                    <div className="flex bg-white/5 border border-white/8 rounded-xl overflow-hidden">
                        {(['income', 'expense'] as const).map(t => (
                            <button key={t} type="button" onClick={() => setType(t)}
                                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                                    type === t
                                        ? t === 'income' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                        : 'text-slate-500'
                                }`}>
                                {t === 'income' ? '+ Pemasukan' : '- Pengeluaran'}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Nominal (Rp)</label>
                        <input
                            type="text"
                            value={amount}
                            onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                            placeholder="Contoh: 50000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Keterangan</label>
                        <input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Contoh: Iuran mingguan, Beli spidol..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 text-sm font-bold text-slate-400 rounded-xl hover:bg-white/10 transition-all">Batal</button>
                        <button type="submit" disabled={saving || !amount || !description}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-black text-white rounded-xl transition-all flex items-center justify-center gap-2">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
