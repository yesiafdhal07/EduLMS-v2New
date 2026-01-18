import { BarChart3, Loader2 } from 'lucide-react';
import { GradeTrendChart, GradeDistributionChart, TopPerformers } from '@/components/analytics';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsTabProps {
    classId?: string;
}

export function AnalyticsTab({ classId }: AnalyticsTabProps) {
    const { stats, loading } = useAnalytics(classId);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <BarChart3 className="text-white" size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Analytics Dashboard</h2>
                    <p className="text-slate-400">Visualisasi data performa kelas dan siswa (Realtime)</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                    label="Rata-rata Kelas"
                    value={loading ? '-' : stats.averageScore.toString()}
                    suffix=""
                    color="indigo"
                    loading={loading}
                />
                <SummaryCard
                    label="Tingkat Kelulusan"
                    value={loading ? '-' : stats.passRate.toString()}
                    suffix="%"
                    color="emerald"
                    loading={loading}
                />
                <SummaryCard
                    label="Kehadiran"
                    value={loading ? '-' : stats.attendanceRate.toString()}
                    suffix="%"
                    color="amber"
                    loading={loading}
                />
                <SummaryCard
                    label="Tugas Selesai"
                    value={loading ? '-' : stats.completedAssignments.toString()}
                    suffix=""
                    color="rose"
                    loading={loading}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trend Chart - Full Width */}
                <div className="lg:col-span-2">
                    <GradeTrendChart classId={classId} />
                </div>

                {/* Distribution & Top Performers */}
                <GradeDistributionChart classId={classId} />
                <TopPerformers classId={classId} limit={5} />
            </div>
        </div>
    );
}

interface SummaryCardProps {
    label: string;
    value: string;
    suffix: string;
    color: 'indigo' | 'emerald' | 'amber' | 'rose';
    loading?: boolean;
}

function SummaryCard({ label, value, suffix, color, loading }: SummaryCardProps) {
    const colorClasses = {
        indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
        emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
        amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
        rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-lg rounded-2xl p-6 border transition-all hover:scale-[1.02]`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
            {loading ? (
                 <Loader2 className={`animate-spin ${colorClasses[color].split(' ').pop()}`} size={24} />
            ) : (
                <p className={`text-4xl font-black ${colorClasses[color].split(' ').pop()}`}>
                    {value}<span className="text-xl">{suffix}</span>
                </p>
            )}
        </div>
    );
}
