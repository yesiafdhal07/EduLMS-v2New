'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity, Clock, ShieldCheck, UserPlus, FileEdit, Trash2, Power } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface PulseEvent {
    id: string;
    action: string;
    actor_id: string;
    actor_role: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
}

export function PlatformPulse() {
    const [events, setEvents] = useState<PulseEvent[]>([]);
    const [isLive, setIsLive] = useState(true);
    const feedRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        const fetchInitial = async () => {
            const { data } = await supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (data) {
                setEvents(data as PulseEvent[]);
            }
        };
        fetchInitial();
    }, []);

    // Real-time subscription
    useEffect(() => {
        if (!isLive) return;

        const channel = supabase.channel('platform-pulse')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs' },
                (payload) => {
                    const newEvent = payload.new as PulseEvent;
                    setEvents(prev => {
                        const next = [newEvent, ...prev];
                        if (next.length > 50) next.pop(); // Keep last 50 events max
                        return next;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLive]);

    const getActionColor = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes('create') || a.includes('register') || a.includes('add')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (a.includes('delete') || a.includes('remove') || a.includes('deactivate')) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        if (a.includes('update') || a.includes('edit') || a.includes('modify')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        if (a.includes('auth') || a.includes('login') || a.includes('logout')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    };

    const getActionIcon = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes('create') || a.includes('register') || a.includes('add')) return <UserPlus size={14} />;
        if (a.includes('delete') || a.includes('remove') || a.includes('deactivate')) return <Trash2 size={14} />;
        if (a.includes('update') || a.includes('edit') || a.includes('modify')) return <FileEdit size={14} />;
        if (a.includes('auth') || a.includes('login') || a.includes('logout')) return <ShieldCheck size={14} />;
        return <Activity size={14} />;
    };

    return (
        <div className="bg-[#12141A] border border-white/5 rounded-2xl flex flex-col h-[500px] overflow-hidden group">
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0F1014]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Activity size={18} className="text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Platform Pulse</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Live Activity Feed</p>
                    </div>
                </div>
                
                {/* Live Indicator */}
                <button 
                    onClick={() => setIsLive(!isLive)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        isLive 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                            : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                    }`}
                >
                    <span className="relative flex h-2 w-2">
                        {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-rose-500' : 'bg-slate-500'}`}></span>
                    </span>
                    {isLive ? 'Live' : 'Paused'}
                </button>
            </div>

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={feedRef}>
                {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                            <Clock size={20} className="text-slate-600" />
                        </div>
                        <p className="text-sm font-bold text-white mb-1">Menunggu Aktivitas</p>
                        <p className="text-xs text-slate-500">Feed akan terupdate secara real-time.</p>
                    </div>
                ) : (
                    events.map((event, idx) => (
                        <div 
                            key={event.id}
                            className={`flex gap-4 p-4 rounded-xl transition-all duration-500 bg-[#0F1014] border border-white/5 hover:border-white/10 ${
                                idx === 0 && isLive ? 'animate-in fade-in slide-in-from-top-4' : ''
                            }`}
                        >
                            <div className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center mt-1 ${getActionColor(event.action)}`}>
                                {getActionIcon(event.action)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm text-slate-300 leading-snug">
                                        <span className="font-bold text-white">{event.actor_role.toUpperCase()}</span>
                                        {' '}melakukan{' '}
                                        <span className="font-bold text-white">{event.action}</span>
                                        {' '}pada{' '}
                                        <span className="text-indigo-400 font-mono text-xs px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">{event.entity_type}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                                        ID: {event.entity_id.split('-')[0]}...
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Clock size={10} />
                                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: id })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Footer fade effect */}
            <div className="h-12 bg-gradient-to-t from-[#12141A] to-transparent absolute bottom-0 left-0 right-0 pointer-events-none" />
        </div>
    );
}
