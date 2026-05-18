'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface DetailDrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: ReactNode;
    width?: string;
}

export function DetailDrawer({ open, onClose, title, subtitle, children, width = 'max-w-md' }: DetailDrawerProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (open) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    return (
        <>
            {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity" onClick={onClose} />}
            <div className={`fixed top-0 right-0 h-full ${width} w-full bg-[#12141A] border-l border-white/5 shadow-2xl z-[9999] transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h3 className="text-lg font-black text-white">{title}</h3>
                        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
                    {children}
                </div>
            </div>
        </>
    );
}
