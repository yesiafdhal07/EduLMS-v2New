'use client';

import { AlertTriangle, TrendingDown, Users, BookOpen, Eye } from 'lucide-react';
import type { AlertItem } from '@/hooks/useKepsekDashboard';

interface Props {
    alerts: AlertItem[];
    compact?: boolean;
}

const TYPE_CONFIG = {
    student: { icon: Users, label: 'Siswa' },
    teacher: { icon: BookOpen, label: 'Guru' },
    class: { icon: Users, label: 'Kelas' },
};

const SEVERITY_STYLE = {
    critical: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', iconBg: 'bg-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', iconBg: 'bg-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', iconBg: 'bg-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
};

export function InterventionInbox({ alerts, compact }: Props) {
    const displayAlerts = compact ? alerts.slice(0, 5) : alerts;

    if (alerts.length === 0) {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingDown size={20} className="text-emerald-400 rotate-180" />
                </div>
                <p className="text-sm font-bold text-emerald-400">Semua Terkendali</p>
                <p className="text-xs text-emerald-400/60 mt-1">Tidak ada masalah terdeteksi saat ini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {!compact && (
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <h3 className="text-sm font-black text-white">Kotak Intervensi</h3>
                        <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[9px] font-black">{alerts.length}</span>
                    </div>
                </div>
            )}
            {displayAlerts.map(alert => {
                const s = SEVERITY_STYLE[alert.severity];
                const tc = TYPE_CONFIG[alert.type];
                return (
                    <div key={alert.id} className={`${s.bg} border ${s.border} rounded-xl p-4 flex items-start gap-3 transition-all hover:scale-[1.005]`}>
                        <div className={`${s.iconBg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.text}`}>
                            <tc.icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-bold text-white truncate">{alert.title}</p>
                                <span className={`${s.badge} px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0`}>
                                    {alert.severity === 'critical' ? 'Kritis' : alert.severity === 'warning' ? 'Perhatian' : 'Info'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">{alert.description}</p>
                        </div>
                        <button className={`${s.text} p-2 hover:bg-white/5 rounded-lg transition-colors shrink-0`}>
                            <Eye size={14} />
                        </button>
                    </div>
                );
            })}
            {compact && alerts.length > 5 && (
                <p className="text-xs text-amber-400/60 text-center">+{alerts.length - 5} peringatan lainnya</p>
            )}
        </div>
    );
}
