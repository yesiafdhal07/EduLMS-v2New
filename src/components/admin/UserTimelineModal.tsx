'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Activity, Shield, Users, FileEdit, Trash2, ShieldCheck, UserPlus, Power } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { DetailDrawer, Spinner } from '@/components/ui';

interface UserTimelineModalProps {
    userId: string;
    userName: string;
    role: string;
    open: boolean;
    onClose: () => void;
}

export function UserTimelineModal({ userId, userName, role, open, onClose }: UserTimelineModalProps) {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open) return;
        let isMounted = true;
        
        async function fetchTimeline() {
            setLoading(true);
            // Fetch events where the user is the actor OR the target (entity_id)
            const { data } = await supabase
                .from('audit_logs')
                .select('*')
                .or(`actor_id.eq.${userId},entity_id.eq.${userId}`)
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (isMounted) {
                setEvents(data || []);
                setLoading(false);
            }
        }
        
        fetchTimeline();
        
        return () => {
            isMounted = false;
        };
    }, [userId, open]);

    const getActionColor = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes('create') || a.includes('register') || a.includes('add')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (a.includes('delete') || a.includes('remove') || a.includes('deactivate')) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        if (a.includes('update') || a.includes('edit') || a.includes('modify') || a.includes('role')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        if (a.includes('auth') || a.includes('login') || a.includes('logout')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    };

    const getActionIcon = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes('create') || a.includes('register') || a.includes('add')) return <UserPlus size={16} />;
        if (a.includes('delete') || a.includes('remove') || a.includes('deactivate')) return <Trash2 size={16} />;
        if (a.includes('update') || a.includes('edit') || a.includes('modify') || a.includes('role')) return <FileEdit size={16} />;
        if (a.includes('auth') || a.includes('login') || a.includes('logout')) return <ShieldCheck size={16} />;
        return <Activity size={16} />;
    };

    return (
        <DetailDrawer
            open={open}
            onClose={onClose}
            title={userName}
            subtitle={`Timeline Aktivitas • ${role.toUpperCase()}`}
        >
            <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar bg-[#0F1014]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Spinner />
                        <span className="text-slate-400 font-bold text-sm">Menarik data timeline...</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Clock size={24} className="text-slate-500" />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2">Tidak Ada Aktivitas</h3>
                        <p className="text-slate-500">Belum ada rekam jejak aktivitas untuk user ini.</p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />
                        
                        <div className="space-y-8">
                            {events.map((event, idx) => (
                                <div key={event.id} className="relative flex gap-6 group">
                                    <div className={`relative z-10 w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${getActionColor(event.action)}`}>
                                        {getActionIcon(event.action)}
                                    </div>
                                    
                                    <div className="flex-1 bg-[#12141A] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <h4 className="text-sm font-black text-white">{event.action}</h4>
                                            <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-md uppercase tracking-widest flex items-center gap-1.5 w-fit">
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: id })}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {event.actor_id === userId ? (
                                                <>
                                                    Melakukan <span className="font-bold text-white">{event.action}</span> pada <span className="text-rose-400 font-mono px-1 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">{event.entity_type}</span>
                                                </>
                                            ) : (
                                                <>
                                                    Menerima <span className="font-bold text-white">{event.action}</span> dari admin (<span className="text-slate-300 font-mono text-xs">{event.actor_id.slice(0, 8)}...</span>)
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DetailDrawer>
    );
}
