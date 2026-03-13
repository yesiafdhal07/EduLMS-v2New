'use client';

import { Crown } from 'lucide-react';

interface LeaderboardEntry {
    id: string;
    name: string;
    avatar?: string;
    xp: number;
    level: number;
    rank: number;
}

interface LeaderboardWidgetProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
    className?: string;
}

export function LeaderboardWidget({ entries, currentUserId, className = '' }: LeaderboardWidgetProps) {
    const topThree = entries.slice(0, 3);
    const rest = entries.slice(3, 10); // Show up to 10

    return (
        <div className={`glass-panel rounded-[2.5rem] p-8 ${className}`}>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                    <Crown size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white">Papan Peringkat</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Kelas XII IPA 1</p>
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-4 mb-8 h-48">
                {/* 2nd Place */}
                <div className="flex flex-col items-center w-1/3 h-full justify-end">
                    <div className="mb-2 relative">
                        <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center overflow-hidden">
                            <span className="font-bold text-white text-xl">{topThree[1]?.name?.charAt(0)}</span>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-slate-400 shadow-lg">
                            #2
                        </div>
                    </div>
                    <div 
                        className="w-full bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl relative group animate-in slide-in-from-bottom duration-1000"
                        style={{ height: '60%' }}
                    >
                         <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-white font-bold text-sm truncate px-2">{topThree[1]?.name.split(' ')[0]}</p>
                            <p className="text-slate-400 text-xs font-medium">{topThree[1]?.xp} XP</p>
                        </div>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center w-1/3 h-full z-10 justify-end">
                     <div className="mb-2 relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                            <Crown size={24} fill="currentColor" />
                        </div>
                        <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                            <span className="font-bold text-amber-100 text-2xl">{topThree[0]?.name?.charAt(0)}</span>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-0.5 rounded-full border border-amber-300 shadow-lg">
                            #1
                        </div>
                    </div>
                    <div 
                        className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-2xl relative shadow-lg shadow-amber-900/20 animate-in slide-in-from-bottom duration-1000 delay-200 fill-mode-both"
                        style={{ height: '85%' }}
                    >
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-white font-bold text-lg truncate px-2">{topThree[0]?.name.split(' ')[0]}</p>
                            <p className="text-amber-100 text-sm font-medium">{topThree[0]?.xp} XP</p>
                        </div>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center w-1/3 h-full justify-end">
                    <div className="mb-2 relative">
                        <div className="w-16 h-16 rounded-full bg-orange-900/50 border-2 border-orange-700 flex items-center justify-center overflow-hidden">
                            <span className="font-bold text-orange-200 text-xl">{topThree[2]?.name?.charAt(0)}</span>
                        </div>
                         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-orange-100 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-500 shadow-lg">
                            #3
                        </div>
                    </div>
                     <div 
                        className="w-full bg-gradient-to-t from-orange-800 to-orange-700 rounded-t-2xl relative animate-in slide-in-from-bottom duration-1000 delay-500 fill-mode-both"
                        style={{ height: '45%' }}
                    >
                         <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-white font-bold text-sm truncate px-2">{topThree[2]?.name.split(' ')[0]}</p>
                            <p className="text-orange-300 text-xs font-medium">{topThree[2]?.xp} XP</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List for the rest */}
            <div className="space-y-3">
                {rest.map((entry) => (
                    <div 
                        key={entry.id}
                        className={`
                            flex items-center gap-4 p-3 rounded-xl transition-all
                            ${entry.id === currentUserId 
                                ? 'bg-indigo-500/20 border border-indigo-500/30' 
                                : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50'
                            }
                        `}
                    >
                        <div className="w-6 text-center font-bold text-slate-500 text-sm">
                            {entry.rank}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                            {entry.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold ${entry.id === currentUserId ? 'text-indigo-300' : 'text-slate-300'}`}>
                                {entry.name}
                                {entry.id === currentUserId && <span className="text-[10px] ml-2 px-1.5 py-0.5 bg-indigo-500 text-white rounded-md">You</span>}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm font-black text-slate-400">{entry.xp} <span className="text-[10px] font-medium text-slate-600">XP</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
