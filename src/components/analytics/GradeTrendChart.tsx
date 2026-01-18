'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/error-handler';

interface TrendData {
    month: string;
    tugas: number;
    keaktifan: number;
    ujian: number;
    average: number;
}

interface GradeTrendChartProps {
    classId?: string;
}

export function GradeTrendChart({ classId }: GradeTrendChartProps) {
    const [data, setData] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrendData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch grades with created_at for trend analysis
            let query = supabase
                .from('grades')
                .select(`
                    score,
                    type,
                    created_at,
                    submissions!inner(
                        assignments!inner(
                            subjects!inner(class_id)
                        )
                    )
                `)
                .order('created_at', { ascending: true });

            if (classId) {
                query = query.eq('submissions.assignments.subjects.class_id', classId);
            }

            const { data: grades } = await query;

            // Group by month
            const monthlyData: Record<string, { tugas: number[]; keaktifan: number[]; ujian: number[] }> = {};

            grades?.forEach((grade) => {
                const date = new Date(grade.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { tugas: [], keaktifan: [], ujian: [] };
                }

                const type = grade.type as 'tugas' | 'keaktifan' | 'ujian';
                if (type && monthlyData[monthKey][type]) {
                    monthlyData[monthKey][type].push(grade.score);
                }
            });

            // Calculate averages
            const trendData: TrendData[] = Object.entries(monthlyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(-6) // Last 6 months
                .map(([month, values]) => {
                    const tugasAvg = values.tugas.length > 0
                        ? values.tugas.reduce((a, b) => a + b, 0) / values.tugas.length
                        : 0;
                    const keaktifanAvg = values.keaktifan.length > 0
                        ? values.keaktifan.reduce((a, b) => a + b, 0) / values.keaktifan.length
                        : 0;
                    const ujianAvg = values.ujian.length > 0
                        ? values.ujian.reduce((a, b) => a + b, 0) / values.ujian.length
                        : 0;

                    const allScores = [...values.tugas, ...values.keaktifan, ...values.ujian];
                    const average = allScores.length > 0
                        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
                        : 0;

                    // Format month name
                    const [year, monthNum] = month.split('-');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                    const monthName = `${monthNames[parseInt(monthNum) - 1]} '${year.slice(2)}`;

                    return {
                        month: monthName,
                        tugas: Math.round(tugasAvg * 10) / 10,
                        keaktifan: Math.round(keaktifanAvg * 10) / 10,
                        ujian: Math.round(ujianAvg * 10) / 10,
                        average: Math.round(average * 10) / 10
                    };
                });

            setData(trendData);
        } catch (error) {
            logError(error, 'GradeTrendChart.fetchTrendData');
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchTrendData();

        // Debounce realtime updates to prevent excessive refetches
        let debounceTimeout: NodeJS.Timeout | null = null;
        const debouncedFetch = () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => fetchTrendData(), 5000);
        };

        // Realtime subscription with debouncing
        const channel = supabase
            .channel('grade_trend_changes')
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
    }, [fetchTrendData]);

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
                <TrendingUp className="text-slate-500 mb-4" size={48} />
                <p className="text-slate-400">Belum ada data tren nilai</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-indigo-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white">Tren Nilai</h3>
                    <p className="text-xs text-slate-400">6 bulan terakhir</p>
                </div>
            </div>

            <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="month"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
                            domain={[0, 100]}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                borderColor: '#334155',
                                borderRadius: '12px',
                                color: '#f8fafc'
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                            type="monotone"
                            dataKey="tugas"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                            name="Tugas"
                        />
                        <Line
                            type="monotone"
                            dataKey="keaktifan"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: '#10b981', strokeWidth: 2 }}
                            name="Keaktifan"
                        />
                        <Line
                            type="monotone"
                            dataKey="ujian"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                            name="Ujian"
                        />
                        <Line
                            type="monotone"
                            dataKey="average"
                            stroke="#ec4899"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ fill: '#ec4899', strokeWidth: 2 }}
                            name="Rata-rata"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
