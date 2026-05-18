'use client';

import { useState } from 'react';
import { Grid3X3, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TeacherInfo } from '@/hooks/useKepsekDashboard';

interface Props {
    teachers: TeacherInfo[];
}

type MetricKey = 'grading_completion' | 'class_count' | 'student_count';

const METRICS: { key: MetricKey; label: string }[] = [
    { key: 'grading_completion', label: 'Penyelesaian Penilaian (%)' },
    { key: 'class_count', label: 'Jumlah Kelas' },
    { key: 'student_count', label: 'Jumlah Siswa' },
];

function getPerformanceTier(value: number, metric: MetricKey): 'high' | 'mid' | 'low' {
    if (metric === 'grading_completion') {
        if (value >= 80) return 'high';
        if (value >= 50) return 'mid';
        return 'low';
    }
    return 'mid';
}

const TIER_COLORS = {
    high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    mid: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    low: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
};

const TIER_ICONS = {
    high: TrendingUp,
    mid: Minus,
    low: TrendingDown,
};

export function TeacherMatrix({ teachers }: Props) {
    const [selectedMetric, setSelectedMetric] = useState<MetricKey>('grading_completion');
    const [sortAsc, setSortAsc] = useState(false);

    const sorted = [...teachers].sort((a, b) => {
        const diff = (a[selectedMetric] as number) - (b[selectedMetric] as number);
        return sortAsc ? diff : -diff;
    });

    const avg = teachers.length > 0
        ? Math.round(teachers.reduce((s, t) => s + (t[selectedMetric] as number), 0) / teachers.length)
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Grid3X3 size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Institutional Analysis</span>
                    </div>
                    <h3 className="text-2xl font-fraunces font-black text-white">Teacher Performance Matrix</h3>
                </div>
                
                <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
                    {METRICS.map(m => (
                        <button
                            key={m.key}
                            onClick={() => setSelectedMetric(m.key)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                selectedMetric === m.key 
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {m.label.split(' ')[0]}
                        </button>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button 
                        onClick={() => setSortAsc(!sortAsc)}
                        className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                        <ChevronDown size={14} className={`transition-transform duration-300 ${sortAsc ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Matrix Board */}
            <div className="universe-card p-6 md:p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Average</span>
                        <p className="text-3xl font-fraunces text-white">
                            {avg}<span className="text-sm font-sans text-slate-500 ml-1">{selectedMetric === 'grading_completion' ? '%' : ' Units'}</span>
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {(['high', 'mid', 'low'] as const).map(tier => (
                            <div key={tier} className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">
                                    {tier === 'high' ? 'Optimal' : tier === 'mid' ? 'Acceptable' : 'Critical'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${tier === 'high' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : tier === 'mid' ? 'bg-amber-400' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                    <span className="text-xs font-bold text-slate-400 uppercase">
                                        {teachers.filter(t => getPerformanceTier(t[selectedMetric] as number, selectedMetric) === tier).length}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {sorted.map(teacher => {
                        const val = teacher[selectedMetric] as number;
                        const tier = getPerformanceTier(val, selectedMetric);
                        const TierIcon = TIER_ICONS[tier];
                        const maxVal = selectedMetric === 'grading_completion' ? 100 : Math.max(...teachers.map(t => t[selectedMetric] as number), 1);
                        const barWidth = Math.min((val / maxVal) * 100, 100);

                        return (
                            <div key={teacher.id} className="group relative flex items-center gap-6 p-3 rounded-2xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/5">
                                <div className="relative shrink-0">
                                    <div className={`w-11 h-11 rounded-xl ${tier === 'high' ? 'bg-emerald-500/10' : tier === 'mid' ? 'bg-amber-500/10' : 'bg-rose-500/10'} border border-white/5 flex items-center justify-center text-white font-fraunces text-lg shadow-inner`}>
                                        {teacher.full_name.charAt(0)}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-[#0A0B10] flex items-center justify-center ${TIER_COLORS[tier]} scale-90`}>
                                        <TierIcon size={10} strokeWidth={3} />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold text-white truncate tracking-tight">{teacher.full_name}</p>
                                        <span className={`text-[10px] font-black tracking-widest ${tier === 'high' ? 'text-emerald-400' : tier === 'mid' ? 'text-amber-400' : 'text-rose-400'}`}>
                                            {val}{selectedMetric === 'grading_completion' ? '%' : ''}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                                                tier === 'high' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 
                                                tier === 'mid' ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 
                                                'bg-gradient-to-r from-rose-600 to-rose-400'
                                            }`}
                                            style={{ width: `${barWidth}%` }}
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {teachers.length === 0 && (
                <div className="text-center py-20 universe-card flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-white/[0.02] rounded-3xl flex items-center justify-center text-slate-700 border border-white/5">
                        <Grid3X3 size={32} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-white font-fraunces text-lg">No Faculty Data</p>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Teacher Matrix Initialization</p>
                    </div>
                </div>
            )}
        </div>
    );
}
