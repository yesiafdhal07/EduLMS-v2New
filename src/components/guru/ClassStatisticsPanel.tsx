'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3, Users, PieChart as PieChartIcon } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui';

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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="universe-card p-6 group hover:-translate-y-1 transition-all duration-500">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-5 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                        <Users size={22} className="text-indigo-400" />
                    </div>
                    <p className="text-3xl font-black text-white tracking-tighter tabular-nums">{totalStudents}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Total Enrollment</p>
                </div>

                <div className="universe-card p-6 group hover:-translate-y-1 transition-all duration-500">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-5 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <BarChart3 size={22} className="text-emerald-400" />
                    </div>
                    <p className="text-3xl font-black text-white tracking-tighter tabular-nums">{averageGrade.toFixed(1)}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Class Median</p>
                </div>

                <div className="universe-card p-6 group hover:-translate-y-1 transition-all duration-500">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-5 border border-amber-500/20 group-hover:scale-110 transition-transform">
                        <PieChartIcon size={22} className="text-amber-400" />
                    </div>
                    <p className="text-3xl font-black text-white tracking-tighter tabular-nums">{attendanceRate}%</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Attendance Avg</p>
                </div>

                <div className="universe-card p-6 group hover:-translate-y-1 transition-all duration-500 bg-white/[0.04]">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-5 border border-purple-500/20 group-hover:scale-110 transition-transform">
                        <BarChart3 size={22} className="text-purple-400" />
                    </div>
                    <p className="text-3xl font-black text-white tracking-tighter tabular-nums">78.4</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Health Score</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Grade Distribution Bento */}
                <div className="universe-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <PieChartIcon size={18} className="text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white tracking-tight leading-none">Grade Map</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Distribution Analysis</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        <ErrorBoundary>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gradeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="count"
                                        stroke="none"
                                    >
                                        {gradeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                                        itemStyle={{ color: '#f8fafc', fontWeight: 800, fontSize: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ErrorBoundary>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 mt-6">
                        {gradeDistribution.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 group/legend">
                                <div className="w-2.5 h-2.5 rounded-full transition-transform group-hover/legend:scale-125" style={{ backgroundColor: item.color }}></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.range}</span>
                                <span className="text-xs font-black text-white tabular-nums">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance Bento */}
                <div className="universe-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <BarChart3 size={18} className="text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white tracking-tight leading-none">Weekly Rhythm</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Engagement Tracking</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        <ErrorBoundary>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                                        itemStyle={{ color: '#f8fafc', fontWeight: 800, fontSize: '12px' }}
                                    />
                                    <Bar dataKey="hadir" fill="#6366f1" name="Present" radius={[6, 6, 0, 0]} barSize={24} />
                                    <Bar dataKey="tidak" fill="#f43f5e" name="Absent" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ErrorBoundary>
                    </div>
                </div>
            </div>
        </div>
    );
}
