'use client';

import { Users, Plus, ChevronRight } from 'lucide-react';
import { ClassData } from '@/types';

interface ClassTabProps {
    classes: ClassData[];
    onAddClass: () => void;
    onSelectClass: (classId: string) => void;
    onEditClass: (classId: string, newName: string) => void;
    onDeleteClass: (classId: string) => void;
}

export function ClassTab({ classes, onAddClass, onSelectClass, onEditClass, onDeleteClass }: ClassTabProps) {
    const handleEdit = async (e: React.MouseEvent, id: string, oldName: string) => {
        e.stopPropagation();
        const newName = window.prompt("Masukkan nama kelas baru:", oldName);
        if (newName && newName.trim() !== oldName) {
            await onEditClass(id, newName);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Apakah Anda yakin ingin menghapus kelas ini? Semua data siswa dan nilai akan terhapus.")) {
            await onDeleteClass(id);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Action Card: Tambah Kelas */}
            <div
                onClick={onAddClass}
                className="bg-white p-12 rounded-[3.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-slate-50 transition-all group cursor-pointer shadow-xl shadow-transparent hover:shadow-indigo-100 h-[320px]"
            >
                <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
                    <Plus size={40} className="text-indigo-600" />
                </div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight uppercase">Tambah Kelas</h4>
                <p className="text-slate-400 text-sm mt-3 font-bold uppercase tracking-widest leading-relaxed">Kelola Siswa Baru</p>
            </div>

            {/* Existing Classes */}
            {classes.map(c => (
                <div key={c.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative h-[320px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] group-hover:scale-150 transition-transform opacity-30"></div>

                    {/* Action Buttons */}
                    <div className="absolute top-8 right-8 flex gap-2 z-20">
                        <button
                            type="button"
                            onClick={(e) => handleEdit(e, c.id, c.name)}
                            className="w-10 h-10 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                            title="Edit Kelas"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleDelete(e, c.id)}
                            className="w-10 h-10 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title="Hapus Kelas"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-12 transition-transform mb-8">
                                <Users size={28} />
                            </div>
                            <h4 className="font-black text-slate-900 text-2xl mb-1 tracking-tight group-hover:text-indigo-600 transition-colors uppercase truncate pr-16">{c.name}</h4>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Aktif Sejak {new Date(c.created_at || new Date()).toLocaleDateString('id-ID')}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onSelectClass(c.id)}
                            className="w-full py-5 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-3"
                        >
                            <span className="uppercase text-xs tracking-widest">Detail Kelas</span>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
