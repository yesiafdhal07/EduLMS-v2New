'use client';

import { useState, useEffect } from 'react';
import { 
    AlertTriangle, BrainCircuit, TrendingDown, 
    MessageSquare, ArrowUpRight, Zap, Loader2
} from 'lucide-react';
import { aiService } from '@/lib/services/ai.service';
import { supabase } from '@/lib/supabase';

export function StudentRiskAI({ schoolId }: { schoolId: string }) {
    const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        loadData();
    }, [schoolId]);

    const loadData = async () => {
        try {
            // Fetch students with low grades
            const { data, error } = await supabase
                .from('users')
                .select(`
                    id, full_name,
                    grades:grades (score, created_at)
                `)
                .eq('school_id', schoolId)
                .eq('role', 'siswa');
            
            if (error) throw error;

            // Simple heuristic: students with average < 70
            const processed = (data || []).map(student => {
                const avg = student.grades.length > 0 
                    ? student.grades.reduce((a: any, b: any) => a + b.score, 0) / student.grades.length 
                    : 100;
                return { ...student, avg };
            }).filter(s => s.avg < 75);

            setAtRiskStudents(processed);
        } catch (error) {
            console.error('Error loading risk data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAIAnalyze = async (student: any) => {
        setIsAnalyzing(true);
        try {
            const feedback = await aiService.generatePersonalizedFeedback(student);
            // Update UI or show in modal
            alert(`Saran AI untuk ${student.full_name}:\n\n${feedback}`);
        } catch (error) {
            console.error('AI Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return <div className="h-40 animate-pulse bg-white/5 rounded-3xl" />;

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                        <BrainCircuit size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Prediksi Resiko (AI)</h3>
                        <p className="text-xs text-slate-500 font-medium">Siswa yang membutuhkan perhatian ekstra</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Experimental</span>
                </div>
            </div>

            <div className="space-y-3">
                {atRiskStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                                <TrendingDown size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{student.full_name}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Rata-rata: <span className="text-rose-400">{student.avg.toFixed(1)}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleAIAnalyze(student)}
                                className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-600/20 hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                <Zap size={16} />
                            </button>
                            <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                <MessageSquare size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {atRiskStudents.length === 0 && (
                    <div className="py-10 text-center space-y-2 opacity-50">
                        <p className="text-sm font-bold text-slate-500 italic">Semua siswa terpantau stabil.</p>
                    </div>
                )}
            </div>

            <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-black text-slate-500 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                Lihat Laporan Detil
                <ArrowUpRight size={14} />
            </button>
        </div>
    );
}
