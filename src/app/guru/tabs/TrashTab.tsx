'use client';

import { useTrash, TrashType } from '@/hooks/useTrash';
import { Trash2, RotateCcw, AlertTriangle, Box, FileText, BookOpen, Clock } from 'lucide-react';

interface TrashTabProps {
    userId?: string;
}

export function TrashTab({ userId }: TrashTabProps) {
    const { trashItems, isLoading, restoreItem, deletePermanent } = useTrash(userId);

    const getIcon = (type: TrashType) => {
        switch (type) {
            case 'class': return <Box size={20} className="text-purple-400" />;
            case 'assignment': return <FileText size={20} className="text-indigo-400" />;
            case 'material': return <BookOpen size={20} className="text-emerald-400" />;
            default: return <Trash2 size={20} />;
        }
    };

    const getLabel = (type: TrashType) => {
        switch (type) {
            case 'class': return { text: 'KELAS', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
            case 'assignment': return { text: 'TUGAS', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
            case 'material': return { text: 'MATERI', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
            default: return { text: 'ITEM', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
        }
    };

    const handleRestore = (id: string, type: TrashType) => {
        if (window.confirm('Pulihkan data ini? Data akan kembali muncul di dashboard.')) {
            restoreItem({ id, type });
        }
    };

    const handlePermanentDelete = (id: string, type: TrashType) => {
        if (window.confirm('PERINGATAN: Hapus permanen? Data TIDAK BISA DIKEMBALIKAN lagi!')) {
            deletePermanent({ id, type });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 mb-8 flex items-start gap-4">
                <div className="p-3 bg-rose-500/20 rounded-2xl">
                    <AlertTriangle size={32} className="text-rose-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-rose-100 mb-2">Tong Sampah (Trash Bin)</h3>
                    <p className="text-rose-200/70 text-sm leading-relaxed max-w-2xl">
                        Item yang dihapus akan disimpan di sini dan disembunyikan dari dashboard. 
                        Anda dapat memulihkannya kapan saja, atau menghapusnya secara permanen.
                    </p>
                </div>
            </div>

            {trashItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-12 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-500">
                        <Trash2 size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Tong Sampah Kosong</h3>
                    <p className="text-slate-400">Tidak ada item yang dihapus.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {trashItems.map((item) => {
                        const label = getLabel(item.type);
                        return (
                            <div key={item.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/10 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black tracking-widest ${label.color}`}>
                                                {label.text}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                                <Clock size={12} />
                                                Deleted: {new Date(item.deleted_at).toLocaleDateString('id-ID')} {new Date(item.deleted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                                        {item.description && (
                                            <p className="text-slate-400 text-sm line-clamp-1">{item.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:border-l md:border-white/10 md:pl-6 md:ml-auto">
                                    <button
                                        onClick={() => handleRestore(item.id, item.type)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-emerald-500/30"
                                    >
                                        <RotateCcw size={16} />
                                        Pulihkan
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDelete(item.id, item.type)}
                                        className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-rose-500/20"
                                    >
                                        <Trash2 size={16} />
                                        Hapus Permanen
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
