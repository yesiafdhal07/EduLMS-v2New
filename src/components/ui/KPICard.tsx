'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    trend?: number;
    trendLabel?: string;
    badge?: 'healthy' | 'watch' | 'critical';
    sparklineData?: number[];
    accentColor?: string;
}

const BADGE_STYLES = {
    healthy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    watch: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const BADGE_LABELS = { healthy: 'Healthy', watch: 'Watch', critical: 'Critical' };

function MiniSparkline({ data, color = '#6366f1' }: { data: number[]; color?: string }) {
    if (!data.length) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 28;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="shrink-0">
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} opacity={0.6} />
        </svg>
    );
}

export function KPICard({ label, value, icon, trend, trendLabel, badge, sparklineData, accentColor }: KPICardProps) {
    const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
    const trendColor = trend && trend > 0 ? 'text-emerald-400' : trend && trend < 0 ? 'text-rose-400' : 'text-slate-500';

    return (
        <div className="bg-[#181A20] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
                <div className="text-slate-400">{icon}</div>
                {badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${BADGE_STYLES[badge]}`}>
                        {BADGE_LABELS[badge]}
                    </span>
                )}
            </div>
            <div className="flex items-end justify-between gap-3">
                <div>
                    <p className="text-3xl font-black text-white leading-none">{value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{label}</p>
                </div>
                {sparklineData && sparklineData.length > 1 && (
                    <MiniSparkline data={sparklineData} color={accentColor || '#6366f1'} />
                )}
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 mt-3 ${trendColor}`}>
                    <TrendIcon size={12} />
                    <span className="text-[11px] font-bold">{trend > 0 ? '+' : ''}{trend}%</span>
                    {trendLabel && <span className="text-[10px] text-slate-500 ml-1">{trendLabel}</span>}
                </div>
            )}
        </div>
    );
}
