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
                console.warn('Realtime stats not available (using defaults). Ensure get_landing_stats() RPC function is created in Supabase.', err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    return (
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-12 shadow-2xl flex flex-col md:flex-row items-center justify-around gap-8 text-center">
            <div>
                <div className="text-4xl md:text-5xl font-black text-indigo-400 mb-2 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : (stats.users > 0 ? stats.users + '+' : stats.users)}
                </div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Pengguna Aktif</div>
            </div>
            <div className="w-full h-px md:w-px md:h-16 bg-white/10"></div>
            <div>
                <div className="text-4xl md:text-5xl font-black text-purple-400 mb-2 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : (stats.schools > 0 ? stats.schools + '+' : stats.schools)}
                </div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Sekolah</div>
            </div>
            <div className="w-full h-px md:w-px md:h-16 bg-white/10"></div>
            <div>
                <div className="text-4xl md:text-5xl font-black text-pink-400 mb-2 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : (stats.submissions > 0 ? stats.submissions + '+' : stats.submissions)}
                </div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Tugas Dinilai</div>
            </div>
        </div>
    );
}
