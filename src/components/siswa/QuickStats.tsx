'use client';

import { Trophy, TrendingUp, TrendingDown, Medal, Target } from 'lucide-react';

interface QuickStatsProps {
    classRank: number;
    totalStudents: number;
    highestScore: number;
    lowestScore: number;
    averageScore: number;
    personalAverage: number;
}

export function QuickStats({
    classRank,
    totalStudents,
    highestScore,
    lowestScore,
    averageScore,
    personalAverage
}: QuickStatsProps) {
    const isAboveAverage = personalAverage >= averageScore;
    const percentile = Math.round(((totalStudents - classRank + 1) / totalStudents) * 100);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Trophy size={24} className="text-amber-500" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Statistik Kelas</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Posisimu di Kelas</p>
                </div>
            </div>

            {/* Ranking Display */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full"></div>
                <Medal size={32} className="mx-auto mb-2 text-amber-300" />
                <div className="text-5xl font-black mb-1">#{classRank}</div>
                <p className="text-indigo-200 text-sm">dari {totalStudents} siswa</p>
                <p className="text-xs mt-2 text-indigo-100">Top {percentile}% di kelas</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl text-center">
                    <TrendingUp size={20} className="mx-auto text-emerald-600 mb-2" />
                    <p className="text-2xl font-black text-emerald-700">{highestScore}</p>
                    <p className="text-xs text-emerald-600 font-medium">Tertinggi</p>
                </div>

                <div className="bg-rose-50 p-4 rounded-xl text-center">
                    <TrendingDown size={20} className="mx-auto text-rose-600 mb-2" />
                    <p className="text-2xl font-black text-rose-700">{lowestScore}</p>
                    <p className="text-xs text-rose-600 font-medium">Terendah</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-center">
                    <Target size={20} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-2xl font-black text-slate-700">{averageScore.toFixed(1)}</p>
                    <p className="text-xs text-slate-600 font-medium">Rata-rata Kelas</p>
                </div>

                <div className={`p-4 rounded-xl text-center ${isAboveAverage ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    {isAboveAverage ? (
                        <TrendingUp size={20} className="mx-auto text-emerald-600 mb-2" />
                    ) : (
                        <TrendingDown size={20} className="mx-auto text-amber-600 mb-2" />
                    )}
                    <p className={`text-2xl font-black ${isAboveAverage ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {personalAverage.toFixed(1)}
                    </p>
                    <p className={`text-xs font-medium ${isAboveAverage ? 'text-emerald-600' : 'text-amber-600'}`}>
                        Nilaimu
                    </p>
                </div>
            </div>

            {/* Comparison Message */}
            <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium ${isAboveAverage
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                {isAboveAverage
                    ? `🎉 Nilaimu ${(personalAverage - averageScore).toFixed(1)} poin di atas rata-rata!`
                    : `💪 Ayo tingkatkan! Kamu perlu ${(averageScore - personalAverage).toFixed(1)} poin lagi.`
                }
            </div>
        </div>
    );
}
