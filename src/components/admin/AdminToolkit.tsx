'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useCountUp — Animated number counter for Mission Control stats.
 * Counts from 0 to `target` over `duration` ms using easeOutExpo.
 */
export function useCountUp(target: number, duration: number = 1200): number {
    const [current, setCurrent] = useState(0);
    const startTime = useRef<number | null>(null);
    const rafId = useRef<number>(0);
    const prevTarget = useRef(0);

    useEffect(() => {
        if (target === prevTarget.current) return;
        const from = prevTarget.current;
        prevTarget.current = target;
        startTime.current = null;

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const elapsed = timestamp - startTime.current;
            const progress = Math.min(elapsed / duration, 1);

            // easeOutExpo curve
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const value = Math.round(from + (target - from) * eased);

            setCurrent(value);

            if (progress < 1) {
                rafId.current = requestAnimationFrame(animate);
            }
        };

        rafId.current = requestAnimationFrame(animate);
        return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
    }, [target, duration]);

    return current;
}

/**
 * DensityToggle — Cycles through compact/default/comfortable density.
 */
type Density = 'compact' | 'default' | 'comfortable';

const DENSITY_ORDER: Density[] = ['compact', 'default', 'comfortable'];
const DENSITY_LABELS: Record<Density, string> = {
    compact: 'Compact',
    default: 'Default',
    comfortable: 'Comfortable',
};
const DENSITY_ICONS: Record<Density, string> = {
    compact: '▪',
    default: '▫',
    comfortable: '□',
};

interface DensityToggleProps {
    density: Density;
    onChangeDensity: (d: Density) => void;
}

export function DensityToggle({ density, onChangeDensity }: DensityToggleProps) {
    const cycle = () => {
        const idx = DENSITY_ORDER.indexOf(density);
        const next = DENSITY_ORDER[(idx + 1) % DENSITY_ORDER.length];
        onChangeDensity(next);
    };

    return (
        <button
            onClick={cycle}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest"
            title={`Density: ${DENSITY_LABELS[density]}`}
        >
            <span className="text-sm">{DENSITY_ICONS[density]}</span>
            <span className="hidden sm:inline">{DENSITY_LABELS[density]}</span>
        </button>
    );
}

/**
 * useDensity — Manages density state with keyboard shortcut ('D') and localStorage persistence.
 */
export function useDensity(): [Density, (d: Density) => void] {
    const [density, setDensityState] = useState<Density>('default');

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('admin-density') as Density | null;
        if (saved && DENSITY_ORDER.includes(saved)) {
            setDensityState(saved);
        }
    }, []);

    const setDensity = useCallback((d: Density) => {
        setDensityState(d);
        localStorage.setItem('admin-density', d);
    }, []);

    // Keyboard shortcut: 'D' to cycle density
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
            if (isInput || e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key.toLowerCase() === 'd') {
                e.preventDefault();
                setDensityState(prev => {
                    const idx = DENSITY_ORDER.indexOf(prev);
                    const next = DENSITY_ORDER[(idx + 1) % DENSITY_ORDER.length];
                    localStorage.setItem('admin-density', next);
                    return next;
                });
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [setDensity]);

    // Apply data attribute to body
    useEffect(() => {
        document.documentElement.setAttribute('data-density', density);
    }, [density]);

    return [density, setDensity];
}

/**
 * ColumnVisibilityToggle — Show/hide columns in a table.
 */
export interface ColumnConfig {
    key: string;
    label: string;
    visible: boolean;
    locked?: boolean; // Cannot be hidden
}

interface ColumnVisibilityProps {
    columns: ColumnConfig[];
    onToggle: (key: string) => void;
}

export function ColumnVisibilityToggle({ columns, onToggle }: ColumnVisibilityProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener('mousedown', handle);
        return () => window.removeEventListener('mousedown', handle);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest"
                title="Toggle kolom"
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                    <rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.8" />
                    <rect x="7" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.3" />
                    <rect x="1" y="7" width="4" height="4" rx="1" fill="currentColor" opacity="0.3" />
                    <rect x="7" y="7" width="4" height="4" rx="1" fill="currentColor" opacity="0.8" />
                </svg>
                <span className="hidden sm:inline">Kolom</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 bg-[#12141A] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-2 min-w-[180px] z-50 animate-in fade-in zoom-in-95 duration-100">
                    <p className="px-2 pt-1 pb-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Tampilkan Kolom</p>
                    {columns.map(col => (
                        <button
                            key={col.key}
                            onClick={() => !col.locked && onToggle(col.key)}
                            disabled={col.locked}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                                col.locked
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : col.visible
                                        ? 'text-white hover:bg-white/5'
                                        : 'text-slate-500 hover:bg-white/5'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                col.visible
                                    ? 'bg-rose-500 border-rose-500'
                                    : 'border-white/20 bg-transparent'
                            }`}>
                                {col.visible && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2.5 5L4.5 7L7.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <span className="font-bold">{col.label}</span>
                            {col.locked && <span className="text-[8px] text-slate-600 ml-auto">🔒</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * useFormDraft — Auto-saves form state to localStorage
 */
export function useFormDraft<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const saved = localStorage.getItem(key);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn('Error reading draft from localStorage', e);
        }
        return initialValue;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(state));
        }
    }, [key, state]);

    const clearDraft = useCallback(() => {
        setState(initialValue);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    }, [key, initialValue]);

    return [state, setState, clearDraft];
}
