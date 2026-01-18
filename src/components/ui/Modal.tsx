'use client';

import { XCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-xl'
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className={`bg-[#0F172A] border-t md:border border-white/10 w-full ${maxWidth} rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-black/50 relative z-10 overflow-hidden animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 max-h-[90vh] md:max-h-none flex flex-col`}>
                <div className="p-10 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500 transition-colors"
                        aria-label="Tutup modal"
                    >
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto text-slate-300">
                    {children}
                </div>
                {footer && (
                    <div className="p-10 bg-slate-900/50 border-t border-white/5 flex gap-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ModalFooterProps {
    onCancel: () => void;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
    isLoading?: boolean;
    disabled?: boolean;
}

export function ModalFooter({
    onCancel,
    onConfirm,
    cancelText = 'BATAL',
    confirmText = 'SIMPAN',
    isLoading = false,
    disabled = false
}: ModalFooterProps) {
    return (
        <>
            <button
                onClick={onCancel}
                className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all"
            >
                {cancelText}
            </button>
            <button
                onClick={onConfirm}
                disabled={isLoading || disabled}
                className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transform active:scale-95 transition-all disabled:opacity-50"
            >
                {isLoading ? 'MEMPROSES...' : confirmText}
            </button>
        </>
    );
}
