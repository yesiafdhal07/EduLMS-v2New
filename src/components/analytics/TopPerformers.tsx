'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Award, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/error-handler';

interface TopPerformer {
    id: string;
    name: string;
    average: number;
    totalGrades: number;
    rank: number;
}

interface TopPerformersProps {
    classId?: string;
    limit?: number;
}

export function TopPerformers({ classId, limit = 5 }: TopPerformersProps) {
    const [performers, setPerformers] = useState<TopPerformer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTopPerformers = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Single query: Fetch all grades with student info (NO N+1!)
            const { data: allGrades } = await supabase
                .from('grades')
                .select(`
                    score,
                    submissions!inner(
                        student_id,
                        users!inner(id, full_name)
                    )
                `);

            if (!allGrades || allGrades.length === 0) {
                setPerformers([]);
                setLoading(false);
                return;
            }

            // Aggregate grades by student in memory (efficient)
            const studentGrades: Record<string, { name: string; scores: number[] }> = {};

            allGrades.forEach((grade) => {
                // Cast to unknown first to handle Supabase join type quirks (array vs object)
                const submission = grade.submissions as unknown as {
                    student_id: string;
                    users: { id: string; full_name: string } | { id: string; full_name: string }[]
                };

                // Handle potential array wrapping for users
                const user = Array.isArray(submission.users) ? submission.users[0] : submission.users;

                const studentId = submission.student_id;
                const studentName = user?.full_name || 'Unknown';

                if (!studentGrades[studentId]) {
                    studentGrades[studentId] = { name: studentName, scores: [] };
                }
                studentGrades[studentId].scores.push(grade.score);
            });

            // Calculate averages and create performer list
            const performersData: TopPerformer[] = Object.entries(studentGrades).map(([id, data]) => {
                const average = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
                return {
                    id,
                    name: data.name,
                    average: Math.round(average * 10) / 10,
                    totalGrades: data.scores.length,
                    rank: 0
                };
            });

            // Sort by average and assign ranks
            performersData.sort((a, b) => b.average - a.average);
            performersData.forEach((p, i) => p.rank = i + 1);

            setPerformers(performersData.slice(0, limit));
        } catch (error) {
            logError(error, 'TopPerformers.fetchTopPerformers');
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchTopPerformers();

        // Debounce realtime updates to prevent excessive refetches
        let debounceTimeout: NodeJS.Timeout | null = null;
        const debouncedFetch = () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => fetchTopPerformers(), 5000);
        };

        const channel = supabase
            .channel('top_performers_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'grades'
                },
                debouncedFetch
            )
            .subscribe();

        return () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            supabase.removeChannel(channel);
        };
    }, [fetchTopPerformers]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="text-amber-400" size={24} />;
            case 2:
                return <Medal className="text-slate-300" size={24} />;
            case 3:
                return <Award className="text-amber-600" size={24} />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">{rank}</span>;
        }
    };

    const getRankBg = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30';
            case 2:
                return 'bg-gradient-to-r from-slate-400/20 to-slate-300/20 border-slate-400/30';
            case 3:
                return 'bg-gradient-to-r from-amber-700/20 to-orange-600/20 border-amber-700/30';
            default:
                return 'bg-slate-800/50 border-slate-700/50';
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 h-80 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-400" size={32} />
            </div>
        );
    }

    if (performers.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 h-80 flex flex-col items-center justify-center">
                <Trophy className="text-slate-500 mb-4" size={48} />
                <p className="text-slate-400">Belum ada data peringkat</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                    <Trophy className="text-amber-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white">Top Performers</h3>
                    <p className="text-xs text-slate-400">Siswa dengan nilai tertinggi</p>
                </div>
            </div>

            <div className="space-y-3">
                {performers.map((performer) => (
                    <div
                        key={performer.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border ${getRankBg(performer.rank)} transition-all hover:scale-[1.02]`}
                    >
                        {/* Rank */}
                        <div className="w-10 h-10 flex items-center justify-center">
                            {getRankIcon(performer.rank)}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <User className="text-white" size={20} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold truncate">{performer.name}</p>
                            <p className="text-xs text-slate-400">{performer.totalGrades} penilaian</p>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                            <p className={`text-2xl font-black ${performer.average >= 85 ? 'text-emerald-400' : performer.average >= 70 ? 'text-blue-400' : 'text-amber-400'}`}>
                                {performer.average}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Rata-rata</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
