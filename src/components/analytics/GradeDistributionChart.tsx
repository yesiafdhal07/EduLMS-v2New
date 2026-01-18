'use client';

import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChartIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/error-handler';

interface DistributionData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number;
}

interface GradeDistributionChartProps {
    classId?: string;
}

const GRADE_COLORS = {
    'A (≥85)': '#10b981',
    'B (70-84)': '#3b82f6',
    'C (55-69)': '#f59e0b',
    'D (<55)': '#ef4444'
};

export function GradeDistributionChart({ classId }: GradeDistributionChartProps) {
    const [data, setData] = useState<DistributionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalStudents, setTotalStudents] = useState(0);

    const fetchDistribution = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch all grades
            const query = supabase
                .from('grades')
                .select('score');

            const { data: grades } = await query;

            if (!grades || grades.length === 0) {
                setData([]);
                setLoading(false);
                return;
            }

            // Calculate distribution
            const distribution = { A: 0, B: 0, C: 0, D: 0 };

            grades.forEach((grade) => {
                const score = grade.score;
                if (score >= 85) distribution.A++;
                else if (score >= 70) distribution.B++;
                else if (score >= 55) distribution.C++;
                else distribution.D++;
            });

            setTotalStudents(grades.length);

            const chartData: DistributionData[] = [
                { name: 'A (≥85)', value: distribution.A, color: GRADE_COLORS['A (≥85)'] },
                { name: 'B (70-84)', value: distribution.B, color: GRADE_COLORS['B (70-84)'] },
                { name: 'C (55-69)', value: distribution.C, color: GRADE_COLORS['C (55-69)'] },
                { name: 'D (<55)', value: distribution.D, color: GRADE_COLORS['D (<55)'] }
            ].filter(item => item.value > 0);

            setData(chartData);
        } catch (error) {
            logError(error, 'GradeDistributionChart.fetchDistribution');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDistribution();

        // Debounce realtime updates to prevent excessive refetches
        let debounceTimeout: NodeJS.Timeout | null = null;
        const debouncedFetch = () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => fetchDistribution(), 5000);
        };

        const channel = supabase
            .channel('grade_distribution_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'grades'
                },
                debouncedFetch
            )
            .subscribe();

        return () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            supabase.removeChannel(channel);
        };
    }, [fetchDistribution]);

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 h-80 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-400" size={32} />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 h-80 flex flex-col items-center justify-center">
                <PieChartIcon className="text-slate-500 mb-4" size={48} />
                <p className="text-slate-400">Belum ada data distribusi</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <PieChartIcon className="text-emerald-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white">Distribusi Nilai</h3>
                    <p className="text-xs text-slate-400">Total {totalStudents} penilaian</p>
                </div>
            </div>

            <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                borderColor: '#334155',
                                borderRadius: '12px',
                                color: '#f8fafc'
                            }}
                            formatter={(value) => [`${value} siswa`, '']}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2 mt-4">
                {data.map((item) => (
                    <div
                        key={item.name}
                        className="text-center p-2 rounded-xl"
                        style={{ backgroundColor: `${item.color}20` }}
                    >
                        <p className="text-2xl font-black" style={{ color: item.color }}>
                            {Math.round((item.value / totalStudents) * 100)}%
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">{item.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
