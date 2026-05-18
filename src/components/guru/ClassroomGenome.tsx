'use client';

import { useRef, useState } from 'react';
import { Dna, Camera, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';

// ============================================================
// CLASSROOM GENOME — USP #15
// Visual "DNA" of a class: grade distribution, attendance,
// and engagement in a single screenshot-worthy infographic.
// ============================================================

interface ClassroomGenomeProps {
    students: { id: string; name: string; avg: string; status: 'TUNTAS' | 'REMEDIAL' }[];
    stats: { avg: number; attendance: number; submissions: number };
    className?: string;
}

const GRADE_BANDS = [
    { label: 'A (≥85)', min: 85, max: 100, color: '#10b981', bg: 'bg-emerald-500' },
    { label: 'B (70-84)', min: 70, max: 84, color: '#6366f1', bg: 'bg-indigo-500' },
    { label: 'C (60-69)', min: 60, max: 69, color: '#f59e0b', bg: 'bg-amber-500' },
    { label: 'D (<60)', min: 0, max: 59, color: '#ef4444', bg: 'bg-rose-500' },
];

function getGradeBand(score: number) {
    return GRADE_BANDS.find(b => score >= b.min && score <= b.max) ?? GRADE_BANDS[3];
}

export function ClassroomGenome({ students, stats, className = 'Kelas' }: ClassroomGenomeProps) {
    const genomeRef = useRef<HTMLDivElement>(null);
    const [capturing, setCapturing] = useState(false);

    // Calculate distributions
    const gradeCounts = GRADE_BANDS.map(band => ({
        ...band,
        count: students.filter(s => {
            const avg = parseFloat(s.avg) || 0;
            return avg >= band.min && avg <= band.max;
        }).length,
    }));

    const total = students.length || 1;
    const tuntasCount = students.filter(s => s.status === 'TUNTAS').length;
    const tuntasRate = Math.round((tuntasCount / total) * 100);

    // Health score: weighted composite
    const healthScore = Math.round(
        (stats.avg * 0.4) + (stats.attendance * 0.35) + (stats.submissions * 0.25)
    );

    const healthColor =
        healthScore >= 80 ? '#10b981' :
        healthScore >= 65 ? '#f59e0b' : '#ef4444';

    const healthLabel =
        healthScore >= 80 ? 'Sehat' :
        healthScore >= 65 ? 'Perlu Perhatian' : 'Kritis';

    const handleCapture = async () => {
        if (capturing || !genomeRef.current) return;
        setCapturing(true);
        try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(genomeRef.current, {
                backgroundColor: '#0f172a',
                scale: 2,
            });
            const link = document.createElement('a');
            link.download = `ClassroomGenome_${className}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch {
            // html2canvas mungkin belum diinstall — fallback
            alert('Install html2canvas: npm install html2canvas');
        } finally {
            setCapturing(false);
        }
    };

    return (
        <div className="gs-card p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center border border-cyan-500/25">
                        <Dna size={20} className="text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="gs-title text-lg">Classroom Genome</h3>
                        <p className="gs-body text-xs mt-0.5">DNA visual kondisi kelas {className}</p>
                    </div>
                </div>
                <button
                    onClick={handleCapture}
                    disabled={capturing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all disabled:opacity-40"
                >
                    <Camera size={12} />
                    {capturing ? 'Menyimpan...' : 'Screenshot'}
                </button>
            </div>

            {/* Genome Visual */}
            <div ref={genomeRef} className="bg-[#0a0f1a] rounded-2xl p-5 space-y-5">
                {/* Health Score Ring */}
                <div className="flex items-center gap-5">
                    <div className="relative w-24 h-24 shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
                            <circle
                                cx="50" cy="50" r="40" fill="none"
                                stroke={healthColor}
                                strokeWidth="10"
                                strokeDasharray={`${(healthScore / 100) * 251.2} 251.2`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dasharray 1s ease' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-white">{healthScore}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Health</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Status Kelas</span>
                            <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ color: healthColor, backgroundColor: `${healthColor}22` }}>
                                {healthLabel}
                            </span>
                        </div>
                        {/* KPI Bars */}
                        {[
                            { label: 'Nilai Rata-rata', value: stats.avg, color: '#6366f1' },
                            { label: 'Kehadiran', value: stats.attendance, color: '#10b981' },
                            { label: 'Pengumpulan Tugas', value: stats.submissions, color: '#f59e0b' },
                        ].map(kpi => (
                            <div key={kpi.label}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-slate-500">{kpi.label}</span>
                                    <span className="text-[10px] font-black text-white">{kpi.value.toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${Math.min(kpi.value, 100)}%`, backgroundColor: kpi.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DNA Strand — Grade Distribution */}
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Distribusi Nilai</p>
                    <div className="flex items-end gap-1.5 h-20">
                        {gradeCounts.map(band => {
                            const heightPct = total > 0 ? (band.count / total) * 100 : 0;
                            return (
                                <div key={band.label} className="flex-1 flex flex-col items-center gap-1" title={`${band.label}: ${band.count} siswa`}>
                                    <span className="text-[9px] font-black text-white">{band.count}</span>
                                    <div className="w-full rounded-t-md transition-all duration-700 relative overflow-hidden" style={{ height: `${Math.max(heightPct * 0.6, 4)}px`, backgroundColor: band.color, opacity: 0.85 }}>
                                        {/* Shimmer */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                                    </div>
                                    <span className="text-[8px] text-slate-600 text-center leading-tight">{band.label.split(' ')[0]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Hexagon Stats */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        {
                            icon: <Users size={14} />,
                            value: `${total}`,
                            label: 'Total Siswa',
                            color: 'text-indigo-400',
                            bg: 'bg-indigo-500/10 border-indigo-500/20',
                        },
                        {
                            icon: tuntasRate >= 75 ? <TrendingUp size={14} /> : <TrendingDown size={14} />,
                            value: `${tuntasRate}%`,
                            label: 'Tuntas KKM',
                            color: tuntasRate >= 75 ? 'text-emerald-400' : 'text-rose-400',
                            bg: tuntasRate >= 75 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20',
                        },
                        {
                            icon: <Minus size={14} />,
                            value: `${students.filter(s => s.status === 'REMEDIAL').length}`,
                            label: 'Perlu Remedial',
                            color: 'text-amber-400',
                            bg: 'bg-amber-500/10 border-amber-500/20',
                        },
                    ].map(stat => (
                        <div key={stat.label} className={`border rounded-xl p-3 flex flex-col items-center gap-1 ${stat.bg}`}>
                            <span className={stat.color}>{stat.icon}</span>
                            <span className={`text-lg font-black ${stat.color}`}>{stat.value}</span>
                            <span className="text-[9px] text-slate-500 text-center leading-tight">{stat.label}</span>
                        </div>
                    ))}
                </div>

                <p className="text-[9px] text-slate-700 text-center">
                    Klolakelas • Classroom Genome™ • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
}
