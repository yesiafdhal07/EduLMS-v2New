import { Plus, Link as LinkIcon, FileText, ExternalLink } from 'lucide-react';
import { Material } from '@/types';

interface MaterialPanelProps {
    materials: Material[];
    onAddMaterial: () => void;
}

export function MaterialPanel({ materials, onAddMaterial }: MaterialPanelProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 mb-8 px-1">
                <div>
                    <h3 className="gs-title text-2xl">Bahan Ajar</h3>
                    <p className="gs-body text-xs mt-1">Distribusikan modul pembelajaran dan sumber belajar</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Action Card: Upload */}
                <button
                    type="button"
                    onClick={onAddMaterial}
                    className="gs-card border-dashed p-8 flex flex-col items-center justify-center text-center hover:border-[var(--guru-accent)]/50 hover:bg-white/[0.05] transition-all group cursor-pointer min-h-[280px] w-full"
                >
                    <div className="w-16 h-16 bg-[var(--guru-accent-soft)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--guru-border-accent)] group-hover:scale-110 transition-transform duration-500">
                        <Plus size={32} className="text-[var(--guru-accent-text)]" />
                    </div>
                    <h4 className="gs-title text-lg">Tambah Materi</h4>
                    <p className="gs-body text-[10px] mt-2 uppercase tracking-widest font-bold">PDF • CLOUD • WEBLINK</p>
                </button>

                {
                    materials.length === 0 ? (
                        <div className="gs-card p-8 flex flex-col items-center justify-center text-center border-dashed min-h-[280px] col-span-1 md:col-span-2">
                            <FileText size={36} className="text-[var(--guru-text-ghost)] mb-4" />
                            <h4 className="gs-title text-lg mb-2">Belum Ada Materi</h4>
                            <p className="gs-body text-xs max-w-xs">Upload materi pertama Anda menggunakan tombol di samping. Mendukung file PDF, link cloud, dan weblink.</p>
                        </div>
                    ) : (
                    materials.map(m => (
                        <div key={m.id} className="gs-card p-8 group overflow-hidden relative flex flex-col justify-between hover:border-[var(--guru-accent)]/30 transition-all duration-500 hover:-translate-y-1">
                            {/* Decorative background glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--guru-accent)]/5 blur-[60px] rounded-full group-hover:bg-[var(--guru-accent)]/10 transition-all duration-700"></div>

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center text-[var(--guru-accent-text)] border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        {m.type === 'link' ? <LinkIcon size={22} /> : <FileText size={22} />}
                                    </div>
                                    <div className="gs-badge gs-badge-accent">
                                        {m.type}
                                    </div>
                                </div>
                                
                                <div className="flex-1 mb-6">
                                    <h4 className="gs-title text-lg mb-2 group-hover:text-[var(--guru-accent-text)] transition-colors line-clamp-1">{m.title}</h4>
                                    <p className="gs-body text-xs leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors">{m.content || 'Modul pembelajaran standar yang didistribusikan ke kelas untuk akses langsung siswa.'}</p>
                                </div>

                                <a
                                    href={m.content_url}
                                    target="_blank"
                                    className="w-full py-3.5 bg-white/[0.03] hover:bg-[var(--guru-accent)] text-white rounded-xl font-black transition-all flex items-center justify-center gap-3 border border-white/10 group-hover:border-transparent text-[10px] uppercase tracking-widest active:scale-95"
                                >
                                    <span>Buka Materi</span>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    ))
                    )
                }
            </div>
        </div>
    );
}
