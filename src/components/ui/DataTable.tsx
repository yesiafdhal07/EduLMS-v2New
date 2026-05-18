'use client';

import { useState, useMemo, ReactNode } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (row: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchable?: boolean;
    searchKeys?: string[];
    pageSize?: number;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
    data, columns, searchable = true, searchKeys = [], pageSize = 15, emptyMessage = 'Tidak ada data.', onRowClick,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(0);

    const filtered = useMemo(() => {
        let result = data;
        if (search.trim()) {
            const q = search.toLowerCase();
            const keys = searchKeys.length ? searchKeys : columns.map(c => c.key);
            result = result.filter(row => keys.some(k => String(row[k] ?? '').toLowerCase().includes(q)));
        }
        if (sortKey) {
            result = [...result].sort((a, b) => {
                const av = a[sortKey] ?? '';
                const bv = b[sortKey] ?? '';
                const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
                return sortDir === 'asc' ? cmp : -cmp;
            });
        }
        return result;
    }, [data, search, sortKey, sortDir, searchKeys, columns]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

    const toggleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    return (
        <div className="space-y-3">
            {searchable && (
                <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Cari..." className="w-full sm:w-72 bg-[#0F1014] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-white/10 text-sm font-medium" />
                </div>
            )}
            <div className="bg-[#181A20] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                {columns.map(col => (
                                    <th key={col.key}
                                        className={`text-left px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ${col.sortable !== false ? 'cursor-pointer select-none hover:text-slate-300' : ''} ${col.className || ''}`}
                                        onClick={() => col.sortable !== false && toggleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map((row, i) => (
                                <tr key={i} onClick={() => onRowClick?.(row)}
                                    className={`border-b border-white/[0.03] transition-colors ${onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`px-5 py-3 ${col.className || ''}`}>
                                            {col.render ? col.render(row) : <span className="text-slate-300">{String(row[col.key] ?? '-')}</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {paged.length === 0 && (
                    <div className="py-10 text-center text-slate-500 text-sm font-medium">{emptyMessage}</div>
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{filtered.length} data &middot; Halaman {page + 1}/{totalPages}</span>
                    <div className="flex gap-1">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"><ChevronRight size={14} /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
