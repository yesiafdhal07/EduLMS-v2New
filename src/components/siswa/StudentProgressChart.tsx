'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface ProgressData {
    week: string;
    nilai: number;
    target: number;
}

interface StudentProgressChartProps {
    data: ProgressData[];
    title?: string;
}

export function StudentProgressChart({ data, title = "Progress Nilai" }: StudentProgressChartProps) {
    // Calculate trend
    const latestValue = data[data.length - 1]?.nilai || 0;
    const previousValue = data[data.length - 2]?.nilai || 0;
    const trend = latestValue - previousValue;
    const trendPositive = trend >= 0;

    return (
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-xl shadow-black/20 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/5">
                        <TrendingUp size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{title}</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">8 Minggu Terakhir</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${trendPositive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                    <TrendingUp size={16} className={!trendPositive ? 'rotate-180' : ''} />
                    {trendPositive ? '+' : ''}{trend.toFixed(1)}
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="week"
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line
                            type="monotone"
                            dataKey="nilai"
                            stroke="#818cf8"
                            strokeWidth={3}
                            dot={{ fill: '#818cf8', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#c7d2fe' }}
                            name="Nilai Anda"
                        />
                        <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#34d399"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Target (75)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
