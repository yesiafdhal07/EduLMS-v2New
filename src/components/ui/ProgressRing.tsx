'use client';

interface ProgressRingProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    label?: string;
    showValue?: boolean;
}

export function ProgressRing({
    value,
    max = 100,
    size = 64,
    strokeWidth = 5,
    color = '#6366f1',
    bgColor = 'rgba(255,255,255,0.05)',
    label,
    showValue = true,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min(value / max, 1);
    const offset = circumference * (1 - percentage);

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={color} strokeWidth={strokeWidth}
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                    />
                </svg>
                {showValue && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black text-white">{Math.round(percentage * 100)}%</span>
                    </div>
                )}
            </div>
            {label && <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">{label}</span>}
        </div>
    );
}
