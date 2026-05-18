'use client';

import { BookOpen, Users, Mail, CheckCircle, Clock } from 'lucide-react';
import type { TeacherInfo } from '@/hooks/useKepsekDashboard';
import { ProgressRing } from '@/components/ui/ProgressRing';

export function TeacherMonitoring({ teachers }: { teachers: TeacherInfo[] }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map(teacher => (
                    <div key={teacher.id} className="bg-[#181A20] border border-white/5 rounded-2xl p-5 hover:border-amber-500/20 transition-all group">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-black text-lg">
                                {teacher.full_name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">{teacher.full_name}</p>
                                <p className="text-slate-500 text-xs flex items-center gap-1 truncate">
                                    <Mail size={10} /> {teacher.email}
                                </p>
                            </div>
                            <ProgressRing
                                value={teacher.grading_completion}
                                color={teacher.grading_completion >= 80 ? '#10B981' : teacher.grading_completion >= 50 ? '#F59E0B' : '#F43F5E'}
                                size={44}
                                strokeWidth={3}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-[#0F1014] rounded-xl p-3 text-center">
                                <BookOpen size={12} className="text-indigo-400 mx-auto mb-1" />
                                <p className="text-white font-black">{teacher.class_count}</p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase">Kelas</p>
                            </div>
                            <div className="bg-[#0F1014] rounded-xl p-3 text-center">
                                <Users size={12} className="text-emerald-400 mx-auto mb-1" />
                                <p className="text-white font-black">{teacher.student_count}</p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase">Siswa</p>
                            </div>
                            <div className="bg-[#0F1014] rounded-xl p-3 text-center">
                                <CheckCircle size={12} className="text-amber-400 mx-auto mb-1" />
                                <p className="text-white font-black">{teacher.grading_completion}%</p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase">Dinilai</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {teachers.length === 0 && (
                <div className="text-center py-16 bg-[#181A20] border border-white/5 rounded-2xl">
                    <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Belum ada guru di sekolah ini.</p>
                </div>
            )}
        </div>
    );
}
