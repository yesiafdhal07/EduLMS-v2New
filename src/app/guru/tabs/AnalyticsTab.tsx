import { BarChart3, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/useAnalytics';

const GradeTrendChart = dynamic(() => import('@/components/analytics').then(mod => mod.GradeTrendChart), { 
    ssr: false, 
    loading: () => <div className="h-64 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div> 
});
const GradeDistributionChart = dynamic(() => import('@/components/analytics').then(mod => mod.GradeDistributionChart), { 
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div> 
});
const TopPerformers = dynamic(() => import('@/components/analytics').then(mod => mod.TopPerformers), { 
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div> 
});

interface AnalyticsTabProps {
    classId?: string;
}

export function AnalyticsTab({ classId }: AnalyticsTabProps) {
    const { stats, loading } = useAnalytics(classId);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
            {/* Header — Universe Style */}
            <div className="flex items-center gap-5 mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 border border-white/10 shrink-0">
                    <BarChart3 className="text-white" size={32} />
                </div>
                <div>
                    <h2 className="font-fraunces text-3xl font-black text-white tracking-tight leading-none mb-2">Analytics Dashboard</h2>
                    <p className="text-slate-500 font-medium tracking-wide">Monitoring performa akademik dan keaktifan kelas secara realtime.</p>
                </div>
            </div>

            {/* Summary Cards — Universe Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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
                <div className="lg:col-span-2 universe-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-fraunces text-xl font-black text-white tracking-tight">Tren Nilai Kelas</h3>
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">6 Bulan Terakhir</div>
                    </div>
                    <GradeTrendChart classId={classId} />
                </div>

                {/* Distribution & Top Performers */}
                <div className="universe-card p-6">
                    <h3 className="font-fraunces text-xl font-black text-white tracking-tight mb-6">Distribusi Nilai</h3>
                    <GradeDistributionChart classId={classId} />
                </div>
                <div className="universe-card p-6">
                    <h3 className="font-fraunces text-xl font-black text-white tracking-tight mb-6">Siswa Berprestasi</h3>
                    <TopPerformers classId={classId} limit={5} />
                </div>
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
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    };

    return (
        <div className="universe-card p-6 transition-all hover:scale-[1.02] hover:border-white/10 group">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">{label}</p>
                <div className={`w-2 h-2 rounded-full ${colorClasses[color].split(' ').pop()} animate-pulse`} />
            </div>
            {loading ? (
                 <Loader2 className={`animate-spin ${colorClasses[color].split(' ')[0]}`} size={24} />
            ) : (
                <p className="font-fraunces text-4xl font-black text-white">
                    {value}<span className="text-xl ml-1 text-slate-500">{suffix}</span>
                </p>
            )}
        </div>
    );
}
