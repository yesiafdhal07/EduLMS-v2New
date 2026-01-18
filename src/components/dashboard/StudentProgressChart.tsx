'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';

const scoreHistory = [
    { task: 'Tugas 1', nilai: 75 },
    { task: 'Tugas 2', nilai: 82 },
    { task: 'UTS', nilai: 88 },
    { task: 'Tugas 3', nilai: 85 },
    { task: 'Tugas 4', nilai: 90 },
    { task: 'UAS', nilai: 92 },
];

export function StudentProgressChart() {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                        <TrendingUp className="text-indigo-500" />
                        Progress Belajar
                    </h3>
                    <p className="text-slate-500 text-sm">Grafik perkembangan nilai tugas matematikamu</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Target size={16} /> Target: 85
                    </div>
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Award size={16} /> Best: 92
                    </div>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <AreaChart data={scoreHistory}>
                        <defs>
                            <linearGradient id="colorNilai" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="task" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                        <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="nilai" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNilai)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
