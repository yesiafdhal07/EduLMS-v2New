'use client';

import { useState } from 'react';
import { 
    Calendar, Sparkles, Wand2, Download, 
    CheckCircle2, AlertCircle, Loader2, Table as TableIcon
} from 'lucide-react';
import { schedulerService } from '@/lib/services/scheduler.service';

export function AIScheduleGenerator({ schoolId }: { schoolId: string }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [schedule, setSchedule] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const result = await schedulerService.generateSmartSchedule(schoolId);
            if (result && result.schedule) {
                setSchedule(result.schedule);
            } else if (result && Array.isArray(result)) {
                setSchedule(result);
            } else {
                throw new Error("Format jadwal tidak valid");
            }
        } catch (err) {
            setError("Gagal membuat jadwal otomatis. Cek API Key atau data sekolah.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-8 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-violet-400">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Smart Scheduling AI</span>
                    </div>
                    <h3 className="text-3xl font-black text-white font-fraunces tracking-tight">
                        Penjadwalan <span className="text-violet-400">Otomatis</span>
                    </h3>
                    <p className="text-slate-500 text-sm font-medium">
                        Susun jadwal pelajaran mingguan yang optimal untuk semua kelas dalam hitungan detik.
                    </p>
                </div>
                
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-8 py-4 bg-violet-600 text-white font-black rounded-2xl shadow-xl shadow-violet-600/20 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                    {isGenerating ? 'MENYUSUN...' : 'GENERATE JADWAL'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-bold">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {schedule ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">Jadwal Berhasil Disusun</span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                            <Download size={14} />
                            Unduh PDF
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-[2rem] border border-white/5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hari</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kelas</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mata Pelajaran</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Guru</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.slice(0, 10).map((item, idx) => (
                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-white">{item.day}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-400">{item.time}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase">
                                                {item.class_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-white">{item.subject_name}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{item.teacher_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center opacity-30">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-slate-400">
                        <TableIcon size={48} />
                    </div>
                    <div className="max-w-xs">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Belum Ada Jadwal</p>
                        <p className="text-xs font-medium text-slate-600 mt-2">Gunakan tombol Generate di atas untuk menyusun jadwal menggunakan AI.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
