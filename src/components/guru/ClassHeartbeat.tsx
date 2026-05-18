'use client';

import { useState, useEffect } from 'react';
import { Heart, Flame, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ClassHeartbeatProps {
  classId: string | null;
  teacherId?: string;
}

interface HeartbeatData {
  participationRate: number; // 0-100
  activeStudents: number;
  totalStudents: number;
  teachingStreak: number; // days
  trend: 'up' | 'stable' | 'down';
}

export function ClassHeartbeat({ classId, teacherId }: ClassHeartbeatProps) {
  const [data, setData] = useState<HeartbeatData>({
    participationRate: 0,
    activeStudents: 0,
    totalStudents: 0,
    teachingStreak: 0,
    trend: 'stable',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) { setLoading(false); return; }

    async function fetchHeartbeat() {
      setLoading(true);
      try {
        // Count total students in class
        const { count: totalCount } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classId);

        // Count students who submitted something in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: activeCount } = await supabase
          .from('submissions')
          .select('student_id', { count: 'exact', head: true })
          .eq('class_id', classId)
          .gte('submitted_at', sevenDaysAgo.toISOString());

        const total = totalCount || 0;
        const active = Math.min(activeCount || 0, total);
        const rate = total > 0 ? Math.round((active / total) * 100) : 0;

        // Teaching streak: count consecutive days teacher has logged activity
        // Simplified: check attendance sessions in past 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: sessions } = await supabase
          .from('attendance_sessions')
          .select('date')
          .eq('class_id', classId)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: false });

        let streak = 0;
        if (sessions && sessions.length > 0) {
          const today = new Date();
          let checkDate = new Date(sessions[0].date);
          for (const s of sessions) {
            const diff = Math.round((today.getTime() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24));
            if (diff <= streak + 1) streak++;
            else break;
          }
        }

        setData({
          participationRate: rate,
          activeStudents: active,
          totalStudents: total,
          teachingStreak: streak,
          trend: rate >= 70 ? 'up' : rate >= 40 ? 'stable' : 'down',
        });
      } catch {
        // Silently fail — non-critical widget
      } finally {
        setLoading(false);
      }
    }

    fetchHeartbeat();
  }, [classId]);

  const pulseColor =
    data.participationRate >= 70
      ? 'text-emerald-400'
      : data.participationRate >= 40
      ? 'text-amber-400'
      : 'text-rose-400';

  const glowColor =
    data.participationRate >= 70
      ? 'shadow-emerald-500/20'
      : data.participationRate >= 40
      ? 'shadow-amber-500/20'
      : 'shadow-rose-500/20';

  const bgColor =
    data.participationRate >= 70
      ? 'bg-emerald-500/10 border-emerald-500/20'
      : data.participationRate >= 40
      ? 'bg-amber-500/10 border-amber-500/20'
      : 'bg-rose-500/10 border-rose-500/20';

  if (!classId) return null;

  return (
    <div className={`
      flex items-center gap-4 px-5 py-3 rounded-2xl border
      bg-white/[0.03] border-white/8
      backdrop-blur-xl transition-all duration-500
      shadow-2xl ${glowColor} relative overflow-hidden group
    `}>
      {/* Background ECG Pulse Line — Signature Interaction */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 200 60">
        <path
          d="M0 30 L60 30 L65 20 L75 40 L80 30 L100 30 L105 10 L115 50 L120 30 L200 30"
          className={`${pulseColor} stroke-[1.5] fill-none`}
          style={{ 
            strokeDasharray: '200', 
            strokeDashoffset: '200',
            animation: 'ecgPulse 3s linear infinite'
          }}
        />
      </svg>

      {/* Heartbeat Icon Container */}
      <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
        {!loading && (
          <div className="relative">
             {/* Secondary Ghost Pulse */}
            <Heart
              size={20}
              className={`${pulseColor} fill-current absolute inset-0 opacity-20 animate-ping`}
            />
            <Heart
              size={20}
              className={`${pulseColor} fill-current animate-heartbeat relative z-20`}
            />
          </div>
        )}
        {loading && (
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
        )}
      </div>

      {/* Participation Stats */}
      {!loading && (
        <div className="flex items-center gap-4 z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-xl font-fraunces font-black ${pulseColor} leading-none tracking-tight`}>
                {data.participationRate}%
              </span>
              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-px">
                <div
                  className={`h-full rounded-full transition-all duration-[1.5s] relative ${
                    data.participationRate >= 70
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      : data.participationRate >= 40
                      ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                      : 'bg-gradient-to-r from-rose-600 to-rose-400'
                  }`}
                  style={{ width: `${data.participationRate}%` }}
                >
                   <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
              Class_Heartbeat
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          {/* Active Students Counter */}
          <div className="flex flex-col" title={`${data.activeStudents} dari ${data.totalStudents} siswa aktif`}>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-slate-500" />
              <span className="text-xs font-fraunces font-black text-slate-200">
                {data.activeStudents}<span className="text-slate-600 text-[10px] font-sans">/{data.totalStudents}</span>
              </span>
            </div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
              Active
            </span>
          </div>

          {data.teachingStreak > 0 && (
            <>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="animate-fire text-sm">🔥</span>
                  <span className="text-xs font-fraunces font-black text-orange-400">
                    {data.teachingStreak}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
                  Streak
                </span>
              </div>
            </>
          )}

          <div className="h-8 w-px bg-white/10" />
          
          <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${
              data.trend === 'up' ? 'text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]' : 
              data.trend === 'down' ? 'text-rose-400' : 'text-slate-500'
          }`}>
            <TrendingUp
                size={14}
                className={`${data.trend === 'down' ? 'rotate-180' : data.trend === 'stable' ? 'opacity-50' : ''} transition-all duration-500`}
            />
          </div>
        </div>
      )}

      {/* Define the ECG pulse animation if not in globals.css */}
      <style jsx>{`
        @keyframes ecgPulse {
          0% { stroke-dashoffset: 200; }
          40% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -200; }
        }
      `}</style>
    </div>
  );
}
