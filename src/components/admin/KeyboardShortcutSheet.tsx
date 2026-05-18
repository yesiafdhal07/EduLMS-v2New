'use client';

import { useState, useEffect, Fragment } from 'react';
import { Command, ArrowUp, ArrowDown, CornerDownLeft, X, Keyboard } from 'lucide-react';

interface ShortcutGroup {
    category: string;
    shortcuts: { keys: string[]; description: string }[];
}

const ADMIN_SHORTCUTS: ShortcutGroup[] = [
    {
        category: 'Navigasi',
        shortcuts: [
            { keys: ['Ctrl', 'K'], description: 'Command Palette — cari perintah' },
            { keys: ['?'], description: 'Tampilkan cheatsheet ini' },
            { keys: ['Esc'], description: 'Tutup dialog/modal' },
        ],
    },
    {
        category: 'Tabel & Data',
        shortcuts: [
            { keys: ['↑', '↓'], description: 'Navigasi item dalam Command Palette' },
            { keys: ['Enter'], description: 'Pilih/eksekusi item yang disorot' },
            { keys: ['D'], description: 'Toggle density (Compact ↔ Default ↔ Comfortable)' },
        ],
    },
    {
        category: 'Quick Actions',
        shortcuts: [
            { keys: ['1'], description: 'Pindah ke Overview' },
            { keys: ['2'], description: 'Pindah ke Health Radar' },
            { keys: ['3'], description: 'Pindah ke Sekolah' },
            { keys: ['4'], description: 'Pindah ke User' },
            { keys: ['5'], description: 'Pindah ke Monitoring' },
            { keys: ['6'], description: 'Pindah ke Audit Log' },
            { keys: ['7'], description: 'Pindah ke Kebijakan' },
        ],
    },
];

export function KeyboardShortcutSheet() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const isTargetInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
            if (isTargetInput) return;

            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === 'Escape') setOpen(false);
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[99985] flex items-center justify-center" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-lg bg-[#12141A] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                            <Keyboard size={20} className="text-rose-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white">KEYBOARD SHORTCUTS</h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Mission Control Cheatsheet</p>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Shortcuts List */}
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-5">
                    {ADMIN_SHORTCUTS.map(group => (
                        <Fragment key={group.category}>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{group.category}</p>
                                <div className="space-y-1">
                                    {group.shortcuts.map((shortcut, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                                            <span className="text-xs text-slate-300 font-medium">{shortcut.description}</span>
                                            <div className="flex items-center gap-1 shrink-0 ml-4">
                                                {shortcut.keys.map((key, ki) => (
                                                    <Fragment key={ki}>
                                                        {ki > 0 && <span className="text-slate-600 text-[10px] mx-0.5">+</span>}
                                                        <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono font-bold text-slate-400">
                                                            {key === 'Ctrl' && <Command size={10} className="mr-0.5" />}
                                                            {key === '↑' && <ArrowUp size={10} />}
                                                            {key === '↓' && <ArrowDown size={10} />}
                                                            {key === 'Enter' && <CornerDownLeft size={10} />}
                                                            {!['Ctrl', '↑', '↓', 'Enter'].includes(key) && key}
                                                        </kbd>
                                                    </Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Fragment>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600">Tekan <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-slate-400 font-mono border border-white/5">?</kbd> untuk toggle</span>
                    <span className="text-[10px] text-slate-600">v1.0 · Admin Panel</span>
                </div>
            </div>
        </div>
    );
}
