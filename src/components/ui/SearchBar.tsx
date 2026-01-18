'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, BookOpen, Loader2 } from 'lucide-react';

interface SearchResult {
    id: string;
    title: string;
    type: 'material' | 'assignment';
    url?: string;
    deadline?: string;
}

interface SearchBarProps {
    materials: { id: string; title: string; content_url?: string }[];
    assignments: { id: string; title: string; deadline?: string }[];
    onSelect?: (result: SearchResult) => void;
    placeholder?: string;
}

export function SearchBar({
    materials = [],
    assignments = [],
    onSelect,
    placeholder = 'Cari materi atau tugas... (Ctrl+K)'
}: SearchBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Search logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        const lowerQuery = query.toLowerCase();

        const materialResults: SearchResult[] = materials
            .filter(m => m.title.toLowerCase().includes(lowerQuery))
            .map(m => ({
                id: m.id,
                title: m.title,
                type: 'material' as const,
                url: m.content_url
            }));

        const assignmentResults: SearchResult[] = assignments
            .filter(a => a.title.toLowerCase().includes(lowerQuery))
            .map(a => ({
                id: a.id,
                title: a.title,
                type: 'assignment' as const,
                deadline: a.deadline
            }));

        setResults([...materialResults, ...assignmentResults].slice(0, 10));
        setSelectedIndex(0);
        setLoading(false);
    }, [query, materials, assignments]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+K to open
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }

            // Escape to close
            if (e.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Keyboard navigation in results
    const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    }, [results, selectedIndex]);

    const handleSelect = (result: SearchResult) => {
        onSelect?.(result);
        setIsOpen(false);
        setQuery('');
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 100);
                }}
                className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                aria-label="Buka pencarian"
            >
                <Search size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm text-slate-400 hidden md:inline">Cari...</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-500 font-mono">
                    <span>Ctrl</span>
                    <span>K</span>
                </kbd>
            </button>

            {/* Search Modal */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Search Dialog */}
                    <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] animate-in zoom-in-95 slide-in-from-top-4 duration-200">
                        <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                            {/* Input */}
                            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                                <Search size={20} className="text-slate-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyNavigation}
                                    placeholder={placeholder}
                                    className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm font-medium"
                                    aria-label="Pencarian"
                                    autoComplete="off"
                                />
                                {loading && <Loader2 size={18} className="text-slate-400 animate-spin" />}
                                {query && !loading && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                        aria-label="Hapus pencarian"
                                    >
                                        <X size={16} className="text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {/* Results */}
                            <div className="max-h-80 overflow-y-auto">
                                {results.length > 0 ? (
                                    <ul role="listbox" className="p-2">
                                        {results.map((result, index) => (
                                            <li key={result.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelect(result)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${index === selectedIndex
                                                            ? 'bg-indigo-600/20 border border-indigo-500/30'
                                                            : 'hover:bg-white/5 border border-transparent'
                                                        }`}
                                                    role="option"
                                                    aria-selected={index === selectedIndex}
                                                >
                                                    <div className={`p-2 rounded-lg ${result.type === 'material'
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : 'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {result.type === 'material' ? (
                                                            <BookOpen size={16} />
                                                        ) : (
                                                            <FileText size={16} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-white truncate">
                                                            {result.title}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {result.type === 'material' ? 'Materi' : 'Tugas'}
                                                            {result.deadline && ` • Deadline: ${new Date(result.deadline).toLocaleDateString('id-ID')}`}
                                                        </p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : query ? (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-400 text-sm">Tidak ditemukan hasil untuk "{query}"</p>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-500 text-sm">Ketik untuk mencari materi atau tugas...</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↑</kbd>
                                        <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↓</kbd>
                                        Navigasi
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">Enter</kbd>
                                        Pilih
                                    </span>
                                </div>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">Esc</kbd>
                                    Tutup
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
