import { Plus, Link as LinkIcon, FileText, ExternalLink } from 'lucide-react';
import { Material } from '@/types';

interface MaterialPanelProps {
    materials: Material[];
    onAddMaterial: () => void;
}

export function MaterialPanel({ materials, onAddMaterial }: MaterialPanelProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Action Card: Upload */}
            <button
                type="button"
                onClick={onAddMaterial}
                className="bg-white p-12 rounded-[3.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-slate-50 transition-all group cursor-pointer shadow-xl shadow-transparent hover:shadow-indigo-100 w-full"
            >
                <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
                    <Plus size={40} className="text-indigo-600" />
                </div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight">Kirim Materi Baru</h4>
                <p className="text-slate-400 text-sm mt-3 font-bold uppercase tracking-widest leading-relaxed">PDF • WORD • LINK</p>
            </button>

            {
                materials.map(m => (
                    <div key={m.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] group-hover:scale-150 transition-transform opacity-30"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner group-hover:rotate-12 transition-transform">
                                    {m.type === 'link' ? <LinkIcon size={28} /> : <FileText size={28} />}
                                </div>
                                <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                    {m.type}
                                </div>
                            </div>
                            <h4 className="font-black text-slate-900 text-xl mb-3 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{m.title}</h4>
                            <p className="text-slate-500 text-sm mb-10 font-medium line-clamp-2 leading-relaxed">{m.content || 'Akses modul pembelajaran terbaru di sini.'}</p>
                            <a
                                href={m.content_url}
                                target="_blank"
                                className="w-full py-5 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-600/30 text-slate-900 rounded-[2rem] font-black transition-all flex items-center justify-center gap-3"
                            >
                                <span className="uppercase text-xs tracking-widest">Buka Akses</span>
                                <ExternalLink size={18} />
                            </a>
                        </div>
                    </div>
                ))
            }
        </div >
    );
}
