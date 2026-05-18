'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Clock, Search, School, Settings, Shield, RefreshCw, ChevronDown, ChevronUp, Calendar, AlertTriangle, Eye, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuditEntry {
    id: string;
    actor_id: string;
    actor_role: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_data: unknown;
    new_data: unknown;
    created_at: string;
}

const ACTION_ICONS: Record<string, LucideIcon> = {
    create_school: School,
    deactivate_school: School,
    activate_school: School,
    regenerate_code: RefreshCw,
    change_role: Shield,
};

const ACTION_LABELS: Record<string, string> = {
    create_school: 'Membuat sekolah',
    deactivate_school: 'Menonaktifkan sekolah',
    activate_school: 'Mengaktifkan sekolah',
    regenerate_code: 'Memperbarui kode',
    change_role: 'Mengubah role user',
};

// BUG-12 FIX: Risk level per action type
const ACTION_RISK: Record<string, { level: 'high' | 'medium' | 'low'; color: string; bg: string }> = {
    deactivate_school: { level: 'high', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    change_role: { level: 'high', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    activate_school: { level: 'medium', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    regenerate_code: { level: 'medium', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    create_school: { level: 'low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export function AuditTimeline() {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [limit, setLimit] = useState(30);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    // BUG-08 FIX: Date range filter
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchAudit = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (actionFilter !== 'all') {
            query = query.eq('action', actionFilter);
        }

        // BUG-08: Date range filtering
        if (dateFrom) {
            query = query.gte('created_at', new Date(dateFrom).toISOString());
        }
        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endDate.toISOString());
        }

        const { data } = await query;
        setEntries((data || []) as AuditEntry[]);
        setLoading(false);
    }, [actionFilter, limit, dateFrom, dateTo]);

    useEffect(() => {
        const t = setTimeout(() => { void fetchAudit(); }, 0);
        return () => clearTimeout(t);
    }, [fetchAudit]);

    // Sprint 4: Natural Language Audit Search
    const filtered = search
        ? entries.filter(e => {
            const query = search.toLowerCase();
            
            // Fast text NLP rules
            if ((query.includes('buat') || query.includes('bikin')) && query.includes('sekolah') && e.action !== 'create_school') return false;
            if ((query.includes('mati') || query.includes('nonaktif')) && query.includes('sekolah') && e.action !== 'deactivate_school') return false;
            if ((query.includes('nyala') || query.includes('aktif')) && query.includes('sekolah') && e.action !== 'activate_school') return false;
            if ((query.includes('reset') || query.includes('ganti') || query.includes('regenerasi')) && query.includes('kode') && e.action !== 'regenerate_code') return false;
            if ((query.includes('ubah') || query.includes('ganti')) && query.includes('role') && e.action !== 'change_role') return false;

            // Remove stop words and perform AND text search
            const stopWords = ['cari', 'yang', 'tampilkan', 'tolong', 'mana'];
            const words = query.split(' ').filter(w => !stopWords.includes(w) && w.trim().length > 0);
            
            if (words.length === 0) return true; // if only stop words were typed

            for (const word of words) {
                const actionMatch = e.action.includes(word);
                const entityMatch = e.entity_type.includes(word);
                const actorMatch = e.actor_role.toLowerCase().includes(word);
                const entityIdMatch = e.entity_id?.toLowerCase().includes(word);
                const dataMatch = (
                    (e.new_data ? JSON.stringify(e.new_data).toLowerCase().includes(word) : false) ||
                    (e.old_data ? JSON.stringify(e.old_data).toLowerCase().includes(word) : false)
                );
                
                if (!actionMatch && !entityMatch && !actorMatch && !entityIdMatch && !dataMatch) {
                    return false;
                }
            }
            return true;
          })
        : entries;

    const clearFilters = () => {
        setSearch('');
        setActionFilter('all');
        setDateFrom('');
        setDateTo('');
    };

    const hasActiveFilters = search || actionFilter !== 'all' || dateFrom || dateTo;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Clock size={20} className="text-rose-400" />
                <h3 className="text-lg font-black text-white">Audit Timeline</h3>
                <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-bold">{filtered.length} entri</span>
                {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest transition-colors">
                        Reset Filter
                    </button>
                )}
            </div>

            {/* Filter Controls — BUG-08 FIX: Added date range */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Contoh: tampilkan yang matiin sekolah..."
                        className="w-full bg-[#0F1014] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-white/10 text-sm font-medium" />
                </div>
                <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
                    className="bg-[#0F1014] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm font-medium focus:outline-none appearance-none cursor-pointer">
                    <option value="all">Semua Aksi</option>
                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-500 shrink-0" />
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="bg-[#0F1014] border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-white/10 [color-scheme:dark]" />
                    <span className="text-slate-600 text-xs">—</span>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="bg-[#0F1014] border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-white/10 [color-scheme:dark]" />
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
            ) : (
                <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-white/5" />
                    <div className="space-y-1">
                        {filtered.map(entry => {
                            const IconComp = ACTION_ICONS[entry.action] || Settings;
                            const label = ACTION_LABELS[entry.action] || entry.action;
                            const risk = ACTION_RISK[entry.action] || { level: 'low', color: 'text-slate-400', bg: 'bg-white/5' };
                            const isExpanded = expandedId === entry.id;

                            return (
                                <div key={entry.id} className="relative pl-12 py-3 hover:bg-white/[0.02] rounded-xl transition-colors">
                                    {/* Timeline dot with risk color */}
                                    <div className={`absolute left-3 top-4 w-4 h-4 ${risk.bg} border-2 ${risk.level === 'high' ? 'border-rose-500/60' : risk.level === 'medium' ? 'border-amber-500/40' : 'border-white/10'} rounded-full flex items-center justify-center`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${risk.level === 'high' ? 'bg-rose-400' : risk.level === 'medium' ? 'bg-amber-400' : 'bg-slate-500'}`} />
                                    </div>

                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-bold text-white">{label}</p>
                                                {/* Risk badge */}
                                                <span className={`${risk.bg} ${risk.color} px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-current/20`}>
                                                    {risk.level === 'high' ? '🔴 HIGH' : risk.level === 'medium' ? '🟡 MED' : '🟢 LOW'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">
                                                <span className="text-rose-400/60">{entry.actor_role}</span> &middot; {entry.entity_type}
                                                {entry.entity_id && <span className="text-slate-600 font-mono"> ({entry.entity_id.slice(0, 8)}...)</span>}
                                            </p>

                                            {/* BUG-12 FIX: Expandable data detail */}
                                            {(entry.new_data != null || entry.old_data != null) && (
                                                <button
                                                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                                                    className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                                                >
                                                    {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                                    {isExpanded ? 'Sembunyikan Detail' : 'Lihat Detail Data'}
                                                </button>
                                            )}

                                            {isExpanded && (
                                                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {entry.old_data != null && (
                                                        <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
                                                            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Data Sebelum (Old)</p>
                                                            <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                                                                {JSON.stringify(entry.old_data, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {entry.new_data != null && (
                                                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                                                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Data Sesudah (New)</p>
                                                            <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                                                                {JSON.stringify(entry.new_data, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <span className="text-[10px] text-slate-600 font-medium font-mono shrink-0 whitespace-nowrap">
                                            {new Date(entry.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {filtered.length >= limit && (
                <button onClick={() => setLimit(l => l + 30)}
                    className="w-full py-3 bg-white/5 rounded-xl text-slate-400 text-xs font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                    <ChevronDown size={14} /> Muat Lebih Banyak
                </button>
            )}

            {filtered.length === 0 && !loading && (
                <div className="text-center py-12 text-slate-500">
                    <Clock size={32} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-bold">Belum ada aktivitas tercatat.</p>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="mt-2 text-xs text-rose-400 hover:text-rose-300 font-bold">
                            Reset semua filter
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
