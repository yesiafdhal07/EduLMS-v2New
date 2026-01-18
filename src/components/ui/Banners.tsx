'use client';

import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
    return (
        <div className="bg-rose-900/20 border border-rose-500/30 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
            <div className="p-3 bg-rose-500/20 rounded-xl">
                <AlertTriangle size={24} className="text-rose-400" />
            </div>
            <div className="flex-1">
                <p className="font-bold text-rose-200 text-sm">{message}</p>
            </div>
            <div className="flex items-center gap-2">
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl transition-colors"
                        aria-label="Coba lagi"
                    >
                        <RefreshCw size={18} className="text-rose-400" />
                    </button>
                )}
                {onDismiss && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl transition-colors"
                        aria-label="Tutup pesan error"
                    >
                        <XCircle size={18} className="text-rose-400" />
                    </button>
                )}
            </div>
        </div>
    );
}

interface SuccessBannerProps {
    message: string;
    onDismiss?: () => void;
}

export function SuccessBanner({ message, onDismiss }: SuccessBannerProps) {
    return (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div className="flex-1">
                <p className="font-bold text-emerald-200 text-sm">{message}</p>
            </div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl transition-colors"
                    aria-label="Tutup pesan sukses"
                >
                    <XCircle size={18} className="text-emerald-400" />
                </button>
            )}
        </div>
    );
}
