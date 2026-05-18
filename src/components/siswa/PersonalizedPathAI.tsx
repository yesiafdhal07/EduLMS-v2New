'use client';

import { useState, useEffect } from 'react';
import { 
    Compass, Sparkles, BookOpen, Rocket, 
    ChevronRight, Target, Flame, Star
} from 'lucide-react';
import { aiService } from '@/lib/services/ai.service';
import { supabase } from '@/lib/supabase';

export function PersonalizedPathAI({ studentId }: { studentId: string }) {
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecommendation();
    }, [studentId]);

    const loadRecommendation = async () => {
        try {
            // Fetch student stats
            const { data: stats } = await supabase
                .from('student_dashboard_summary')
                .select('*')
                .eq('student_id', studentId)
                .single();
            
            const advice = await aiService.generatePersonalizedFeedback(stats);
            setRecommendation(advice);
        } catch (error) {
            console.error('Learning path error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-40 animate-pulse bg-white/5 rounded-3xl" />;

    return (
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4 max-w-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                            <Compass size={18} />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Learning Compass</span>
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black text-white font-fraunces tracking-tight leading-none">
                            Fokus <span className="text-indigo-400">Belajarmu</span> Selanjutnya
                        </h3>
                        <p className="text-white/60 text-sm font-medium italic leading-relaxed">
                            "{recommendation || 'Menganalisa performa akademikmu...'}"
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge icon={<Target size={12} />} label="Matematika Lanjut" color="indigo" />
                        <Badge icon={<Flame size={12} />} label="Top 5% Rank" color="amber" />
                    </div>
                </div>

                <div className="shrink-0 flex flex-col gap-3">
                    <button className="px-8 py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center gap-2 hover:scale-[1.05] transition-all active:scale-95">
                        <Rocket size={18} />
                        MULAI MATERI
                        <ChevronRight size={16} />
                    </button>
                    <p className="text-[10px] text-white/30 font-bold text-center uppercase tracking-tighter">
                        Berdasarkan Progres Terakhirmu
                    </p>
                </div>
            </div>
        </div>
    );
}

function Badge({ icon, label, color }: any) {
    const colors: any = {
        indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    };

    return (
        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${colors[color]}`}>
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}
