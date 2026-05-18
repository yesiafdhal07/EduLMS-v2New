'use client';

import { Gift, Coffee, Zap, Ticket, Star, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Reward {
    id: string;
    title: string;
    description: string;
    cost: number;
    icon: any;
    color: string;
    category: 'academic' | 'perk' | 'merch';
}

const REWARDS: Reward[] = [
    {
        id: '1',
        title: 'Voucher Kantin',
        description: 'Potongan Rp 5.000 untuk jajan di kantin sekolah.',
        cost: 1000,
        icon: Coffee,
        color: 'amber',
        category: 'merch',
    },
    {
        id: '2',
        title: 'Deadline Extension',
        description: 'Tambah waktu pengumpulan tugas selama 24 jam.',
        cost: 2500,
        icon: Zap,
        color: 'indigo',
        category: 'academic',
    },
    {
        id: '3',
        title: 'Golden Ticket',
        description: 'Bebas dari satu tugas harian pilihanmu.',
        cost: 5000,
        icon: Ticket,
        color: 'emerald',
        category: 'academic',
    },
    {
        id: '4',
        title: 'E-Certificate',
        description: 'Sertifikat apresiasi digital bertandatangan Kepala Sekolah.',
        cost: 1500,
        icon: Star,
        color: 'purple',
        category: 'perk',
    }
];

export function RewardsSection() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-white">Tukar Poin</h3>
                    <p className="text-slate-400 text-sm">Gunakan XP Anda untuk mendapatkan keuntungan eksklusif.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                    <Gift size={18} className="text-[#B4A3FF]" />
                    <span className="text-sm font-black text-white">Reward Store</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REWARDS.map((reward) => (
                    <RewardCard key={reward.id} reward={reward} />
                ))}
            </div>
        </div>
    );
}

function RewardCard({ reward }: { reward: Reward }) {
    const Icon = reward.icon;
    const [isHovered, setIsHovered] = useState(false);

    const colors: Record<string, string> = {
        amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
        indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400',
        emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
        purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    };

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative overflow-hidden rounded-[2rem] p-6 bg-gradient-to-br border transition-all duration-300 ${colors[reward.color]} hover:scale-[1.02] cursor-pointer`}
        >
            <div className="flex items-start gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                    <Icon size={28} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-black text-white text-lg">{reward.title}</h4>
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white/10">{reward.category}</span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed mb-4">
                        {reward.description}
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#B4A3FF]/20 flex items-center justify-center text-[10px] font-black text-[#B4A3FF] border border-[#B4A3FF]/30">XP</div>
                            <span className="text-sm font-black text-white">{reward.cost.toLocaleString()}</span>
                        </div>
                        <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#B4A3FF] group-hover:gap-2 transition-all">
                            Tukar Sekarang <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Background Glow */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 blur-3xl opacity-20 rounded-full bg-current transition-opacity duration-500 ${isHovered ? 'opacity-40' : 'opacity-20'}`}></div>
        </div>
    );
}
