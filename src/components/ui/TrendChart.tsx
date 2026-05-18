'use client';

import { useState } from 'react';

interface TrendChartProps {
    data: { label: string; value: number }[];
    color?: string;
    height?: number;
    showPeriodToggle?: boolean;
    periods?: { key: string; label: string; data: { label: string; value: number }[] }[];
    title?: string;
}

export function TrendChart({ data: defaultData, color = '#6366f1', height = 200, showPeriodToggle, periods, title }: TrendChartProps) {
    const [activePeriod, setActivePeriod] = useState(0);
    const data = periods ? periods[activePeriod].data : defaultData;

    if (!data.length) return null;

    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;
    const width = 100;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = ((max - d.value) / range) * 80 + 10;
        return { x, y, ...d };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = pathD + ` L ${width} 90 L 0 90 Z`;

    return (
        <div className="bg-[#181A20] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                {title && <p className="text-sm font-bold text-white">{title}</p>}
                {showPeriodToggle && periods && (
                    <div className="flex gap-1">
                        {periods.map((p, i) => (
                            <button key={p.key} onClick={() => setActivePeriod(i)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${activePeriod === i ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <svg viewBox={`0 0 ${width} 100`} style={{ height }} className="w-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`trendGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={areaD} fill={`url(#trendGrad-${color.replace('#', '')})`} />
                <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} opacity={0.8} />
                ))}
            </svg>
            <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-medium">
                <span>{data[0]?.label}</span>
                <span>{data[data.length - 1]?.label}</span>
            </div>
        </div>
    );
}
