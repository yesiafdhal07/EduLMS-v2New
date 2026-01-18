'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3, Users, PieChart as PieChartIcon } from 'lucide-react';

interface ClassStatisticsProps {
    gradeDistribution: { range: string; count: number; color: string }[];
    attendanceData: { day: string; hadir: number; tidak: number }[];
    totalStudents: number;
    averageGrade: number;
    attendanceRate: number;
}

export function ClassStatisticsPanel({
    gradeDistribution,
    attendanceData,
    totalStudents,
    averageGrade,
    attendanceRate
}: ClassStatisticsProps) {
    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl shadow-black/20 text-center hover:bg-white/10 transition-colors">
                    <Users size={28} className="mx-auto text-indigo-400 mb-3" />
                    <p className="text-3xl font-black text-white">{totalStudents}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Siswa</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl shadow-black/20 text-center hover:bg-white/10 transition-colors">
                    <BarChart3 size={28} className="mx-auto text-emerald-400 mb-3" />
                    <p className="text-3xl font-black text-white">{averageGrade.toFixed(1)}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rata-rata Nilai</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl shadow-black/20 text-center hover:bg-white/10 transition-colors">
                    <PieChartIcon size={28} className="mx-auto text-amber-400 mb-3" />
                    <p className="text-3xl font-black text-white">{attendanceRate}%</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Kehadiran</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Grade Distribution Pie Chart */}
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-xl shadow-black/20">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-3">
                        <PieChartIcon size={20} className="text-indigo-400" />
                        Distribusi Nilai
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                            <PieChart>
                                <Pie
                                    data={gradeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="count"
                                    stroke="none"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                >
                                    {gradeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {gradeDistribution.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-slate-600">{item.range}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance Bar Chart */}
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-xl shadow-black/20">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-3">
                        <BarChart3 size={20} className="text-emerald-400" />
                        Kehadiran Mingguan
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="hadir" fill="#34d399" name="Hadir" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="tidak" fill="#fb7185" name="Tidak Hadir" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
