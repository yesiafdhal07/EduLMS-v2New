'use client';

import { ReactNode } from 'react';

interface AlertCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    action?: { label: string; onClick: () => void };
}

const SEVERITY_STYLES = {
    critical: { border: 'border-rose-500/30', bg: 'bg-rose-500/10', iconBg: 'bg-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-400' },
    warning: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', iconBg: 'bg-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
    info: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', iconBg: 'bg-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
};

const SEVERITY_LABELS = { critical: 'Kritis', warning: 'Perhatian', info: 'Info' };

export function AlertCard({ icon, title, description, severity, action }: AlertCardProps) {
    const s = SEVERITY_STYLES[severity];
    return (
        <div className={`${s.bg} ${s.border} border rounded-xl p-4 flex items-start gap-3 transition-all hover:scale-[1.01]`}>
            <div className={`${s.iconBg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.text}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-white truncate">{title}</p>
                    <span className={`${s.badge} px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0`}>
                        {SEVERITY_LABELS[severity]}
                    </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
            </div>
            {action && (
                <button onClick={action.onClick} className={`${s.text} text-[10px] font-bold uppercase tracking-widest shrink-0 hover:underline`}>
                    {action.label}
                </button>
            )}
        </div>
    );
}
