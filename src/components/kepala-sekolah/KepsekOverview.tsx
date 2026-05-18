'use client';

import { Users, BookOpen, GraduationCap, TrendingUp, BarChart3, ClipboardCheck, Calendar } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import type { KepsekStats } from '@/hooks/useKepsekDashboard';

export function KepsekOverview({ stats, schoolName }: { stats: KepsekStats; schoolName: string }) {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <BarChart3 size={28} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest">Executive Suite</p>
                        <h2 className="text-2xl font-black text-white">{schoolName}</h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard
                    label="Guru Aktif"
                    value={stats.totalGuru}
                    icon={<BookOpen size={20} />}
                    accentColor="#F59E0B"
                />
                <KPICard
                    label="Total Siswa"
                    value={stats.totalSiswa}
                    icon={<GraduationCap size={20} />}
                    accentColor="#F59E0B"
                />
                <KPICard
                    label="Total Kelas"
                    value={stats.totalClasses}
                    icon={<Users size={20} />}
                    accentColor="#F59E0B"
                />
                <KPICard
                    label="Rata-rata Nilai"
                    value={stats.avgGrade || '-'}
                    icon={<TrendingUp size={20} />}
                    accentColor="#F59E0B"
                    badge={stats.avgGrade >= 75 ? 'healthy' : stats.avgGrade >= 60 ? 'watch' : stats.avgGrade > 0 ? 'critical' : undefined}
                />
                <KPICard
                    label="Kehadiran"
                    value={stats.avgAttendance > 0 ? `${stats.avgAttendance}%` : '-'}
                    icon={<Calendar size={20} />}
                    accentColor="#F59E0B"
                    badge={stats.avgAttendance >= 80 ? 'healthy' : stats.avgAttendance >= 60 ? 'watch' : stats.avgAttendance > 0 ? 'critical' : undefined}
                />
                <KPICard
                    label="Submission Rate"
                    value={stats.submissionRate > 0 ? `${stats.submissionRate}%` : '-'}
                    icon={<ClipboardCheck size={20} />}
                    accentColor="#F59E0B"
                    badge={stats.submissionRate >= 80 ? 'healthy' : stats.submissionRate >= 50 ? 'watch' : stats.submissionRate > 0 ? 'critical' : undefined}
                />
            </div>
        </div>
    );
}
