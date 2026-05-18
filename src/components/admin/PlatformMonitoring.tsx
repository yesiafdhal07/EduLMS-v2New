'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Users, UserPlus, TrendingUp, School, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { KPICard } from '@/components/ui/KPICard';
import { UniverseSkeleton } from '@/components/ui/UniverseSkeleton';
import { PlatformPulse } from '@/components/admin/PlatformPulse';

interface MonitoringData {
    activeUsersToday: number;
    signupsToday: number;
    totalLogins30d: number;
    recentAudit: { id: string; action: string; actor_role: string; entity_type: string; created_at: string }[];
    topSchools: { school_name: string; user_count: number }[];
}

type TopSchoolRow = { school_name: string; siswa_count: number | null; guru_count: number | null };

export function PlatformMonitoring() {
    const [data, setData] = useState<MonitoringData>({
        activeUsersToday: 0,
        signupsToday: 0,
        totalLogins30d: 0,
        recentAudit: [],
        topSchools: [],
    });
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchData = useCallback(async () => {
        const today = new Date().toISOString().split('T')[0];

        const [usersRes, auditRes, schoolStatsRes] = await Promise.all([
            supabase.from('users').select('id, created_at, school_id', { count: 'exact' }),
            supabase.from('audit_logs').select('id, action, actor_role, entity_type, created_at').order('created_at', { ascending: false }).limit(20),
            supabase.from('admin_school_health').select('school_name, siswa_count, guru_count').order('siswa_count', { ascending: false }).limit(5),
        ]);

        const allUsers = usersRes.data || [];
        const signupsToday = allUsers.filter(u => u.created_at?.startsWith(today)).length;

        setData({
            activeUsersToday: allUsers.length,
            signupsToday,
            totalLogins30d: usersRes.count || 0,
            recentAudit: (auditRes.data || []) as MonitoringData['recentAudit'],
            topSchools: ((schoolStatsRes.data || []) as TopSchoolRow[]).map((s) => ({
                school_name: s.school_name,
                user_count: (s.siswa_count || 0) + (s.guru_count || 0),
            })),
        });
        setLoading(false);
        setLastRefresh(new Date());
    }, []);

    useEffect(() => {
        const t = setTimeout(() => { void fetchData(); }, 0);
        return () => clearTimeout(t);
    }, [fetchData]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <UniverseSkeleton type="stats" role="admin" count={3} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <UniverseSkeleton type="list" role="admin" count={5} />
                    <UniverseSkeleton type="list" role="admin" count={5} />
                </div>
            </div>
        );
    }

    // F-21: Relative refresh time
    const getRelativeTime = () => {
        if (!lastRefresh) return '';
        const diff = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
        if (diff < 60) return `${diff}d lalu`;
        return `${Math.floor(diff / 60)}m lalu`;
    };

    return (
        <div className="space-y-6">
            {/* F-21: Refresh indicator */}
            <div className="flex items-center justify-end gap-2">
                <span className="text-[10px] text-slate-600 font-mono">
                    {lastRefresh ? `Updated ${getRelativeTime()}` : ''}
                </span>
                <button
                    onClick={() => { setLoading(true); void fetchData(); }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                    title="Refresh data"
                >
                    <RefreshCw size={12} />
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KPICard
                    label="Total User"
                    value={data.activeUsersToday}
                    icon={<Users size={20} />}
                    accentColor="#F43F5E"
                />
                <KPICard
                    label="Signup Hari Ini"
                    value={data.signupsToday}
                    icon={<UserPlus size={20} />}
                    accentColor="#F43F5E"
                />
                <KPICard
                    label="Total Terdaftar"
                    value={data.totalLogins30d}
                    icon={<TrendingUp size={20} />}
                    accentColor="#F43F5E"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#181A20] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                        <School size={16} className="text-rose-400" />
                        Sekolah Terbesar
                    </h3>
                    <div className="space-y-2">
                        {data.topSchools.map((s, i) => (
                            <div key={i} className="flex items-center justify-between bg-[#0F1014] rounded-xl px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-slate-500 w-5">#{i + 1}</span>
                                    <span className="text-sm font-bold text-white">{s.school_name}</span>
                                </div>
                                <span className="text-xs font-bold text-rose-400">{s.user_count} user</span>
                            </div>
                        ))}
                        {data.topSchools.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">Belum ada data.</p>
                        )}
                    </div>
                </div>

                <div className="bg-[#181A20] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                    <PlatformPulse />
                </div>
            </div>
        </div>
    );
}
