'use client';

import { Search, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';
import { Spinner, ErrorBanner } from '@/components/ui';
import { TeacherStatsPanel } from '@/components/dashboard/TeacherStatsPanel';
import { KeaktifanGradeList } from '@/components/guru/KeaktifanGradeList';
import { toast } from 'sonner';

interface DashboardStudent {
    id: string;
    name: string;
    avg: string;
    status: 'TUNTAS' | 'REMEDIAL';
}

interface DashboardTabProps {
    stats: { avg: number; attendance: number; submissions: number };
    students: DashboardStudent[];
    loading: boolean;
    error?: string | null;
    onRetry?: () => void;
    onKeaktifan?: () => void;
    classId?: string | null;
}

export function DashboardTab({ stats, students, loading, error, onRetry, onKeaktifan, classId }: DashboardTabProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Error Banner */}
            {error && (
                <div className="mb-8">
                    <ErrorBanner message={error} onRetry={onRetry} />
                </div>
            )}

            {/* Teaching Stats Panel */}
            <div className="mb-14">
                <TeacherStatsPanel />
            </div>

            {/* Keaktifan Grades History (Dark theme version for guru) */}
            {classId && (
                <div className="mb-14">
                    <KeaktifanGradeList classId={classId} />
                </div>
            )}

            {/* Student Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-md">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Perkembangan Siswa</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1">Daftar siswa berdasarkan performa akademik terbaru.</p>
                    </div>
                    <div className="flex gap-4">
                        {onKeaktifan && (
                            <button
                                type="button"
                                onClick={onKeaktifan}
                                className="px-5 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                <Star size={18} />
                                Nilai Keaktifan
                            </button>
                        )}
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari siswa..."
                                aria-label="Cari siswa berdasarkan nama"
                                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left">
                        <thead className="bg-[#F8FAFC]/80 text-slate-400 text-[11px] font-black uppercase tracking-[0.25em]">
                            <tr>
                                <th className="px-10 py-6">Informasi Siswa</th>
                                <th className="px-10 py-6 text-center">Rerata Nilai</th>
                                <th className="px-10 py-6 text-center">Status</th>
                                <th className="px-10 py-6 text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-32 text-center"><Spinner text="Memuat Data Siswa..." /></td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan={4} className="p-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Belum Ada Data Siswa</td></tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="group hover:bg-slate-50/80 transition-all">
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Siswa Aktif</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-black text-slate-900 tracking-tighter">{student.avg}</span>
                                                <div className="w-12 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                    <div className={`h-full ${parseFloat(student.avg) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${student.avg}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-7 text-center">
                                            <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border-2 ${student.status === 'TUNTAS'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <button
                                                type="button"
                                                onClick={() => toast.info(`Detail Siswa: ${student.name}\nRerata: ${student.avg}\nStatus: ${student.status}`)}
                                                className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-none hover:shadow-xl group-hover:text-indigo-600"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
