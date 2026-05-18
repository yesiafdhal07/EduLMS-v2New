'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, MessageSquare, Tag, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FeedbackTemplate {
    id: string;
    category: string;
    text: string;
    created_at: string;
}

interface Props {
    teacherId: string;
    onSelect?: (text: string) => void;
    compact?: boolean;
}

const CATEGORIES = [
    { key: 'bagus', label: 'Bagus', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { key: 'perbaikan', label: 'Perlu Perbaikan', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { key: 'revisi', label: 'Revisi', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { key: 'general', label: 'Umum', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
];

export function FeedbackBank({ teacherId, onSelect, compact }: Props) {
    const [templates, setTemplates] = useState<FeedbackTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newText, setNewText] = useState('');
    const [newCategory, setNewCategory] = useState('general');
    const [filter, setFilter] = useState('all');

    const fetchTemplates = useCallback(async () => {
        const { data } = await supabase
            .from('feedback_templates')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false });
        setTemplates((data || []) as FeedbackTemplate[]);
        setLoading(false);
    }, [teacherId]);

    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    const handleCreate = async () => {
        if (!newText.trim()) return;
        const { error } = await supabase.from('feedback_templates').insert({
            teacher_id: teacherId,
            category: newCategory,
            text: newText.trim(),
        });
        if (error) {
            toast.error('Gagal menyimpan template');
        } else {
            toast.success('Template disimpan');
            setNewText('');
            setShowForm(false);
            fetchTemplates();
        }
    };

    const handleDelete = async (id: string) => {
        await supabase.from('feedback_templates').delete().eq('id', id);
        toast.success('Template dihapus');
        fetchTemplates();
    };

    const filtered = filter === 'all' ? templates : templates.filter(t => t.category === filter);

    if (loading) {
        return <div className="animate-pulse bg-white/5 rounded-2xl h-32" />;
    }

    return (
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
            {!compact && (
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <MessageSquare size={18} className="text-indigo-400" />
                        Feedback Bank
                    </h3>
                    <button onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-500/30 transition-colors">
                        <Plus size={14} /> Tambah
                    </button>
                </div>
            )}

            {showForm && (
                <div className="bg-[#12141A] border border-white/5 rounded-xl p-4 space-y-3">
                    <textarea value={newText} onChange={e => setNewText(e.target.value)}
                        placeholder="Tulis template feedback..."
                        className="w-full bg-[#0F1014] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 text-sm resize-none h-20" />
                    <div className="flex items-center gap-2">
                        {CATEGORIES.map(cat => (
                            <button key={cat.key} onClick={() => setNewCategory(cat.key)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${newCategory === cat.key ? cat.color : 'bg-white/5 text-slate-500 border-transparent'}`}>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-slate-500 text-xs font-bold">Batal</button>
                        <button onClick={handleCreate} className="px-4 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-400 transition-colors">Simpan</button>
                    </div>
                </div>
            )}

            {!compact && (
                <div className="flex gap-1.5">
                    <button onClick={() => setFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${filter === 'all' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                        Semua
                    </button>
                    {CATEGORIES.map(cat => (
                        <button key={cat.key} onClick={() => setFilter(cat.key)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${filter === cat.key ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {filtered.map(t => {
                    const catInfo = CATEGORIES.find(c => c.key === t.category) || CATEGORIES[3];
                    return (
                        <div key={t.id} className="flex items-start gap-2 bg-white/[0.03] rounded-lg px-3 py-2.5 group hover:bg-white/[0.05] transition-colors">
                            <span className={`${catInfo.color} border px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 mt-0.5`}>
                                {catInfo.label}
                            </span>
                            <p className="text-xs text-slate-300 flex-1">{t.text}</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                {onSelect && (
                                    <button onClick={() => onSelect(t.text)} className="p-1 hover:bg-indigo-500/20 rounded text-indigo-400" title="Gunakan">
                                        <Copy size={12} />
                                    </button>
                                )}
                                {!compact && (
                                    <button onClick={() => handleDelete(t.id)} className="p-1 hover:bg-rose-500/20 rounded text-rose-400" title="Hapus">
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <p className="text-center text-slate-600 text-xs py-4">
                        {templates.length === 0 ? 'Belum ada template. Klik "Tambah" untuk membuat.' : 'Tidak ada template untuk kategori ini.'}
                    </p>
                )}
            </div>
        </div>
    );
}
