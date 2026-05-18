'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        // You could also log the error to an error reporting service here
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-2xl w-full min-h-[200px] text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-4 text-rose-500">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Gagal Memuat Komponen</h3>
                    <p className="text-slate-400 text-sm max-w-sm mb-4">
                        {this.state.error?.message || "Terjadi kesalahan saat mencoba merender bagian ini."}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-colors"
                    >
                        <RefreshCw size={14} />
                        Coba Lagi
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
