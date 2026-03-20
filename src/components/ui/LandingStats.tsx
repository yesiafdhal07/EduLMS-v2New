'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, School, GraduationCap, Loader2 } from 'lucide-react';

export default function LandingStats() {
    const [stats, setStats] = useState({
        users: 0,
        schools: 0,
        submissions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const { data, error } = await supabase.rpc('get_landing_stats');
                if (error) throw error;
                if (data) {
                    setStats({
                        users: data.users ?? 0,
                        schools: data.schools ?? 0,
                        submissions: data.grades ?? 0
                    });
                }
            } catch (err) {
                console.warn('Realtime stats not available (using defaults).', err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statItems = [
        {
            value: stats.users,
            label: 'Pengguna Aktif',
            icon: Users,
        },
        {
            value: stats.schools,
            label: 'Sekolah',
            icon: School,
        },
        {
            value: stats.submissions,
            label: 'Tugas Dinilai',
            icon: GraduationCap,
        }
    ];

    return (
        <div className="max-w-4xl mx-auto rounded-3xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-10 flex flex-col md:flex-row items-center justify-around gap-8 text-center shadow-2xl shadow-black/20">
            {statItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                    {idx > 0 && (
                        <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent -ml-4 mr-4"></div>
                    )}
                    <div>
                        <div className="text-4xl md:text-5xl font-black text-gradient-cyan mb-1 flex items-center justify-center gap-2">
                            {loading ? (
                                <Loader2 className="animate-spin text-cyan-400" size={32} />
                            ) : (
                                item.value > 0 ? `${item.value}+` : item.value
                            )}
                        </div>
                        <div className="text-gray-500 font-bold uppercase tracking-[0.15em] text-xs">{item.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
