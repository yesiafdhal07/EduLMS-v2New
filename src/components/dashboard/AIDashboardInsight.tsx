'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, Lightbulb, Award, Bot } from 'lucide-react';
import { generateDashboardInsights, type DashboardInsight, type InsightContext } from '@/lib/services/ai-insights.service';

interface AIDashboardInsightProps {
    context: InsightContext;
    className?: string;
}

const TYPE_CONFIG: Record<DashboardInsight['type'], {
    icon: React.ReactNode;
    dotColor: string;
    badgeStyle: string;
    label: string;
}> = {
    performance: {
        icon: <TrendingUp size={12} />,
        dotColor: 'bg-blue-400',
        badgeStyle: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        label: 'Kinerja',
    },
    alert: {
        icon: <AlertTriangle size={12} />,
        dotColor: 'bg-rose-400',
        badgeStyle: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        label: 'Perhatian',
    },
    suggestion: {
        icon: <Lightbulb size={12} />,
        dotColor: 'bg-amber-400',
        badgeStyle: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        label: 'Saran',
    },
    highlight: {
        icon: <Award size={12} />,
        dotColor: 'bg-emerald-400',
        badgeStyle: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        label: 'Highlight',
    },
};

export function AIDashboardInsight({ context, className = '' }: AIDashboardInsightProps) {
    const [insights, setInsights] = useState<DashboardInsight[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const result = await generateDashboardInsights(context);
            setInsights(result);
            if (!result) setError(true);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [context]);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    return (
        <div className={`universe-card overflow-hidden relative group ${className}`}>
            {/* AI Badge */}
            <div className="absolute top-0 right-0 px-4 py-1 bg-[var(--universe-primary)]/10 border-b border-l border-white/5 rounded-bl-2xl">
                <div className="flex items-center gap-1.5">
                    <Bot size={10} className="text-[var(--universe-primary)] opacity-70" />
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[var(--universe-primary)]/70">AI Powered</span>
                </div>
            </div>

            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--universe-primary)]/10 border border-[var(--universe-primary)]/20 flex items-center justify-center">
                            <Sparkles size={18} className="text-[var(--universe-primary)]" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white tracking-tight">AI Insight</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Rangkuman Cerdas</p>
                        </div>
                    </div>

                    <button
                        onClick={fetchInsights}
                        disabled={loading}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all disabled:opacity-30"
                        title="Refresh insight"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-3">
                {loading ? (
                    // Skeleton
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse">
                                <div className="w-1.5 h-8 rounded-full bg-white/5 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-white/5 rounded-lg w-1/3" />
                                    <div className="h-3 bg-white/5 rounded-lg w-full" />
                                </div>
                            </div>
                        ))}
                        <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-widest pt-2">
                            <Sparkles size={10} className="inline mr-1 animate-pulse" />
                            AI sedang menganalisis data...
                        </p>
                    </div>
                ) : error || !insights || insights.length === 0 ? (
                    // Error / No API key state
                    <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 border border-white/5">
                            <Sparkles size={20} className="text-slate-600" />
                        </div>
                        <p className="text-xs text-slate-500 font-bold">
                            {error ? 'AI insight tidak tersedia saat ini' : 'Tidak ada insight'}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1">
                            Pastikan API key OpenRouter sudah dikonfigurasi
                        </p>
                    </div>
                ) : (
                    // Insight Cards
                    insights.map((insight, idx) => {
                        const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.performance;
                        return (
                            <div
                                key={`${insight.type}-${idx}`}
                                className="flex gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                            >
                                {/* Type Indicator */}
                                <div className="pt-0.5 shrink-0">
                                    <div className={`w-1.5 h-full min-h-[2rem] rounded-full ${config.dotColor} opacity-40`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border ${config.badgeStyle}`}>
                                            {config.icon}
                                            {config.label}
                                        </span>
                                        {insight.icon && <span className="text-xs">{insight.icon}</span>}
                                    </div>

                                    <p className="text-[11px] font-bold text-white leading-relaxed mb-0.5">
                                        {insight.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        {insight.summary}
                                    </p>

                                    {insight.actionSuggestion && (
                                        <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-white/5">
                                            <Lightbulb size={10} className="text-amber-500/60 mt-0.5 shrink-0" />
                                            <p className="text-[9px] text-amber-500/80 font-medium leading-relaxed">
                                                {insight.actionSuggestion}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            {insights && insights.length > 0 && (
                <div className="px-6 pb-4 pt-2 border-t border-white/5">
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest text-center">
                        Dihasilkan oleh AI · Data dari database real-time
                    </p>
                </div>
            )}
        </div>
    );
}
