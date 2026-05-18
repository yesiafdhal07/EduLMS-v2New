'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
    schoolId?: string;
}

interface DayData {
    date: string;
    count: number;
    total: number;
    rate: number;
}

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function getIntensity(rate: number): string {
    if (rate === 0) return 'bg-white/5';
    if (rate < 40) return 'bg-rose-500/40';
    if (rate < 60) return 'bg-amber-500/40';
    if (rate < 80) return 'bg-emerald-500/30';
    return 'bg-emerald-500/60';
}

export function AttendanceHeatmap({ schoolId }: Props) {
    const [data, setData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthOffset, setMonthOffset] = useState(0);

    const currentMonth = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + monthOffset);
        return d;
    }, [monthOffset]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

            const { data: logs } = await supabase
                .from('attendance_logs')
                .select('checked_in_at, status')
                .gte('checked_in_at', startDate)
                .lte('checked_in_at', endDate + 'T23:59:59');

            const dayMap: Record<string, { count: number; total: number }> = {};
            (logs || []).forEach((log: any) => {
                const day = log.checked_in_at.split('T')[0];
                if (!dayMap[day]) dayMap[day] = { count: 0, total: 0 };
                dayMap[day].total++;
                if (log.status === 'hadir' || log.status === 'present') {
                    dayMap[day].count++;
                }
            });

            const result: DayData[] = [];
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const entry = dayMap[dateStr] || { count: 0, total: 0 };
                result.push({
                    date: dateStr,
                    count: entry.count,
                    total: entry.total,
                    rate: entry.total > 0 ? Math.round((entry.count / entry.total) * 100) : 0,
                });
            }

            setData(result);
            setLoading(false);
        };

        fetchData();
    }, [currentMonth, schoolId]);

    const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monthLabel = currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const avgRate = data.length > 0
        ? Math.round(data.filter(d => d.total > 0).reduce((s, d) => s + d.rate, 0) / Math.max(data.filter(d => d.total > 0).length, 1))
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-amber-400" />
                    <h3 className="text-lg font-black text-white">Heatmap Kehadiran</h3>
                    {avgRate > 0 && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${avgRate >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : avgRate >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            Rata-rata: {avgRate}%
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setMonthOffset(m => m - 1)} className="p-2 bg-[#181A20] border border-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={14} />
                    </button>
                    <span className="text-sm font-bold text-white min-w-[140px] text-center">{monthLabel}</span>
                    <button onClick={() => setMonthOffset(m => m + 1)} disabled={monthOffset >= 0}
                        className="p-2 bg-[#181A20] border border-white/5 rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-30">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="bg-[#181A20] border border-white/5 rounded-2xl p-5">
                {loading ? (
                    <div className="h-48 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS_ID.map(d => (
                                <div key={d} className="text-center text-[9px] font-bold text-slate-600 uppercase">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square" />
                            ))}
                            {data.map(day => (
                                <div key={day.date}
                                    className={`aspect-square rounded-lg ${getIntensity(day.rate)} flex items-center justify-center cursor-default group relative transition-colors`}
                                    title={`${day.date}: ${day.rate}% (${day.count}/${day.total})`}
                                >
                                    <span className="text-[10px] font-bold text-white/60">{parseInt(day.date.split('-')[2])}</span>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0F1014] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        {day.total > 0 ? `${day.rate}% hadir (${day.count}/${day.total})` : 'Tidak ada data'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 mt-4">
                            <span className="text-[9px] text-slate-600 font-bold mr-1">Rendah</span>
                            {['bg-white/5', 'bg-rose-500/40', 'bg-amber-500/40', 'bg-emerald-500/30', 'bg-emerald-500/60'].map((c, i) => (
                                <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                            ))}
                            <span className="text-[9px] text-slate-600 font-bold ml-1">Tinggi</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
