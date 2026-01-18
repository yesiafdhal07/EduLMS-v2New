import { FileText, Layers, ExternalLink } from 'lucide-react';
import { Material } from '@/types';

interface StudentMaterialsPanelProps {
    materials: Material[];
}

export function StudentMaterialsPanel({ materials }: StudentMaterialsPanelProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {materials.map(m => (
                <div key={m.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[4rem] group-hover:scale-150 transition-transform opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform ${m.type === 'file' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                }`}>
                                {m.type === 'file' ? <FileText size={28} /> : <Layers size={28} />}
                            </div>
                            <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                {m.type}
                            </div>
                        </div>
                        <h4 className="font-black text-slate-900 text-xl mb-3 tracking-tight group-hover:text-emerald-600 transition-colors uppercase">{m.title}</h4>
                        <p className="text-slate-500 text-sm mb-10 font-medium line-clamp-2 leading-relaxed">{m.content || 'Akses modul pembelajaran terbaru di sini.'}</p>
                        <a
                            href={m.content_url}
                            target="_blank"
                            className="w-full py-5 bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-xl group-hover:shadow-emerald-500/30 text-slate-900 rounded-[2rem] font-black transition-all flex items-center justify-center gap-3"
                        >
                            <span className="uppercase text-xs tracking-widest">Buka Akses</span>
                            <ExternalLink size={18} />
                        </a>
                    </div>
                </div>
            ))}

            {materials.length === 0 && (
                <div className="col-span-full bg-white p-16 rounded-[3rem] border border-slate-100 shadow-xl text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Layers size={32} className="text-emerald-500" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada materi yang dibagikan guru</p>
                </div>
            )}
        </div>
    );
}
