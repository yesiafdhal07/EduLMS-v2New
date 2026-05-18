'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { Search, ArrowRight, Command, CornerDownLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    action?: () => void;
    href?: string;
    category: string;
    keywords?: string[];
}

interface CommandPaletteProps {
    items: CommandItem[];
    accentColor?: string;
    shortcutKey?: string;
    requireModifier?: boolean;
}

export function CommandPalette({ items, accentColor = 'indigo', shortcutKey = 'k', requireModifier = true }: CommandPaletteProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const isTargetInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
            if (isTargetInput) return;

            const modifierCondition = requireModifier ? (e.metaKey || e.ctrlKey) : true;
            if (modifierCondition && e.key.toLowerCase() === shortcutKey.toLowerCase()) {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === 'Escape') setOpen(false);
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (query) {
            setIsScanning(true);
            const timer = setTimeout(() => setIsScanning(false), 300);
            return () => clearTimeout(timer);
        }
    }, [query]);

    // Phase 7: Deep Heuristic Semantic Matching (Local)
    const getHeuristicScore = (item: CommandItem, q: string) => {
        let score = 0;
        const lowerQ = q.toLowerCase();
        
        // Semantic map for non-exact intent matching
        const semanticMap: Record<string, string[]> = {
            'masalah': ['alert', 'intervensi', 'health', 'error', 'bermasalah', 'monitoring'],
            'murid': ['siswa', 'kelas', 'pembelajaran', 'kehadiran', 'profil'],
            'kerja': ['tugas', 'absensi', 'grade', 'penilaian', 'pembelajaran'],
            'setelan': ['kebijakan', 'profil', 'pengaturan', 'akun', 'settings'],
        };

        // If query matches a semantic group, check if item keywords/labels match that group
        for (const [intent, keywords] of Object.entries(semanticMap)) {
            if (intent.includes(lowerQ) || lowerQ.includes(intent)) {
                if (keywords.some(k => item.label.toLowerCase().includes(k) || item.keywords?.some(ik => ik.toLowerCase().includes(k)))) {
                    score += 50; // High intent match
                }
            }
        }

        if (item.label.toLowerCase().includes(lowerQ)) score += 100;
        if (item.description?.toLowerCase().includes(lowerQ)) score += 40;
        if (item.keywords?.some(k => k.toLowerCase().includes(lowerQ))) score += 70;

        return score;
    };

    const filtered = query.trim()
        ? items
            .map(item => ({ item, score: getHeuristicScore(item, query) }))
            .filter(res => res.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(res => res.item)
        : items;

    const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    const flatList = Object.values(grouped).flat();

    const execute = useCallback((item: CommandItem) => {
        setOpen(false);
        if (item.action) item.action();
        else if (item.href) router.push(item.href);
    }, [router]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, flatList.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && flatList[selectedIndex]) {
            e.preventDefault();
            execute(flatList[selectedIndex]);
        }
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    if (!open) return null;

    const accentClasses: Record<string, string> = {
        rose: 'ring-rose-500/30 bg-rose-500/10',
        amber: 'ring-amber-500/30 bg-amber-500/10',
        indigo: 'ring-indigo-500/30 bg-indigo-500/10',
        emerald: 'ring-emerald-500/30 bg-emerald-500/10',
    };
    const selectedBg = accentClasses[accentColor] || accentClasses.indigo;

    let flatIdx = 0;

    return (
        <div className="fixed inset-0 z-[99990] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
            {/* Enhanced backdrop with blur */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />
            
            {/* Glassmorphism container */}
            <div
                className="relative w-full max-w-xl rounded-2xl overflow-hidden"
                style={{
                    background: 'linear-gradient(180deg, rgba(20, 30, 53, 0.95) 0%, rgba(13, 21, 38, 0.98) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.1), 0 0 40px -10px rgba(99, 102, 241, 0.2)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 relative" style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.05), transparent)' }}>
                    <div className="relative">
                        <Search size={18} className={`${isScanning ? 'text-indigo-400' : 'text-slate-400'} transition-colors shrink-0`} />
                        {isScanning && (
                            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500 animate-pulse" />
                        )}
                    </div>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Cari aksi, navigasi, atau ketik '/' untuk command..."
                        className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-sm font-medium"
                    />
                    {isScanning && (
                        <div className="absolute bottom-0 left-0 h-[1px] bg-indigo-500 animate-marquee w-full opacity-50" />
                    )}
                    <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-lg text-[10px] text-slate-500 font-mono border border-white/5">
                        ESC
                    </kbd>
                </div>

                <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
                    {Object.entries(grouped).map(([category, categoryItems]) => (
                        <Fragment key={category}>
                            <div className="px-3 pt-3 pb-1.5">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{category}</span>
                            </div>
                            {categoryItems.map(item => {
                                const idx = flatIdx++;
                                const isSelected = idx === selectedIndex;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => execute(item)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isSelected ? `${selectedBg} ring-1` : 'hover:bg-white/5'}`}
                                    >
                                        {item.icon && <div className="text-slate-400 shrink-0">{item.icon}</div>}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{item.label}</p>
                                            {item.description && <p className="text-[11px] text-slate-500 truncate">{item.description}</p>}
                                        </div>
                                        {isSelected && <CornerDownLeft size={14} className="text-slate-500 shrink-0" />}
                                    </button>
                                );
                            })}
                        </Fragment>
                    ))}
                    {flatList.length === 0 && (
                        <div className="py-8 text-center text-slate-500 text-sm">Tidak ada hasil untuk &ldquo;{query}&rdquo;</div>
                    )}
                </div>

                <div className="flex items-center gap-4 px-5 py-3 border-t border-white/5 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1"><ArrowRight size={10} /> Navigasi</span>
                    <span className="flex items-center gap-1"><CornerDownLeft size={10} /> Pilih</span>
                    <span className="flex items-center gap-1">
                        {requireModifier && <Command size={10} />}
                        <span className="uppercase">{shortcutKey}</span> Buka/Tutup
                    </span>
                </div>
            </div>
        </div>
    );
}
