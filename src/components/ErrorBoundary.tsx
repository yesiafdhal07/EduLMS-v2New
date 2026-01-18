'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

/**
 * Global Error Boundary Component
 * Menangkap error React dan menampilkan fallback UI yang user-friendly
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        // Update state sehingga render berikutnya akan menampilkan fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error untuk debugging
        console.error('[ErrorBoundary] Caught error:', error);
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

        // Update state dengan error info
        this.setState({ errorInfo });

        // TODO: Kirim ke error tracking service (Sentry, LogRocket, etc.)
        // if (typeof window !== 'undefined' && window.Sentry) {
        //     window.Sentry.captureException(error, { extra: errorInfo });
        // }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Jika ada custom fallback, gunakan itu
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                    <div className="max-w-md w-full text-center">
                        {/* Error Icon */}
                        <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <AlertTriangle className="w-10 h-10 text-rose-500" />
                        </div>

                        {/* Error Title */}
                        <h2 className="text-3xl font-black text-white mb-3">
                            Oops! Ada yang Salah
                        </h2>

                        {/* Error Message */}
                        <p className="text-slate-400 mb-4">
                            Terjadi kesalahan yang tidak terduga. Tim kami akan segera memperbaikinya.
                        </p>

                        {/* Error Details (Development only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 text-left border border-slate-700">
                                <p className="text-rose-400 text-sm font-mono break-all">
                                    {this.state.error.message}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="text-slate-500 text-xs cursor-pointer hover:text-slate-400">
                                            Stack trace
                                        </summary>
                                        <pre className="text-slate-600 text-xs mt-2 overflow-auto max-h-32">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <RefreshCw size={18} />
                                Muat Ulang
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Home size={18} />
                                Ke Beranda
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-slate-500 text-sm mt-8">
                            Jika masalah terus berlanjut, silakan hubungi administrator.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
