'use client';

import { useState } from 'react';
import { Users, Settings, Copy, Plus, MoreVertical, Search, Check, Trash2, Upload } from 'lucide-react';
import type { ClassData } from '@/types';
import { toast } from 'sonner';

type Class = ClassData & { description?: string; code?: string };

interface ManajemenKelasTabProps {
    classes: Class[];
    onSelectClass: (id: string) => void;
    onCreateClass: () => void;
    onBulkImport: (id: string) => void;
}

export function ManajemenKelasTab({ classes, onSelectClass, onCreateClass, onBulkImport }: ManajemenKelasTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(code);
        toast.success('Access code copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredClasses = (classes || []).filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h2 className="gs-title text-3xl">Daftar Kelas</h2>
                    <p className="gs-label mt-2">Kelola kelas dan wilayah akademik Anda</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-72">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari kelas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 gs-input text-sm"
                        />
                    </div>

                    <button 
                        onClick={onCreateClass}
                        className="gs-btn-primary px-6 py-3 gap-3 text-sm uppercase tracking-widest group whitespace-nowrap"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        Tambah Kelas
                    </button>
                </div>
            </div>

            {classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[450px] gs-card p-12 text-center gs-glow">
                    <div className="w-24 h-24 bg-[var(--guru-accent-soft)] rounded-3xl flex items-center justify-center mb-8 border border-[var(--guru-border-accent)] relative z-10">
                        <Users size={44} className="text-indigo-400" />
                    </div>
                    <h3 className="gs-title text-3xl mb-4 relative z-10">Belum Ada Kelas</h3>
                    <p className="gs-body max-w-sm mb-10 text-sm leading-relaxed relative z-10">Anda belum membuat kelas apapun. Buat kelas pertama Anda untuk mulai mengelola siswa dan performa akademik.</p>
                    <button 
                        onClick={onCreateClass}
                        className="gs-btn-primary px-10 py-4 text-sm uppercase tracking-widest relative z-10"
                    >
                        Buat Kelas Pertama
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredClasses.map((cls) => (
                        <div key={cls.id} className="group relative gs-card-elevated p-8 hover:border-[var(--guru-border-accent)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-700"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-2xl font-black text-white tracking-tighter">{cls.name.charAt(0)}</span>
                                </div>
                                <button className="p-2.5 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-white/5">
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <div className="flex-1 relative z-10">
                                <h4 className="gs-title text-xl mb-2 group-hover:text-[var(--guru-accent-text)] transition-colors line-clamp-1">{cls.name}</h4>
                                <p className="text-xs text-[var(--guru-text-muted)] font-bold leading-relaxed line-clamp-2 min-h-[40px]">{cls.description || 'Belum ada deskripsi untuk kelas ini.'}</p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 space-y-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className="gs-label">Kode Kelas</span>
                                    <div 
                                        onClick={() => handleCopyCode(cls.code || '')}
                                        className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 rounded-xl cursor-pointer transition-all border border-white/5 group/code"
                                    >
                                        <span className="gs-mono text-sm text-[var(--guru-accent-text)]">{cls.code}</span>
                                        {copiedId === cls.code ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-600 group-hover/code:text-slate-400 transition-colors" />}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => onSelectClass(cls.id)}
                                        className="flex-[2] bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white font-black py-3 rounded-xl border border-indigo-500/20 transition-all text-[10px] uppercase tracking-widest"
                                    >
                                        Kelola
                                    </button>
                                    <button 
                                        onClick={() => onBulkImport(cls.id)}
                                        className="flex-1 bg-[var(--guru-surface-hover)] hover:bg-[var(--guru-surface-active)] text-white font-black py-3 rounded-xl border border-[var(--guru-border-default)] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                        title="Import Siswa"
                                    >
                                        <Upload size={14} /> Import
                                    </button>
                                    <button 
                                        className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl transition-all"
                                        title="Hapus Kelas"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
