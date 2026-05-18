'use client';

import { School, Users, BookOpen, GraduationCap, Shield } from 'lucide-react';
import { useCountUp } from './AdminToolkit';
import { SchoolMapView } from './SchoolMapView';

interface AdminStats {
    totalSchools: number;
    totalGuru: number;
    totalSiswa: number;
    totalKepsek: number;
    totalClasses: number;
    schools: any[];
}

const statCards = [
    { key: 'totalSchools', label: 'Total Sekolah', icon: School, color: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/20', accent: 'bg-rose-500/10 text-rose-400' },
    { key: 'totalGuru', label: 'Total Guru', icon: BookOpen, color: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/20', accent: 'bg-indigo-500/10 text-indigo-400' },
    { key: 'totalSiswa', label: 'Total Siswa', icon: GraduationCap, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', accent: 'bg-emerald-500/10 text-emerald-400' },
    { key: 'totalKepsek', label: 'Kepala Sekolah', icon: Shield, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', accent: 'bg-amber-500/10 text-amber-400' },
    { key: 'totalClasses', label: 'Total Kelas', icon: Users, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20', accent: 'bg-cyan-500/10 text-cyan-400' },
] as const;

function AnimatedStat({ value, delay }: { value: number; delay: number }) {
    const animated = useCountUp(value, 1200 + delay * 100);
    return (
        <span className="mc-mono mc-count-shimmer text-3xl font-black">
            {animated.toLocaleString('id-ID')}
        </span>
    );
}

export function AdminOverview({ stats }: { stats: AdminStats }) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mc-stagger">
                {statCards.map(({ key, label, icon: Icon, color, shadow }, index) => (
                    <div key={key} className="mc-surface mc-glow p-5 group hover:border-white/10 transition-all">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${shadow} mb-4 group-hover:scale-105 transition-transform`}>
                            <Icon size={20} className="text-white" />
                        </div>
                        <AnimatedStat value={stats[key as keyof AdminStats] as number} delay={index} />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 mc-mono">{label}</p>
                    </div>
                ))}
            </div>

            {/* School Map View - Sprint 4 */}
            <div className="mc-surface p-6">
                <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2">
                    <School className="text-indigo-400" size={16} />
                    Geografi Persebaran Sekolah
                </h3>
                <SchoolMapView schools={stats.schools || []} />
            </div>
        </div>
    );
}
