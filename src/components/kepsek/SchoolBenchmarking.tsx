'use client';

import { useState, useEffect } from 'react';
import { 
    BarChart3, TrendingUp, Users, Building, 
    ArrowUpRight, ArrowDownRight, Globe, Target
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Lazy load heavy charts
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

export function SchoolBenchmarking({ schoolId }: { schoolId: string }) {
    const [benchmarks, setBenchmarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBenchmarks();
    }, [schoolId]);

    const loadBenchmarks = async () => {
        try {
            const { data, error } = await supabase
                .from('school_benchmarking')
                .select('*');
            
            if (error) throw error;
            setBenchmarks(data || []);
        } catch (error) {
            console.error('Error loading benchmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentSchool = benchmarks.find(b => b.school_id === schoolId);
    const others = benchmarks.filter(b => b.school_id !== schoolId);
    const avgGrade = benchmarks.reduce((acc, b) => acc + b.avg_grade, 0) / (benchmarks.length || 1);

    if (loading) return <div className="h-96 animate-pulse bg-white/5 rounded-3xl" />;

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400">
                    <Globe size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inter-School Benchmark</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight font-fraunces">
                    Perbandingan <span className="text-amber-400">Regional</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                    Lihat bagaimana performa sekolah Anda dibandingkan dengan sekolah lain di dalam jaringan Klolakelas.
                </p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BenchmarkCard 
                    icon={<Target size={20} />}
                    label="Peringkat Akademik"
                    value={`#${benchmarks.sort((a, b) => b.avg_grade - a.avg_grade).findIndex(b => b.school_id === schoolId) + 1}`}
                    desc={`Dari ${benchmarks.length} sekolah`}
                    color="amber"
                />
                <BenchmarkCard 
                    icon={<BarChart3 size={20} />}
                    label="Deviasi Rata-rata"
                    value={(currentSchool?.avg_grade - avgGrade).toFixed(1)}
                    desc="Poin dibanding rata-rata regional"
                    color={currentSchool?.avg_grade >= avgGrade ? 'emerald' : 'rose'}
                    prefix={currentSchool?.avg_grade >= avgGrade ? '+' : ''}
                />
                <BenchmarkCard 
                    icon={<Users size={20} />}
                    label="Efisiensi Guru"
                    value={(currentSchool?.student_count / (currentSchool?.class_count || 1)).toFixed(1)}
                    desc="Rasio siswa per kelas"
                    color="indigo"
                />
            </div>

            {/* Comparison Chart */}
            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Rata-rata Nilai per Sekolah</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Sekolah Anda</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Sekolah Lain</span>
                        </div>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={benchmarks}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis 
                                dataKey="school_name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip 
                                cursor={{ fill: '#ffffff05' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }}
                            />
                            <Bar 
                                dataKey="avg_grade" 
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            >
                                {benchmarks.map((entry, index) => (
                                    <Bar 
                                        key={`cell-${index}`} 
                                        fill={entry.school_id === schoolId ? '#f59e0b' : '#334155'} 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function BenchmarkCard({ icon, label, value, desc, color, prefix = '' }: any) {
    const colors: any = {
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
    };

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 space-y-4 hover:bg-white/[0.05] transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <h4 className="text-3xl font-black text-white leading-none">
                    {prefix}{value}
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-2">{desc}</p>
            </div>
        </div>
    );
}
