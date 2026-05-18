'use client';

import { useState } from 'react';
import { BarChart3, ArrowRight } from 'lucide-react';
import type { ClassOverview } from '@/hooks/useKepsekDashboard';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface Props {
    classes: ClassOverview[];
}

function MetricBar({ label, valueA, valueB, max, color }: { label: string; valueA: number; valueB: number; max: number; color: string }) {
    const pctA = Math.min((valueA / max) * 100, 100);
    const pctB = Math.min((valueB / max) * 100, 100);
    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-amber-400 w-10">{valueA}</span>
                    <div className="flex-1 h-3 bg-[#0F1014] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500/60 rounded-full transition-all duration-500" style={{ width: `${pctA}%` }} />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-400 w-10">{valueB}</span>
                    <div className="flex-1 h-3 bg-[#0F1014] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500/60 rounded-full transition-all duration-500" style={{ width: `${pctB}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ClassBenchmark({ classes }: Props) {
    const [classA, setClassA] = useState<string>(classes[0]?.id || '');
    const [classB, setClassB] = useState<string>(classes[1]?.id || '');

    const a = classes.find(c => c.id === classA);
    const b = classes.find(c => c.id === classB);

    if (classes.length < 2) {
        return (
            <div className="bg-[#181A20] border border-white/5 rounded-2xl p-8 text-center">
                <BarChart3 size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">Minimal 2 kelas untuk membandingkan.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <select value={classA} onChange={e => setClassA(e.target.value)}
                    className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none appearance-none w-full">
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                    <ArrowRight size={16} className="text-slate-500 rotate-90 sm:rotate-0" />
                </div>
                <select value={classB} onChange={e => setClassB(e.target.value)}
                    className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none appearance-none w-full">
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {a && b && (
                <div className="bg-[#181A20] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-sm font-bold text-amber-400">{a.name}</span>
                        </div>
                        <span className="text-xs text-slate-600">vs</span>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-sm font-bold text-blue-400">{b.name}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <MetricBar label="Rata-rata Nilai" valueA={a.avg_grade} valueB={b.avg_grade} max={100} color="amber" />
                        <MetricBar label="Kehadiran (%)" valueA={a.attendance_rate} valueB={b.attendance_rate} max={100} color="amber" />
                        <MetricBar label="Submission Rate (%)" valueA={a.submission_rate} valueB={b.submission_rate} max={100} color="amber" />
                        <MetricBar label="Jumlah Siswa" valueA={a.student_count} valueB={b.student_count} max={Math.max(a.student_count, b.student_count, 1)} color="amber" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                        <div className="text-center">
                            <ProgressRing value={a.avg_grade} color="#F59E0B" label={a.name} size={80} strokeWidth={6} />
                        </div>
                        <div className="text-center">
                            <ProgressRing value={b.avg_grade} color="#3B82F6" label={b.name} size={80} strokeWidth={6} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
