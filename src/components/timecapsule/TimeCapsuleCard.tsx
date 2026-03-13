'use client';

import { useState, useEffect } from 'react';
import { Lock, Calendar, Clock, Sparkles } from 'lucide-react';
import type { TimeCapsule } from '@/hooks/useTimeCapsule';

interface TimeCapsuleCardProps {
    capsule: TimeCapsule;
    onClick?: () => void;
}

export function TimeCapsuleCard({ capsule, onClick }: TimeCapsuleCardProps) {
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
    const unlockDate = new Date(capsule.unlock_date);
    const createdDate = new Date(capsule.created_at);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const diff = unlockDate.getTime() - now.getTime();
            
            if (diff <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0 });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setCountdown({ days, hours, minutes });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [unlockDate]);

    if (capsule.is_unlocked) {
        return (
            <button
                type="button"
                onClick={onClick}
                className="w-full p-6 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-500/20 border border-amber-500/30 rounded-[2rem] text-left group hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
            >
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                        <Sparkles size={28} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                            ✨ Sudah Terbuka!
                        </p>
                        <h3 className="text-lg font-black text-white mb-1">{capsule.title}</h3>
                        <p className="text-sm text-slate-400">
                            Ditulis {createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div className="relative p-6 bg-gradient-to-br from-slate-800/50 via-indigo-900/30 to-slate-800/50 border border-white/10 rounded-[2rem] overflow-hidden group">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                        <Lock size={28} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            🔒 Terkunci
                        </p>
                        <h3 className="text-lg font-black text-white mb-1">{capsule.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar size={14} />
                            <span>Dibuka {unlockDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Countdown */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <p className="text-3xl font-black text-white">{countdown.days}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">Hari</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <p className="text-3xl font-black text-white">{countdown.hours}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">Jam</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <p className="text-3xl font-black text-white">{countdown.minutes}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">Menit</p>
                    </div>
                </div>

                <p className="mt-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                    <Clock size={14} />
                    Sabar ya, waktu akan tiba!
                </p>
            </div>
        </div>
    );
}
