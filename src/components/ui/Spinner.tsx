'use client';

interface SpinnerProps {
    text?: string;
    className?: string;
}

export function Spinner({ text = "Memuat...", className = "" }: SpinnerProps) {
    return (
        <div className={`flex flex-col items-center gap-6 ${className}`}>
            <div className="w-14 h-14 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-inner"></div>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] animate-pulse">{text}</span>
        </div>
    );
}
