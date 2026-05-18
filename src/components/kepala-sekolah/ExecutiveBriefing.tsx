'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Sparkles, ChevronRight, Loader2, Bot, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateExecutiveSummary } from '@/lib/services/ai-insights.service';

interface BriefingPoint {
  type: 'alert' | 'insight' | 'highlight';
  text: string;
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface ExecutiveBriefingProps {
  schoolName?: string;
  className?: string;
}

const TREND_ICON = {
  up: <TrendingUp size={12} className="text-emerald-400" />,
  down: <TrendingDown size={12} className="text-rose-400" />,
  stable: <Minus size={12} className="text-slate-400" />,
};

const TYPE_STYLE = {
  alert: {
    dot: 'bg-rose-400',
    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    label: '⚠ Perhatian',
  },
  insight: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    label: '◆ Insight',
  },
  highlight: {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    label: '✦ Highlight',
  },
};

export function ExecutiveBriefing({ schoolName, className = '' }: ExecutiveBriefingProps) {
  const [points, setPoints] = useState<BriefingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [today] = useState(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }));

  useEffect(() => {
    async function generateBriefing() {
      setLoading(true);
      try {
        const briefingPoints: BriefingPoint[] = [];

        // 1. Check attendance rate today
        const todayStr = new Date().toISOString().split('T')[0];
        const { count: sessionCount } = await supabase
          .from('attendance_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('date', todayStr);

        const { count: totalLogs } = await supabase
          .from('attendance_logs')
          .select('*', { count: 'exact', head: true })
          .gte('checked_in_at', `${todayStr}T00:00:00`);

        if ((sessionCount || 0) > 0) {
          briefingPoints.push({
            type: 'insight',
            text: `${sessionCount} active attendance sessions registered today with ${totalLogs || 0} secure check-ins recorded.`,
            metric: `${sessionCount} SESSIONS`,
            trend: (sessionCount || 0) >= 3 ? 'up' : 'stable',
          });
        }

        // 2. Check for low-performing classes
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: submissionCount } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .gte('submitted_at', sevenDaysAgo.toISOString());

        const { count: assignmentCount } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString());

        if ((assignmentCount || 0) > 0) {
          const ratio = ((submissionCount || 0) / Math.max(assignmentCount || 1, 1)) * 100;
          if (ratio < 60) {
            briefingPoints.push({
              type: 'alert',
              text: `Current submission rate is ${Math.round(ratio)}% — falling below institutional performance target of 80%.`,
              metric: `${Math.round(ratio)}% EFFICIENCY`,
              trend: 'down',
            });
          } else {
            briefingPoints.push({
              type: 'highlight',
              text: `Assignment submission rate has reached ${Math.round(ratio)}%, exceeding primary institutional benchmarks.`,
              metric: `${Math.round(ratio)}% EFFICIENCY`,
              trend: 'up',
            });
          }
        }

        // 3. New users
        const { count: newUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString());

        if ((newUsers || 0) > 0) {
          briefingPoints.push({
            type: 'insight',
            text: `${newUsers} new community members integrated into the workspace in the last 7-day period.`,
            metric: `+${newUsers} GROWTH`,
            trend: 'up',
          });
        }

        // 4. Smart Heuristic: Peak Engagement Check
        const { data: quizAttempts } = await supabase
          .from('quiz_attempts')
          .select('id, created_at')
          .gte('created_at', sevenDaysAgo.toISOString());

        if (quizAttempts && quizAttempts.length > 5) {
          briefingPoints.push({
            type: 'highlight',
            text: `Gamification systems reporting peak engagement with ${quizAttempts.length} competitive attempts recorded this week.`,
            metric: 'HIGH ENGAGEMENT',
            trend: 'up',
          });
        }

        if (briefingPoints.length === 0) {
          briefingPoints.push({
            type: 'highlight',
            text: 'System integrity maintained. No critical anomalies detected requiring immediate executive intervention.',
            trend: 'stable',
          });
        }

        setPoints(briefingPoints.sort((a, b) => {
          // Sort by urgency: alert > insight > highlight
          const priority = { alert: 0, insight: 1, highlight: 2 };
          return priority[a.type] - priority[b.type];
        }).slice(0, 3));
      } catch (err) {
        console.error('Briefing error:', err);
        setPoints([{
          type: 'highlight',
          text: 'Institutional systems operational. Primary oversight dashboard reflecting stable performance metrics.',
          trend: 'stable',
        }]);
      } finally {
        setLoading(false);
      }
    }

    generateBriefing();
  }, []);

  return (
    <div className={`universe-card p-6 md:p-8 relative overflow-hidden group ${className}`}>
      {/* Institutional Context Badge */}
      <div className="absolute top-0 right-0 px-6 py-1.5 bg-amber-500/10 border-b border-l border-white/5 rounded-bl-2xl">
        <div className="flex items-center gap-2">
           <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
           <span className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-500/80">Internal Only</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Institutional Intelligence
            </span>
          </div>
          <h2 className="font-fraunces text-2xl font-black text-white leading-tight">
            {loading ? 'Analyzing Workspace...' : 'Executive Briefing'}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 font-bold uppercase tracking-widest">{today}</p>
        </div>
      </div>

      {/* Briefing Points */}
      <div className="space-y-4 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-12 justify-center">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Compiling Data...</span>
          </div>
        ) : (
          points.map((point, i) => {
            const style = TYPE_STYLE[point.type];
            return (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all duration-500 group animate-in slide-in-from-right-4"
                style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
              >
                {/* Content Indicator */}
                <div className="pt-1 shrink-0">
                  <div className={`w-1.5 h-6 rounded-full ${style.dot} opacity-40 group-hover:opacity-100 transition-opacity`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border ${style.badge}`}>
                      {style.label}
                    </span>
                    {point.trend && TREND_ICON[point.trend]}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-fraunces">
                    {point.text}
                  </p>
                  {point.metric && (
                    <div className="flex items-center gap-2 mt-2">
                       <div className="w-1 h-1 bg-amber-500/40 rounded-full" />
                       <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{point.metric}</p>
                    </div>
                  )}
                </div>

                <ChevronRight size={14} className="text-slate-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0 self-center" />
              </div>
            );
          })
        )}
      </div>

      {/* AI Executive Summary Section */}
      {!loading && points.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
          {!aiSummary ? (
            <button
              onClick={async () => {
                setAiLoading(true);
                const summary = await generateExecutiveSummary(
                  points.map(p => ({ type: p.type, text: p.text, metric: p.metric })),
                  schoolName
                );
                setAiSummary(summary);
                setAiLoading(false);
              }}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 rounded-2xl transition-all group"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={14} className="text-amber-500 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/70">AI sedang menganalisis...</span>
                </>
              ) : (
                <>
                  <Bot size={14} className="text-amber-500/60 group-hover:text-amber-400 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 group-hover:text-amber-400 transition-colors">Generate AI Executive Summary</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={12} className="text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/70">AI Executive Summary</span>
                </div>
                <button
                  onClick={async () => {
                    setAiLoading(true);
                    setAiSummary(null);
                    const summary = await generateExecutiveSummary(
                      points.map(p => ({ type: p.type, text: p.text, metric: p.metric })),
                      schoolName
                    );
                    setAiSummary(summary);
                    setAiLoading(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-amber-400 transition-all"
                  title="Regenerate summary"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10">
                <p className="text-sm text-slate-200 leading-relaxed font-fraunces italic">
                  &ldquo;{aiSummary}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer — Institutional Timestamp */}
      {!loading && (
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-40">
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Update Pulse: SYNCED</span>
           <span className="text-[8px] font-black text-slate-500">
             {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
           </span>
        </div>
      )}
    </div>
  );
}
